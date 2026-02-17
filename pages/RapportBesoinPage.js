"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";

export default function RapportBesoins() {
  const [rapports, setRapports] = useState([]);
  const [loading, setLoading] = useState(true);

  const [egliseId, setEgliseId] = useState(null);
  const [brancheId, setBrancheId] = useState(null);

  // =============================
  // 🔹 Récupérer session + IDs
  // =============================
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        setEgliseId(user.user_metadata.eglise_id || null);
        setBrancheId(user.user_metadata.branche_id || null);
      }
    };

    getUser();
  }, []);

  // =============================
  // 🔹 Récupérer rapports
  // =============================
  useEffect(() => {
    if (!egliseId) return;

    const fetchRapports = async () => {
      let query = supabase
        .from("membres_complets")
        .select("*")
        .eq("eglise_id", egliseId);

      if (brancheId) {
        query = query.eq("branche_id", brancheId);
      }

      const { data, error } = await query;

      if (!error) {
        setRapports(data || []);
      } else {
        console.error(error);
      }

      setLoading(false);
    };

    fetchRapports();
  }, [egliseId, brancheId]);

  // =============================
  // 🔹 Calcul des besoins (CORRIGÉ)
  // =============================
  const besoinsCount = {};

  rapports.forEach((r) => {
    if (!r.besoins) return;

    // transforme "Finances, Santé" en tableau
    const besoinsArray = r.besoins
      .split(",")
      .map((b) => b.trim())
      .filter((b) => b !== "");

    besoinsArray.forEach((besoin) => {
      besoinsCount[besoin] = (besoinsCount[besoin] || 0) + 1;
    });
  });

  const besoinsArrayFinal = Object.entries(besoinsCount);

  // =============================
  // 🔹 RENDER
  // =============================
  return (
    <div className="p-6">
      <HeaderPages title="Rapport des Besoins" />

      {loading ? (
        <p className="mt-6">Chargement...</p>
      ) : (
        <div className="mt-6 bg-white rounded-xl shadow p-6">
          {besoinsArrayFinal.length === 0 ? (
            <p>Aucun besoin enregistré.</p>
          ) : (
            <div className="space-y-3">
              {besoinsArrayFinal.map(([besoin, nombre]) => (
                <div
                  key={besoin}
                  className="flex justify-between items-center border-b pb-2"
                >
                  <span className="font-medium text-gray-700">
                    {besoin}
                  </span>
                  <span className="font-bold text-lg">
                    {nombre}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
