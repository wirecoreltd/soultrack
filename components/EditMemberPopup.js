"use client";

import { useState } from "react";
import supabase from "../lib/supabaseClient";

export default function EditMemberPopup({ member, onClose, onUpdateMember }) {
  const [formData, setFormData] = useState({
    prenom: member.prenom || "",
    nom: member.nom || "",
    telephone: member.telephone || "",
    statut: member.statut || "",
    ville: member.ville || "",
    venu: member.venu || "",
    infos_supplementaires: member.infos_supplementaires || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const { error, data } = await supabase
      .from("membres")
      .update(formData)
      .eq("id", member.id)
      .select()
      .single();

    if (error) {
      alert("❌ Erreur lors de la mise à jour : " + error.message);
    } else {
      // Mise à jour instantanée dans ListMembers
      onUpdateMember(data);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-80 max-h-[90vh] overflow-y-auto shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-red-500 font-bold hover:text-red-700"
          aria-label="Fermer la fenêtre"
        >
          ✕
        </button>

        <h2 className="text-lg font-bold text-gray-800 text-center mb-4">
          Modifier {member.prenom} {member.nom}
        </h2>

        <div className="flex flex-col space-y-2 text-sm">
          <input
            name="prenom"
            value={formData.prenom}
            onChange={handleChange}
            placeholder="Prénom"
            className="border rounded px-2 py-1"
          />
          <input
            name="nom"
            value={formData.nom}
            onChange={handleChange}
            placeholder="Nom"
            className="border rounded px-2 py-1"
          />
          <input
            name="telephone"
            value={formData.telephone}
            onChange={handleChange}
            placeholder="Téléphone"
            className="border rounded px-2 py-1"
          />
          <input
            name="ville"
            value={formData.ville}
            onChange={handleChange}
            placeholder="Ville"
            className="border rounded px-2 py-1"
          />
          <input
            name="venu"
            value={formData.venu}
            onChange={handleChange}
            placeholder="Comment est-il venu"
            className="border rounded px-2 py-1"
          />
          <input
            name="infos_supplementaires"
            value={formData.infos_supplementaires}
            onChange={handleChange}
            placeholder="Infos supplémentaires"
            className="border rounded px-2 py-1"
          />
          <select
            name="statut"
            value={formData.statut}
            onChange={handleChange}
            className="border rounded px-2 py-1"
          >
            <option value="">-- Statut --</option>
            <option value="actif">actif</option>
            <option value="Integrer">Integrer</option>
            <option value="ancien">ancien</option>
            <option value="veut rejoindre ICC">veut rejoindre ICC</option>
            <option value="visiteur">visiteur</option>
            <option value="a déjà mon église">a déjà mon église</option>
          </select>
        </div>

        <button
          onClick={handleSubmit}
          className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Enregistrer
        </button>
      </div>
    </div>
  );
}
