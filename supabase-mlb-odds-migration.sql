-- Supabase MLB Odds Migration Schema
-- Table: games
CREATE TABLE IF NOT EXISTS games (
  event_id TEXT PRIMARY KEY,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  league TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: odds_current
CREATE TABLE IF NOT EXISTS odds_current (
  id BIGSERIAL PRIMARY KEY,
  game_id TEXT REFERENCES games(event_id) ON DELETE CASCADE,
  market_type TEXT NOT NULL,
  period TEXT NOT NULL,
  odds_value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_odds_current_game_market_period ON odds_current(game_id, market_type, period);

-- Table: line_movements
CREATE TABLE IF NOT EXISTS line_movements (
  id BIGSERIAL PRIMARY KEY,
  game_id TEXT REFERENCES games(event_id) ON DELETE CASCADE,
  market_type TEXT NOT NULL,
  old_value JSONB NOT NULL,
  new_value JSONB NOT NULL,
  movement_time TIMESTAMP WITH TIME ZONE NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_line_movements_game_market ON line_movements(game_id, market_type);

-- Table: api_usage
CREATE TABLE IF NOT EXISTS api_usage (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL,
  calls_made INT DEFAULT 0,
  calls_remaining INT DEFAULT 500,
  last_since TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_api_usage_date ON api_usage(date);

-- Row Level Security Policies (RLS)
-- Enable RLS for all tables
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE odds_current ENABLE ROW LEVEL SECURITY;
ALTER TABLE line_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;

-- Example RLS policy for odds_current (Free/Pro/VIP tiers)
CREATE POLICY "tiered_access_odds" ON odds_current
  FOR SELECT USING (
    auth.role() IN ('free', 'pro', 'vip')
  );

-- Example RLS policy for games
CREATE POLICY "tiered_access_games" ON games
  FOR SELECT USING (
    auth.role() IN ('free', 'pro', 'vip')
  );

-- Example RLS policy for line_movements
CREATE POLICY "tiered_access_movements" ON line_movements
  FOR SELECT USING (
    auth.role() IN ('pro', 'vip')
  );

-- Example RLS policy for api_usage (admin only)
CREATE POLICY "admin_access_api_usage" ON api_usage
  FOR SELECT USING (
    auth.role() = 'admin'
  );

-- Data retention: Archive old games (example, not automated)
-- DELETE FROM games WHERE start_time < NOW() - INTERVAL '60 days';
-- DELETE FROM odds_current WHERE updated_at < NOW() - INTERVAL '60 days';
-- DELETE FROM line_movements WHERE movement_time < NOW() - INTERVAL '60 days';
