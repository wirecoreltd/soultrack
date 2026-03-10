"use client";

import { useState, useEffect } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import ProtectedRoute from "../components/ProtectedRoute";
import Footer from "../components/Footer";

export default function MembresHubPageWrapper() {
  return (
    <ProtectedRoute allowedRoles={["Responsable"]}>
      <MembresHubPage />
    </ProtectedRoute>
  );
}

function MembresHubPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMembres: 0,
    venuReseaux: 0,
    invite: 0,
    evangelisation: 0,
    priereSalut: 0,
    conversion: 0,
    reconciliation: 0,
    trancheAge: {
      "12-17 ans": 0,
      "18-25 ans": 0,
      "26-30 ans": 0,
      "31-40 ans": 0,
      "41-55 ans": 0,
      "56-69 ans": 0,
      "70 ans et plus": 0,
    },
  });

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // Récupérer l'utilisateur connecté
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Récupérer les membres du hub de cet utilisateur
        const { data: profile } = await supabase
          .from("profiles")
          .select("branche_id")
          .eq("id", user.id)
          .single();

        const brancheId = profile?.branche_id;

        const { data: membres } = await supabase
          .from("membres_complets")
          .select("*")
          .eq("branche_id", brancheId);

        if (!membres) return;

        // Calculer les stats
        const newStats = {
          totalMembres: membres.length,
          venuReseaux: membres.filter(m => m.venu === "réseaux").length,
          invite: membres.filter(m => m.venu === "invité").length,
          evangelisation: membres.filter(m => m.venu === "evangélisation").length,
          priereSalut: membres.filter(m => m.priere_salut === "Oui").length,
          conversion: membres.filter(m => m.type_conversion === "Nouveau converti").length,
          reconciliation: membres.filter(m => m.type_conversion === "Réconciliation").length,
          trancheAge: {
            "12-17 ans": membres.filter(m => m.age === "12-17 ans").length,
            "18-25 ans": membres.filter(m => m.age === "18-25 ans").length,
            "26-30 ans": membres.filter(m => m.age === "26-30 ans").length,
            "31-40 ans": membres.filter(m => m.age === "31-40 ans").length,
            "41-55 ans": membres.filter(m => m.age === "41-55 ans").length,
            "56-69 ans": membres.filter(m => m.age === "56-69 ans").length,
            "70 ans et plus": membres.filter(m => m.age === "70 ans et plus").length,
          },
        };

        setStats(newStats);
      } catch (err) {
        console.error("Erreur fetch stats hub:", err);
      }
      setLoading(false);
    };

    fetchStats();
  }, []);

  if (loading) return <p className="text-center mt-10 text-white">Chargement des statistiques...</p>;

  return (
    <div className="min-h-screen bg-[#333699] p-6 text-white">
      <HeaderPages />
      <h1 className="text-2xl font-bold text-center mb-8">
        Membres <span className="text-amber-300">Hub</span>
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Total membres dans le hub" value={stats.totalMembres} color="green" />
        <StatCard title="Venu par réseaux" value={stats.venuReseaux} color="blue" />
        <StatCard title="Invité" value={stats.invite} color="purple" />
        <StatCard title="Évangélisation" value={stats.evangelisation} color="pink" />
        <StatCard title="Prières du salut" value={stats.priereSalut} color="yellow" />
        <StatCard title="Conversion" value={stats.conversion} color="orange" />
        <StatCard title="Réconciliation" value={stats.reconciliation} color="red" />
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Tranche d'âge</h2>
        <ul className="list-disc list-inside space-y-1">
          {Object.entries(stats.trancheAge).map(([age, count]) => (
            <li key={age}>
              {age}: <span className="font-semibold">{count}</span>
            </li>
          ))}
        </ul>
      </div>

      <Footer />
    </div>
  );
}

function StatCard({ title, value, color }) {
  const colorMap = {
    green: "border-green-400 bg-white/10",
    blue: "border-blue-400 bg-white/10",
    purple: "border-purple-400 bg-white/10",
    pink: "border-pink-400 bg-white/10",
    yellow: "border-yellow-400 bg-white/10",
    orange: "border-orange-400 bg-white/10",
    red: "border-red-400 bg-white/10",
  };

  return (
    <div className={`p-4 rounded-xl border-l-4 ${colorMap[color]} flex justify-between items-center`}>
      <span className="font-semibold">{title}</span>
      <span className="text-2xl font-bold">{value}</span>
    </div>
  );
}
