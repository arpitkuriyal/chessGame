import { Game } from "./game";
import { Player } from "./player";

export class GameManager {
  private waitingPlayers: Player[] = [];
  public activeGames = new Map<string, Game>();

  addToQueue(player: Player) {
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

  handleMove(player: Player, move: { from: string; to: string }) {
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

    game.makeMove(player, move as any);
  }

  disconnected(player: Player) {
    // Remove from waiting queue
    this.waitingPlayers = this.waitingPlayers.filter(
      (p) => p.id !== player.id
    );

    if (!player.gameId) return;

    const game = this.activeGames.get(player.gameId);
    if (!game) return;

    const opponent =
      player === game.player1 ? game.player2 : game.player1;

    opponent?.sendMessage({
      type: "opponent-disconnected",
      message: "Your opponent disconnected",
    });

    this.activeGames.delete(player.gameId);
  }
}