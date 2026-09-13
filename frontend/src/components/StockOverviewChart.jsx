import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

export default function StockOverviewChart({ stockOverview }) {
  const data = {
    labels: stockOverview.map((d) => d.month),
    datasets: [
      {
        label: "Stock In",
        data: stockOverview.map((d) => d.stockIn),
        backgroundColor: "#60a5fa",
        borderRadius: 4,
        maxBarThickness: 18,
      },
      {
        label: "Stock Out",
        data: stockOverview.map((d) => d.stockOut),
        backgroundColor: "#c4b5fd",
        borderRadius: 4,
        maxBarThickness: 18,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { mode: "index", intersect: false },
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: "#f1f5f9" }, beginAtZero: true },
    },
  };

  return (
    <div className="h-64">
      <Bar data={data} options={options} />
    </div>
  );
}
