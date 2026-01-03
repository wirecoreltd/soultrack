"use client";

import { useState } from "react";
import supabase from "../lib/supabaseClient";

export default function EditEvangelisePopup({
  member,
  cellules = [],
  conseillers = [],
  onClose,
  onUpdateMember,
}) {
  const besoinsOptions = ["Finances", "Santé", "Travail", "Les Enfants", "La Famille", "Autre"];

  // Préparer le tableau besoin si c'est JSON ou déjà un array
  const initialBesoin =
    typeof member.besoin === "string"
      ? JSON.parse(member.besoin || "[]")
      : member.besoin || [];

  const [formData, setFormData] = useState({
    prenom: member.prenom || "",
    nom: member.nom || "",
    telephone: member.telephone || "",
    ville: member.ville || "",
    sexe: member.sexe || "",
    besoin: initialBesoin,
    autreBesoin: initialBesoin.includes("Autre") ? initialBesoin.find(b => b !== "Autre") || "" : "",
    infos_supplementaires: member.infos_supplementaires || "",
    priere_salut: member.priere_salut ? "Oui" : "Non",
    type_conversion: member.type_conversion || "",
    is_whatsapp: member.is_whatsapp || false,
  });

  const [showAutre, setShowAutre] = useState(initialBesoin.includes("Autre"));
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  /* ===== HANDLERS ===== */

  const handleBesoinChange = (e) => {
    const { value, checked } = e.target;

    setFormData(prev => {
      let newBesoin = checked
        ? [...prev.besoin, value]
        : prev.besoin.filter(b => b !== value);

      if (value === "Autre" && !checked) {
        newBesoin = newBesoin.filter(b => b !== "Autre");
        return { ...prev, besoin: newBesoin, autreBesoin: "" };
      }

      return { ...prev, besoin: newBesoin };
    });

    if (value === "Autre") setShowAutre(checked);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "priere_salut" && value === "Non" ? { type_conversion: "" } : {})
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);

    const finalBesoin =
      showAutre && formData.autreBesoin
        ? [...formData.besoin.filter(b => b !== "Autre"), formData.autreBesoin]
        : formData.besoin;

    const cleanData = {
      prenom: formData.prenom,
      nom: formData.nom,
      telephone: formData.telephone,
      ville: formData.ville,
      sexe: formData.sexe,
      infos_supplementaires: formData.infos_supplementaires || null,
      besoin: finalBesoin,
      priere_salut: formData.priere_salut === "Oui",
      type_conversion: formData.priere_salut === "Oui" ? formData.type_conversion : null,
      is_whatsapp: formData.is_whatsapp,
    };

    try {
      // Si member.id existe, update, sinon insert (nouveau evangelisé)
      if (!member.id) throw new Error("Evangelisé invalide");

      const { data, error } = await supabase
        .from("evangelises")
        .update(cleanData)
        .eq("id", member.id)
        .select()
        .single();

      if (error) throw error;

      if (onUpdateMember) onUpdateMember(data);

      setMessage("✅ Changement enregistré !");
      setTimeout(() => {
        setMessage("");
        onClose();
      }, 1200);
    } catch (err) {
      alert("❌ Erreur : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ===== RENDER ===== */

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
        <h2 className="text-xl font-bold mb-4">Modifier l'évangélisé</h2>

        <div className="space-y-2">
          <input
            type="text"
            name="prenom"
            value={formData.prenom}
            onChange={handleChange}
            placeholder="Prénom"
            className="w-full border px-2 py-1 rounded"
          />
          <input
            type="text"
            name="nom"
            value={formData.nom}
            onChange={handleChange}
            placeholder="Nom"
            className="w-full border px-2 py-1 rounded"
          />
          <input
            type="text"
            name="telephone"
            value={formData.telephone}
            onChange={handleChange}
            placeholder="Téléphone"
            className="w-full border px-2 py-1 rounded"
          />
          <input
            type="text"
            name="ville"
            value={formData.ville}
            onChange={handleChange}
            placeholder="Ville"
            className="w-full border px-2 py-1 rounded"
          />
          <select
            name="sexe"
            value={formData.sexe}
            onChange={handleChange}
            className="w-full border px-2 py-1 rounded"
          >
            <option value="">-- Sexe --</option>
            <option value="Homme">Homme</option>
            <option value="Femme">Femme</option>
          </select>

          {/* Besoin */}
          <div className="flex flex-wrap gap-2">
            {besoinsOptions.map(b => (
              <label key={b} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  value={b}
                  checked={formData.besoin.includes(b)}
                  onChange={handleBesoinChange}
                />
                {b}
              </label>
            ))}
          </div>

          {showAutre && (
            <input
              type="text"
              name="autreBesoin"
              value={formData.autreBesoin}
              onChange={handleChange}
              placeholder="Autre besoin"
              className="w-full border px-2 py-1 rounded"
            />
          )}

          <textarea
            rows={3}
            name="infos_supplementaires"
            value={formData.infos_supplementaires}
            onChange={handleChange}
            placeholder="Infos supplémentaires"
            className="w-full border px-2 py-1 rounded"
          />

          <div className="flex items-center gap-2">
            <label>🙏 Prière salut :</label>
            <select
              name="priere_salut"
              value={formData.priere_salut}
              onChange={handleChange}
              className="border px-2 py-1 rounded"
            >
              <option value="Oui">Oui</option>
              <option value="Non">Non</option>
            </select>
          </div>

          {formData.priere_salut === "Oui" && (
            <input
              type="text"
              name="type_conversion"
              value={formData.type_conversion}
              onChange={handleChange}
              placeholder="Type de conversion"
              className="w-full border px-2 py-1 rounded"
            />
          )}

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="is_whatsapp"
              checked={formData.is_whatsapp}
              onChange={handleChange}
            />
            <span>Est WhatsApp</span>
          </div>

          {message && <p className="text-green-600">{message}</p>}
        </div>

        <div className="mt-4 flex justify-between items-center">
          <button
            onClick={onClose}
            className="bg-gray-300 rounded px-4 py-2"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-600 text-white rounded px-4 py-2"
          >
            {loading ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}
