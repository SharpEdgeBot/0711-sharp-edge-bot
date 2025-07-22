import { NextRequest, NextResponse } from 'next/server';
// Removed missing import: getGameContext from '@/lib/slateAnalysis'
import { buildGameContext } from '@/lib/sportsData';

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
      
      // You must provide eventId and apiKey for buildGameContext
      const eventId = searchParams.get('eventId') || '';
      const apiKey = process.env.OPTIMAL_BET_API_KEY || '';
      context = await buildGameContext({
        gamePk,
        eventId,
        homeTeamId,
        awayTeamId,
        season,
        apiKey,
      });
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
