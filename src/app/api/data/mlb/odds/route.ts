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
  } catch (err: unknown) {
    let message = 'Unknown error';
    if (err && typeof err === 'object' && 'message' in err && typeof (err as { message?: unknown }).message === 'string') {
      message = (err as { message: string }).message;
    } else if (typeof err === 'string') {
      message = err;
    }
    return NextResponse.json({ error: 'Pinnacle odds fetch failed', details: message }, { status: 500 });
  }
}
// ...existing code...
