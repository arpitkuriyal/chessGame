import { useEffect, useState } from "react";
import { Chess } from "chess.js";
import Chessboard from "../components/chessboard";
import useSocket from "../hooks/useSocket";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";

export default function Game() {
  const navigate = useNavigate();
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const socket = useSocket("ws://localhost:8080", getToken, "game");

  const [chess, setChess] = useState(() => new Chess());
  const [board, setBoard] = useState(chess.board());

  const [currentTurn, setCurrentTurn] = useState<"w" | "b">("w");
  const [playerColor, setPlayerColor] = useState<"w" | "b" | null>(null);

  const [rotateBoard, setRotateBoard] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [authenticatedSocket, setAuthenticatedSocket] = useState<WebSocket | null>(null);
  const isAuthenticated = authenticatedSocket === socket && socket?.readyState === WebSocket.OPEN;

  useEffect(() => {
    if (isLoaded && !isSignedIn) navigate("/");
  }, [isLoaded, isSignedIn, navigate]);

  useEffect(() => {
    if (!socket) return;

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      switch (message.type) {
        case "authenticated":
          setAuthenticatedSocket(socket);
          break;

        case "move": {
          const newChess = new Chess(chess.fen());
          const moveResult = newChess.move(message.payload);

          if (!moveResult) return;

          setChess(newChess);
          setBoard(newChess.board());
          setCurrentTurn(moveResult.color === "w" ? "b" : "w");
          break;
        }

        case "game_started": {
          const newChess = new Chess();

          setChess(newChess);
          setBoard(newChess.board());

          setPlayerColor(message.color);
          setCurrentTurn("w");

          if (message.color === "b") {
            setRotateBoard(true);
          }

          setGameStarted(true);

          alert(
            `Game started. You are ${
              message.color === "w" ? "White" : "Black"
            }`
          );
          break;
        }

        case "game-resumed": {
          const resumedChess = new Chess(message.fen);
          setChess(resumedChess);
          setBoard(resumedChess.board());
          setPlayerColor(message.color);
          setCurrentTurn(resumedChess.turn());
          setRotateBoard(message.color === "b");
          setGameStarted(true);
          break;
        }

        case "game-over":
          alert(`Game Over: ${message.message}`);
          navigate("/");
          break;

        case "opponent-disconnected":
          alert("Your opponent disconnected and did not reconnect in time.");
          setGameStarted(false);
          setBoard(new Chess().board());
          break;

        case "waiting":
          alert("Waiting for opponent...");
          break;

        case "error":
          alert(message.message);
          break;
      }
    };
  }, [socket, chess, navigate]);

  const handlePlay = () => {
    if (socket?.readyState !== WebSocket.OPEN) {
      alert("Socket not ready");
      return;
    }
    if (!isAuthenticated) {
      alert("Authenticating your account…");
      return;
    }

    socket.send(
      JSON.stringify({
        type: "join-queue",
      })
    );
  };

  return (
    <div className="mt-24 flex flex-col items-center">
      <Chessboard
        board={board}
        socket={socket}
        currentTurn={isAuthenticated && playerColor === currentTurn}
        rotateBoard={rotateBoard}
      />

      {gameStarted && !isAuthenticated && (
        <p role="status" className="mt-4 text-zinc-600" aria-live="polite">
          Reconnecting to your game…
        </p>
      )}

      {!gameStarted && (
        <button
          onClick={handlePlay}
          disabled={!isAuthenticated}
          className="mt-6 bg-green-500 px-6 py-3 rounded-lg"
        >
          {isAuthenticated ? "Play" : "Connecting…"}
        </button>
      )}
    </div>
  );
}
