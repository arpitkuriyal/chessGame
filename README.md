# Real-Time Multiplayer Chess

A browser chess game for two players. Players join a matchmaking queue, play against a server-authoritative chess engine, reconnect to an active game after a temporary network drop, and review completed games later.

## Features

- Live two-player games over WebSockets with automatic matchmaking.
- Legal move validation, turn tracking, checkmate, stalemate, and draw detection through `chess.js`.
- Clerk accounts, profile display names, and signed session tokens.
- Per-game authorization: only authenticated players can make moves or retrieve that game's private details.
- PostgreSQL history for completed games, including PGN, final position, result, and individual moves in SAN.
- Reconnection with a 30-second grace period and capped exponential client retry backoff.
- A history page for reviewing completed games and their move lists.

## Architecture

![Workflow diagram showing two players sharing live chess moves over WebSockets, reconnecting after a disconnect, and reviewing completed game history saved in a database](docs/architecture.svg)

### A game, from sign-in to saved history

1. The browser uses Clerk for account access and obtains a Clerk session token.
2. The browser opens a WebSocket to the game server and sends the token with a `game` or `history` intent.
3. The server verifies the token signature against Clerk's HTTPS JWKS endpoint, then checks its issuer and time claims. The verified token subject becomes the player ID; the client cannot choose its own ID.
4. For a game connection, `GameManager` adds the player to the matchmaking queue. When a second player joins, the server starts a game and assigns white and black.
5. A player sends a move request. The server checks game membership and turn ownership, validates the move with `chess.js`, then broadcasts the resulting move to both players.
6. When chess rules end the game, the server stores the result and complete move record in PostgreSQL. The history page requests only games belonging to the signed-in player, and the server checks membership again before returning a selected game's moves.
7. If a game socket drops, the server keeps the active game for 30 seconds. A reconnecting player resumes with the current FEN position and turn. If they do not return before the grace period ends, the active game is closed.

## Technology

| Area | Technology | Responsibility |
| --- | --- | --- |
| Browser app | React, TypeScript, Vite, Tailwind CSS | Board, account UI, matchmaking, and game history |
| Authentication | Clerk | Accounts, profile identity, and signed session tokens |
| Realtime server | Node.js, TypeScript, `ws` | Authentication, matchmaking, game messages, and authorization |
| Chess rules | `chess.js` | Legal moves, turn state, game-over detection, and PGN |
| Persistence | PostgreSQL, `pg` | Completed game and move records |
| Local database | Docker Compose, PostgreSQL 16 | Isolated development database |

## Repository layout

```text
frontend/
  src/pages/              Landing, game, and history pages
  src/components/         Board, profile controls, and shared UI
  src/hooks/useSocket.tsx WebSocket authentication and reconnect loop
server/
  src/auth.ts             Clerk JWT and JWKS verification
  src/game.ts             Server-authoritative chess game
  src/gameManager.ts      Matchmaking, authorization, and reconnect lifecycle
  src/gameHistoryStore.ts PostgreSQL history queries
  sql/schema.sql          Games and moves tables and indexes
  test/                   Game manager tests
  compose.yaml            Local PostgreSQL service
```

## Run locally

### Requirements

- Node.js 18 or newer and npm.
- Docker with the Compose plugin.
- A Clerk development instance and its publishable key, issuer URL, and JWKS URL.

### 1. Start PostgreSQL

From the repository root:

```sh
docker compose -f server/compose.yaml up -d
```

Compose starts PostgreSQL 16 and maps it to `127.0.0.1:5433`. The development connection string is:

```text
postgresql://chess:chess_dev_only@127.0.0.1:5433/chess_game
```

The database volume is named `chess_postgres_data`. Stop the container while keeping data with `docker compose -f server/compose.yaml down`.

### 2. Configure the frontend

Create `frontend/.env` with the Clerk publishable key for your development instance:

```dotenv
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

Clerk controls which sign-in methods are available for the instance. The frontend currently uses Clerk's prebuilt sign-in and sign-up controls. To use Google-only sign-in, enable Google as a social connection and disable email and phone methods in the Clerk Dashboard. Those provider settings are managed by Clerk and are not stored in this repository.

### 3. Start the WebSocket server

In a terminal from the repository root, install dependencies and set the server environment variables. Use the exact issuer URL for your Clerk instance; the JWKS URL is usually that issuer followed by `/.well-known/jwks.json`.

```sh
cd server
npm ci

export DATABASE_URL='postgresql://chess:chess_dev_only@127.0.0.1:5433/chess_game'
export CLERK_ISSUER='https://YOUR-CLERK-INSTANCE.clerk.accounts.dev'
export CLERK_JWKS_URL="$CLERK_ISSUER/.well-known/jwks.json"

npm run build
node dist/index.js
```

The server creates the schema from [`server/sql/schema.sql`](server/sql/schema.sql) at startup and listens on port `8080`.

### 4. Start the browser app

In another terminal from the repository root:

```sh
cd frontend
npm ci
npm run dev
```

Open the local Vite URL printed by the command, usually `http://localhost:5173`.

## WebSocket behavior

Each connection must authenticate before sending application messages. The client sends an `authenticate` message with its Clerk token and intent:

```json
{"type":"authenticate","token":"<clerk-session-token>","intent":"game"}
```

Use `intent: "history"` when opening a history connection. After authentication, clients use `join-queue` and `make-move` for play, or `list-games` and `get-game-history` to review saved games. The server derives player identity from the verified token and authorizes game operations against server-side membership.

## Tests and checks

Run the server tests from `server/`:

```sh
npm test
```

The tests cover reconnecting to active and queued games, rejecting duplicate live connections, preventing out-of-turn moves, and denying non-players access to game actions and history.

Build the frontend from `frontend/` with `npm run build`.

