import { Game } from "./game";
import { Player } from "./player";
import { GameHistoryStore } from "./gameHistoryStore";
import { WebSocket } from "ws";

const RECONNECT_GRACE_MS = 30_000;

export class GameManager {
  private waitingPlayers: Player[] = [];
  private disconnectTimers = new Map<Player, ReturnType<typeof setTimeout>>();
  public activeGames = new Map<string, Game>();

  constructor(private readonly history: GameHistoryStore) {}

  connectPlayer(ws: WebSocket, playerId: string): Player | null {
    const waitingPlayer = this.waitingPlayers.find((player) => player.id === playerId);
    const game = [...this.activeGames.values()].find(
      (activeGame) => activeGame.player1.id === playerId || activeGame.player2.id === playerId
    );
    const existingPlayer = waitingPlayer ?? (game?.player1.id === playerId ? game.player1 : game?.player2.id === playerId ? game.player2 : undefined);

    if (!existingPlayer) return new Player(ws, playerId);
    if (existingPlayer.ws.readyState === WebSocket.OPEN) return null;

    const timer = this.disconnectTimers.get(existingPlayer);
    if (timer) clearTimeout(timer);
    this.disconnectTimers.delete(existingPlayer);
    existingPlayer.reconnect(ws);

    return existingPlayer;
  }

  sendConnectionState(player: Player) {
    const game = player.gameId ? this.activeGames.get(player.gameId) : undefined;
    if (game) {
      player.sendMessage({
        type: "game-resumed",
        gameId: game.id,
        color: game.player1 === player ? "w" : "b",
        fen: game.board.fen(),
        currentTurnId: game.currentTurn.id,
      });
    } else if (this.waitingPlayers.includes(player)) {
      player.sendMessage({
        type: "waiting",
        message: "Reconnected. Waiting for another player...",
      });
    }
  }

  addToQueue(player: Player) {
    const isAlreadyPlaying = [...this.activeGames.values()].some(
      (game) => game.player1.id === player.id || game.player2.id === player.id
    );
    if (isAlreadyPlaying || this.waitingPlayers.some((waiting) => waiting.id === player.id)) {
      player.sendMessage({ type: "error", message: "You are already queued or in a game" });
      return;
    }

    const opponent = this.waitingPlayers.shift();

    if (opponent) {
      this.startGame(opponent, player);
    } else {
      this.waitingPlayers.push(player);
      player.sendMessage({
        type: "waiting",
        message: "Waiting for another player...",
      });
    }
  }

  private startGame(player1: Player, player2: Player) {
    const game = new Game(player1, player2);

    player1.gameId = game.id;
    player2.gameId = game.id;

    this.activeGames.set(game.id, game);

    player1.sendMessage({
      type: "game_started",
      opponentId: player2.id,
      gameId: game.id,
      color: "w",
    });

    player2.sendMessage({
      type: "game_started",
      opponentId: player1.id,
      gameId: game.id,
      color: "b",
    });
  }

  async handleMove(player: Player, move?: { from: string; to: string }) {
    if (!move?.from || !move?.to) {
      player.sendMessage({
        type: "error",
        message: "Invalid move structure",
      });
      return;
    }

    if (!player.gameId) {
      player.sendMessage({
        type: "error",
        message: "You are not in a game",
      });
      return;
    }

    const game = this.activeGames.get(player.gameId);

    if (!game) {
      player.sendMessage({
        type: "error",
        message: "Game not found",
      });
      return;
    }

    if (player !== game.player1 && player !== game.player2) {
      player.sendMessage({ type: "error", message: "You are not a player in this game" });
      return;
    }

    const moved = game.makeMove(player, move as any);
    if (moved && game.board.isGameOver()) {
      try {
        await this.history.saveCompletedGame(game);
      } catch (error) {
        console.error("Failed to save completed game", error);
      }
      this.activeGames.delete(game.id);
      this.clearDisconnectTimer(game.player1);
      this.clearDisconnectTimer(game.player2);
      game.player1.gameId = null;
      game.player2.gameId = null;
    }
  }

  async sendGameList(player: Player) {
    player.sendMessage({
      type: "games-list",
      games: await this.history.listForPlayer(player.id),
    });
  }

  async sendGameHistory(player: Player, gameId: string) {
    if (!gameId || typeof gameId !== "string") {
      player.sendMessage({ type: "error", message: "Invalid game ID" });
      return;
    }
    const game = await this.history.getForPlayer(player.id, gameId);
    if (!game) {
      player.sendMessage({ type: "error", message: "Game not found" });
      return;
    }
    player.sendMessage({ type: "game-history", game });
  }

  disconnected(player: Player, socket: WebSocket) {
    if (player.ws !== socket) return;
    const isWaiting = this.waitingPlayers.includes(player);
    const game = player.gameId ? this.activeGames.get(player.gameId) : undefined;
    if (!isWaiting && !game) return;

    this.clearDisconnectTimer(player);
    const timer = setTimeout(() => {
      this.disconnectTimers.delete(player);
      if (player.ws !== socket) return;

      this.waitingPlayers = this.waitingPlayers.filter((waiting) => waiting !== player);
      if (!player.gameId) return;

      const expiredGame = this.activeGames.get(player.gameId);
      if (!expiredGame) return;
      const opponent = player === expiredGame.player1 ? expiredGame.player2 : expiredGame.player1;
      opponent.sendMessage({
        type: "opponent-disconnected",
        message: "Opponent did not reconnect in time",
      });
      this.activeGames.delete(expiredGame.id);
      expiredGame.player1.gameId = null;
      expiredGame.player2.gameId = null;
      this.clearDisconnectTimer(opponent);
    }, RECONNECT_GRACE_MS);
    timer.unref();
    this.disconnectTimers.set(player, timer);
  }

  private clearDisconnectTimer(player: Player) {
    const timer = this.disconnectTimers.get(player);
    if (timer) clearTimeout(timer);
    this.disconnectTimers.delete(player);
  }
}
