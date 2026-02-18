"use client";

import { useState } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import Footer from "../components/Footer";
import ProtectedRoute from "../components/ProtectedRoute";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function RapportBesoinPage() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableSuivi"]}>
      <RapportBesoin />
    </ProtectedRoute>
  );
}

function RapportBesoin() {
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [besoinsCount, setBesoinsCount] = useState({});
  const [message, setMessage] = useState("");

  const fetchRapport = async () => {
    setMessage("⏳ Chargement...");
    setBesoinsCount({});

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("eglise_id, branche_id")
        .eq("id", session.session.user.id)
        .single();

      let query = supabase
        .from("membres_complets")
        .select("besoin, created_at")
        .eq("eglise_id", profile.eglise_id)
        .eq("branche_id", profile.branche_id);

      if (dateDebut) query = query.gte("created_at", dateDebut);
      if (dateFin) query = query.lte("created_at", dateFin);

      const { data, error } = await query;
      if (error) throw error;

      const count = {};

      (data || []).forEach((r) => {
        if (!r.besoin) return;

        let besoinsArray = [];

        try {
          if (r.besoin.startsWith("[")) {
            besoinsArray = JSON.parse(r.besoin);
          } else {
            besoinsArray = r.besoin.split(",");
          }
        } catch {
          besoinsArray = r.besoin.split(",");
        }

        besoinsArray.forEach((b) => {
          const clean = b.trim();
          if (!clean) return;

          if (!count[clean]) count[clean] = 0;
          count[clean]++;
        });
      });

      setBesoinsCount(count);
      setMessage("");
    } catch (err) {
      console.error(err);
      setMessage("❌ " + err.message);
    }
  };

  const labels = Object.keys(besoinsCount);
  const values = Object.values(besoinsCount);
  const total = values.reduce((acc, val) => acc + val, 0);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Nombre",
        data: values,
        backgroundColor: "rgba(255,255,255,0.9)",
        borderRadius: 10,
        barThickness: 35,
      },
    ],
  };

  const chartOptions = {
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
        ticks: { color: "#ffffff" },
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: "#ffffff",
          precision: 0,
        },
        grid: {
          color: "rgba(255,255,255,0.1)",
        },
      },
    },
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />

      <h1 className="text-2xl font-bold text-white mt-4 mb-6">
        Rapport Besoins
      </h1>

      {/* FILTRES */}
      <div className="bg-white/10 p-6 rounded-2xl shadow-lg flex gap-4 flex-wrap text-white mb-6">
        <input
          type="date"
          value={dateDebut}
          onChange={(e) => setDateDebut(e.target.value)}
          className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white"
        />
        <input
          type="date"
          value={dateFin}
          onChange={(e) => setDateFin(e.target.value)}
          className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white"
        />
        <button
          onClick={fetchRapport}
          className="bg-[#2a2f85] px-6 py-2 rounded-xl hover:bg-[#1f2366] transition"
        >
          Générer
        </button>
      </div>

      {message && <p className="text-white mb-4">{message}</p>}

      {/* TABLE */}
      {labels.length > 0 && (
        <div className="w-full max-w-[600px] bg-white/10 rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex justify-between text-white font-bold border-b border-white/30 pb-2 mb-2">
            <span>Besoin</span>
            <span>Nombre</span>
          </div>

          {labels.map((b, i) => (
            <div
              key={b}
              className="flex justify-between text-white py-2 border-b border-white/10"
            >
              <span>{b}</span>
              <span className="font-semibold">
                {values[i]}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* CHART */}
      {labels.length > 0 && (
        <div className="w-full max-w-[800px] bg-white/10 rounded-2xl shadow-lg p-8">
          <Bar data={chartData} options={chartOptions} />
        </div>
      )}

      <Footer />
    </div>
  );
}
