"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import supabase from "../../lib/supabaseClient";
import EditCelluleModal from "../../components/EditCelluleModal";

export default function ListCellules() {
  const router = useRouter();
  const [cellules, setCellules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [selectedCellule, setSelectedCellule] = useState(null);

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

  // Mise à jour instantanée
  const handleUpdated = (updated) => {
    setCellules(prev =>
      prev.map(c => (c.id === updated.id ? updated : c))
    );
  };

  if (loading) return <p className="text-center mt-10 text-lg">Chargement...</p>;
  if (message) return <p className="text-center text-red-600 mt-10">{message}</p>;

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-green-200 via-orange-100 to-purple-200">

      {/* Bouton retour */}
      <button
        onClick={() => router.back()}
        className="absolute top-4 left-4 text-black font-semibold hover:text-gray-700"
      >
        ← Retour
      </button>

      {/* Logo + Titre */}
      <div className="flex flex-col items-center mb-6">
        <Image src="/logo.png" alt="Logo" width={80} height={80} />
        <h1 className="text-3xl font-bold text-center mt-2 text-purple-700">
          🏠 Liste des cellules
        </h1>
      </div>

      {/* Boutons */}
      <div className="max-w-5xl mx-auto mb-4 flex justify-end gap-4">
        <button
          onClick={() => router.push("/admin/create-internal-user")}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl shadow-md transition"
        >
          ➕ Créer un responsable
        </button>

        <button
          onClick={() => router.push("/admin/create-cellule")}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl shadow-md transition"
        >
          ➕ Créer une cellule
        </button>
      </div>

      {/* Table */}
      <div className="max-w-5xl mx-auto border border-gray-200 rounded-xl overflow-hidden bg-white shadow-xl">
        <div className="grid grid-cols-[2fr_2fr_2fr_2fr_auto] gap-4 px-4 py-2 bg-purple-600 text-white font-semibold">
          <span>Zone / Ville</span>
          <span>Nom de la cellule</span>
          <span>Responsable</span>
          <span>Téléphone</span>
          <span className="text-center">Actions</span>
        </div>

        {cellules.map((c) => (
          <div
            key={c.id}
            className="grid grid-cols-[2fr_2fr_2fr_2fr_auto] gap-4 px-4 py-3 border-b border-gray-200 hover:bg-purple-50 transition-all"
          >
            <span>{c.ville}</span>
            <span className="font-semibold text-gray-700">{c.cellule}</span>            
            <span className="text-purple-700 font-medium">{c.responsable}</span>
            <span>{c.telephone}</span>

            <div className="flex justify-center">
              <button
                onClick={() => setSelectedCellule(c)}
                className="text-blue-600 hover:text-blue-800 text-xl"
              >
                ✏️
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Popup */}
      {selectedCellule && (
        <EditCelluleModal
          cellule={selectedCellule}
          onClose={() => setSelectedCellule(null)}
          onUpdated={handleUpdated}
        />
      )}
    </div>
  );
}
