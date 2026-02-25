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
      .lte("mois", endDate)
      .order("branche_nom", { ascending: true });

    if (error) {
      console.error(error);
      setStats([]);
    } else {
      // Construire la hiérarchie parent → enfants
      const hierarchy = {};
      const branchMap = {};

      // On stocke toutes les branches dans une map pour référence
      data.forEach((item) => {
        branchMap[item.branche_id] = item;
      });

      data.forEach((item) => {
        // Si superviseur_id existe et correspond à une branche existante
        if (item.superviseur_id && branchMap[item.superviseur_id]) {
          const parentId = item.superviseur_id;
          if (!hierarchy[parentId]) {
            hierarchy[parentId] = {
              parent: branchMap[parentId],
              enfants: [],
            };
          }
          hierarchy[parentId].enfants.push(item);
        } else {
          // Branches sans superviseur deviennent "racines"
          if (!hierarchy[item.branche_id]) {
            hierarchy[item.branche_id] = { parent: item, enfants: [] };
          }
        }
      });

      setStats(Object.values(hierarchy));
    }
    setLoading(false);
  }

  return (
    <div className="p-4 bg-gray-900 min-h-screen text-gray-100">
      {/* Filtre dates */}
      <div className="flex gap-4 mb-4">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="px-2 py-1 rounded"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="px-2 py-1 rounded"
        />
        <button
          onClick={fetchStats}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded"
        >
          Filtrer
        </button>
      </div>

      {loading ? (
        <div>Chargement...</div>
      ) : stats.length === 0 ? (
        <div>Aucune donnée trouvée pour cette période.</div>
      ) : (
        <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-700">
          <div className="space-y-6">
            {stats.map(({ parent, enfants }) => (
              <div key={parent.branche_id} className="space-y-2">
                {/* Parent */}
                <div className="font-bold text-xl border-b border-gray-600 pb-1">
                  {parent.branche_nom}
                </div>

                {/* Enfants */}
                {enfants.map((branch) => (
                  <div
                    key={branch.branche_id}
                    className="ml-6 bg-gray-800/30 rounded-xl px-4 py-2 space-y-1"
                  >
                    <div className="font-semibold">
                      {branch.branche_nom}{" "}
                      {branch.superviseur_nom && `(${branch.superviseur_nom})`}
                    </div>
                    <div className="grid grid-cols-10 gap-2 text-sm text-gray-100">
                      <div>Culte</div>
                      <div>Hommes</div>
                      <div>Femmes</div>
                      <div>Jeunes</div>
                      <div>Total HFJ</div>
                      <div>Enfants</div>
                      <div>Connectés</div>
                      <div>Nouveaux Venus</div>
                      <div>Nouveau Converti</div>
                      <div>Moissonneurs</div>

                      <div>{branch.culte || 0}</div>
                      <div>{branch.hommes || 0}</div>
                      <div>{branch.femmes || 0}</div>
                      <div>{branch.jeunes || 0}</div>
                      <div>{branch.total_hfj || 0}</div>
                      <div>{branch.enfants || 0}</div>
                      <div>{branch.connectes || 0}</div>
                      <div>{branch.nouveauxVenus || 0}</div>
                      <div>{branch.nouveauxConvertis || 0}</div>
                      <div>{branch.moissonneurs || 0}</div>
                    </div>
                  </div>
                ))}

                {/* Si pas d’enfants */}
                {enfants.length === 0 && (
                  <div className="ml-6 text-gray-400 italic">Aucune branche enfant</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
