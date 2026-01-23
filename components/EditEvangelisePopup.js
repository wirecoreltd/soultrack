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
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
    <div className="bg-white w-full max-w-2xl rounded-xl shadow-xl relative">

      {/* Header */}
      <div className="border-b px-6 py-4 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-gray-800">
            Modifier le contact
          </h2>
          <p className="text-sm text-gray-500">
            {member.prenom} {member.nom}
          </p>
        </div>

        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-700 text-2xl leading-none"
        >
          ×
        </button>
      </div>

      {/* Form */}
      <div className="p-6 space-y-5 text-sm max-h-[75vh] overflow-y-auto">

        {/* Prénom / Nom */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium text-gray-700">Prénom</label>
            <input
              name="prenom"
              value={formData.prenom}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">Nom</label>
            <input
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>
        </div>

        {/* Ville / Téléphone */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium text-gray-700">Ville</label>
            <input
              name="ville"
              value={formData.ville}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">Téléphone</label>
            <input
              name="telephone"
              value={formData.telephone}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>
        </div>

        {/* WhatsApp */}
        <label className="flex items-center gap-2 font-medium text-gray-700">
          <input
            type="checkbox"
            name="is_whatsapp"
            checked={formData.is_whatsapp}
            onChange={handleChange}
            className="w-4 h-4 accent-green-600"
          />
          WhatsApp
        </label>

        {/* Prière du salut — OPTION (menu déroulant si tu veux plus tard) */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">
            Prière du salut
          </label>
          <select
            name="priere_salut"
            value={formData.priere_salut ? "oui" : "non"}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                priere_salut: e.target.value === "oui",
              }))
            }
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white"
          >
            <option value="non">Non</option>
            <option value="oui">Oui</option>
          </select>
        </div>

        {/* Type conversion */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">
            Type de conversion
          </label>
          <input
            name="type_conversion"
            value={formData.type_conversion}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
          />
        </div>

        {/* Besoins */}
        <div>
          <p className="font-medium text-gray-700 mb-2">Besoins</p>

          <div className="grid grid-cols-2 gap-2">
            {besoinsOptions.map((item) => (
              <label key={item} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  value={item}
                  checked={formData.besoin.includes(item)}
                  onChange={handleBesoinChange}
                  className="w-4 h-4 accent-green-600"
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
                className="w-4 h-4 accent-green-600"
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
              className="w-full mt-2 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            />
          )}
        </div>

        {/* Infos supp */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">
            Infos supplémentaires
          </label>
          <textarea
            name="infos_supplementaires"
            value={formData.infos_supplementaires}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
          />
        </div>

        {message && (
          <p className="text-green-600 text-center font-semibold">{message}</p>
        )}
      </div>

      {/* Footer */}
      <div className="border-t px-6 py-4 flex justify-end gap-3">
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
            loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {loading ? "Enregistrement..." : "Enregistrer"}
        </button>
      </div>
    </div>
  </div>
);
