import React from "react";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

export interface ChatDataVizProps {
  type: "bar" | "line";
  title?: string;
  labels: string[];
  values: number[];
  color?: string;
}

const ChatDataViz: React.FC<ChatDataVizProps> = ({ type, title, labels, values, color = "#00d4ff" }) => {
  const data = {
    labels,
    datasets: [
      {
        label: title || "Data",
        data: values,
        backgroundColor: type === "bar" ? color : undefined,
        borderColor: color,
        borderWidth: 2,
        pointBackgroundColor: color,
        pointBorderColor: "#fff",
        fill: type === "line",
        tension: 0.3,
        barPercentage: 0.6,
      },
    ],
  };
  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: !!title,
        text: title,
        color: "#fff",
        font: { size: 18 },
      },
      tooltip: {
        backgroundColor: "#222",
        titleColor: color,
        bodyColor: "#fff",
      },
    },
    scales: {
      x: {
        grid: { color: "#222" },
        ticks: { color: "#aaa" },
      },
      y: {
        grid: { color: "#222" },
        ticks: { color: "#aaa" },
      },
    },
  };
  return (
    <div className="rounded-xl bg-[#18181a] p-4 shadow-xl border border-[#222226]">
      {type === "bar" ? <Bar data={data} options={options} /> : <Line data={data} options={options} />}
    </div>
  );
};

export default ChatDataViz;
