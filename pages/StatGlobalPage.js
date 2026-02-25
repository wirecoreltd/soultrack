"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import Footer from "../components/Footer";

export default function StatGlobalPage() {
  const [statsGrouped, setStatsGrouped] = useState({});
  const [loading, setLoading] = useState(true);
  const [mois, setMois] = useState(new Date().getMonth() + 1);
  const [annee, setAnnee] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchStats();
  }, [mois, annee]);

  const fetchStats = async () => {
    setLoading(true);

    try {
      const startDate = `${annee}-${String(mois).padStart(2, "0")}-01`;
      const endDate = new Date(annee, mois, 0)
        .toISOString()
        .split("T")[0];

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      // 🔥 Récupère toutes les stats avec jointure
      const { data, error } = await supabase
        .from("stats_ministere_besoin")
        .select(`
          type,
          valeur,
          date_action,
          membres_complets (
            sexe,
            eglise_id,
            branche_id,
            eglises ( nom ),
            branches ( nom )
          )
        `)
        .gte("date_action", startDate)
        .lte("date_action", endDate);

      if (error) {
        console.error("Erreur stats :", error);
        setLoading(false);
        return;
      }

      // 🔥 Regroupement Église + Branche
      const grouped = {};

      data.forEach((stat) => {
        const membre = stat.membres_complets;
        if (!membre) return;

        const egliseNom = membre.eglises?.nom || "Sans église";
        const brancheNom = membre.branches?.nom || "Sans branche";
        const sexe = membre.sexe;
        const type = stat.type;
        const valeur = Number(stat.valeur || 0);

        const key = `${egliseNom}|||${brancheNom}`;

        if (!grouped[key]) grouped[key] = {};
        if (!grouped[key][type])
          grouped[key][type] = { hommes: 0, femmes: 0 };

        if (sexe === "Homme")
          grouped[key][type].hommes += valeur;

        if (sexe === "Femme")
          grouped[key][type].femmes += valeur;
      });

      setStatsGrouped(grouped);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 text-white">
      <HeaderPages title="Stats Globales" />

      <div className="p-6 max-w-6xl mx-auto">

        {/* 🔥 FILTRE MOIS */}
        <div className="flex gap-4 mb-8">
          <select
            value={mois}
            onChange={(e) => setMois(Number(e.target.value))}
            className="text-black px-4 py-2 rounded-lg"
          >
            {[...Array(12)].map((_, i) => (
              <option key={i} value={i + 1}>
                Mois {i + 1}
              </option>
            ))}
          </select>

          <input
            type="number"
            value={annee}
            onChange={(e) => setAnnee(Number(e.target.value))}
            className="text-black px-4 py-2 rounded-lg"
          />
        </div>

        {loading && (
          <div className="text-center text-xl animate-pulse">
            Chargement...
          </div>
        )}

        {!loading &&
          Object.entries(statsGrouped).map(([key, ministeres]) => {
            const [egliseNom, brancheNom] = key.split("|||");

            return (
              <div
                key={key}
                className="mb-10 bg-white/10 p-6 rounded-3xl shadow-lg"
              >
                <h2 className="text-2xl font-bold mb-2">
                  {egliseNom}
                </h2>
                <p className="mb-4 text-sm opacity-80">
                  Branche : {brancheNom}
                </p>

                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/30">
                      <th className="py-2">Ministère</th>
                      <th>Hommes</th>
                      <th>Femmes</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(ministeres).map(
                      ([type, values]) => (
                        <tr key={type} className="border-b border-white/10">
                          <td className="py-2 capitalize">{type}</td>
                          <td>{values.hommes}</td>
                          <td>{values.femmes}</td>
                          <td>
                            {values.hommes + values.femmes}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            );
          })}

        {!loading && Object.keys(statsGrouped).length === 0 && (
          <div className="text-center text-lg opacity-70">
            Aucune donnée pour cette période
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
