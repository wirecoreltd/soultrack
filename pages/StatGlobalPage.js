"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import ProtectedRoute from "../components/ProtectedRoute";

export default function StatGlobalPage() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mois, setMois] = useState(new Date().getMonth() + 1);
  const [annee, setAnnee] = useState(new Date().getFullYear());

  const egliseId =
    typeof window !== "undefined"
      ? localStorage.getItem("eglise_id")
      : null;

  const getLastDayOfMonth = (year, month) => {
    return new Date(year, month, 0).getDate();
  };

  const loadStats = async () => {
    if (!egliseId) {
      console.log("Pas d'eglise_id");
      return;
    }

    setLoading(true);

    try {
      const lastDay = getLastDayOfMonth(annee, mois);

      const { data, error } = await supabase
        .from("stats_ministere_besoin")
        .select("*")
        .eq("eglise_id", egliseId)
        .gte("date_action", `${annee}-${String(mois).padStart(2, "0")}-01`)
        .lte(
          "date_action",
          `${annee}-${String(mois).padStart(2, "0")}-${lastDay}`
        );

      if (error) {
        console.error(error);
      } else {
        setStats(data || []);
      }
    } catch (err) {
      console.error("Erreur catch :", err);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadStats();
  }, [mois, annee]);

  const grouped = stats.reduce((acc, item) => {
    if (!acc[item.type]) {
      acc[item.type] = { hommes: 0, femmes: 0 };
    }

    if (item.valeur === "homme") acc[item.type].hommes++;
    if (item.valeur === "femme") acc[item.type].femmes++;

    return acc;
  }, {});

  return (
    <ProtectedRoute>
      <HeaderPages title="📊 Stats Globales" />

      <div className="p-6 max-w-5xl mx-auto">

        {/* FILTRES */}
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

        {loading && <p>Chargement...</p>}

        {!loading && (
          <div className="bg-white shadow rounded-2xl p-6">

            <h2 className="text-xl font-bold mb-4">
              ➕ {mois}/{annee}
            </h2>

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
                {Object.entries(grouped).map(([type, values]) => (
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
        )}
      </div>
    </ProtectedRoute>
  );
}
