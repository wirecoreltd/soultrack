"use client";

import { useState } from "react";

export default function EditEvangelisePopup({
  member,
  onClose,
  onUpdateMember,
}) {
  if (!member) return null;

  const besoinsOptions = ["Finances", "Santé", "Travail", "Les Enfants", "La Famille"];
  const initialBesoin = Array.isArray(member.besoin) ? member.besoin : [];

  const [formData, setFormData] = useState({
    prenom: member.prenom || "",
    nom: member.nom || "",
    telephone: member.telephone || "",
    ville: member.ville || "",
    sexe: member.sexe || "",
    is_whatsapp: !!member.is_whatsapp,
    priere_salut: member.priere_salut || "",
    type_conversion: member.type_conversion || "",
    besoin: initialBesoin,
    autreBesoin: "",
    infos_supplementaires: member.infos_supplementaires || "",
  });

  const [showAutre, setShowAutre] = useState(initialBesoin.includes("Autre"));
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleBesoinChange = (e) => {
    const { value, checked } = e.target;
    if (value === "Autre") {
      setShowAutre(checked);
      setFormData(prev => ({
        ...prev,
        besoin: checked ? [...prev.besoin, "Autre"] : prev.besoin.filter(b => b !== "Autre"),
        autreBesoin: ""
      }));
      return;
    }
    setFormData(prev => ({
      ...prev,
      besoin: checked ? [...prev.besoin, value] : prev.besoin.filter(b => b !== value)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="relative w-full max-w-lg p-6 rounded-3xl shadow-2xl bg-gradient-to-b from-[rgba(46,49,146,0.16)] to-[rgba(46,49,146,0.4)]" style={{ backdropFilter: "blur(8px)" }}>
        <button onClick={onClose} className="absolute top-4 right-4 text-red-600 font-bold text-xl">✕</button>
        <h2 className="text-2xl font-bold text-center mb-6 text-white">
          Modifier le contact {member.prenom} {member.nom}
        </h2>

        <div className="overflow-y-auto max-h-[70vh] flex flex-col gap-4 text-white">
          {["prenom", "nom", "telephone", "ville"].map(f => (
            <div key={f} className="flex flex-col">
              <label className="font-medium capitalize">{f}</label>
              <input
                name={f}
                value={formData[f]}
                onChange={handleChange}
                className="input"
              />

              {f === "telephone" && (
                <div className="flex items-center gap-3 mt-3">
                  <label className="font-medium">Numéro WhatsApp</label>
                  <input
                    type="checkbox"
                    name="is_whatsapp"
                    checked={formData.is_whatsapp}
                    onChange={handleChange}
                    className="accent-[#25297e]"
                  />
                </div>
              )}
            </div>
          ))}

          {/* Sexe */}
          <div className="flex flex-col">
            <label className="font-medium">Sexe</label>
            <select name="sexe" value={formData.sexe} onChange={handleChange} className="input">
              <option value="">-- Sexe --</option>
              <option value="Homme">Homme</option>
              <option value="Femme">Femme</option>
            </select>
          </div>

          {/* Prière du salut */}
          <div className="flex flex-col">
            <label className="font-medium">Prière du salut</label>
            <select
              className="input"
              name="priere_salut"
              value={formData.priere_salut}
              onChange={handleChange}
            >
              <option value="">-- Prière du salut ? --</option>
              <option value="Oui">Oui</option>
              <option value="Non">Non</option>
            </select>

            {formData.priere_salut === "Oui" && (
              <select
                className="input mt-2"
                name="type_conversion"
                value={formData.type_conversion}
                onChange={handleChange}
              >
                <option value="">Type</option>
                <option value="Nouveau converti">Nouveau converti</option>
                <option value="Réconciliation">Réconciliation</option>
              </select>
            )}
          </div>

          {/* Besoins */}
          <div className="flex flex-col">
            <label className="font-medium">Besoins</label>
            {besoinsOptions.map(b => (
              <label key={b} className="flex items-center gap-2">
                <input type="checkbox" value={b} checked={formData.besoin.includes(b)} onChange={handleBesoinChange} className="accent-[#25297e]" />
                {b}
              </label>
            ))}
            <label className="flex items-center gap-2">
              <input type="checkbox" value="Autre" checked={showAutre} onChange={handleBesoinChange} className="accent-[#25297e]" />
              Autre
            </label>
            {showAutre && (
              <input name="autreBesoin" value={formData.autreBesoin} onChange={handleChange} className="input mt-2" placeholder="Précisez" />
            )}
          </div>

          {/* Infos supplémentaires */}
          <div className="flex flex-col">
            <label className="font-medium">Infos supplémentaires</label>
            <textarea
              name="infos_supplementaires"
              value={formData.infos_supplementaires}
              onChange={handleChange}
              className="input"
              rows={3}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 rounded-2xl shadow-md transition-all"
          >
            Annuler
          </button>
          <button
            type="button"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 rounded-2xl shadow-md transition-all"
          >
            {loading ? "Enregistrement..." : "Sauvegarder"}
          </button>
        </div>

        {message && (
          <p className="text-[#25297e] font-semibold text-center mt-3">{message}</p>
        )}

        {/* Styles */}
        <style jsx>{`
          label {
            font-weight: 600;
            color: white;
          }
          .input {
            width: 100%;
            border: 1px solid #a0c4ff;
            border-radius: 14px;
            padding: 12px;
            background: rgba(255,255,255,0.1);
            color: white;
            font-weight: 400;
          }
          select.input {
            font-weight: 400;
            color: white;
          }
          select.input option {
            background: white;
            color: black;
            font-weight: 400;
          }
        `}</style>
      </div>
    </div>
  );
}
