import { Chess, Square, Move } from "chess.js";
import { Player } from "./player";

export type MoveInput = {
  from: Square;
  to: Square;
};

export class Game {
  id: string;
  player1: Player;
  player2: Player;
  board: Chess;
  currentTurn: Player;

  constructor(player1: Player, player2: Player) {
    this.player1 = player1;
    this.player2 = player2;
    this.id = `${player1.id}-${player2.id}`;
    this.board = new Chess();
    this.currentTurn = player1;
  }

  private broadcast(message: unknown) {
    this.player1.sendMessage(message);
    this.player2.sendMessage(message);
  }

  makeMove(player: Player, move: MoveInput): boolean {
    if (player !== this.currentTurn) {
      player.sendMessage({
        type: "not-your-turn",
        message: "You are moving the wrong color piece",
      });
      return false;
    }

    const result = this.board.move(move);

    if (!result) {
      player.sendMessage({
        type: "error",
        message: "Invalid move",
      });
      return false;
    }

    this.currentTurn =
      this.currentTurn === this.player1 ? this.player2 : this.player1;

    this.broadcast({
      type: "move",
      move: result,
      fen: this.board.fen(),
      board: this.board.board(),
      payload: move,
      currentTurn: this.currentTurn.id, // send id instead of object
    });

    if (this.board.isGameOver()) {
      this.broadcast({
        type: "game-over",
        message: this.getGameOverMessage(),
      });
    }

    return true;
  }

  private getGameOverMessage(): string {
    if (this.board.isCheckmate()) return "checkmate";
    if (this.board.isStalemate()) return "stalemate";
    if (this.board.isDraw()) return "draw";
    return "game-over";
  }
}