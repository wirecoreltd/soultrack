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
  const besoinsOptions = [
    "Finances","Santé","Travail / Études","Famille / Enfants","Relations / Conflits",
    "Addictions / Dépendances","Guidance spirituelle","Logement / Sécurité",
    "Communauté / Isolement","Dépression / Santé mentale"
  ];

  const initialBesoin =
    typeof member.besoin === "string"
      ? JSON.parse(member.besoin || "[]")
      : member.besoin || [];

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
      setMessage("❌ Erreur : " + error.message);
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
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: "rgba(30,35,90,0.35)", backdropFilter: "blur(6px)" }}
    >
      <div
        className="relative w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
        style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}
      >
        {/* Header */}
        <div
          className="px-6 pt-6 pb-4"
          style={{ background: "linear-gradient(135deg, #2E3192 0%, #4f54c9 100%)" }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-white font-bold text-sm transition-all"
            style={{ background: "rgba(255,255,255,0.2)" }}
          >
            ✕
          </button>
          <h2 className="text-xl font-bold text-white pr-10">
            ✏️ {member.prenom} {member.nom}
          </h2>
          <p className="text-blue-100 text-sm mt-1 opacity-80">Modifier le profil évangélisé</p>
        </div>

        {/* Body */}
        <div
          className="overflow-y-auto px-6 py-5 flex flex-col gap-5"
          style={{ maxHeight: "68vh" }}
        >
          {/* Section: Date */}
          <SectionTitle>📅 Date</SectionTitle>

          <Field label="Date d'évangélisation">
            <input
              type="date"
              name="date_evangelise"
              value={formData.date_evangelise}
              onChange={handleChange}
              className="inp"
            />
          </Field>

          {/* Section: Identité */}
          <SectionTitle>👤 Identité</SectionTitle>

          <Field label="Civilité">
            <select
              name="sexe"
              value={formData.sexe}
              onChange={handleChange}
              className="inp"
            >
              <option value="">-- Civilité --</option>
              <option value="Homme">Homme</option>
              <option value="Femme">Femme</option>
            </select>
          </Field>

          <Field label="Prénom">
            <input name="prenom" value={formData.prenom} onChange={handleChange} className="inp" />
          </Field>

          <Field label="Nom">
            <input name="nom" value={formData.nom} onChange={handleChange} className="inp" />
          </Field>

          <Field label="Âge">
            <select name="age" value={formData.age} onChange={handleChange} className="inp">
              <option value="">-- Tranche d'âge --</option>
              {["12-17 ans","18-25 ans","26-30 ans","31-40 ans","41-55 ans","56-69 ans","70 ans et plus"].map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </Field>

          <Field label="Ville">
            <input name="ville" value={formData.ville} onChange={handleChange} className="inp" />
          </Field>

          <Field label="Téléphone">
            <input name="telephone" value={formData.telephone} onChange={handleChange} className="inp" />
            <label className="flex items-center gap-2 mt-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                name="is_whatsapp"
                checked={formData.is_whatsapp}
                onChange={handleChange}
                className="accent-[#2E3192]"
              />
              Numéro WhatsApp
            </label>
          </Field>

          {/* Section: Évangélisation */}
          <SectionTitle>🌍 Évangélisation</SectionTitle>

          <Field label="Type d'évangélisation">
            <select
              name="type_evangelisation"
              value={formData.type_evangelisation}
              onChange={handleChange}
              className="inp"
            >
              <option value="">-- Type d'évangélisation --</option>
              <option value="Individuel">Individuel</option>
              <option value="Sortie de groupe">Sortie de groupe</option>
              <option value="Campagne d'évangélisation">Campagne d'évangélisation</option>
              <option value="Évangélisation de rue">Évangélisation de rue</option>
              <option value="Évangélisation maison">Évangélisation maison</option>
              <option value="Évangélisation stade">Évangélisation stade</option>
            </select>
          </Field>

          {/* Section: Vie spirituelle */}
          <SectionTitle>🕊 Vie spirituelle</SectionTitle>

          <Field label="Prière du salut">
            <select
              name="priere_salut"
              value={formData.priere_salut ? "Oui" : "Non"}
              onChange={(e) => {
                const value = e.target.value;
                setFormData(prev => ({
                  ...prev,
                  priere_salut: value === "Oui",
                  type_conversion: value === "Oui" ? prev.type_conversion : "",
                }));
              }}
              className="inp"
            >
              <option value="">-- Prière du salut ? --</option>
              <option value="Oui">Oui</option>
              <option value="Non">Non</option>
            </select>
            {formData.priere_salut && (
              <select
                name="type_conversion"
                value={formData.type_conversion}
                onChange={handleChange}
                className="inp mt-2"
              >
                <option value="">Type de conversion</option>
                <option value="Nouveau converti">Nouveau converti</option>
                <option value="Réconciliation">Réconciliation</option>
              </select>
            )}
          </Field>
          
          {/* Section: Infos */}
          <SectionTitle>📝 Informations</SectionTitle>

          <Field label="Informations supplémentaires">
            <textarea
              name="infos_supplementaires"
              value={formData.infos_supplementaires}
              onChange={handleChange}
              className="inp"
              rows={3}
            />
          </Field>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-gray-600 bg-white border border-gray-200 hover:bg-gray-100 transition-all"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white transition-all disabled:opacity-60"
            style={{
              background: loading
                ? "#a0a0c0"
                : "linear-gradient(135deg, #2E3192 0%, #4f54c9 100%)",
            }}
          >
            {loading ? "Enregistrement..." : "💾 Sauvegarder"}
          </button>
        </div>

        {message && (
          <p
            className="text-center text-sm font-semibold px-6 pb-4"
            style={{ color: message.includes("❌") ? "#dc2626" : "#2E3192" }}
          >
            {message}
          </p>
        )}

        <style jsx>{`
          .inp {
            width: 100%;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 10px 12px;
            background: #f8fafc;
            color: #1e293b;
            font-size: 14px;
            outline: none;
            transition: border-color 0.2s;
          }
          .inp:focus {
            border-color: #2E3192;
            background: #fff;
          }
          select.inp option {
            background: white;
            color: #1e293b;
          }
        `}</style>
      </div>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <div className="flex items-center gap-2 pt-2">
      <span
        className="text-xs font-bold uppercase tracking-widest"
        style={{ color: "#2E3192" }}
      >
        {children}
      </span>
      <div className="flex-1 h-px" style={{ background: "#e2e8f0" }} />
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label
        className="text-xs font-semibold uppercase tracking-wide"
        style={{ color: "#64748b" }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}
