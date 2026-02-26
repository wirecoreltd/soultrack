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

      if (!data) {
        setStats([]);
        return;
      }

      // ✅ CUMUL PAR BRANCHE
     // ✅ CUMUL PAR NOM DE BRANCHE (ANTI-DOUBLONS)
const grouped = {};

data.forEach((item) => {
  const key = item.branche_nom?.trim();

  if (!key) return;

  if (!grouped[key]) {
    grouped[key] = {
      branche_nom: key,
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

      // ✅ SUPPRIMER BRANCHES VIDES
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

        if (
          b.branche_nom?.toLowerCase() === "eglise principale" &&
          !b.superviseur_id
        )
          return false;

        return true;
      });

      branches.sort((a, b) =>
  (a.branche_nom || "").localeCompare(b.branche_nom || "")
);;

      setStats(branches);
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
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
        <div className="space-y-10">
          <div className="text-xl font-bold text-yellow-400">
            Date : {startDate} – {endDate}
          </div>

          {stats.map((branch) => (
            <div key={branch.branche_id} className="space-y-2">
              <div className="text-2xl font-bold text-blue-400">
                {branch.branche_nom}
              </div>

              <table className="w-full text-sm border-collapse">
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
                    <td></td>
                    <td className="text-right px-4">{branch.hommes}</td>
                    <td className="text-right px-4">{branch.femmes}</td>
                    <td className="text-right px-4">{branch.jeunes}</td>
                    <td className="text-right px-4 font-bold">
                      {branch.total_hfj}
                    </td>
                    <td className="text-right px-4">{branch.enfants}</td>
                    <td className="text-right px-4">{branch.connectes}</td>
                    <td className="text-right px-4">{branch.nouveaux_venus}</td>
                    <td className="text-right px-4">
                      {branch.nouveau_converti}
                    </td>
                    <td className="text-right px-4">
                      {branch.moissonneurs}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
