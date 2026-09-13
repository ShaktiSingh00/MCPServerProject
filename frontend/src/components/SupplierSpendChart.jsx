import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

export default function SupplierSpendChart({ supplierSpend }) {
  const data = {
    labels: supplierSpend.map((s) => s.supplier),
    datasets: [
      {
        data: supplierSpend.map((s) => s.total),
        backgroundColor: "#3b82f6",
        borderRadius: 4,
        maxBarThickness: 22,
      },
    ],
  };

  const options = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: { label: (ctx) => `₹${ctx.raw.toLocaleString("en-IN")}` },
      },
    },
    scales: {
      x: { grid: { color: "#f1f5f9" }, ticks: { callback: (v) => `₹${v.toLocaleString("en-IN")}` } },
      y: { grid: { display: false } },
    },
  };

  return (
    <div style={{ height: Math.max(180, supplierSpend.length * 44) }}>
      <Bar data={data} options={options} />
    </div>
  );
}
