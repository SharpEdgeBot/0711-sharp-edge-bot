

// Odds fetcher using server-side API route to avoid CORS and keep API key secure

// Fetch all MLB events and odds from the server-side API route
// Type for OptimalBet event
export interface OptimalBetEvent {
  id: string;
  start_date_code: string;
  league: string;
  away: string;
  home: string;
  away_display: string;
  home_display: string;
  start_date: string;
  gamelines?: any;
}

export async function fetchMLBOdds(): Promise<OptimalBetEvent[]> {
  try {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const eventsRes = await fetch(`/api/data/optimal?action=events&date=${today}`);
    if (!eventsRes.ok) return [];
    const eventsData = await eventsRes.json();
    const events = eventsData.events || [];
    const oddsPromises = events.map(async (event: OptimalBetEvent) => {
      try {
        const oddsRes = await fetch(`/api/data/optimal?action=odds&eventId=${event.id}`);
        if (!oddsRes.ok) {
          // If odds not found (404), return null odds
          return { ...event, odds: null };
        }
        const oddsData = await oddsRes.json();
        return { ...event, odds: oddsData.odds ?? null };
      } catch (err) {
        return { ...event, odds: null };
      }
    });
    return Promise.all(oddsPromises);
  } catch (err) {
    // Defensive: return empty array on any error
    return [];
  }
}
