"use client";

import { useState } from "react";
import supabase from "../lib/supabaseClient";

export default function EditCelluleModal({ cellule, onClose, onUpdated }) {
  const [celluleName, setCelluleName] = useState(cellule.cellule);
  const [ville, setVille] = useState(cellule.ville);
  const [responsable, setResponsable] = useState(cellule.responsable);
  const [telephone, setTelephone] = useState(cellule.telephone);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("cellules")
      .update({
        cellule: celluleName,
        ville,
        responsable,
        telephone,
      })
      .eq("id", cellule.id)
      .select()
      .single();

    setLoading(false);

    if (!error) {
      onUpdated(data);
      onClose();
    } else {
      console.log("❌ UPDATE ERROR:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[999]">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-[90%] max-w-lg">
        <h2 className="text-2xl font-bold mb-4 text-purple-700 text-center">
          Modifier la cellule
        </h2>

        <div className="space-y-4">
          <div>
            <label className="font-semibold">Nom de la cellule</label>
            <input
              className="w-full mt-1 p-2 rounded-xl border"
              value={celluleName}
              onChange={(e) => setCelluleName(e.target.value)}
            />
          </div>

          <div>
            <label className="font-semibold">Ville</label>
            <input
              className="w-full mt-1 p-2 rounded-xl border"
              value={ville}
              onChange={(e) => setVille(e.target.value)}
            />
          </div>

          <div>
            <label className="font-semibold">Responsable</label>
            <input
              className="w-full mt-1 p-2 rounded-xl border"
              value={responsable}
              onChange={(e) => setResponsable(e.target.value)}
            />
          </div>

          <div>
            <label className="font-semibold">Téléphone</label>
            <input
              className="w-full mt-1 p-2 rounded-xl border"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-center gap-4 mt-6">
          <button
            className="px-5 py-2 bg-gray-300 rounded-xl hover:bg-gray-400 font-semibold"
            onClick={onClose}
          >
            Annuler
          </button>

          <button
            onClick={handleSave}
            className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold"
          >
            {loading ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}
