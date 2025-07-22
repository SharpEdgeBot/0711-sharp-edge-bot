"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import UnifiedGameCard from "../../../components/UnifiedGameCard";
import teamsData from "../../../data/mlb_teams.json";

// Extend Game type to include odds
interface Game {
  id: string;
  date: string;
  homeTeam: string;
  homeTeamId?: number;
  awayTeam: string;
  awayTeamId?: number;
  status: "scheduled" | "live" | "final";
  homeScore?: number;
  awayScore?: number;
  inning?: string;
  stadium: string;
  startTime: string;
  homeLogo?: string;
  awayLogo?: string;
  homeProbablePitcher?: string;
  homeProbablePitcherEra?: number;
  awayProbablePitcher?: string;
  awayProbablePitcherEra?: number;
  homeRecord?: string;
  awayRecord?: string;
  weather?: {
    temp: number | null;
    wind: string | null;
    condition: string | null;
  };
  odds?: {
    moneyline?: { home: number | null; away: number | null };
    spread?: { line: number | null; home: number | null; away: number | null };
    total?: { line: number | null; over: number | null; under: number | null };
    yrfi?: { over: number | null; under: number | null };
    [key: string]: unknown;
  };
}

export default function UnifiedGamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Helper to get team logo by id
  const getLogo = (id?: number) => {
    if (!id) return "";
    const team = (teamsData as Array<{ id: number; logo: string }>).find(t => t.id === id);
    return team?.logo || "";
  };

  // Helper to get weather for a gamePk
  const fetchWeather = async (gamePk: string | number) => {
    try {
      const res = await fetch(`/api/game/${gamePk}`);
      if (!res.ok) return undefined;
      const data = await res.json();
      return data?.gameData?.weather || undefined;
    } catch {
      return undefined;
    }
  };

  // Helper to get odds for a gamePk
  const fetchOdds = async (gamePk: string | number) => {
    try {
      const res = await fetch(`/api/mlb/odds/${gamePk}`);
      if (!res.ok) return undefined;
      const data = await res.json();
      return data || undefined;
    } catch {
      return undefined;
    }
  };

  // Main fetch function
  const fetchGames = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/data/mlb?action=schedule&startDate=${selectedDate}&endDate=${selectedDate}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch games");
      }
      let gamesArr: Array<{ gamePk: string; gameDate: string; teams: { home: { team: { id: number; name: string }; leagueRecord?: { wins: number; losses: number }; score?: number }; away: { team: { id: number; name: string }; leagueRecord?: { wins: number; losses: number }; score?: number } }; status: { abstractGameState: string }; linescore?: { currentInning?: number }; venue?: { name?: string }; probablePitchers?: { home?: { fullName?: string; era?: number }; away?: { fullName?: string; era?: number } } }>; // Explicit type
      if (Array.isArray(data.games)) {
        gamesArr = data.games;
      } else if (Array.isArray(data)) {
        gamesArr = data;
      } else if (Array.isArray(data.dates)) {
        gamesArr = data.dates.flatMap((d: { games: unknown[] }) => d.games || []);
      } else {
        gamesArr = [];
      }
      // Fetch weather and odds for each game in parallel
      const weatherArr: Array<{ temp?: number; wind?: string; condition?: string }> = await Promise.all(gamesArr.map(g => fetchWeather(g.gamePk)));
      const oddsArr: Array<{ moneyline?: { home: number | null; away: number | null }; spread?: { line: number | null; home: number | null; away: number | null }; total?: { line: number | null; over: number | null; under: number | null }; yrfi?: { over: number | null; under: number | null } }> = await Promise.all(gamesArr.map(g => fetchOdds(g.gamePk)));
      const mappedGames = gamesArr.map((g, i) => {
        // Defensive fallback for scores
        const homeScore = typeof g.teams.home.score === 'number' ? g.teams.home.score : undefined;
        const awayScore = typeof g.teams.away.score === 'number' ? g.teams.away.score : undefined;
        return {
          id: g.gamePk,
          date: g.gameDate,
          homeTeam: g.teams.home.team.name,
          homeTeamId: g.teams.home.team.id,
          awayTeam: g.teams.away.team.name,
          awayTeamId: g.teams.away.team.id,
          status: g.status?.abstractGameState?.toLowerCase() as "scheduled" | "live" | "final",
          homeScore,
          awayScore,
          inning: g.linescore?.currentInning ? `Inning ${g.linescore.currentInning}` : undefined,
          stadium: g.venue?.name || "",
          startTime: g.gameDate ? new Date(g.gameDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
          homeLogo: getLogo(g.teams.home.team.id),
          awayLogo: getLogo(g.teams.away.team.id),
          homeProbablePitcher: g.probablePitchers?.home?.fullName || "",
          homeProbablePitcherEra: g.probablePitchers?.home?.era ?? undefined,
          awayProbablePitcher: g.probablePitchers?.away?.fullName || "",
          awayProbablePitcherEra: g.probablePitchers?.away?.era ?? undefined,
          homeRecord: g.teams.home.leagueRecord ? `${g.teams.home.leagueRecord.wins}-${g.teams.home.leagueRecord.losses}` : "",
          awayRecord: g.teams.away.leagueRecord ? `${g.teams.away.leagueRecord.wins}-${g.teams.away.leagueRecord.losses}` : "",
          weather: {
            temp: typeof weatherArr[i]?.temp === 'number' ? weatherArr[i].temp : null,
            wind: typeof weatherArr[i]?.wind === 'string' ? weatherArr[i].wind : null,
            condition: typeof weatherArr[i]?.condition === 'string' ? weatherArr[i].condition : null,
          },
          odds: oddsArr[i],
        };
      });
      setGames(mappedGames);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchGames();
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(fetchGames, 30000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [selectedDate, fetchGames]);

  return (
    <div className="min-h-screen bg-[var(--background)] py-8 px-4 text-[var(--foreground)] font-sans">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold gradient-text mb-2">📅 Today&apos;s Games</h1>
        <p className="text-body mb-4">Unified MLB game cards with odds</p>
        <div className="flex items-center gap-4 mt-4 mb-8">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-[var(--accent-blue)] bg-[var(--card)] text-[var(--card-foreground)] rounded-md focus:ring-2 focus:ring-[var(--accent-blue)] focus:border-transparent font-mono"
          />
          <button
            onClick={fetchGames}
            className="modern-btn"
          >Refresh</button>
        </div>
      </div>
      <div>
        {loading ? (
          <div className="glass rounded-xl shadow-xl p-8">
            <div className="flex items-center justify-center">
              <span className="animate-spin mr-2">⏳</span>
              <span className="ml-3 text-body">Loading games...</span>
            </div>
          </div>
        ) : error ? (
          <div className="glass rounded-xl shadow-xl p-8">
            <div className="flex items-center justify-center">
              <span className="mr-2">⚠️</span>
              <p className="text-body mb-4">{error}</p>
              <button
                onClick={fetchGames}
                className="modern-btn ml-2"
              >Retry</button>
            </div>
          </div>
        ) : games.length === 0 ? (
          <div className="glass rounded-xl shadow-xl p-8">
            <div className="flex items-center justify-center">
              <span className="mr-2">📭</span>
              <p className="text-body">No MLB games scheduled for {new Date(selectedDate).toLocaleDateString()}</p>
            </div>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            {games.map((game) => {
              // Normalize homeRecord/awayRecord to expected object shape
              const normalizeRecord = (rec: string | undefined): { wins: number; losses: number; l5?: { wins: number; losses: number } } | undefined => {
                if (!rec) return undefined;
                // Example: "52-38" or "52-38, L5: 3-2"
                const [main, l5] = rec.split(',');
                const [wins, losses] = main.split('-').map(Number);
                let l5Obj;
                if (l5) {
                  const l5Match = l5.match(/L5:\s*(\d+)-(\d+)/);
                  if (l5Match) {
                    l5Obj = { wins: Number(l5Match[1]), losses: Number(l5Match[2]) };
                  }
                }
                return { wins, losses, l5: l5Obj };
              };

              const ensureL5 = (rec: { wins: number; losses: number; l5?: { wins: number; losses: number } }) => {
                return {
                  ...rec,
                  l5: rec.l5 ?? { wins: 0, losses: 0 },
                };
              };
              const safeGame = {
                ...game,
                homeRecord: game.homeRecord ? ensureL5(typeof game.homeRecord === 'string' ? normalizeRecord(game.homeRecord)! : game.homeRecord) : undefined,
                awayRecord: game.awayRecord ? ensureL5(typeof game.awayRecord === 'string' ? normalizeRecord(game.awayRecord)! : game.awayRecord) : undefined,
                startTime: game.startTime || game.date || '',
                weather: typeof game.weather === 'object' && game.weather !== null ? {
                  temp: (game.weather && typeof (game.weather as import('@/types/mlb').WeatherInfo).temp === 'string') ? Number((game.weather as import('@/types/mlb').WeatherInfo).temp) : null,
                  wind: (game.weather && typeof (game.weather as import('@/types/mlb').WeatherInfo).wind === 'string') ? (game.weather as import('@/types/mlb').WeatherInfo).wind : null,
                  condition: (game.weather && typeof (game.weather as import('@/types/mlb').WeatherInfo).condition === 'string') ? (game.weather as import('@/types/mlb').WeatherInfo).condition : null,
                } : { temp: null, wind: null, condition: null },
              };
              const safeOdds = game.odds ?? { moneyline: { home: null, away: null }, spread: { line: null, home: null, away: null }, total: { line: null, over: null, under: null }, yrfi: { over: null, under: null } };
              return (
                <UnifiedGameCard
                  key={game.id}
                  game={safeGame}
                  odds={safeOdds}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
