"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import Footer from "../components/Footer";
import ProtectedRoute from "../components/ProtectedRoute";

export default function RapportBesoinPage() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableIntegration"]}>
      <RapportBesoin />
    </ProtectedRoute>
  );
}

function RapportBesoin() {
  const [rapports, setRapports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [egliseId, setEgliseId] = useState(null);
  const [brancheId, setBrancheId] = useState(null);
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [generated, setGenerated] = useState(false);

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
    setGenerated(true);

    let query = supabase
      .from("membres_complets")
      .select("besoin, created_at")
      .eq("eglise_id", egliseId)
      .eq("branche_id", brancheId)
      .not("besoin", "is", null);

    if (dateDebut) query = query.gte("created_at", dateDebut);
    if (dateFin) query = query.lte("created_at", dateFin);

    const { data, error } = await query;

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    const counts = {};

    data.forEach((membre) => {
      if (!membre.besoin) return;

      let besoinsArray = [];

      try {
        besoinsArray =
          typeof membre.besoin === "string"
            ? JSON.parse(membre.besoin)
            : membre.besoin;
      } catch (err) {
        console.error("Erreur JSON:", err);
        return;
      }

      besoinsArray.forEach((b) => {
        if (!counts[b]) counts[b] = 0;
        counts[b]++;
      });
    });

    const result = Object.entries(counts).map(([nom, total]) => ({
      nom,
      total,
    }));

    setRapports(result);
    setLoading(false);
  };

  const totalGlobal = rapports.reduce((acc, curr) => acc + curr.total, 0);

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />

      <h1 className="text-2xl font-bold text-white mt-4 mb-6 text-center">
        🔥 Rapport des Besoins
      </h1>

      {/* FILTRES */}
      <div className="bg-white/10 p-6 rounded-2xl shadow-lg flex justify-center gap-4 flex-wrap text-white mb-8">
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
          className="bg-[#2a2f85] px-6 py-2 rounded-xl hover:bg-[#1f2366] font-semibold"
        >
          Générer
        </button>
      </div>

      {/* TABLE */}
      {generated && (
        <div className="w-full flex justify-center mb-10">
          <div className="w-max overflow-x-auto space-y-2">

            {/* HEADER */}
            <div className="flex text-sm font-semibold uppercase text-white px-6 py-4 border-b border-white/30 bg-white/5 rounded-t-xl whitespace-nowrap">
              <div className="min-w-[250px]">Besoin</div>
              <div className="min-w-[150px] text-center text-orange-400 font-semibold">
                Nombre
              </div>
            </div>

            {/* ROWS */}
            {loading ? (
              <div className="text-white text-center py-6">
                Chargement...
              </div>
            ) : rapports.length === 0 ? (
              <div className="text-white text-center py-6">
                Aucun résultat
              </div>
            ) : (
              rapports.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center px-6 py-4 rounded-lg bg-white/10 hover:bg-white/20 transition border-l-4 border-l-indigo-500"
                >
                  <div className="min-w-[250px] text-white font-semibold">
                    {item.nom}
                  </div>
                  <div className="min-w-[150px] text-center text-orange-400 font-bold">
                    {item.total}
                  </div>
                </div>
              ))
            )}

            {/* TOTAL GLOBAL */}
            {rapports.length > 0 && (
              <div className="flex items-center px-6 py-4 rounded-xl bg-white/20 border-t-4 border-white mt-2 backdrop-blur-sm shadow-inner">
                <div className="min-w-[250px] text-white font-bold">
                  TOTAL
                </div>
                <div className="min-w-[150px] text-center text-orange-400 font-extrabold text-lg">
                  {totalGlobal}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
