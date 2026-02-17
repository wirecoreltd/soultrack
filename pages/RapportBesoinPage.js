"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";

export default function RapportBesoins() {
  const [rapports, setRapports] = useState([]);
  const [loading, setLoading] = useState(true);

  // =============================
  // 🔹 FETCH DIRECT (SANS metadata)
  // =============================
  useEffect(() => {
    const fetchRapports = async () => {
      const { data, error } = await supabase
        .from("membres_complets")
        .select("besoins");

      if (error) {
        console.error(error);
      } else {
        setRapports(data || []);
      }

      setLoading(false);
    };

    fetchRapports();
  }, []);

  // =============================
  // 🔹 Calcul besoins
  // =============================
  const besoinsCount = {};

  rapports.forEach((r) => {
    if (!r.besoins) return;

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
