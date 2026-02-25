"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import dayjs from "dayjs";

export default function GlobalStats() {
  const [stats, setStats] = useState([]);
  const [startDate, setStartDate] = useState(dayjs().startOf("month").format("YYYY-MM-DD"));
  const [endDate, setEndDate] = useState(dayjs().endOf("month").format("YYYY-MM-DD"));
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
      setLoading(false);
      return;
    }

    // ----- Construire la hiérarchie -----
    const hierarchy = {};
    const branchMapById = {};
    const branchMapByName = {};

    // Stocker toutes les branches
    data.forEach((item) => {
      branchMapById[item.branche_id] = item;
      branchMapByName[item.branche_nom.toLowerCase()] = item;
    });

    // Construire parent → enfants
    data.forEach((item) => {
      let parentId = null;

      if (item.superviseur_id && branchMapById[item.superviseur_id]) {
        parentId = item.superviseur_id;
      } else if (
        item.superviseur_nom &&
        branchMapByName[item.superviseur_nom.toLowerCase()]
      ) {
        parentId = branchMapByName[item.superviseur_nom.toLowerCase()].branche_id;
      }

      if (parentId) {
        if (!hierarchy[parentId]) {
          hierarchy[parentId] = { parent: branchMapById[parentId], enfants: [] };
        }
        hierarchy[parentId].enfants.push(item);
      } else {
        if (!hierarchy[item.branche_id]) {
          hierarchy[item.branche_id] = { parent: item, enfants: [] };
        }
      }
    });

    setStats(Object.values(hierarchy));
    setLoading(false);
  }

  function renderBranch(branch, level = 0) {
    return (
      <div key={branch.branche_id} className="space-y-2 pl-{level * 4}">
        <div className="font-semibold text-white">
          {branch.branche_nom} {branch.superviseur_nom && `(${branch.superviseur_nom})`}
        </div>
        <div className="grid grid-cols-10 gap-2 text-sm text-white bg-gray-800 rounded-xl px-4 py-2">
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

        {branch.enfants &&
          branch.enfants.length > 0 &&
          branch.enfants.map((child) => renderBranch(child, level + 1))}
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-900 min-h-screen">
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
          className="bg-blue-600 text-white px-4 py-1 rounded"
        >
          Filtrer
        </button>
      </div>

      {loading ? (
        <div className="text-white">Chargement...</div>
      ) : stats.length === 0 ? (
        <div className="text-white">Aucune donnée trouvée pour cette période.</div>
      ) : (
        <div className="w-full max-w-full overflow-x-auto scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent">
          <div className="w-max space-y-6">
            {stats.map(({ parent, enfants }) => renderBranch({ ...parent, enfants }))}
          </div>
        </div>
      )}
    </div>
  );
}
