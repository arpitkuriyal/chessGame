const assert = require("node:assert/strict");
const { test } = require("node:test");
const { WebSocket } = require("ws");
const { fakeSocket, createManager } = require("./helpers");

test("reconnect restores an active game's position and ignores the old socket close", async () => {
  const { manager } = createManager();
  const whiteSocket = fakeSocket();
  const blackSocket = fakeSocket();
  const white = manager.connectPlayer(whiteSocket, "user-white");
  const black = manager.connectPlayer(blackSocket, "user-black");

  manager.addToQueue(white);
  manager.addToQueue(black);
  await manager.handleMove(white, { from: "e2", to: "e4" });

  const game = manager.activeGames.get(white.gameId);
  const previousSocket = white.ws;
  previousSocket.readyState = WebSocket.CLOSED;
  manager.disconnected(white, previousSocket);
  const replacementSocket = fakeSocket();
  const reconnectedPlayer = manager.connectPlayer(replacementSocket, white.id);
  manager.sendConnectionState(reconnectedPlayer);

  assert.equal(reconnectedPlayer, white);
  assert.equal(reconnectedPlayer.ws, replacementSocket);
  assert.deepEqual(replacementSocket.messages.at(-1), {
    type: "game-resumed",
    gameId: game.id,
    color: "w",
    fen: game.board.fen(),
    currentTurnId: black.id,
  });

  manager.disconnected(white, previousSocket);
  assert.equal(manager.activeGames.has(game.id), true);
  assert.equal(blackSocket.messages.some((message) => message.type === "opponent-disconnected"), false);
});

test("reconnect preserves a queued player without adding a duplicate", () => {
  const { manager } = createManager();
  const firstSocket = fakeSocket();
  const first = manager.connectPlayer(firstSocket, "waiting-user");
  manager.addToQueue(first);
  firstSocket.readyState = WebSocket.CLOSED;

  const newSocket = fakeSocket();
  const reconnected = manager.connectPlayer(newSocket, "waiting-user");
  manager.sendConnectionState(reconnected);

  assert.equal(reconnected, first);
  assert.equal(manager.waitingPlayers.length, 1);
  assert.equal(newSocket.messages.at(-1).type, "waiting");

  const opponentSocket = fakeSocket();
  const opponent = manager.connectPlayer(opponentSocket, "opponent");
  manager.addToQueue(opponent);
  assert.equal(manager.waitingPlayers.length, 0);
  assert.equal(newSocket.messages.some((message) => message.type === "game_started"), true);
});

test("a second live game connection for the same player is rejected", () => {
  const { manager } = createManager();
  const existingSocket = fakeSocket();
  const player = manager.connectPlayer(existingSocket, "same-user");
  manager.addToQueue(player);

  const duplicateSocket = fakeSocket();
  assert.equal(manager.connectPlayer(duplicateSocket, "same-user"), null);
  assert.equal(manager.waitingPlayers.length, 1);
});
