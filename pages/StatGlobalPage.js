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
  const [userEgliseId, setUserEgliseId] = useState(null);

  // Récupérer automatiquement l'église du user connecté
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
        error
      } = await supabase.auth.getUser();

      if (error || !user) return;

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("branche_id")
        .eq("id", user.id)
        .single();

      if (!profileError && profileData) setUserEgliseId(profileData.branche_id);
    };

    fetchUser();
  }, []);

  const fetchStats = async () => {
    if (!userEgliseId) {
      alert("Impossible de récupérer votre église.");
      return;
    }

    setLoading(true);

    try {
      const { data: branchesData, error: branchError } = await supabase
        .rpc("get_descendant_branches", { root_id: userEgliseId });

      if (branchError) throw branchError;
      if (!branchesData || branchesData.length === 0) {
        setBranchesTree([]);
        setLoading(false);
        return;
      }

      const branchIds = branchesData.map(b => b.id);

      const { data: statsData, error: statsError } = await supabase
        .from("attendance_stats")
        .select("*")
        .in("branche_id", branchIds)
        .gte("mois", dateDebut || "1900-01-01")
        .lte("mois", dateFin || "2999-12-31");

      if (statsError) throw statsError;

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

  const getBorderColor = level => {
    if (level === 0) return "border-l-4 border-green-500";
    if (level === 1) return "border-l-4 border-orange-500";
    return "border-l-4 border-blue-500";
  };

  const renderBranch = (branch, level = 0) => {
    const total = branch.stats.hommes + branch.stats.femmes + branch.stats.jeunes;

    return (
      <div key={branch.id} className={`mb-6 pl-4 ${getBorderColor(level)}`}>
        <div className="text-xl font-bold text-amber-300 mb-2">{branch.nom}</div>

        <table className="w-full table-auto border-collapse text-white mb-2">
          <thead>
            <tr className="border-b border-white/30">
              <th className="text-left px-2 py-1">Type</th>
              <th className="px-2 py-1 text-center">Hommes</th>
              <th className="px-2 py-1 text-center">Femmes</th>
              <th className="px-2 py-1 text-center">Jeunes</th>
              <th className="px-2 py-1 text-center">Total</th>
              <th className="px-2 py-1 text-center">Enfants</th>
              <th className="px-2 py-1 text-center">Connectés</th>
              <th className="px-2 py-1 text-center">Nouveaux</th>
              <th className="px-2 py-1 text-center">Convertis</th>
              <th className="px-2 py-1 text-center">Moissonneurs</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-white/10">
              <td className="px-2 py-1 font-semibold">Culte</td>
              <td className="px-2 py-1 text-center">{branch.stats.hommes}</td>
              <td className="px-2 py-1 text-center">{branch.stats.femmes}</td>
              <td className="px-2 py-1 text-center">{branch.stats.jeunes}</td>
              <td className="px-2 py-1 text-center">{total}</td>
              <td className="px-2 py-1 text-center">{branch.stats.enfants}</td>
              <td className="px-2 py-1 text-center">{branch.stats.connectes}</td>
              <td className="px-2 py-1 text-center">{branch.stats.nouveaux_venus}</td>
              <td className="px-2 py-1 text-center">{branch.stats.nouveau_converti}</td>
              <td className="px-2 py-1 text-center">{branch.stats.moissonneurs}</td>
            </tr>
          </tbody>
        </table>

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

      <div className="mb-6">
        <input
          type="date"
          value={dateDebut}
          onChange={e => setDateDebut(e.target.value)}
          className="px-3 py-2 rounded-lg text-black mr-2"
        />
        <input
          type="date"
          value={dateFin}
          onChange={e => setDateFin(e.target.value)}
          className="px-3 py-2 rounded-lg text-black mr-2"
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
