"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import dayjs from "dayjs";

export default function StatGlobalPage() {
  const [stats, setStats] = useState([]);
  const [startDate, setStartDate] = useState(dayjs().startOf("month").format("YYYY-MM-DD"));
  const [endDate, setEndDate] = useState(dayjs().endOf("month").format("YYYY-MM-DD"));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      setLoading(true);

      // 1️⃣ Récupérer toutes les stats pour la période
      const { data, error } = await supabase
        .from("attendance_stats")
        .select("*")
        .gte("mois", startDate)
        .lte("mois", endDate);

      if (error) {
        console.error("Supabase error:", error);
        setStats([]);
        setLoading(false);
        return;
      }

      if (!data) {
        setStats([]);
        setLoading(false);
        return;
      }

      // 2️⃣ Cumuler les stats par branche + id pour éviter les doublons
      const grouped = {};
      data.forEach((item) => {
        const key = `${item.branche_id}`; // branche_id unique
        if (!grouped[key]) {
          grouped[key] = {
            branche_id: item.branche_id,
            branche_nom: item.branche_nom,
            eglise_nom: item.eglis_nom || "", // pour différencier même nom de branche
            superviseur_id: item.superviseur_id,
            superviseur_nom: item.superviseur_nom,
            culte: 0,
            hommes: 0,
            femmes: 0,
            jeunes: 0,
            total_hfj: 0,
            enfants: 0,
            connectes: 0,
            nouveaux_venus: 0,
            nouveau_converti: 0,
            moissonneurs: 0,
          };
        }

        grouped[key].culte += item.culte || 0;
        grouped[key].hommes += item.hommes || 0;
        grouped[key].femmes += item.femmes || 0;
        grouped[key].jeunes += item.jeunes || 0;
        grouped[key].total_hfj += item.total_hfj || 0;
        grouped[key].enfants += item.enfants || 0;
        grouped[key].connectes += item.connectes || 0;
        grouped[key].nouveaux_venus += item.nouveaux_venus || 0;
        grouped[key].nouveau_converti += item.nouveau_converti || 0;
        grouped[key].moissonneurs += item.moissonneurs || 0;
      });

      let branches = Object.values(grouped);

      // 3️⃣ Supprimer les branches vides et Eglise Principale non supervisée
      branches = branches.filter((b) => {
        const total =
          b.culte +
          b.hommes +
          b.femmes +
          b.jeunes +
          b.total_hfj +
          b.enfants +
          b.connectes +
          b.nouveaux_venus +
          b.nouveau_converti +
          b.moissonneurs;

        if (total === 0) return false;
        if (b.branche_nom?.toLowerCase() === "eglise principale" && !b.superviseur_id) return false;
        return true;
      });

      // 4️⃣ Construire la hiérarchie parent → enfants
      const hierarchy = {};
      const roots = [];

      branches.forEach((b) => {
        hierarchy[b.branche_id] = { ...b, enfants: [] };
      });

      branches.forEach((b) => {
        if (b.superviseur_id && hierarchy[b.superviseur_id]) {
          hierarchy[b.superviseur_id].enfants.push(hierarchy[b.branche_id]);
        } else {
          roots.push(hierarchy[b.branche_id]);
        }
      });

      setStats(roots);
    } catch (err) {
      console.error("Unexpected error:", err);
      setStats([]);
    } finally {
      setLoading(false);
    }
  }

  // 5️⃣ Fonction récursive pour afficher hiérarchie
  const renderBranch = (branch, level = 0) => {
    return (
      <div key={branch.branche_id} className="mb-6">
        <div className={`font-bold ${level === 0 ? "text-2xl text-yellow-400" : "text-lg text-white"} ml-${level * 6}`}>
          {branch.branche_nom} {branch.eglise_nom && `(${branch.eglise_nom})`}
        </div>

        <table className={`w-full text-sm border-collapse ml-${level * 6} mt-1`}>
          <thead>
            <tr className="border-b border-gray-600 text-gray-300">
              <th className="text-left py-2 w-20">Culte</th>
              <th className="text-right px-4">Hommes</th>
              <th className="text-right px-4">Femmes</th>
              <th className="text-right px-4">Jeunes</th>
              <th className="text-right px-4">Total HFJ</th>
              <th className="text-right px-4">Enfants</th>
              <th className="text-right px-4">Connectés</th>
              <th className="text-right px-4">Nouveaux</th>
              <th className="text-right px-4">Convertis</th>
              <th className="text-right px-4">Moissonneurs</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-700">
              <td className="py-2 font-semibold">{branch.culte}</td>
              <td className="text-right px-4">{branch.hommes}</td>
              <td className="text-right px-4">{branch.femmes}</td>
              <td className="text-right px-4">{branch.jeunes}</td>
              <td className="text-right px-4 font-bold">{branch.total_hfj}</td>
              <td className="text-right px-4">{branch.enfants}</td>
              <td className="text-right px-4">{branch.connectes}</td>
              <td className="text-right px-4">{branch.nouveaux_venus}</td>
              <td className="text-right px-4">{branch.nouveau_converti}</td>
              <td className="text-right px-4">{branch.moissonneurs}</td>
            </tr>
          </tbody>
        </table>

        {branch.enfants.length > 0 &&
          branch.enfants.map((child) => renderBranch(child, level + 1))}
      </div>
    );
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      {/* Filtre dates */}
      <div className="flex gap-4 mb-6">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="px-3 py-2 rounded border border-gray-400 text-black"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="px-3 py-2 rounded border border-gray-400 text-black"
        />
        <button onClick={fetchStats} className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700">
          Filtrer
        </button>
      </div>

      {/* Contenu */}
      {loading ? (
        <div>Chargement...</div>
      ) : stats.length === 0 ? (
        <div>Aucune donnée trouvée.</div>
      ) : (
        <div className="space-y-10">
          <div className="text-xl font-bold text-yellow-400">
            Date : {startDate} – {endDate}
          </div>
          {stats.map((branch) => renderBranch(branch))}
        </div>
      )}
    </div>
  );
}
