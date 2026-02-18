"use client";

import { useState } from "react";
import supabase from "../lib/supabaseClient";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

export default function RapportBesoinPage() {
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [besoinData, setBesoinData] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!dateDebut || !dateFin) return;

    setLoading(true);

    const { data, error } = await supabase
      .from("membres_complets")
      .select("besoins, created_at")
      .gte("created_at", dateDebut)
      .lte("created_at", dateFin);

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    const counts = {};

    data.forEach((item) => {
      if (!item.besoins) return;

      const besoinsArray = item.besoins.split(",").map((b) => b.trim());

      besoinsArray.forEach((b) => {
        if (!counts[b]) counts[b] = 0;
        counts[b]++;
      });
    });

    const formatted = Object.keys(counts).map((key) => ({
      besoin: key,
      nombre: counts[key],
    }));

    setBesoinData(formatted);
    setLoading(false);
  };

  const total = besoinData.reduce((acc, item) => acc + item.nombre, 0);

  const chartData = {
    labels: besoinData.map((item) => item.besoin),
    datasets: [
      {
        label: "Nombre",
        data: besoinData.map((item) => item.nombre),
        backgroundColor: "rgba(59,130,246,0.8)",
        borderRadius: 12,
        barPercentage: 0.5,
        categoryPercentage: 0.5,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#111827",
        titleColor: "#fff",
        bodyColor: "#fff",
        callbacks: {
          label: function (context) {
            const value = context.raw;
            const percent = total
              ? ((value / total) * 100).toFixed(1)
              : 0;
            return `${value} (${percent}%)`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: { color: "#ffffff" },
        grid: { display: false },
      },
      y: {
        ticks: { color: "#ffffff" },
        grid: { color: "rgba(255,255,255,0.1)" },
      },
    },
    animation: {
      duration: 1200,
      easing: "easeOutQuart",
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-8 text-white">
      <h1 className="text-3xl font-bold mb-8 text-center">
        📊 Rapport des Besoins
      </h1>

      {/* FILTRE */}
      <div className="bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 shadow-xl mb-8 flex flex-col md:flex-row gap-4 justify-center items-center">
        <input
          type="date"
          value={dateDebut}
          onChange={(e) => setDateDebut(e.target.value)}
          className="bg-gray-900 text-white px-4 py-2 rounded-xl"
        />
        <input
          type="date"
          value={dateFin}
          onChange={(e) => setDateFin(e.target.value)}
          className="bg-gray-900 text-white px-4 py-2 rounded-xl"
        />
        <button
          onClick={handleGenerate}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-3 rounded-xl font-bold hover:scale-105 transition-all"
        >
          {loading ? "Génération..." : "Générer"}
        </button>
      </div>

      {/* TABLE */}
      {besoinData.length > 0 && (
        <>
          <div className="bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 shadow-xl mb-10">
            <table className="w-full text-center">
              <thead>
                <tr className="border-b border-gray-600">
                  <th className="py-3">Besoin</th>
                  <th className="py-3">Nombre</th>
                </tr>
              </thead>
              <tbody>
                {besoinData.map((item, index) => (
                  <tr key={index} className="border-b border-gray-700">
                    <td className="py-2">{item.besoin}</td>
                    <td className="py-2 font-bold">{item.nombre}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* GRAPH */}
          <div className="bg-gray-800/80 backdrop-blur-md rounded-2xl p-8 shadow-xl">
            <Bar data={chartData} options={options} />
          </div>
        </>
      )}
    </div>
  );
}
