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
      // 🔹 Récupérer tous les membres selon filtre date
      let query = supabase
        .from("membres_complets")
        .select(`Ministere, star, etat_contact, eglise_id, branche_id`)
        .eq("eglise_id", egliseId)
        .eq("branche_id", brancheId);

      if (dateDebut) query = query.gte("created_at", dateDebut);
      if (dateFin) query = query.lte("created_at", dateFin);

      const { data, error } = await query;
      if (error) throw error;

      let counts = {};
      let totalServiteursLocal = 0;
      let totalMembresLocal = 0;

      data.forEach((membre) => {
        const etatOk = ["Existant", "Nouveau"].includes(membre.etat_contact);
        const isServiteur = membre.star === "true" || membre.star === "oui";

        // Compter le total de membres valides pour le pourcentage
        if (etatOk) totalMembresLocal++;

        // Compter les serviteurs
        if (etatOk && isServiteur) totalServiteursLocal++;

        // Comptage par ministère seulement si serviteur et membre valide
        if (etatOk && isServiteur && membre.Ministere) {
          let ministeres = [];

          try {
            if (typeof membre.Ministere === "string") {
              if (membre.Ministere.startsWith("[")) {
                ministeres = JSON.parse(membre.Ministere);
              } else {
                ministeres = membre.Ministere.split(",").map((m) => m.trim());
              }
            } else if (Array.isArray(membre.Ministere)) {
              ministeres = membre.Ministere;
            }
          } catch {
            ministeres = membre.Ministere.split(",").map((m) => m.trim());
          }

          ministeres.forEach((min) => {
            if (!min) return;
            if (!counts[min]) counts[min] = 0;
            counts[min]++;
          });
        }
      });

      const result = Object.entries(counts).map(([nom, total]) => ({
        ministere: nom,
        total,
      }));

      setRapports(result);
      setTotalServiteurs(totalServiteursLocal);
      setTotalMembres(totalMembresLocal);
      setMessage("");
    } catch (err) {
      console.error(err);
      setMessage("❌ " + err.message);
    }

    setLoading(false);
  };

  const pourcentageServiteurs =
    totalMembres > 0 ? ((totalServiteurs / totalMembres) * 100).toFixed(1) : 0;

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />

      <h1 className="text-2xl font-bold text-white mt-4 mb-6 text-center">
        Rapport Ministère
      </h1>

      {/* 🔹 FILTRES */}
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

      {/* 🔹 Carrés */}
      <div className="flex flex-wrap justify-center gap-4 mt-4 mb-6">
        <div className="bg-white/10 px-6 py-4 rounded-2xl shadow-lg flex flex-col items-center min-w-[180px]">
          <span className="text-white text-sm">Nombre de serviteurs</span>
          <span className="text-orange-400 font-bold text-2xl">{totalServiteurs}</span>
        </div>

        <div className="bg-white/10 px-6 py-4 rounded-2xl shadow-lg flex flex-col items-center min-w-[180px]">
          <span className="text-white text-sm">% sur total membres</span>
          <span className="text-orange-400 font-bold text-2xl">{pourcentageServiteurs} %</span>
        </div>
      </div>

      {message && <p className="text-white mb-4">{message}</p>}

      {/* 🔹 TABLEAU */}
      {rapports.length > 0 && (
        <div className="w-full flex justify-center mt-6 mb-6">
          <div className="w-max overflow-x-auto space-y-2">
            <div className="flex text-sm font-semibold uppercase text-white px-4 py-3 border-b border-white/30 bg-white/5 rounded-t-xl whitespace-nowrap">
              <div className="min-w-[250px]">Ministère</div>
              <div className="min-w-[150px] text-center text-orange-400 font-semibold">
                Nombre de serviteurs
              </div>
            </div>

            {loading && <div className="text-white text-center py-4">Chargement...</div>}

            {rapports.map((r, index) => (
              <div
                key={index}
                className="flex items-center px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition border-l-4 border-l-blue-500"
              >
                <div className="min-w-[250px] text-white font-semibold">{r.ministere}</div>
                <div className="min-w-[150px] text-center text-orange-400 font-bold">{r.total}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
