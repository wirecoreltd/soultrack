"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import Footer from "../components/Footer";
import ProtectedRoute from "../components/ProtectedRoute";

import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

import ChartDataLabels from "chartjs-plugin-datalabels";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ChartDataLabels
);

export default function RapportBesoinPage() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "Responsable"]}>
      <RapportBesoin />
    </ProtectedRoute>
  );
}

function RapportBesoin() {
  const [egliseId, setEgliseId] = useState(null);
  const [brancheId, setBrancheId] = useState(null);

  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [rapports, setRapports] = useState([]);
  const [generated, setGenerated] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("eglise_id, branche_id")
        .eq("id", user.id)
        .single();

      if (data) {
        setEgliseId(data.eglise_id);
        setBrancheId(data.branche_id);
      }
    };

    fetchProfile();
  }, []);

  const fetchRapport = async () => {
    if (!egliseId || !brancheId) return;

    setGenerated(false);

    let query = supabase
      .from("membres_complets")
      .select("besoin")
      .eq("eglise_id", egliseId)
      .eq("branche_id", brancheId);

    if (dateDebut) query = query.gte("created_at", dateDebut);
    if (dateFin) query = query.lte("created_at", dateFin);

    const { data } = await query;

    if (!data) return;

    const counts = {};

    data.forEach((m) => {
      if (m.besoin) {
        try {
          const besoins = JSON.parse(m.besoin);
          besoins.forEach((b) => {
            if (!counts[b]) counts[b] = 0;
            counts[b]++;
          });
        } catch {}
      }
    });

    const result = Object.entries(counts).map(([nom, total]) => ({
      nom,
      total,
    }));

    setRapports(result.sort((a, b) => b.total - a.total));
    setGenerated(true);
  };

  const chartData = {
    labels: rapports.map((r) => r.nom),
    datasets: [
      {
        label: "Nombre",
        data: rapports.map((r) => r.total),
        backgroundColor: "rgba(255,140,0,0.9)",
        borderRadius: 12,
        barThickness: 30,
        hoverBackgroundColor: "rgba(255,100,0,1)",
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: { display: false },
      datalabels: {
        color: "#ffffff",
        anchor: "end",
        align: "top",
        font: { weight: "bold", size: 14 },
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
      duration: 1500,
    },
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-gradient-to-br from-[#141e30] to-[#243b55]">
      <HeaderPages />

      <h1 className="text-3xl font-bold text-white mt-4">
        📊 Rapport des Besoins
      </h1>

      {/* FILTRE */}
      <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-lg mt-6 flex gap-4 flex-wrap text-white">
        <input
          type="date"
          value={dateDebut}
          onChange={(e) => setDateDebut(e.target.value)}
          className="border border-white/30 rounded-lg px-3 py-2 bg-transparent text-white"
        />
        <input
          type="date"
          value={dateFin}
          onChange={(e) => setDateFin(e.target.value)}
          className="border border-white/30 rounded-lg px-3 py-2 bg-transparent text-white"
        />
        <button
          onClick={fetchRapport}
          className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-2 rounded-xl hover:scale-105 transition-all"
        >
          Générer
        </button>
      </div>

      {generated && (
        <>
          {/* TABLE EN HAUT */}
          <div className="w-full max-w-4xl mt-10">
            <div className="flex text-white font-semibold px-6 py-3 bg-white/5 rounded-t-xl">
              <div className="flex-1">Besoin</div>
              <div className="w-32 text-right">Nombre</div>
            </div>

            {rapports.map((r, i) => (
              <div
                key={i}
                className="flex px-6 py-3 bg-white/10 text-white border-b border-white/10 hover:bg-white/20 transition"
              >
                <div className="flex-1">{r.nom}</div>
                <div className="w-32 text-right font-bold">
                  {r.total}
                </div>
              </div>
            ))}
          </div>

          {/* CHART EN BAS */}
          <div className="w-full max-w-5xl mt-12 bg-white/5 p-8 rounded-3xl shadow-2xl backdrop-blur-lg border border-white/10">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </>
      )}

      <Footer />
    </div>
  );
}
