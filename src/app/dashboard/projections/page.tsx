"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import mlbTeams from '@/data/mlb_teams.json';
import { buildGameContext } from '@/utils/buildGameContext';


interface Offer {
  offerType: 'moneyline' | 'over' | 'under';
  oddsAmerican: number;
  line?: number;
  sportsbook: string;
  isHomeTeam?: boolean;
}

interface GameOdds {
  id: string;
  home_display: string;
  away_display: string;
  gamelines?: {
    offers: Offer[];
  };
  statContext?: StatContext;
}

interface RawOdds {
  gameId: string;
  teams?: string[];
  homeTeam?: string;
  awayTeam?: string;
  marketType: string;
  oddsValue: number;
}

interface StatContext {
  recent_form?: {
    home?: { last_10_games?: { wins: number; losses: number } };
    away?: { last_10_games?: { wins: number; losses: number } };
  };
  pitcher_matchup?: {
    home_pitcher?: { era?: number };
    away_pitcher?: { era?: number };
  };
  home_team?: { offense?: { wOBA?: number } };
  away_team?: { offense?: { wOBA?: number } };
}


export default function ProbabilityDashboard() {
  const [games, setGames] = useState<GameOdds[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProjections() {
      setLoading(true);
      setError(null);
      try {
        // Fetch odds data (replace with actual fetch as needed)
        const res = await fetch('/api/data/mlb/odds');
        if (!res.ok) throw new Error('Failed to fetch odds');
        const data = await res.json();
        const grouped: Record<string, GameOdds> = {};
        (data as unknown[]).forEach((_o) => {
          const o = _o as RawOdds;
          const id = o.gameId;
          if (!grouped[id]) {
            grouped[id] = {
              id,
              home_display: o.teams?.[0] || o.homeTeam || '',
              away_display: o.teams?.[1] || o.awayTeam || '',
              gamelines: { offers: [] },
            };
          }
          if (["moneyline_home","moneyline_away","total_over_8.5","total_under_8.5"].includes(o.marketType)) {
            if (o.marketType.startsWith('moneyline')) {
              grouped[id].gamelines!.offers.push({
                offerType: 'moneyline',
                oddsAmerican: o.oddsValue,
                sportsbook: 'pinnacle',
                isHomeTeam: o.marketType === 'moneyline_home',
              });
            } else if (o.marketType.startsWith('total_over')) {
              grouped[id].gamelines!.offers.push({
                offerType: 'over',
                oddsAmerican: o.oddsValue,
                sportsbook: 'pinnacle',
                line: parseFloat(o.marketType.split('_').pop() || '0'),
              });
            } else if (o.marketType.startsWith('total_under')) {
              grouped[id].gamelines!.offers.push({
                offerType: 'under',
                oddsAmerican: o.oddsValue,
                sportsbook: 'pinnacle',
                line: parseFloat(o.marketType.split('_').pop() || '0'),
              });
            }
          }
        });
        // For each grouped game, fetch stat context and blend
        const gameArr = Object.values(grouped);
        const blendedGames = await Promise.all(gameArr.map(async (game) => {
          let statContext: StatContext | undefined = undefined;
          try {
            statContext = await buildGameContext(game.id) as StatContext;
          } catch (_e) {
            // fallback: skip stat blend
          }
          return { ...game, statContext };
        }));
        setGames(blendedGames);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching projections:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch projections');
        setLoading(false);
      }
    }
    fetchProjections();
  }, []);

  // Calculate implied probability from American odds
  const getWinProb = (price: number) => {
    if (price > 0) {
      return 100 / (price + 100);
    } else {
      return Math.abs(price) / (Math.abs(price) + 100);
    }
  };

  // Normalize two probabilities so they sum to 1 (remove vig)


  // Blend odds and stats (e.g., 70% odds, 30% stats)
  // blendProbs is unused, remove it

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800 p-8 text-white font-sans">
      <h1 className="text-4xl font-extrabold gradient-text mb-4 drop-shadow-lg">Probability Dashboard</h1>
      <p className="text-lg text-gray-300 mb-8">Implied probabilities for MLB games, calculated from Pinnacle odds and devigged for accuracy.</p>
      {loading ? (
        <div className="glassmorphic-card rounded-xl shadow-xl p-8 text-center text-lg">Loading projections...</div>
      ) : error ? (
        <div className="glassmorphic-card rounded-xl shadow-xl p-8 text-[var(--accent-red)] text-center">{error}</div>
      ) : (
        <div className="glassmorphic-card p-6 rounded-2xl shadow-xl">
          <div className="font-bold mb-4 text-2xl gradient-text">Live AI Projections</div>
          <div className="overflow-x-auto">
            <table className="modern-table w-full text-left">
              <thead>
                <tr className="border-b border-zinc-700">
                  <th className="py-2 px-3">Game</th>
                  <th className="py-2 px-3">Home Win %</th>
                  <th className="py-2 px-3">Away Win %</th>
                  <th className="py-2 px-3">O/U (8.5)</th>
                </tr>
              </thead>
              <tbody>
                {games
                  .filter((game) => {
                    // Exclude H+R+E and non-MLB team markets
                    const isHRE = /hits\+runs\+errors|h\+r\+e|hre/i.test(game.home_display) || /hits\+runs\+errors|h\+r\+e|hre/i.test(game.away_display);
                    const isRunsSummary = /runs \(\d+ games\)/i.test(game.home_display) || /runs \(\d+ games\)/i.test(game.away_display);
                    return !isHRE && !isRunsSummary;
                  })
                  .map((game) => {
                    const homeMoney = game.gamelines?.offers.find((o) => o.offerType === 'moneyline' && o.isHomeTeam);
                    const awayMoney = game.gamelines?.offers.find((o) => o.offerType === 'moneyline' && !o.isHomeTeam);
                    const over = game.gamelines?.offers.find((o) => o.offerType === 'over');
                    const under = game.gamelines?.offers.find((o) => o.offerType === 'under');
                    // Calculate implied probabilities from Pinnacle odds and devig
                    let homeProb = homeMoney ? getWinProb(homeMoney.oddsAmerican) : 0.5;
                    let awayProb = awayMoney ? getWinProb(awayMoney.oddsAmerican) : 0.5;
                    // Devig using the sum of implied probabilities
                    const vig = homeProb + awayProb;
                    if (vig > 0) {
                      homeProb = homeProb / vig;
                      awayProb = awayProb / vig;
                    }
                    // Get team logos
                    const getLogo = (teamName: string) => {
                      const team = mlbTeams.find((t) => t.name.toLowerCase() === teamName.toLowerCase());
                      return team ? team.logo : '';
                    };
                    const homeLogo = getLogo(game.home_display);
                    const awayLogo = getLogo(game.away_display);
                    return (
                      <tr key={game.id} className="border-b border-zinc-800 hover:bg-zinc-900/40 transition">
                        <td className="py-2 px-3 font-semibold flex items-center gap-2">
                          {awayLogo && (
                            <Image src={awayLogo} alt={game.away_display} width={24} height={24} className="w-6 h-6 rounded-full bg-white" />
                          )}
                          {game.away_display} @
                          {homeLogo && (
                            <Image src={homeLogo} alt={game.home_display} width={24} height={24} className="w-6 h-6 rounded-full bg-white" />
                          )}
                          {game.home_display}
                        </td>
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-2">
                            <span>{(homeProb * 100).toFixed(1)}%</span>
                            <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden w-32">
                              <div className="h-2 bg-blue-400" style={{ width: `${homeProb * 100}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-2">
                            <span>{(awayProb * 100).toFixed(1)}%</span>
                            <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden w-32">
                              <div className="h-2 bg-pink-400" style={{ width: `${awayProb * 100}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="py-2 px-3">
                          {over && under ? (
                            <span>
                              Over: {over.line} ({over.oddsAmerican})<br />
                              Under: {under.line} ({under.oddsAmerican})
                            </span>
                          ) : '-'}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <style jsx global>{`
        .glassmorphic-card {
          background: rgba(24, 24, 32, 0.7);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
          backdrop-filter: blur(8px) saturate(180%);
          -webkit-backdrop-filter: blur(8px) saturate(180%);
          border-radius: 1.5rem;
          border: 1px solid rgba(255,255,255,0.08);
        }
        .gradient-text {
          background: linear-gradient(90deg, #60a5fa, #a78bfa, #f472b6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-fill-color: transparent;
        }
      `}</style>
    </div>
  );
}
