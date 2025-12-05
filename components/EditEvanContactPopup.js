"use client";

import { useState, useEffect } from "react";
import supabase from "../lib/supabaseClient";

export default function EditEvangContactPopup({ contact, onClose, onSave }) {
  const [prenom, setPrenom] = useState(contact.prenom || "");
  const [nom, setNom] = useState(contact.nom || "");
  const [telephone, setTelephone] = useState(contact.telephone || "");
  const [ville, setVille] = useState(contact.ville || "");
  const [infosSupp, setInfosSupp] = useState(contact.infos_supplementaires || "");

  // besoin = tableau (tags)
  const [besoin, setBesoin] = useState(
    Array.isArray(contact.besoin) ? contact.besoin : []
  );
  const [newBesoinItem, setNewBesoinItem] = useState("");

  const handleAddBesoin = () => {
    if (!newBesoinItem.trim()) return;
    setBesoin((prev) => [...prev, newBesoinItem.trim()]);
    setNewBesoinItem("");
  };

  const handleRemoveBesoin = (item) => {
    setBesoin((prev) => prev.filter((b) => b !== item));
  };

  const handleSave = async () => {
    const { error } = await supabase
      .from("evangelisation_contacts")
      .update({
        prenom,
        nom,
        telephone,
        ville,
        besoin,
        infos_supplementaires: infosSupp,
      })
      .eq("id", contact.id);

    if (error) {
      console.error(error);
      alert("Erreur lors de la sauvegarde.");
      return;
    }

    onSave();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-4 z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-xl p-6">

        <h2 className="text-xl font-bold mb-4">✏️ Modifier le contact</h2>

        {/* Prénom */}
        <div className="mb-3">
          <label className="font-semibold">Prénom</label>
          <input
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
            className="w-full border rounded p-2 mt-1"
          />
        </div>

        {/* Nom */}
        <div className="mb-3">
          <label className="font-semibold">Nom</label>
          <input
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className="w-full border rounded p-2 mt-1"
          />
        </div>

        {/* Téléphone */}
        <div className="mb-3">
          <label className="font-semibold">Téléphone</label>
          <input
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            className="w-full border rounded p-2 mt-1"
          />
        </div>

        {/* Ville */}
        <div className="mb-3">
          <label className="font-semibold">Ville</label>
          <input
            value={ville}
            onChange={(e) => setVille(e.target.value)}
            className="w-full border rounded p-2 mt-1"
          />
        </div>

        {/* Besoin (array sous forme de tags) */}
        <div className="mb-3">
          <label className="font-semibold">Besoin</label>

          <div className="flex mt-1 gap-2">
            <input
              placeholder="Ajouter un besoin..."
              value={newBesoinItem}
              onChange={(e) => setNewBesoinItem(e.target.value)}
              className="flex-1 border rounded p-2"
            />
            <button
              onClick={handleAddBesoin}
              className="bg-blue-600 text-white px-4 rounded"
            >
              Ajouter
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mt-2">
            {besoin.map((item) => (
              <span
                key={item}
                className="px-3 py-1 bg-gray-200 rounded-full flex items-center gap-2"
              >
                {item}
                <button
                  className="text-red-600 font-bold"
                  onClick={() => handleRemoveBesoin(item)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Infos supplémentaires */}
        <div className="mb-3">
          <label className="font-semibold">Infos supplémentaires</label>
          <textarea
            value={infosSupp}
            onChange={(e) => setInfosSupp(e.target.value)}
            className="w-full border rounded p-2 mt-1 min-h-[80px]"
          />
        </div>

        {/* Boutons */}
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            Enregistrer
          </button>
        </div>

      </div>
    </div>
  );
}
