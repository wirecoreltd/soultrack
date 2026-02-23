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

  // 🔹 Générer rapport
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
      // 🔹 Total membres (etat_contact = existant/nouveau)
      const { data: membresValides, error: errorMembres } = await supabase
        .from("membres_complets")
        .select("id, etat_contact, sexe")
        .eq("eglise_id", egliseId)
        .eq("branche_id", brancheId);

      if (errorMembres) throw errorMembres;

      const membresValidesFiltered = membresValides.filter((m) =>
        ["existant", "nouveau"].includes(m.etat_contact?.toLowerCase())
      );
      setTotalMembres(membresValidesFiltered.length);

      // 🔹 Logs ministère
      const { data: ministereLogs, error: errorLogs } = await supabase
        .from("stats_ministere_besoin")
        .select("membre_id, valeur, date_action")
        .eq("eglise_id", egliseId)
        .eq("branche_id", brancheId)
        .eq("type", "ministere")
        .gte("date_action", dateDebut || "1900-01-01")
        .lte("date_action", dateFin || "2999-12-31");

      if (errorLogs) throw errorLogs;

      const counts = {};
      let totalServiteursLocal = 0;

      ministereLogs.forEach((log) => {
        const membre = membresValides.find((m) => m.id === log.membre_id);
        const sexe =
          membre?.sexe?.toLowerCase() === "homme" ? "hommes" : "femmes";

        totalServiteursLocal++;

        let ministeres = [];
        try {
          if (log.valeur.startsWith("[")) ministeres = JSON.parse(log.valeur);
          else ministeres = log.valeur.split(",");
        } catch {
          ministeres = log.valeur.split(",");
        }

        ministeres.forEach((m) => {
          const clean = m.trim();
          if (!clean) return;
          if (!counts[clean])
            counts[clean] = { total: 0, hommes: 0, femmes: 0 };
          counts[clean].total++;
          if (sexe === "hommes") counts[clean].hommes++;
          else counts[clean].femmes++;
        });
      });

      setRapports(
        Object.entries(counts).map(([ministere, values]) => ({
          ministere,
          ...values,
        }))
      );

      setTotalServiteurs(totalServiteursLocal);
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

      <h1 className="text-2xl font-bold mt-4 mb-6 text-center">
        <span className="text-white">Rapport</span>{" "}
        <span className="text-amber-300">Ministère</span>
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
      {totalMembres > 0 && (
        <div className="flex gap-4 mt-6 flex-wrap justify-center">
          <div className="bg-white/10 px-6 py-4 rounded-2xl text-white text-center min-w-[220px]">
            <div className="text-sm uppercase font-semibold mb-1">
              Nombre de serviteurs
            </div>
            <div className="text-2xl font-bold text-orange-400">
              {totalServiteurs}
            </div>
          </div>

          <div className="bg-white/10 px-6 py-4 rounded-2xl text-white text-center min-w-[220px]">
            <div className="text-sm uppercase font-semibold mb-1">
              % de serviteurs / total
            </div>
            <div className="text-2xl font-bold text-orange-400">
              {totalMembres > 0
                ? ((totalServiteurs / totalMembres) * 100).toFixed(1)
                : 0}{" "}
              %
            </div>
          </div>
        </div>
      )}

      {/* 🔹 Tableau */}
      {rapports.length > 0 && (
        <div className="w-full flex justify-center mt-6 mb-6">
          <div className="w-max overflow-x-auto space-y-2">
            <div className="grid grid-cols-4 text-sm font-semibold uppercase text-white px-4 py-3 border-b border-white/30 bg-white/5 rounded-t-xl text-center">
              <div className="text-left pl-2">Ministère</div>
              <div>Hommes</div>
              <div>Femmes</div>
              <div>Total</div>
            </div>

            {rapports.map((r, index) => (
              <div
                key={index}
                className="grid grid-cols-4 text-white py-2 border-b border-white/10 text-center hover:bg-white/10 rounded-lg items-center"
              >
                <div className="text-left pl-2 font-semibold">{r.ministere}</div>
                <div>{r.hommes}</div>
                <div>{r.femmes}</div>
                <div className="text-orange-400 font-bold">{r.total}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {message && <p className="text-white text-center">{message}</p>}

      <Footer />
    </div>
  );
}
