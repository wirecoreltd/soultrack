"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import ProtectedRoute from "../components/ProtectedRoute";

export default function StatGlobalPage() {
  const [stats, setStats] = useState([]);
  const [eglisesMap, setEglisesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [mois, setMois] = useState(new Date().getMonth() + 1);
  const [annee, setAnnee] = useState(new Date().getFullYear());

  const egliseId =
    typeof window !== "undefined"
      ? localStorage.getItem("eglise_id")
      : null;

  const getLastDayOfMonth = (year, month) => {
    return new Date(year, month, 0).getDate();
  };

  // 🔥 CASCADE DES EGLISES
  const getEglisesCascade = async (startId) => {
    let all = [startId];

    const { data } = await supabase
      .from("eglise_supervisions")
      .select("eglise_supervisee_id, superviseur_eglise_id, statut")
      .eq("statut", "accepted");

    let queue = [startId];

    while (queue.length > 0) {
      const parent = queue.shift();

      const enfants = data
        ?.filter((d) => d.superviseur_eglise_id === parent)
        .map((d) => d.eglise_supervisee_id) || [];

      all.push(...enfants);
      queue.push(...enfants);
    }

    return Array.from(new Set(all));
  };

  const loadStats = async () => {
    if (!egliseId) return;

    setLoading(true);

    const egliseIds = await getEglisesCascade(egliseId);
    const lastDay = getLastDayOfMonth(annee, mois);

    // 🔥 Charger noms des églises
    const { data: eglisesData } = await supabase
      .from("eglises")
      .select("id, nom")
      .in("id", egliseIds);

    const map = {};
    eglisesData?.forEach((e) => {
      map[e.id] = e.nom;
    });

    setEglisesMap(map);

    // 🔥 Charger stats
    const { data, error } = await supabase
      .from("stats_ministere_besoin")
      .select("*")
      .in("eglise_id", egliseIds)
      .gte("date_action", `${annee}-${String(mois).padStart(2, "0")}-01`)
      .lte(
        "date_action",
        `${annee}-${String(mois).padStart(2, "0")}-${lastDay}`
      );

    if (error) {
      console.error("Erreur stats :", error);
      setLoading(false);
      return;
    }

    setStats(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadStats();
  }, [mois, annee]);

  // 🔥 GROUPER PAR EGLISE → PAR TYPE
  const grouped = stats.reduce((acc, item) => {
    if (!acc[item.eglise_id]) {
      acc[item.eglise_id] = {};
    }

    if (!acc[item.eglise_id][item.type]) {
      acc[item.eglise_id][item.type] = { hommes: 0, femmes: 0 };
    }

    if (item.valeur === "homme")
      acc[item.eglise_id][item.type].hommes += 1;

    if (item.valeur === "femme")
      acc[item.eglise_id][item.type].femmes += 1;

    return acc;
  }, {});

  return (
    <ProtectedRoute>
      <HeaderPages title="📊 Stats Globales" />

      <div className="p-6 max-w-6xl mx-auto">

        {/* FILTRE */}
        <div className="flex gap-4 mb-6">
          <select
            value={mois}
            onChange={(e) => setMois(Number(e.target.value))}
            className="border rounded-lg p-2"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                Mois {i + 1}
              </option>
            ))}
          </select>

          <input
            type="number"
            value={annee}
            onChange={(e) => setAnnee(Number(e.target.value))}
            className="border rounded-lg p-2 w-24"
          />
        </div>

        {loading ? (
          <p>Chargement...</p>
        ) : (
          <div>

            <h2 className="text-2xl font-bold mb-6">
              ➕ {mois}/{annee}
            </h2>

            {Object.entries(grouped).map(([egliseId, types]) => (
              <div
                key={egliseId}
                className="bg-white shadow rounded-2xl p-6 mb-8"
              >
                <h3 className="text-xl font-bold mb-4 text-blue-600">
                  {eglisesMap[egliseId] || "Église"}
                </h3>

                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="p-2">Ministère</th>
                      <th className="p-2">Hommes</th>
                      <th className="p-2">Femmes</th>
                      <th className="p-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(types).map(([type, values]) => (
                      <tr key={type} className="border-b">
                        <td className="p-2 capitalize">{type}</td>
                        <td className="p-2">{values.hommes}</td>
                        <td className="p-2">{values.femmes}</td>
                        <td className="p-2 font-semibold">
                          {values.hommes + values.femmes}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}

          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
