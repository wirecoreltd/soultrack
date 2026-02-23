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

  // 🔹 Charger profil utilisateur
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
      // 🔹 Récupérer stats ministères uniquement
      let queryStats = supabase
        .from("stats_ministere_besoin")
        .select("membre_id, valeur, date_action")
        .eq("eglise_id", egliseId)
        .eq("branche_id", brancheId)
        .eq("type", "ministere");

      if (dateDebut) queryStats = queryStats.gte("date_action", dateDebut);
      if (dateFin) queryStats = queryStats.lte("date_action", dateFin);

      const { data: statsData, error: statsError } = await queryStats;
      if (statsError) throw statsError;

      // 🔹 Récupérer tous les membres pour le % (star et état)
      let queryMembres = supabase
        .from("membres_complets")
        .select("id, star, etat_contact")
        .eq("eglise_id", egliseId)
        .eq("branche_id", brancheId);

      if (dateDebut) queryMembres = queryMembres.gte("created_at", dateDebut);
      if (dateFin) queryMembres = queryMembres.lte("created_at", dateFin);

      const { data: membresData, error: membresError } = await queryMembres;
      if (membresError) throw membresError;

      // 🔹 Total membres = etat_contact existant + nouveau
      const totalMembresLocal = membresData.filter((m) =>
        ["existant", "nouveau"].includes(m.etat_contact?.toLowerCase())
      ).length;

      // 🔹 Total serviteurs = star = true + etat_contact = existant
      const totalServiteursLocal = membresData.filter(
        (m) => m.star === true && m.etat_contact?.toLowerCase() === "existant"
      ).length;

      setTotalMembres(totalMembresLocal);
      setTotalServiteurs(totalServiteursLocal);

      // 🔹 Comptage par ministère (1 membre par ministère par date)
      const ministereMap = {};

      statsData.forEach((s) => {
        if (!s.membre_id || !s.valeur || !s.date_action) return;

        const key = `${s.membre_id}_${s.date_action}`;
        if (!ministereMap[s.valeur]) ministereMap[s.valeur] = new Set();

        ministereMap[s.valeur].add(key);
      });

      const rapportsArray = Object.entries(ministereMap).map(
        ([ministere, setValues]) => ({
          ministere,
          total: setValues.size,
        })
      );

      setRapports(rapportsArray);
      setMessage("");
    } catch (err) {
      console.error(err);
      setMessage("❌ " + err.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />

      <h1 className="text-2xl font-bold text-white mt-4 mb-6 text-center">
        Rapport Ministère
      </h1>

      {/* 🔹 Filtres */}
      <div className="bg-white/10 p-6 rounded-2xl shadow-lg mt-6 flex justify-center gap-4 flex-wrap text-white">
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
          onClick={fetchRapport}
          className="bg-[#2a2f85] px-6 py-2 rounded-xl hover:bg-[#1f2366]"
        >
          Générer
        </button>
      </div>

      {/* 🔹 Résumé */}
      <div className="flex gap-4 mt-6 flex-wrap justify-center">
        <div className="bg-white/10 px-6 py-4 rounded-2xl text-white text-center min-w-[220px]">
          <div className="text-sm uppercase font-semibold mb-1">
            Nombre total de serviteurs
          </div>
          <div className="text-2xl font-bold text-orange-400">
            {totalServiteurs}
          </div>
        </div>

        <div className="bg-white/10 px-6 py-4 rounded-2xl text-white text-center min-w-[220px]">
          <div className="text-sm uppercase font-semibold mb-1">
            % de serviteurs / membres
          </div>
          <div className="text-2xl font-bold text-orange-400">
            {totalMembres > 0
              ? ((totalServiteurs / totalMembres) * 100).toFixed(1)
              : 0}{" "}
            %
          </div>
        </div>
      </div>

      {/* 🔹 Tableau ministères */}
      <div className="w-full flex justify-center mt-6 mb-6">
        <div className="w-max overflow-x-auto space-y-2">
          <div className="flex text-sm font-semibold uppercase text-white px-4 py-3 border-b border-white/30 bg-white/5 rounded-t-xl whitespace-nowrap">
            <div className="min-w-[250px]">Ministère</div>
            <div className="min-w-[150px] text-center text-orange-400">
              Nombre de serviteurs
            </div>
          </div>

          {loading && (
            <div className="text-white text-center py-4">Chargement...</div>
          )}

          {rapports.map((r, index) => (
            <div
              key={index}
              className="flex items-center px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition border-l-4 border-l-blue-500"
            >
              <div className="min-w-[250px] text-white font-semibold">
                {r.ministere}
              </div>
              <div className="min-w-[150px] text-center text-orange-400 font-bold">
                {r.total}
              </div>
            </div>
          ))}
        </div>
      </div>

      {message && <p className="text-white text-center">{message}</p>}

      <Footer />
    </div>
  );
}
