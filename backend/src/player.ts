import {v4} from "uuid";
import { WebSocket } from "ws";
//here we initialise the player and call in the index.js whenever a new connection is made a player is generated 
export class Player{

    id:string
    ws:WebSocket
    gameId:string|null=null

    constructor(ws:WebSocket){
        this.id=v4()
        this.ws=ws
    }
    sendMessage(message:object){
        this.ws.send(JSON.stringify(message))
    }
    
}