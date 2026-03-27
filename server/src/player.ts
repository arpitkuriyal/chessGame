import { v4 as uuidv4 } from "uuid";
import { WebSocket } from "ws";

export class Player {
  id: string;
  ws: WebSocket;
  gameId: string | null = null;

  constructor(ws: WebSocket) {
    this.id = uuidv4();
    this.ws = ws;
  }

  sendMessage(message: unknown) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }
}