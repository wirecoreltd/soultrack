"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  ChartDataLabels
);

export default function RapportBesoinPage() {
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [rapport, setRapport] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!dateStart || !dateEnd) {
      alert("Veuillez sélectionner une période");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from("membres_complets")
      .select("besoins, created_at")
      .gte("created_at", dateStart)
      .lte("created_at", dateEnd);

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    const besoinsCount = {};

    data.forEach((membre) => {
      if (Array.isArray(membre.besoins)) {
        membre.besoins.forEach((besoin) => {
          besoinsCount[besoin] = (besoinsCount[besoin] || 0) + 1;
        });
      }
    });

    const result = Object.entries(besoinsCount).map(([key, value]) => ({
      besoin: key,
      total: value,
    }));

    setRapport(result);
    setLoading(false);
  };

  const chartData = {
    labels: rapport.map((r) => r.besoin),
    datasets: [
      {
        label: "Nombre de personnes",
        data: rapport.map((r) => r.total),
        backgroundColor: "rgba(99,102,241,0.8)",
        borderRadius: 8,
        barPercentage: 0.5,
        categoryPercentage: 0.5,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: "#fff",
        },
      },
      datalabels: {
        color: "#fff",
        anchor: "end",
        align: "top",
        font: {
          weight: "bold",
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#fff",
        },
        grid: {
          display: false,
        },
      },
      y: {
        ticks: {
          color: "#fff",
          stepSize: 1,
        },
        grid: {
          color: "rgba(255,255,255,0.1)",
        },
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 p-8 text-white">
      <h1 className="text-3xl font-bold mb-8">
        📊 Rapport par Besoin
      </h1>

      {/* FILTRE */}
      <div className="flex gap-4 mb-8 items-end">
        <div>
          <label className="block text-sm mb-1">Date début</label>
          <input
            type="date"
            className="p-2 rounded bg-white text-black"
            value={dateStart}
            onChange={(e) => setDateStart(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Date fin</label>
          <input
            type="date"
            className="p-2 rounded bg-white text-black"
            value={dateEnd}
            onChange={(e) => setDateEnd(e.target.value)}
          />
        </div>

        <button
          onClick={handleGenerate}
          className="bg-indigo-600 hover:bg-indigo-700 px-6 py-2 rounded font-semibold shadow-lg transition"
        >
          Générer
        </button>
      </div>

      {/* TABLE EN HAUT */}
      {rapport.length > 0 && (
        <div className="bg-white text-black rounded-xl shadow-xl p-6 mb-12">
          <h2 className="text-xl font-bold mb-4">
            🔥 Résultat affiché
          </h2>

          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="py-2">Besoin</th>
                <th className="py-2">Nombre</th>
              </tr>
            </thead>
            <tbody>
              {rapport.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="py-2">{item.besoin}</td>
                  <td className="py-2 font-bold">{item.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CHART EN BAS */}
      {rapport.length > 0 && (
        <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-8 shadow-2xl">
          <Bar data={chartData} options={chartOptions} />
        </div>
      )}

      {loading && <p>Chargement...</p>}
    </div>
  );
}
