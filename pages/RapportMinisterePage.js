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
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("eglise_id, branche_id")
        .eq("id", session.session.user.id)
        .single();

      if (profile) {
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
      setMessage("❌ ID de l'église manquant");
      setLoading(false);
      return;
    }

    try {
      let query = supabase
        .from("profiles")
        .select(`roles, star, etat_contact, eglise_id, branche_id`)
        .eq("eglise_id", egliseId)
        .eq("branche_id", brancheId);

      if (dateDebut) query = query.gte("created_at", dateDebut);
      if (dateFin) query = query.lte("created_at", dateFin);

      const { data, error } = await query;
      if (error) throw error;

      let counts = {};
      let totalServiteursLocal = 0;
      let totalMembresLocal = 0;

      data.forEach((profile) => {
        const etatOk = ["existant"].includes(
          profile.etat_contact?.toString().trim().toLowerCase()
        );

        const isServiteur =
          profile.star?.toString().trim().toLowerCase() === "true" ||
          profile.star?.toString().trim().toLowerCase() === "oui";

        if (etatOk) totalMembresLocal++;
        if (etatOk && isServiteur) totalServiteursLocal++;

        // Comptage par rôle
        if (etatOk && isServiteur && profile.roles?.length) {
          let roles = [];
          try {
            if (typeof profile.roles === "string") {
              if (profile.roles.startsWith("[")) roles = JSON.parse(profile.roles);
              else roles = profile.roles.split(",").map((r) => r.trim());
            } else if (Array.isArray(profile.roles)) roles = profile.roles;
          } catch {
            roles = profile.roles.split(",").map((r) => r.trim());
          }

          roles.forEach((role) => {
            if (!role) return;
            if (!counts[role]) counts[role] = 0;
            counts[role]++;
          });
        }
      });

      setRapports(
        Object.entries(counts).map(([role, total]) => ({ ministere: role, total }))
      );
      setTotalServiteurs(totalServiteursLocal);
      setTotalMembres(totalMembresLocal);
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

      {/* 🔹 Carrés chiffres */}
      {totalMembres > 0 && (
        <div className="flex gap-4 mt-6 flex-wrap justify-center">
          <div className="bg-white/10 px-6 py-4 rounded-2xl shadow-lg text-white min-w-[220px] text-center">
            <div className="text-sm uppercase font-semibold mb-1">
              Nombre de serviteurs
            </div>
            <div className="text-2xl font-bold text-orange-400">
              {totalServiteurs}
            </div>
          </div>

          <div className="bg-white/10 px-6 py-4 rounded-2xl shadow-lg text-white min-w-[220px] text-center">
            <div className="text-sm uppercase font-semibold mb-1">
              % de serviteurs / total
            </div>
            <div className="text-2xl font-bold text-orange-400">
              {((totalServiteurs / totalMembres) * 100).toFixed(1)} %
            </div>
          </div>
        </div>
      )}

      {/* 🔹 Tableau rôles */}
      <div className="w-full flex justify-center mt-6 mb-6">
        <div className="w-max overflow-x-auto space-y-2">
          {/* HEADER */}
          <div className="flex text-sm font-semibold uppercase text-white px-4 py-3 border-b border-white/30 bg-white/5 rounded-t-xl whitespace-nowrap">
            <div className="min-w-[250px]">Ministère / Rôle</div>
            <div className="min-w-[150px] text-center text-orange-400 font-semibold">
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
