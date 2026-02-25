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

    if (error) console.error(error);
    else setStats(data || []);

    setLoading(false);
  };

  const renderHierarchy = (stats) => {
    // Organiser par hiérarchie : superviseur -> branche
    const hierarchy = {};

    stats.forEach((s) => {
      const superv = s.superviseur_id || s.branche_nom; // si pas de superviseur, prend le nom
      if (!hierarchy[superv]) hierarchy[superv] = [];
      hierarchy[superv].push(s);
    });

    return Object.entries(hierarchy).map(([superviseur, branches]) => (
      <div key={superviseur} className="mb-6">
        <h2 className="text-xl font-bold text-white mb-2">{superviseur}</h2>
        {branches.map((b) => (
          <div key={b.branche_id || b.branche_nom} className="mb-3">
            <div className="text-white font-semibold mb-1">{b.branche_nom}</div>
            <div className="flex flex-wrap text-white text-sm">
              <div className="w-32 font-bold">Culte :</div>
              <div className="w-20">{b.hommes}</div>
              <div className="w-20">{b.femmes}</div>
              <div className="w-20">{b.jeunes}</div>
              <div className="w-20">{b.total_hfj}</div>
              <div className="w-20">{b.enfants}</div>
              <div className="w-20">{b.connectes}</div>
              <div className="w-20">{b.nouveauxVenus}</div>
              <div className="w-20">{b.nouveauxConvertis}</div>
              <div className="w-20">{b.moissonneurs}</div>
            </div>
          </div>
        ))}
      </div>
    ));
  };

  const renderTotals = () => {
    const total = stats.reduce(
      (acc, s) => ({
        hommes: acc.hommes + (s.hommes || 0),
        femmes: acc.femmes + (s.femmes || 0),
        jeunes: acc.jeunes + (s.jeunes || 0),
        total_hfj: acc.total_hfj + (s.total_hfj || 0),
        enfants: acc.enfants + (s.enfants || 0),
        connectes: acc.connectes + (s.connectes || 0),
        nouveauxVenus: acc.nouveauxVenus + (s.nouveauxVenus || 0),
        nouveauxConvertis: acc.nouveauxConvertis + (s.nouveauxConvertis || 0),
        moissonneurs: acc.moissonneurs + (s.moissonneurs || 0),
      }),
      {
        hommes: 0,
        femmes: 0,
        jeunes: 0,
        total_hfj: 0,
        enfants: 0,
        connectes: 0,
        nouveauxVenus: 0,
        nouveauxConvertis: 0,
        moissonneurs: 0,
      }
    );

    return (
      <div className="mt-4 text-white font-bold">
        <div>Total :</div>
        <div className="flex flex-wrap text-white text-sm">
          <div className="w-32">Hommes : {total.hommes}</div>
          <div className="w-32">Femmes : {total.femmes}</div>
          <div className="w-32">Jeunes : {total.jeunes}</div>
          <div className="w-32">Total H+F+J : {total.total_hfj}</div>
          <div className="w-32">Enfants : {total.enfants}</div>
          <div className="w-32">Connectés : {total.connectes}</div>
          <div className="w-32">NouveauxVenus : {total.nouveauxVenus}</div>
          <div className="w-32">NouveauConverti : {total.nouveauxConvertis}</div>
          <div className="w-32">Moissonneurs : {total.moissonneurs}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />
      <h1 className="text-2xl font-bold mt-4 mb-6 text-center text-white">
        Rapport <span className="text-amber-300">Attendance</span>
      </h1>

      {/* FILTRE */}
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
          Filtrer
        </button>
      </div>

      {/* TABLEAU */}
      {!loading && stats.length > 0 ? (
        <div className="w-full max-w-full overflow-x-auto mt-6 scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent">
          {renderHierarchy(stats)}
          {renderTotals()}
        </div>
      ) : (
        <div className="text-white mt-6">Aucune donnée trouvée pour cette période.</div>
      )}

      <Footer />
    </div>
  );
}
