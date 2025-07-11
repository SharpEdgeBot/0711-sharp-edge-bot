'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';

interface Game {
  id: string;
  date: string;
  homeTeam: string;
  homeTeamId?: number;
  awayTeam: string;
  awayTeamId?: number;
  status: 'scheduled' | 'live' | 'final';
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
  const [darkMode, setDarkMode] = useState(false);
  const { user } = useUser();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  useEffect(() => {
    fetchGames();
  }, [selectedDate]);

  const fetchGames = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/data/mlb?action=schedule&startDate=${selectedDate}&endDate=${selectedDate}`);
      const data = await response.json();

      console.log('API response:', data); // Inspect shape

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch games');
      }

      // Robustly handle array shape
      let gamesArr: any[] = [];
      if (Array.isArray(data.games)) {
        gamesArr = data.games;
      } else if (Array.isArray(data)) {
        gamesArr = data;
      } else if (Array.isArray(data.dates)) {
        // MLB API schedule endpoint returns { dates: [{ games: [...] }, ...] }
        gamesArr = data.dates.flatMap((d: any) => d.games || []);
      }

      // Map MLB API game objects to expected frontend structure
      const mappedGames = gamesArr.map((g: any) => ({
        id: g.gamePk,
        date: g.gameDate || g.date,
        homeTeam: g.teams?.home?.team?.name,
        homeTeamId: g.teams?.home?.team?.id,
        awayTeam: g.teams?.away?.team?.name,
        awayTeamId: g.teams?.away?.team?.id,
        status: g.status?.abstractGameState?.toLowerCase() || 'scheduled',
        homeScore: g.teams?.home?.score,
        awayScore: g.teams?.away?.score,
        inning: g.linescore?.currentInning ? `Inning ${g.linescore.currentInning}` : undefined,
        stadium: g.venue?.name,
        startTime: g.gameDate,
        homeLogo: `https://www.mlbstatic.com/team-logos/${g.teams?.home?.team?.id}.svg`,
        awayLogo: `https://www.mlbstatic.com/team-logos/${g.teams?.away?.team?.id}.svg`,
        homeProbablePitcher: g.probablePitchers?.home?.fullName,
        homeProbablePitcherEra: g.probablePitchers?.home?.era,
        awayProbablePitcher: g.probablePitchers?.away?.fullName,
        awayProbablePitcherEra: g.probablePitchers?.away?.era,
        homeRecord: g.teams?.home?.leagueRecord ? `${g.teams.home.leagueRecord.wins}-${g.teams.home.leagueRecord.losses}` : '',
        awayRecord: g.teams?.away?.leagueRecord ? `${g.teams.away.leagueRecord.wins}-${g.teams.away.leagueRecord.losses}` : '',
      }));
      setGames(mappedGames);
    } catch (error) {
      console.error('Failed to fetch games:', error);
      setError(error instanceof Error ? error.message : 'Failed to load games');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return 'bg-red-100 text-red-800';
      case 'final':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const formatTime = (timeString: string) => {
    try {
      return new Date(timeString).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return timeString;
    }
  };

  return (
    <div className={`space-y-6 ${darkMode ? 'bg-gray-900 min-h-screen' : 'bg-white min-h-screen'}`}> 
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>📅 Today's Games</h1>
          <p className={`${darkMode ? 'text-gray-300' : 'text-black'}`}>View MLB game schedules and scores</p>
        </div>

        <div className="flex items-center space-x-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className={`px-3 py-2 border ${darkMode ? 'border-blue-800 bg-gray-800 text-white' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          />
          <button
            onClick={fetchGames}
            className={`px-4 py-2 ${darkMode ? 'bg-blue-800 text-white hover:bg-blue-900' : 'bg-blue-500 text-white hover:bg-blue-600'} rounded-md transition-colors`}
          >
            Refresh
          </button>
          <button
            onClick={() => setDarkMode((d) => !d)}
            className={`px-4 py-2 ${darkMode ? 'bg-white text-gray-900 hover:bg-gray-200' : 'bg-gray-900 text-white hover:bg-gray-800'} rounded-md transition-colors ml-2`}
          >
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-8`}>
          <div className="flex items-center justify-center">
            <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            <span className={`ml-3 ${darkMode ? 'text-gray-300' : 'text-black'}`}>Loading games...</span>
          </div>
        </div>
      ) : error ? (
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-8`}>
          <div className="text-center">
            <div className="text-red-500 text-xl mb-2">⚠️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Games</h3>
            <p className={`${darkMode ? 'text-gray-300' : 'text-black'} mb-4`}>{error}</p>
            <button
              onClick={fetchGames}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : games.length === 0 ? (
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-8`}>
          <div className="text-center">
            <div className="text-gray-400 text-4xl mb-4">⚾</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Games Today</h3>
            <p className={`${darkMode ? 'text-gray-300' : 'text-black'}`}>
              No MLB games scheduled for {new Date(selectedDate).toLocaleDateString()}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {games.map((game) => (
            <div key={game.id} className={`${darkMode ? 'bg-gray-900' : 'bg-white'} rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow`}>
              <div className="flex items-center justify-between">
                {/* Teams and Score */}
                <div className="flex-1">
                  <div className="flex items-center space-x-6">
                    {/* Away Team */}
                    <div className="flex items-center space-x-2">
                      <img src={game.awayLogo} alt={game.awayTeam} className="h-8 w-8" />
                      <span className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} drop-shadow-lg`}>{game.awayTeam}</span>
                      {game.status === 'final' || game.status === 'live' ? (
                        <span className="text-2xl font-bold text-blue-300">{game.awayScore}</span>
                      ) : null}
                    </div>
                    <div className="text-gray-400 text-lg font-bold">@</div>
                    {/* Home Team */}
                    <div className="flex items-center space-x-2">
                      <img src={game.homeLogo} alt={game.homeTeam} className="h-8 w-8" />
                      <span className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} drop-shadow-lg`}>{game.homeTeam}</span>
                      {game.status === 'final' || game.status === 'live' ? (
                        <span className="text-2xl font-bold text-blue-300">{game.homeScore}</span>
                      ) : null}
                    </div>
                  </div>
                  {/* Team Records */}
                  <div className="flex items-center space-x-6 mt-2">
                    <span className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-black'}`}>{game.awayRecord}</span>
                    <span className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-black'}`}>{game.homeRecord}</span>
                  </div>
                  {/* Probable Pitchers */}
                  <div className="flex items-center space-x-6 mt-2">
                    <span className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-black'}`}>{game.awayProbablePitcher ? `${game.awayProbablePitcher} (ERA: ${game.awayProbablePitcherEra ?? 'N/A'})` : 'Probable pitcher N/A'}</span>
                    <span className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-black'}`}>{game.homeProbablePitcher ? `${game.homeProbablePitcher} (ERA: ${game.homeProbablePitcherEra ?? 'N/A'})` : 'Probable pitcher N/A'}</span>
                  </div>
                  <div className={`mt-2 text-sm ${darkMode ? 'text-gray-300' : 'text-black'}`}> 
                    <div>{game.stadium}</div>
                    {game.status === 'scheduled' && (
                      <div>{formatTime(game.startTime)}</div>
                    )}
                    {game.status === 'live' && game.inning && (
                      <div>🔴 Live - {game.inning}</div>
                    )}
                  </div>
                </div>

                {/* Status and Actions */}
                <div className="flex flex-col items-end space-y-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(game.status)} ${darkMode ? 'bg-blue-800 text-white' : 'bg-blue-100 text-blue-800'}`}>
                    {game.status.charAt(0).toUpperCase() + game.status.slice(1)}
                  </span>
                  <div className="flex space-x-2">
                    <Link
                      href={`/dashboard/games/${game.id}`}
                      className="text-sm text-blue-300 hover:text-blue-400 font-bold"
                    >
                      View Details
                    </Link>
                    <Link
                      href={`/chat?gameId=${game.id}`}
                      className="text-sm text-green-300 hover:text-green-400 font-bold"
                    >
                      Ask AI
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-6`}>
        <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/dashboard/lines"
            className={`p-4 border ${darkMode ? 'border-blue-900 bg-gray-900 hover:bg-blue-900' : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 bg-white'} rounded-lg transition-colors`}
          >
            <div className="text-center">
              <div className={`text-2xl mb-2 ${darkMode ? 'text-blue-200' : 'text-blue-600'}`}>📊</div>
              <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Betting Lines</div>
              <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-black'}`}>View current odds</div>
            </div>
          </Link>
          <Link
            href="/dashboard/props"
            className={`p-4 border ${darkMode ? 'border-blue-900 bg-gray-900 hover:bg-blue-900' : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 bg-white'} rounded-lg transition-colors`}
          >
            <div className="text-center">
              <div className={`text-2xl mb-2 ${darkMode ? 'text-green-200' : 'text-green-600'}`}>🎯</div>
              <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Player Props</div>
              <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-black'}`}>Prop bet analysis</div>
            </div>
          </Link>
          <Link
            href="/chat"
            className={`p-4 border ${darkMode ? 'border-blue-900 bg-gray-900 hover:bg-blue-900' : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 bg-white'} rounded-lg transition-colors`}
          >
            <div className="text-center">
              <div className={`text-2xl mb-2 ${darkMode ? 'text-purple-200' : 'text-purple-600'}`}>🤖</div>
              <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>AI Assistant</div>
              <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-black'}`}>Get betting insights</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
