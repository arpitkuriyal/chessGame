import { readFileSync } from "fs";
import { resolve } from "path";
import { Pool } from "pg";
import type { Game } from "./game";

export type SavedGameSummary = {
  id: string;
  whitePlayerId: string;
  blackPlayerId: string;
  result: string;
  endReason: string;
  completedAt: string;
  moveCount: number;
};

export type SavedMove = {
  ply: number;
  color: "w" | "b";
  san: string;
  from: string;
  to: string;
  promotion: string | null;
};

export type SavedGame = SavedGameSummary & {
  startedAt: string;
  finalFen: string;
  pgn: string;
  moves: SavedMove[];
};

export class GameHistoryStore {
  private pool: Pool;

  constructor(connectionString = process.env.DATABASE_URL) {
    if (!connectionString) {
      throw new Error("DATABASE_URL is required to start the game server");
    }
    this.pool = new Pool({ connectionString });
    this.pool.on("error", (error) => {
      console.error("Unexpected PostgreSQL pool error", error);
    });
  }

  async initialize() {
    const schema = readFileSync(resolve(__dirname, "../sql/schema.sql"), "utf8");
    await this.pool.query(schema);
  }

  async saveCompletedGame(game: Game) {
    const client = await this.pool.connect();
    const history = game.board.history({ verbose: true });
    try {
      await client.query("BEGIN");
      await client.query(
        `INSERT INTO games (
          id, white_player_id, black_player_id, result, end_reason,
          started_at, completed_at, final_fen, pgn, move_count
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7, $8, $9)
        ON CONFLICT (id) DO NOTHING`,
        [
          game.id,
          game.player1.id,
          game.player2.id,
          game.result(),
          game.getGameOverMessage(),
          game.startedAt,
          game.board.fen(),
          game.board.pgn(),
          history.length,
        ]
      );

      if (history.length) {
        const values: Array<string | number | null> = [];
        const valueRows = history.map((move, index) => {
          const offset = index * 7;
          values.push(game.id, index + 1, move.color, move.san, move.from, move.to, move.promotion ?? null);
          return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7})`;
        });
        await client.query(
          `INSERT INTO game_moves (
            game_id, ply, color, san, from_square, to_square, promotion
          ) VALUES ${valueRows.join(", ")}
          ON CONFLICT (game_id, ply) DO NOTHING`,
          values
        );
      }

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async listForPlayer(playerId: string): Promise<SavedGameSummary[]> {
    const result = await this.pool.query(
      `SELECT id, white_player_id AS "whitePlayerId",
        black_player_id AS "blackPlayerId", result, end_reason AS "endReason",
        completed_at AS "completedAt", move_count AS "moveCount"
      FROM games
      WHERE white_player_id = $1 OR black_player_id = $1
      ORDER BY completed_at DESC`,
      [playerId]
    );
    return result.rows as SavedGameSummary[];
  }

  async getForPlayer(playerId: string, gameId: string): Promise<SavedGame | null> {
    const result = await this.pool.query(
      `SELECT id, white_player_id AS "whitePlayerId",
        black_player_id AS "blackPlayerId", result, end_reason AS "endReason",
        started_at AS "startedAt", completed_at AS "completedAt",
        final_fen AS "finalFen", pgn, move_count AS "moveCount"
      FROM games
      WHERE id = $1 AND (white_player_id = $2 OR black_player_id = $2)`,
      [gameId, playerId]
    );
    const row = result.rows[0] as Omit<SavedGame, "moves"> | undefined;
    if (!row) return null;

    const movesResult = await this.pool.query(
      `SELECT ply, color, san, from_square AS "from", to_square AS "to", promotion
      FROM game_moves
      WHERE game_id = $1
      ORDER BY ply`,
      [gameId]
    );
    return { ...row, moves: movesResult.rows as SavedMove[] };
  }

  async close() {
    await this.pool.end();
  }
}
