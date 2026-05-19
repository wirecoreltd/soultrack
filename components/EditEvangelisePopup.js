"use client";

import { useState } from "react";
import supabase from "../lib/supabaseClient";
import { useLang } from "../hooks/useLang";

const translations = {
  fr: {
    title: "Modifier le profil évangélisé",
    sectionDate: "📅 Date",
    dateLabel: "Date d'évangélisation",
    sectionIdentite: "👤 Identité",
    civilite: "Civilité",
    civiliteDefault: "-- Civilité --",
    homme: "Homme",
    femme: "Femme",
    prenom: "Prénom",
    nom: "Nom",
    age: "Âge",
    ageDefault: "-- Tranche d'âge --",
    ages: [
      "12-17 ans", "18-25 ans", "26-30 ans", "31-40 ans",
      "41-55 ans", "56-69 ans", "70 ans et plus",
    ],
    ville: "Ville",
    telephone: "Téléphone",
    isWhatsapp: "Numéro WhatsApp",
    sectionEvang: "🌍 Évangélisation",
    typeEvang: "Type d'évangélisation",
    typeEvangDefault: "-- Type d'évangélisation --",
    typeEvangOptions: [
      "Individuel", "Sortie de groupe", "Campagne d'évangélisation",
      "Évangélisation de rue", "Évangélisation maison", "Évangélisation stade",
    ],
    sectionSpiritual: "🕊 Vie spirituelle",
    priereSalut: "Prière du salut",
    priereSalutDefault: "-- Prière du salut ? --",
    oui: "Oui",
    non: "Non",
    typeConversionDefault: "Type de conversion",
    nouveauConverti: "Nouveau converti",
    reconciliation: "Réconciliation",
    sectionInfos: "📝 Informations",
    infosSupp: "Informations supplémentaires",
    cancel: "Annuler",
    save: "💾 Sauvegarder",
    saving: "Enregistrement...",
    errorPrefix: "❌ Erreur : ",
    success: "✅ Changement enregistré !",
  },
  en: {
    title: "Edit evangelised profile",
    sectionDate: "📅 Date",
    dateLabel: "Evangelisation date",
    sectionIdentite: "👤 Identity",
    civilite: "Title",
    civiliteDefault: "-- Title --",
    homme: "Man",
    femme: "Woman",
    prenom: "First name",
    nom: "Last name",
    age: "Age",
    ageDefault: "-- Age range --",
    ages: [
      "12-17 years", "18-25 years", "26-30 years", "31-40 years",
      "41-55 years", "56-69 years", "70 years and over",
    ],
    ville: "City",
    telephone: "Phone",
    isWhatsapp: "WhatsApp number",
    sectionEvang: "🌍 Evangelisation",
    typeEvang: "Evangelisation type",
    typeEvangDefault: "-- Evangelisation type --",
    typeEvangOptions: [
      "Individual", "Group outing", "Evangelisation campaign",
      "Street evangelisation", "House evangelisation", "Stadium evangelisation",
    ],
    sectionSpiritual: "🕊 Spiritual life",
    priereSalut: "Salvation prayer",
    priereSalutDefault: "-- Salvation prayer? --",
    oui: "Yes",
    non: "No",
    typeConversionDefault: "Conversion type",
    nouveauConverti: "New convert",
    reconciliation: "Reconciliation",
    sectionInfos: "📝 Information",
    infosSupp: "Additional information",
    cancel: "Cancel",
    save: "💾 Save",
    saving: "Saving...",
    errorPrefix: "❌ Error: ",
    success: "✅ Changes saved!",
  },
};

// Age range values are kept in French in the DB; map display label → stored value
const AGE_VALUES_FR = [
  "12-17 ans", "18-25 ans", "26-30 ans", "31-40 ans",
  "41-55 ans", "56-69 ans", "70 ans et plus",
];

// Evangelisation type values are kept in French in the DB
const TYPE_EVANG_VALUES_FR = [
  "Individuel", "Sortie de groupe", "Campagne d'évangélisation",
  "Évangélisation de rue", "Évangélisation maison", "Évangélisation stade",
];

const TYPE_CONVERSION_VALUES_FR = ["Nouveau converti", "Réconciliation"];

export default function EditEvangelisePopup({
  member,
  cellules = [],
  familles = [],
  conseillers = [],
  onClose,
  onUpdateMember,
}) {
  const { lang } = useLang();
  const t = translations[lang];

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

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

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

    const cleanData = {
      prenom: formData.prenom,
      nom: formData.nom,
      sexe: formData.sexe,
      age: formData.age,
      telephone: formData.telephone,
      ville: formData.ville || null,
      type_evangelisation: formData.type_evangelisation,
      infos_supplementaires: formData.infos_supplementaires || null,
      besoin: JSON.stringify(formData.besoin),
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
      setMessage(t.errorPrefix + error.message);
    } else {
      if (onUpdateMember) onUpdateMember(data);
      setMessage(t.success);
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
          <p className="text-blue-100 text-sm mt-1 opacity-80">{t.title}</p>
        </div>

        {/* Body */}
        <div
          className="overflow-y-auto px-6 py-5 flex flex-col gap-5"
          style={{ maxHeight: "68vh" }}
        >
          {/* Section: Date */}
          <SectionTitle>{t.sectionDate}</SectionTitle>

          <Field label={t.dateLabel}>
            <input
              type="date"
              name="date_evangelise"
              value={formData.date_evangelise}
              onChange={handleChange}
              className="inp"
            />
          </Field>

          {/* Section: Identité */}
          <SectionTitle>{t.sectionIdentite}</SectionTitle>

          <Field label={t.civilite}>
            <select name="sexe" value={formData.sexe} onChange={handleChange} className="inp">
              <option value="">{t.civiliteDefault}</option>
              {/* sexe values stored as "Homme"/"Femme" in DB — display label translated */}
              <option value="Homme">{t.homme}</option>
              <option value="Femme">{t.femme}</option>
            </select>
          </Field>

          <Field label={t.prenom}>
            <input name="prenom" value={formData.prenom} onChange={handleChange} className="inp" />
          </Field>

          <Field label={t.nom}>
            <input name="nom" value={formData.nom} onChange={handleChange} className="inp" />
          </Field>

          <Field label={t.age}>
            <select name="age" value={formData.age} onChange={handleChange} className="inp">
              <option value="">{t.ageDefault}</option>
              {AGE_VALUES_FR.map((dbVal, i) => (
                <option key={dbVal} value={dbVal}>{t.ages[i]}</option>
              ))}
            </select>
          </Field>

          <Field label={t.ville}>
            <input name="ville" value={formData.ville} onChange={handleChange} className="inp" />
          </Field>

          <Field label={t.telephone}>
            <input name="telephone" value={formData.telephone} onChange={handleChange} className="inp" />
            <label className="flex items-center gap-2 mt-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                name="is_whatsapp"
                checked={formData.is_whatsapp}
                onChange={handleChange}
                className="accent-[#2E3192]"
              />
              {t.isWhatsapp}
            </label>
          </Field>

          {/* Section: Évangélisation */}
          <SectionTitle>{t.sectionEvang}</SectionTitle>

          <Field label={t.typeEvang}>
            <select
              name="type_evangelisation"
              value={formData.type_evangelisation}
              onChange={handleChange}
              className="inp"
            >
              <option value="">{t.typeEvangDefault}</option>
              {TYPE_EVANG_VALUES_FR.map((dbVal, i) => (
                <option key={dbVal} value={dbVal}>{t.typeEvangOptions[i]}</option>
              ))}
            </select>
          </Field>

          {/* Section: Vie spirituelle */}
          <SectionTitle>{t.sectionSpiritual}</SectionTitle>

          <Field label={t.priereSalut}>
            <select
              name="priere_salut"
              value={formData.priere_salut ? "Oui" : "Non"}
              onChange={(e) => {
                const value = e.target.value;
                setFormData((prev) => ({
                  ...prev,
                  priere_salut: value === "Oui",
                  type_conversion: value === "Oui" ? prev.type_conversion : "",
                }));
              }}
              className="inp"
            >
              <option value="">{t.priereSalutDefault}</option>
              <option value="Oui">{t.oui}</option>
              <option value="Non">{t.non}</option>
            </select>
            {formData.priere_salut && (
              <select
                name="type_conversion"
                value={formData.type_conversion}
                onChange={handleChange}
                className="inp mt-2"
              >
                <option value="">{t.typeConversionDefault}</option>
                {TYPE_CONVERSION_VALUES_FR.map((dbVal, i) => (
                  <option key={dbVal} value={dbVal}>
                    {i === 0 ? t.nouveauConverti : t.reconciliation}
                  </option>
                ))}
              </select>
            )}
          </Field>

          {/* Section: Infos */}
          <SectionTitle>{t.sectionInfos}</SectionTitle>

          <Field label={t.infosSupp}>
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
            {t.cancel}
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
            {loading ? t.saving : t.save}
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
