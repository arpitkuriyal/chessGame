import { WebSocketServer } from "ws";
import { Player } from "./player";
import { GameManager } from "./gameManager";

const wss = new WebSocketServer({ port: 8080 });
const gameManager = new GameManager();

wss.on("connection", (ws) => {
  const player = new Player(ws);

  ws.on("message", (data) => {
    try {
      const message = JSON.parse(data.toString());

      switch (message.type) {
        case "join-queue":
          gameManager.addToQueue(player);
          break;

        case "make-move":
          gameManager.handleMove(player, message.move);
          break;

        default:
          player.sendMessage({
            type: "error",
            message: "Unknown message type",
          });
      }
    } catch {
      player.sendMessage({
        type: "error",
        message: "Invalid JSON",
      });
    }
  });

  ws.on("close", () => {
    gameManager.disconnected(player);
  });
});