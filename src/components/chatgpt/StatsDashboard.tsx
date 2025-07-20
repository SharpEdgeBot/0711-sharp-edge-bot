"use client";
import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const StatsDashboard: React.FC<{ stats: Record<string, number> }> = ({ stats }) => {
  const labels = Object.keys(stats);
  const data = {
    labels,
    datasets: [
      {
        label: "Stat Value",
        data: Object.values(stats),
        backgroundColor: ["#00d4ff", "#39ff14", "#ff6b35", "#ffd700", "#23272f"],
      },
    ],
  };
  return (
    <div className="bg-[#23272f] rounded-2xl p-4 shadow-lg mb-4">
      <h3 className="font-bold text-lg text-white mb-2">Key Stats</h3>
      <Bar data={data} options={{ responsive: true, plugins: { legend: { display: false } } }} />
    </div>
  );
};

export default StatsDashboard;
