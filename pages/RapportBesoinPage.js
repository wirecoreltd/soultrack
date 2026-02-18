"use client";

import { useState } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import Footer from "../components/Footer";
import ProtectedRoute from "../components/ProtectedRoute";

export default function RapportBesoinPage() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableSuivi"]}>
      <RapportBesoin />
    </ProtectedRoute>
  );
}

function RapportBesoin() {
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [besoinsCount, setBesoinsCount] = useState({});
  const [message, setMessage] = useState("");

  const fetchRapport = async () => {
    setMessage("⏳ Chargement...");
    setBesoinsCount({}); // reset pour éviter doublons

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("eglise_id, branche_id")
        .eq("id", session.session.user.id)
        .single();

      let query = supabase
        .from("membres_complets")
        .select("besoin, created_at")
        .eq("eglise_id", profile.eglise_id)
        .eq("branche_id", profile.branche_id);

      if (dateDebut) query = query.gte("created_at", dateDebut);
      if (dateFin) query = query.lte("created_at", dateFin);

      const { data, error } = await query;
      if (error) throw error;

      const count = {};

      (data || []).forEach((r) => {
        if (!r.besoin) return;

        let besoinsArray = [];
        try {
          if (r.besoin.startsWith("[")) {
            besoinsArray = JSON.parse(r.besoin);
          } else {
            besoinsArray = r.besoin.split(",");
          }
        } catch {
          besoinsArray = r.besoin.split(",");
        }

        besoinsArray.forEach((b) => {
          const clean = b.trim();
          if (!clean) return;

          clean.split(",").forEach((finalBesoin) => {
            const final = finalBesoin.trim();
            if (!final) return;

            if (!count[final]) count[final] = 0;
            count[final]++;
          });
        });
      });

      setBesoinsCount(count);
      setMessage("");
    } catch (err) {
      console.error(err);
      setMessage("❌ " + err.message);
    }
  };

  const labels = Object.keys(besoinsCount);
  const values = Object.values(besoinsCount);
  const total = values.reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />

      <h1 className="text-2xl font-bold text-white mt-4 mb-6">
        Rapport Besoins
      </h1>

      {/* FILTRES */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex flex-col">
          <label htmlFor="dateDebut" className="font-medium mb-1 text-white">
            Date de début
          </label>
          <input
            type="date"
            value={dateDebut}
            onChange={(e) => setDateDebut(e.target.value)}
            className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="dateFin" className="font-medium mb-1 text-white">
            Date de fin
          </label>
          <input
            type="date"
            value={dateFin}
            onChange={(e) => setDateFin(e.target.value)}
            className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white"
          />
        </div>

        <div className="flex items-end">
          <button
            onClick={fetchRapport}
            className="bg-[#2a2f85] px-6 py-2 rounded-xl hover:bg-[#1f2366] transition"
          >
            Générer
          </button>
        </div>
      </div>

      {message && <p className="text-white mb-4">{message}</p>}

      {/* TABLE */}
      {labels.length > 0 && (
        <div className="w-full max-w-[600px] bg-white/10 rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-3 text-white font-bold border-b border-white/30 pb-2 mb-2 text-center">
            <div className="text-left pl-2">Besoin</div>
            <div className="text-orange-400">Nombre</div>
            <div>% du total des membres</div>
          </div>

          {labels.map((b, i) => (
            <div
              key={b}
              className="grid grid-cols-3 text-white py-2 border-b border-white/10 text-center"
            >
              <div className="text-left pl-2">{b}</div>
              <div className="text-orange-400 font-semibold">{values[i]}</div>
              <div className="font-semibold">
                {total > 0 ? ((values[i] / total) * 100).toFixed(1) : 0} %
              </div>
            </div>
          ))}
        </div>
      )}

      <Footer />
    </div>
  );
}
