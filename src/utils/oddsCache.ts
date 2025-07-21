// src/utils/oddsCache.ts
export function getCachedOdds(gameId: string): unknown | null {
  if (typeof window === 'undefined') return null;
  const cached = localStorage.getItem(`odds_${gameId}`);
  if (!cached) return null;
  try {
    const { data, expires } = JSON.parse(cached);
    if (Date.now() > expires) return null;
    return data;
  } catch {
    return null;
  }
}

export function setCachedOdds(gameId: string, data: unknown, ttlHours = 6): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(
    `odds_${gameId}`,
    JSON.stringify({ data, expires: Date.now() + ttlHours * 3600 * 1000 })
  );
}

export function clearCachedOdds(gameId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(`odds_${gameId}`);
}
