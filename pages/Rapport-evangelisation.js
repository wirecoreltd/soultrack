"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";

export default function RapportEvangelisation() {
  const [loading, setLoading] = useState(true);
  const [rapport, setRapport] = useState([]);
  const [gagneurAme, setGagneurAme] = useState("");
  const [nombreGagneurs, setNombreGagneurs] = useState("");
  const [nombreMoissonneurs, setNombreMoissonneurs] = useState("");

  useEffect(() => {
    fetchRapport();
  }, []);

  async function fetchRapport() {
    setLoading(true);

    const { data, error } = await supabase
      .from("evangelisation")
      .select("*");

    if (error) {
      console.log(error);
      setLoading(false);
      return;
    }

    // Groupement par date
    const grouped = {};

    data.forEach((item) => {
      const date = item.created_at.split("T")[0];

      if (!grouped[date]) {
        grouped[date] = {
          hommes: 0,
          femmes: 0,
          priere_salut: 0,
          nouveau_converti: 0,
          reconciliation: 0,
        };
      }

      if (item.sexe === "Homme") grouped[date].hommes++;
      if (item.sexe === "Femme") grouped[date].femmes++;

      if (item.priere_salut === true) grouped[date].priere_salut++;

      if (item.type_conversion === "nouveau_converti")
        grouped[date].nouveau_converti++;

      if (item.type_conversion === "reconciliation")
        grouped[date].reconciliation++;
    });

    const finalArray = Object.entries(grouped).map(([date, stats]) => ({
      date,
      ...stats,
    }));

    setRapport(finalArray);
    setLoading(false);
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">📊 Rapport Évangélisation</h1>

      {/* Champs libres */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="p-4 bg-white rounded-xl shadow">
          <label className="font-semibold">Gagneur d’âme (nom)</label>
          <input
            type="text"
            className="w-full mt-2 p-2 border rounded-lg"
            value={gagneurAme}
            onChange={(e) => setGagneurAme(e.target.value)}
            placeholder="Nom du gagneur d’âme"
          />
        </div>

        <div className="p-4 bg-white rounded-xl shadow">
          <label className="font-semibold">Nombre de gagneurs d’âme</label>
          <input
            type="text"
            className="w-full mt-2 p-2 border rounded-lg"
            value={nombreGagneurs}
            onChange={(e) => setNombreGagneurs(e.target.value)}
            placeholder="Exemple : 4"
          />
        </div>

        <div className="p-4 bg-white rounded-xl shadow">
          <label className="font-semibold">Nombre de moissonneurs</label>
          <input
            type="text"
            className="w-full mt-2 p-2 border rounded-lg"
            value={nombreMoissonneurs}
            onChange={(e) => setNombreMoissonneurs(e.target.value)}
            placeholder="Exemple : 3"
          />
        </div>
      </div>

      {/* Tableau */}
      <div className="overflow-x-auto">
        <table className="min-w-full border rounded-xl overflow-hidden">
          <thead className="bg-gray-200 text-gray-700">
            <tr>
              <th className="p-3 text-left">Date</th>
              <th className="p-3">Hommes</th>
              <th className="p-3">Femmes</th>
              <th className="p-3">Prière du salut</th>
              <th className="p-3">Nouveau Converti</th>
              <th className="p-3">Réconciliation</th>
              <th className="p-3">Gagneur d’âme</th>
              <th className="p-3">Nb. Gagneurs d’âme</th>
              <th className="p-3">Nb. Moissonneurs</th>
            </tr>
          </thead>

          <tbody>
            {rapport.map((r) => (
              <tr key={r.date} className="border-b">
                <td className="p-3">{r.date}</td>
                <td className="p-3 text-center">{r.hommes}</td>
                <td className="p-3 text-center">{r.femmes}</td>
                <td className="p-3 text-center">{r.priere_salut}</td>
                <td className="p-3 text-center">{r.nouveau_converti}</td>
                <td className="p-3 text-center">{r.reconciliation}</td>
                <td className="p-3 text-center">{gagneurAme || "-"}</td>
                <td className="p-3 text-center">{nombreGagneurs || "-"}</td>
                <td className="p-3 text-center">{nombreMoissonneurs || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {loading && <p className="text-gray-500">Chargement...</p>}
    </div>
  );
}
