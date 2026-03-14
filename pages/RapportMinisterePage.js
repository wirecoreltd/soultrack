"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import Footer from "../components/Footer";
import ProtectedRoute from "../components/ProtectedRoute";

export default function RapportMinisterePage() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableIntegration"]}>
      <RapportMinistere />
    </ProtectedRoute>
  );
}

function RapportMinistere() {
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [rapports, setRapports] = useState([]);
  const [egliseId, setEgliseId] = useState(null);
  const [brancheId, setBrancheId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [totalServiteurs, setTotalServiteurs] = useState(0);
  const [totalMembres, setTotalMembres] = useState(0);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      if (!user) return;

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("eglise_id, branche_id")
        .eq("id", user.id)
        .single();

      if (!error && profile) {
        setEgliseId(profile.eglise_id);
        setBrancheId(profile.branche_id);
      }
    };
    fetchUser();
  }, []);

  const fetchRapport = async () => {
    setLoading(true);
    setRapports([]);
    setTotalServiteurs(0);
    setTotalMembres(0);
    setMessage("⏳ Chargement...");

    if (!egliseId || !brancheId) {
      setMessage("❌ ID de l'église ou branche manquant");
      setLoading(false);
      return;
    }

    try {
      const { data: membresData, error: membresError } = await supabase
        .from("membres_complets")
        .select("id, etat_contact")
        .eq("eglise_id", egliseId)
        .eq("branche_id", brancheId);

      if (membresError) throw membresError;

      const totalMembresLocal = membresData.filter((m) =>
        ["existant", "nouveau"].includes(m.etat_contact?.toLowerCase())
      ).length;
      setTotalMembres(totalMembresLocal);

      let queryStats = supabase
        .from("stats_ministere_besoin")
        .select("membre_id, valeur, type, date_action")
        .eq("eglise_id", egliseId)
        .eq("branche_id", brancheId)
        .eq("type", "ministere");

      if (dateDebut) queryStats = queryStats.gte("date_action", dateDebut);
      if (dateFin) queryStats = queryStats.lte("date_action", dateFin);

      const { data: statsData, error: statsError } = await queryStats;
      if (statsError) throw statsError;

      const serviteursSet = new Set();
      const counts = {};

      statsData.forEach((s) => {
        if (!s.membre_id) return;
        serviteursSet.add(s.membre_id);
        if (!s.valeur) return;
        s.valeur.split(",").forEach((ministere) => {
          const m = ministere.trim();
          if (!counts[m]) counts[m] = 0;
          counts[m]++;
        });
      });

      setTotalServiteurs(serviteursSet.size);

      setRapports(
        Object.entries(counts).map(([ministere, total]) => ({ ministere, total }))
      );
      setMessage("");
    } catch (err) {
      console.error(err);
      setMessage("❌ " + err.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6 bg-[#333699]">
      <HeaderPages />

      <h1 className="text-2xl sm:text-3xl font-bold mt-4 mb-6 text-center">
        <span className="text-white">Rapport </span>
        <span className="text-amber-300">Ministère</span>
      </h1>

      {/* 🔹 Filtres */}
      <div className="bg-white/10 p-4 sm:p-6 rounded-2xl shadow-lg mt-6 flex flex-wrap justify-center gap-3">
        <input
          type="date"
          value={dateDebut}
          onChange={(e) => setDateDebut(e.target.value)}
          className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white w-full sm:w-auto"
        />
        <input
          type="date"
          value={dateFin}
          onChange={(e) => setDateFin(e.target.value)}
          className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white w-full sm:w-auto"
        />
        <button
          onClick={fetchRapport}
          disabled={!egliseId || !brancheId || loading}
          className={`bg-[#2a2f85] px-6 py-2 rounded-xl hover:bg-[#1f2366] ${
            !egliseId || !brancheId || loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          Générer
        </button>
      </div>

      {/* 🔹 Résumé */}
      <div className="flex flex-wrap gap-4 mt-6 justify-center w-full max-w-xl">
        <div className="bg-white/10 px-6 py-4 rounded-2xl text-white text-center flex-1 min-w-[160px]">
          <div className="text-sm uppercase font-semibold mb-1">
            Nombre total de serviteurs
          </div>
          <div className="text-2xl font-bold text-orange-400">{totalServiteurs}</div>
        </div>

        <div className="bg-white/10 px-6 py-4 rounded-2xl text-white text-center flex-1 min-w-[160px]">
          <div className="text-sm uppercase font-semibold mb-1">
            % de serviteurs / membres
          </div>
          <div className="text-2xl font-bold text-orange-400">
            {totalMembres > 0
              ? ((totalServiteurs / totalMembres) * 100).toFixed(1)
              : 0} %
          </div>
        </div>
      </div>

      {/* Tableau ministères */}
        <div className="w-full flex justify-center mt-6 mb-6">
          <div className="w-full max-w-2xl md:max-w-4xl overflow-x-auto space-y-2">
            <div className="grid grid-cols-[2fr_1fr] text-sm md:text-base font-semibold uppercase text-white px-4 py-3 border-b border-white/30 bg-white/5 rounded-t-xl whitespace-nowrap">
              <div>Ministère</div>
              <div className="text-center text-orange-400">Nombre de serviteurs</div>
            </div>
        
            {loading && (
              <div className="text-white text-center py-4">Chargement...</div>
            )}
        
            {rapports.map((r, index) => (
              <div
                key={index}
                className="grid grid-cols-[2fr_1fr] items-center px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition border-l-4 border-l-blue-500"
              >
                <div className="text-white font-semibold">{r.ministere}</div>
                <div className="text-center text-orange-400 font-bold">{r.total}</div>
              </div>
            ))}
          </div>
        </div>

      {(!egliseId || !brancheId) && (
        <p className="text-white text-center mt-2">
          ⏳ Chargement des informations utilisateur...
        </p>
      )}

      {message && <p className="text-white text-center">{message}</p>}

      <Footer />
    </div>
  );
}
