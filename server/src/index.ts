import { createServer } from "http";
import { WebSocketServer } from "ws";
import { Player } from "./player";
import { GameManager } from "./gameManager";
import { verifyClerkSessionToken } from "./auth";
import { GameHistoryStore } from "./gameHistoryStore";

const httpServer = createServer();
const wss = new WebSocketServer({ server: httpServer });
const gameHistory = new GameHistoryStore();
const gameManager = new GameManager(gameHistory);

wss.on("connection", (ws) => {
  let player: Player | null = null;
  let authenticating = false;

  ws.on("message", async (data) => {
    let message: {
      type?: string;
      token?: string;
      intent?: "game" | "history";
      move?: { from: string; to: string };
      gameId?: string;
    };
    try {
      message = JSON.parse(data.toString());
    } catch {
      ws.send(
        JSON.stringify({
          type: "error",
          message: "Invalid JSON",
        })
      );
      return;
    }

    if (!player) {
      if (authenticating) return;
      if (message.type !== "authenticate" || typeof message.token !== "string") {
        ws.send(JSON.stringify({ type: "error", message: "Authentication required" }));
        return;
      }

      authenticating = true;
      void verifyClerkSessionToken(message.token)
        .then((userId) => {
          if (ws.readyState !== ws.OPEN) return;
          if (message.intent === "history") {
            player = new Player(ws, userId);
          } else if (!message.intent || message.intent === "game") {
            player = gameManager.connectPlayer(ws, userId);
            if (!player) {
              ws.send(JSON.stringify({ type: "error", message: "This account already has an active game connection" }));
              ws.close(1008, "Account already connected");
              return;
            }
          } else {
            ws.send(JSON.stringify({ type: "error", message: "Invalid connection intent" }));
            ws.close(1008, "Invalid connection intent");
            return;
          }
          ws.send(JSON.stringify({ type: "authenticated" }));
          if (message.intent !== "history" && player) {
            gameManager.sendConnectionState(player);
          }
        })
        .catch(() => {
          if (ws.readyState === ws.OPEN) {
            ws.send(JSON.stringify({ type: "error", message: "Sign in again to play" }));
            ws.close(1008, "Authentication failed");
          }
        });
      return;
    }

    try {
      switch (message.type) {
        case "join-queue":
          gameManager.addToQueue(player);
          break;
        case "make-move":
          await gameManager.handleMove(player, message.move);
          break;
        case "list-games":
          await gameManager.sendGameList(player);
          break;
        case "get-game-history":
          await gameManager.sendGameHistory(player, message.gameId ?? "");
          break;
        default:
          ws.send(JSON.stringify({ type: "error", message: "Unknown message type" }));
      }
    } catch (error) {
      console.error("Failed to handle WebSocket message", error);
      if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify({ type: "error", message: "Unable to process request" }));
      }
    }
  });

  ws.on("close", () => {
    if (player) gameManager.disconnected(player, ws);
  });
});

void gameHistory.initialize()
  .then(() => httpServer.listen(8080))
  .catch(async (error) => {
    console.error("Unable to initialize PostgreSQL game history", error);
    await gameHistory.close();
    process.exitCode = 1;
  });
