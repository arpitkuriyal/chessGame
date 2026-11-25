const { WebSocket } = require("ws");
const { GameManager } = require("../dist/gameManager");

function fakeSocket() {
  return {
    readyState: WebSocket.OPEN,
    messages: [],
    send(data) {
      this.messages.push(JSON.parse(data));
    },
  };
}

function createManager(overrides = {}) {
  const history = {
    async saveCompletedGame() {},
    async listForPlayer() { return []; },
    async getForPlayer() { return null; },
    ...overrides,
  };
  return { manager: new GameManager(history), history };
}

function connect(manager, id, socket = fakeSocket()) {
  return { player: manager.connectPlayer(socket, id), socket };
}

module.exports = { fakeSocket, createManager, connect };
