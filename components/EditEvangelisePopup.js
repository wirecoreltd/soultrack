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
    statut: member.statut || "",
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
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      besoin:
        formData.autreBesoin && showAutre
          ? [...formData.besoin.filter((b) => b !== "Autre"), formData.autreBesoin]
          : formData.besoin,
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96 max-h-[90vh] overflow-y-auto shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-red-500 font-bold hover:text-red-700"
        >
          ✕
        </button>

        <h2 className="text-lg font-bold text-gray-800 text-center mb-4">
          Modifier {member.prenom} {member.nom}
        </h2>

        <div className="flex flex-col space-y-3 text-sm">

          <label className="font-semibold">Prénom</label>
          <input
            name="prenom"
            value={formData.prenom}
            onChange={handleChange}
            className="border rounded px-2 py-1"
          />

          <label className="font-semibold">Nom</label>
          <input
            name="nom"
            value={formData.nom}
            onChange={handleChange}
            className="border rounded px-2 py-1"
          />

          <label className="font-semibold">Ville</label>
          <input
            name="ville"
            value={formData.ville}
            onChange={handleChange}
            className="border rounded px-2 py-1"
          />

          <label className="font-semibold">Téléphone</label>
          <input
            name="telephone"
            value={formData.telephone}
            onChange={handleChange}
            className="border rounded px-2 py-1"
          />

          {/* Besoins */}
          <div className="mt-2">
            <p className="font-semibold mb-2">Besoins :</p>
            {besoinsOptions.map((item) => (
              <label key={item} className="flex items-center gap-3 mb-2">
                <input
                  type="checkbox"
                  value={item}
                  checked={formData.besoin.includes(item)}
                  onChange={handleBesoinChange}
                  className="w-5 h-5 rounded border-gray-400 cursor-pointer"
                />
                {item}
              </label>
            ))}

            {/* Autre */}
            <label className="flex items-center gap-3 mb-2">
              <input
                type="checkbox"
                value="Autre"
                checked={showAutre}
                onChange={handleBesoinChange}
                className="w-5 h-5 rounded border-gray-400 cursor-pointer"
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
                className="border rounded px-2 py-1 w-full"
              />
            )}
          </div>

          <label className="font-semibold">Infos supplémentaires</label>
          <textarea
            name="infos_supplementaires"
            value={formData.infos_supplementaires}
            onChange={handleChange}
            className="border rounded px-2 py-1"
            rows={3}
          />

          <label className="font-semibold">Statut</label>
          <select
            name="statut"
            value={formData.statut}
            onChange={handleChange}
            className="border rounded px-2 py-1"
          >
            <option value="">-- Sélectionner --</option>
            <option value="actif">actif</option>
            <option value="Integrer">Integrer</option>
            <option value="ancien">ancien</option>
            <option value="veut rejoindre ICC">veut rejoindre ICC</option>
            <option value="visiteur">visiteur</option>
            <option value="a déjà mon église">a déjà mon église</option>
          </select>

          {message && (
            <p className="text-green-600 text-center font-semibold">{message}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`mt-3 w-full text-white py-2 rounded font-bold ${
              loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}
