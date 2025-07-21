-- Table for tracking Pinnacle odds and bet limits snapshots
create table if not exists public.pinnacle_odds_snapshots (
  id bigserial primary key,
  snapshot_time timestamptz not null,
  game_id text not null,
  market_type text not null,
  period text not null,
  odds_value float8 not null,
  bet_limit float8,
  teams text[],
  start_time timestamptz,
  league text,
  last_updated text
);

create index if not exists idx_pinnacle_odds_snapshots_game_time on public.pinnacle_odds_snapshots (game_id, snapshot_time);
