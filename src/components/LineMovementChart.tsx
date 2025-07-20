import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

export interface LineMovementPoint {
  time: string;
  odds: number;
  line: number;
  sportsbook: string;
}

interface Props {
  data: LineMovementPoint[];
  market: 'moneyline' | 'spread' | 'total';
  team: string;
}

export default function LineMovementChart({ data, market, team }: Props) {
  return (
    <div className="w-full h-64 glass rounded-xl shadow-xl p-6 bg-[var(--background)] text-[var(--foreground)] font-sans">
      <div className="font-bold mb-3 text-[var(--accent-blue)] text-lg">Line Movement: <span className="text-[var(--accent-green)]">{team}</span> <span className="text-[var(--neutral-gray-3)]">({market})</span></div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--neutral-gray-2)" />
          <XAxis dataKey="time" tick={{ fill: 'var(--accent-blue)' }} axisLine={{ stroke: 'var(--accent-blue)' }} />
          <YAxis tick={{ fill: 'var(--accent-green)' }} axisLine={{ stroke: 'var(--accent-green)' }} />
          <Tooltip contentStyle={{ background: 'var(--bg-secondary)', color: 'var(--accent-blue)', borderRadius: 12, border: '1px solid var(--accent-blue)' }} />
          <Legend wrapperStyle={{ color: 'var(--accent-blue)' }} />
          <Line type="monotone" dataKey="odds" stroke="#00d4ff" name="Odds" strokeWidth={3} dot={{ r: 4, fill: '#00d4ff' }} />
          <Line type="monotone" dataKey="line" stroke="#39ff14" name="Line" strokeWidth={3} dot={{ r: 4, fill: '#39ff14' }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
