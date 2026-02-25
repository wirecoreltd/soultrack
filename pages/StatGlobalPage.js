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
    setLoading(true);

    const { data, error } = await supabase
      .from("attendance_stats")
      .select("*")
      .gte("mois", startDate)
      .lte("mois", endDate);

    if (error) {
      console.error(error);
      setStats([]);
      setLoading(false);
      return;
    }

    // ✅ 1. Regrouper par branche_id
    const grouped = {};

    data.forEach((item) => {
      if (!grouped[item.branche_id]) {
        grouped[item.branche_id] = {
          ...item,
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

      grouped[item.branche_id].culte += item.culte || 0;
      grouped[item.branche_id].hommes += item.hommes || 0;
      grouped[item.branche_id].femmes += item.femmes || 0;
      grouped[item.branche_id].jeunes += item.jeunes || 0;
      grouped[item.branche_id].total_hfj += item.total_hfj || 0;
      grouped[item.branche_id].enfants += item.enfants || 0;
      grouped[item.branche_id].connectes += item.connectes || 0;
      grouped[item.branche_id].nouveaux_venus += item.nouveaux_venus || 0;
      grouped[item.branche_id].nouveau_converti += item.nouveau_converti || 0;
      grouped[item.branche_id].moissonneurs += item.moissonneurs || 0;
    });

    const branches = Object.values(grouped);

    // ✅ 2. Supprimer branches vides + Eglise Principale
    const filtered = branches.filter((b) => {
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
      if (
        b.branche_nom?.toLowerCase() === "eglise principale" &&
        !b.superviseur_id
      )
        return false;

      return true;
    });

    // ✅ 3. Construire hiérarchie propre
    const hierarchy = {};

    filtered.forEach((branch) => {
      const parentId = branch.superviseur_id || branch.branche_id;

      if (!hierarchy[parentId]) {
        hierarchy[parentId] = {
          parentNom: branch.superviseur_nom || branch.branche_nom,
          children: [],
        };
      }

      hierarchy[parentId].children.push(branch);
    });

    setStats(Object.values(hierarchy));
    setLoading(false);
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

      {loading ? (
        <div>Chargement...</div>
      ) : stats.length === 0 ? (
        <div>Aucune donnée trouvée.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-700 text-sm">
            <thead className="bg-gray-800 sticky top-0">
              <tr>
                <th className="p-2 text-left">Branche</th>
                <th className="p-2">Culte</th>
                <th className="p-2">Hommes</th>
                <th className="p-2">Femmes</th>
                <th className="p-2">Jeunes</th>
                <th className="p-2">Total HFJ</th>
                <th className="p-2">Enfants</th>
                <th className="p-2">Connectés</th>
                <th className="p-2">Nouveaux</th>
                <th className="p-2">Convertis</th>
                <th className="p-2">Moissonneurs</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((group) =>
                group.children.map((branch, index) => (
                  <tr
                    key={branch.branche_id}
                    className={
                      index === 0
                        ? "bg-gray-800 font-semibold"
                        : "bg-gray-700"
                    }
                  >
                    <td className="p-2 pl-4">
                      {index === 0
                        ? branch.branche_nom
                        : "↳ " + branch.branche_nom}
                    </td>
                    <td className="p-2 text-center">{branch.culte}</td>
                    <td className="p-2 text-center">{branch.hommes}</td>
                    <td className="p-2 text-center">{branch.femmes}</td>
                    <td className="p-2 text-center">{branch.jeunes}</td>
                    <td className="p-2 text-center">{branch.total_hfj}</td>
                    <td className="p-2 text-center">{branch.enfants}</td>
                    <td className="p-2 text-center">{branch.connectes}</td>
                    <td className="p-2 text-center">{branch.nouveaux_venus}</td>
                    <td className="p-2 text-center">{branch.nouveau_converti}</td>
                    <td className="p-2 text-center">{branch.moissonneurs}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
