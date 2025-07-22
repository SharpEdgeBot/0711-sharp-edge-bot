import { NextRequest, NextResponse } from 'next/server';
// Removed missing import: getGameContext from '@/lib/slateAnalysis'
import { buildGameContext } from '@/lib/sportsData';
import { WeatherInfo } from '@/types/mlb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gamePk: string }> }
) {
  try {
    const resolvedParams = await params;
    const gamePk = parseInt(resolvedParams.gamePk);
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('refresh') === 'true';
    
    if (!gamePk || isNaN(gamePk)) {
      return NextResponse.json(
        { success: false, error: 'Valid gamePk required' },
        { status: 400 }
      );
    }
    
    console.log(`[API] Retrieving context for game ${gamePk}${forceRefresh ? ' (force refresh)' : ''}`);
    
    let context: import('@/types/mlb').MLBGame | null;
    
    if (forceRefresh) {
      // Force rebuild - need homeTeamId and awayTeamId from query params
      const homeTeamId = parseInt(searchParams.get('homeTeamId') || '0');
      const awayTeamId = parseInt(searchParams.get('awayTeamId') || '0');
      const season = parseInt(searchParams.get('season') || '2025');
      
      if (!homeTeamId || !awayTeamId) {
        return NextResponse.json(
          { success: false, error: 'homeTeamId and awayTeamId required for refresh' },
          { status: 400 }
        );
      }
      
      // You must provide eventId for buildGameContext
      const eventId = searchParams.get('eventId') || '';
      const rawContext = await buildGameContext({
        gamePk,
        eventId,
        homeTeamId,
        awayTeamId,
        season,
      });
      // Map TeamStats to MLBTeam
      context = {
        ...rawContext,
        homeTeam: {
          id: rawContext.homeTeam.teamId,
          name: rawContext.homeTeam.name,
          logo: '',
          record: '',
          probablePitcher: undefined,
        },
        awayTeam: {
          id: rawContext.awayTeam.teamId,
          name: rawContext.awayTeam.name,
          logo: '',
          record: '',
          probablePitcher: undefined,
        },
        homePitcher: rawContext.homePitcher ? {
          id: rawContext.homePitcher.playerId,
          name: rawContext.homePitcher.name,
          stats: {
            era: rawContext.homePitcher.ERA,
            whip: rawContext.homePitcher.WHIP,
            k9: rawContext.homePitcher.K9,
          }
        } : undefined,
        awayPitcher: rawContext.awayPitcher ? {
          id: rawContext.awayPitcher.playerId,
          name: rawContext.awayPitcher.name,
          stats: {
            era: rawContext.awayPitcher.ERA,
            whip: rawContext.awayPitcher.WHIP,
            k9: rawContext.awayPitcher.K9,
          }
        } : undefined,
        venue: typeof rawContext.venue === 'string' ? rawContext.venue : '',
        status: typeof rawContext.status === 'string' ? rawContext.status : '',
        odds: Array.isArray(rawContext.odds) ? rawContext.odds : [],
        weather: typeof rawContext.weather === 'object' && rawContext.weather !== null ? rawContext.weather as WeatherInfo : undefined,
      };
    } else {
      // Try to get from cache first
      // Try to get cached context from Redis
      const { getCachedPregameContext } = await import('@/lib/cachePregameStats');
      const cachedContext: import('@/types/mlb').MLBGame | null = await getCachedPregameContext(gamePk);
      if (cachedContext) {
        return NextResponse.json({
          success: true,
          data: cachedContext,
          fromCache: true
        });
      } else {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Game context not found in cache',
            message: 'Use refresh=true with homeTeamId/awayTeamId to rebuild context.'
          },
          { status: 404 }
        );
      }
    }
    
    return NextResponse.json({
      success: true,
      data: context,
      fromCache: !forceRefresh
    });
    
  } catch (error) {
    console.error(`[API] Error retrieving game context:`, error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to retrieve game context',
        details: String(error)
      },
      { status: 500 }
    );
  }
}
