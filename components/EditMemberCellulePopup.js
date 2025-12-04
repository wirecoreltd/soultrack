"use client";

import { useState, useEffect } from "react";
import supabase from "../lib/supabaseClient";

export default function EditMemberCellulePopup({ member, onClose, onUpdateMember }) {
  const besoinsOptions = ["Finances", "Santé", "Travail", "Les Enfants", "La Famille"];

  const parseBesoin = (b) => {
    if (!b) return [];
    if (Array.isArray(b)) return b;
    try {
      const parsed = JSON.parse(b);
      return Array.isArray(parsed) ? parsed : [String(b)];
    } catch {
      return [String(b)];
    }
  };

  const initialBesoin = parseBesoin(member?.besoin);

  const [formData, setFormData] = useState({
    prenom: member?.prenom || "",
    nom: member?.nom || "",
    telephone: member?.telephone || "",
    ville: member?.ville || "",
    besoin: initialBesoin,
    autreBesoin: "",
    infos_supplementaires: member?.infos_supplementaires || "",
    is_whatsapp: !!member?.is_whatsapp,
  });

  const [showAutre, setShowAutre] = useState(initialBesoin.includes("Autre"));
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleBesoinChange = (e) => {
    const { value, checked } = e.target;

    if (value === "Autre") {
      setShowAutre(checked);
      if (!checked) {
        setFormData(prev => ({
          ...prev,
          autreBesoin: "",
          besoin: prev.besoin.filter(b => b !== "Autre"),
        }));
      } else {
        setFormData(prev => ({ ...prev, besoin: Array.from(new Set([...prev.besoin, "Autre"])) }));
      }
      return;
    }

    setFormData(prev => {
      const updated = checked ? [...prev.besoin, value] : prev.besoin.filter(b => b !== value);
      return { ...prev, besoin: updated };
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      let finalBesoin = Array.isArray(formData.besoin) ? [...formData.besoin] : parseBesoin(formData.besoin);
      if (showAutre && formData.autreBesoin?.trim()) {
        finalBesoin = finalBesoin.filter(b => b !== "Autre");
        finalBesoin.push(formData.autreBesoin.trim());
      } else {
        finalBesoin = finalBesoin.filter(b => b !== "Autre");
      }

      const payload = {
        prenom: formData.prenom || null,
        nom: formData.nom || null,
        telephone: formData.telephone || null,
        ville: formData.ville || null,
        infos_supplementaires: formData.infos_supplementaires || null,
        is_whatsapp: !!formData.is_whatsapp,
        besoin: JSON.stringify(finalBesoin),
      };

      const { data, error } = await supabase
        .from("membres")
        .update(payload)
        .eq("id", member.id)
        .select()
        .single();

      if (error) {
        console.error("Supabase update error:", error);
        alert("❌ Erreur lors de la sauvegarde : " + (error.message || error));
        setLoading(false);
        return;
      }

      setSuccess(true);
      if (onUpdateMember) onUpdateMember(data);

      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 900);
    } catch (err) {
      console.error("Exception handleSubmit:", err);
      alert("❌ Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-3xl w-full max-w-md shadow-xl relative overflow-y-auto max-h-[95vh]">

        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-red-500 font-bold text-xl hover:text-red-700"
          aria-label="Fermer"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-center mb-4">
          Modifier la fiche de {member.prenom} {member.nom}
        </h2>

        <div className="flex flex-col gap-4">
          <input type="text" placeholder="Prénom" name="prenom" value={formData.prenom} onChange={handleChange} className="input" />
          <input type="text" placeholder="Nom" name="nom" value={formData.nom} onChange={handleChange} className="input" />
          <input type="text" placeholder="Téléphone" name="telephone" value={formData.telephone} onChange={handleChange} className="input" />

          <label className="flex items-center gap-2">
            <input type="checkbox" name="is_whatsapp" checked={!!formData.is_whatsapp} onChange={handleCheckboxChange} />
            WhatsApp
          </label>

          <input type="text" placeholder="Ville" name="ville" value={formData.ville} onChange={handleChange} className="input" />

          <div>
            <p className="font-semibold mb-2">Besoin :</p>
            {besoinsOptions.map((item) => (
              <label key={item} className="flex items-center gap-3 mb-2">
                <input
                  type="checkbox"
                  value={item}
                  checked={Array.isArray(formData.besoin) && formData.besoin.includes(item)}
                  onChange={handleBesoinChange}
                />
                {item}
              </label>
            ))}

            <label className="flex items-center gap-3 mb-2">
              <input type="checkbox" value="Autre" checked={showAutre} onChange={handleBesoinChange} />
              Autre
            </label>

            {showAutre && (
              <input
                type="text"
                name="autreBesoin"
                value={formData.autreBesoin}
                onChange={handleChange}
                placeholder="Précisez..."
                className="input"
              />
            )}
          </div>

          <textarea
            name="infos_supplementaires"
            placeholder="Informations supplémentaires..."
            rows={2}
            value={formData.infos_supplementaires}
            onChange={handleChange}
            className="input"
          />

          {/* BUTTONS */}
          <div className="flex gap-4 mt-2">
            <button onClick={onClose} className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 rounded-2xl shadow-md">Annuler</button>
            <button onClick={handleSubmit} disabled={loading} className="flex-1 bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600 text-white font-bold py-3 rounded-2xl shadow-md">
              {loading ? "Enregistrement..." : "Sauvegarder"}
            </button>
          </div>

          {success && (
            <p className="text-green-600 font-semibold text-center mt-3">✔️ Modifié avec succès !</p>
          )}
        </div>

        <style jsx>{`
          .input {
            width: 100%;
            border: 1px solid #ccc;
            border-radius: 12px;
            padding: 12px;
            box-shadow: 0 1px 2px rgba(0,0,0,0.1);
          }
        `}</style>
      </div>
    </div>
  );
}
