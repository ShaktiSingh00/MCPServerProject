import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

export default function MonthlyPurchaseChart({ monthlySummary }) {
  const data = {
    labels: monthlySummary.map((m) => m.label),
    datasets: [
      {
        data: monthlySummary.map((m) => m.total),
        backgroundColor: "#22c55e",
        borderRadius: 4,
        maxBarThickness: 28,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: { label: (ctx) => `₹${ctx.raw.toLocaleString("en-IN")}` },
      },
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: "#f1f5f9" }, ticks: { callback: (v) => `₹${v.toLocaleString("en-IN")}` } },
    },
  };

  return (
    <div className="h-64">
      <Bar data={data} options={options} />
    </div>
  );
}
