"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const player_1 = require("./player");
const gameManager_1 = require("./gameManager");
const socket = new ws_1.WebSocketServer({ port: 8080 });
const gameManager = new gameManager_1.GameManager();
socket.on('connection', function (ws) {
    ws.on('error', console.error);
    //every time a connection is made a newplayer is form.
    const newPlayer = new player_1.Player(ws);
    //getting message for the frontend and act accordingly
    ws.on('message', function (data) {
        const message = JSON.parse(data.toString());
        if (message.type === "join-queue") {
            gameManager.addToQueue(newPlayer);
        }
        if (message.type === "make-move" && message.move) {
            //in this first we have to find the ws connection of the correct game where it comes from and which player turn it is.
            gameManager.handleMove(newPlayer, message.move);
        }
    });
    ws.on('close', function () {
        gameManager.disconnected(newPlayer);
    });
});
