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

      // 🔹 Récupérer l'église principale du user
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("branche_id")
        .eq("id", user.id)
        .single();
      if (profileError) throw profileError;

      const rootId = profileData.branche_id;

      // 🔹 Récupérer toutes les branches descendants
      const { data: branchesData, error: branchesError } = await supabase
        .rpc("get_descendant_branches", { root_id: rootId });
      if (branchesError) throw branchesError;

      if (!branchesData || branchesData.length === 0) {
        setRapports([]);
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

      // 🔹 Cumuler stats par branche
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
        statsMap[stat.branche_id].nouveauxVenus += Number(stat.nouveaux_venus || 0);
        statsMap[stat.branche_id].nouveauxConvertis += Number(stat.nouveau_converti || 0);
        statsMap[stat.branche_id].moissonneurs += Number(stat.moissonneurs || 0);
      });

      // 🔹 Construire arbre hiérarchique
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

      // 🔹 Convertir l'arbre en liste pour le display table
      const buildRapports = (nodes, level = 0, parentColor = "border-green-400") => {
        const rows = [];
        nodes.forEach(node => {
          const total = node.stats.hommes + node.stats.femmes + node.stats.jeunes;
          const borderColor = level === 0 ? "border-green-400" : "border-orange-400";

          rows.push({
            label: node.nom,
            border: borderColor,
            data: {
              hommes: node.stats.hommes,
              femmes: node.stats.femmes,
              jeunes: node.stats.jeunes,
              total,
              enfants: node.stats.enfants,
              connectes: node.stats.connectes,
              nouveauxVenus: node.stats.nouveauxVenus,
              nouveauxConvertis: node.stats.nouveauxConvertis,
              moissonneurs: node.stats.moissonneurs
            }
          });

          if (node.enfants.length > 0) {
            rows.push(...buildRapports(node.enfants, level + 1, borderColor));
          }
        });
        return rows;
      };

      setRapports(buildRapports(tree));
    } catch (err) {
      console.error("Erreur fetch stats:", err);
      setRapports([]);
    }

    setLoading(false);
  };

  // 🔹 Render table
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
              <div key={idx} className={`flex items-center px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition ${r.border}`}>
                <div className="min-w-[180px] text-white font-semibold">{r.label}</div>
                <div className="min-w-[120px] text-center text-white">{r.data?.hommes ?? "-"}</div>
                <div className="min-w-[120px] text-center text-white">{r.data?.femmes ?? "-"}</div>
                <div className="min-w-[120px] text-center text-white">{r.data?.jeunes ?? "-"}</div>
                <div className="min-w-[120px] text-center text-white">{r.data?.total ?? "-"}</div>
                <div className="min-w-[120px] text-center text-white">{r.data?.enfants ?? "-"}</div>
                <div className="min-w-[140px] text-center text-white">{r.data?.connectes ?? "-"}</div>
                <div className="min-w-[150px] text-center text-white">{r.data?.nouveauxVenus ?? "-"}</div>
                <div className="min-w-[180px] text-center text-white">{r.data?.nouveauxConvertis ?? "-"}</div>
                <div className="min-w-[160px] text-center text-white">{r.data?.moissonneurs ?? "-"}</div>
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
