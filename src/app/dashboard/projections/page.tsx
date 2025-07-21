"use client";

import React, { useEffect, useState } from 'react';
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
}

export default function ProbabilityDashboard() {

  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    // Fetch odds as before, but also fetch/calculate stat context for each game
    fetch('/api/data/mlb/odds')
      .then((res: Response) => res.json())
      .then(async (data: any[]) => {
        // Group by gameId
        const grouped: Record<string, GameOdds> = {};
        data.forEach((o) => {
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
                line: parseFloat(o.marketType.split('_').pop()),
              });
            } else if (o.marketType.startsWith('total_under')) {
              grouped[id].gamelines!.offers.push({
                offerType: 'under',
                oddsAmerican: o.oddsValue,
                sportsbook: 'pinnacle',
                line: parseFloat(o.marketType.split('_').pop()),
              });
            }
          }
        });
        // For each grouped game, fetch stat context and blend
        const gameArr = Object.values(grouped);
        const blendedGames = await Promise.all(gameArr.map(async (game) => {
          // Try to get stat context (cached)
          let statContext: any = null;
          try {
            statContext = await buildGameContext(game.id);
          } catch (e) {
            // fallback: skip stat blend
          }
          return { ...game, statContext };
        }));
        setGames(blendedGames);
        setLoading(false);
      })
      .catch((err: unknown) => {
        console.error('Error fetching projections:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch projections');
        setLoading(false);
      });
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
  const normalizeProbs = (homeProb: number, awayProb: number) => {
    const total = homeProb + awayProb;
    if (total === 0) return [0.5, 0.5];
    return [homeProb / total, awayProb / total];
  };

  // Calculate stat-based edge (simple: recent form, pitcher ERA, team wOBA)
  function getStatEdge(statContext: any): [number, number] {
    if (!statContext) return [0.5, 0.5];
    // Example: use last 10 games win%, pitcher ERA, team wOBA
    const homeForm = statContext.recent_form?.home?.last_10_games;
    const awayForm = statContext.recent_form?.away?.last_10_games;
    const homePitcher = statContext.pitcher_matchup?.home_pitcher;
    const awayPitcher = statContext.pitcher_matchup?.away_pitcher;
    const homeTeam = statContext.home_team;
    const awayTeam = statContext.away_team;
    // Win %
    const homeWinPct = homeForm ? homeForm.wins / (homeForm.wins + homeForm.losses) : 0.5;
    const awayWinPct = awayForm ? awayForm.wins / (awayForm.wins + awayForm.losses) : 0.5;
    // Pitcher ERA (lower is better)
    const homeERA = homePitcher?.era || 4.0;
    const awayERA = awayPitcher?.era || 4.0;
    // Team wOBA (higher is better)
    const homeWOBA = homeTeam?.offense?.wOBA || 0.320;
    const awayWOBA = awayTeam?.offense?.wOBA || 0.320;
    // Simple scoring: each factor 1/3 weight
    let homeScore = 0.33 * homeWinPct + 0.33 * (awayERA / (homeERA + awayERA)) + 0.34 * (homeWOBA / (homeWOBA + awayWOBA));
    let awayScore = 0.33 * awayWinPct + 0.33 * (homeERA / (homeERA + awayERA)) + 0.34 * (awayWOBA / (homeWOBA + awayWOBA));
    // Normalize
    const total = homeScore + awayScore;
    if (total === 0) return [0.5, 0.5];
    return [homeScore / total, awayScore / total];
  }

  // Blend odds and stats (e.g., 70% odds, 30% stats)
  function blendProbs(oddsProb: number, statProb: number, weight = 0.7) {
    return weight * oddsProb + (1 - weight) * statProb;
  }

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
                    const homeMoney = game.gamelines?.offers.find((o: any) => o.offerType === 'moneyline' && o.isHomeTeam);
                    const awayMoney = game.gamelines?.offers.find((o: any) => o.offerType === 'moneyline' && !o.isHomeTeam);
                    const over = game.gamelines?.offers.find((o: any) => o.offerType === 'over');
                    const under = game.gamelines?.offers.find((o: any) => o.offerType === 'under');
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
                          {awayLogo && <img src={awayLogo} alt={game.away_display} className="w-6 h-6 rounded-full bg-white" />}
                          {game.away_display} @
                          {homeLogo && <img src={homeLogo} alt={game.home_display} className="w-6 h-6 rounded-full bg-white" />}
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
