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

    let processed = [];

    if (error || !data || data.length === 0) {
      // Données de test pour visuel
      processed = [
        {
          nom: "Cité Royale",
          enfants: [
            {
              branche_nom: "Antioche",
              superviseur_nom: "Cité Royale",
              culte: 18,
              hommes: 25,
              femmes: 40,
              jeunes: 15,
              total_hfj: 80,
              enfants: 10,
              connectes: 12,
              nouveauxVenus: 8,
              nouveauxConvertis: 5,
              moissonneurs: 0
            },
            {
              branche_nom: "Rose Hill",
              superviseur_nom: "Antioche",
              culte: 22,
              hommes: 30,
              femmes: 25,
              jeunes: 12,
              total_hfj: 67,
              enfants: 8,
              connectes: 10,
              nouveauxVenus: 7,
              nouveauxConvertis: 3,
              moissonneurs: 0
            },
            {
              branche_nom: "Port Louis",
              superviseur_nom: "Antioche",
              culte: 20,
              hommes: 18,
              femmes: 22,
              jeunes: 10,
              total_hfj: 50,
              enfants: 5,
              connectes: 9,
              nouveauxVenus: 6,
              nouveauxConvertis: 4,
              moissonneurs: 0
            }
          ]
        }
      ];
    } else {
      // Organiser les vraies données par parent → enfants
      const hierarchy = {};
      data.forEach((item) => {
        const parentId = item.superviseur_id || item.branche_id;
        if (!hierarchy[parentId]) {
          hierarchy[parentId] = {
            nom: item.superviseur_nom || item.branche_nom,
            enfants: []
          };
        }
        if (item.branche_id !== parentId) {
          hierarchy[parentId].enfants.push(item);
        } else if (!item.superviseur_id) {
          hierarchy[parentId].enfants.push(item);
        }
      });
      processed = Object.values(hierarchy);
    }

    setStats(processed);
    setLoading(false);
  }

  return (
    <div className="p-4">
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
            {stats.map((parent) => (
              <div key={parent.nom} className="space-y-2">
                <div className="font-bold text-xl text-white">{parent.nom}</div>
                {parent.enfants.map((branch) => (
                  <div key={branch.branche_nom} className="space-y-1 pl-4">
                    <div className="font-semibold text-white">
                      {branch.branche_nom} {branch.superviseur_nom && `(${branch.superviseur_nom})`}
                    </div>
                    <div className="grid grid-cols-10 gap-2 text-sm text-white bg-white/5 rounded-xl px-4 py-2">
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
                      <div>{branch.hommes}</div>
                      <div>{branch.femmes}</div>
                      <div>{branch.jeunes}</div>
                      <div>{branch.total_hfj}</div>
                      <div>{branch.enfants}</div>
                      <div>{branch.connectes}</div>
                      <div>{branch.nouveauxVenus}</div>
                      <div>{branch.nouveauxConvertis}</div>
                      <div>{branch.moissonneurs}</div>
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
