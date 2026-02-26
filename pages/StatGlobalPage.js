"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import dayjs from "dayjs";

export default function StatGlobalPage() {
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
        console.error("Supabase error:", error);
        setStats([]);
        setLoading(false);
        return;
      }

      if (!data || data.length === 0) {
        setStats([]);
        setLoading(false);
        return;
      }

      // 1️⃣ CUMUL PAR BRANCHE_ID
      const grouped = {};
      data.forEach((item) => {
        const id = item.branche_id;
        if (!grouped[id]) {
          grouped[id] = {
            branche_id: id,
            branche_nom: item.branche_nom,
            eglise: item.eglis_nom || "",
            superviseur_id: item.superviseur_id,
            enfants: [],
            culte: 0,
            hommes: 0,
            femmes: 0,
            jeunes: 0,
            total_hfj: 0,
            enfants_count: 0,
            connectes: 0,
            nouveaux_venus: 0,
            nouveau_converti: 0,
            moissonneurs: 0,
          };
        }

        grouped[id].culte += item.culte || 0;
        grouped[id].hommes += item.hommes || 0;
        grouped[id].femmes += item.femmes || 0;
        grouped[id].jeunes += item.jeunes || 0;
        grouped[id].total_hfj += item.total_hfj || 0;
        grouped[id].enfants_count += item.enfants || 0;
        grouped[id].connectes += item.connectes || 0;
        grouped[id].nouveaux_venus += item.nouveaux_venus || 0;
        grouped[id].nouveau_converti += item.nouveau_converti || 0;
        grouped[id].moissonneurs += item.moissonneurs || 0;
      });

      let branches = Object.values(grouped);

      // 2️⃣ Supprimer branches vides ou "Eglise Principale" non supervisée
      branches = branches.filter((b) => {
        const total =
          b.culte +
          b.hommes +
          b.femmes +
          b.jeunes +
          b.total_hfj +
          b.enfants_count +
          b.connectes +
          b.nouveaux_venus +
          b.nouveau_converti +
          b.moissonneurs;

        if (total === 0) return false;
        if (b.branche_nom?.toLowerCase() === "eglise principale" && !b.superviseur_id)
          return false;
        return true;
      });

      // 3️⃣ Construire hiérarchie correctement
      const branchMap = {};
      branches.forEach((b) => (branchMap[b.branche_id] = b));

      const roots = [];
      branches.forEach((b) => {
        if (b.superviseur_id && branchMap[b.superviseur_id]) {
          branchMap[b.superviseur_id].enfants.push(b);
        } else {
          roots.push(b);
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

  const renderBranch = (branch, level = 0) => (
    <div key={branch.branche_id} className="space-y-2">
      <div className={`text-lg font-bold`} style={{ marginLeft: level * 20 }}>
        {branch.branche_nom} {branch.eglise && `(${branch.eglise})`}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-gray-600 text-gray-300">
              <th className="text-left py-1 w-20">Culte</th>
              <th className="text-right px-2">Hommes</th>
              <th className="text-right px-2">Femmes</th>
              <th className="text-right px-2">Jeunes</th>
              <th className="text-right px-2">Total HFJ</th>
              <th className="text-right px-2">Enfants</th>
              <th className="text-right px-2">Connectés</th>
              <th className="text-right px-2">Nouveaux</th>
              <th className="text-right px-2">Convertis</th>
              <th className="text-right px-2">Moissonneurs</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-700">
              <td className="py-1 font-semibold">{branch.culte}</td>
              <td className="text-right px-2">{branch.hommes}</td>
              <td className="text-right px-2">{branch.femmes}</td>
              <td className="text-right px-2">{branch.jeunes}</td>
              <td className="text-right px-2 font-bold">{branch.total_hfj}</td>
              <td className="text-right px-2">{branch.enfants_count}</td>
              <td className="text-right px-2">{branch.connectes}</td>
              <td className="text-right px-2">{branch.nouveaux_venus}</td>
              <td className="text-right px-2">{branch.nouveau_converti}</td>
              <td className="text-right px-2">{branch.moissonneurs}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {branch.enfants.length > 0 &&
        branch.enfants.map((child) => renderBranch(child, level + 1))}
    </div>
  );

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
        <div className="space-y-6">
          <div className="text-xl font-bold text-yellow-400">
            Date : {startDate} – {endDate}
          </div>
          {stats.map((branch) => renderBranch(branch))}
        </div>
      )}
    </div>
  );
}
