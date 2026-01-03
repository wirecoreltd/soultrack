"use client";

import { useState } from "react";
import supabase from "../lib/supabaseClient";

export default function EditEvangelisePopup({ member, onClose, onUpdateMember }) {
  if (!member?.id) return null;

  const [form, setForm] = useState({
    prenom: member.prenom || "",
    nom: member.nom || "",
    telephone: member.telephone || "",
    ville: member.ville || "",
    sexe: member.sexe || "",
    besoin: member.besoin || "",
    infos_supplementaires: member.infos_supplementaires || "",
    priere_salut: member.priere_salut || false,
    type_conversion: member.type_conversion || "",
    is_whatsapp: member.is_whatsapp || false,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({
      ...p,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("evangelises")
      .update(form)
      .eq("id", member.id)
      .select()
      .single();

    setLoading(false);

    if (error) {
      alert("❌ Erreur : " + error.message);
      return;
    }

    onUpdateMember(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">✏️ Modifier évangélisé</h2>

        <input
          name="prenom"
          value={form.prenom}
          onChange={handleChange}
          className="w-full border p-2 mb-2"
          placeholder="Prénom"
        />
        <input
          name="nom"
          value={form.nom}
          onChange={handleChange}
          className="w-full border p-2 mb-2"
          placeholder="Nom"
        />
        <input
          name="telephone"
          value={form.telephone}
          onChange={handleChange}
          className="w-full border p-2 mb-2"
          placeholder="Téléphone"
        />

        <div className="flex justify-between mt-4">
          <button
            onClick={onClose}
            className="text-gray-500 underline"
          >
            Annuler
          </button>

          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {loading ? "..." : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}
