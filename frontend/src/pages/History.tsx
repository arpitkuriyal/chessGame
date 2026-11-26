import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import Header from "../components/header";
import useSocket from "../hooks/useSocket";

type SavedGameSummary = {
  id: string;
  whitePlayerId: string;
  blackPlayerId: string;
  result: string;
  endReason: string;
  completedAt: string;
  moveCount: number;
};

type SavedMove = {
  ply: number;
  color: "w" | "b";
  san: string;
  from: string;
  to: string;
  promotion: string | null;
};

type SavedGame = SavedGameSummary & {
  startedAt: string;
  finalFen: string;
  pgn: string;
  moves: SavedMove[];
};

export default function History() {
  const navigate = useNavigate();
  const { isLoaded, isSignedIn, userId, getToken } = useAuth();
  const socket = useSocket("ws://localhost:8080", getToken, "history");
  const [authenticatedSocket, setAuthenticatedSocket] = useState<WebSocket | null>(null);
  const isAuthenticated = authenticatedSocket === socket && socket?.readyState === WebSocket.OPEN;
  const [games, setGames] = useState<SavedGameSummary[]>([]);
  const [selectedGame, setSelectedGame] = useState<SavedGame | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (isLoaded && !isSignedIn) navigate("/");
  }, [isLoaded, isSignedIn, navigate]);

  useEffect(() => {
    if (!socket) return;
    socket.onmessage = (event) => {
      const response = JSON.parse(event.data);
      switch (response.type) {
        case "authenticated":
          setAuthenticatedSocket(socket);
          socket.send(JSON.stringify({ type: "list-games" }));
          break;
        case "games-list":
          setGames(response.games);
          setMessage(response.games.length ? "" : "Completed games will appear here.");
          break;
        case "game-history":
          setSelectedGame(response.game);
          setMessage("");
          break;
        case "error":
          setMessage(response.message);
          break;
      }
    };
  }, [socket]);

  const openGame = (gameId: string) => {
    if (!isAuthenticated || socket?.readyState !== WebSocket.OPEN) return;
    setSelectedGame(null);
    setMessage("Loading game…");
    socket.send(JSON.stringify({ type: "get-game-history", gameId }));
  };

  const outcomeFor = (game: SavedGameSummary) => {
    const isWhite = game.whitePlayerId === userId;
    const resultForMe = isWhite ? game.result : game.result === "1-0" ? "0-1" : game.result === "0-1" ? "1-0" : game.result;
    if (resultForMe === "1/2-1/2") return "Draw";
    return resultForMe === "1-0" ? "Won" : "Lost";
  };

  return (
    <div className="min-h-screen bg-zinc-800 text-white">
      <Header />
      <main className="mx-auto grid max-w-6xl gap-8 px-5 py-10 md:grid-cols-[minmax(240px,1fr)_2fr]">
        <section>
          <div className="mb-5 flex items-center justify-between">
            <h1 className="text-3xl font-bold">Game history</h1>
            <Link to="/" className="text-sm text-green-300 hover:underline">Back to chess</Link>
          </div>
          {message && !selectedGame && <p className="mb-4 text-sm text-zinc-300">{message}</p>}
          <div className="flex flex-col gap-3">
            {games.map((game) => (
              <button
                key={game.id}
                onClick={() => openGame(game.id)}
                className={`rounded-lg border p-4 text-left transition-colors ${selectedGame?.id === game.id ? "border-green-400 bg-zinc-700" : "border-zinc-600 bg-zinc-900 hover:border-zinc-400"}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold">{outcomeFor(game)} · {game.endReason}</span>
                  <span className="text-xs text-zinc-400">{game.moveCount} plies</span>
                </div>
                <time className="mt-2 block text-sm text-zinc-400">
                  {new Date(game.completedAt).toLocaleString()}
                </time>
              </button>
            ))}
          </div>
        </section>

        <section className="min-h-64 rounded-xl border border-zinc-700 bg-zinc-900 p-5">
          {selectedGame ? (
            <>
              <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-2xl font-bold">{outcomeFor(selectedGame)} · {selectedGame.endReason}</h2>
                <span className="text-sm text-zinc-400">
                  {selectedGame.moves.length} half-moves · {new Date(selectedGame.completedAt).toLocaleDateString()}
                </span>
              </div>
              {selectedGame.moves.length ? (
                <ol className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {selectedGame.moves.map((move) => (
                    <li key={move.ply} className="flex items-center gap-3 rounded-md bg-zinc-800 px-3 py-2">
                      <span className="w-10 text-xs text-zinc-500">{Math.ceil(move.ply / 2)}{move.color === "w" ? "." : "…"}</span>
                      <span className="font-mono text-lg">{move.san}</span>
                      <span className="ml-auto text-xs text-zinc-500">{move.from} → {move.to}</span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-zinc-400">No moves were played.</p>
              )}
            </>
          ) : (
            <p className="text-zinc-400">Choose a completed game to review its moves.</p>
          )}
        </section>
      </main>
    </div>
  );
}
