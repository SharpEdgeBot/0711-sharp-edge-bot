import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

type PinnacleOdd = {
  marketType: string;
  oddsValue: number;
  gameId: string | number;
  period: string;
};

export function PinnacleOddsChart({ odds }: { odds: PinnacleOdd[] }) {
  // Flatten odds for charting
  const chartData = odds.map((o, idx) => ({
    idx,
    marketType: o.marketType,
    oddsValue: o.oddsValue,
    gameId: o.gameId,
    period: o.period,
  }));
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="marketType" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="oddsValue" stroke="#ff7300" />
      </LineChart>
    </ResponsiveContainer>
  );
}
