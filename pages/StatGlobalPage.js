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

  const fetchStats = async () => {
    setLoading(true);

    // 🔹 Récupérer toutes les branches et églises
    let { data: branchesData, error: branchesError } = await supabase
      .from("branches")
      .select("*");

    if (branchesError || !branchesData) {
      setBranchesTree([]);
      setLoading(false);
      return;
    }

    // 🔹 Récupérer toutes les stats
    let statsQuery = supabase.from("attendance_stats").select("*");
    if (dateDebut) statsQuery = statsQuery.gte("mois", dateDebut);
    if (dateFin) statsQuery = statsQuery.lte("mois", dateFin);
    const { data: statsData, error: statsError } = await statsQuery;

    if (statsError || !statsData) {
      setBranchesTree([]);
      setLoading(false);
      return;
    }

    // 🔹 Construire un map de stats par branche_id
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

    // 🔹 Construire l'arbre hiérarchique
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
      // 🔹 Filtrer si on est sous un superviseur spécifique
      if (superviseurId && b.superviseur_id !== superviseurId && b.id !== superviseurId) {
        return;
      }

      if (b.superviseur_id && mapBranches[b.superviseur_id]) {
        mapBranches[b.superviseur_id].enfants.push(b);
      } else {
        tree.push(b); // branche racine
      }
    });

    setBranchesTree(tree);
    setLoading(false);
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
        <input
          type="text"
          placeholder="ID Superviseur"
          value={superviseurId || ""}
          onChange={(e) => setSuperviseurId(e.target.value || null)}
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
