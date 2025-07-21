import { fetchPinnacleOdds } from '@/lib/pinnacleApi';
import { transformPinnacleOdds } from '@/lib/pinnacleOddsTransform';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const rawOdds = await fetchPinnacleOdds(0);
    if (!rawOdds || !rawOdds.events || !Array.isArray(rawOdds.events)) {
      return NextResponse.json({ error: 'No valid odds data from Pinnacle API' }, { status: 502 });
    }
    const oddsList = transformPinnacleOdds(rawOdds);
    return NextResponse.json(oddsList);
  } catch (err: any) {
    // If the error is not JSON, return a clear error
    return NextResponse.json({ error: 'Pinnacle odds fetch failed', details: err?.message || String(err) }, { status: 500 });
  }
}
