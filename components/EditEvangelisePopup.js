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
    priere_salut: member.priere_salut || false,
    type_conversion: member.type_conversion || "",
    is_whatsapp: member.is_whatsapp || false,
    sexe: member.sexe || "",
  });

  const [showAutre, setShowAutre] = useState(initialBesoin.includes("Autre"));
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

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
      const updated = checked
        ? [...prev.besoin, value]
        : prev.besoin.filter((b) => b !== value);
      return { ...prev, besoin: updated };
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);

    const cleanData = {
      prenom: formData.prenom,
      nom: formData.nom,
      telephone: formData.telephone,
      ville: formData.ville,
      infos_supplementaires: formData.infos_supplementaires || null,
      besoin:
        formData.autreBesoin && showAutre
          ? [...formData.besoin.filter((b) => b !== "Autre"), formData.autreBesoin]
          : formData.besoin,
      priere_salut: formData.priere_salut,
      type_conversion: formData.type_conversion,
      is_whatsapp: formData.is_whatsapp,
      sexe: formData.sexe,
    };

    const { error, data } = await supabase
      .from("evangelises")
      .update(cleanData)
      .eq("id", member.id)
      .select()
      .single();

    if (error) {
      alert("❌ Erreur : " + error.message);
    } else {
      if (onUpdateMember) onUpdateMember(data);
      setMessage("✅ Changement enregistré !");
      setTimeout(() => {
        setMessage("");
        onClose();
      }, 1200);
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4 py-6 overflow-auto">
      <div className="bg-white w-full max-w-md rounded-xl shadow-xl relative p-6">

        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">✏️ Modifier le contact</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">

          {/* Prénom */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">Prénom</label>
            <div className="flex">
              <div className="bg-blue-600 p-2 flex items-center justify-center">
                <span className="text-white">👤</span>
              </div>
              <input
                type="text"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                placeholder="Prénom"
                className="flex-1 px-3 py-2 border-l border-gray-300 focus:ring-2 focus:ring-blue-600 outline-none text-black"
              />
            </div>
          </div>

          {/* Nom */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">Nom</label>
            <div className="flex">
              <div className="bg-blue-600 p-2 flex items-center justify-center">
                <span className="text-white">👤</span>
              </div>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                placeholder="Nom"
                className="flex-1 px-3 py-2 border-l border-gray-300 focus:ring-2 focus:ring-blue-600 outline-none text-black"
              />
            </div>
          </div>

          {/* Téléphone */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">Téléphone</label>
            <div className="flex">
              <div className="bg-blue-600 p-2 flex items-center justify-center">
                <span className="text-white">📞</span>
              </div>
              <input
                type="text"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                placeholder="Téléphone"
                className="flex-1 px-3 py-2 border-l border-gray-300 focus:ring-2 focus:ring-blue-600 outline-none text-black"
              />
            </div>
          </div>

          {/* Ville */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">Ville</label>
            <div className="flex">
              <div className="bg-blue-600 p-2 flex items-center justify-center">
                <span className="text-white">🏙️</span>
              </div>
              <input
                type="text"
                name="ville"
                value={formData.ville}
                onChange={handleChange}
                placeholder="Ville"
                className="flex-1 px-3 py-2 border-l border-gray-300 focus:ring-2 focus:ring-blue-600 outline-none text-black"
              />
            </div>
          </div>

          {/* WhatsApp */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">WhatsApp</label>
            <div className="flex">
              <div className="bg-blue-600 p-2 flex items-center justify-center">
                <span className="text-white">💬</span>
              </div>
              <label className="flex-1 px-3 py-2 border-l border-gray-300 items-center flex">
                <input
                  type="checkbox"
                  name="is_whatsapp"
                  checked={formData.is_whatsapp}
                  onChange={handleChange}
                  className="w-4 h-4 accent-blue-600 mr-2"
                />
                WhatsApp
              </label>
            </div>
          </div>

          {/* Sexe */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">Sexe</label>
            <div className="flex">
              <div className="bg-blue-600 p-2 flex items-center justify-center">
                <span className="text-white">🎗️</span>
              </div>
              <input
                type="text"
                name="sexe"
                value={formData.sexe}
                onChange={handleChange}
                placeholder="Sexe"
                className="flex-1 px-3 py-2 border-l border-gray-300 focus:ring-2 focus:ring-blue-600 outline-none text-black"
              />
            </div>
          </div>

          {/* Prière du salut */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">Prière du salut</label>
            <div className="flex">
              <div className="bg-blue-600 p-2 flex items-center justify-center">
                <span className="text-white">🙏</span>
              </div>
              <select
                name="priere_salut"
                value={formData.priere_salut ? "oui" : "non"}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, priere_salut: e.target.value === "oui" }))
                }
                className="flex-1 px-3 py-2 border-l border-gray-300 focus:ring-2 focus:ring-blue-600 outline-none text-black"
              >
                <option value="non">Non</option>
                <option value="oui">Oui</option>
              </select>
            </div>
          </div>

          {/* Type conversion */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">Type de conversion</label>
            <div className="flex">
              <div className="bg-blue-600 p-2 flex items-center justify-center">
                <span className="text-white">☀️</span>
              </div>
              <input
                type="text"
                name="type_conversion"
                value={formData.type_conversion}
                onChange={handleChange}
                placeholder="Type de conversion"
                className="flex-1 px-3 py-2 border-l border-gray-300 focus:ring-2 focus:ring-blue-600 outline-none text-black"
              />
            </div>
          </div>

          {/* Besoins */}
          <div>
            <p className="mb-2 font-medium text-gray-700">❓ Besoins</p>
            <div className="grid grid-cols-2 gap-2">
              {besoinsOptions.map((item) => (
                <label key={item} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    value={item}
                    checked={formData.besoin.includes(item)}
                    onChange={handleBesoinChange}
                    className="w-4 h-4 accent-blue-600"
                  />
                  {item}
                </label>
              ))}
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  value="Autre"
                  checked={showAutre}
                  onChange={handleBesoinChange}
                  className="w-4 h-4 accent-blue-600"
                />
                Autre
              </label>
            </div>
            {showAutre && (
              <input
                type="text"
                name="autreBesoin"
                value={formData.autreBesoin}
                onChange={handleChange}
                placeholder="Précisez..."
                className="w-full mt-2 px-3 py-2 border rounded focus:ring-2 focus:ring-blue-600 outline-none text-black"
              />
            )}
          </div>

          {/* Infos supplémentaires */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">Infos supplémentaires</label>
            <div className="flex">
              <div className="bg-blue-600 p-2 flex items-center justify-center">
                <span className="text-white">📝</span>
              </div>
              <textarea
                name="infos_supplementaires"
                value={formData.infos_supplementaires}
                onChange={handleChange}
                placeholder="Infos supplémentaires"
                rows={3}
                className="flex-1 px-3 py-2 border-l border-gray-300 focus:ring-2 focus:ring-blue-600 outline-none text-black"
              />
            </div>
          </div>

          {message && (
            <p className="text-green-600 text-center font-semibold">{message}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 font-medium"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`px-6 py-2 rounded-lg text-white font-semibold ${
              loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}
