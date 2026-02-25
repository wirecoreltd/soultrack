"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import Footer from "../components/Footer";

export default function RapportFormationPage() {
  const [mois, setMois] = useState(new Date().getMonth() + 1);
  const [annee, setAnnee] = useState(new Date().getFullYear());
  const [stats, setStats] = useState([]);

  useEffect(() => {
    fetchStats();
  }, [mois, annee]);

  const fetchStats = async () => {
    const monthNum = parseInt(mois, 10);
    const yearNum = parseInt(annee, 10);

    const { data: attendances } = await supabase
      .from("attendance")
      .select("*")
      .gte("date", `${yearNum}-${monthNum}-01`)
      .lte("date", `${yearNum}-${monthNum}-31`);

    // 🔹 Ici tu peux traiter branches/eglises comme dans l’exemple précédent
    // Pour simplifier, on fait un mock pour test
    setStats([
      {
        parentNom: "Cité Royale",
        totalParentHommes: 25,
        totalParentFemmes: 40,
        totalParent: 65,
        enfants: [
          { id: 1, nom: "Culte", totalHommes: 25, totalFemmes: 40, total: 65 },
        ],
      },
      {
        parentNom: "Antioche",
        totalParentHommes: 18,
        totalParentFemmes: 22,
        totalParent: 40,
        enfants: [
          { id: 2, nom: "Culte", totalHommes: 18, totalFemmes: 22, total: 40 },
        ],
      },
    ]);
  };

  const monthNum = parseInt(mois, 10);
  const yearNum = parseInt(annee, 10);

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderPages />

      <div className="p-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">
          {new Date(yearNum, monthNum - 1).toLocaleString("fr-FR", { month: "long", year: "numeric" })}
        </h2>

        {/* 🔹 Filtre date */}
        <div className="mb-6 flex gap-4">
          <input
            type="number"
            value={mois}
            min="1"
            max="12"
            onChange={(e) => setMois(e.target.value)}
            className="border p-2 rounded"
          />
          <input
            type="number"
            value={annee}
            min="2000"
            max="2100"
            onChange={(e) => setAnnee(e.target.value)}
            className="border p-2 rounded"
          />
        </div>

        {/* 🔹 Stats */}
        {stats.map(parent => (
          <div key={parent.parentNom} className="mb-6">
            <h3 className="text-lg font-semibold">{parent.parentNom}</h3>
            <table className="w-full border mb-2">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-2">Ministère</th>
                  <th className="p-2">Hommes</th>
                  <th className="p-2">Femmes</th>
                  <th className="p-2">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2">Culte</td>
                  <td className="p-2">{parent.totalParentHommes}</td>
                  <td className="p-2">{parent.totalParentFemmes}</td>
                  <td className="p-2">{parent.totalParent}</td>
                </tr>
              </tbody>
            </table>

            {parent.enfants.map(enfant => (
              <div key={enfant.id} className="ml-6 mb-4">
                <h4 className="font-medium">{enfant.nom}</h4>
                <table className="w-full border">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-2">Ministère</th>
                      <th className="p-2">Hommes</th>
                      <th className="p-2">Femmes</th>
                      <th className="p-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2">{enfant.nom}</td>
                      <td className="p-2">{enfant.totalHommes}</td>
                      <td className="p-2">{enfant.totalFemmes}</td>
                      <td className="p-2">{enfant.total}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        ))}
      </div>

      <Footer />
    </div>
  );
}
