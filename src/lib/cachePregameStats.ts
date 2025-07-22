// src/lib/cachePregameStats.ts
import { Redis } from '@upstash/redis';
// import { buildGameContext } from './sportsData';
import { normalizeMLBGame } from './normalizeMLB';
import type { MLBGame } from '@/types/mlb';
import { fetch } from 'undici';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Batch fetch and cache all pregame stats and odds for today's games
export async function cachePregameStats({ date }: {
  date: string; // YYYY-MM-DD
}) {
  try {
    // Only retrieve odds from Redis cache, never fetch from Pinnacle API
    const oddsByGame: Record<string, unknown[]> = {};
    const cachedOdds = await redis.get('pinnacle:odds');
    if (cachedOdds && typeof cachedOdds === 'object') {
      for (const [gameId, oddsArr] of Object.entries(cachedOdds as Record<string, unknown[]>)) {
        oddsByGame[gameId] = oddsArr;
      }
    } else {
      console.warn('No Pinnacle odds found in Redis cache');
    }
    // 1. Fetch today's MLB schedule with full hydration
    const scheduleUrl = `https://statsapi.mlb.com/api/v1/schedule?sportId=1&date=${date}&hydrate=team,linescore,probablePitcher(note),game(content),flags,liveLookin,seriesStatus`;
    let scheduleRes, schedule;
    try {
      scheduleRes = await fetch(scheduleUrl);
      schedule = await scheduleRes.json();
      console.log('MLB schedule response:', JSON.stringify(schedule, null, 2));
    } catch (_err) {
      console.error('Error fetching MLB schedule:', _err);
      return [{ error: 'MLB schedule fetch failed', details: String(_err) }];
    }
    // Use type assertion for schedule
    const datesArr = Array.isArray((schedule as { dates?: { games?: unknown[] }[] })?.dates)
      ? (schedule as { dates?: { games?: unknown[] }[] }).dates!
      : [];
    type MLBGame = {
      gamePk: number;
      gameInfo?: { eventId?: string };
      teams?: {
        home: import("@/types/mlb").MLBTeam | { team: { id: number; name?: string }, probablePitcher?: { fullName?: string, id?: number } };
        away: import("@/types/mlb").MLBTeam | { team: { id: number; name?: string }, probablePitcher?: { fullName?: string, id?: number } };
      };
      odds?: unknown[];
    };
    let games: MLBGame[] = [];
    for (const dateObj of datesArr) {
      if (Array.isArray(dateObj.games)) {
        games = games.concat(dateObj.games as MLBGame[]);
      }
    }
    const results: Array<{ gamePk: number; status?: string; error?: string; details?: string }> = [];

    // 2. For each game, fetch /game/{gamePk}/feed/live and enrich context
    for (const game of games) {
      const gamePk = game.gamePk;
      // Normalize raw game data to MLBGame type
      let normalizedGame: MLBGame;
      try {
        // Normalize and enrich game object
        normalizedGame = normalizeMLBGame(game);
        // Attach Pinnacle odds if available
        const oddsArr = oddsByGame[gamePk?.toString()];
        if (Array.isArray(oddsArr)) {
          normalizedGame.odds = oddsArr;
        }
        // Cache normalized game object in Redis
        await redis.set(`pregame:${gamePk}`, JSON.stringify(normalizedGame), { ex: 7200 });
        results.push({ gamePk, status: 'ok' });
      } catch (_err) {
        results.push({ gamePk, status: 'error', error: String(_err) });
      }
    }
    return results;
  } catch (_err) {
    console.error('Fatal error in cachePregameStats:', _err);
    return [{ error: 'Fatal error', details: String(_err) }];
  }
}

// Utility: Get cached pregame context for a game
export async function getCachedPregameContext(gamePk: number) {
  const cached = await redis.get(`pregame:${gamePk}`);
  if (!cached) return null;
  if (typeof cached === 'string') {
    try {
      return JSON.parse(cached) as MLBGame;
    } catch (err) {
      // If it's not valid JSON, return null or log error
      console.error('Error parsing cached pregame context:', err, cached);
      return null;
    }
  }
  // If already an object, return as is
  if (typeof cached === 'object') return cached as MLBGame;
  return null;
}
