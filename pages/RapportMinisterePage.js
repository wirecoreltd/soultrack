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
  const [totalMembres, setTotalMembres] = useState(0);
  const [egliseId, setEgliseId] = useState(null);
  const [brancheId, setBrancheId] = useState(null);
  const [loading, setLoading] = useState(false);

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
    if (!egliseId || !brancheId) return;

    setLoading(true);

    let query = supabase
      .from("membres_complets")
      .select("id, Ministere, created_at, eglise_id, branche_id")
      .eq("eglise_id", egliseId)
      .eq("branche_id", brancheId)
      .not("Ministere", "is", null);

    if (dateDebut) query = query.gte("created_at", dateDebut);
    if (dateFin) query = query.lte("created_at", dateFin);

    const { data, error } = await query;

    if (error) {
      console.error("Erreur Supabase:", error);
      setLoading(false);
      return;
    }

    const counts = {};
    const membresUniques = new Set();

    data.forEach((membre) => {
      membresUniques.add(membre.id); // Chaque membre = 1 pour total

      let ministeres = membre.Ministere;

      if (typeof ministeres === "string") {
        try {
          ministeres = JSON.parse(ministeres);
        } catch {
          ministeres = [ministeres];
        }
      }

      if (Array.isArray(ministeres)) {
        ministeres.forEach((min) => {
          const clean = min.trim();
          if (!clean) return;
          if (!counts[clean]) counts[clean] = 0;
          counts[clean]++;
        });
      }
    });

    const total = membresUniques.size;

    const result = Object.entries(counts).map(([nom, totalMin]) => ({
      ministere: nom,
      total: totalMin,
      pourcentage: total > 0 ? ((totalMin / total) * 100).toFixed(1) : 0,
    }));

    setTotalMembres(total);
    setRapports(result);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />

      <h1 className="text-2xl font-bold text-white mt-4 mb-6 text-center">
        Rapport Ministère
      </h1>

      {/* FILTRES */}
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

      {/* TABLEAU */}
      {rapports.length > 0 && (
        <div className="w-full flex justify-center mt-6 mb-6">
          <div className="w-max overflow-x-auto space-y-2">
            <div className="flex text-sm font-semibold uppercase text-white px-4 py-3 border-b border-white/30 bg-white/5 rounded-t-xl whitespace-nowrap">
              <div className="min-w-[250px]">Ministère</div>
              <div className="min-w-[150px] text-center text-orange-400 font-semibold">
                Nombre de serviteurs
              </div>
              <div className="min-w-[150px] text-center font-semibold">
                % du total des membres
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
                <div className="min-w-[150px] text-center font-semibold">
                  {r.pourcentage} %
                </div>
              </div>
            ))}

            {/* Total général */}
            <div className="flex items-center px-4 py-3 rounded-lg bg-white/20 border-t border-white/30">
              <div className="min-w-[250px] text-white font-bold">Total membres</div>
              <div className="min-w-[150px] text-center text-orange-400 font-bold">
                {totalMembres}
              </div>
              <div className="min-w-[150px] text-center font-bold">100 %</div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
