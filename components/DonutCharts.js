"use client";

import { useEffect, useRef } from "react";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";

Chart.register(ArcElement, Tooltip, Legend);

// ── palette tranches d'âge ────────────────────────────────────────────────
const TRANCHE_COLORS = [
  "#f59e0b", // Moins de 13 ans   – ambre
  "#10b981", // 13-17 ans          – emeraude
  "#3b82f6", // 18-25 ans          – bleu
  "#8b5cf6", // 26-30 ans          – violet
  "#ec4899", // 31-40 ans          – rose
  "#06b6d4", // 41-50 ans          – cyan
  "#f97316", // 51-60 ans          – orange
  "#64748b", // Plus de 60 ans     – ardoise
  "#94a3b8", // Non renseigné      – gris clair
];

// ── options communes ──────────────────────────────────────────────────────
const baseOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom",
      labels: {
        color: "rgba(255,255,255,0.75)",
        font: { size: 11, family: "'Segoe UI', sans-serif" },
        padding: 14,
        boxWidth: 12,
        boxHeight: 12,
        usePointStyle: true,
        pointStyle: "circle",
      },
    },
    tooltip: {
      backgroundColor: "rgba(15,15,30,0.92)",
      borderColor: "rgba(255,255,255,0.12)",
      borderWidth: 1,
      titleColor: "#fff",
      bodyColor: "rgba(255,255,255,0.7)",
      padding: 10,
      callbacks: {
        label: (ctx) => {
          const total = ctx.chart.data.datasets[0].data.reduce((s, v) => s + v, 0);
          const pct = total > 0 ? ((ctx.parsed / total) * 100).toFixed(1) : 0;
          return `  ${ctx.label} : ${ctx.parsed} (${pct}%)`;
        },
      },
    },
  },
  cutout: "68%",
  animation: {
    animateRotate: true,
    duration: 700,
    easing: "easeOutQuart",
  },
};

// ── CiviliteDonut ─────────────────────────────────────────────────────────
export function CiviliteDonut({ hommes = 0, femmes = 0 }) {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);

  const total = hommes + femmes;
  const pctH  = total > 0 ? ((hommes / total) * 100).toFixed(1) : 0;
  const pctF  = total > 0 ? ((femmes / total) * 100).toFixed(1) : 0;

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();

    chartRef.current = new Chart(canvasRef.current, {
      type: "doughnut",
      data: {
        labels: ["Hommes", "Femmes"],
        datasets: [
          {
            data: [hommes, femmes],
            backgroundColor: ["#3b82f6", "#ec4899"],
            hoverBackgroundColor: ["#60a5fa", "#f472b6"],
            borderColor: "rgba(255,255,255,0.06)",
            borderWidth: 2,
            hoverOffset: 6,
          },
        ],
      },
      options: {
        ...baseOptions,
        plugins: {
          ...baseOptions.plugins,
          // label centré dans le donut via plugin inline
        },
      },
      plugins: [
        {
          id: "centerText",
          afterDraw(chart) {
            const { ctx, chartArea } = chart;
            if (!chartArea) return;
            const cx = (chartArea.left + chartArea.right) / 2;
            const cy = (chartArea.top + chartArea.bottom) / 2;
            ctx.save();
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = "rgba(255,255,255,0.9)";
            ctx.font = "bold 22px 'Segoe UI', sans-serif";
            ctx.fillText(total.toLocaleString("fr-FR"), cx, cy - 8);
            ctx.fillStyle = "rgba(255,255,255,0.4)";
            ctx.font = "11px 'Segoe UI', sans-serif";
            ctx.fillText("présences", cx, cy + 12);
            ctx.restore();
          },
        },
      ],
    });

    return () => { chartRef.current?.destroy(); };
  }, [hommes, femmes]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div style={{ position: "relative", width: "100%", height: 200 }}>
        <canvas ref={canvasRef} />
      </div>

      {/* légende enrichie */}
      <div className="flex gap-6 mt-1">
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[10px] text-white/40 uppercase tracking-wider">Hommes</span>
          <span className="text-lg font-bold text-blue-400">{hommes.toLocaleString("fr-FR")}</span>
          <span className="text-[10px] text-white/50">{pctH}%</span>
        </div>
        <div className="w-px bg-white/10 self-stretch" />
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[10px] text-white/40 uppercase tracking-wider">Femmes</span>
          <span className="text-lg font-bold text-pink-400">{femmes.toLocaleString("fr-FR")}</span>
          <span className="text-[10px] text-white/50">{pctF}%</span>
        </div>
      </div>
    </div>
  );
}

// ── TranchesDonut ─────────────────────────────────────────────────────────
// data : [{ tranche: string, count: number }]
export function TranchesDonut({ data = [] }) {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);

  const total = data.reduce((s, d) => s + d.count, 0);

  useEffect(() => {
    if (!canvasRef.current || data.length === 0) return;
    if (chartRef.current) chartRef.current.destroy();

    const colors = data.map((_, i) => TRANCHE_COLORS[i % TRANCHE_COLORS.length]);

    chartRef.current = new Chart(canvasRef.current, {
      type: "doughnut",
      data: {
        labels: data.map((d) => d.tranche),
        datasets: [
          {
            data: data.map((d) => d.count),
            backgroundColor: colors.map((c) => c + "dd"),
            hoverBackgroundColor: colors,
            borderColor: "rgba(255,255,255,0.06)",
            borderWidth: 2,
            hoverOffset: 6,
          },
        ],
      },
      options: {
        ...baseOptions,
        plugins: {
          ...baseOptions.plugins,
          legend: {
            ...baseOptions.plugins.legend,
            position: "bottom",
          },
        },
      },
      plugins: [
        {
          id: "centerText",
          afterDraw(chart) {
            const { ctx, chartArea } = chart;
            if (!chartArea) return;
            const cx = (chartArea.left + chartArea.right) / 2;
            const cy = (chartArea.top + chartArea.bottom) / 2 - 10;
            ctx.save();
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = "rgba(255,255,255,0.9)";
            ctx.font = "bold 20px 'Segoe UI', sans-serif";
            ctx.fillText(total.toLocaleString("fr-FR"), cx, cy);
            ctx.fillStyle = "rgba(255,255,255,0.4)";
            ctx.font = "10px 'Segoe UI', sans-serif";
            ctx.fillText("présences", cx, cy + 16);
            ctx.restore();
          },
        },
      ],
    });

    return () => { chartRef.current?.destroy(); };
  }, [data]);

  // top 3 tranches
  const top3 = [...data].sort((a, b) => b.count - a.count).slice(0, 3);

  return (
    <div className="flex flex-col items-center gap-2">
      <div style={{ position: "relative", width: "100%", height: 200 }}>
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-white/30 text-xs">Aucune donnée</p>
          </div>
        ) : (
          <canvas ref={canvasRef} />
        )}
      </div>

      {/* top 3 */}
      {top3.length > 0 && (
        <div className="w-full mt-1 flex flex-col gap-1">
          {top3.map((d, i) => {
            const pct = total > 0 ? ((d.count / total) * 100).toFixed(1) : 0;
            const color = TRANCHE_COLORS[data.findIndex(x => x.tranche === d.tranche) % TRANCHE_COLORS.length];
            return (
              <div key={d.tranche} className="flex items-center gap-2">
                <span className="text-[10px] text-white/30 w-3">{i + 1}</span>
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: color }}
                />
                <span className="text-[11px] text-white/60 flex-1 truncate">{d.tranche}</span>
                <span className="text-[11px] font-semibold text-white/80">{d.count}</span>
                <span className="text-[10px] text-white/30 w-10 text-right">{pct}%</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
