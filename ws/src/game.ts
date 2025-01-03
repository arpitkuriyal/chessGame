import { Chess } from "chess.js"
import { Player } from "./player"

export class Game{
    id:string
    player1:Player
    player2:Player
    board:Chess
    currentTurn:Player
    constructor(player1:Player,player2:Player){
        this.player1=player1
        this.player2=player2
        this.id=player1.id+player2.id
        this.board=new Chess()
        this.currentTurn=player1
    }
    //this we used to broadcast the game state and present the current board to both the player 
    broadcast(message:object){
        this.player1.sendMessage(message)
        this.player2.sendMessage(message)
    }
    makeMove(player:Player,move:{
        from:string,
        to:string
    }):boolean{
        //here we need to check for the validation 
        //first which player move it is and it is a legal move or not 
        //then we have to check for the game that the game is over or not 
        // update the board then 

        if(player!=this.currentTurn){
            player.sendMessage({
                type:"not-your-turn",
                message:`you are moving the wrong color piece`
            })
            return false
        }
        const result=this.board.move(move)


        if(!result){
            player.sendMessage({
                type:"error",
                message:'not a valid move'
            })
        }
        this.broadcast({
            type:'move',
            move:result,
            fen:this.board.fen(), 
            board:this.board.board(),
            payload:move,
            currentTurn:this.currentTurn
        })
        if(this.board.isGameOver()){
            this.broadcast({
                type:'game-over',
                message:this.gameOvermessage()
            })
            return true
        }
        //swap the turn in every move
        this.currentTurn=this.currentTurn==this.player1? this.player2 :this.player1
        return true
    }

    //check for the game over message 
    gameOvermessage():string{
        if(this.board.isCheckmate()){
            return "check-mate"
        }
        if(this.board.isStalemate()){
            return "stale-mate"
        }
        if(this.board.isDraw()){
            return "draw"
        }
        return "Game-over"
        
    }
    
}