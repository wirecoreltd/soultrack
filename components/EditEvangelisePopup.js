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
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
    <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden grid md:grid-cols-2">

      {/* LEFT DESIGN PANEL */}
      <div className="hidden md:flex flex-col justify-between p-10 bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 text-white">
        <div>
          <h2 className="text-3xl font-bold mb-4">SoulTrack</h2>
          <p className="text-white/90">
            Mettre à jour les informations spirituelles et personnelles
            pour un meilleur suivi.
          </p>
        </div>

        <div className="text-sm text-white/70">
          ✝️ Suivi — Accompagnement — Croissance
        </div>
      </div>

      {/* FORM PANEL */}
      <div className="p-8 md:p-10 relative">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-6 text-gray-400 hover:text-gray-700 text-2xl"
        >
          ×
        </button>

        <h3 className="text-2xl font-bold text-gray-800 mb-1">
          Modifier le contact
        </h3>
        <p className="text-sm text-gray-500 mb-8">
          {member.prenom} {member.nom}
        </p>

        <div className="space-y-5 text-sm">

          {/* Names */}
          <div className="grid grid-cols-2 gap-4">
            <input
              name="prenom"
              value={formData.prenom}
              onChange={handleChange}
              placeholder="Prénom"
              className="w-full px-5 py-3 rounded-full border bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none"
            />
            <input
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              placeholder="Nom"
              className="w-full px-5 py-3 rounded-full border bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>

          {/* City / Phone */}
          <div className="grid grid-cols-2 gap-4">
            <input
              name="ville"
              value={formData.ville}
              onChange={handleChange}
              placeholder="Ville"
              className="w-full px-5 py-3 rounded-full border bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none"
            />
            <input
              name="telephone"
              value={formData.telephone}
              onChange={handleChange}
              placeholder="Téléphone"
              className="w-full px-5 py-3 rounded-full border bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>

          {/* Switches */}
          <div className="flex gap-6 mt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="is_whatsapp"
                checked={formData.is_whatsapp}
                onChange={handleChange}
                className="w-5 h-5 accent-purple-600"
              />
              WhatsApp
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="priere_salut"
                checked={formData.priere_salut}
                onChange={handleChange}
                className="w-5 h-5 accent-purple-600"
              />
              Prière du salut
            </label>
          </div>

          {/* Conversion */}
          <input
            name="type_conversion"
            value={formData.type_conversion}
            onChange={handleChange}
            placeholder="Type de conversion"
            className="w-full px-5 py-3 rounded-full border bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none"
          />

          {/* Needs */}
          <div>
            <p className="text-gray-600 font-medium mb-2">Besoins</p>

            <div className="flex flex-wrap gap-2">
              {besoinsOptions.map((item) => (
                <label
                  key={item}
                  className={`px-4 py-2 rounded-full border cursor-pointer transition
                    ${
                      formData.besoin.includes(item)
                        ? "bg-purple-600 text-white border-purple-600"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                >
                  <input
                    type="checkbox"
                    value={item}
                    checked={formData.besoin.includes(item)}
                    onChange={handleBesoinChange}
                    className="hidden"
                  />
                  {item}
                </label>
              ))}

              <label
                className={`px-4 py-2 rounded-full border cursor-pointer transition
                  ${showAutre ? "bg-purple-600 text-white border-purple-600" : "bg-gray-100 hover:bg-gray-200"}`}
              >
                <input
                  type="checkbox"
                  value="Autre"
                  checked={showAutre}
                  onChange={handleBesoinChange}
                  className="hidden"
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
                placeholder="Précisez le besoin..."
                className="w-full mt-3 px-5 py-3 rounded-full border bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none"
              />
            )}
          </div>

          {/* Notes */}
          <textarea
            name="infos_supplementaires"
            value={formData.infos_supplementaires}
            onChange={handleChange}
            placeholder="Infos supplémentaires..."
            rows={3}
            className="w-full px-5 py-3 rounded-2xl border bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none resize-none"
          />

          {message && (
            <p className="text-green-600 text-center font-semibold">{message}</p>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-4 pt-4">
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-full bg-gray-200 hover:bg-gray-300 font-semibold"
            >
              Annuler
            </button>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`px-8 py-3 rounded-full text-white font-bold shadow-lg transition
                ${
                  loading
                    ? "bg-gray-400"
                    : "bg-gradient-to-r from-purple-600 to-pink-500 hover:opacity-90"
                }`}
            >
              {loading ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);
}
