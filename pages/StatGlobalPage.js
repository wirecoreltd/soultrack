"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";

export default function StatGlobalPage() {
  const [stats, setStats] = useState([]);
  const [dateDebut, setDateDebut] = useState("2026-01-01");
  const [dateFin, setDateFin] = useState("2026-01-31");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("attendance_stats_hierarchy")
      .select("*")
      .gte("mois", dateDebut)
      .lte("mois", dateFin)
      .order("sous_branche_nom", { ascending: true })
      .order("branche_nom", { ascending: true });

    if (error) {
      console.error(error);
      setStats([]);
    } else {
      setStats(data || []);
    }

    setLoading(false);
  };

  // 🔹 Grouper par branche principale
  const grouped = {};
  stats.forEach((row) => {
    const main = row.sous_branche_nom || row.branche_nom;
    const sub = row.sous_branche_nom ? row.branche_nom : null;

    if (!grouped[main]) {
      grouped[main] = { mainRow: null, subRows: [] };
    }

    if (!sub) grouped[main].mainRow = row;
    else grouped[main].subRows.push(row);
  });

  // 🔹 Total général
  const total = stats.reduce(
    (acc, row) => {
      acc.hommes += row.hommes;
      acc.femmes += row.femmes;
      acc.jeunes += row.jeunes;
      acc.enfants += row.enfants;
      acc.evangelises += row.evangelises;
      acc.baptises += row.baptises;
      acc.connectes += row.connectes;
      acc.nouveauxVenus += row.nouveauxVenus;
      acc.nouveauxConvertis += row.nouveauxConvertis;
      return acc;
    },
    {
      hommes: 0,
      femmes: 0,
      jeunes: 0,
      enfants: 0,
      evangelises: 0,
      baptises: 0,
      connectes: 0,
      nouveauxVenus: 0,
      nouveauxConvertis: 0,
    }
  );

  return (
    <div className="p-6 text-white">

      {/* 🔹 FILTRE DATE */}
      <div className="bg-white/10 p-4 rounded-2xl mb-6 flex gap-4 items-center">
        <div>
          <label className="block text-sm">Date début</label>
          <input
            type="date"
            value={dateDebut}
            onChange={(e) => setDateDebut(e.target.value)}
            className="text-black px-3 py-1 rounded"
          />
        </div>

        <div>
          <label className="block text-sm">Date fin</label>
          <input
            type="date"
            value={dateFin}
            onChange={(e) => setDateFin(e.target.value)}
            className="text-black px-3 py-1 rounded"
          />
        </div>

        <button
          onClick={fetchStats}
          className="bg-blue-600 px-4 py-2 rounded-xl hover:bg-blue-700"
        >
          Filtrer
        </button>
      </div>

      {/* 🔹 LOADING */}
      {loading && <p>Chargement...</p>}

      {!loading && stats.length === 0 && (
        <p>Aucune donnée trouvée pour ces dates.</p>
      )}

      {/* 🔹 AFFICHAGE HIERARCHIQUE */}
      <div className="space-y-6">
        {Object.keys(grouped).map((main) => {
          const group = grouped[main];

          return (
            <div key={main} className="bg-white/10 p-4 rounded-2xl">

              {/* Branche principale */}
              {group.mainRow && (
                <div className="mb-3">
                  <h2 className="font-bold text-lg">
                    {group.mainRow.branche_nom}
                  </h2>
                  <div className="ml-4 text-sm">
                    Culte :{" "}
                    {[
                      group.mainRow.hommes,
                      group.mainRow.femmes,
                      group.mainRow.jeunes,
                      group.mainRow.enfants,
                      group.mainRow.evangelises,
                      group.mainRow.baptises,
                      group.mainRow.connectes,
                      group.mainRow.nouveauxVenus,
                      group.mainRow.nouveauxConvertis,
                    ].join(" | ")}
                  </div>
                </div>
              )}

              {/* Sous-branches */}
              {group.subRows.map((sub) => (
                <div key={sub.branche_nom} className="ml-6 mb-2">
                  <h3 className="font-semibold">{sub.branche_nom}</h3>
                  <div className="ml-4 text-sm">
                    Culte :{" "}
                    {[
                      sub.hommes,
                      sub.femmes,
                      sub.jeunes,
                      sub.enfants,
                      sub.evangelises,
                      sub.baptises,
                      sub.connectes,
                      sub.nouveauxVenus,
                      sub.nouveauxConvertis,
                    ].join(" | ")}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* 🔹 TOTAL GENERAL */}
      {stats.length > 0 && (
        <div className="mt-8 bg-green-700 p-4 rounded-2xl font-bold">
          TOTAL :
          <div className="ml-4 text-sm">
            {[
              total.hommes,
              total.femmes,
              total.jeunes,
              total.enfants,
              total.evangelises,
              total.baptises,
              total.connectes,
              total.nouveauxVenus,
              total.nouveauxConvertis,
            ].join(" | ")}
          </div>
        </div>
      )}
    </div>
  );
}
