import React from "react";
import Image from "next/image";

interface GameCardProps {
  homeTeam: string;
  homeLogo: string;
  homeRecord?: string;
  homeProbablePitcher?: string;
  homeProbablePitcherStats?: string;
  awayTeam: string;
  awayLogo: string;
  awayRecord?: string;
  awayProbablePitcher?: string;
  awayProbablePitcherStats?: string;
  startTime: string;
  stadium: string;
  weather?: { condition?: string; temp?: string; wind?: string };
  status: string;
  inning?: string;
  homeScore?: number;
  awayScore?: number;
}

const GameCard: React.FC<GameCardProps> = ({
  homeTeam,
  homeLogo,
  homeRecord,
  homeProbablePitcher,
  homeProbablePitcherStats,
  awayTeam,
  awayLogo,
  awayRecord,
  awayProbablePitcher,
  awayProbablePitcherStats,
  startTime,
  stadium,
  weather,
  status,
  inning,
  homeScore,
  awayScore,
}) => {
  return (
    <div className="modern-card hover:shadow-2xl transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Image src={awayLogo} alt={awayTeam} width={32} height={32} className="w-8 h-8 rounded-full bg-white" />
          <span className="text-xl font-bold gradient-text drop-shadow-lg">{awayTeam}</span>
        </div>
        <span className="mx-2 text-lg">@</span>
        <div className="flex items-center gap-2">
          <Image src={homeLogo} alt={homeTeam} width={32} height={32} className="w-8 h-8 rounded-full bg-white" />
          <span className="text-xl font-bold gradient-text drop-shadow-lg">{homeTeam}</span>
        </div>
      </div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-muted-foreground">{awayRecord}</span>
        <span className="text-sm font-semibold text-muted-foreground">{homeRecord}</span>
      </div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground">
          {awayProbablePitcher ? `${awayProbablePitcher} ${awayProbablePitcherStats ? `(${awayProbablePitcherStats})` : ''}` : ''}
        </span>
        <span className="text-xs text-muted-foreground">
          {homeProbablePitcher ? `${homeProbablePitcher} ${homeProbablePitcherStats ? `(${homeProbablePitcherStats})` : ''}` : ''}
        </span>
      </div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground">{startTime}</span>
        <span className="text-xs text-muted-foreground">{stadium}</span>
      </div>
      {weather && (
        <div className="flex items-center gap-2 text-xs text-blue-300 mb-2">
          <span>🌤️ {weather.condition || ''}</span>
          <span>🌡️ {weather.temp || ''}</span>
          <span>💨 {weather.wind || ''}</span>
        </div>
      )}
      <div className="flex items-center gap-2 mt-2">
        <span className="px-2 py-1 rounded-full text-xs font-bold bg-[var(--accent-blue)] text-[var(--background)]">{status.toUpperCase()}</span>
        {inning && <span className="text-xs text-yellow-400 font-mono">{inning}</span>}
        {(typeof homeScore === 'number' && typeof awayScore === 'number') && (
          <span className="ml-auto text-lg font-bold text-neon-green">{awayScore} - {homeScore}</span>
        )}
      </div>
    </div>
  );
};

export default GameCard;
