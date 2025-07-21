import { cachePregameStats } from '@/lib/cachePregameStats';

export async function refreshPregameCache() {
  const today = new Date().toISOString().slice(0, 10);
  const season = new Date().getFullYear();
  const apiKey = process.env.OPTIMAL_BET_API_KEY!;
  return await cachePregameStats({ date: today, season, apiKey });
}
