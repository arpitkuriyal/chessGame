import { WebSocket } from "ws";

export class Player {
  id: string;
  ws: WebSocket;
  gameId: string | null = null;

  constructor(ws: WebSocket, id: string) {
    this.id = id;
    this.ws = ws;
  }

  reconnect(ws: WebSocket) {
    this.ws = ws;
  }

  sendMessage(message: unknown) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }
}
