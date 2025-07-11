// src/lib/cachePregameStats.ts
import { Redis } from '@upstash/redis';
import { fetchMLBSchedule, buildGameContext } from './sportsData';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Batch fetch and cache all pregame stats and odds for today's games
export async function cachePregameStats({ date, season, apiKey }: {
  date: string; // YYYY-MM-DD
  season: number;
  apiKey: string;
}) {
  // 1. Fetch today's MLB schedule
  const schedule = await fetchMLBSchedule(date);
  const datesArr = Array.isArray((schedule as any)?.dates) ? (schedule as any).dates : [];
  const games = datesArr[0]?.games ?? [];
  const results: any[] = [];

  // 2. For each game, build context and cache
  for (const game of games) {
    const gamePk = game.gamePk;
    const eventId = game?.gameInfo?.eventId || '';
    const homeTeamId = game.teams.home.team.id;
    const awayTeamId = game.teams.away.team.id;
    try {
      const context = await buildGameContext({
        gamePk,
        eventId,
        homeTeamId,
        awayTeamId,
        season,
        apiKey,
      });
      // Cache in Redis with 2 hour expiry
      await redis.set(`pregame:${gamePk}`, JSON.stringify(context), { ex: 7200 });
      results.push({ gamePk, status: 'ok' });
    } catch (err) {
      results.push({ gamePk, status: 'error', error: String(err) });
    }
  }
  return results;
}

// Utility: Get cached pregame context for a game
export async function getCachedPregameContext(gamePk: number) {
  const cached = await redis.get(`pregame:${gamePk}`);
  return cached ? JSON.parse(cached as string) : null;
}
