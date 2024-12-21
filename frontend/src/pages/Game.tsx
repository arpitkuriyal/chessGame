import { useEffect, useState } from "react";
import { Chess } from "chess.js";
import Chessboard from "../components/chessboard";
import useSocket from "../hooks/useSocket";

export default function Game() {
  const socket = useSocket("ws://localhost:8080");
  const [chess, setChess] = useState(new Chess());
  const [board, setBoard] = useState(chess.board());
  const [currentTurn, setCurrentTurn] = useState<"w" | "b">("w"); // "w" for white, "b" for black
  const [playerColor, setPlayerColor] = useState<"w" | "b" | null>(null); // Color of the current player
  const [rotateBoard,setRotateBoard]=useState<boolean>(false)
  useEffect(() => {
    if (!socket) {
      return;
    }

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log("Message from server:", message);

      switch (message.type) {
        case "join-queue":
          // Initialize a new game and assign the player's color
          const newChess = new Chess();
          setChess(newChess);
          setBoard(newChess.board());
          setPlayerColor(message.color); // Server assigns the player their color
          setCurrentTurn("w"); // Game always starts with white
          console.log(`Game initialized. You are playing as ${message.color === "w" ? "white" : "black"}.`);
          break;

        case "move":
          const move = message.payload;
          try {
            const moveResult = chess.move(move);
            if (!moveResult) throw new Error("Invalid move from server");
            setBoard(chess.board());
            setCurrentTurn(moveResult.color === "w" ? "b" : "w"); // Update turn after the move
            console.log(currentTurn)
            console.log("Move applied and board updated.");
          } catch (error) {
            console.error("Error handling move:", error);
          }
          break;

        case "game_started":
          const currentColor=message.color
          setCurrentTurn(currentColor)
          if(currentColor=="black"){
            setRotateBoard(true)
          }
          break

        case 'not-your-turn':
          chess.undo()
          setBoard(chess.board())
          console.log(chess.board())
          alert('not your turn1')
          break

        case "game-over":
          const gameOver=message.message;
          alert("game Over"+gameOver)
        }
        
          

        
          
    };
  }, [socket, chess]);

  const handlePlayClick = () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      console.log("Message sent: join-queue");
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
    <div className="mt-10 flex justify-center items-center flex-col">
      {/* Display current turn and player color */}
      <div className="mb-4 text-center">
        <p className="text-lg">
          {playerColor ? `You are playing as ${playerColor === "w" ? "White" : "Black"}.` : "Waiting for game to start..."}
        </p>
        <p className="text-lg font-semibold">
          {currentTurn === playerColor
            ? "Your turn!"
            : "Opponent's turn..."}
        </p>
      </div>

      <div className={`mb-6 `}>
        <Chessboard
          chess={chess}
          setBoard={setBoard}
          board={board}
          socket={socket!}
          currentTurn={currentTurn === playerColor} // Pass boolean for turn validation
          rotateBoard={rotateBoard}
        />
      </div>

      <button
        className="bg-green-400 py-4 px-8 rounded-lg"
        onClick={handlePlayClick}
      >
        Play
      </button>
    </div>
  );
}
