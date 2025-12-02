"use client";

import { useState } from "react";
import supabase from "../lib/supabaseClient";

export default function EditMemberPopup({
  member,
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
    statut: member.statut || "",
    star: member.star === true,
  });

  const [showAutre, setShowAutre] = useState(initialBesoin.includes("Autre"));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const toggleServiteur = () => {
    setFormData(prev => ({ ...prev, star: !prev.star }));
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
      }
    }

    setFormData(prev => {
      const updated = checked
        ? [...prev.besoin, value]
        : prev.besoin.filter(b => b !== value);
      return { ...prev, besoin: updated };
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);

    const cleanData = {
      prenom: formData.prenom,
      nom: formData.nom,
      telephone: formData.telephone,
      ville: formData.ville,
      infos_supplementaires: formData.infos_supplementaires || null,
      statut: formData.statut || null,
      star: formData.star,
      besoin:
        formData.autreBesoin && showAutre
          ? [...formData.besoin.filter(b => b !== "Autre"), formData.autreBesoin]
          : formData.besoin,
    };

    const { data, error } = await supabase
      .from("membres")
      .update(cleanData)
      .eq("id", member.id)
      .select()
      .single();

    if (error) {
      alert("Erreur : " + error.message);
    } else {
      if (onUpdateMember) onUpdateMember(data);
      setMessage("Sauvegardé !");
      setTimeout(() => {
        setMessage("");
        onClose();
      }, 900);
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-lg max-h-[90vh] overflow-y-auto relative">

        {/* Bouton fermer */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-red-500 text-xl font-bold hover:text-red-700"
        >
          ✕
        </button>

        <h1 className="text-2xl font-bold text-center mb-4">
          Modifier {member.prenom} {member.nom}
        </h1>

        {/* Star / Serviteur */}
        <div className="flex justify-center items-center gap-3 mb-6">
          <button onClick={toggleServiteur} className="text-4xl">
            {formData.star ? "⭐" : "☆"}
          </button>
          <span className="font-semibold text-gray-700">Serviteur</span>
        </div>

        {/* FORMULAIRE */}
        <div className="flex flex-col gap-4">

          <input className="input" name="prenom" value={formData.prenom} onChange={handleChange} placeholder="Prénom" />
          <input className="input" name="nom" value={formData.nom} onChange={handleChange} placeholder="Nom" />
          <input className="input" name="telephone" value={formData.telephone} onChange={handleChange} placeholder="Téléphone" />
          <input className="input" name="ville" value={formData.ville} onChange={handleChange} placeholder="Ville" />

          {/* Besoins */}
          <div>
            <p className="font-semibold mb-2">Besoins :</p>

            {besoinsOptions.map(item => (
              <label key={item} className="flex items-center gap-3 mb-2">
                <input
                  type="checkbox"
                  value={item}
                  checked={formData.besoin.includes(item)}
                  onChange={handleBesoinChange}
                  className="w-5 h-5 cursor-pointer"
                />
                {item}
              </label>
            ))}

            <label className="flex items-center gap-3 mb-2">
              <input
                type="checkbox"
                value="Autre"
                checked={showAutre}
                onChange={handleBesoinChange}
                className="w-5 h-5 cursor-pointer"
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
                className="input mt-1"
              />
            )}
          </div>

          <textarea
            className="input"
            name="infos_supplementaires"
            rows={2}
            placeholder="Informations supplémentaires..."
            value={formData.infos_supplementaires}
            onChange={handleChange}
          />

          <select
            className="input"
            name="statut"
            value={formData.statut}
            onChange={handleChange}
          >
            <option value="">-- Statut --</option>
            <option value="actif">Actif</option>
            <option value="Integrer">Intégré</option>
            <option value="ancien">Ancien</option>
            <option value="veut rejoindre ICC">Veut rejoindre ICC</option>
            <option value="visiteur">Visiteur</option>
            <option value="a déjà mon église">A déjà mon église</option>
          </select>

          {message && (
            <p className="text-green-600 text-center font-semibold">{message}</p>
          )}

          {/* BOUTONS */}
          <div className="flex gap-4 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 rounded-2xl shadow-md transition-all"
            >
              Annuler
            </button>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600 
              text-white font-bold py-3 rounded-2xl shadow-md transition-all"
            >
              {loading ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>

        </div>

        <style jsx>{`
          .input {
            width: 100%;
            border: 1px solid #ccc;
            border-radius: 12px;
            padding: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            color: black;
          }
        `}</style>
      </div>
    </div>
  );
}
