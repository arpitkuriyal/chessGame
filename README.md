# ♟️ Real-Time Multiplayer Chess

## Overview

A real-time multiplayer chess application that enables two players to
compete online with seamless synchronization. Built using modern web
technologies, the platform delivers a responsive and interactive
experience with accurate move validation and live game state updates.

------------------------------------------------------------------------

## Key Features

-   **Real-Time Gameplay**\
    Instant move synchronization between players using WebSockets.

-   **Robust Move Validation**\
    Ensures all moves follow official chess rules via `chess.js`.

-   **Interactive UI**\
    Clean, responsive chessboard built with Tailwind CSS for smooth user
    experience.

-   **Automatic Matchmaking**\
    Players are paired dynamically through a queue-based system.

-   **Game State Management**\
    Handles checkmate, stalemate, draw conditions, and turn switching.

-   **Resilient Connection Handling**\
    Detects player disconnections and gracefully ends the game.

------------------------------------------------------------------------

## Tech Stack

### Frontend

-   React.js
-   TypeScript
-   Tailwind CSS

### Backend

-   Node.js
-   WebSockets (`ws`)

### Game Engine

-   `chess.js` for move validation and game rules

------------------------------------------------------------------------

## Architecture Overview

-   WebSocket-based communication enables low-latency, bidirectional
    data flow\
-   Centralized game manager handles matchmaking and active game
    sessions\
-   Game state is maintained on the server and broadcasted to clients in
    real time

------------------------------------------------------------------------