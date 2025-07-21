"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import GameCard from "../../../components/GameCard";
import teamsData from "../../../data/mlb_teams.json";

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
}

interface RawGame {
  gamePk: string;
  gameDate: string;
  teams: {
    home: {
      team: { name: string; id: number };
      score?: number;
      leagueRecord?: { wins: number; losses: number };
    };
    away: {
      team: { name: string; id: number };
      score?: number;
      leagueRecord?: { wins: number; losses: number };
    };
  };
  status: { abstractGameState: string };
  linescore?: { currentInning: number };
  venue?: { name: string };
  probablePitchers?: {
    home?: { fullName: string; era: number };
    away?: { fullName: string; era: number };
  };
}

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // useCallback ensures fetchGames reference is stable for useEffect deps
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
      // MLB API: weather is under gameData.weather
      return data?.gameData?.weather || undefined;
    } catch {
      return undefined;
    }
  };

  // Helper to get probable pitcher stats (ERA, WHIP, etc.)
  const formatPitcherStats = (era?: number) => {
    return typeof era === "number" && !isNaN(era) ? `ERA: ${era.toFixed(2)}` : undefined;
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
      let gamesArr: RawGame[] = [];
      if (Array.isArray(data.games)) {
        gamesArr = data.games;
      } else if (Array.isArray(data)) {
        gamesArr = data;
      } else if (Array.isArray(data.dates)) {
        gamesArr = data.dates.flatMap((d: { games: RawGame[] }) => d.games || []);
      }
      // Fetch weather for each game in parallel
      const weatherArr = await Promise.all(gamesArr.map(g => fetchWeather(g.gamePk)));
      const mappedGames = gamesArr.map((g, i) => ({
        id: g.gamePk,
        date: g.gameDate,
        homeTeam: g.teams.home.team.name,
        homeTeamId: g.teams.home.team.id,
        awayTeam: g.teams.away.team.name,
        awayTeamId: g.teams.away.team.id,
        status: g.status.abstractGameState.toLowerCase() as "scheduled" | "live" | "final",
        homeScore: g.teams.home.score,
        awayScore: g.teams.away.score,
        inning: g.linescore?.currentInning ? `Inning ${g.linescore.currentInning}` : undefined,
        stadium: g.venue?.name || "",
        startTime: g.gameDate ? new Date(g.gameDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
        homeLogo: getLogo(g.teams.home.team.id),
        awayLogo: getLogo(g.teams.away.team.id),
        homeProbablePitcher: g.probablePitchers?.home?.fullName || "",
        homeProbablePitcherEra: g.probablePitchers?.home?.era || undefined,
        awayProbablePitcher: g.probablePitchers?.away?.fullName || "",
        awayProbablePitcherEra: g.probablePitchers?.away?.era || undefined,
        homeRecord: g.teams.home.leagueRecord ? `${g.teams.home.leagueRecord.wins}-${g.teams.home.leagueRecord.losses}` : "",
        awayRecord: g.teams.away.leagueRecord ? `${g.teams.away.leagueRecord.wins}-${g.teams.away.leagueRecord.losses}` : "",
        weather: weatherArr[i],
      }));
      setGames(mappedGames);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);


  // Poll for live updates every 30 seconds
  useEffect(() => {
    fetchGames();
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(fetchGames, 30000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [selectedDate, fetchGames]);



  const formatTime = (time: string) => time || "";

  return (
    <div className="min-h-screen bg-[var(--background)] py-8 px-4 text-[var(--foreground)] font-sans">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold gradient-text mb-2">📅 Today&apos;s Games</h1>
        <p className="text-body mb-4">View MLB game schedules and scores</p>
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
            {games.map((game) => (
              <GameCard
                key={game.id}
                homeTeam={game.homeTeam}
                homeLogo={game.homeLogo || ""}
                homeRecord={game.homeRecord}
                homeProbablePitcher={game.homeProbablePitcher}
                homeProbablePitcherStats={formatPitcherStats(game.homeProbablePitcherEra)}
                awayTeam={game.awayTeam}
                awayLogo={game.awayLogo || ""}
                awayRecord={game.awayRecord}
                awayProbablePitcher={game.awayProbablePitcher}
                awayProbablePitcherStats={formatPitcherStats(game.awayProbablePitcherEra)}
                startTime={game.startTime}
                stadium={game.stadium}
                weather={game.weather}
                status={game.status}
                inning={game.inning}
                homeScore={game.homeScore}
                awayScore={game.awayScore}
              />
            ))}
          </div>
        )}
      </div>
      <div className="glass rounded-xl shadow-xl p-6 mt-8">
        <h3 className="text-heading mb-4 gradient-text">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/dashboard/lines">
            <div className="modern-card hover:scale-105 transition-transform">
              <div className="text-2xl mb-2 text-[var(--accent-blue)]">📈</div>
              <div className="font-medium gradient-text">Betting Lines</div>
              <div className="text-body">View current odds</div>
            </div>
          </Link>
          <Link href="/dashboard/projections">
            <div className="modern-card hover:scale-105 transition-transform">
              <div className="text-2xl mb-2 text-[var(--accent-blue)]">📊</div>
              <div className="font-medium gradient-text">Projections</div>
              <div className="text-body">See model predictions</div>
            </div>
          </Link>
          <Link href="/dashboard/props">
            <div className="modern-card hover:scale-105 transition-transform">
              <div className="text-2xl mb-2 text-[var(--accent-green)]">🎯</div>
              <div className="font-medium gradient-text">Player Props</div>
              <div className="text-body">Prop bet analysis</div>
            </div>
          </Link>
          <Link href="/chat">
            <div className="modern-card hover:scale-105 transition-transform">
              <div className="text-2xl mb-2 text-[var(--accent-blue)]">🤖</div>
              <div className="font-medium gradient-text">AI Assistant</div>
              <div className="text-body">Get betting insights</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}