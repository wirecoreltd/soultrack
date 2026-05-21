"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import supabase from "../lib/supabaseClient";
import { checkLimiteAtteinte } from "../lib/checkLimite";
import { useLang } from "../hooks/useLang";

const translations = {
  fr: {
    loading: "Vérification du lien...",
    invalidLink: "Lien invalide ou expiré.",
    title: "Ajouter un nouveau membre",
    subtitle: "« Allez, faites de toutes les nations des disciples » – Matthieu 28:19",
    close: "Fermer",
    dateVenue: "Date de venue",
    civility: "Civilité",
    choose: "-- Choisir --",
    homme: "Homme",
    femme: "Femme",
    prenom: "Prénom",
    nom: "Nom",
    telephone: "Téléphone",
    telPlaceholder: "Ex: 5 1234 5678",
    noPhone: "La personne n'a pas de téléphone",
    whatsapp: "Numéro WhatsApp",
    ville: "Ville",
    age: "Âge",
    ageOptions: ["12-17 ans", "18-25 ans", "26-30 ans", "31-40 ans", "41-55 ans", "56-69 ans", "70 ans et plus"],
    statut: "Statut",
    statutOptions: [
      { value: "veut rejoindre l'église", label: "Veut rejoindre l'église" },
      { value: "a déjà son église", label: "A déjà son église" },
      { value: "nouveau", label: "Nouveau" },
      { value: "visiteur", label: "Visiteur" },
    ],
    howCame: "Comment est-il venu ?",
    howCameOptions: [
      { value: "invité", label: "Invité" },
      { value: "réseaux", label: "Réseaux" },
      { value: "evangélisation", label: "Évangélisation" },
      { value: "autre", label: "Autre" },
    ],
    prayerSalvation: "Prière du salut",
    oui: "Oui",
    non: "Non",
    typeConversion: "Type de conversion",
    conversionOptions: [
      { value: "Nouveau converti", label: "Nouveau converti" },
      { value: "Réconciliation", label: "Réconciliation" },
    ],
    needs: "Difficultés / Besoins",
    needsOptions: [
      "Finances", "Santé", "Travail / Études", "Famille / Enfants", "Miracle", "Délivrance",
      "Relations / Conflits", "Addictions / Dépendances", "Guidance spirituelle",
      "Logement / Sécurité", "Communauté / Isolement", "Dépression / Santé mentale",
    ],
    other: "Autre",
    specify: "Précisez...",
    additionalInfo: "Informations supplémentaires",
    cancel: "Annuler",
    add: "Ajouter",
    success: "✅ Membre ajouté avec succès !",
    errNoPhone: "Le téléphone est requis ou cochez 'Pas de téléphone'",
    errNoEglise: "Église non identifiée. Veuillez réessayer.",
    errLimite: (count, limite) => `❌ Limite atteinte : ${count}/${limite} membres. Upgradez votre plan.`,
    errPhoneExists: "Ce numéro de téléphone existe déjà.",
    errGeneric: "Erreur lors de l'ajout du membre.",
  },
  en: {
    loading: "Verifying link...",
    invalidLink: "Invalid or expired link.",
    title: "Add a new member",
    subtitle: "\"Go and make disciples of all nations\" – Matthew 28:19",
    close: "Close",
    dateVenue: "Date of visit",
    civility: "Title",
    choose: "-- Choose --",
    homme: "Male",
    femme: "Female",
    prenom: "First name",
    nom: "Last name",
    telephone: "Phone",
    telPlaceholder: "e.g. 5 1234 5678",
    noPhone: "This person has no phone",
    whatsapp: "WhatsApp number",
    ville: "City",
    age: "Age",
    ageOptions: ["12-17 yrs", "18-25 yrs", "26-30 yrs", "31-40 yrs", "41-55 yrs", "56-69 yrs", "70 yrs and over"],
    statut: "Status",
    statutOptions: [
      { value: "veut rejoindre l'église", label: "Wants to join the church" },
      { value: "a déjà son église", label: "Already has a church" },
      { value: "nouveau", label: "New" },
      { value: "visiteur", label: "Visitor" },
    ],
    howCame: "How did they come?",
    howCameOptions: [
      { value: "invité", label: "Invited" },
      { value: "réseaux", label: "Social media" },
      { value: "evangélisation", label: "Outreach" },
      { value: "autre", label: "Other" },
    ],
    prayerSalvation: "Salvation prayer",
    oui: "Yes",
    non: "No",
    typeConversion: "Type of conversion",
    conversionOptions: [
      { value: "Nouveau converti", label: "New convert" },
      { value: "Réconciliation", label: "Reconciliation" },
    ],
    needs: "Difficulties / Needs",
    needsOptions: [
      "Finances", "Health", "Work / Studies", "Family / Children", "Miracle", "Deliverance",
      "Relationships / Conflicts", "Addictions / Dependencies", "Spiritual guidance",
      "Housing / Safety", "Community / Isolation", "Depression / Mental health",
    ],
    other: "Other",
    specify: "Please specify...",
    additionalInfo: "Additional information",
    cancel: "Cancel",
    add: "Add",
    success: "✅ Member added successfully!",
    errNoPhone: "Phone is required or check 'No phone'",
    errNoEglise: "Church not identified. Please try again.",
    errLimite: (count, limite) => `❌ Limit reached: ${count}/${limite} members. Please upgrade your plan.`,
    errPhoneExists: "This phone number already exists.",
    errGeneric: "Error while adding member.",
  },
};

export default function AddMember() {
  const router = useRouter();
  const { token } = router.query;
  const urlFamilleId = router.query.famille_id || null;

  // ✅ Lire la langue depuis l'URL (?lang=en) en priorité, sinon useLang
  const { lang: hookLang } = useLang();
  const urlLang = router.query.lang;
  const lang = (urlLang === "en" || urlLang === "fr") ? urlLang : hookLang;
  const t = translations[lang] || translations.fr;

  const [formData, setFormData] = useState({
    sexe: "",
    nom: "",
    prenom: "",
    telephone: "",
    ville: "",
    age: "",
    statut: "",
    venu: "",
    date_venu: new Date().toISOString().slice(0, 10),
    besoin: [],
    besoinLibre: "",
    is_whatsapp: false,
    infos_supplementaires: "",
    priere_salut: "",
    type_conversion: "",
    eglise_id: "",
    famille_id: urlFamilleId || null,
  });

  const [egliseInfo, setEgliseInfo] = useState(null);
  const [noPhone, setNoPhone] = useState(false);
  const [showBesoinLibre, setShowBesoinLibre] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // ─── Cas 1 : utilisateur connecté → récupérer eglise_id ───
  useEffect(() => {
    if (token) return;

    const fetchUserEglise = async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) { setLoading(false); return; }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("eglise_id")
        .eq("id", session.session.user.id)
        .single();

      if (!error && profile) {
        setFormData(prev => ({ ...prev, eglise_id: profile.eglise_id }));
      }
      setLoading(false);
    };

    fetchUserEglise();
  }, [token]);

  // ─── Cas 2 : lien externe avec token ───
  useEffect(() => {
    if (!token) return;

    const verifyToken = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("access_tokens")
        .select("church_id")
        .eq("token", token)
        .gte("expires_at", new Date().toISOString())
        .single();

      if (error || !data) {
        setErrorMsg(t.invalidLink);
      } else {
        setFormData(prev => ({ ...prev, eglise_id: data.church_id }));
      }

      setLoading(false);
    };

    verifyToken();
  }, [token]);

  // ─── Charger les infos de l'église une fois eglise_id connu ───
  useEffect(() => {
    if (!formData.eglise_id) return;

    const fetchEglise = async () => {
      const { data, error } = await supabase
        .from("eglises")
        .select("nom, branche, ville, pays, logo_url")
        .eq("id", formData.eglise_id)
        .single();

      if (!error && data) setEgliseInfo(data);
    };

    fetchEglise();
  }, [formData.eglise_id]);

  useEffect(() => {
    if (urlFamilleId) {
      setFormData(prev => ({ ...prev, famille_id: urlFamilleId }));
    }
  }, [urlFamilleId]);

  const handleBesoinChange = (e) => {
    const { value, checked } = e.target;

    if (value === t.other) {
      setShowBesoinLibre(checked);
      if (!checked) setFormData(prev => ({ ...prev, besoinLibre: "" }));
    }

    setFormData(prev => {
      const updatedBesoin = checked
        ? [...prev.besoin, value]
        : prev.besoin.filter(b => b !== value);
      return { ...prev, besoin: updatedBesoin };
    });
  };

  const resetForm = () => {
    setFormData(prev => ({
      ...prev,
      sexe: "",
      nom: "",
      prenom: "",
      telephone: "",
      ville: "",
      age: "",
      statut: "",
      venu: "",
      date_venu: new Date().toISOString().slice(0, 10),
      besoin: [],
      besoinLibre: "",
      is_whatsapp: false,
      infos_supplementaires: "",
      priere_salut: "",
      type_conversion: "",
    }));
    setNoPhone(false);
    setShowBesoinLibre(false);
    setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      if (!noPhone && !formData.telephone) {
        throw new Error(t.errNoPhone);
      }

      if (!formData.eglise_id) {
        throw new Error(t.errNoEglise);
      }

      const finalBesoin = showBesoinLibre && formData.besoinLibre
        ? [...formData.besoin.filter(b => b !== t.other), formData.besoinLibre]
        : formData.besoin;

      const { atteinte, count, limite } = await checkLimiteAtteinte(formData.eglise_id);
      if (atteinte) {
        setErrorMsg(t.errLimite(count, limite));
        return;
      }

      const { besoinLibre, ...rest } = formData;
      const dataToSend = {
        ...rest,
        besoin: finalBesoin,
        etat_contact: "nouveau",
        famille_id: formData.famille_id || null,
      };

      if (!noPhone) {
        const { data: existing } = await supabase
          .from("membres_complets")
          .select("id")
          .eq("telephone", formData.telephone)
          .maybeSingle();

        if (existing) throw new Error(t.errPhoneExists);
      }

      const { error } = await supabase.from("membres_complets").insert([dataToSend]);
      if (error) throw error;

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      resetForm();

    } catch (err) {
      setErrorMsg(err.message || t.errGeneric);
    }
  };

  if (loading) return <p className="text-center mt-10">{t.loading}</p>;
  if (errorMsg && !formData.eglise_id) return <p className="text-center mt-10 text-red-600">{errorMsg}</p>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-200 via-pink-100 to-yellow-100 p-4 sm:p-6">
      <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-3xl shadow-lg relative">

        <button
          onClick={() => window.close()}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 text-black font-bold hover:text-gray-800 transition-colors text-xl"
          aria-label={t.close}
        >
          ✕
        </button>

        {/* ─── Logo + infos de l'église ─── */}
        <div className="flex flex-col items-center mb-4 sm:mb-6 gap-2">
          {egliseInfo?.logo_url ? (
            <Image
              src={egliseInfo.logo_url}
              alt={egliseInfo.nom || "Logo église"}
              width={80}
              height={80}
              className="rounded-full object-contain"
            />
          ) : (
            <Image src="/logo.png" alt="SoulTrack Logo" width={70} height={70} />
          )}

          {egliseInfo && (
            <div className="text-center leading-snug mt-1">
              <p className="font-bold text-lg text-gray-800">{egliseInfo.nom}</p>
              {egliseInfo.branche && (
                <p className="text-sm text-gray-500">{egliseInfo.branche}</p>
              )}
              <p className="text-sm text-gray-500">
                {[egliseInfo.ville, egliseInfo.pays].filter(Boolean).join(", ")}
              </p>
            </div>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-2">{t.title}</h1>
        <p className="text-center text-gray-500 italic mb-4 sm:mb-6 text-sm sm:text-base">
          {t.subtitle}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:gap-4">

          {/* Date de venue */}
          <label className="text-sm sm:text-base font-semibold">{t.dateVenue}</label>
          <input
            type="date"
            value={formData.date_venu}
            onChange={e => setFormData({ ...formData, date_venu: e.target.value })}
            className="input"
            required
          />

          {/* Civilité */}
          <label className="text-sm sm:text-base font-semibold">{t.civility}</label>
          <select
            value={formData.sexe}
            onChange={e => setFormData({ ...formData, sexe: e.target.value })}
            className="input"
            required
          >
            <option value="">{t.choose}</option>
            <option value="Homme">{t.homme}</option>
            <option value="Femme">{t.femme}</option>
          </select>

          {/* Prénom / Nom */}
          <label className="text-sm sm:text-base font-semibold">{t.prenom}</label>
          <input
            type="text"
            value={formData.prenom}
            onChange={e => setFormData({ ...formData, prenom: e.target.value })}
            className="input"
            required
          />

          <label className="text-sm sm:text-base font-semibold">{t.nom}</label>
          <input
            type="text"
            value={formData.nom}
            onChange={e => setFormData({ ...formData, nom: e.target.value })}
            className="input"
            required
          />

          {/* Téléphone */}
          <div className="mb-2">
            <label className="block font-medium mb-1">{t.telephone}</label>
            <input
              type="tel"
              value={noPhone ? t.noPhone : formData.telephone}
              onChange={e => setFormData({ ...formData, telephone: e.target.value })}
              disabled={noPhone}
              required={!noPhone}
              className="w-full border rounded-lg px-3 py-2"
              placeholder={t.telPlaceholder}
            />
            <label className="flex items-center mt-2 space-x-2 text-sm">
              <input
                type="checkbox"
                checked={noPhone}
                onChange={(e) => {
                  setNoPhone(e.target.checked);
                  setFormData(prev => ({
                    ...prev,
                    telephone: e.target.checked ? "Pas de téléphone" : "",
                  }));
                }}
              />
              <span>{t.noPhone}</span>
            </label>
          </div>

          {/* WhatsApp */}
          <label className="flex items-center gap-2 text-sm sm:text-base">
            <input
              type="checkbox"
              checked={formData.is_whatsapp}
              onChange={e => setFormData({ ...formData, is_whatsapp: e.target.checked })}
            />
            {t.whatsapp}
          </label>

          {/* Ville */}
          <label className="text-sm sm:text-base font-semibold">{t.ville}</label>
          <input
            type="text"
            value={formData.ville}
            onChange={e => setFormData({ ...formData, ville: e.target.value })}
            className="input"
          />

          {/* Âge */}
          <label className="text-sm sm:text-base font-semibold">{t.age}</label>
          <select
            value={formData.age}
            onChange={e => setFormData({ ...formData, age: e.target.value })}
            className="input"
            required
          >
            <option value="">{t.choose}</option>
            {t.ageOptions.map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>

          {/* Statut */}
          <label className="text-sm sm:text-base font-semibold">{t.statut}</label>
          <select
            value={formData.statut}
            onChange={e => setFormData({ ...formData, statut: e.target.value })}
            className="input"
            required
          >
            <option value="">{t.choose}</option>
            {t.statutOptions.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {/* Comment venu */}
          <label className="text-sm sm:text-base font-semibold">{t.howCame}</label>
          <select
            value={formData.venu}
            onChange={e => setFormData({ ...formData, venu: e.target.value })}
            className="input"
            required
          >
            <option value="">{t.choose}</option>
            {t.howCameOptions.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {/* Prière du salut */}
          <label className="text-sm sm:text-base font-semibold">{t.prayerSalvation}</label>
          <select
            className="input"
            value={formData.priere_salut}
            required
            onChange={e => setFormData({
              ...formData,
              priere_salut: e.target.value,
              type_conversion: e.target.value === "Oui" ? formData.type_conversion : "",
            })}
          >
            <option value="">{t.choose}</option>
            <option value="Oui">{t.oui}</option>
            <option value="Non">{t.non}</option>
          </select>

          {formData.priere_salut === "Oui" && (
            <>
              <label className="text-sm sm:text-base font-semibold">{t.typeConversion}</label>
              <select
                className="input"
                value={formData.type_conversion}
                onChange={e => setFormData({ ...formData, type_conversion: e.target.value })}
                required
              >
                <option value="">{t.choose}</option>
                {t.conversionOptions.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </>
          )}

          {/* Besoins */}
          <label className="text-sm sm:text-base font-bold mb-1">{t.needs}</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {t.needsOptions.map(item => (
              <label key={item} className="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  value={item}
                  checked={formData.besoin.includes(item)}
                  onChange={handleBesoinChange}
                  className="w-4 h-4 sm:w-5 sm:h-5"
                />
                {item}
              </label>
            ))}
            <label className="flex items-center gap-1 text-sm">
              <input
                type="checkbox"
                value={t.other}
                checked={showBesoinLibre}
                onChange={handleBesoinChange}
                className="w-4 h-4 sm:w-5 sm:h-5"
              />
              {t.other}
            </label>
          </div>

          {showBesoinLibre && (
            <input
              type="text"
              placeholder={t.specify}
              value={formData.besoinLibre}
              onChange={e => setFormData({ ...formData, besoinLibre: e.target.value })}
              className="input mb-2"
            />
          )}

          {/* Infos supplémentaires */}
          <label className="text-sm sm:text-base font-semibold">{t.additionalInfo}</label>
          <textarea
            placeholder="..."
            rows={2}
            value={formData.infos_supplementaires}
            onChange={e => setFormData({ ...formData, infos_supplementaires: e.target.value })}
            className="input"
          />

          {errorMsg && (
            <p className="text-red-600 text-sm font-semibold text-center">{errorMsg}</p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-2">
            <button
              type="button"
              onClick={resetForm}
              className="w-full bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 rounded-2xl shadow-md transition-all"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600 text-white font-bold py-3 rounded-2xl shadow-md transition-all"
            >
              {t.add}
            </button>
          </div>
        </form>

        {success && (
          <p className="text-green-600 font-semibold text-center mt-4 animate-pulse">
            {t.success}
          </p>
        )}

        <style jsx>{`
          .input {
            width: 100%;
            border: 1px solid #ccc;
            border-radius: 12px;
            padding: 12px;
            text-align: left;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            color: black;
            font-size: 0.95rem;
          }
        `}</style>
      </div>
    </div>
  );
}
