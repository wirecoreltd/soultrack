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

  if (loading) return <p className="text-center mt-10">Chargement...</p>;
  if (message) return <p className="text-center text-red-600 mt-10">{message}</p>;

  return (
    <div className="p-6 min-h-screen bg-gradient-to-b from-purple-100 to-purple-50">
      <h2 className="text-3xl font-bold text-center text-purple-700 mb-6">🏠 Liste des cellules</h2>
      <div className="overflow-x-auto bg-white rounded-3xl shadow-2xl p-6">
        <table className="min-w-full text-sm">
          <thead className="bg-purple-600 text-white">
            <tr>
              <th className="py-3 px-4 text-left">Nom de la cellule</th>
              <th className="py-3 px-4 text-left">Zone / Ville</th>
              <th className="py-3 px-4 text-left">Responsable</th>
              <th className="py-3 px-4 text-left">Téléphone</th>
            </tr>
          </thead>
          <tbody>
            {cellules.map((c) => (
              <tr key={c.id} className="border-b hover:bg-purple-50 transition-all">
                <td className="py-3 px-4 font-semibold text-gray-700">{c.cellule}</td>
                <td className="py-3 px-4">{c.ville}</td>
                <td className="py-3 px-4 font-medium text-purple-700">{c.responsable}</td>
                <td className="py-3 px-4">{c.telephone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
