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

  // Charger profil utilisateur
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

  // Générer rapport
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
      // 1️⃣ Récupérer tous les membres de l'église
      const { data: membresData, error: membresError } = await supabase
        .from("membres_complets")
        .select("id, sexe, etat_contact")
        .eq("eglise_id", egliseId)
        .eq("branche_id", brancheId);

      if (membresError) throw membresError;

      // Créer map pour trouver le sexe d'un membre
      const membresMap = {};
      membresData.forEach((m) => {
        membresMap[m.id] = {
          sexe: m.sexe,
          etat_contact: m.etat_contact,
        };
      });

      // Total des membres (etat_contact = existant ou nouveau)
      const membresTotal = membresData.filter(
        (m) =>
          m.etat_contact?.toString().trim().toLowerCase() === "existant" ||
          m.etat_contact?.toString().trim().toLowerCase() === "nouveau"
      ).length;
      setTotalMembres(membresTotal);

      // 2️⃣ Récupérer tous les stats_ministere_besoin
      let query = supabase
        .from("stats_ministere_besoin")
        .select("membre_id, valeur, date_action")
        .eq("eglise_id", egliseId)
        .eq("branche_id", brancheId)
        .eq("type", "ministere");

      if (dateDebut) query = query.gte("date_action", dateDebut);
      if (dateFin) query = query.lte("date_action", dateFin);

      const { data, error } = await query;
      if (error) throw error;

      // 3️⃣ Comptage unique par membre et ministère
      const counts = {};
      const serviteursSet = new Set();

      data.forEach((row) => {
        const membreId = row.membre_id;
        const ministere = row.valeur?.trim();
        if (!ministere || !membresMap[membreId]) return;

        // Créer un set par ministère pour éviter double comptage
        const key = `${membreId}|${ministere}`;
        if (!serviteursSet.has(key)) {
          serviteursSet.add(key);

          if (!counts[ministere]) counts[ministere] = { hommes: 0, femmes: 0, total: 0 };
          const sexe = membresMap[membreId].sexe?.toLowerCase();
          if (sexe === "homme") counts[ministere].hommes++;
          else if (sexe === "femme") counts[ministere].femmes++;

          counts[ministere].total++;
        }
      });

      setRapports(
        Object.entries(counts).map(([ministere, val]) => ({
          ministere,
          hommes: val.hommes,
          femmes: val.femmes,
          total: val.total,
        }))
      );

      setTotalServiteurs(serviteursSet.size);
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

      {/* Filtres */}
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

      {/* Résumé */}
      {totalMembres > 0 && (
        <div className="flex gap-4 mt-6 flex-wrap justify-center">
          <div className="bg-white/10 px-6 py-4 rounded-2xl text-white text-center min-w-[220px]">
            <div className="text-sm uppercase font-semibold mb-1">Nombre de serviteurs</div>
            <div className="text-2xl font-bold text-orange-400">{totalServiteurs}</div>
          </div>

          <div className="bg-white/10 px-6 py-4 rounded-2xl text-white text-center min-w-[220px]">
            <div className="text-sm uppercase font-semibold mb-1">% de serviteurs / total</div>
            <div className="text-2xl font-bold text-orange-400">
              {totalMembres > 0 ? ((totalServiteurs / totalMembres) * 100).toFixed(1) : 0} %
            </div>
          </div>
        </div>
      )}

      {/* Tableau */}
      {rapports.length > 0 && (
        <div className="w-full flex justify-center mt-6 mb-6">
          <div className="w-max overflow-x-auto space-y-2">
            <div className="flex text-sm font-semibold uppercase text-white px-4 py-3 border-b border-white/30 bg-white/5 rounded-t-xl whitespace-nowrap">
              <div className="min-w-[200px]">Ministère</div>
              <div className="min-w-[100px] text-center">Hommes</div>
              <div className="min-w-[100px] text-center">Femmes</div>
              <div className="min-w-[100px] text-center">Total</div>
            </div>

            {rapports.map((r, index) => (
              <div
                key={index}
                className="flex items-center px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition border-l-4 border-l-blue-500"
              >
                <div className="min-w-[200px] text-white font-semibold">{r.ministere}</div>
                <div className="min-w-[100px] text-center text-orange-400 font-bold">{r.hommes}</div>
                <div className="min-w-[100px] text-center text-orange-400 font-bold">{r.femmes}</div>
                <div className="min-w-[100px] text-center text-orange-400 font-bold">{r.total}</div>
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
