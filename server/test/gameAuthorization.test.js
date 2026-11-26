const assert = require("node:assert/strict");
const { test } = require("node:test");
const { fakeSocket, createManager } = require("./helpers");

test("non-players cannot make moves or read another player's saved game", async () => {
  let historyLookup;
  const { manager } = createManager({
    async getForPlayer(playerId, gameId) {
      historyLookup = [playerId, gameId];
      return playerId === "user-white" ? { id: gameId, moves: [] } : null;
    },
  });
  const whiteSocket = fakeSocket();
  const blackSocket = fakeSocket();
  const white = manager.connectPlayer(whiteSocket, "user-white");
  const black = manager.connectPlayer(blackSocket, "user-black");
  const outsiderSocket = fakeSocket();
  const outsider = manager.connectPlayer(outsiderSocket, "outsider");

  manager.addToQueue(white);
  manager.addToQueue(black);
  const game = manager.activeGames.get(white.gameId);
  const before = game.board.fen();
  await manager.handleMove(outsider, { from: "e2", to: "e4" });
  await manager.sendGameHistory(outsider, game.id);

  assert.equal(game.board.fen(), before);
  assert.equal(outsiderSocket.messages.some((message) => message.type === "game-history"), false);
  assert.equal(outsiderSocket.messages.at(-1).type, "error");
  assert.deepEqual(historyLookup, ["outsider", game.id]);
});

test("a player cannot move before their turn", async () => {
  const { manager } = createManager();
  const white = manager.connectPlayer(fakeSocket(), "user-white");
  const blackSocket = fakeSocket();
  const black = manager.connectPlayer(blackSocket, "user-black");
  manager.addToQueue(white);
  manager.addToQueue(black);
  const game = manager.activeGames.get(white.gameId);
  const before = game.board.fen();

  await manager.handleMove(black, { from: "e7", to: "e5" });

  assert.equal(game.board.fen(), before);
  assert.equal(blackSocket.messages.at(-1).type, "not-your-turn");
});
