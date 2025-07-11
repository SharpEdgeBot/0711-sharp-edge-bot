// src/app/api/cron/cachePregameStats/route.ts
import { NextResponse } from 'next/server';
import { cachePregameStats } from '@/lib/cachePregameStats';

export const runtime = 'edge'; // Vercel Edge Function for fast cold starts

export async function GET() {
  try {
    const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const season = new Date().getFullYear();
    const apiKey = process.env.OPTIMAL_BET_API_KEY!;
    if (!apiKey) throw new Error('Missing Optimal-Bet API key');
    const results = await cachePregameStats({ date, season, apiKey });
    return NextResponse.json({ status: 'ok', results });
  } catch (error) {
    return NextResponse.json({ status: 'error', error: String(error) }, { status: 500 });
  }
}
