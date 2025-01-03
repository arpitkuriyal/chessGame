import { useEffect, useState } from "react";
import { Chess } from "chess.js";
import Chessboard from "../components/chessboard";
import useSocket from "../hooks/useSocket";
import { useNavigate } from "react-router-dom";

export default function Game() {
  const socket = useSocket("ws://localhost:8080");
  const navigate=useNavigate();
  const [chess, setChess] = useState(new Chess());
  const [board, setBoard] = useState(chess.board());
  const [currentTurn, setCurrentTurn] = useState<"w" | "b">("w"); // "w" for white, "b" for black
  const [playerColor, setPlayerColor] = useState<"w" | "b" | null>(null); // Color of the current player
  const [rotateBoard,setRotateBoard]=useState<boolean>(false)
  const [gameStarted,setGameStarted]=useState<boolean>(false)
  useEffect(() => {
    if (!socket) {
      console.log("not connected")
      return;
    }

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log("Message from server:", message);
      switch (message.type) {
        case "move":
          const move = message.payload;
          try {
            const moveResult = chess.move(move);
            if (!moveResult) throw new Error("Invalid move from server");
            setBoard(chess.board());
            setCurrentTurn(moveResult.color === "w" ? "b" : "w"); 

            console.log("Move applied and board updated.");
          } catch (error) {
            console.error("Error handling move:", error);
          }
          break;

        case "game_started":
          const currentColor=message.color
          const newChess = new Chess();
          setChess(newChess);
          setBoard(newChess.board());
          setPlayerColor(currentColor); 
          setCurrentTurn("w"); 
          console.log(`Game initialized. You are playing as ${message.color === "w" ? "white" : "black"}.`);
          if(currentColor=="b"){
            setRotateBoard(true)
          }
          alert(`game started. You are plaing as a  ${message.color === "w" ? "white" : "black"}` )
          break

        case 'not-your-turn':
          chess.undo()
          setBoard(chess.board())
          alert(message.message)
          break

        case "game-over":
          const gameOver=message.message;
          alert(`game Over ${gameOver}`)
          navigate('/')
          break
        
        case "disconnected":
          const disconnected=message.message;
          alert(`disconnected ${disconnected} you win `)
          setBoard(new Chess().board())
          setGameStarted(false)
          break
        
        case "waiting":
          alert("waiting for another player to join")
        }      
    };
  }, [socket, chess]);

  const handlePlayClick = () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      console.log("Message sent: join-queue");
      setGameStarted(true)
      socket.send(
        JSON.stringify({
          type: "join-queue",
        })
      );
    } else {
      console.error("WebSocket is not open. Unable to send message.");
      alert("Connection not ready. Please try again.");
    }
  };

  return (
    <div className="mt-24 flex justify-center items-center flex-col">
      <div className={`mb-6 `}>
        <Chessboard
          chess={chess}
          setBoard={setBoard}
          board={board}
          socket={socket!}
          currentTurn={currentTurn === playerColor} 
          rotateBoard={rotateBoard}
        />
      </div>

      {gameStarted?<></>:<button
        className="bg-green-400 py-4 px-8 rounded-lg"
        onClick={handlePlayClick}
      >
        Play
      </button>}
    </div>
  );
}
