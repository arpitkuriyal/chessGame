"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
const uuid_1 = require("uuid");
//here we initialise the player and call in the index.js whenever a new connection is made a player is generated 
class Player {
    constructor(ws) {
        this.gameId = null;
        this.id = (0, uuid_1.v4)();
        this.ws = ws;
    }
    sendMessage(message) {
        this.ws.send(JSON.stringify(message));
    }
}
exports.Player = Player;
