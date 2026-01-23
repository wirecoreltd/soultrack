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
    typeof member.besoin === "string" ? JSON.parse(member.besoin || "[]") : member.besoin || [];

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
        // Fermer les deux popups
        onClose();
      }, 1200);
    }

    setLoading(false);
  };

  return (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
    <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden relative">

      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-4 text-white">
        <h2 className="text-lg font-bold">
          ✏️ Modifier {member.prenom} {member.nom}
        </h2>

        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-white/80 hover:text-white text-2xl font-bold"
        >
          ×
        </button>
      </div>

      {/* Body */}
      <div className="p-6 max-h-[75vh] overflow-y-auto space-y-5 text-sm">

        {/* Infos principales */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-semibold text-gray-700">Prénom</label>
            <input
              name="prenom"
              value={formData.prenom}
              onChange={handleChange}
              className="w-full mt-1 px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="font-semibold text-gray-700">Nom</label>
            <input
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              className="w-full mt-1 px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="font-semibold text-gray-700">Ville</label>
            <input
              name="ville"
              value={formData.ville}
              onChange={handleChange}
              className="w-full mt-1 px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="font-semibold text-gray-700">Téléphone</label>
            <input
              name="telephone"
              value={formData.telephone}
              onChange={handleChange}
              className="w-full mt-1 px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Statuts */}
        <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="is_whatsapp"
              checked={formData.is_whatsapp}
              onChange={handleChange}
              className="w-5 h-5 accent-green-600"
            />
            WhatsApp
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="priere_salut"
              checked={formData.priere_salut}
              onChange={handleChange}
              className="w-5 h-5 accent-blue-600"
            />
            Prière du salut
          </label>
        </div>

        {/* Type conversion */}
        <div>
          <label className="font-semibold text-gray-700">Type de conversion</label>
          <input
            name="type_conversion"
            value={formData.type_conversion}
            onChange={handleChange}
            className="w-full mt-1 px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Besoins */}
        <div>
          <p className="font-semibold text-gray-700 mb-2">Besoins</p>

          <div className="grid grid-cols-2 gap-3">
            {besoinsOptions.map((item) => (
              <label
                key={item}
                className="flex items-center gap-3 bg-gray-50 hover:bg-blue-50 px-3 py-2 rounded-lg cursor-pointer"
              >
                <input
                  type="checkbox"
                  value={item}
                  checked={formData.besoin.includes(item)}
                  onChange={handleBesoinChange}
                  className="w-5 h-5 accent-blue-600"
                />
                {item}
              </label>
            ))}

            <label className="flex items-center gap-3 bg-gray-50 hover:bg-blue-50 px-3 py-2 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                value="Autre"
                checked={showAutre}
                onChange={handleBesoinChange}
                className="w-5 h-5 accent-blue-600"
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
              className="w-full mt-3 px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none"
            />
          )}
        </div>

        {/* Infos supp */}
        <div>
          <label className="font-semibold text-gray-700">Infos supplémentaires</label>
          <textarea
            name="infos_supplementaires"
            value={formData.infos_supplementaires}
            onChange={handleChange}
            rows={3}
            className="w-full mt-1 px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {message && (
          <p className="text-green-600 text-center font-semibold">{message}</p>
        )}
      </div>

      {/* Footer boutons */}
      <div className="bg-gray-100 px-6 py-4 flex justify-between">
        <button
          onClick={onClose}
          className="px-5 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 font-semibold"
        >
          Annuler
        </button>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`px-6 py-2 rounded-lg text-white font-bold transition ${
            loading
              ? "bg-gray-400"
              : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90"
          }`}
        >
          {loading ? "Enregistrement..." : "💾 Enregistrer"}
        </button>
          </div>
        </div>
      </div>
    </div>
  );
}
