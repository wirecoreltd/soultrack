"use client";

import { useState, useEffect } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";

export default function StatGlobalPage() {
  const [superviseur, setSuperviseur] = useState({ prenom: "", nom: "", eglise_id: null });
  const [annee, setAnnee] = useState(new Date().getFullYear());
  const [statsParMois, setStatsParMois] = useState({}); // stats regroupées par mois
  const [moisOpen, setMoisOpen] = useState({}); // gérer expand/collapse

  // 🔹 Charger superviseur
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

  // 🔹 Récupérer toutes les églises supervisées
  const getEglisesCascade = async (egliseId) => {
    let allEglises = [egliseId];
    const { data } = await supabase
      .from("eglise_supervisions")
      .select("eglise_supervisee_id")
      .eq("statut", "accepted");

    let queue = [egliseId];
    while (queue.length > 0) {
      const parent = queue.shift();
      const enfants = data.filter(d => d.superviseur_eglise_id === parent).map(d => d.eglise_supervisee_id);
      allEglises.push(...enfants);
      queue.push(...enfants);
    }
    return Array.from(new Set(allEglises));
  };

  // 🔹 Charger stats pour toute l'année
  const loadStats = async () => {
    if (!superviseur.eglise_id) return;

    const egliseIds = await getEglisesCascade(superviseur.eglise_id);

    const { data, error } = await supabase
      .from("stats_ministere_besoin")
      .select("*")
      .in("eglise_id", egliseIds)
      .eq("annee", annee);

    if (error) {
      console.error(error);
      return;
    }

    const statsMois = {};
    data.forEach(row => {
      const moisKey = row.mois.padStart(2, "0");
      if (!statsMois[moisKey]) statsMois[moisKey] = { totalGlobal: {}, parEglise: {} };

      // total global
      if (!statsMois[moisKey].totalGlobal[row.type]) statsMois[moisKey].totalGlobal[row.type] = { hommes: 0, femmes: 0, enfants: 0, visiteurs: 0 };
      statsMois[moisKey].totalGlobal[row.type].hommes += row.hommes;
      statsMois[moisKey].totalGlobal[row.type].femmes += row.femmes;
      statsMois[moisKey].totalGlobal[row.type].enfants += row.enfants;
      statsMois[moisKey].totalGlobal[row.type].visiteurs += row.visiteurs;

      // stats par église
      if (!statsMois[moisKey].parEglise[row.eglise_nom]) statsMois[moisKey].parEglise[row.eglise_nom] = {};
      if (!statsMois[moisKey].parEglise[row.eglise_nom][row.type]) statsMois[moisKey].parEglise[row.eglise_nom][row.type] = { hommes: 0, femmes: 0, enfants: 0, visiteurs: 0 };
      statsMois[moisKey].parEglise[row.eglise_nom][row.type].hommes += row.hommes;
      statsMois[moisKey].parEglise[row.eglise_nom][row.type].femmes += row.femmes;
      statsMois[moisKey].parEglise[row.eglise_nom][row.type].enfants += row.enfants;
      statsMois[moisKey].parEglise[row.eglise_nom][row.type].visiteurs += row.visiteurs;
    });

    setStatsParMois(statsMois);
  };

  useEffect(() => { loadStats(); }, [superviseur, annee]);

  return (
    <div className="min-h-screen bg-[#333699] text-white p-6 flex flex-col items-center">
      <HeaderPages />
      <h4 className="text-2xl font-bold mb-6 text-center w-full max-w-5xl">Statistiques Globales</h4>

      {/* Filtre année */}
      <div className="w-full max-w-md bg-white text-black rounded-2xl shadow-lg p-6 space-y-4 mb-10">
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

      {/* Stats par mois */}
      <div className="w-full max-w-5xl space-y-6">
        {Object.keys(statsParMois).sort().map(moisKey => {
          const moisData = statsParMois[moisKey];
          const moisName = new Date(0, parseInt(moisKey)-1).toLocaleString('fr-FR', { month: 'long' });

          return (
            <div key={moisKey} className="bg-white/10 rounded-2xl p-4">
              <div
                className="flex justify-between items-center cursor-pointer mb-2"
                onClick={() => setMoisOpen(prev => ({ ...prev, [moisKey]: !prev[moisKey] }))}
              >
                <h5 className="text-lg font-bold">➕ {moisName} {annee}</h5>
                <span className="text-xl">{moisOpen[moisKey] ? "➖" : "➕"}</span>
              </div>

              {moisOpen[moisKey] && (
                <div className="space-y-4">
                  {/* TOTAL GLOBAL */}
                  <div>
                    <h6 className="font-semibold text-amber-300 mb-2">TOTAL GLOBAL — {moisName} {annee}</h6>
                    <table className="w-full text-sm border bg-white text-black rounded-lg overflow-hidden mb-4">
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
                        {Object.entries(moisData.totalGlobal).map(([type, vals]) => (
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
                  {Object.entries(moisData.parEglise).map(([egliseNom, types]) => (
                    <div key={egliseNom}>
                      <h6 className="font-semibold mb-1">📍 {egliseNom}</h6>
                      <table className="w-full text-sm border bg-white text-black rounded-lg overflow-hidden mb-4">
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
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
