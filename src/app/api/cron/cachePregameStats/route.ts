// src/app/api/cron/cachePregameStats/route.ts
import { NextResponse } from 'next/server';
import { cachePregameStats } from '@/lib/cachePregameStats';

export const runtime = 'nodejs'; // Vercel Edge Function for fast cold starts

export async function GET() {
  try {
    const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const season = new Date().getFullYear();
    const apiKey = process.env.OPTIMAL_BET_API_KEY!;
    if (!apiKey) throw new Error('Missing Optimal-Bet API key');
      const result = await cachePregameStats({ date, season, apiKey });
  return NextResponse.json({ status: 'ok', result });
  } catch (error: unknown) {
    // Enhanced error logging with type guard
    let errorMessage = 'Unknown error';
    let errorStack = undefined;
    if (typeof error === 'object' && error !== null) {
      if ('message' in error && typeof (error as Error).message === 'string') {
        errorMessage = (error as Error).message;
      } else {
        errorMessage = JSON.stringify(error);
      }
      if ('stack' in error && typeof (error as Error).stack === 'string') {
        errorStack = (error as Error).stack;
      }
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    console.error('cachePregameStats API error:', {
      message: errorMessage,
      stack: errorStack,
      error
    });
    return NextResponse.json(
      { status: 'error', error: errorMessage, stack: errorStack, details: error },
      { status: 500 }
    );
  }
}
