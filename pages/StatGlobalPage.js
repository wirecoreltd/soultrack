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
      .order("superviseur_nom", { ascending: true })
      .order("branche_nom", { ascending: true });

    if (error) {
      console.error(error);
      setStats([]);
      setLoading(false);
      return;
    }

    // Filtrer les branches vides ou "Eglise Principale"
    const filtered = data.filter(
      (b) =>
        b.branche_nom &&
        b.branche_nom.trim() !== "" &&
        b.branche_nom.toLowerCase() !== "eglise principale"
    );

    // Construire la hiérarchie parent → enfants
    const hierarchy = {};
    filtered.forEach((item) => {
      const parentId = item.superviseur_id || item.branche_id;
      if (!hierarchy[parentId]) {
        hierarchy[parentId] = {
          nom: item.superviseur_nom || item.branche_nom,
          enfants: [],
          values: !item.superviseur_id ? item : null,
        };
      }
      if (item.branche_id !== parentId) {
        hierarchy[parentId].enfants.push(item);
      }
    });

    setStats(Object.values(hierarchy));
    setLoading(false);
  }

  return (
    <div className="p-4 bg-gray-900 min-h-screen">
      <div className="flex gap-4 mb-6">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="px-2 py-1 rounded text-black"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="px-2 py-1 rounded text-black"
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
        <div className="overflow-x-auto w-full scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent">
          <div className="w-max space-y-6">
            {stats.map((parent) => (
              <div key={parent.nom} className="space-y-2">
                {/* Nom du parent */}
                <div className="font-bold text-xl text-white border-b border-white/30 pb-1">
                  {parent.nom}
                </div>

                {/* Header */}
                <div className="grid grid-cols-10 gap-2 text-sm font-semibold uppercase bg-white/10 rounded-xl px-4 py-2">
                  <div>Ministère</div>
                  <div>Hommes</div>
                  <div>Femmes</div>
                  <div>Jeunes</div>
                  <div>Total HFJ</div>
                  <div>Enfants</div>
                  <div>Connectés</div>
                  <div>Nouveaux Venus</div>
                  <div>Nouveau Converti</div>
                  <div>Moissonneurs</div>
                </div>

                {/* Valeurs parent si applicable */}
                {parent.values && (
                  <div className="grid grid-cols-10 gap-2 text-sm bg-white/5 rounded-xl px-4 py-2">
                    <div>Culte</div>
                    <div>{parent.values.hommes}</div>
                    <div>{parent.values.femmes}</div>
                    <div>{parent.values.jeunes}</div>
                    <div>{parent.values.total_hfj}</div>
                    <div>{parent.values.enfants}</div>
                    <div>{parent.values.connectes}</div>
                    <div>{parent.values.nouveauxVenus}</div>
                    <div>{parent.values.nouveauxConvertis}</div>
                    <div>{parent.values.moissonneurs || 0}</div>
                  </div>
                )}

                {/* Enfants */}
                {parent.enfants.map((branch) => (
                  <div key={branch.branche_id} className="pl-6 space-y-1">
                    <div className="font-semibold text-white">
                      {branch.branche_nom}{" "}
                      {branch.superviseur_nom && `(${branch.superviseur_nom})`}
                    </div>
                    <div className="grid grid-cols-10 gap-2 text-sm bg-white/5 rounded-xl px-4 py-2">
                      <div>Culte</div>
                      <div>{branch.hommes}</div>
                      <div>{branch.femmes}</div>
                      <div>{branch.jeunes}</div>
                      <div>{branch.total_hfj}</div>
                      <div>{branch.enfants}</div>
                      <div>{branch.connectes}</div>
                      <div>{branch.nouveauxVenus}</div>
                      <div>{branch.nouveauxConvertis}</div>
                      <div>{branch.moissonneurs || 0}</div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
