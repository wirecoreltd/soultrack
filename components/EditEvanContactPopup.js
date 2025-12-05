"use client";

import { useState } from "react";
import supabase from "../lib/supabaseClient";

export default function EditEvanContactPopup({ open, onClose, contact, onUpdated }) {
  const [prenom, setPrenom] = useState(contact?.prenom || "");
  const [nom, setNom] = useState(contact?.nom || "");
  const [telephone, setTelephone] = useState(contact?.telephone || "");
  const [ville, setVille] = useState(contact?.ville || "");
  const [infos, setInfos] = useState(contact?.infos_supplementaires || "");
  const [loading, setLoading] = useState(false);

  if (!open || !contact) return null;

  async function handleSave() {
    setLoading(true);

    const { error } = await supabase
      .from("suivis_evangelisation")
      .update({
        prenom,
        nom,
        telephone,
        ville,
        infos_supplementaires: infos,
      })
      .eq("id", contact.id);

    setLoading(false);

    if (error) {
      alert("Erreur lors de la mise à jour");
      return;
    }

    onUpdated();    // reload data
    onClose();      // close popup
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-96 p-6 rounded-2xl shadow-xl relative">

        <h2 className="text-xl font-bold text-gray-900 mb-4">✏️ Modifier le contact</h2>

        {/* Prénom */}
        <label className="text-sm font-semibold">Prénom</label>
        <input
          className="w-full border rounded-md px-2 py-1 mb-3"
          value={prenom}
          onChange={(e) => setPrenom(e.target.value)}
        />

        {/* Nom */}
        <label className="text-sm font-semibold">Nom</label>
        <input
          className="w-full border rounded-md px-2 py-1 mb-3"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
        />

        {/* Téléphone */}
        <label className="text-sm font-semibold">Téléphone</label>
        <input
          className="w-full border rounded-md px-2 py-1 mb-3"
          value={telephone}
          onChange={(e) => setTelephone(e.target.value)}
        />

        {/* Ville */}
        <label className="text-sm font-semibold">Ville</label>
        <input
          className="w-full border rounded-md px-2 py-1 mb-3"
          value={ville}
          onChange={(e) => setVille(e.target.value)}
        />

        {/* Infos supplémentaires */}
        <label className="text-sm font-semibold">Infos supplémentaires</label>
        <textarea
          className="w-full border rounded-md px-2 py-2 mb-3 resize-none"
          rows="3"
          value={infos}
          onChange={(e) => setInfos(e.target.value)}
        />

        {/* Boutons */}
        <div className="flex justify-end gap-2 mt-4">
          <button
            className="px-4 py-2 rounded-md bg-gray-300 hover:bg-gray-400"
            onClick={onClose}
          >
            Annuler
          </button>

          <button
            className={`px-4 py-2 rounded-md text-white ${loading ? "bg-gray-500" : "bg-blue-600 hover:bg-blue-700"}`}
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}
