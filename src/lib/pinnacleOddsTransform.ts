// src/lib/pinnacleOddsTransform.ts

import { PinnacleOddsResponse } from './pinnacleApi';
import type { FlexibleRecord } from '@/types';

export interface NormalizedOdds {
  gameId: string;
  marketType: string;
  period: string;
  oddsValue: number;
  teams: string[];
  startTime: string;
  league: string;
  lastUpdated: string;
  betLimit?: number;
}

export function transformPinnacleOdds(raw: PinnacleOddsResponse): NormalizedOdds[] {
  if (!raw || !raw.events) return [];
  const oddsList: NormalizedOdds[] = [];
  // MLB team/league filter logic
  const MLB_LEAGUE_NAMES = [
    'MLB', 'Major League Baseball', 'USA MLB', 'US MLB', 'Baseball MLB', 'MLB Baseball',
    'MLB Regular Season', 'MLB Playoffs', 'MLB World Series', 'MLB Preseason', 'MLB Spring Training'
  ];
  // List of all MLB team names (2025, can be updated as needed)
  const MLB_TEAMS = [
    'Arizona Diamondbacks','Atlanta Braves','Baltimore Orioles','Boston Red Sox','Chicago Cubs','Chicago White Sox','Cincinnati Reds','Cleveland Guardians','Colorado Rockies','Detroit Tigers','Houston Astros','Kansas City Royals','Los Angeles Angels','Los Angeles Dodgers','Miami Marlins','Milwaukee Brewers','Minnesota Twins','New York Yankees','New York Mets','Oakland Athletics','Philadelphia Phillies','Pittsburgh Pirates','San Diego Padres','San Francisco Giants','Seattle Mariners','St. Louis Cardinals','Tampa Bay Rays','Texas Rangers','Toronto Blue Jays','Washington Nationals'
  ];
  for (const eventRaw of raw.events) {
    // Use FlexibleRecord for event object to allow dynamic keys
    const event = eventRaw as FlexibleRecord;
    const leagueName = String(event.league_name ?? event.league ?? '').trim();
    const homeTeam = String(event.home_team ?? event.home ?? '').trim();
    const awayTeam = String(event.away_team ?? event.away ?? '').trim();
    // Only process MLB events
    if (
      !MLB_LEAGUE_NAMES.some(l => leagueName.toLowerCase().includes(l.toLowerCase())) &&
      (!MLB_TEAMS.includes(homeTeam) || !MLB_TEAMS.includes(awayTeam))
    ) {
      continue;
    }
    const lastUpdatedStr = (raw.last || raw.last_call || '').toString();
    // Try to extract bet limit from event or period (common Pinnacle API keys: bet_limit, max_bet, etc.)
    const extractBetLimit = (obj: FlexibleRecord): number | undefined => {
      if (typeof obj.bet_limit === 'number') return obj.bet_limit;
      if (typeof obj.max_bet === 'number') return obj.max_bet;
      if (typeof obj.maxBet === 'number') return obj.maxBet;
      return undefined;
    };
    const base = {
      gameId: event.event_id?.toString() ?? '',
      teams: [homeTeam, awayTeam],
      startTime: String(event.starts ?? event.start_time ?? ''),
      league: leagueName,
      lastUpdated: lastUpdatedStr,
      period: 'num_0', // default to full game
      betLimit: extractBetLimit(event),
    };

    // Parse odds from periods (num_0 = full game, num_1 = 1st half, num_3 = 1st inning, etc.)
    if (event.periods && typeof event.periods === 'object') {
      for (const [periodKey, periodObjRaw] of Object.entries(event.periods)) {
        const periodObj = periodObjRaw as FlexibleRecord;
        // Moneyline
        if (periodObj.money_line) {
          const moneyLine = periodObj.money_line as FlexibleRecord;
          const betLimit = extractBetLimit(periodObj) ?? extractBetLimit(moneyLine) ?? base.betLimit;
          if (moneyLine.home !== undefined) {
            oddsList.push({
              ...base,
              period: periodKey,
              marketType: 'moneyline_home',
              oddsValue: Number(moneyLine.home),
              betLimit,
            });
          }
          if (moneyLine.away !== undefined) {
            oddsList.push({
              ...base,
              period: periodKey,
              marketType: 'moneyline_away',
              oddsValue: Number(moneyLine.away),
              betLimit,
            });
          }
          if (moneyLine.draw !== undefined && moneyLine.draw !== null) {
            oddsList.push({
              ...base,
              period: periodKey,
              marketType: 'moneyline_draw',
              oddsValue: Number(moneyLine.draw),
              betLimit,
            });
          }
        }
        // Spreads
        if (periodObj.spreads && typeof periodObj.spreads === 'object') {
          for (const [hdp, spreadObjRaw] of Object.entries(periodObj.spreads)) {
            const spreadObj = spreadObjRaw as FlexibleRecord;
            if (spreadObj.home !== undefined) {
              oddsList.push({
                ...base,
                period: periodKey,
                marketType: `spread_home_${hdp}`,
                oddsValue: Number(spreadObj.home),
              });
            }
            if (spreadObj.away !== undefined) {
              oddsList.push({
                ...base,
                period: periodKey,
                marketType: `spread_away_${hdp}`,
                oddsValue: Number(spreadObj.away),
              });
            }
          }
        }
        // Totals (skip Hits + Runs + Errors market)
        if (periodObj.totals && typeof periodObj.totals === 'object') {
          for (const [points, totalObjRaw] of Object.entries(periodObj.totals)) {
            // Exclude H+R+E market (often labeled as 'h+r+e', 'hre', or similar)
            if (typeof points === 'string' && /h\+?r\+?e|hre/i.test(points)) continue;
            const totalObj = totalObjRaw as FlexibleRecord;
            if (totalObj.over !== undefined) {
              oddsList.push({
                ...base,
                period: periodKey,
                marketType: `total_over_${points}`,
                oddsValue: Number(totalObj.over),
              });
            }
            if (totalObj.under !== undefined) {
              oddsList.push({
                ...base,
                period: periodKey,
                marketType: `total_under_${points}`,
                oddsValue: Number(totalObj.under),
              });
            }
          }
        }
        // Team totals
        if (periodObj.team_total && typeof periodObj.team_total === 'object') {
          const teamTotal = periodObj.team_total as FlexibleRecord;
          if (teamTotal.home) {
            const homeTotal = teamTotal.home as FlexibleRecord;
            if (homeTotal.over !== undefined) {
              oddsList.push({
                ...base,
                period: periodKey,
                marketType: `team_total_home_over_${homeTotal.points}`,
                oddsValue: Number(homeTotal.over),
              });
            }
            if (homeTotal.under !== undefined) {
              oddsList.push({
                ...base,
                period: periodKey,
                marketType: `team_total_home_under_${homeTotal.points}`,
                oddsValue: Number(homeTotal.under),
              });
            }
          }
          if (teamTotal.away) {
            const awayTotal = teamTotal.away as FlexibleRecord;
            if (awayTotal.over !== undefined) {
              oddsList.push({
                ...base,
                period: periodKey,
                marketType: `team_total_away_over_${awayTotal.points}`,
                oddsValue: Number(awayTotal.over),
              });
            }
            if (awayTotal.under !== undefined) {
              oddsList.push({
                ...base,
                period: periodKey,
                marketType: `team_total_away_under_${awayTotal.points}`,
                oddsValue: Number(awayTotal.under),
              });
            }
          }
        }
      }
    }
  }
  return oddsList;
}
