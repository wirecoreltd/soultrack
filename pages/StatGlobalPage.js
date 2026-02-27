"use client";

import { useState, useEffect } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import ProtectedRoute from "../components/ProtectedRoute";
import Footer from "../components/Footer";

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
  const [branches, setBranches] = useState([]);
  const [error, setError] = useState("");

  // Récupérer le superviseur de l'utilisateur connecté
  const getSuperviseurId = () => {
    try {
      const profile = JSON.parse(localStorage.getItem("profile"));
      return profile?.superviseur_id || null;
    } catch {
      return null;
    }
  };

  // Dans StatGlobalPage
const fetchStats = async () => {
  setLoading(true);

  try {
    // Récupérer le profil local
    const profile = JSON.parse(localStorage.getItem("profile"));
    const superviseurId = profile?.superviseur_id;

    let query = supabase.from("attendance_stats").select("*");

    // Filtrage par dates
    if (dateDebut) query = query.gte("mois", dateDebut);
    if (dateFin) query = query.lte("mois", dateFin);

    // Filtrer par superviseur si défini
    if (superviseurId) {
      query = query.eq("superviseur_id", superviseurId);
    } else {
      console.warn("⚠️ Superviseur non défini. On récupère toutes les églises.");
      // Aucun filtre sur le superviseur → récupère tout
    }

    const { data, error } = await query;

    if (error) {
      console.error("❌ Erreur lors de la récupération des stats", error);
      setBranches([]);
      setLoading(false);
      return;
    }

    // 🔹 Grouper par branche comme tu avais
    const grouped = {};
    data.forEach((item) => {
      const key = item.branche_nom?.trim().toLowerCase();
      if (!key) return;

      if (!grouped[key]) {
        grouped[key] = {
          branche_nom: item.branche_nom,
          culte: {
            hommes: 0,
            femmes: 0,
            jeunes: 0,
            enfants: 0,
            connectes: 0,
            nouveaux_venus: 0,
            nouveau_converti: 0,
            moissonneurs: 0,
          },
        };
      }

      grouped[key].culte.hommes += Number(item.hommes) || 0;
      grouped[key].culte.femmes += Number(item.femmes) || 0;
      grouped[key].culte.jeunes += Number(item.jeunes) || 0;
      grouped[key].culte.enfants += Number(item.enfants) || 0;
      grouped[key].culte.connectes += Number(item.connectes) || 0;
      grouped[key].culte.nouveaux_venus += Number(item.nouveaux_venus) || 0;
      grouped[key].culte.nouveau_converti += Number(item.nouveau_converti) || 0;
      grouped[key].culte.moissonneurs += Number(item.moissonneurs) || 0;
    });

    setBranches(Object.values(grouped).sort((a, b) =>
      a.branche_nom.localeCompare(b.branche_nom)
    ));

  } catch (err) {
    console.error("❌ Erreur lors de la récupération des stats", err);
    setBranches([]);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />
      <h1 className="text-2xl font-bold mt-4 mb-6 text-center text-white">
        Rapport <span className="text-amber-300">Statistiques Globales</span>
      </h1>

      {/* FILTRES */}
      <div className="bg-white/10 p-6 rounded-2xl shadow-lg mt-6 flex gap-4 flex-wrap text-white">
        <input
          type="date"
          value={dateDebut}
          onChange={(e) => setDateDebut(e.target.value)}
          className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white"
        />
        <input
          type="date"
          value={dateFin}
          onChange={(e) => setDateFin(e.target.value)}
          className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white"
        />
        <button
          onClick={fetchStats}
          className="bg-[#2a2f85] px-6 py-2 rounded-xl hover:bg-[#1f2366]"
        >
          Générer
        </button>
      </div>

      {error && (
        <p className="mt-4 text-red-400 font-semibold text-center">{error}</p>
      )}

      {/* AFFICHAGE */}
      {!loading && branches.length > 0 && (
        <div className="w-full max-w-full overflow-x-auto mt-8 space-y-8">
          {branches.map((b, idx) => (
            <div key={idx} className="w-full">
              <div className="text-xl font-bold text-amber-300 mb-3">
                {b.branche_nom}
              </div>

              {/* HEADER */}
              <div className="flex font-semibold uppercase text-white px-4 py-3 border-b border-white/30 bg-white/5 rounded-t-xl whitespace-nowrap">
                <div className="min-w-[180px] ml-1">Type</div>
                <div className="min-w-[120px] text-center">Hommes</div>
                <div className="min-w-[120px] text-center">Femmes</div>
                <div className="min-w-[120px] text-center">Jeunes</div>
                <div className="min-w-[120px] text-center">Enfants</div>
                <div className="min-w-[140px] text-center">Connectés</div>
                <div className="min-w-[150px] text-center">Nouveaux</div>
                <div className="min-w-[180px] text-center">Convertis</div>
                <div className="min-w-[160px] text-center">Moissonneurs</div>
              </div>

              {/* LIGNE CULTE */}
              <div className="flex items-center px-4 py-3 rounded-b-xl bg-white/10 hover:bg-white/20 transition border-l-4 border-blue-400 whitespace-nowrap">
                <div className="min-w-[180px] text-white font-semibold">
                  Culte
                </div>
                <div className="min-w-[120px] text-center text-white">{b.culte.hommes}</div>
                <div className="min-w-[120px] text-center text-white">{b.culte.femmes}</div>
                <div className="min-w-[120px] text-center text-white">{b.culte.jeunes}</div>
                <div className="min-w-[120px] text-center text-white">{b.culte.enfants}</div>
                <div className="min-w-[140px] text-center text-white">{b.culte.connectes}</div>
                <div className="min-w-[150px] text-center text-white">{b.culte.nouveaux_venus}</div>
                <div className="min-w-[180px] text-center text-white">{b.culte.nouveau_converti}</div>
                <div className="min-w-[160px] text-center text-white">{b.culte.moissonneurs}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Footer />
    </div>
  );
}
