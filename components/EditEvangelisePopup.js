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

  const handleCancel = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-lg">
        <form className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Prénom"
            name="prenom"
            value={formData.prenom}
            onChange={handleChange}
            className="input"
          />
          <input
            type="text"
            placeholder="Nom"
            name="nom"
            value={formData.nom}
            onChange={handleChange}
            className="input"
          />
          <input
            type="text"
            placeholder="Téléphone"
            name="telephone"
            value={formData.telephone}
            onChange={handleChange}
            className="input"
          />
          <input
            type="text"
            placeholder="Ville"
            name="ville"
            value={formData.ville}
            onChange={handleChange}
            className="input"
          />

          <label className="flex items-center gap-2 mt-1">
            Statut :
            <select
              name="statut"
              value={formData.statut}
              onChange={handleChange}
              className="input"
            >
              <option value="">-- Sélectionner --</option>
              <option value="actif">actif</option>
              <option value="Integrer">Integrer</option>
              <option value="ancien">ancien</option>
              <option value="veut rejoindre ICC">veut rejoindre ICC</option>
              <option value="visiteur">visiteur</option>
              <option value="a déjà mon église">a déjà mon église</option>
            </select>
          </label>

          {/* Besoins */}
          <div>
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
                <span>{item}</span>
              </label>
            ))}
            <label className="flex items-center gap-3 mb-2">
              <input
                type="checkbox"
                value="Autre"
                checked={showAutre}
                onChange={handleBesoinChange}
                className="w-5 h-5 rounded border-gray-400 cursor-pointer"
