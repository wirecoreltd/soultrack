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
  const [superviseurId, setSuperviseurId] = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [branchesTree, setBranchesTree] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    if (!superviseurId) {
      alert("Veuillez entrer un ID d'église.");
      return;
    }

    setLoading(true);

    try {
      // 1️⃣ Récupérer toute la hiérarchie via la fonction RPC
      const { data: branchesData, error: branchError } = await supabase
        .rpc("get_descendant_branches", { root_id: superviseurId });

      if (branchError) throw branchError;
      if (!branchesData || branchesData.length === 0) {
        setBranchesTree([]);
        setLoading(false);
        return;
      }

      const branchIds = branchesData.map(b => b.id);

      // 2️⃣ Récupérer et cumuler les stats
      const { data: statsData, error: statsError } = await supabase
        .from("attendance_stats")
        .select("*")
        .in("branche_id", branchIds)
        .gte("mois", dateDebut || "1900-01-01")
        .lte("mois", dateFin || "2999-12-31");

      if (statsError) throw statsError;

      // Cumuler les stats par branche
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
        statsMap[stat.branche_id].nouveaux_venus += Number(stat.nouveaux_venus || stat.nouveauxvenus) || 0;
        statsMap[stat.branche_id].nouveau_converti += Number(stat.nouveau_converti || stat.nouveauxconvertis) || 0;
        statsMap[stat.branche_id].moissonneurs += Number(stat.moissonneurs) || 0;
      });

      // 3️⃣ Construire arbre hiérarchique
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

  // 4️⃣ Affichage hiérarchique propre
  const renderBranch = (branch, level = 0) => (
    <div key={branch.id} style={{ marginLeft: level * 30 }} className="mb-6">
      <div className="text-xl font-bold text-amber-300">{branch.nom}</div>

      <div className="grid grid-cols-9 gap-2 bg-white/10 p-2 rounded-xl text-white font-semibold">
        <div>Culte</div>
        <div className="text-center">{branch.stats.hommes}</div>
        <div className="text-center">{branch.stats.femmes}</div>
        <div className="text-center">{branch.stats.jeunes}</div>
        <div className="text-center">{branch.stats.enfants}</div>
        <div className="text-center">{branch.stats.connectes}</div>
        <div className="text-center">{branch.stats.nouveaux_venus}</div>
        <div className="text-center">{branch.stats.nouveau_converti}</div>
        <div className="text-center">{branch.stats.moissonneurs}</div>
      </div>

      {branch.enfants.map(child => renderBranch(child, level + 1))}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#333699] p-6 text-white">
      <HeaderPages />

      <h1 className="text-2xl font-bold mb-6">
        Rapport <span className="text-amber-300">Statistiques Globales</span>
      </h1>

      <div className="bg-white/10 p-4 rounded-xl mb-6 flex gap-4 flex-wrap text-black">
        <input
          type="text"
          placeholder="ID Église"
          value={superviseurId}
          onChange={e => setSuperviseurId(e.target.value)}
          className="px-3 py-2 rounded-lg"
        />

        <input
          type="date"
          value={dateDebut}
          onChange={e => setDateDebut(e.target.value)}
          className="px-3 py-2 rounded-lg"
        />

        <input
          type="date"
          value={dateFin}
          onChange={e => setDateFin(e.target.value)}
          className="px-3 py-2 rounded-lg"
        />

        <button
          onClick={fetchStats}
          className="bg-[#2a2f85] px-5 py-2 rounded-lg text-white"
        >
          Générer
        </button>
      </div>

      {loading && <p>Chargement...</p>}

      {!loading && branchesTree.map(branch => renderBranch(branch))}

      <Footer />
    </div>
  );
}
