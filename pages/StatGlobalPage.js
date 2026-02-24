"use client";

import { useState, useEffect } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";

// 🔹 Fonction utilitaire pour obtenir le dernier jour du mois
const getLastDayOfMonth = (year, month) => {
  return new Date(year, month, 0).getDate(); // month = 1..12
};

export default function StatGlobalPage() {
  const [superviseur, setSuperviseur] = useState({ prenom: "", nom: "", eglise_id: null });
  const [mois, setMois] = useState("01"); // janvier par défaut
  const [annee, setAnnee] = useState(new Date().getFullYear());
  const [totalGlobal, setTotalGlobal] = useState({});
  const [statsParEglise, setStatsParEglise] = useState({});

  // 🔹 Charger superviseur connecté
  useEffect(() => {
    const loadSuperviseur = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("prenom, nom, eglise_id")
        .eq("id", user.id)
        .single();

      if (!error) setSuperviseur({ prenom: data.prenom, nom: data.nom, eglise_id: data.eglise_id });
    };
    loadSuperviseur();
  }, []);

  // 🔹 Récupérer toutes les églises en cascade
  const getEglisesCascade = async (egliseId) => {
    let allEglises = [egliseId];
    try {
      const { data, error } = await supabase
        .from("eglise_supervisions")
        .select("eglise_nom, superviseur_eglise_nom, statut")
        .eq("statut", "accepted");

      if (error) throw error;
      if (!data) return allEglises;

      let queue = [egliseId];
      while (queue.length > 0) {
        const parent = queue.shift();
        const enfants = data
          .filter(d => d.superviseur_eglise_nom === parent)
          .map(d => d.eglise_nom);
        allEglises.push(...enfants);
        queue.push(...enfants);
      }
      return Array.from(new Set(allEglises));
    } catch (err) {
      console.error("Erreur récupération églises :", err);
      return [egliseId];
    }
  };

  // 🔹 Charger les stats
  const loadStats = async () => {
    if (!superviseur.eglise_id) return;

    const egliseNoms = await getEglisesCascade(superviseur.eglise_id);
    const lastDay = getLastDayOfMonth(annee, parseInt(mois));

    try {
      const { data, error } = await supabase
        .from("stats_ministere_besoin")
        .select("*")
        .in("eglise_nom", egliseNoms)
        .gte("date_action", `${annee}-${mois}-01`)
        .lte("date_action", `${annee}-${mois}-${lastDay}`);

      if (error) throw error;

      const total = {};
      const parEglise = {};

      data.forEach(row => {
        // total global
        if (!total[row.type]) total[row.type] = { hommes: 0, femmes: 0, enfants: 0, visiteurs: 0 };
        total[row.type].hommes += row.valeur?.hommes || 0;
        total[row.type].femmes += row.valeur?.femmes || 0;
        total[row.type].enfants += row.valeur?.enfants || 0;
        total[row.type].visiteurs += row.valeur?.visiteurs || 0;

        // stats par église
        if (!parEglise[row.eglise_nom]) parEglise[row.eglise_nom] = {};
        if (!parEglise[row.eglise_nom][row.type]) parEglise[row.eglise_nom][row.type] = { hommes: 0, femmes: 0, enfants: 0, visiteurs: 0 };
        parEglise[row.eglise_nom][row.type].hommes += row.valeur?.hommes || 0;
        parEglise[row.eglise_nom][row.type].femmes += row.valeur?.femmes || 0;
        parEglise[row.eglise_nom][row.type].enfants += row.valeur?.enfants || 0;
        parEglise[row.eglise_nom][row.type].visiteurs += row.valeur?.visiteurs || 0;
      });

      setTotalGlobal(total);
      setStatsParEglise(parEglise);

    } catch (err) {
      console.error("Erreur stats :", err);
    }
  };

  useEffect(() => {
    loadStats();
  }, [superviseur, mois, annee]);

  return (
    <div className="min-h-screen bg-[#333699] text-white p-6 flex flex-col items-center">
      <HeaderPages />
      <h4 className="text-2xl font-bold mb-6 text-center w-full max-w-5xl">Statistiques Globales</h4>

      {/* Filtres */}
      <div className="w-full max-w-md bg-white text-black rounded-2xl shadow-lg p-6 space-y-4 mb-10">
        <div>
          <label className="font-semibold">Mois</label>
          <select className="w-full border rounded-xl px-3 py-2" value={mois} onChange={e => setMois(e.target.value)}>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={(i + 1).toString().padStart(2, "0")}>{new Date(0, i).toLocaleString('fr-FR', { month: 'long' })}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="font-semibold">Année</label>
          <input
            className="w-full border rounded-xl px-3 py-2"
            type="number"
            value={annee}
            onChange={e => setAnnee(parseInt(e.target.value))}
          />
        </div>
        <button
          className="w-full py-2 rounded-xl bg-[#ffcc00] text-black font-semibold hover:bg-[#e6b800]"
          onClick={loadStats}
        >
          Générer
        </button>
      </div>

      {/* TOTAL GLOBAL */}
      <div className="w-full max-w-5xl mb-10">
        <h4 className="text-xl font-bold text-amber-300 mb-3">TOTAL GLOBAL — {new Date(0, parseInt(mois)-1).toLocaleString('fr-FR', { month: 'long' })} {annee}</h4>
        <table className="w-full text-sm border bg-white text-black rounded-lg overflow-hidden">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-3 py-2 border">Type</th>
              <th className="px-3 py-2 border">Hommes</th>
              <th className="px-3 py-2 border">Femmes</th>
              <th className="px-3 py-2 border">Enfants</th>
              <th className="px-3 py-2 border">Visiteurs</th>
              <th className="px-3 py-2 border">Total</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(totalGlobal).map(([type, vals]) => (
              <tr key={type}>
                <td className="px-3 py-2 border">{type}</td>
                <td className="px-3 py-2 border">{vals.hommes}</td>
                <td className="px-3 py-2 border">{vals.femmes}</td>
                <td className="px-3 py-2 border">{vals.enfants}</td>
                <td className="px-3 py-2 border">{vals.visiteurs}</td>
                <td className="px-3 py-2 border">{vals.hommes + vals.femmes + vals.enfants + vals.visiteurs}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* DÉTAIL PAR ÉGLISE */}
      <div className="w-full max-w-5xl mb-10">
        <h4 className="text-xl font-bold text-amber-300 mb-3">DÉTAIL PAR ÉGLISE</h4>
        {Object.entries(statsParEglise).map(([egliseNom, types]) => (
          <div key={egliseNom} className="mb-8">
            <h5 className="text-lg font-semibold mb-2">📍 {egliseNom}</h5>
            <table className="w-full text-sm border bg-white text-black rounded-lg overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-2 border">Type</th>
                  <th className="px-3 py-2 border">Hommes</th>
                  <th className="px-3 py-2 border">Femmes</th>
                  <th className="px-3 py-2 border">Enfants</th>
                  <th className="px-3 py-2 border">Visiteurs</th>
                  <th className="px-3 py-2 border">Total</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(types).map(([type, vals]) => (
                  <tr key={type}>
                    <td className="px-3 py-2 border">{type}</td>
                    <td className="px-3 py-2 border">{vals.hommes}</td>
                    <td className="px-3 py-2 border">{vals.femmes}</td>
                    <td className="px-3 py-2 border">{vals.enfants}</td>
                    <td className="px-3 py-2 border">{vals.visiteurs}</td>
                    <td className="px-3 py-2 border">{vals.hommes + vals.femmes + vals.enfants + vals.visiteurs}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}
