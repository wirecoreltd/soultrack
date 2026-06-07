"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import supabase from "../lib/supabaseClient";
import { checkLimiteAtteinte } from "../lib/checkLimite";
import { useLang } from "../hooks/useLang";
import { getPrefixForPays } from "../lib/phonePrefix";
import FooterHub from "../components/FooterHub";

const translations = {
  fr: {
    loading: "Vérification du lien...",
    invalidLink: "Lien invalide ou expiré.",
    title: "Ajouter un nouveau membre",
    subtitle: "« Et le Seigneur ajoutait chaque jour à l'Église ceux qui étaient sauvés » – Actes 2:47",
    pageSubtitle1: "Ajoutez",
    pageSubtitle2: "facilement un membre à",
    pageSubtitle3: "votre église",
    pageSubtitle4: ". Renseignez ses informations, ses",
    pageSubtitle5: "besoins et son parcours spirituel",
    pageSubtitle6: " pour assurer",
    pageSubtitle7: "un suivi structuré et personnalisé",
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
      { value: "a déjà son église",       label: "A déjà son église" },
      { value: "nouveau",                 label: "Nouveau" },
      { value: "visiteur",               label: "Visiteur" },
    ],
    howCame: "Comment est-il venu ?",
    howCameOptions: [
      { value: "invité",         label: "Invité" },
      { value: "réseaux",        label: "Réseaux" },
      { value: "evangélisation", label: "Évangélisation" },
      { value: "autre",          label: "Autre" },
    ],
    prayerSalvation: "Prière du salut",
    oui: "Oui",
    non: "Non",
    typeConversion: "Type de conversion",
    conversionOptions: [
      { value: "Nouveau converti", label: "Nouveau converti" },
      { value: "Réconciliation",   label: "Réconciliation" },
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
    subtitle: "And the Lord added to the church daily those who were being saved – Actes 2:47",
    pageSubtitle1: "Easily add",
    pageSubtitle2: "a member to",
    pageSubtitle3: "your church",
    pageSubtitle4: ". Fill in their information, their",
    pageSubtitle5: "needs and spiritual journey",
    pageSubtitle6: " to ensure",
    pageSubtitle7: "structured and personalized follow-up",
    close: "Close",
    dateVenue: "Date of arrival",
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
      { value: "a déjà son église",       label: "Already has a church" },
      { value: "nouveau",                 label: "New" },
      { value: "visiteur",               label: "Visitor" },
    ],
    howCame: "How did they come?",
    howCameOptions: [
      { value: "invité",         label: "Invited" },
      { value: "réseaux",        label: "Social media" },
      { value: "evangélisation", label: "Outreach" },
      { value: "autre",          label: "Other" },
    ],
    prayerSalvation: "Salvation prayer",
    oui: "Yes",
    non: "No",
    typeConversion: "Type of conversion",
    conversionOptions: [
      { value: "Nouveau converti", label: "New convert" },
      { value: "Réconciliation",   label: "Reconciliation" },
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

const PAYS_DATA = [
  { code: "af", fr: "Afghanistan", en: "Afghanistan" },
  { code: "za", fr: "Afrique du Sud", en: "South Africa" },
  { code: "dz", fr: "Algérie", en: "Algeria" },
  { code: "de", fr: "Allemagne", en: "Germany" },
  { code: "ao", fr: "Angola", en: "Angola" },
  { code: "sa", fr: "Arabie Saoudite", en: "Saudi Arabia" },
  { code: "ae", fr: "Émirats Arabes Unis", en: "United Arab Emirates" },
  { code: "ar", fr: "Argentine", en: "Argentina" },
  { code: "au", fr: "Australie", en: "Australia" },
  { code: "be", fr: "Belgique", en: "Belgium" },
  { code: "bj", fr: "Bénin", en: "Benin" },
  { code: "br", fr: "Brésil", en: "Brazil" },
  { code: "bf", fr: "Burkina Faso", en: "Burkina Faso" },
  { code: "bi", fr: "Burundi", en: "Burundi" },
  { code: "cm", fr: "Cameroun", en: "Cameroon" },
  { code: "ca", fr: "Canada", en: "Canada" },
  { code: "cl", fr: "Chili", en: "Chile" },
  { code: "cn", fr: "Chine", en: "China" },
  { code: "co", fr: "Colombie", en: "Colombia" },
  { code: "cg", fr: "Congo", en: "Congo" },
  { code: "kr", fr: "Corée du Sud", en: "South Korea" },
  { code: "ci", fr: "Côte d'Ivoire", en: "Ivory Coast" },
  { code: "dk", fr: "Danemark", en: "Denmark" },
  { code: "eg", fr: "Egypte", en: "Egypt" },
  { code: "es", fr: "Espagne", en: "Spain" },
  { code: "us", fr: "États-Unis", en: "United States" },
  { code: "et", fr: "Ethiopie", en: "Ethiopia" },
  { code: "fi", fr: "Finlande", en: "Finland" },
  { code: "fr", fr: "France", en: "France" },
  { code: "ga", fr: "Gabon", en: "Gabon" },
  { code: "gh", fr: "Ghana", en: "Ghana" },
  { code: "gn", fr: "Guinée", en: "Guinea" },
  { code: "ht", fr: "Haïti", en: "Haiti" },
  { code: "in", fr: "Inde", en: "India" },
  { code: "id", fr: "Indonésie", en: "Indonesia" },
  { code: "ie", fr: "Irlande", en: "Ireland" },
  { code: "il", fr: "Israël", en: "Israel" },
  { code: "it", fr: "Italie", en: "Italy" },
  { code: "jp", fr: "Japon", en: "Japan" },
  { code: "ke", fr: "Kenya", en: "Kenya" },
  { code: "lb", fr: "Liban", en: "Lebanon" },
  { code: "lu", fr: "Luxembourg", en: "Luxembourg" },
  { code: "mg", fr: "Madagascar", en: "Madagascar" },
  { code: "ml", fr: "Mali", en: "Mali" },
  { code: "ma", fr: "Maroc", en: "Morocco" },
  { code: "mq", fr: "Martinique", en: "Martinique" },
  { code: "mu", fr: "Maurice", en: "Mauritius" },
  { code: "mr", fr: "Mauritanie", en: "Mauritania" },
  { code: "mx", fr: "Mexique", en: "Mexico" },
  { code: "mz", fr: "Mozambique", en: "Mozambique" },
  { code: "na", fr: "Namibie", en: "Namibia" },
  { code: "ne", fr: "Niger", en: "Niger" },
  { code: "ng", fr: "Nigeria", en: "Nigeria" },
  { code: "no", fr: "Norvège", en: "Norway" },
  { code: "nz", fr: "Nouvelle-Zélande", en: "New Zealand" },
  { code: "ug", fr: "Ouganda", en: "Uganda" },
  { code: "pk", fr: "Pakistan", en: "Pakistan" },
  { code: "nl", fr: "Pays-Bas", en: "Netherlands" },
  { code: "pe", fr: "Pérou", en: "Peru" },
  { code: "ph", fr: "Philippines", en: "Philippines" },
  { code: "pl", fr: "Pologne", en: "Poland" },
  { code: "pt", fr: "Portugal", en: "Portugal" },
  { code: "cd", fr: "RDC", en: "DR Congo" },
  { code: "do", fr: "République Dominicaine", en: "Dominican Republic" },
  { code: "ro", fr: "Roumanie", en: "Romania" },
  { code: "gb", fr: "Royaume-Uni", en: "United Kingdom" },
  { code: "rw", fr: "Rwanda", en: "Rwanda" },
  { code: "sn", fr: "Sénégal", en: "Senegal" },
  { code: "sl", fr: "Sierra Leone", en: "Sierra Leone" },
  { code: "sg", fr: "Singapour", en: "Singapore" },
  { code: "so", fr: "Somalie", en: "Somalia" },
  { code: "sd", fr: "Soudan", en: "Sudan" },
  { code: "se", fr: "Suède", en: "Sweden" },
  { code: "ch", fr: "Suisse", en: "Switzerland" },
  { code: "tz", fr: "Tanzanie", en: "Tanzania" },
  { code: "td", fr: "Tchad", en: "Chad" },
  { code: "tg", fr: "Togo", en: "Togo" },
  { code: "tn", fr: "Tunisie", en: "Tunisia" },
  { code: "tr", fr: "Turquie", en: "Turkey" },
  { code: "ua", fr: "Ukraine", en: "Ukraine" },
  { code: "uy", fr: "Uruguay", en: "Uruguay" },
  { code: "ve", fr: "Venezuela", en: "Venezuela" },
  { code: "vn", fr: "Vietnam", en: "Vietnam" },
  { code: "zw", fr: "Zimbabwe", en: "Zimbabwe" },
];

function getIsoCode(countryName) {
  const found = PAYS_DATA.find(p => p.fr === countryName || p.en === countryName);
  return found?.code || "un";
}

export default function AddMember() {
  const router = useRouter();
  const { token } = router.query;

  const urlEgliseId = router.query.eglise_id || null;
  const urlFamilleId = router.query.famille_id || null;

  const { lang: hookLang } = useLang();
  const urlLang = router.query.lang;
  const lang = (urlLang === "en" || urlLang === "fr") ? urlLang : hookLang;
  const t = translations[lang] || translations.fr;

  // ✅ Préfixe téléphonique détecté depuis le pays de l'église
  const [phonePrefix, setPhonePrefix] = useState("");

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
    famille_id: "",
  });

  const [egliseInfo, setEgliseInfo] = useState(null);
  const [noPhone, setNoPhone] = useState(false);
  const [showBesoinLibre, setShowBesoinLibre] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // CAS 1 — lien public avec eglise_id dans l'URL
  useEffect(() => {
    if (!urlEgliseId) return;
    setFormData(prev => ({ ...prev, eglise_id: urlEgliseId }));
    setLoading(false);
  }, [urlEgliseId]);

  // CAS 2 — lien avec token
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

  // CAS 3 — utilisateur connecté
  useEffect(() => {
    if (token) return;
    if (urlEgliseId) return;
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
  }, [token, urlEgliseId]);

  // Sync famille_id
  useEffect(() => {
    if (!urlFamilleId) return;
    setFormData(prev => ({ ...prev, famille_id: urlFamilleId }));
  }, [urlFamilleId]);

  // ✅ Fetch infos église + détecter le préfixe téléphonique
  useEffect(() => {
    if (!formData.eglise_id) return;
    const fetchEglise = async () => {
      const { data, error } = await supabase
        .from("eglises")
        .select("nom, branche, ville, pays, logo_url, denomination")
        .eq("id", formData.eglise_id)
        .single();
      if (!error && data) {
        setEgliseInfo(data);
        const prefix = getPrefixForPays(data.pays);
        if (prefix) {
          setPhonePrefix(prefix);
          setFormData(prev => ({
            ...prev,
            telephone: prev.telephone || prefix,
          }));
        }
      }
    };
    fetchEglise();
  }, [formData.eglise_id]);

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

  // ✅ Gestion du champ téléphone avec préfixe protégé
  const handlePhoneChange = (e) => {
  setFormData(prev => ({
    ...prev,
    telephone: e.target.value,
  }));
};

  const resetForm = () => {
    setFormData(prev => ({
      ...prev,
      sexe: "",
      nom: "",
      prenom: "",
      telephone: phonePrefix || "",
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
      if (!noPhone && !formData.telephone) throw new Error(t.errNoPhone);
      if (!formData.eglise_id) throw new Error(t.errNoEglise);

      const finalBesoin = showBesoinLibre && formData.besoinLibre
        ? [...formData.besoin.filter(b => b !== t.other), formData.besoinLibre]
        : formData.besoin;

      const { atteinte, count, limite } = await checkLimiteAtteinte(formData.eglise_id);
      if (atteinte) { setErrorMsg(t.errLimite(count, limite)); return; }

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

        {/* Logo + infos église */}
          <div className="flex flex-col items-center mb-5 gap-2">
            {egliseInfo?.logo_url && (
              <img
                src={egliseInfo.logo_url}
                alt={egliseInfo.nom || "Logo"}
                className="w-20 h-20 object-contain"
              />
            )}
          
            {(egliseInfo?.denomination || egliseInfo?.nom) && (
              <p className="font-bold text-lg text-[#333699] text-center px-2 leading-tight">
                {[egliseInfo.denomination, egliseInfo.nom]
                  .filter(Boolean)
                  .join(" - ")}
              </p>
            )}
          
            {egliseInfo?.branche && (
              <p className="text-sm font-medium text-[#c31850] text-center">
                {egliseInfo.branche}
              </p>
            )}
          
            {(egliseInfo?.ville || egliseInfo?.pays) && (
              <div className="flex items-center gap-2 text-sm text-[#c31850]">
                {egliseInfo?.pays && (
                  <img
                    src={`https://flagcdn.com/w20/${getIsoCode(egliseInfo.pays)}.png`}
                    width="20"
                    height="14"
                    alt={egliseInfo.pays}
                    className="rounded-sm"
                  />
                )}
          
                <span>
                  {egliseInfo?.ville}
                  {egliseInfo?.ville && egliseInfo?.pays ? " • " : ""}
                  {(() => {
                    const found = PAYS_DATA.find(
                      p => p.fr === egliseInfo?.pays || p.en === egliseInfo?.pays
                    );
                    return lang === "en"
                      ? (found?.en || egliseInfo?.pays)
                      : (found?.fr || egliseInfo?.pays);
                  })()}
                </span>
              </div>
            )}
          </div>
            
         <div className="max-w-3xl w-full mb-6 text-center">
          <p className="italic text-base text-black/90">
            <span className="text-[#FFB07C] font-semibold">{t.pageSubtitle1}</span> {t.pageSubtitle2}{" "}
            <span className="text-[#FFB07C] font-semibold">{t.pageSubtitle3}</span>{t.pageSubtitle4}
            <span className="text-[#FFB07C] font-semibold"> {t.pageSubtitle5}</span>{t.pageSubtitle6}{" "}
            <span className="text-[#FFB07C] font-semibold">{t.pageSubtitle7}</span>.
          </p>
        </div>
            
            <p className="text-center text-gray-500 italic mb-4 sm:mb-6 text-sm sm:text-base">{t.subtitle}</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:gap-4">

          <label className="text-sm sm:text-base font-semibold">{t.dateVenue}</label>
          <input type="date" value={formData.date_venu}
            onChange={e => setFormData({ ...formData, date_venu: e.target.value })}
            className="input" required />

          <label className="text-sm sm:text-base font-semibold">{t.civility}</label>
          <select value={formData.sexe}
            onChange={e => setFormData({ ...formData, sexe: e.target.value })}
            className="input" required>
            <option value="">{t.choose}</option>
            <option value="Homme">{t.homme}</option>
            <option value="Femme">{t.femme}</option>
          </select>

          <label className="text-sm sm:text-base font-semibold">{t.prenom}</label>
          <input type="text" value={formData.prenom}
            onChange={e => setFormData({ ...formData, prenom: e.target.value })}
            className="input" required />

          <label className="text-sm sm:text-base font-semibold">{t.nom}</label>
          <input type="text" value={formData.nom}
            onChange={e => setFormData({ ...formData, nom: e.target.value })}
            className="input" required />

          {/* ✅ Téléphone avec préfixe automatique */}
          <div className="mb-2">
            <label className="block font-medium mb-1">{t.telephone}</label>
            <input
              type="tel"
              value={noPhone ? t.noPhone : formData.telephone}
              onChange={handlePhoneChange}
              disabled={noPhone}
              required={!noPhone}
              className="w-full border rounded-lg px-3 py-2"
              placeholder={phonePrefix ? `${phonePrefix} ...` : t.telPlaceholder}
            />
            <label className="flex items-center mt-2 space-x-2 text-sm">
              <input
                type="checkbox"
                checked={noPhone}
                onChange={(e) => {
                  setNoPhone(e.target.checked);
                  setFormData(prev => ({
                    ...prev,
                    telephone: e.target.checked ? "Pas de téléphone" : (phonePrefix || ""),
                  }));
                }}
              />
              <span>{t.noPhone}</span>
            </label>
          </div>

          <label className="flex items-center gap-2 text-sm sm:text-base">
            <input type="checkbox" checked={formData.is_whatsapp}
              onChange={e => setFormData({ ...formData, is_whatsapp: e.target.checked })} />
            {t.whatsapp}
          </label>

          <label className="text-sm sm:text-base font-semibold">{t.ville}</label>
          <input type="text" value={formData.ville}
            onChange={e => setFormData({ ...formData, ville: e.target.value })}
            className="input" />

          <label className="text-sm sm:text-base font-semibold">{t.age}</label>
          <select value={formData.age}
            onChange={e => setFormData({ ...formData, age: e.target.value })}
            className="input" required>
            <option value="">{t.choose}</option>
            {t.ageOptions.map(v => <option key={v} value={v}>{v}</option>)}
          </select>

          <label className="text-sm sm:text-base font-semibold">{t.statut}</label>
          <select value={formData.statut}
            onChange={e => setFormData({ ...formData, statut: e.target.value })}
            className="input" required>
            <option value="">{t.choose}</option>
            {t.statutOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          <label className="text-sm sm:text-base font-semibold">{t.howCame}</label>
          <select value={formData.venu}
            onChange={e => setFormData({ ...formData, venu: e.target.value })}
            className="input" required>
            <option value="">{t.choose}</option>
            {t.howCameOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          <label className="text-sm sm:text-base font-semibold">{t.prayerSalvation}</label>
          <select className="input" value={formData.priere_salut} required
            onChange={e => setFormData({
              ...formData,
              priere_salut: e.target.value,
              type_conversion: e.target.value === "Oui" ? formData.type_conversion : "",
            })}>
            <option value="">{t.choose}</option>
            <option value="Oui">{t.oui}</option>
            <option value="Non">{t.non}</option>
          </select>

          {formData.priere_salut === "Oui" && (
            <>
              <label className="text-sm sm:text-base font-semibold">{t.typeConversion}</label>
              <select className="input" value={formData.type_conversion}
                onChange={e => setFormData({ ...formData, type_conversion: e.target.value })} required>
                <option value="">{t.choose}</option>
                {t.conversionOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </>
          )}

          <label className="text-sm sm:text-base font-bold mb-1">{t.needs}</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {t.needsOptions.map(item => (
              <label key={item} className="flex items-center gap-1 text-sm">
                <input type="checkbox" value={item}
                  checked={formData.besoin.includes(item)}
                  onChange={handleBesoinChange}
                  className="w-4 h-4 sm:w-5 sm:h-5" />
                {item}
              </label>
            ))}
            <label className="flex items-center gap-1 text-sm">
              <input type="checkbox" value={t.other} checked={showBesoinLibre}
                onChange={handleBesoinChange} className="w-4 h-4 sm:w-5 sm:h-5" />
              {t.other}
            </label>
          </div>

          {showBesoinLibre && (
            <input type="text" placeholder={t.specify}
              value={formData.besoinLibre}
              onChange={e => setFormData({ ...formData, besoinLibre: e.target.value })}
              className="input mb-2" />
          )}

          <label className="text-sm sm:text-base font-semibold">{t.additionalInfo}</label>
          <textarea placeholder="..." rows={2}
            value={formData.infos_supplementaires}
            onChange={e => setFormData({ ...formData, infos_supplementaires: e.target.value })}
            className="input" />

          {errorMsg && <p className="text-red-600 text-sm font-semibold text-center">{errorMsg}</p>}

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-2">
            <button type="button" onClick={resetForm}
              className="w-full bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 rounded-2xl shadow-md transition-all">
              {t.cancel}
            </button>
            <button type="submit"
              className="w-full bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600 text-white font-bold py-3 rounded-2xl shadow-md transition-all">
              {t.add}
            </button>
          </div>
        </form>

        {success && (
          <p className="text-green-600 font-semibold text-center mt-4 animate-pulse">{t.success}</p>
        )}

        <style jsx>{`
          .input {
            width: 100%; border: 1px solid #ccc; border-radius: 12px;
            padding: 12px; text-align: left; box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            color: black; font-size: 0.95rem;
          }
        `}</style>
              <FooterHub />
      </div>
    </div>
  );
}
