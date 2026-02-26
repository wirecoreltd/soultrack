"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import dayjs from "dayjs";

export default function GlobalStats() {
  const [tree, setTree] = useState([]);
  const [startDate, setStartDate] = useState(
    dayjs().startOf("month").format("YYYY-MM-DD")
  );
  const [endDate, setEndDate] = useState(
    dayjs().endOf("month").format("YYYY-MM-DD")
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);

      // 1️⃣ Récupérer toutes les branches (structure hiérarchique)
      const { data: branchesData, error: branchesError } =
        await supabase.from("branches").select("*");

      if (branchesError) throw branchesError;

      // 2️⃣ Récupérer les stats cumulées sur la période
      const { data: statsData, error: statsError } = await supabase
        .from("attendance_stats")
        .select("*")
        .gte("mois", startDate)
        .lte("mois", endDate);

      if (statsError) throw statsError;

      // 3️⃣ Cumul des stats par branche_id
      const statsMap = {};

      statsData.forEach((row) => {
        if (!statsMap[row.branche_id]) {
          statsMap[row.branche_id] = {
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

        statsMap[row.branche_id].culte += row.culte || 0;
        statsMap[row.branche_id].hommes += row.hommes || 0;
        statsMap[row.branche_id].femmes += row.femmes || 0;
        statsMap[row.branche_id].jeunes += row.jeunes || 0;
        statsMap[row.branche_id].total_hfj += row.total_hfj || 0;
        statsMap[row.branche_id].enfants += row.enfants || 0;
        statsMap[row.branche_id].connectes += row.connectes || 0;
        statsMap[row.branche_id].nouveaux_venus += row.nouveaux_venus || 0;
        statsMap[row.branche_id].nouveau_converti += row.nouveau_converti || 0;
        statsMap[row.branche_id].moissonneurs += row.moissonneurs || 0;
      });

      // 4️⃣ Construire structure hiérarchique
      const branchMap = {};

      branchesData.forEach((b) => {
        branchMap[b.id] = {
          id: b.id,
          nom: b.nom,
          superviseur_id: b.superviseur_id,
          enfants: [],
          stats: statsMap[b.id] || {
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
          },
        };
      });

      const root = [];

      Object.values(branchMap).forEach((branch) => {
        if (branch.superviseur_id) {
          const parent = branchMap[branch.superviseur_id];
          if (parent) {
            parent.enfants.push(branch);
          }
        } else {
          root.push(branch);
        }
      });

      setTree(root);
    } catch (err) {
      console.error(err);
      setTree([]);
    } finally {
      setLoading(false);
    }
  }

  function renderBranch(branch, level = 0) {
    return (
      <div key={branch.id} className="mb-8">
        <div
          className="text-xl font-bold text-yellow-400"
          style={{ marginLeft: level * 25 }}
        >
          {branch.nom}
        </div>

        <div
          className="overflow-x-auto mt-2"
          style={{ marginLeft: level * 25 }}
        >
          <table className="min-w-full text-sm border border-gray-700 bg-gray-800 rounded-lg">
            <thead>
              <tr className="bg-gray-700 text-gray-200">
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
              <tr className="text-white">
                <td className="px-4 py-2 text-right">
                  {branch.stats.hommes}
                </td>
                <td className="px-4 py-2 text-right">
                  {branch.stats.femmes}
                </td>
                <td className="px-4 py-2 text-right">
                  {branch.stats.jeunes}
                </td>
                <td className="px-4 py-2 text-right font-bold">
                  {branch.stats.total_hfj}
                </td>
                <td className="px-4 py-2 text-right">
                  {branch.stats.enfants}
                </td>
                <td className="px-4 py-2 text-right">
                  {branch.stats.connectes}
                </td>
                <td className="px-4 py-2 text-right">
                  {branch.stats.nouveaux_venus}
                </td>
                <td className="px-4 py-2 text-right">
                  {branch.stats.nouveau_converti}
                </td>
                <td className="px-4 py-2 text-right">
                  {branch.stats.moissonneurs}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {branch.enfants.map((child) =>
          renderBranch(child, level + 1)
        )}
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <div className="flex gap-4 mb-6">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="px-3 py-2 rounded border text-black"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="px-3 py-2 rounded border text-black"
        />
        <button
          onClick={fetchData}
          className="bg-blue-600 px-4 py-2 rounded"
        >
          Filtrer
        </button>
      </div>

      {loading ? (
        <div>Chargement...</div>
      ) : tree.length === 0 ? (
        <div>Aucune donnée trouvée.</div>
      ) : (
        tree.map((branch) => renderBranch(branch))
      )}
    </div>
  );
}
