import { useEffect, useState } from "react";
import { Chess } from "chess.js";
import Chessboard from "../components/chessboard";
import useSocket from "../hooks/useSocket";

export default function Game() {
  const socket = useSocket("ws://localhost:8080");
  const [chess, setChess] = useState(new Chess());
  const [board, setBoard] = useState(chess.board());

  useEffect(() => {
    if (!socket) {
      return;
    }

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log(message);

      switch (message.type) {
        case "join-queue":
          const newChess = new Chess();
          setChess(newChess);
          setBoard(newChess.board());
          console.log("Game initialized");
          break;

        case "make-move":
          const move = message.payload;
          const moveResult = chess.move(move);
          if (moveResult) {
            setBoard(chess.board()); // Update the board after the move
          }
          console.log("Move applied from server");
          break;
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
      {/* Display current turn */}

      <div className="mb-6">
        <Chessboard
          chess={chess}
          setBoard={setBoard}
          board={board}
          socket={socket!}
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
