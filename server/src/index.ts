import { WebSocketServer } from "ws";
import { Player } from "./player";
import { GameManager } from "./gameManager";

const wss = new WebSocketServer({ port: 8080 });
const gameManager = new GameManager();

wss.on("connection", (ws) => {
  let player: Player | null = null;

  ws.on("message", (data) => {
    try {
      const message = JSON.parse(data.toString());

      switch (message.type) {
        case "join-queue": {
          player = new Player(
            ws,
            message.playerId,
            message.isGuest
          );

          gameManager.addToQueue(player);
          break;
        }

        case "make-move": {
          if (!player) return;
          gameManager.handleMove(player, message.move);
          break;
        }

        default:
          ws.send(
            JSON.stringify({
              type: "error",
              message: "Unknown message type",
            })
          );
      }
    } catch {
      ws.send(
        JSON.stringify({
          type: "error",
          message: "Invalid JSON",
        })
      );
    }
  });

  ws.on("close", () => {
    if (player) gameManager.disconnected(player);
  });
});