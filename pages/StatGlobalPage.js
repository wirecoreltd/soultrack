"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import Footer from "../components/Footer";
import ProtectedRoute from "../components/ProtectedRoute";

export default function StatGlobalPageWrapper() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "Responsable"]}>
      <StatGlobalPage />
    </ProtectedRoute>
  );
}

function StatGlobalPage() {
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [loading, setLoading] = useState(false);
  const [statsParEglise, setStatsParEglise] = useState([]);

  const fetchStats = async () => {
    setLoading(true);

    // 🔹 Récupérer le user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 🔹 Récupérer toutes les branches/églises supervisées par l'utilisateur
    const { data: branches } = await supabase
      .from("branches")
      .select("id, nom, eglises(id, nom)")
      .eq("superviseur_id", user.id);

    if (!branches) return;

    let allStats = [];

    for (const branch of branches) {
      for (const eglise of branch.eglises) {
        // 🔹 Récupérer les attendance par église
        const { data: attendance } = await supabase
          .from("attendance")
          .select("*")
          .eq("eglise_id", eglise.id)
          .gte(dateDebut ? "date" : null, dateDebut || undefined)
          .lte(dateFin ? "date" : null, dateFin || undefined);

        const total = {
          hommes: 0,
          femmes: 0,
          jeunes: 0,
          enfants: 0,
          connectes: 0,
          nouveauxVenus: 0,
          nouveauxConvertis: 0,
        };

        attendance?.forEach(r => {
          total.hommes += Number(r.hommes) || 0;
          total.femmes += Number(r.femmes) || 0;
          total.jeunes += Number(r.jeunes) || 0;
          total.enfants += Number(r.enfants) || 0;
          total.connectes += Number(r.connectes) || 0;
          total.nouveauxVenus += Number(r.nouveauxVenus) || 0;
          total.nouveauxConvertis += Number(r.nouveauxConvertis) || 0;
        });

        allStats.push({ eglise: eglise.nom, total });
      }
    }

    setStatsParEglise(allStats);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />

      <h1 className="text-2xl font-bold mt-4 mb-6 text-center text-white">
        Rapport <span className="text-amber-300">Statistiques Globales</span>
      </h1>

      {/* FILTRES */}
      <div className="bg-white/10 p-6 rounded-2xl shadow-lg mt-6 flex gap-4 flex-wrap text-white">
        <input type="date" value={dateDebut} onChange={e => setDateDebut(e.target.value)} className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white" />
        <input type="date" value={dateFin} onChange={e => setDateFin(e.target.value)} className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white" />
        <button onClick={fetchStats} className="bg-[#2a2f85] px-6 py-2 rounded-xl hover:bg-[#1f2366]">Générer</button>
      </div>

      {/* TABLE PAR EGLISE */}
      {!loading && statsParEglise.length > 0 && (
        <div className="w-full max-w-full overflow-x-auto mt-6 scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent">
          <div className="w-max space-y-4">
            {statsParEglise.map((r, idx) => (
              <div key={idx} className="bg-white/10 rounded-xl p-4">
                <h2 className="text-xl font-semibold text-white mb-2">{r.eglise}</h2>
                <div className="grid grid-cols-8 text-white font-medium">
                  <div>Hommes</div>
                  <div>Femmes</div>
                  <div>Jeunes</div>
                  <div>Enfants</div>
                  <div>Connectés</div>
                  <div>Nouveaux Venus</div>
                  <div>Nouveau Converti</div>
                </div>
                <div className="grid grid-cols-8 text-white">
                  <div>{r.total.hommes}</div>
                  <div>{r.total.femmes}</div>
                  <div>{r.total.jeunes}</div>
                  <div>{r.total.enfants}</div>
                  <div>{r.total.connectes}</div>
                  <div>{r.total.nouveauxVenus}</div>
                  <div>{r.total.nouveauxConvertis}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading && <p className="text-white mt-6">Chargement des données...</p>}

      <Footer />
    </div>
  );
}
