"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";

export default function RapportBesoinPage() {
  const [rapports, setRapports] = useState([]);
  const [loading, setLoading] = useState(false);

  const [egliseId, setEgliseId] = useState(null);
  const [brancheId, setBrancheId] = useState(null);

  useEffect(() => {
    const storedEglise = localStorage.getItem("eglise_id");
    const storedBranche = localStorage.getItem("branche_id");

    setEgliseId(storedEglise);
    setBrancheId(storedBranche);
  }, []);

  useEffect(() => {
    if (egliseId && brancheId) {
      fetchRapport();
    }
  }, [egliseId, brancheId]);

  const fetchRapport = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("membres_complets")
      .select("besoin")
      .eq("eglise_id", egliseId)
      .eq("branche_id", brancheId)
      .not("besoin", "is", null);

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    const counts = {};

    data.forEach((membre) => {
      const besoin = membre.besoin?.trim();

      if (besoin) {
        if (!counts[besoin]) counts[besoin] = 0;
        counts[besoin]++;
      }
    });

    const result = Object.entries(counts).map(([nom, total]) => ({
      besoin: nom,
      total,
    }));

    setRapports(result);
    setLoading(false);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">
        🔥 Rapport des Besoins
      </h1>

      {loading ? (
        <p className="text-center">Chargement...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-xl shadow-md">
            <thead>
              <tr className="bg-gray-100 text-black text-left">
                <th className="p-4">Besoin</th>
                <th className="p-4 text-center">Nombre</th>
              </tr>
            </thead>

            <tbody>
              {rapports.map((item, index) => (
                <tr
                  key={index}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="p-4 text-black">{item.besoin}</td>
                  <td className="p-4 text-center font-bold text-indigo-600">
                    {item.total}
                  </td>
                </tr>
              ))}
            </tbody>

            {/* TOTAL GLOBAL */}
            <tfoot>
              <tr className="bg-gray-100 font-bold border-t-2 border-white">
                <td className="p-4 text-black">TOTAL</td>
                <td className="p-4 text-center text-indigo-700">
                  {rapports.reduce((acc, curr) => acc + curr.total, 0)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
