"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import dayjs from "dayjs";

export default function GlobalStats() {
  const [stats, setStats] = useState([]);
  const [startDate, setStartDate] = useState(
    dayjs().startOf("month").format("YYYY-MM-DD")
  );
  const [endDate, setEndDate] = useState(
    dayjs().endOf("month").format("YYYY-MM-DD")
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("attendance_stats")
        .select("*")
        .gte("mois", startDate)
        .lte("mois", endDate);

      if (error) {
        console.error(error);
        setStats([]);
        return;
      }

      if (!data || data.length === 0) {
        setStats([]);
        return;
      }

      // 1️⃣ CUMUL PAR BRANCHE_ID
      const grouped = {};

      data.forEach((item) => {
        if (!grouped[item.branche_id]) {
          grouped[item.branche_id] = {
            branche_id: item.branche_id,
            branche_nom: item.branche_nom,
            superviseur_id: item.superviseur_id,
            enfants: [],
            culte: 0,
            hommes: 0,
            femmes: 0,
            jeunes: 0,
            total_hfj: 0,
            enfants_stats: 0,
            connectes: 0,
            nouveaux_venus: 0,
            nouveau_converti: 0,
            moissonneurs: 0,
          };
        }

        grouped[item.branche_id].culte += item.culte || 0;
        grouped[item.branche_id].hommes += item.hommes || 0;
        grouped[item.branche_id].femmes += item.femmes || 0;
        grouped[item.branche_id].jeunes += item.jeunes || 0;
        grouped[item.branche_id].total_hfj += item.total_hfj || 0;
        grouped[item.branche_id].enfants_stats += item.enfants || 0;
        grouped[item.branche_id].connectes += item.connectes || 0;
        grouped[item.branche_id].nouveaux_venus += item.nouveaux_venus || 0;
        grouped[item.branche_id].nouveau_converti += item.nouveau_converti || 0;
        grouped[item.branche_id].moissonneurs += item.moissonneurs || 0;
      });

      const branches = Object.values(grouped);

      // 2️⃣ CONSTRUCTION DE L’ARBRE HIÉRARCHIQUE
      const map = {};
      branches.forEach((b) => (map[b.branche_id] = b));

      const tree = [];

      branches.forEach((branch) => {
        if (branch.superviseur_id && map[branch.superviseur_id]) {
          map[branch.superviseur_id].enfants.push(branch);
        } else if (!branch.superviseur_id) {
          tree.push(branch);
        }
      });

      setStats(tree);
    } catch (err) {
      console.error(err);
      setStats([]);
    } finally {
      setLoading(false);
    }
  }

  function renderBranch(branch, level = 0) {
    return (
      <div key={branch.branche_id} className="mb-8">
        {/* Nom de la branche */}
        <div
          className="text-xl font-bold text-yellow-400"
          style={{ marginLeft: level * 25 }}
        >
          {branch.branche_nom}
        </div>

        {/* Tableau */}
        <div
          className="overflow-x-auto mt-2"
          style={{ marginLeft: level * 25 }}
        >
          <table className="min-w-full text-sm border border-gray-700 bg-gray-800 rounded-lg">
            <thead>
              <tr className="bg-gray-700 text-gray-200">
                <th className="px-4 py-2 text-right">Culte</th>
                <th className="px-4 py-2 text-right">Hommes</th>
                <th className="px-4 py-2 text-right">Femmes</th>
                <th className="px-4 py-2 text-right">Jeunes</th>
                <th className="px-4 py-2 text-right">Total HFJ</th>
                <th className="px-4 py-2 text-right">Enfants</th>
                <th className="px-4 py-2 text-right">Connectés</th>
                <th className="px-4 py-2 text-right">Nouveaux</th>
                <th className="px-4 py-2 text-right">Convertis</th>
                <th className="px-4 py-2 text-right">Moissonneurs</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-gray-700 text-white">
                <td className="px-4 py-2 text-right">{branch.culte}</td>
                <td className="px-4 py-2 text-right">{branch.hommes}</td>
                <td className="px-4 py-2 text-right">{branch.femmes}</td>
                <td className="px-4 py-2 text-right">{branch.jeunes}</td>
                <td className="px-4 py-2 text-right font-bold">
                  {branch.total_hfj}
                </td>
                <td className="px-4 py-2 text-right">
                  {branch.enfants_stats}
                </td>
                <td className="px-4 py-2 text-right">{branch.connectes}</td>
                <td className="px-4 py-2 text-right">
                  {branch.nouveaux_venus}
                </td>
                <td className="px-4 py-2 text-right">
                  {branch.nouveau_converti}
                </td>
                <td className="px-4 py-2 text-right">
                  {branch.moissonneurs}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Enfants */}
        {branch.enfants.map((child) =>
          renderBranch(child, level + 1)
        )}
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      {/* Filtres */}
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
        <button
          onClick={fetchStats}
          className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
        >
          Filtrer
        </button>
      </div>

      {/* Affichage */}
      {loading ? (
        <div>Chargement...</div>
      ) : stats.length === 0 ? (
        <div>Aucune donnée trouvée.</div>
      ) : (
        <div>
          <div className="text-2xl font-bold mb-6 text-green-400">
            Période : {startDate} → {endDate}
          </div>

          {stats.map((branch) => renderBranch(branch))}
        </div>
      )}
    </div>
  );
}
