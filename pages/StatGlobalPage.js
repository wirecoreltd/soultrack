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
  if (!dateDebut || !dateFin) {
    alert("Sélectionne une date de début et de fin");
    return;
  }

  setLoading(true);

  // 🔹 Récupérer toutes les églises liées aux branches
  const { data: eglises } = await supabase
    .from("attendance")
    .select("eglise_id")
    .gte("date", dateDebut)
    .lte("date", dateFin)
    .in("branche_id", branchIds);

  if (!eglises || eglises.length === 0) {
    setAttendanceStats([]);
    setLoading(false);
    return;
  }

  const uniqueEglises = [...new Set(eglises.map(e => e.eglise_id))];

  // 🔹 Récupérer les noms des églises
  const { data: eglisesData } = await supabase
    .from("eglises")
    .select("id, nom")
    .in("id", uniqueEglises);

  // 🔹 Récupérer toutes les présences
  const { data: attendanceData } = await supabase
    .from("attendance")
    .select("*")
    .gte("date", dateDebut)
    .lte("date", dateFin)
    .in("branche_id", branchIds);

  // 🔹 Regroupement par église
  const grouped = {};

  attendanceData?.forEach(r => {
    if (!grouped[r.eglise_id]) {
      grouped[r.eglise_id] = { hommes: 0, femmes: 0 };
    }
    grouped[r.eglise_id].hommes += Number(r.hommes) || 0;
    grouped[r.eglise_id].femmes += Number(r.femmes) || 0;
  });

  // 🔹 Fusion avec noms
  const result = uniqueEglises.map(id => {
    const egliseInfo = eglisesData?.find(e => e.id === id);
    const stats = grouped[id] || { hommes: 0, femmes: 0 };

    return {
      eglise: egliseInfo?.nom || "Église inconnue",
      hommes: stats.hommes,
      femmes: stats.femmes,
      total: stats.hommes + stats.femmes,
    };
  });

  setAttendanceStats(result);
  setLoading(false);
};

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

        
  // 🔹 Fusion avec noms
  const result = uniqueEglises.map(id => {
    const egliseInfo = eglisesData?.find(e => e.id === id);
    const stats = grouped[id] || { hommes: 0, femmes: 0 };

    return {
      eglise: egliseInfo?.nom || "Église inconnue",
      hommes: stats.hommes,
      femmes: stats.femmes,
      total: stats.hommes + stats.femmes,
    };
  });

  setAttendanceStats(result);
  setLoading(false);
};
✅ MODIFIE L’AFFICHAGE

Remplace la partie table par :

{!loading && attendanceStats?.map((eglise, index) => (
  <div key={index} className="mt-8 w-full max-w-4xl bg-white/10 p-6 rounded-2xl shadow-lg">

    <h2 className="text-xl font-bold text-amber-300 mb-4">
      {eglise.eglise}
    </h2>

    <div className="overflow-x-auto">
      <table className="w-full text-white">
        <thead>
          <tr className="border-b border-white/30 text-left">
            <th className="py-2">Ministère</th>
            <th className="py-2 text-center">Hommes</th>
            <th className="py-2 text-center">Femmes</th>
            <th className="py-2 text-center">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-white/20">
            <td className="py-2 font-semibold">Culte</td>
            <td className="py-2 text-center">{eglise.hommes}</td>
            <td className="py-2 text-center">{eglise.femmes}</td>
            <td className="py-2 text-center font-bold">
              {eglise.total}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
))}
      </div>

      <Footer />
    </div>
  );
}
