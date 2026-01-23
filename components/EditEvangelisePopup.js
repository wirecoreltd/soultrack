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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4 overflow-y-auto">
      <div className="bg-white w-full max-w-md rounded-lg shadow-2xl relative">

        {/* HEADER */}
        <div className="bg-green-600 text-white px-5 py-4 text-center font-bold text-lg rounded-t-lg">
          ✏️ Modifier le contact
        </div>

        {/* FORM */}
        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto text-sm">

          {/* Prénom */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">👤</span>
            <input
              name="prenom"
              value={formData.prenom}
              onChange={handleChange}
              placeholder="Prénom"
              className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>

          {/* Nom */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">👤</span>
            <input
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              placeholder="Nom"
              className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>

          {/* Téléphone */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">📞</span>
            <input
              name="telephone"
              value={formData.telephone}
              onChange={handleChange}
              placeholder="Téléphone"
              className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>

          {/* Ville */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🏙️</span>
            <input
              name="ville"
              value={formData.ville}
              onChange={handleChange}
              placeholder="Ville"
              className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>

          {/* WhatsApp */}
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="is_whatsapp"
              checked={formData.is_whatsapp}
              onChange={handleChange}
              className="w-4 h-4 accent-green-600"
            />
            💬 WhatsApp
          </label>

          {/* Prière du Salut */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🙏</span>
            <select
              name="priere_salut"
              value={formData.priere_salut ? "oui" : "non"}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  priere_salut: e.target.value === "oui",
                }))
              }
              className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 outline-none"
            >
              <option value="non">Non</option>
              <option value="oui">Oui</option>
            </select>
          </div>

          {/* Type conversion */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔄</span>
            <input
              name="type_conversion"
              value={formData.type_conversion}
              onChange={handleChange}
              placeholder="Type de conversion"
              className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>

          {/* Besoins */}
          <div className="flex flex-col">
            <p className="font-medium text-gray-700 mb-1">🎯 Besoins</p>
            <div className="space-y-2">
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

              {showAutre && (
                <input
                  type="text"
                  name="autreBesoin"
                  value={formData.autreBesoin}
                  onChange={handleChange}
                  placeholder="Précisez..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 outline-none"
                />
              )}
            </div>
          </div>

          {/* Infos supp */}
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-400">📝</span>
            <textarea
              name="infos_supplementaires"
              value={formData.infos_supplementaires}
              onChange={handleChange}
              rows={3}
              placeholder="Infos supplémentaires"
              className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>

          {message && (
            <p className="text-center text-green-600 font-semibold">{message}</p>
          )}
        </div>

        {/* BUTTONS */}
        <div className="p-4 flex justify-between gap-3 border-t">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
          >
            ❌ Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`flex-1 py-2 rounded-md text-white font-semibold ${
              loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loading ? "Enregistrement..." : "💾 Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}
