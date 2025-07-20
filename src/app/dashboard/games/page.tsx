"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

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

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    fetchGames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const fetchGames = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/data/mlb?action=schedule&startDate=${selectedDate}&endDate=${selectedDate}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch games");
      }
      let gamesArr: any[] = [];
      if (Array.isArray(data.games)) {
        gamesArr = data.games;
      } else if (Array.isArray(data)) {
        gamesArr = data;
      } else if (Array.isArray(data.dates)) {
        gamesArr = data.dates.flatMap((d: any) => d.games || []);
      }
      const mappedGames = gamesArr.map((g: any) => ({
        id: g.gamePk,
        date: g.gameDate || g.date,
        homeTeam: g.teams?.home?.team?.name,
        homeTeamId: g.teams?.home?.team?.id,
        awayTeam: g.teams?.away?.team?.name,
        awayTeamId: g.teams?.away?.team?.id,
        status: g.status?.abstractGameState?.toLowerCase() || "scheduled",
        homeScore: g.teams?.home?.score,
        awayScore: g.teams?.away?.score,
        inning: g.linescore?.currentInning ? `Inning ${g.linescore.currentInning}` : undefined,
        stadium: g.venue?.name,
        startTime: g.gameDate ? new Date(g.gameDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
        homeProbablePitcher: g.probablePitchers?.home?.fullName ?? "",
        homeProbablePitcherEra: g.probablePitchers?.home?.era ?? "",
        awayProbablePitcher: g.probablePitchers?.away?.fullName ?? "",
        awayProbablePitcherEra: g.probablePitchers?.away?.era ?? "",
        homeRecord: g.teams?.home?.leagueRecord ? `${g.teams.home.leagueRecord.wins}-${g.teams.home.leagueRecord.losses}` : "",
        awayRecord: g.teams?.away?.leagueRecord ? `${g.teams.away.leagueRecord.wins}-${g.teams.away.leagueRecord.losses}` : "",
      }));
      setGames(mappedGames);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time: string) => time || "";

  return (
    <div className="min-h-screen bg-[var(--background)] py-8 px-4 text-[var(--foreground)] font-sans">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold gradient-text mb-2">📅 Today's Games</h1>
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
              <span className="mr-2">�</span>
              <p className="text-body">No MLB games scheduled for {new Date(selectedDate).toLocaleDateString()}</p>
            </div>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            {games.map((game) => (
              <div key={game.id} className="modern-card hover:shadow-2xl transition-shadow">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xl font-bold gradient-text drop-shadow-lg">{game.awayTeam}</span>
                    <span className="mx-2 text-lg">@</span>
                    <span className="text-xl font-bold gradient-text drop-shadow-lg">{game.homeTeam}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-muted-foreground">{game.awayRecord}</span>
                    <span className="text-sm font-semibold text-muted-foreground">{game.homeRecord}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-muted-foreground">{game.awayProbablePitcher ? `${game.awayProbablePitcher} (ERA: ${game.awayProbablePitcherEra})` : ""}</span>
                    <span className="text-sm font-semibold text-muted-foreground">{game.homeProbablePitcher ? `${game.homeProbablePitcher} (ERA: ${game.homeProbablePitcherEra})` : ""}</span>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    <div>{formatTime(game.startTime)}</div>
                    <div>{game.stadium}</div>
                    <div>{game.inning}</div>
                    <span className="px-2 py-1 rounded-full text-xs font-bold bg-[var(--accent-blue)] text-[var(--background)]">{game.status.toUpperCase()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="glass rounded-xl shadow-xl p-6 mt-8">
        <h3 className="text-heading mb-4 gradient-text">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/dashboard/lines">
            <div className="modern-card hover:scale-105 transition-transform">
              <div className="text-2xl mb-2 text-[var(--accent-blue)]">�</div>
              <div className="font-medium gradient-text">Betting Lines</div>
              <div className="text-body">View current odds</div>
            </div>
          </Link>
          <Link href="/dashboard/projections">
            <div className="modern-card hover:scale-105 transition-transform">
              <div className="text-2xl mb-2 text-[var(--accent-blue)]">�</div>
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