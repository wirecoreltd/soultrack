"use client";

import { useState } from "react";
import supabase from "../lib/supabaseClient";

export default function EditEvangelisePopup({
  member,
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 py-6 overflow-auto">
      <div className="bg-[#0A74DA] w-full max-w-md rounded-xl shadow-xl relative text-white">
        
        {/* Header */}
        <div className="px-6 py-4 flex justify-between items-center border-b border-white/20">
          <h2 className="text-xl font-bold">✏️ Modifier le contact</h2>
          <button onClick={onClose} className="text-white text-2xl leading-none">×</button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">

          {/* Prénom */}
          <div>
            <label className="block mb-1 font-semibold">👤 Prénom</label>
            <input
              type="text"
              name="prenom"
              value={formData.prenom}
              onChange={handleChange}
              placeholder="Votre prénom"
              className="w-full px-3 py-2 bg-blue-600 placeholder-white text-white rounded-lg focus:ring-2 focus:ring-white outline-none"
            />
          </div>

          {/* Nom */}
          <div>
            <label className="block mb-1 font-semibold">👤 Nom</label>
            <input
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              placeholder="Votre nom"
              className="w-full px-3 py-2 bg-blue-600 placeholder-white text-white rounded-lg focus:ring-2 focus:ring-white outline-none"
            />
          </div>

          {/* Téléphone */}
          <div>
            <label className="block mb-1 font-semibold">📞 Téléphone</label>
            <input
              type="text"
              name="telephone"
              value={formData.telephone}
              onChange={handleChange}
              placeholder="+230 5xxxxxxx"
              className="w-full px-3 py-2 bg-blue-600 placeholder-white text-white rounded-lg focus:ring-2 focus:ring-white outline-none"
            />
          </div>

          {/* Ville */}
          <div>
            <label className="block mb-1 font-semibold">🏙️ Ville</label>
            <input
              type="text"
              name="ville"
              value={formData.ville}
              onChange={handleChange}
              placeholder="Ex : Port Louis"
              className="w-full px-3 py-2 bg-blue-600 placeholder-white text-white rounded-lg focus:ring-2 focus:ring-white outline-none"
            />
          </div>

          {/* WhatsApp */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="is_whatsapp"
              checked={formData.is_whatsapp}
              onChange={handleChange}
              className="w-4 h-4 accent-white"
            />
            <span>💬 WhatsApp</span>
          </div>

          {/* Sexe */}
          <div>
            <label className="block mb-1 font-semibold">🎗️ Sexe</label>
            <input
              type="text"
              name="sexe"
              value={formData.sexe}
              onChange={handleChange}
              placeholder="Masculin / Féminin"
              className="w-full px-3 py-2 bg-blue-600 placeholder-white text-white rounded-lg focus:ring-2 focus:ring-white outline-none"
            />
          </div>

          {/* Prière du salut */}
          <div>
            <label className="block mb-1 font-semibold">🙏 Prière du salut</label>
            <select
              name="priere_salut"
              value={formData.priere_salut ? "oui" : "non"}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, priere_salut: e.target.value === "oui" }))
              }
              className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg focus:ring-2 focus:ring-white outline-none"
            >
              <option value="non">Non</option>
              <option value="oui">Oui</option>
            </select>
          </div>

          {/* Type conversion */}
          <div>
            <label className="block mb-1 font-semibold">☀️ Type de conversion</label>
            <input
              type="text"
              name="type_conversion"
              value={formData.type_conversion}
              onChange={handleChange}
              placeholder="Type de conversion"
              className="w-full px-3 py-2 bg-blue-600 placeholder-white text-white rounded-lg focus:ring-2 focus:ring-white outline-none"
            />
          </div>

          {/* Besoins */}
          <div>
            <label className="block mb-1 font-semibold">❓ Besoins</label>
            <div className="grid grid-cols-2 gap-2">
              {besoinsOptions.map((b) => (
                <label key={b} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    value={b}
                    checked={formData.besoin.includes(b)}
                    onChange={handleBesoinChange}
                    className="w-4 h-4 accent-white"
                  />
                  {b}
                </label>
              ))}
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  value="Autre"
                  checked={showAutre}
                  onChange={handleBesoinChange}
                  className="w-4 h-4 accent-white"
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
                className="w-full mt-2 px-3 py-2 bg-blue-600 placeholder-white text-white rounded-lg focus:ring-2 focus:ring-white outline-none"
              />
            )}
          </div>

          {/* Infos supplémentaires */}
          <div>
            <label className="block mb-1 font-semibold">📝 Infos supplémentaires</label>
            <textarea
              name="infos_supplementaires"
              value={formData.infos_supplementaires}
              onChange={handleChange}
              placeholder="Informations additionnelles"
              rows={3}
              className="w-full px-3 py-2 bg-blue-600 placeholder-white text-white rounded-lg focus:ring-2 focus:ring-white outline-none"
            />
          </div>

          {message && <p className="text-green-400 text-center font-semibold">{message}</p>}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex justify-end gap-3 border-t border-white/20">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white text-blue-600 font-medium hover:bg-gray-200"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`px-5 py-2 rounded-lg font-semibold ${
              loading ? "bg-gray-400 text-white" : "bg-green-500 text-white hover:bg-green-600"
            }`}
          >
            {loading ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>

      </div>
    </div>
  );
}
