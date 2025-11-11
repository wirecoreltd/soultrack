"use client";

import { useState } from "react";
import supabase from "../lib/supabaseClient";

export default function EditMemberPopup({
  member,
  cellules = [],
  onClose,
  onUpdateMember,
}) {
  const besoinsOptions = ["Finances", "Santé", "Travail", "Les Enfants", "La Famille"];

  const [formData, setFormData] = useState({
    prenom: member.prenom || "",
    nom: member.nom || "",
    telephone: member.telephone || "",
    ville: member.ville || "",
    besoin: Array.isArray(member.besoin)
      ? member.besoin
      : member.besoin
      ? JSON.parse(member.besoin)
      : [],
    infos_supplementaires: member.infos_supplementaires || "",
    statut: member.statut || "",
    cellule_id: member.cellule_id || "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔹 Gestion du changement classique (input/select)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 Gestion du multi-select pour les besoins
  const handleBesoinsChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, (opt) => opt.value);
    setFormData((prev) => ({ ...prev, besoin: selectedOptions }));
  };

  // 🔹 Enregistrement
  const handleSubmit = async () => {
    setLoading(true);

    const { error, data } = await supabase
      .from("membres")
      .update({
        ...formData,
        besoin: JSON.stringify(formData.besoin),
      })
      .eq("id", member.id)
      .select()
      .single();

    if (error) {
      alert("❌ Erreur lors de la mise à jour : " + error.message);
    } else {
      if (onUpdateMember) onUpdateMember(data);
      setMessage("✅ Changement enregistré !");
      setTimeout(() => {
        setMessage("");
        onClose();
      }, 1500);
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-80 max-h-[90vh] overflow-y-auto shadow-xl relative">
        {/* Bouton fermer */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-red-500 font-bold hover:text-red-700"
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
            name="ville"
            value={formData.ville}
            onChange={handleChange}
            placeholder="Ville"
            className="border rounded px-2 py-1"
          />
          <input
            name="telephone"
            value={formData.telephone}
            onChange={handleChange}
            placeholder="Téléphone"
            className="border rounded px-2 py-1"
          />

          {/* 🔹 Sélecteur multi besoins */}
          <label className="font-semibold mt-2">Besoins :</label>
          <select
            multiple
            value={formData.besoin}
            onChange={handleBesoinsChange}
            className="border rounded px-2 py-1 h-24"
          >
            {besoinsOptions.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          <textarea
            name="infos_supplementaires"
            value={formData.infos_supplementaires}
            onChange={handleChange}
            placeholder="Infos supplémentaires"
            className="border rounded px-2 py-1"
            rows={3}
          />

          <select
            name="statut"
            value={formData.statut}
            onChange={handleChange}
            className="border rounded px-2 py-1"
          >
            <option value="">-- Statut --</option>
            <option value="actif">actif</option>
            <option value="integrer">Integrer</option>
            <option value="ancien">ancien</option>
            <option value="veut rejoindre ICC">veut rejoindre ICC</option>
            <option value="visiteur">visiteur</option>
            <option value="a déjà son église">a déjà son église</option>
          </select>

          {/* 🔹 Sélecteur cellule */}
          <select
            name="cellule_id"
            value={formData.cellule_id}
            onChange={handleChange}
            className="border rounded px-2 py-1"
          >
            <option value="">-- Cellule --</option>
            {cellules.map((c) => (
              <option key={c.id} value={c.id}>
                {c.cellule} ({c.responsable})
              </option>
            ))}
          </select>
        </div>

        {message && (
          <p className="text-green-600 text-center mt-3 font-semibold">
            {message}
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`mt-4 w-full text-white py-2 rounded transition font-bold ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Enregistrement..." : "Enregistrer"}
        </button>
      </div>
    </div>
  );
}
