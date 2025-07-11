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
    <div className="w-full h-64 bg-white rounded-lg shadow p-4">
      <div className="font-bold mb-2">Line Movement: {team} ({market})</div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" tick={{ fill: '#222' }} />
          <YAxis tick={{ fill: '#222' }} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="odds" stroke="#2563eb" name="Odds" />
          <Line type="monotone" dataKey="line" stroke="#16a34a" name="Line" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
