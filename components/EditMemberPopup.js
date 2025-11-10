"use client";

import { useState } from "react";
import supabase from "../lib/supabaseClient";

export default function EditMemberPopup({ member, cellules, onClose }) {
  const [formData, setFormData] = useState({
    prenom: member.prenom || "",
    nom: member.nom || "",
    ville: member.ville || "",
    telephone: member.telephone || "",
    besoin: member.besoin || "",
    cellule_id: member.cellule_id || "",
    infos_supplementaires: member.infos_supplementaires || "",
    statut: member.statut || "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase
      .from("membres")
      .update({
        prenom: formData.prenom,
        nom: formData.nom,
        ville: formData.ville,
        telephone: formData.telephone,
        besoin: formData.besoin,
        cellule_id: formData.cellule_id,
        infos_supplementaires: formData.infos_supplementaires,
        statut: formData.statut,
      })
      .eq("id", member.id);
    setLoading(false);

    if (!error) {
      alert("✅ Membre mis à jour avec succès !");
      onClose();
    } else {
      alert("❌ Erreur lors de la mise à jour : " + error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white text-black rounded-lg p-6 w-96 shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-red-500 font-bold hover:text-red-700"
        >
          ✕
        </button>

        <h2 className="text-lg font-bold text-center mb-4">
          Modifier le contact
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            name="prenom"
            value={formData.prenom}
            onChange={handleChange}
            placeholder="Prénom"
            className="border rounded w-full px-3 py-2 text-sm"
          />
          <input
            name="nom"
            value={formData.nom}
            onChange={handleChange}
            placeholder="Nom"
            className="border rounded w-full px-3 py-2 text-sm"
          />
          <input
            name="ville"
            value={formData.ville}
            onChange={handleChange}
            placeholder="Ville"
            className="border rounded w-full px-3 py-2 text-sm"
          />
          <input
            name="telephone"
            value={formData.telephone}
            onChange={handleChange}
            placeholder="Téléphone"
            className="border rounded w-full px-3 py-2 text-sm"
          />
          <input
            name="besoin"
            value={formData.besoin}
            onChange={handleChange}
            placeholder="Besoin"
            className="border rounded w-full px-3 py-2 text-sm"
          />
          <select
            name="cellule_id"
            value={formData.cellule_id}
            onChange={handleChange}
            className="border rounded w-full px-3 py-2 text-sm"
          >
            <option value="">-- Sélectionner une cellule --</option>
            {cellules.map((c) => (
              <option key={c.id} value={c.id}>
                {c.cellule} ({c.responsable})
              </option>
            ))}
          </select>
          <textarea
            name="infos_supplementaires"
            value={formData.infos_supplementaires}
            onChange={handleChange}
            placeholder="Commentaire"
            className="border rounded w-full px-3 py-2 text-sm"
          />
          <select
            name="statut"
            value={formData.statut}
            onChange={handleChange}
            className="border rounded w-full px-3 py-2 text-sm"
          >
            <option value="">-- Sélectionner un statut --</option>
            <option>actif</option>
            <option>Integrer</option>
            <option>ancien</option>
            <option>veut rejoindre ICC</option>
            <option>visiteur</option>
            <option>a déjà mon église</option>
          </select>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white rounded w-full py-2 mt-2 hover:bg-blue-700"
          >
            {loading ? "Enregistrement..." : "💾 Sauvegarder"}
          </button>
        </form>
      </div>
    </div>
  );
}
