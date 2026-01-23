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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 py-6 overflow-auto">
      <div className="bg-white w-full max-w-md rounded-xl shadow-xl p-6 space-y-4 relative">

        <h2 className="text-xl font-bold text-gray-800 text-center mb-4">
          Modifier le contact
        </h2>

        {/* Champ fonction pour générer chaque input */}
        {[
          { label: "Prénom", name: "prenom", emoji: "👤", type: "text" },
          { label: "Nom", name: "nom", emoji: "👤", type: "text" },
          { label: "Téléphone", name: "telephone", emoji: "📞", type: "text" },
          { label: "Ville", name: "ville", emoji: "🏙️", type: "text" },
          { label: "Sexe", name: "sexe", emoji: "🎗️", type: "text" },
          { label: "Type de conversion", name: "type_conversion", emoji: "☀️", type: "text" },
        ].map((field) => (
          <div key={field.name}>
            <label className="block mb-1 font-medium text-gray-700">{field.label}</label>
            <div className="flex">
              <div className="bg-blue-600 w-12 flex items-center justify-center rounded-l">
                <span className="text-white text-lg">{field.emoji}</span>
              </div>
              <input
                type={field.type}
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                placeholder={field.label}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-r focus:outline-none"
              />
            </div>
          </div>
        ))}

        {/* WhatsApp */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">WhatsApp</label>
          <div className="flex items-center">
            <div className="bg-blue-600 w-12 flex items-center justify-center rounded-l">
              <span className="text-white text-lg">💬</span>
            </div>
            <input
              type="checkbox"
              name="is_whatsapp"
              checked={formData.is_whatsapp}
              onChange={handleChange}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-r focus:outline-none"
            />
          </div>
        </div>

        {/* Prière du salut */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">Prière du salut</label>
          <div className="flex">
            <div className="bg-blue-600 w-12 flex items-center justify-center rounded-l">
              <span className="text-white text-lg">🙏</span>
            </div>
            <select
              name="priere_salut"
              value={formData.priere_salut ? "oui" : "non"}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  priere_salut: e.target.value === "oui",
                }))
              }
              className="flex-1 px-3 py-2 border border-gray-300 rounded-r focus:outline-none"
            >
              <option value="non">Non</option>
              <option value="oui">Oui</option>
            </select>
          </div>
        </div>

        {/* Besoins */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">Besoins</label>
          {besoinsOptions.map((item) => (
            <div key={item} className="flex items-center mb-1">
              <div className="bg-blue-600 w-12 flex items-center justify-center rounded-l">
                <span className="text-white text-lg">❓</span>
              </div>
              <label className="flex-1 flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-r cursor-pointer">
                <input
                  type="checkbox"
                  value={item}
                  checked={formData.besoin.includes(item)}
                  onChange={handleBesoinChange}
                  className="accent-green-600"
                />
                {item}
              </label>
            </div>
          ))}
          {/* Autre */}
          <div className="flex items-center mb-1">
            <div className="bg-blue-600 w-12 flex items-center justify-center rounded-l">
              <span className="text-white text-lg">❓</span>
            </div>
            <label className="flex-1 flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-r cursor-pointer">
              <input
                type="checkbox"
                value="Autre"
                checked={showAutre}
                onChange={handleBesoinChange}
                className="accent-green-600"
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
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none"
            />
          )}
        </div>

        {/* Infos supplémentaires */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">Infos supplémentaires</label>
          <div className="flex">
            <div className="bg-blue-600 w-12 flex items-center justify-center rounded-l">
              <span className="text-white text-lg">📝</span>
            </div>
            <textarea
              name="infos_supplementaires"
              value={formData.infos_supplementaires}
              onChange={handleChange}
              rows={3}
              placeholder="Infos supplémentaires"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-r focus:outline-none"
            />
          </div>
        </div>

        {message && <p className="text-green-600 text-center font-semibold">{message}</p>}

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
              loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loading ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}
