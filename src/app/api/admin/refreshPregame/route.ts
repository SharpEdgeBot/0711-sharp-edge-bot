

import { cachePregameStats } from '@/lib/cachePregameStats';
import { NextRequest } from 'next/server';

export async function POST(_req: NextRequest) {
  const today = new Date().toISOString().slice(0, 10);
  try {
    const results = await cachePregameStats({ date: today });
    return new Response(JSON.stringify({ status: 'ok', results }), { status: 200 });
  } catch (_error) {
    const message = _error instanceof Error ? _error.message : 'Internal Server Error';
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}
