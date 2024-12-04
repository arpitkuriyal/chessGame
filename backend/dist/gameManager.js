"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameManager = void 0;
const game_1 = require("./game");
class GameManager {
    constructor() {
        this.waitingList = [];
        //should use map here for better time complexity
        this.activeGame = new Map();
    }
    addToQueue(player) {
        if (this.waitingList.length > 0) {
            const opponent = this.waitingList.shift();
            //because opponent come first we put opponent as player1 in the startgame as it was waiting in the queue
            if (opponent) {
                this.startGame(opponent, player);
            }
        }
        else {
            this.waitingList.push(player);
            player.sendMessage({
                type: "waitng",
                message: 'waitng for another player to come'
            });
        }
    }
    startGame(player1, player2) {
        const game = new game_1.Game(player1, player2);
        player1.gameId = game.id;
        player2.gameId = game.id;
        this.activeGame.set(game.id, game);
        player1.sendMessage({
            type: "game_started",
            message: `game is started and your opponent is ${player2.id}`,
            opponent: player2,
            gameId: game.id,
        });
        player2.sendMessage({
            type: "game_started",
            message: `game is started and your opponent is ${player1.id}`,
            opponent: player1,
            gameId: game.id,
        });
    }
    handleMove(player, move) {
        if (!move || !move.from || !move.to) {
            player.sendMessage({ type: 'error', message: 'Invalid move structure.' });
            return;
        }
        const gameId = player.gameId;
        const game = this.activeGame.get(gameId);
        if (!game) {
            player.sendMessage({ type: 'error', message: 'You are not in a game!' });
            return;
        }
        try {
            game.makeMove(player, move);
        }
        catch (err) {
            player.sendMessage({ type: 'error', message: `Invalid move: ${Error}` });
        }
    }
    disconnected(player) {
        //check is the disconnected player is in the waiting queue if it is in it then remove it from there.
        this.waitingList = this.waitingList.filter((p) => p.id !== player.id);
        // if the disconnected player is in the active game called the game off and send message to the opponent that
        //in this we find the index of the player which goes offline by seeing it websocket connection 
        const gameIndex = this.activeGame.has(player.gameId);
        if (gameIndex) {
            const game = this.activeGame.get(player.gameId);
            if (game) {
                const opponent = player === game.player1 ? game.player2 : game.player1;
                if (opponent) {
                    opponent.sendMessage({
                        type: "disconnected",
                        message: "your opponent is disconnected"
                    });
                }
            }
            this.activeGame.delete(player.gameId);
        }
    }
}
exports.GameManager = GameManager;
