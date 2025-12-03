"use client";

import { useEffect, useState } from "react";
import supabase from "../../lib/supabaseClient";

export default function ListCellules() {
  const [cellules, setCellules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchCellules = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("cellules")
          .select(`
            id,
            cellule,
            ville,
            responsable,
            telephone
          `);

        if (error) throw error;
        setCellules(data || []);
      } catch (err) {
        console.error("❌ Erreur récupération cellules:", err);
        setMessage("Erreur lors de la récupération des cellules.");
      } finally {
        setLoading(false);
      }
    };

    fetchCellules();
  }, []);

  if (loading) return <p className="text-center mt-10 text-lg">Chargement...</p>;
  if (message) return <p className="text-center text-red-600 mt-10">{message}</p>;

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-green-200 via-orange-100 to-purple-200">
      <div className="flex flex-col items-center mb-6">
        <h2 className="text-3xl font-bold text-center text-purple-700 mb-6">🏠 Liste des cellules</h2>
      </div>

      <div className="max-w-5xl mx-auto border border-gray-200 rounded-xl overflow-hidden bg-white shadow-xl">
        <div className="grid grid-cols-[2fr_2fr_2fr_2fr] gap-4 px-4 py-2 bg-purple-600 text-white font-semibold">
          <span>Nom de la cellule</span>
          <span>Zone / Ville</span>
          <span>Responsable</span>
          <span>Téléphone</span>
        </div>

        {cellules.map((c) => (
          <div key={c.id} className="grid grid-cols-[2fr_2fr_2fr_2fr] gap-4 px-4 py-3 border-b border-gray-200 hover:bg-purple-50 transition-all">
            <span className="font-semibold text-gray-700">{c.cellule}</span>
            <span className="text-gray-700">{c.ville}</span>
            <span className="font-medium text-purple-700">{c.responsable}</span>
            <span className="text-gray-700">{c.telephone}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
