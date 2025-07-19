// src/lib/cachePregameStats.ts
import { Redis } from '@upstash/redis';
import { fetchMLBSchedule, buildGameContext } from './sportsData';
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
    // 1. Fetch today's MLB schedule with full hydration
    const scheduleUrl = `https://statsapi.mlb.com/api/v1/schedule?sportId=1&date=${date}&hydrate=team,linescore,probablePitcher(note),game(content),flags,liveLookin,seriesStatus`;
    let scheduleRes, schedule;
    try {
      scheduleRes = await fetch(scheduleUrl);
      schedule = await scheduleRes.json();
      console.log('MLB schedule response:', JSON.stringify(schedule, null, 2));
    } catch (err) {
      console.error('Error fetching MLB schedule:', err);
      return [{ error: 'MLB schedule fetch failed', details: String(err) }];
    }
    // Use type assertion for schedule
    const datesArr = Array.isArray((schedule as any)?.dates) ? (schedule as any).dates : [];
    let games: any[] = [];
    for (const dateObj of datesArr) {
      if (Array.isArray((dateObj as any).games)) {
        games = games.concat((dateObj as any).games);
      }
    }
    const results: any[] = [];

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
      let weather = {};
      let venue = {};
      let status = {};
      try {
        // Fetch live feed for pregame enrichment
        const liveUrl = `https://statsapi.mlb.com/api/v1.1/game/${gamePk}/feed/live`;
        let liveRes, liveData;
        try {
          liveRes = await fetch(liveUrl);
          liveData = await liveRes.json();
          console.log(`Live feed for gamePk ${gamePk}:`, JSON.stringify(liveData, null, 2));
        } catch (err) {
          console.error(`Error fetching live feed for gamePk ${gamePk}:`, err);
          results.push({ gamePk, error: 'Live feed fetch failed', details: String(err) });
          continue;
        }
        // Use type assertion for liveData
        weather = (liveData as any)?.gameData?.weather || {};
        venue = (liveData as any)?.gameData?.venue || {};
        status = (liveData as any)?.gameData?.status || {};
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
            // Try to get pitcherId from probablePitcher or fallback to searching by name
            let pitcherId = pitcherObj.playerId;
            if (!pitcherId && game.teams) {
              // Try to find probablePitcher id from schedule
              const probable = [game.teams.home.probablePitcher, game.teams.away.probablePitcher].find(p => p?.fullName === pitcherName);
              if (probable?.id) pitcherId = probable.id;
            }
            if (pitcherId) {
              try {
                const statsUrl = `https://statsapi.mlb.com/api/v1/people/${pitcherId}/stats?stats=season&group=pitching&season=${season}`;
                const statsRes = await fetch(statsUrl);
                if (statsRes.ok) {
                  const statsData = await statsRes.json() as { stats?: Array<{ splits?: Array<{ stat?: any }> }> };
                  const statObj = statsData?.stats?.[0]?.splits?.[0]?.stat;
                  if (statObj) {
                    pitcherObj.ERA = statObj.era ?? pitcherObj.ERA;
                    pitcherObj.WHIP = statObj.whip ?? pitcherObj.WHIP;
                    pitcherObj.FIP = statObj.fip ?? pitcherObj.FIP;
                    pitcherObj.K9 = statObj.k9 ?? pitcherObj.K9;
                  }
                }
              } catch (err) {
                console.error(`Error fetching fallback pitcher stats for ${pitcherName} (${pitcherId}):`, err);
              }
            }
          }
        }
        await patchPitcherStats(context.homePitcher, homeStarterName);
        await patchPitcherStats(context.awayPitcher, awayStarterName);
        context.weather = weather;
        context.venue = venue;
        context.status = status;
        // Cache in Redis with 2 hour expiry
        await redis.set(`pregame:${gamePk}`, JSON.stringify(context), { ex: 7200 });
        results.push({ gamePk, status: 'ok' });
      } catch (err) {
        results.push({ gamePk, status: 'error', error: String(err) });
      }
    }
    return results;
  } catch (err) {
    console.error('Fatal error in cachePregameStats:', err);
    return [{ error: 'Fatal error', details: String(err) }];
  }
}

// Utility: Get cached pregame context for a game
export async function getCachedPregameContext(gamePk: number) {
  const cached = await redis.get(`pregame:${gamePk}`);
  return cached ? JSON.parse(cached as string) : null;
}
