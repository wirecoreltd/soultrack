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
  const [loading, setLoading] = useState(false);
  const [branchesTree, setBranchesTree] = useState([]);
  const [superviseurId, setSuperviseurId] = useState(null);

  // 🔹 Récupération automatique de l'utilisateur connecté
  useEffect(() => {
    const fetchSuperviseur = async () => {
      setLoading(true);
      try {
        const {
          data: { user },
          error: userError
        } = await supabase.auth.getUser(); // Supabase v2
        if (userError || !user) {
          console.error("Utilisateur non connecté", userError);
          setLoading(false);
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id, superviseur_id, branche_id")
          .eq("id", user.id)
          .single();

        if (profileError || !profile) {
          console.error("Profil introuvable pour l'utilisateur", profileError);
          setLoading(false);
          return;
        }

        // On utilise d'abord la branche_id puis le superviseur_id
        setSuperviseurId(profile.branche_id || profile.superviseur_id);
      } catch (err) {
        console.error("Erreur récupération superviseur:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSuperviseur();
  }, []);

  const fetchStats = async () => {
    if (!superviseurId) {
      alert("Veuillez patienter, l'identifiant du superviseur est en cours de récupération.");
      return;
    }

    setLoading(true);

    try {
      // 🔹 Étape 1 : récupérer toutes les branches supervisées par cet utilisateur
      const { data: branchesData, error: branchesError } = await supabase
        .from("branches")
        .select("id, nom, superviseur_id")
        .or(`superviseur_id.eq.${superviseurId},id.eq.${superviseurId}`);

      if (branchesError) {
        console.error("Erreur fetch branches:", branchesError);
        setBranchesTree([]);
        setLoading(false);
        return;
      }

      const superviseurBranchIds = branchesData.map((b) => b.id);

      // 🔹 Étape 2 : récupérer toutes les stats des branches filtrées
      const { data: statsData, error: statsError } = await supabase
        .from("attendance_stats")
        .select("*")
        .in("branche_id", superviseurBranchIds);

      if (statsError || !statsData) {
        console.error("Erreur fetch stats:", statsError);
        setBranchesTree([]);
        setLoading(false);
        return;
      }

      // 🔹 Étape 3 : construire un map id → stats
      const statsMap = {};
      statsData.forEach((item) => {
        statsMap[item.branche_id] = {
          hommes: Number(item.hommes) || 0,
          femmes: Number(item.femmes) || 0,
          jeunes: Number(item.jeunes) || 0,
          enfants: Number(item.enfants) || 0,
          connectes: Number(item.connectes) || 0,
          nouveaux_venus: Number(item.nouveauxvenus || item.nouveaux_venus) || 0,
          nouveau_converti: Number(item.nouveauxconvertis || item.nouveau_converti) || 0,
          moissonneurs: Number(item.moissonneurs) || 0,
        };
      });

      // 🔹 Étape 4 : construire l'arbre hiérarchique
      const mapBranches = {};
      branchesData.forEach((b) => {
        mapBranches[b.id] = {
          id: b.id,
          nom: b.nom,
          superviseur_id: b.superviseur_id,
          stats: statsMap[b.id] || {
            hommes: 0,
            femmes: 0,
            jeunes: 0,
            enfants: 0,
            connectes: 0,
            nouveaux_venus: 0,
            nouveau_converti: 0,
            moissonneurs: 0,
          },
          enfants: [],
        };
      });

      const tree = [];
      Object.values(mapBranches).forEach((b) => {
        if (b.superviseur_id && mapBranches[b.superviseur_id]) {
          mapBranches[b.superviseur_id].enfants.push(b);
        } else {
          tree.push(b); // branche racine
        }
      });

      setBranchesTree(tree);
    } catch (err) {
      console.error("Erreur fetch stats:", err);
      setBranchesTree([]);
    } finally {
      setLoading(false);
    }
  };

  const renderBranch = (b) => (
    <div key={b.id} className="w-full">
      <div className="text-xl font-bold text-amber-300 mb-3">{b.nom}</div>

      <div className="flex font-semibold uppercase text-white px-4 py-3 border-b border-white/30 bg-white/5 rounded-t-xl whitespace-nowrap">
        <div className="min-w-[180px] ml-1">Type</div>
        <div className="min-w-[120px] text-center">Hommes</div>
        <div className="min-w-[120px] text-center">Femmes</div>
        <div className="min-w-[120px] text-center">Jeunes</div>
        <div className="min-w-[120px] text-center">Enfants</div>
        <div className="min-w-[140px] text-center">Connectés</div>
        <div className="min-w-[150px] text-center">Nouveaux</div>
        <div className="min-w-[180px] text-center">Convertis</div>
        <div className="min-w-[160px] text-center">Moissonneurs</div>
      </div>

      <div className="flex items-center px-4 py-3 rounded-b-xl bg-white/10 hover:bg-white/20 transition border-l-4 border-blue-400 whitespace-nowrap">
        <div className="min-w-[180px] text-white font-semibold">Culte</div>
        <div className="min-w-[120px] text-center text-white">{b.stats.hommes}</div>
        <div className="min-w-[120px] text-center text-white">{b.stats.femmes}</div>
        <div className="min-w-[120px] text-center text-white">{b.stats.jeunes}</div>
        <div className="min-w-[120px] text-center text-white">{b.stats.enfants}</div>
        <div className="min-w-[140px] text-center text-white">{b.stats.connectes}</div>
        <div className="min-w-[150px] text-center text-white">{b.stats.nouveaux_venus}</div>
        <div className="min-w-[180px] text-center text-white">{b.stats.nouveau_converti}</div>
        <div className="min-w-[160px] text-center text-white">{b.stats.moissonneurs}</div>
      </div>

      {b.enfants.length > 0 && (
        <div className="pl-8 mt-4 space-y-4">
          {b.enfants.map((child) => renderBranch(child))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />

      <h1 className="text-2xl font-bold mt-4 mb-6 text-center text-white">
        Rapport <span className="text-amber-300">Statistiques Globales</span>
      </h1>

      {/* FILTRES */}
      <div className="bg-white/10 p-6 rounded-2xl shadow-lg mt-6 flex gap-4 flex-wrap text-white">
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
          onClick={fetchStats}
          className="bg-[#2a2f85] px-6 py-2 rounded-xl hover:bg-[#1f2366]"
        >
          Générer
        </button>
      </div>

      {/* AFFICHAGE */}
      {!loading && branchesTree.length > 0 && (
        <div className="w-full max-w-full overflow-x-auto mt-8 space-y-8">
          {branchesTree.map((b) => renderBranch(b))}
        </div>
      )}

      {loading && <div className="text-white mt-4">Chargement...</div>}

      <Footer />
    </div>
  );
}
