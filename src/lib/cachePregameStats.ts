// src/lib/cachePregameStats.ts
import { Redis } from '@upstash/redis';
import { buildGameContext } from './sportsData';
import { fetch } from 'undici';

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
  try {
    // 0. Always fetch latest Pinnacle odds and hydrate cache
    const oddsByGame: Record<string, unknown[]> = {};
    try {
      const { fetchPinnacleOdds } = await import('./pinnacleApi');
      const { transformPinnacleOdds } = await import('./pinnacleOddsTransform');
      const rawOdds = await fetchPinnacleOdds();
      if (rawOdds) {
        const normalizedOdds = transformPinnacleOdds(rawOdds);
        for (const odds of normalizedOdds) {
          // Group odds by gameId for context hydration
          if (!oddsByGame[odds.gameId]) oddsByGame[odds.gameId] = [];
          oddsByGame[odds.gameId].push(odds);
        }
      } else {
        console.warn('No Pinnacle odds returned from fetchPinnacleOdds');
      }
    } catch (_err) {
      console.error('Error fetching Pinnacle odds:', _err);
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
      teams: {
        home: { team: { id: number; name?: string }, probablePitcher?: { fullName?: string, id?: number } };
        away: { team: { id: number; name?: string }, probablePitcher?: { fullName?: string, id?: number } };
      };
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
      const eventId = game?.gameInfo?.eventId || '';
      const homeTeamId = game.teams.home.team.id;
      const awayTeamId = game.teams.away.team.id;
      const homeTeamName = game.teams.home.team.name || '';
      const awayTeamName = game.teams.away.team.name || '';
      const homeStarterName = game.teams.home.probablePitcher?.fullName || '';
      const awayStarterName = game.teams.away.probablePitcher?.fullName || '';
      let weather: unknown = {};
      let venue: unknown = {};
      let status: unknown = {};
      try {
        // Fetch live feed for pregame enrichment
        const liveUrl = `https://statsapi.mlb.com/api/v1.1/game/${gamePk}/feed/live`;
        let liveRes, liveData;
        try {
          liveRes = await fetch(liveUrl);
          liveData = await liveRes.json();
        } catch (err) {
          results.push({ gamePk, error: 'Live feed fetch failed', details: String(err) });
          continue;
        }
        weather = (liveData as { gameData?: { weather?: unknown } })?.gameData?.weather || {};
        venue = (liveData as { gameData?: { venue?: unknown } })?.gameData?.venue || {};
        status = (liveData as { gameData?: { status?: unknown } })?.gameData?.status || {};
        const context = await buildGameContext({
          gamePk,
          eventId,
          homeTeamId,
          awayTeamId,
          season,
          apiKey,
        });
        // Patch team names and probable starter names
        if (context.homeTeam && !context.homeTeam.name) context.homeTeam.name = homeTeamName;
        if (context.awayTeam && !context.awayTeam.name) context.awayTeam.name = awayTeamName;
        if (context.homePitcher && !context.homePitcher.name) context.homePitcher.name = homeStarterName;
        if (context.awayPitcher && !context.awayPitcher.name) context.awayPitcher.name = awayStarterName;
        // Fallback: If pitcher stats are missing, fetch season stats
        async function patchPitcherStats(pitcherObj: { ERA?: number; WHIP?: number; FIP?: number; K9?: number; playerId?: number }, pitcherName: string) {
          if (!pitcherObj || !pitcherName) return;
          const isMissingStats = [pitcherObj.ERA, pitcherObj.WHIP, pitcherObj.FIP, pitcherObj.K9].every(v => !v || v === 0);
          if (isMissingStats && pitcherName) {
            let pitcherId = pitcherObj.playerId;
            if (!pitcherId && game.teams) {
              const probable = [game.teams.home.probablePitcher, game.teams.away.probablePitcher].find(p => p?.fullName === pitcherName);
              if (probable?.id) pitcherId = probable.id;
            }
            if (pitcherId) {
              try {
                const statsUrl = `https://statsapi.mlb.com/api/v1/people/${pitcherId}/stats?stats=season&group=pitching&season=${season}`;
                const statsRes = await fetch(statsUrl);
                if (statsRes.ok) {
                const statsData = await statsRes.json() as { stats?: Array<{ splits?: Array<{ stat?: Record<string, unknown> }> }> };
                const statObj = statsData?.stats?.[0]?.splits?.[0]?.stat;
                if (statObj) {
                  if (typeof statObj.era === 'number') pitcherObj.ERA = statObj.era;
                  if (typeof statObj.whip === 'number') pitcherObj.WHIP = statObj.whip;
                  if (typeof statObj.fip === 'number') pitcherObj.FIP = statObj.fip;
                  if (typeof statObj.k9 === 'number') pitcherObj.K9 = statObj.k9;
                  }
                }
              } catch (_err) {}
            }
          }
        }
        await patchPitcherStats(context.homePitcher, homeStarterName);
        await patchPitcherStats(context.awayPitcher, awayStarterName);
        context.weather = weather;
        context.venue = venue;
        context.status = status;
        // Attach Pinnacle odds to context
        const oddsArr = oddsByGame[gamePk?.toString()];
        context.odds = Array.isArray(oddsArr) ? { pinnacle: oddsArr } : {};
        // Cache in Redis with 2 hour expiry
        await redis.set(`pregame:${gamePk}`, JSON.stringify(context), { ex: 7200 });
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
  return cached ? JSON.parse(cached as string) : null;
}
