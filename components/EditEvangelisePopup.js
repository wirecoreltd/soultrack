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

    setFormData((prev) => {
      let updatedBesoins = checked
        ? [...prev.besoin.filter((b) => b !== "Autre"), value]
        : prev.besoin.filter((b) => b !== value);

      return {
        ...prev,
        besoin: updatedBesoins,
        autreBesoin: value === "Autre" && !checked ? "" : prev.autreBesoin,
      };
    });

    if (value === "Autre") setShowAutre(checked);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    if (loading) return;
    setLoading(true);

    const besoinsFinal =
      formData.autreBesoin && showAutre
        ? [...formData.besoin.filter((b) => b !== "Autre"), formData.autreBesoin]
        : formData.besoin;

    const cleanData = {
      prenom: formData.prenom,
      nom: formData.nom,
      telephone: formData.telephone,
      ville: formData.ville || null,
      infos_supplementaires: formData.infos_supplementaires || null,
      besoin: JSON.stringify(besoinsFinal),
      priere_salut: formData.priere_salut,
      type_conversion: formData.type_conversion,
      is_whatsapp: formData.is_whatsapp,
    };

    const { data, error } = await supabase
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
    <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div
        className="relative w-full max-w-lg p-6 rounded-3xl shadow-2xl overflow-y-auto max-h-[90vh]"
        style={{
          background: "linear-gradient(180deg, rgba(46,49,146,0.16), rgba(46,49,146,0.40))",
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-red-600 font-bold text-xl"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-center mb-6 text-white">
          Modifier {member.prenom} {member.nom}
        </h2>

        <div className="flex flex-col gap-4 text-white">
          {["prenom", "nom", "ville", "telephone"].map((f) => (
            <div key={f} className="flex flex-col">
              <label className="font-semibold capitalize">{f}</label>
              <input
                name={f}
                value={formData[f]}
                onChange={handleChange}
                className="input"
              />
            </div>
          ))}

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="is_whatsapp"
              checked={formData.is_whatsapp}
              onChange={handleChange}
              className="accent-[#25297e]"
            />
            WhatsApp
          </label>

          {/* Prière du salut */}
            <select
              className="input"
              value={formData.priere_salut ? "Oui" : "Non"}
              required
              onChange={(e) => {
                const value = e.target.value;
                setFormData({
                  ...formData,
                  priere_salut: value === "Oui", // conversion en boolean pour Supabase
                  type_conversion: value === "Oui" ? formData.type_conversion : "",
                });
              }}
            >
              <option value="" className="text-black">-- Prière du salut ? --</option>
              <option value="Oui" className="text-black">Oui</option>
              <option value="Non" className="text-black">Non</option>
            </select>
            
            {/* Type de conversion */}
            {formData.priere_salut && (
              <select
                className="input"
                value={formData.type_conversion || ""}
                onChange={(e) =>
                  setFormData({ ...formData, type_conversion: e.target.value })
                }
                required
              >
                <option value="" className="text-black">Type</option>
                <option value="Nouveau converti" className="text-black">Nouveau converti</option>
                <option value="Réconciliation" className="text-black">Réconciliation</option>
              </select>
            )}

          <div className="flex flex-col">
            <label className="font-semibold">Besoins</label>
            {besoinsOptions.map((item) => (
              <label key={item} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  value={item}
                  checked={formData.besoin.includes(item)}
                  onChange={handleBesoinChange}
                  className="accent-[#25297e]"
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
                className="accent-[#25297e]"
              />
              Autre
            </label>
            {showAutre && (
              <input
                type="text"
                name="autreBesoin"
                value={formData.autreBesoin}
                onChange={handleChange}
                placeholder="Précisez"
                className="input mt-2"
              />
            )}
          </div>

          <label className="font-semibold">Infos supplémentaires</label>
          <textarea
            name="infos_supplementaires"
            value={formData.infos_supplementaires}
            onChange={handleChange}
            className="input"
            rows={3}
          />

          {message && (
            <p className="text-[#25297e] font-semibold text-center mt-3">{message}</p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4">
            <button
              onClick={onClose}
              className="w-full bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 rounded-2xl shadow-md"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600 disabled:opacity-60 text-white font-bold py-3 rounded-2xl shadow-md"
            >
              {loading ? "Enregistrement..." : "Sauvegarder"}
            </button>
          </div>
        </div>

        <style jsx>{`
          .input {
            width: 100%;
            border: 1px solid #a0c4ff;
            border-radius: 14px;
            padding: 12px;
            background: rgba(255, 255, 255, 0.1);
            color: white;
          }
        `}</style>
      </div>
    </div>
  );
}
