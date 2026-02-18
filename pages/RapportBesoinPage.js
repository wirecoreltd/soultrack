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
  const [message, setMessage] = useState("");

  const handleGenerate = async () => {
    setMessage("Chargement...");

    const { data, error } = await supabase
      .from("membres_complets")
      .select("besoin, created_at");

    if (error) {
      console.error(error);
      setMessage("Erreur requête");
      return;
    }

    console.log("DATA SUPABASE:", data);

    const counts = {};

    (data || []).forEach((item) => {
      if (!item.besoin) return;

      let besoinsArray = [];

      if (item.besoin.startsWith("[")) {
        try {
          besoinsArray = JSON.parse(item.besoin);
        } catch {
          besoinsArray = [];
        }
      } else {
        besoinsArray = item.besoin.split(",");
      }

      besoinsArray.forEach((b) => {
        const clean = b.trim();
        if (!clean) return;

        if (!counts[clean]) counts[clean] = 0;
        counts[clean]++;
      });
    });

    const formatted = Object.keys(counts).map((key) => ({
      besoin: key,
      nombre: counts[key],
    }));

    setBesoinData(formatted);
    setMessage("");
  };

  const total = besoinData.reduce((acc, item) => acc + item.nombre, 0);

  const chartData = {
    labels: besoinData.map((item) => item.besoin),
    datasets: [
      {
        data: besoinData.map((item) => item.nombre),
        backgroundColor: "rgba(255,255,255,0.8)",
        borderRadius: 8,
        barThickness: 30,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
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
        ticks: { color: "#fff" },
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        ticks: { color: "#fff" },
        grid: { color: "rgba(255,255,255,0.1)" },
      },
    },
  };

  return (
    <div className="min-h-screen bg-[#333699] p-8 text-white">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Rapport Besoins
      </h1>

      <div className="text-center mb-6">
        <button
          onClick={handleGenerate}
          className="bg-white text-[#333699] px-6 py-2 rounded-xl font-bold"
        >
          Générer
        </button>
      </div>

      {message && <p className="text-center mb-4">{message}</p>}

      {besoinData.length > 0 && (
        <>
          {/* TABLE */}
          <div className="bg-white/10 rounded-2xl p-6 mb-8">
            <div className="flex justify-between font-bold border-b border-white/30 pb-2 mb-2">
              <span>Besoin</span>
              <span>Nombre</span>
            </div>

            {besoinData.map((item, index) => (
              <div
                key={index}
                className="flex justify-between py-2 border-b border-white/10"
              >
                <span>{item.besoin}</span>
                <span>{item.nombre}</span>
              </div>
            ))}
          </div>

          {/* GRAPH */}
          <div className="bg-white/10 rounded-2xl p-8">
            <Bar data={chartData} options={options} />
          </div>
        </>
      )}
    </div>
  );
}
