import { WebSocketServer } from "ws";
import { Player } from "./player";
import { GameManager } from "./gameManager";
import { Game } from "./game";


const socket =new WebSocketServer({port:8080})
const gameManager=new GameManager()

socket.on('connection',function(ws){
    ws.on('error',console.error)
    //every time a connection is made a newplayer is form.
    const newPlayer=new Player(ws)
    ws.on('message',function(data){
        const message=JSON.parse(data.toString())
        if(message.type==="join-queue"){
            gameManager.addToQueue(newPlayer)
        }
        if(message.type==="make-move" && message.move){
            //in this first we have to find the ws connection of the correct game where it comes from and which player turn it is.
            gameManager.handleMove(newPlayer,message.move)
        }

    })
    ws.on('close',function(){
        gameManager.disconnected(newPlayer)
    })

})