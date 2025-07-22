import { cachePregameStats } from '@/lib/cachePregameStats';

export async function refreshPregameCache() {
  const today = new Date().toISOString().slice(0, 10);
  return await cachePregameStats({ date: today });
}
