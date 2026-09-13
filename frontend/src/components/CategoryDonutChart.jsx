import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip } from "chart.js";

ChartJS.register(ArcElement, Tooltip);

export default function CategoryDonutChart({ categoryDistribution, totalProducts }) {
  const data = {
    labels: categoryDistribution.map((c) => c.category),
    datasets: [
      {
        data: categoryDistribution.map((c) => c.percent),
        backgroundColor: categoryDistribution.map((c) => c.color),
        borderWidth: 0,
        cutout: "70%",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${ctx.raw}%` } },
    },
  };

  return (
    <div className="relative mx-auto h-48 w-48">
      <Doughnut data={data} options={options} />
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-slate-900">{totalProducts}</span>
        <span className="text-xs text-slate-500">Products</span>
      </div>
    </div>
  );
}
