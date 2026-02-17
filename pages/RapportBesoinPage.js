"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import Footer from "../components/Footer";
import ProtectedRoute from "../components/ProtectedRoute";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function RapportBesoinPage() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableIntegration"]}>
      <RapportBesoin />
    </ProtectedRoute>
  );
}

function RapportBesoin() {
  const [rapports, setRapports] = useState([]);
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [message, setMessage] = useState("");

  const fetchRapports = async () => {
    setMessage("⏳ Génération en cours...");
    try {
      let query = supabase
        .from("membres_complets")
        .select("nom, prenom, besoin, created_at")
        .order("created_at", { ascending: false });

      if (dateDebut) query = query.gte("created_at", dateDebut);
      if (dateFin) query = query.lte("created_at", dateFin);

      const { data, error } = await query;
      if (error) throw error;

      setRapports(data || []);
      setMessage("");
    } catch (err) {
      console.error(err);
      setMessage("❌ " + err.message);
    }
  };

  // Préparer les données du chart
  const besoinsCount = {};
  rapports.forEach((r) => {
    if (!r.besoin) return;
    try {
      const besoinsArray = JSON.parse(r.besoin);
      besoinsArray.forEach((b) => {
        if (!besoinsCount[b]) besoinsCount[b] = 0;
        besoinsCount[b]++;
      });
    } catch {
      // Si ce n'est pas un JSON valide
      if (!besoinsCount[r.besoin]) besoinsCount[r.besoin] = 0;
      besoinsCount[r.besoin]++;
    }
  });

  const chartData = {
    labels: Object.keys(besoinsCount),
    datasets: [
      {
        label: "Nombre de personnes",
        data: Object.values(besoinsCount),
        backgroundColor: "rgba(59, 130, 246, 0.8)",
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => ` ${context.parsed.y} personne(s)`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: "#ffffff" },
        grid: { display: false },
      },
      y: {
        ticks: { color: "#ffffff", stepSize: 1 },
        beginAtZero: true,
        grid: { color: "rgba(255,255,255,0.1)" },
      },
    },
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />
      <h1 className="text-2xl font-bold text-white mt-4 mb-6 text-center">Rapport Besoin</h1>

      {/* Filtres */}
      <div className="bg-white/10 p-6 rounded-2xl shadow-lg mt-6 flex justify-center gap-4 flex-wrap text-white">
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
          onClick={fetchRapports}
          className="bg-[#2a2f85] px-6 py-2 rounded-xl hover:bg-[#1f2366]"
        >
          Générer
        </button>
      </div>

      {message && <p className="mt-4 text-center font-medium text-white">{message}</p>}

      {/* Tableau */}
      <div className="w-full flex justify-center mt-6 mb-6">
        <div className="w-max overflow-x-auto space-y-2">
          <div className="flex text-sm font-semibold uppercase text-white px-4 py-3 border-b border-white/30 bg-white/5 rounded-t-xl whitespace-nowrap">
            <div className="min-w-[200px]">Nom</div>
            <div className="min-w-[200px]">Prénom</div>
            <div className="min-w-[250px]">Besoin(s)</div>
            <div className="min-w-[200px]">Date</div>
          </div>

          {rapports.map((r) => (
            <div
              key={r.id}
              className="flex items-center px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition border-l-4 border-l-green-500 whitespace-nowrap"
            >
              <div className="min-w-[200px] text-white font-semibold">{r.nom}</div>
              <div className="min-w-[200px] text-white">{r.prenom}</div>
              <div className="min-w-[250px] text-white">{r.besoin}</div>
              <div className="min-w-[200px] text-white">{new Date(r.created_at).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="w-full max-w-4xl mt-6 p-6 bg-white/10 rounded-3xl shadow-lg">
        <Bar data={chartData} options={chartOptions} />
      </div>

      <Footer />
    </div>
  );
}
