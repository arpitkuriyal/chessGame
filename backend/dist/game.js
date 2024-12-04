"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const chess_js_1 = require("chess.js");
class Game {
    constructor(player1, player2) {
        this.player1 = player1;
        this.player2 = player2;
        this.id = player1.id + player2.id;
        this.board = new chess_js_1.Chess();
        this.currentTurn = player1;
    }
    boardcast(message) {
        this.player1.sendMessage(message);
        this.player2.sendMessage(message);
    }
    makeMove(player, move) {
        //here we need to check for the validation 
        //first which player move it is and it is a legal move or not 
        //then we have to check for the game that the game is over or not 
        // update the board then 
        if (player != this.currentTurn) {
            player.sendMessage({
                type: "error",
                message: "not your turn"
            });
            return false;
        }
        const result = this.board.move(move);
        if (!result) {
            player.sendMessage({
                type: "error",
                message: 'not a valid move'
            });
        }
        this.boardcast({
            type: 'move',
            move: result,
            board: this.board.fen()
        });
        if (this.board.isGameOver()) {
            this.boardcast({
                type: 'game-over',
                message: this.gameOvermessage()
            });
            return true;
        }
        //swap the turn in every move
        this.currentTurn = this.currentTurn == this.player1 ? this.player2 : this.player1;
        return true;
    }
    //check for the game over message 
    gameOvermessage() {
        if (this.board.isCheckmate()) {
            return "check-mate";
        }
        if (this.board.isStalemate()) {
            return "stale-mate";
        }
        if (this.board.isDraw()) {
            return "draw";
        }
        return "Game-over";
    }
}
exports.Game = Game;
