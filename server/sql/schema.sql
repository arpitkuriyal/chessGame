CREATE TABLE IF NOT EXISTS games (
  id TEXT PRIMARY KEY,
  white_player_id TEXT NOT NULL,
  black_player_id TEXT NOT NULL,
  result TEXT NOT NULL,
  end_reason TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL,
  final_fen TEXT NOT NULL,
  pgn TEXT NOT NULL,
  move_count INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS game_moves (
  game_id TEXT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  ply INTEGER NOT NULL,
  color CHAR(1) NOT NULL CHECK (color IN ('w', 'b')),
  san TEXT NOT NULL,
  from_square TEXT NOT NULL,
  to_square TEXT NOT NULL,
  promotion TEXT,
  PRIMARY KEY (game_id, ply)
);

CREATE INDEX IF NOT EXISTS games_white_player_idx
  ON games(white_player_id, completed_at DESC);

CREATE INDEX IF NOT EXISTS games_black_player_idx
  ON games(black_player_id, completed_at DESC);
