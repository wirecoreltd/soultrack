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
    sexe: member.sexe || "",
    age: member.age || "",
    telephone: member.telephone || "",
    ville: member.ville || "",
    type_evangelisation: member.type_evangelisation || "",
    besoin: initialBesoin,
    autreBesoin: "",
    infos_supplementaires: member.infos_supplementaires || "",
    priere_salut: member.priere_salut || false,
    type_conversion: member.type_conversion || "",
    is_whatsapp: member.is_whatsapp || false,
    date_evangelise: member.date_evangelise || "",
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
      sexe: formData.sexe,
      age: formData.age,
      telephone: formData.telephone,
      ville: formData.ville || null,
      type_evangelisation: formData.type_evangelisation,
      infos_supplementaires: formData.infos_supplementaires || null,
      besoin: JSON.stringify(besoinsFinal),
      priere_salut: formData.priere_salut,
      type_conversion: formData.type_conversion,
      is_whatsapp: formData.is_whatsapp,
      date_evangelise: formData.date_evangelise,
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

        {/* Civilité */}
          <select
            className="input"
            value={formData.sexe}
            onChange={e => setFormData({ ...formData, sexe: e.target.value })}
            required
          >
            <option value="">Civilité</option>
            <option value="Homme">Homme</option>
            <option value="Femme">Femme</option>
          </select>
          
          {/* Prénom */}
          <input
            name="prenom"
            value={formData.prenom}
            onChange={handleChange}
            className="input"
            placeholder="Prénom"
          />
          
          {/* Nom */}
          <input
            name="nom"
            value={formData.nom}
            onChange={handleChange}
            className="input"
            placeholder="Nom"
          />
          
          {/* Age */}
          <select
            name="age"
            value={formData.age}
            onChange={handleChange}
            className="input"
          >
            <option value="">-- Tranche d'âge --</option>
            <option value="12-17 ans">12-17 ans</option>
            <option value="18-25 ans">18-25 ans</option>
            <option value="26-30 ans">26-30 ans</option>
            <option value="31-40 ans">31-40 ans</option>
            <option value="41-55 ans">41-55 ans</option>
            <option value="56-69 ans">56-69 ans</option>
            <option value="70 ans et plus">70 ans et plus</option>
          </select>
          
          {/* Ville */}
          <input
            name="ville"
            value={formData.ville}
            onChange={handleChange}
            className="input"
            placeholder="Ville"
          />
          
          {/* Téléphone */}
          <input
            name="telephone"
            value={formData.telephone}
            onChange={handleChange}
            className="input"
            placeholder="Téléphone"
          />
          
          {/* WhatsApp */}
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
          
          {/* Type d'évangélisation */}
          <select
            className="input"
            value={formData.type_evangelisation}
            onChange={e => setFormData({ ...formData, type_evangelisation: e.target.value })}
            required
          >
            <option value="">Type d'Evangélisation</option>
            <option value="Individuel">Individuel</option>
            <option value="Sortie de groupe">Sortie de groupe</option>
            <option value="Campagne d’évangélisation">Campagne d’évangélisation</option>
            <option value="Évangélisation de rue">Évangélisation de rue</option>
            <option value="Évangélisation maison">Évangélisation maison</option>
            <option value="Évangélisation stade">Évangélisation stade</option>
          </select>
          
          {/* Date Evangelisation */}
          <div className="flex justify-center w-full">
            <input
              type="date"
              className="input w-auto text-center"
              value={formData.date_evangelise}
              onChange={e => setFormData({ ...formData, date_evangelise: e.target.value })}
            />
          </div>
          
          {/* Prière du salut */}
          <select
            className="input"
            value={formData.priere_salut ? "Oui" : "Non"}
            required
            onChange={(e) => {
              const value = e.target.value;
              setFormData({
                ...formData,
                priere_salut: value === "Oui",
                type_conversion: value === "Oui" ? formData.type_conversion : "",
              });
            }}
          >
            <option value="">-- Prière du salut ? --</option>
            <option value="Oui">Oui</option>
            <option value="Non">Non</option>
          </select>
          
          {/* Type conversion */}
          {formData.priere_salut && (
            <select
              className="input"
              value={formData.type_conversion || ""}
              onChange={(e) =>
                setFormData({ ...formData, type_conversion: e.target.value })
              }
              required
            >
              <option value="">Type</option>
              <option value="Nouveau converti">Nouveau converti</option>
              <option value="Réconciliation">Réconciliation</option>
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
