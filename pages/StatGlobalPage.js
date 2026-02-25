"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";

export default function GlobalStatsPage() {
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    if (!dateDebut || !dateFin) return;

    setLoading(true);

    const { data, error } = await supabase
      .from("attendance_stats")
      .select("*")
      .gte("mois", dateDebut)
      .lte("mois", dateFin);

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    // 🔹 Filtrer branches valides (pas vide et pas "Eglise Principale")
    const filtered = data.filter(
      (row) =>
        row.branche_nom &&
        row.branche_nom.trim() !== "" &&
        row.branche_nom !== "Eglise Principale"
    );

    // 🔹 Grouper par branche
    const grouped = {};

    filtered.forEach((row) => {
      if (!grouped[row.branche_nom]) {
        grouped[row.branche_nom] = {
          branche: row.branche_nom,
          hommes: 0,
          femmes: 0,
          enfants: 0,
          nouveaux: 0,
          total: 0,
        };
      }

      grouped[row.branche_nom].hommes += row.hommes || 0;
      grouped[row.branche_nom].femmes += row.femmes || 0;
      grouped[row.branche_nom].enfants += row.enfants || 0;
      grouped[row.branche_nom].nouveaux += row.nouveaux || 0;
      grouped[row.branche_nom].total += row.total || 0;
    });

    setStats(Object.values(grouped));
    setLoading(false);
  };

  const getPeriodeLabel = () => {
    if (!dateDebut || !dateFin) return "";

    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);

    const mois = [
      "Janvier",
      "Février",
      "Mars",
      "Avril",
      "Mai",
      "Juin",
      "Juillet",
      "Août",
      "Septembre",
      "Octobre",
      "Novembre",
      "Décembre",
    ];

    if (
      debut.getMonth() === fin.getMonth() &&
      debut.getFullYear() === fin.getFullYear()
    ) {
      return `${mois[debut.getMonth()]} ${debut.getFullYear()}`;
    }

    return `Du ${debut.getDate()} ${
      mois[debut.getMonth()]
    } ${debut.getFullYear()} au ${fin.getDate()} ${
      mois[fin.getMonth()]
    } ${fin.getFullYear()}`;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <HeaderPages />

      <div className="max-w-6xl mx-auto p-6">

        {/* FILTRE DATE */}
        <div className="bg-white rounded-2xl shadow p-6 mb-8">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-sm font-medium mb-1">
                Date début
              </label>
              <input
                type="date"
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
                className="border rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Date fin
              </label>
              <input
                type="date"
                value={dateFin}
                onChange={(e) => setDateFin(e.target.value)}
                className="border rounded-lg px-3 py-2"
              />
            </div>

            <button
              onClick={fetchStats}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Filtrer
            </button>
          </div>
        </div>

        {/* TITRE PERIODE */}
        {stats.length > 0 && (
          <h2 className="text-2xl font-bold mb-6 text-center">
            {getPeriodeLabel()}
          </h2>
        )}

        {loading && <p>Chargement...</p>}

        {!loading && stats.length === 0 && (
          <p className="text-center text-gray-500">
            Aucune donnée trouvée pour cette période.
          </p>
        )}

        {/* TABLEAUX PAR BRANCHE */}
        {stats.map((branche, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow mb-8 p-6"
          >
            <h3 className="text-xl font-semibold mb-4 text-blue-700">
              {branche.branche}
            </h3>

            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 border">Ministère</th>
                  <th className="p-3 border">Hommes</th>
                  <th className="p-3 border">Femmes</th>
                  <th className="p-3 border">Enfants</th>
                  <th className="p-3 border">Nouveaux</th>
                  <th className="p-3 border">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-3 border font-medium">Culte</td>
                  <td className="p-3 border">{branche.hommes}</td>
                  <td className="p-3 border">{branche.femmes}</td>
                  <td className="p-3 border">{branche.enfants}</td>
                  <td className="p-3 border">{branche.nouveaux}</td>
                  <td className="p-3 border font-bold">
                    {branche.total}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}
