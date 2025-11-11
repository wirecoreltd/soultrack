"use client";

import { useState } from "react";
import supabase from "../lib/supabaseClient";

export default function EditMemberPopup({ member, cellules = [], onClose, onUpdateMember }) {
  const besoinsOptions = ["Finances", "Santé", "Travail", "Les Enfants", "La Famille"];

  const initialBesoin =
    typeof member.besoin === "string"
      ? JSON.parse(member.besoin || "[]")
      : member.besoin || [];

  const [formData, setFormData] = useState({
    prenom: member.prenom || "",
    nom: member.nom || "",
    telephone: member.telephone || "",
    ville: member.ville || "",
    besoin: initialBesoin,
    autreBesoin: "",
    infos_supplementaires: member.infos_supplementaires || "",
    statut: member.statut || "",
    cellule_id: member.cellule_id || "",
  });

  const [showAutre, setShowAutre] = useState(initialBesoin.includes("Autre"));
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Gestion des checkboxes besoins
  const handleBesoinChange = (e) => {
    const { value, checked } = e.target;

    if (value === "Autre") {
      setShowAutre(checked);
      if (!checked) {
        setFormData((prev) => ({
          ...prev,
          autreBesoin: "",
          besoin: prev.besoin.filter((b) => b !== "Autre"),
        }));
      }
    }

    setFormData((prev) => {
      const updatedBesoin = checked
        ? [...prev.besoin, value]
        : prev.besoin.filter((b) => b !== value);
      return { ...prev, besoin: updatedBesoin };
    });
  };

  // ✅ Gestion du reste des champs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Soumission
  const handleSubmit = async () => {
    setLoading(true);

    const dataToSend = {
      ...formData,
      besoin:
        formData.autreBesoin && showAutre
          ? [...formData.besoin.filter((b) => b !== "Autre"), formData.autreBesoin]
          : formData.besoin,
    };

    // ✅ Convertir les champs vides en null
const cleanData = Object.fromEntries(
  Object.entries(formData).map(([key, value]) => [
    key,
    value === "" ? null : value,
  ])
);

const { error, data } = await supabase
  .from("membres")
  .update(cleanData)
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
      <div className="bg-white p-6 rounded-lg w-96 max-h-[90vh] overflow-y-auto shadow-xl relative">
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

          {/* ✅ BESOINS */}
          <div className="mt-2">
            <p className="font-semibold mb-2">Besoins :</p>
            {besoinsOptions.map((item) => (
              <label key={item} className="flex items-center gap-3 mb-2">
                <input
                  type="checkbox"
                  name="besoin"
                  value={item}
                  checked={formData.besoin.includes(item)}
                  onChange={handleBesoinChange}
                  className="w-5 h-5 rounded border-gray-400 cursor-pointer"
                />
                <span>{item}</span>
              </label>
            ))}

            {/* ✅ Checkbox Autre */}
            <label className="flex items-center gap-3 mb-2">
              <input
                type="checkbox"
                name="besoin"
                value="Autre"
                checked={showAutre}
                onChange={handleBesoinChange}
                className="w-5 h-5 rounded border-gray-400 cursor-pointer"
              />
              Autre
            </label>

            {/* ✅ Champ libre si Autre */}
            {showAutre && (
              <input
                type="text"
                name="autreBesoin"
                value={formData.autreBesoin}
                onChange={handleChange}
                placeholder="Précisez..."
                className="border rounded px-2 py-1 w-full"
              />
            )}
          </div>

          {/* Infos supplémentaires */}
          <textarea
            name="infos_supplementaires"
            value={formData.infos_supplementaires}
            onChange={handleChange}
            placeholder="Infos supplémentaires"
            className="border rounded px-2 py-1"
            rows={3}
          />

          {/* Statut */}
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

          {/* Cellule */}
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

        {/* Message succès */}
        {message && (
          <p className="text-green-600 text-center mt-3 font-semibold">
            {message}
          </p>
        )}

        {/* Bouton enregistrer */}
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
