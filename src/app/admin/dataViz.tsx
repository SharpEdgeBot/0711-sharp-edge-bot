import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from 'recharts';

type GameProcessed = { gamePk: number; idx: number };
type StatusRecord = { status: string };

export function GamesProcessedChart({ data }: { data: GameProcessed[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="gamePk" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="idx" stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function StatusBarChart({ data }: { data: StatusRecord[] }) {
  // Example: Bar chart of success/error counts
  const statusCounts = data.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const chartData = Object.entries(statusCounts).map(([status, count]) => ({ status, count }));
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="status" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="count" fill="#82ca9d" />
      </BarChart>
    </ResponsiveContainer>
  );
}
