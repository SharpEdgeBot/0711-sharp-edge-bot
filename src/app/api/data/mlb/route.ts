import { NextRequest, NextResponse } from 'next/server';
import { fetchMLBSchedule, fetchMLBGame } from '@/lib/mlbApi';
import { mlbApiRateLimit } from '@/utils/rateLimiter';
import { getCachedSchedule, setCachedSchedule } from '@/lib/redis';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const clientIp = request.headers.get('x-forwarded-for') || 'unknown';

  // Apply rate limiting
  const rateLimit = await mlbApiRateLimit(clientIp);
  if (!rateLimit.allowed) {
    // Filter out undefined values for headers
    const filteredHeaders = Object.fromEntries(
      Object.entries(rateLimit.headers).filter(([_, v]) => typeof v === 'string')
    );
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { 
        status: 429,
        headers: filteredHeaders as HeadersInit,
      }
    );
  }

  try {
    switch (action) {
      case 'schedule': {
        const startDate = searchParams.get('startDate') || new Date().toISOString().split('T')[0];
        const endDate = searchParams.get('endDate') || startDate;
        const teamId = searchParams.get('teamId');

        // Try cache first
        const cacheKey = `${startDate}-${endDate}-${teamId || 'all'}`;
        const cached = await getCachedSchedule(cacheKey);
        if (cached) {
          let result;
          if (typeof cached === 'string') {
            try {
              result = JSON.parse(cached);
            } catch (err) {
              console.error('Cache JSON parse error:', err, 'Value:', cached);
              result = cached;
            }
          } else {
            result = cached;
          }
          return NextResponse.json(result);
        }

        let schedule;
        try {
          schedule = await fetchMLBSchedule(
            startDate,
            endDate,
            teamId ? parseInt(teamId) : undefined
          );
        } catch (apiError: unknown) {
          const details = typeof apiError === 'object' && apiError !== null && 'message' in apiError ? (apiError as Error).message : String(apiError);
          console.error('MLB API fetchMLBSchedule error:', details);
          return NextResponse.json(
            { error: 'Upstream MLB API error', details },
            { status: 502 }
          );
        }

        // Cache for 1 hour
        await setCachedSchedule(cacheKey, schedule, 3600);

        return NextResponse.json(schedule);
      }

      case 'game': {
        const gamePk = searchParams.get('gamePk');
        if (!gamePk) {
          return NextResponse.json({ error: 'gamePk is required' }, { status: 400 });
        }

        let game;
        try {
          game = await fetchMLBGame(parseInt(gamePk));
        } catch (apiError: unknown) {
          const details = typeof apiError === 'object' && apiError !== null && 'message' in apiError ? (apiError as Error).message : String(apiError);
          console.error('MLB API fetchMLBGame error:', details);
          return NextResponse.json(
            { error: 'Upstream MLB API error', details },
            { status: 502 }
          );
        }
        return NextResponse.json(game);
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: unknown) {
    const details = typeof error === 'object' && error !== null && 'message' in error ? (error as Error).message : String(error);
    console.error('MLB API route error:', details);
    return NextResponse.json(
      { error: 'Failed to fetch MLB data', details },
      { status: 500 }
    );
  }
}
