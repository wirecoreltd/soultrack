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
  const [rapportData, setRapportData] = useState([]);
  const [message, setMessage] = useState("");

  const fetchRapport = async () => {
    setMessage("⏳ Chargement...");

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
        .select("besoin, id")
        .eq("eglise_id", profile.eglise_id)
        .eq("branche_id", profile.branche_id);

      if (dateDebut) query = query.gte("created_at", dateDebut);
      if (dateFin) query = query.lte("created_at", dateFin);

      const { data, error } = await query;
      if (error) throw error;

      // 🔥 Comptage par besoin
      const count = {};
      const membreIds = new Set(); // pour total membres uniques

      (data || []).forEach((r) => {
        if (!r.besoin) return;

        membreIds.add(r.id);

        let besoinsArray = [];

        if (r.besoin.startsWith("[")) {
          try {
            besoinsArray = JSON.parse(r.besoin);
          } catch {
            besoinsArray = [];
          }
        } else {
          besoinsArray = r.besoin.split(",");
        }

        besoinsArray.forEach((b) => {
          const clean = b.trim();
          if (!clean) return;
          count[clean] = (count[clean] || 0) + 1;
        });
      });

      const totalMembres = membreIds.size;

      const result = Object.entries(count).map(([key, value]) => ({
        besoin: key,
        total: value,
        percent: ((value / totalMembres) * 100).toFixed(1),
      }));

      setRapportData(result);
      setMessage("");
    } catch (err) {
      console.error(err);
      setMessage("❌ " + err.message);
    }
  };

  const labels = rapportData.map((r) => r.besoin);
  const values = rapportData.map((r) => r.total);
  const percents = rapportData.map((r) => r.percent);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Nombre",
        data: values,
        backgroundColor: "rgba(255,255,255,0.15)",
        borderRadius: 8,
        barThickness: 25,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    animation: { duration: 1000 },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1f2366",
        titleColor: "#fff",
        bodyColor: "#fff",
        callbacks: {
          label: function (context) {
            const idx = context.dataIndex;
            return `${values[idx]} (${percents[idx]}%)`;
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
        ticks: { color: "#ffffff", precision: 0 },
        grid: { color: "rgba(255,255,255,0.1)" },
      },
    },
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />

      <h1 className="text-2xl font-bold text-white mt-4 mb-6">Rapport Besoins</h1>

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

      {message && <p className="text-white mb-4 font-medium">{message}</p>}

      {/* TABLEAU */}
      {rapportData.length > 0 && (
        <div className="w-full max-w-[600px] bg-white/10 rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex justify-between text-white font-bold border-b border-white/30 pb-2 mb-2">
            <span>Besoin</span>
            <span>Nombre</span>
            <span>%</span>
          </div>

          {rapportData.map((r) => (
            <div
              key={r.besoin}
              className="flex justify-between text-white py-2 border-b border-white/10"
            >
              <span>{r.besoin}</span>
              <span className="font-semibold">{r.total}</span>
              <span className="font-semibold">{r.percent}%</span>
            </div>
          ))}
        </div>
      )}

      {/* CHART */}
      {rapportData.length > 0 && (
        <div className="w-full max-w-[800px] bg-white/10 rounded-3xl p-8 shadow-2xl">
          <Bar data={chartData} options={chartOptions} />
        </div>
      )}

      <Footer />
    </div>
  );
}
