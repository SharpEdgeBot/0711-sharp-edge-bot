import fs from 'fs';

function parseOdds(filePath: string) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const games = data.events.map((event: unknown) => {
    if (typeof event !== 'object' || event === null) return null;
    const e = event as Record<string, unknown>;
    let gamePeriod: unknown = undefined;
    let firstInning: unknown = undefined;
    if (e.periods && typeof e.periods === 'object') {
      const periods = e.periods as Record<string, unknown>;
      if ('num_0' in periods && typeof periods['num_0'] === 'object' && periods['num_0'] !== null) {
        gamePeriod = periods['num_0'];
      }
      if ('num_3' in periods && typeof periods['num_3'] === 'object' && periods['num_3'] !== null) {
        firstInning = periods['num_3'];
      }
    }
    // Type guards for gamePeriod and firstInning
    const getSafe = <T>(obj: unknown, path: string[]): T | null => {
      let curr: unknown = obj;
      for (const key of path) {
        if (typeof curr === 'object' && curr !== null && key in curr) {
          curr = (curr as Record<string, unknown>)[key];
        } else {
          return null;
        }
      }
      return curr as T;
    };
    return {
      eventId: e.event_id,
      home: e.home,
      away: e.away,
      startTime: e.starts,
      moneyline: {
        home: getSafe<number>(gamePeriod, ['money_line', 'home']),
        away: getSafe<number>(gamePeriod, ['money_line', 'away'])
      },
      spread: {
        line: -1.5,
        home: getSafe<number>(gamePeriod, ['spreads', '-1.5', 'home']),
        away: getSafe<number>(gamePeriod, ['spreads', '-1.5', 'away'])
      },
      total: {
        line: 8.5,
        over: getSafe<number>(gamePeriod, ['totals', '8.5', 'over']),
        under: getSafe<number>(gamePeriod, ['totals', '8.5', 'under'])
      },
      yrfi: {
        over: getSafe<number>(firstInning, ['totals', '0.5', 'over']),
        under: getSafe<number>(firstInning, ['totals', '0.5', 'under'])
      }
    };
  }).filter(Boolean);
  fs.writeFileSync('./public/data/mlb-odds-mainlines.json', JSON.stringify(games, null, 2));
}

parseOdds('./pinnacle_odds.json');
