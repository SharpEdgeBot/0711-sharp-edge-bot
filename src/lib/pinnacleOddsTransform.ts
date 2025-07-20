// src/lib/pinnacleOddsTransform.ts
import { PinnacleMarket } from './pinnacleApi';

export function transformPinnacleOdds(raw: any): PinnacleMarket[] {
  if (!raw || !raw.events) return [];
  return raw.events.map((event: any) => {
    const { event_id, home, away, start_time, league, status, periods, markets } = event;
    return {
      event_id,
      home_team: home,
      away_team: away,
      start_time,
      league,
      status,
      periods,
      markets
    };
  });
}
