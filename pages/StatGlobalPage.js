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
  const [branchesTree, setBranchesTree] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStats();
  }, [dateDebut, dateFin]);

  const fetchStats = async () => {
    setLoading(true);

    try {
      // 🔹 Récupérer le user connecté
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();
      if (userError) throw userError;

      // 🔹 Récupérer l'église principale de l'utilisateur
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("branche_id")
        .eq("id", user.id)
        .single();
      if (profileError) throw profileError;
      const rootId = profileData.branche_id;

      // 🔹 Récupérer toutes les branches descendants via RPC
      const { data: branchesData, error: branchesError } = await supabase
        .rpc("get_descendant_branches", { root_id: rootId });
      if (branchesError) throw branchesError;

      if (!branchesData || branchesData.length === 0) {
        setBranchesTree([]);
        setLoading(false);
        return;
      }

      const branchIds = branchesData.map(b => b.id);

      // 🔹 Récupérer les stats
      let statsQuery = supabase
        .from("attendance_stats")
        .select("*")
        .in("branche_id", branchIds);

      if (dateDebut) statsQuery = statsQuery.gte("mois", dateDebut);
      if (dateFin) statsQuery = statsQuery.lte("mois", dateFin);

      const { data: statsData, error: statsError } = await statsQuery;
      if (statsError) throw statsError;

      // 🔹 Cumul des stats par branche
      const statsMap = {};
      statsData.forEach(stat => {
        if (!statsMap[stat.branche_id]) {
          statsMap[stat.branche_id] = {
            hommes: 0,
            femmes: 0,
            jeunes: 0,
            enfants: 0,
            connectes: 0,
            nouveaux_venus: 0,
            nouveau_converti: 0,
            moissonneurs: 0
          };
        }
        statsMap[stat.branche_id].hommes += Number(stat.hommes) || 0;
        statsMap[stat.branche_id].femmes += Number(stat.femmes) || 0;
        statsMap[stat.branche_id].jeunes += Number(stat.jeunes) || 0;
        statsMap[stat.branche_id].enfants += Number(stat.enfants) || 0;
        statsMap[stat.branche_id].connectes += Number(stat.connectes) || 0;
        statsMap[stat.branche_id].nouveaux_venus += Number(stat.nouveaux_venus || 0);
        statsMap[stat.branche_id].nouveau_converti += Number(stat.nouveau_converti || 0);
        statsMap[stat.branche_id].moissonneurs += Number(stat.moissonneurs || 0);
      });

      // 🔹 Construire arbre hiérarchique
      const map = {};
      branchesData.forEach(b => {
        map[b.id] = {
          ...b,
          stats: statsMap[b.id] || {
            hommes: 0,
            femmes: 0,
            jeunes: 0,
            enfants: 0,
            connectes: 0,
            nouveaux_venus: 0,
            nouveau_converti: 0,
            moissonneurs: 0
          },
          enfants: []
        };
      });

      const tree = [];
      Object.values(map).forEach(b => {
        if (b.superviseur_id && map[b.superviseur_id]) {
          map[b.superviseur_id].enfants.push(b);
        } else {
          tree.push(b);
        }
      });

      setBranchesTree(tree);
    } catch (err) {
      console.error("Erreur fetch stats:", err);
      setBranchesTree([]);
    }

    setLoading(false);
  };

  // 🔹 Rendu d'une branche avec bordure hiérarchique
  const renderBranch = (branch, level = 0) => {
    const borderColor = level === 0 ? "border-l-4 border-green-400" : "border-l-4 border-orange-400";
    const total = branch.stats.hommes + branch.stats.femmes + branch.stats.jeunes;

    return (
      <div key={branch.id} className={`mb-6 pl-2 ${borderColor}`}>
        <div className="text-xl font-bold text-amber-300 mb-2">{branch.nom}</div>

        <div className="w-full overflow-x-auto">
          <div className="flex font-semibold uppercase text-white bg-white/5 rounded-t-xl px-4 py-2">
            <div className="min-w-[120px]">Type</div>
            <div className="min-w-[80px] text-center">Hommes</div>
            <div className="min-w-[80px] text-center">Femmes</div>
            <div className="min-w-[80px] text-center">Jeunes</div>
            <div className="min-w-[80px] text-center">Total</div>
            <div className="min-w-[80px] text-center">Enfants</div>
            <div className="min-w-[100px] text-center">Connectés</div>
            <div className="min-w-[100px] text-center">Nouveaux</div>
            <div className="min-w-[100px] text-center">Convertis</div>
            <div className="min-w-[100px] text-center">Moissonneurs</div>
          </div>

          <div className="flex bg-white/10 px-4 py-2 rounded-b-xl">
            <div className="min-w-[120px] font-semibold text-white">Culte</div>
            <div className="min-w-[80px] text-center text-white">{branch.stats.hommes}</div>
            <div className="min-w-[80px] text-center text-white">{branch.stats.femmes}</div>
            <div className="min-w-[80px] text-center text-white">{branch.stats.jeunes}</div>
            <div className="min-w-[80px] text-center text-white">{total}</div>
            <div className="min-w-[80px] text-center text-white">{branch.stats.enfants}</div>
            <div className="min-w-[100px] text-center text-white">{branch.stats.connectes}</div>
            <div className="min-w-[100px] text-center text-white">{branch.stats.nouveaux_venus}</div>
            <div className="min-w-[100px] text-center text-white">{branch.stats.nouveau_converti}</div>
            <div className="min-w-[100px] text-center text-white">{branch.stats.moissonneurs}</div>
          </div>
        </div>

        {/* Enfants */}
        {branch.enfants.map(child => renderBranch(child, level + 1))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#333699] p-6 text-white">
      <HeaderPages />

      <h1 className="text-2xl font-bold mb-6">
        Rapport <span className="text-amber-300">Statistiques Globales</span>
      </h1>

      {/* FILTRE DATE */}
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
      </div>

      {loading && <p>Chargement...</p>}

      {!loading && branchesTree.map(branch => renderBranch(branch))}

      <Footer />
    </div>
  );
}
