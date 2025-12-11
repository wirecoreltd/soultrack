"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";

export default function EditMemberPopup({ member, onClose, onUpdateMember }) {
  const [form, setForm] = useState({
    prenom: "",
    nom: "",
    telephone: "",
    ville: "",
    cellule_id: null,
    conseiller_id: null,
  });

  const [cellules, setCellules] = useState([]);
  const [conseillers, setConseillers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Charger les cellules & conseillers
  useEffect(() => {
    const load = async () => {
      const { data: c } = await supabase.from("cellules").select("*");
      const { data: p } = await supabase.from("profiles")
        .select("id, prenom, nom")
        .eq("role", "Conseiller");

      if (c) setCellules(c);
      if (p) setConseillers(p);
    };
    load();
  }, []);

  // Charger les données du membre
  useEffect(() => {
    if (member) {
      setForm({
        prenom: member.prenom || "",
        nom: member.nom || "",
        telephone: member.telephone || "",
        ville: member.ville || "",
        cellule_id: member.cellule_id || null,
        conseiller_id: member.conseiller_id || null,
      });
    }
  }, [member]);

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  // 🔥 RÈGLE MÉTIER :
  // CHOISIR CELLULE = supprimer le conseiller
  const handleSelectCellule = (value) => {
    setForm(prev => ({
      ...prev,
      cellule_id: value,
      conseiller_id: null, // efface automatiquement le conseiller
    }));
  };

  // 🔥 RÈGLE MÉTIER :
  // CHOISIR CONSEILLER = supprimer la cellule
  const handleSelectConseiller = (value) => {
    setForm(prev => ({
      ...prev,
      conseiller_id: value,
      cellule_id: null, // efface automatiquement la cellule
    }));
  };

  const handleSave = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("membres")
      .update({
        prenom: form.prenom,
        nom: form.nom,
        telephone: form.telephone,
        ville: form.ville,
        cellule_id: form.cellule_id,
        conseiller_id: form.conseiller_id,
      })
      .eq("id", member.id)
      .select()
      .single();

    setLoading(false);

    if (error) {
      console.error(error);
      alert("Erreur lors de la mise à jour");
      return;
    }

    onUpdateMember(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg">
        <h2 className="text-lg font-bold mb-4">Modifier le membre</h2>

        {/* Prénom */}
        <label className="block text-sm font-semibold">Prénom</label>
        <input
          className="border w-full p-2 rounded mb-3"
          value={form.prenom}
          onChange={(e) => updateField("prenom", e.target.value)}
        />

        {/* Nom */}
        <label className="block text-sm font-semibold">Nom</label>
        <input
          className="border w-full p-2 rounded mb-3"
          value={form.nom}
          onChange={(e) => updateField("nom", e.target.value)}
        />

        {/* Téléphone */}
        <label className="block text-sm font-semibold">Téléphone</label>
        <input
          className="border w-full p-2 rounded mb-3"
          value={form.telephone}
          onChange={(e) => updateField("telephone", e.target.value)}
        />

        {/* Ville */}
        <label className="block text-sm font-semibold">Ville</label>
        <input
          className="border w-full p-2 rounded mb-3"
          value={form.ville}
          onChange={(e) => updateField("ville", e.target.value)}
        />

        {/* 🔥 SELECT CELLULE */}
        <label className="block text-sm font-semibold">Cellule</label>
        <select
          className="border w-full p-2 rounded mb-3"
          value={form.cellule_id || ""}
          onChange={(e) => handleSelectCellule(e.target.value || null)}
        >
          <option value="">— Aucune —</option>
          {cellules.map((c) => (
            <option key={c.id} value={c.id}>
              {c.ville} - {c.cellule}
            </option>
          ))}
        </select>

        {/* 🔥 SELECT CONSEILLER */}
        <label className="block text-sm font-semibold">Conseiller</label>
        <select
          className="border w-full p-2 rounded mb-3"
          value={form.conseiller_id || ""}
          onChange={(e) => handleSelectConseiller(e.target.value || null)}
        >
          <option value="">— Aucun —</option>
          {conseillers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.prenom} {c.nom}
            </option>
          ))}
        </select>

        <div className="flex justify-end gap-3 mt-4">
          <button className="px-4 py-2 bg-gray-300 rounded" onClick={onClose}>
            Annuler
          </button>

          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
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
