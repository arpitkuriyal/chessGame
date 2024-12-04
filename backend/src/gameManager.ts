import { Game } from "./game"
import { Player } from "./player"

export class GameManager{
    private waitingList:Player[]=[]
    public activeGame:Game[]=[]

    addToQueue(player:Player){
        if(this.waitingList.length>0){
            const opponent=this.waitingList.shift()
            if(opponent){
                this.startGame(opponent,player)
            }
            
        }
        else{
            this.waitingList.push(player)
            player.sendMessage({
                type:"waitng",
                message:'waitng for another player to come'
            })
        }
    }
    startGame(player1:Player,player2:Player){
        const game=new Game(player1,player2)
        player1.gameId=game.id
        player2.gameId=game.id
        this.activeGame.push(game)
        player1.sendMessage({
            type:"game_started",
            message:`game is started and your opponent is ${player2.id}`,
            opponent:player2,
            gameId:game.id,
        })
        player2.sendMessage({
            type:"game_started",
            message:`game is started and your opponent is ${player1.id}`,
            opponent:player1,
            gameId:game.id,
        })
        
    }
    handleMove(player: Player, move: { from: string; to: string }) {
        if (!move || !move.from || !move.to) {
          player.sendMessage({ type: 'error', message: 'Invalid move structure.' });
          return;
        }
      
        const game = this.activeGame.find((g) => g.id === player.gameId);
      
        if (!game) {
          player.sendMessage({ type: 'error', message: 'You are not in a game!' });
          return;
        }
      
        try {
          game.makeMove(player, move);
        } catch (err) {
          player.sendMessage({ type: 'error', message: `Invalid move: ${Error}` });
        }
      }
      
    disconnected(player:Player){
        //check is the disconnected player is in the waiting queue if it is in it then remove it from there.
        this.waitingList=this.waitingList.filter((p)=>p.id!==player.id)
        // if the disconnected player is in the active game called the game off and send message to the opponent that
        //in this we find the index of the player which goes offline by seeing it websocket connection 
        const gameIndex=this.activeGame.findIndex((game)=>{
            return game.player1==player || game.player2==player
        })
        if(gameIndex!=-1){
            const game=this.activeGame[gameIndex]
            const opponent=player===game.player1? game.player2: game.player1;
            if(opponent){
                opponent.sendMessage({
                    type:"disconnected",
                    message:"your opponent is disconnected"
                })
            }
            this.activeGame.splice(gameIndex,1)
        }
    


    }
}
