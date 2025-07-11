import { NextRequest, NextResponse } from 'next/server';
import { fetchOptimalBetEvents, fetchGameOdds, fetchGamelines, fetchPlayerProps } from '@/lib/optimalApi';
import { optimalBetRateLimit } from '@/utils/rateLimiter';
import { getCachedOdds, setCachedOdds } from '@/lib/redis';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const clientIp = request.headers.get('x-forwarded-for') || 'unknown';

  // Apply rate limiting
  const rateLimit = await optimalBetRateLimit(clientIp);
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
      case 'events': {
        const date = searchParams.get('date');
        const events = await fetchOptimalBetEvents('mlb', '2025', date || undefined);
        return NextResponse.json({ events });
      }

      case 'odds': {
        const eventId = searchParams.get('eventId');
        const marketType = searchParams.get('marketType') || 'moneyline';

        if (!eventId) {
          return NextResponse.json({ error: 'eventId is required' }, { status: 400 });
        }

        // Try cache first (5-minute TTL for odds)
        const cached = await getCachedOdds(eventId, marketType);
        if (cached) {
          // If cached is a string, parse it; if already an object, return as-is
          let cachedValue;
          if (typeof cached === 'string') {
            try {
              cachedValue = JSON.parse(cached);
            } catch {
              cachedValue = cached;
            }
          } else {
            cachedValue = cached;
          }
          return NextResponse.json(cachedValue);
        }

        try {
          const odds = await fetchGameOdds(eventId);
          // Cache for 5 minutes
          await setCachedOdds(eventId, marketType, { odds }, 300);
          return NextResponse.json({ odds });
        } catch (err: any) {
          if (err?.status === 404) {
            return NextResponse.json({ error: 'Odds not found for event', eventId }, { status: 404 });
          }
          return NextResponse.json({ error: err?.message || 'Unknown error fetching odds', eventId }, { status: 500 });
        }
      }

      case 'totals': {
        const eventId = searchParams.get('eventId');
        const marketType = searchParams.get('marketType') || 'totals';

        if (!eventId) {
          return NextResponse.json({ error: 'eventId is required' }, { status: 400 });
        }

        const cached = await getCachedOdds(eventId, marketType);
        if (cached) {
          return NextResponse.json(JSON.parse(cached as string));
        }

        const totals = await fetchGamelines(eventId, marketType);
        
        await setCachedOdds(eventId, marketType, { totals }, 300);

        return NextResponse.json({ totals });
      }

      case 'props': {
        const eventId = searchParams.get('eventId');
        const playerId = searchParams.get('playerId');

        if (!eventId) {
          return NextResponse.json({ error: 'eventId is required' }, { status: 400 });
        }

        const props = await fetchPlayerProps(eventId, playerId || undefined);
        return NextResponse.json({ props });
      }

      default: {
        // Default: return today's MLB events and gamelines for odds dashboard
        const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const events = await fetchOptimalBetEvents('mlb', '2025', today);
        // For each event, fetch gamelines
        const oddsPromises = events.map(async (event: any) => {
          try {
            const gamelines = await fetchGamelines(event.id, 'moneyline');
            return { ...event, gamelines };
          } catch {
            return { ...event, gamelines: null };
          }
        });
        const odds = await Promise.all(oddsPromises);
        return NextResponse.json(odds);
      }
    }
  } catch (error) {
    console.error('OptimalBet API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch betting data' },
      { status: 500 }
    );
  }
}
