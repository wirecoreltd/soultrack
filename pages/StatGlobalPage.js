"use client";

import { useState, useEffect } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import ProtectedRoute from "../components/ProtectedRoute";
import Footer from "../components/Footer";

export default function StatGlobalPageWrapper() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "Responsable"]}>
      <StatGlobalPage />
    </ProtectedRoute>
  );
}

function StatGlobalPage() {
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [rapports, setRapports] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    setLoading(true);

    try {
      // 🔹 récupérer l'user connecté
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Utilisateur non connecté");

      // 🔹 récupérer la branche racine du user
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("branche_id")
        .eq("id", user.id)
        .single();

      if (profileError || !profile) throw profileError || new Error("Profil non trouvé");

      const rootBranchId = profile.branche_id;

      // 🔹 récupérer toutes les branches descendantes (hiérarchie)
      const { data: branchesData, error: branchError } = await supabase
        .rpc("get_descendant_branches", { root_id: rootBranchId });

      if (branchError) throw branchError;
      if (!branchesData || branchesData.length === 0) {
        setRapports([]);
        setLoading(false);
        return;
      }

      const branchIds = branchesData.map(b => b.id);

      // 🔹 récupérer les stats cumulées
      let statsQuery = supabase.from("attendance_stats").select("*").in("branche_id", branchIds);
      if (dateDebut) statsQuery = statsQuery.gte("mois", dateDebut);
      if (dateFin) statsQuery = statsQuery.lte("mois", dateFin);

      const { data: statsData, error: statsError } = await statsQuery;
      if (statsError) throw statsError;

      // 🔹 cumuler stats par branche
      const statsMap = {};
      statsData.forEach(stat => {
        if (!statsMap[stat.branche_id]) {
          statsMap[stat.branche_id] = {
            hommes: 0,
            femmes: 0,
            jeunes: 0,
            enfants: 0,
            connectes: 0,
            nouveauxVenus: 0,
            nouveauxConvertis: 0,
            moissonneurs: 0
          };
        }
        statsMap[stat.branche_id].hommes += Number(stat.hommes) || 0;
        statsMap[stat.branche_id].femmes += Number(stat.femmes) || 0;
        statsMap[stat.branche_id].jeunes += Number(stat.jeunes) || 0;
        statsMap[stat.branche_id].enfants += Number(stat.enfants) || 0;
        statsMap[stat.branche_id].connectes += Number(stat.connectes) || 0;
        statsMap[stat.branche_id].nouveauxVenus += Number(stat.nouveaux_venus || stat.nouveauxVenus) || 0;
        statsMap[stat.branche_id].nouveauxConvertis += Number(stat.nouveau_converti || stat.nouveauxConvertis) || 0;
        statsMap[stat.branche_id].moissonneurs += Number(stat.moissonneurs) || 0;
      });

      // 🔹 construire arbre
      const mapBranches = {};
      branchesData.forEach(b => {
        mapBranches[b.id] = {
          ...b,
          stats: statsMap[b.id] || {
            hommes: 0,
            femmes: 0,
            jeunes: 0,
            enfants: 0,
            connectes: 0,
            nouveauxVenus: 0,
            nouveauxConvertis: 0,
            moissonneurs: 0
          },
          enfants: []
        };
      });

      const tree = [];
      Object.values(mapBranches).forEach(b => {
        if (b.superviseur_id && mapBranches[b.superviseur_id]) {
          mapBranches[b.superviseur_id].enfants.push(b);
        } else {
          tree.push(b);
        }
      });

      // 🔹 aplatir arbre pour table avec couleurs bordure
      const flattened = [];
      const traverse = (branch, color = "border-green-400") => {
        flattened.push({
          label: branch.nom,
          data: branch.stats,
          border: color
        });
        branch.enfants.forEach(child => traverse(child, "border-orange-400")); // même couleur pour enfants
      };
      tree.forEach(b => traverse(b));

      setRapports(flattened);
    } catch (err) {
      console.error("Erreur fetch stats:", err);
      setRapports([]);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#333699] p-6 text-white">
      <HeaderPages />
      <h1 className="text-2xl font-bold mb-6">
        Rapport <span className="text-amber-300">Statistiques Globales</span>
      </h1>

      {/* FILTRES DATE */}
      <div className="bg-white/10 p-4 rounded-xl mb-6 flex gap-4 flex-wrap">
        <input
          type="date"
          value={dateDebut}
          onChange={(e) => setDateDebut(e.target.value)}
          className="px-3 py-2 rounded-lg text-black"
        />
        <input
          type="date"
          value={dateFin}
          onChange={(e) => setDateFin(e.target.value)}
          className="px-3 py-2 rounded-lg text-black"
        />
        <button
          onClick={fetchStats}
          className="bg-[#2a2f85] px-5 py-2 rounded-lg"
        >
          Générer
        </button>
      </div>

      {/* TABLE */}
      {!loading && rapports.length > 0 && (
        <div className="w-full max-w-full overflow-x-auto mt-6 scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent">
          <div className="w-max space-y-2">
            {/* HEADER */}
            <div className="flex font-semibold uppercase text-white px-4 py-3 border-b border-white/30 bg-white/5 rounded-t-xl whitespace-nowrap">
              <div className="min-w-[180px] ml-1">Type</div>
              <div className="min-w-[120px] text-center">Hommes</div>
              <div className="min-w-[120px] text-center">Femmes</div>
              <div className="min-w-[120px] text-center">Jeunes</div>
              <div className="min-w-[120px] text-center">Total</div>
              <div className="min-w-[120px] text-center">Enfants</div>
              <div className="min-w-[140px] text-center">Connectés</div>
              <div className="min-w-[150px] text-center">Nouveaux</div>
              <div className="min-w-[180px] text-center">Convertis</div>
              <div className="min-w-[160px] text-center">Moissonneurs</div>
            </div>

            {/* LIGNES */}
            {rapports.map((r, idx) => (
              <div key={idx} className={`flex items-center px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition border-l-4 ${r.border}`}>
                <div className="min-w-[180px] text-white font-semibold">{r.label}</div>
                <div className="min-w-[120px] text-center text-white">{r.data.hommes}</div>
                <div className="min-w-[120px] text-center text-white">{r.data.femmes}</div>
                <div className="min-w-[120px] text-center text-white">{r.data.jeunes}</div>
                <div className="min-w-[120px] text-center text-white">{r.data.hommes + r.data.femmes + r.data.jeunes}</div>
                <div className="min-w-[120px] text-center text-white">{r.data.enfants}</div>
                <div className="min-w-[140px] text-center text-white">{r.data.connectes}</div>
                <div className="min-w-[150px] text-center text-white">{r.data.nouveauxVenus}</div>
                <div className="min-w-[180px] text-center text-white">{r.data.nouveauxConvertis}</div>
                <div className="min-w-[160px] text-center text-white">{r.data.moissonneurs}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading && <p>Chargement...</p>}

      <Footer />
    </div>
  );
}
