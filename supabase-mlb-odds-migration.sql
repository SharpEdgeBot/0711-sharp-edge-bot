-- Table: users_usage (for chat usage tracking)
CREATE TABLE IF NOT EXISTS users_usage (
  user_id TEXT NOT NULL,
  usage_date DATE NOT NULL,
  message_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, usage_date)
);
CREATE INDEX IF NOT EXISTS idx_users_usage_user_date ON users_usage(user_id, usage_date);
-- Supabase migration for MLB odds line movement tracking
CREATE TABLE IF NOT EXISTS line_movements (
  id BIGSERIAL PRIMARY KEY,
  game_pk BIGINT NOT NULL,
  event_id TEXT,
  market_type TEXT NOT NULL,
  period TEXT,
  odds_value FLOAT NOT NULL,
  teams TEXT[],
  start_time TIMESTAMP,
  league TEXT,
  bookmaker TEXT DEFAULT 'Pinnacle',
  last_updated TIMESTAMP,
  created_at TIMESTAMP DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_line_movements_game_pk ON line_movements(game_pk);
CREATE INDEX IF NOT EXISTS idx_line_movements_market_type ON line_movements(market_type);
CREATE INDEX IF NOT EXISTS idx_line_movements_created_at ON line_movements(created_at);
-- Supabase MLB Odds Migration Schema
  event_id TEXT PRIMARY KEY,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  league TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DROP TABLE IF EXISTS line_movements CASCADE;
DROP TABLE IF EXISTS odds_current CASCADE;
DROP TABLE IF EXISTS api_usage CASCADE;
  odds_value JSONB NOT NULL,
);
CREATE INDEX IF NOT EXISTS idx_odds_current_game_market_period ON odds_current(game_id, market_type, period);

-- Table: line_movements
CREATE TABLE IF NOT EXISTS line_movements (
  id BIGSERIAL PRIMARY KEY,
  game_id TEXT REFERENCES games(event_id) ON DELETE CASCADE,
  market_type TEXT NOT NULL,
  old_value JSONB NOT NULL,
  new_value JSONB NOT NULL,
CREATE INDEX IF NOT EXISTS idx_line_movements_game_market ON line_movements(game_id, market_type);

-- Table: api_usage
CREATE TABLE IF NOT EXISTS api_usage (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL,
  calls_made INT DEFAULT 0,
  calls_remaining INT DEFAULT 500,
  last_since TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
CREATE UNIQUE INDEX IF NOT EXISTS idx_api_usage_date ON api_usage(date);

-- Row Level Security Policies (RLS)
-- Enable RLS for all tables
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE odds_current ENABLE ROW LEVEL SECURITY;
ALTER TABLE line_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;

-- Example RLS policy for odds_current (Free/Pro/VIP tiers)
  FOR SELECT USING (
    auth.role() IN ('free', 'pro', 'vip')
  );

-- Example RLS policy for games
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

