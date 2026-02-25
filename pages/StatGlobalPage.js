"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import Footer from "../components/Footer";

export default function RapportFormationPage() {
  const [mois, setMois] = useState(new Date().getMonth() + 1);
  const [annee, setAnnee] = useState(new Date().getFullYear());
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔹 Récupération des données depuis Supabase
  const fetchStats = async () => {
    setLoading(true);

    const monthNum = parseInt(mois, 10);
    const yearNum = parseInt(annee, 10);

    // On crée les bornes de dates pour le mois
    const startDate = `${yearNum}-${monthNum.toString().padStart(2, "0")}-01`;
    const endDate = `${yearNum}-${monthNum.toString().padStart(2, "0")}-31`;

    const { data, error } = await supabase
      .from("attendance") // 🔹 Remplace par le nom de ta table
      .select(`
        id,
        parent_nom,
        ministere,
        hommes,
        femmes
      `)
      .gte("date", startDate)
      .lte("date", endDate)
      .order("parent_nom", { ascending: true });

    if (error) {
      console.error(error);
      setStats([]);
      setLoading(false);
      return;
    }

    // 🔹 Transformation en structure parent → enfants
    const grouped = {};
    data.forEach((row) => {
      if (!grouped[row.parent_nom]) {
        grouped[row.parent_nom] = {
          parentNom: row.parent_nom,
          totalParentHommes: 0,
          totalParentFemmes: 0,
          totalParent: 0,
          enfants: [],
        };
      }

      grouped[row.parent_nom].enfants.push({
        id: row.id,
        nom: row.ministere,
        totalHommes: row.hommes,
        totalFemmes: row.femmes,
        total: row.hommes + row.femmes,
      });

      grouped[row.parent_nom].totalParentHommes += row.hommes;
      grouped[row.parent_nom].totalParentFemmes += row.femmes;
      grouped[row.parent_nom].totalParent += row.hommes + row.femmes;
    });

    setStats(Object.values(grouped));
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, [mois, annee]);

  const monthNum = parseInt(mois, 10);
  const yearNum = parseInt(annee, 10);

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderPages />

      <div className="p-6 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">
          {new Date(yearNum, monthNum - 1).toLocaleString("fr-FR", {
            month: "long",
            year: "numeric",
          })}
        </h2>

        {/* 🔹 Filtre mois/année */}
        <div className="mb-6 flex gap-4 items-center">
          <label>
            Mois:
            <input
              type="number"
              value={mois}
              min="1"
              max="12"
              onChange={(e) => setMois(e.target.value)}
              className="border p-2 rounded ml-2"
            />
          </label>
          <label>
            Année:
            <input
              type="number"
              value={annee}
              min="2000"
              max="2100"
              onChange={(e) => setAnnee(e.target.value)}
              className="border p-2 rounded ml-2"
            />
          </label>
        </div>

        {loading && <p>Chargement...</p>}

        {/* 🔹 Table parent → enfants */}
        {stats.map((parent) => (
          <div key={parent.parentNom} className="mb-8 bg-white p-4 rounded-xl shadow">
            <h3 className="text-lg font-semibold mb-2">{parent.parentNom}</h3>
            <table className="w-full border mb-4">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-2 border">Ministère</th>
                  <th className="p-2 border">Hommes</th>
                  <th className="p-2 border">Femmes</th>
                  <th className="p-2 border">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr className="font-bold">
                  <td className="p-2 border">Total</td>
                  <td className="p-2 border">{parent.totalParentHommes}</td>
                  <td className="p-2 border">{parent.totalParentFemmes}</td>
                  <td className="p-2 border">{parent.totalParent}</td>
                </tr>
              </tbody>
            </table>

            {parent.enfants.map((enfant) => (
              <div key={enfant.id} className="ml-6 mb-4">
                <h4 className="font-medium">{enfant.nom}</h4>
                <table className="w-full border">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-2 border">Ministère</th>
                      <th className="p-2 border">Hommes</th>
                      <th className="p-2 border">Femmes</th>
                      <th className="p-2 border">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2 border">{enfant.nom}</td>
                      <td className="p-2 border">{enfant.totalHommes}</td>
                      <td className="p-2 border">{enfant.totalFemmes}</td>
                      <td className="p-2 border">{enfant.total}</td>
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
