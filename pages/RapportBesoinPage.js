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
  ArcElement,
  LineElement,
  PointElement,
  TimeScale,
} from "chart.js";

import { Bar, Doughnut, Line } from "react-chartjs-2";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
  TimeScale
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
  const [totalMembres, setTotalMembres] = useState(0);
  const [hommes, setHommes] = useState(0);
  const [femmes, setFemmes] = useState(0);
  const [monthlyData, setMonthlyData] = useState({});
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
      .select("besoin, sexe, created_at")
      .eq("eglise_id", egliseId)
      .eq("branche_id", brancheId);

    if (dateDebut) query = query.gte("created_at", dateDebut);
    if (dateFin) query = query.lte("created_at", dateFin);

    const { data } = await query;

    if (!data) return;

    const counts = {};
    let h = 0;
    let f = 0;
    const monthly = {};

    data.forEach((m) => {
      if (m.sexe === "Homme") h++;
      if (m.sexe === "Femme") f++;

      const month = new Date(m.created_at).toLocaleString("fr-FR", {
        month: "short",
        year: "numeric",
      });

      if (!monthly[month]) monthly[month] = 0;
      monthly[month]++;

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

    const { count } = await supabase
      .from("membres_complets")
      .select("*", { count: "exact", head: true })
      .eq("eglise_id", egliseId)
      .eq("branche_id", brancheId);

    setTotalMembres(count || 0);
    setHommes(h);
    setFemmes(f);

    const result = Object.entries(counts).map(([nom, total]) => ({
      nom,
      total,
      pourcentage: count ? ((total / count) * 100).toFixed(1) : 0,
    }));

    setRapports(result.sort((a, b) => b.total - a.total));
    setMonthlyData(monthly);
    setGenerated(true);
  };

  const totalGlobal = rapports.reduce((sum, r) => sum + r.total, 0);

  const barData = {
    labels: rapports.map((r) => r.nom),
    datasets: [
      {
        label: "Nombre",
        data: rapports.map((r) => r.total),
        backgroundColor: "rgba(255,140,0,0.8)",
        borderRadius: 8,
      },
    ],
  };

  const doughnutData = {
    labels: rapports.map((r) => r.nom),
    datasets: [
      {
        data: rapports.map((r) => r.total),
        backgroundColor: [
          "#ff6b6b","#4ecdc4","#1a535c","#ffa600",
          "#5f27cd","#00d2d3","#ff9ff3","#54a0ff"
        ],
      },
    ],
  };

  const genderData = {
    labels: ["Hommes", "Femmes"],
    datasets: [
      {
        label: "Répartition",
        data: [hommes, femmes],
        backgroundColor: ["#36A2EB", "#FF6384"],
      },
    ],
  };

  const lineData = {
    labels: Object.keys(monthlyData),
    datasets: [
      {
        label: "Nouveaux membres",
        data: Object.values(monthlyData),
        borderColor: "#00ffcc",
        backgroundColor: "rgba(0,255,204,0.2)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-gradient-to-br from-[#1f1c2c] to-[#333699]">
      <HeaderPages />

      <h1 className="text-3xl font-bold text-white mt-4">
        📊 Rapport des Besoins
      </h1>

      {/* FILTRES */}
      <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-lg mt-6 flex gap-4 flex-wrap text-white">
        <input type="date" value={dateDebut}
          onChange={(e) => setDateDebut(e.target.value)}
          className="border border-white/30 rounded-lg px-3 py-2 bg-transparent text-white"
        />
        <input type="date" value={dateFin}
          onChange={(e) => setDateFin(e.target.value)}
          className="border border-white/30 rounded-lg px-3 py-2 bg-transparent text-white"
        />
        <button onClick={fetchRapport}
          className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-2 rounded-xl hover:scale-105 transition-all">
          Générer
        </button>
      </div>

      {generated && (
        <>
          {/* BAR CHART */}
          <div className="w-full max-w-5xl bg-white/10 p-6 rounded-2xl mt-10">
            <Bar data={barData} />
          </div>

          {/* DOUGHNUT */}
          <div className="w-full max-w-md bg-white/10 p-6 rounded-2xl mt-10">
            <Doughnut data={doughnutData} />
          </div>

          {/* GENDER */}
          <div className="w-full max-w-md bg-white/10 p-6 rounded-2xl mt-10">
            <Bar data={genderData} />
          </div>

          {/* EVOLUTION */}
          <div className="w-full max-w-5xl bg-white/10 p-6 rounded-2xl mt-10">
            <Line data={lineData} />
          </div>

          {/* TABLEAU */}
          <div className="w-full max-w-5xl mt-10">
            {rapports.map((r, i) => (
              <div key={i}
                className="flex justify-between px-6 py-3 bg-white/10 rounded-lg text-white mb-2 hover:bg-white/20 transition-all">
                <span>{r.nom}</span>
                <span>{r.total} ({r.pourcentage}%)</span>
              </div>
            ))}

            <div className="flex justify-between px-6 py-4 bg-orange-500/30 rounded-lg text-white font-bold mt-4">
              <span>Total général</span>
              <span>{totalGlobal}</span>
            </div>
          </div>
        </>
      )}

      <Footer />
    </div>
  );
}
