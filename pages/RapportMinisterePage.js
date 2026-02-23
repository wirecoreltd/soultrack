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
  const [egliseId, setEgliseId] = useState(null);
  const [brancheId, setBrancheId] = useState(null);

  const [totalServiteurs, setTotalServiteurs] = useState(0);
  const [totalMembres, setTotalMembres] = useState(0);
  const [serviteursParDate, setServiteursParDate] = useState([]);
  const [ministeres, setMinisteres] = useState([]);

  const [loading, setLoading] = useState(false);

  // 🔹 Charger profil utilisateur
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getSession();
      const user = data?.session?.user;
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("eglise_id, branche_id")
        .eq("id", user.id)
        .single();

      if (profile) {
        setEgliseId(profile.eglise_id);
        setBrancheId(profile.branche_id);
      }
    };

    fetchUser();
  }, []);

  const fetchRapport = async () => {
    if (!egliseId || !brancheId) return;

    setLoading(true);

    try {
      // 🔥 1️⃣ Récupérer uniquement les ministeres
      let statsQuery = supabase
        .from("stats_ministere_besoin")
        .select("membre_id, valeur, date_action")
        .eq("eglise_id", egliseId)
        .eq("branche_id", brancheId)
        .eq("type", "ministere");

      if (dateDebut) statsQuery = statsQuery.gte("date_action", dateDebut);
      if (dateFin) statsQuery = statsQuery.lte("date_action", dateFin);

      const { data: statsData, error } = await statsQuery;
      if (error) throw error;

      // 🔥 2️⃣ Total serviteurs (unique)
      const totalSet = new Set();
      const dateMap = {};
      const ministereMap = {};

      statsData.forEach((row) => {
        const date = row.date_action;
        const membreId = row.membre_id;
        const ministere = row.valeur;

        totalSet.add(membreId);

        // ✅ PAR DATE (unique par date)
        if (!dateMap[date]) dateMap[date] = new Set();
        dateMap[date].add(membreId);

        // ✅ PAR MINISTERE (unique par ministère)
        if (!ministereMap[ministere]) ministereMap[ministere] = new Set();
        ministereMap[ministere].add(membreId);
      });

      setTotalServiteurs(totalSet.size);

      // 🔥 3️⃣ Transformer dates
      const dateResult = Object.entries(dateMap).map(([date, set]) => ({
        date,
        total: set.size,
      }));

      setServiteursParDate(dateResult.sort((a, b) =>
        new Date(a.date) - new Date(b.date)
      ));

      // 🔥 4️⃣ Transformer ministeres
      const ministereResult = Object.entries(ministereMap).map(
        ([nom, set]) => ({
          nom,
          total: set.size,
        })
      );

      setMinisteres(ministereResult);

      // 🔥 5️⃣ Total membres
      const { data: membres } = await supabase
        .from("membres_complets")
        .select("id, etat_contact")
        .eq("eglise_id", egliseId)
        .eq("branche_id", brancheId);

      const membresValides = membres.filter((m) =>
        ["existant", "nouveau"].includes(
          m.etat_contact?.toLowerCase()
        )
      );

      setTotalMembres(membresValides.length);

    } catch (err) {
      console.error("Erreur :", err.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />

      <h1 className="text-2xl font-bold text-white mt-4 mb-6">
        Rapport Ministère
      </h1>

      {/* FILTRES */}
      <div className="flex gap-4 mb-6">
        <input
          type="date"
          value={dateDebut}
          onChange={(e) => setDateDebut(e.target.value)}
        />
        <input
          type="date"
          value={dateFin}
          onChange={(e) => setDateFin(e.target.value)}
        />
        <button
          onClick={fetchRapport}
          className="bg-orange-500 px-4 py-2 rounded"
        >
          Générer
        </button>
      </div>

      {loading && <p className="text-white">Chargement...</p>}

      {/* 🔥 RESUME */}
      <div className="text-white mb-6 text-center">
        <h2>Total serviteurs : {totalServiteurs}</h2>
        <h2>
          % serviteurs / membres :{" "}
          {totalMembres > 0
            ? ((totalServiteurs / totalMembres) * 100).toFixed(1)
            : 0}
          %
        </h2>
      </div>

      {/* 🔥 TABLEAU PAR DATE */}
      <div className="bg-white p-4 rounded mb-6 w-full max-w-xl">
        <h3 className="font-bold mb-2">Serviteurs par date</h3>
        {serviteursParDate.map((row, i) => (
          <div key={i} className="flex justify-between border-b py-1">
            <span>{row.date}</span>
            <span>{row.total}</span>
          </div>
        ))}
      </div>

      {/* 🔥 TABLEAU PAR MINISTERE */}
      <div className="bg-white p-4 rounded w-full max-w-xl">
        <h3 className="font-bold mb-2">Serviteurs par ministère</h3>
        {ministeres.map((row, i) => (
          <div key={i} className="flex justify-between border-b py-1">
            <span>{row.nom}</span>
            <span>{row.total}</span>
          </div>
        ))}
      </div>

      <Footer />
    </div>
  );
}
