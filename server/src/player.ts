import { v4 as uuidv4 } from "uuid";
import { WebSocket } from "ws";

export class Player {
  id: string;
  ws: WebSocket;
  gameId: string | null = null;
  isGuest: boolean;

  constructor(ws: WebSocket, id?: string, isGuest = false) {
    this.id = id || uuidv4();
    this.ws = ws;
    this.isGuest = isGuest;
  }

  sendMessage(message: unknown) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }
}