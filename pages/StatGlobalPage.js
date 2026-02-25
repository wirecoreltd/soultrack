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

    // Créer hiérarchie parent → enfants
    const hierarchy = {};

    // 1️⃣ Filtrer d’abord les branches vides ou Eglise Principale non supervisée
    const filtered = data.filter(
      (item) =>
        item.branche_nom &&
        item.branche_nom.toLowerCase() !== "eglise principale"
    );

    filtered.forEach((item) => {
      const parentId = item.superviseur_id || item.branche_id;

      // Créer parent si inexistant
      if (!hierarchy[parentId]) {
        hierarchy[parentId] = {
          id: parentId,
          nom: item.superviseur_nom || item.branche_nom,
          enfants: [],
        };
      }

      // Ajouter uniquement si ce n’est pas un parent lui-même
      if (item.branche_id !== parentId) {
        hierarchy[parentId].enfants.push(item);
      } else if (!item.superviseur_id) {
        hierarchy[parentId].enfants.push(item);
      }
    });

    // Supprimer les parents sans enfants pour éviter affichage vide
    const finalStats = Object.values(hierarchy).filter(
      (p) => p.enfants.length > 0
    );

    setStats(finalStats);
    setLoading(false);
  }

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      {/* Filtre dates */}
      <div className="flex gap-4 mb-6">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="px-3 py-2 rounded border border-gray-400"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="px-3 py-2 rounded border border-gray-400"
        />
        <button
          onClick={fetchStats}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Filtrer
        </button>
      </div>

      {/* Contenu */}
      {loading ? (
        <div className="text-white">Chargement...</div>
      ) : stats.length === 0 ? (
        <div className="text-white">Aucune donnée trouvée pour cette période.</div>
      ) : (
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-700">
          <div className="min-w-max space-y-6">
            {stats.map((parent) => (
              <div key={parent.id} className="space-y-2">
                {/* Parent */}
                <div className="text-2xl font-bold text-yellow-400">{parent.nom}</div>

                {parent.enfants.map((branch) => (
                  <div key={branch.branche_id} className="space-y-1 pl-6">
                    {/* Branche */}
                    <div className="text-lg font-semibold text-white mb-1">
                      {branch.branche_nom}{" "}
                      {branch.superviseur_nom && `(${branch.superviseur_nom})`}
                    </div>

                    {/* Tableau stats */}
                    <div className="grid grid-cols-10 gap-2 text-sm text-gray-100 bg-gray-800 rounded-xl px-4 py-2">
                      <div className="font-semibold">Culte</div>
                      <div className="font-semibold">Hommes</div>
                      <div className="font-semibold">Femmes</div>
                      <div className="font-semibold">Jeunes</div>
                      <div className="font-semibold">Total HFJ</div>
                      <div className="font-semibold">Enfants</div>
                      <div className="font-semibold">Connectés</div>
                      <div className="font-semibold">Nouveaux Venus</div>
                      <div className="font-semibold">Nouveau Converti</div>
                      <div className="font-semibold">Moissonneurs</div>

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
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
