"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import supabase from "../lib/supabaseClient";
import { useLang } from "../hooks/useLang";
import { getPrefixForPays } from "../lib/phonePrefix";
import FooterHub from "../components/FooterHub";

const translations = {
  fr: {
    loading: "Chargement...",
    noEglise: "Votre compte n'est pas rattaché à une église.",
    title: "Ajouter une personne évangélisée",
    pageSubtitle1: "Enregistrez",
    pageSubtitle2: "facilement une personne",
    pageSubtitle3: "touchée par l'Évangile",
    pageSubtitle4: ". Notez ses informations, ses",
    pageSubtitle5: "besoins et son parcours spirituel",
    pageSubtitle6: " afin d'assurer",
    pageSubtitle7: "un accompagnement fidèle et structuré",
    subtitle: "«Allez par tout le monde, et prêchez la bonne nouvelle à toute la création.» – Marc 16:15",
    typeEvang: "Type d'Évangélisation",
    typeEvangOptions: [
      { value: "Individuel",                    label: "Individuel" },
      { value: "Sortie de groupe",              label: "Sortie de groupe" },
      { value: "Campagne d'évangélisation",     label: "Campagne d'évangélisation" },
      { value: "Évangélisation de rue",         label: "Évangélisation de rue" },
      { value: "Évangélisation maison",         label: "Évangélisation maison" },
      { value: "Évangélisation stade",          label: "Évangélisation stade" },
    ],
    civility: "Civilité",
    homme: "Homme",
    femme: "Femme",
    prenom: "Prénom",
    nom: "Nom",
    age: "-- Tranche d'âge --",
    ageOptions: ["12-17 ans", "18-25 ans", "26-30 ans", "31-40 ans", "41-55 ans", "56-69 ans", "70 ans et plus"],
    telephone: "Téléphone",
    ville: "Ville",
    whatsapp: "WhatsApp",
    prayerSalvation: "-- Prière du salut ? --",
    oui: "Oui",
    non: "Non",
    typeConversion: "Type",
    conversionOptions: [
      { value: "Nouveau converti", label: "Nouveau converti" },
      { value: "Réconciliation",   label: "Réconciliation" },
    ],
    needs: "Difficultés / Besoins :",
    needsOptions: [
      { value: "Finances", label: "Finances" },
      { value: "Santé", label: "Santé" },
      { value: "Travail / Études", label: "Travail / Études" },
      { value: "Famille / Enfants", label: "Famille / Enfants" },
      { value: "Relations / Conflits", label: "Relations / Conflits" },
      { value: "Miracle", label: "Miracle" },
      { value: "Délivrance", label: "Délivrance" },
      { value: "Addictions / Dépendances", label: "Addictions / Dépendances" },
      { value: "Guidance spirituelle", label: "Guidance spirituelle" },
      { value: "Logement / Sécurité", label: "Logement / Sécurité" },
      { value: "Communauté / Isolement", label: "Communauté / Isolement" },
      { value: "Dépression / Santé mentale", label: "Dépression / Santé mentale" },
    ],
    other: "Autre",
    specifyNeed: "Précisez le besoin...",
    additionalInfo: "Informations supplémentaires...",
    cancel: "Annuler",
    saving: "Enregistrement...",
    add: "Ajouter",
    success: "✅ Personne évangélisée ajoutée avec succès !",
  },
  en: {
    loading: "Loading...",
    noEglise: "Your account is not linked to a church.",
    title: "Add an evangelized person",
    pageSubtitle1: "Easily add",
    pageSubtitle2: "an evangelized person",
    pageSubtitle3: "to your outreach records",
    pageSubtitle4: ". Record their information,",
    pageSubtitle5: "needs and spiritual response",
    pageSubtitle6: " to ensure",
    pageSubtitle7: "effective and personalized follow-up",
    subtitle: "«Go ye into all the world, and preach the gospel to every creature.» – Marc 16:15",
    typeEvang: "Type of Outreach",
    typeEvangOptions: [
      { value: "Individuel",                    label: "Individual" },
      { value: "Sortie de groupe",              label: "Group outing" },
      { value: "Campagne d'évangélisation",     label: "Evangelism campaign" },
      { value: "Évangélisation de rue",         label: "Street evangelism" },
      { value: "Évangélisation maison",         label: "House evangelism" },
      { value: "Évangélisation stade",          label: "Stadium evangelism" },
    ],
    civility: "Title",
    homme: "Male",
    femme: "Female",
    prenom: "First name",
    nom: "Last name",
    age: "-- Age range --",
    ageOptions: ["12-17 yrs", "18-25 yrs", "26-30 yrs", "31-40 yrs", "41-55 yrs", "56-69 yrs", "70 yrs and over"],
    telephone: "Phone",
    ville: "City",
    whatsapp: "WhatsApp",
    prayerSalvation: "-- Salvation prayer? --",
    oui: "Yes",
    non: "No",
    typeConversion: "Type",
    conversionOptions: [
      { value: "Nouveau converti", label: "New convert" },
      { value: "Réconciliation",   label: "Reconciliation" },
    ],
    needs: "Difficulties / Needs:",
    needsOptions: [
      { value: "Finances", label: "Finances" },
      { value: "Santé", label: "Health" },
      { value: "Travail / Études", label: "Work / Studies" },
      { value: "Famille / Enfants", label: "Family / Children" },
      { value: "Relations / Conflits", label: "Relationships / Conflicts" },
      { value: "Miracle", label: "Miracle" },
      { value: "Délivrance", label: "Deliverance" },
      { value: "Addictions / Dépendances", label: "Addictions / Dependencies" },
      { value: "Guidance spirituelle", label: "Spiritual guidance" },
      { value: "Logement / Sécurité", label: "Housing / Safety" },
      { value: "Communauté / Isolement", label: "Community / Isolation" },
      { value: "Dépression / Santé mentale", label: "Depression / Mental health" },
    ],
    other: "Other",
    specifyNeed: "Please specify the need...",
    additionalInfo: "Additional information...",
    cancel: "Cancel",
    saving: "Saving...",
    add: "Add",
    success: "✅ Evangelized person added successfully!",
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

export default function AddEvangelise({ onNewEvangelise }) {
  const router = useRouter();

  const urlEgliseId  = router.query.eglise_id  || null;
  const urlCelluleId = router.query.cellule_id || null;
  const urlFamilleId = router.query.famille_id || null;
  const isFromLink   = !!urlEgliseId;

  const { lang: hookLang } = useLang();
  const urlLang = router.query.lang;
  const lang = (urlLang === "en" || urlLang === "fr") ? urlLang : hookLang;
  const t = translations[lang] || translations.fr;

  // ✅ cellule_full et famille_full via state — router.isReady
  const [celluleFullInfo, setCelluleFullInfo] = useState(null);
  const [familleFullInfo, setFamilleFullInfo] = useState(null);

  useEffect(() => {
    if (!router.isReady) return;
    if (router.query.cellule_full) {
      setCelluleFullInfo(decodeURIComponent(router.query.cellule_full));
    }
    if (router.query.famille_full) {
      setFamilleFullInfo(decodeURIComponent(router.query.famille_full));
    }
  }, [router.isReady, router.query.cellule_full, router.query.famille_full]);

  const [phonePrefix, setPhonePrefix] = useState("");

  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    telephone: "",
    ville: "",
    statut: "evangelisé",
    sexe: "",
    age: "",
    priere_salut: "",
    type_conversion: "",
    besoin: [],
    infos_supplementaires: "",
    is_whatsapp: false,
    eglise_id: urlEgliseId || null,
    type_evangelisation: "",
    date_evangelise: new Date().toISOString().split("T")[0],
  });

  const [showOtherField, setShowOtherField] = useState(false);
  const [otherBesoin, setOtherBesoin] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [eglise, setEglise] = useState(null);

  // Fetch église depuis l'URL
  useEffect(() => {
    const fetchEglise = async () => {
      if (!urlEgliseId) return;
      setFormData(prev => ({ ...prev, eglise_id: urlEgliseId }));
      const { data, error } = await supabase
        .from("eglises")
        .select("id, nom, denomination, ville, pays, branche, logo_url")
        .eq("id", urlEgliseId)
        .single();
      if (!error && data) {
        setEglise(data);
        const prefix = getPrefixForPays(data.pays);
        if (prefix) {
          setPhonePrefix(prefix);
          setFormData(prev => ({ ...prev, telephone: prev.telephone || prefix }));
        }
      }
    };
    fetchEglise();
  }, [urlEgliseId]);

  // Fetch église depuis le profil connecté
  useEffect(() => {
    if (isFromLink) return;
    const fetchUserEglise = async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) return;
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("eglise_id, eglises ( id, nom, denomination, ville, pays, branche, logo_url )")
        .eq("id", session.session.user.id)
        .single();
      if (!error && profile) {
        setFormData(prev => ({ ...prev, eglise_id: profile.eglise_id }));
        setEglise(profile.eglises);
        const prefix = getPrefixForPays(profile.eglises?.pays);
        if (prefix) {
          setPhonePrefix(prefix);
          setFormData(prev => ({ ...prev, telephone: prev.telephone || prefix }));
        }
      }
    };
    fetchUserEglise();
  }, [isFromLink]);

  const successRef = useRef(null);
  useEffect(() => {
    if (success && successRef.current) {
      successRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [success]);

  const handleBesoinChange = (value) => {
    const updated = formData.besoin.includes(value)
      ? formData.besoin.filter(b => b !== value)
      : [...formData.besoin, value];
    setFormData({ ...formData, besoin: updated });
  };

  const handlePhoneChange = (e) => {
    setFormData(prev => ({ ...prev, telephone: e.target.value }));
  };

  const resetForm = () => {
    setFormData(prev => ({
      nom: "",
      prenom: "",
      telephone: phonePrefix || "",
      ville: "",
      statut: "evangelisé",
      sexe: "",
      age: "",
      priere_salut: "",
      type_conversion: "",
      besoin: [],
      infos_supplementaires: "",
      is_whatsapp: false,
      eglise_id: prev.eglise_id,
      type_evangelisation: "",
      date_evangelise: new Date().toISOString().split("T")[0],
    }));
    setShowOtherField(false);
    setOtherBesoin("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.eglise_id) { alert(t.noEglise); return; }

    const finalBesoins = [...formData.besoin];
    if (showOtherField && otherBesoin.trim()) finalBesoins.push(otherBesoin.trim());

    let statusSuivi = "Non envoyé";
    if (urlCelluleId) statusSuivi = "evangelisation_cellule";
    else if (urlFamilleId) statusSuivi = "evangelisation_famille";

    const finalData = {
      nom: formData.nom.trim(),
      prenom: formData.prenom.trim(),
      telephone: formData.telephone.trim() || "",
      ville: formData.ville.trim() || null,
      statut: "evangelisé",
      sexe: formData.sexe || null,
      age: formData.age || null,
      priere_salut: formData.priere_salut === "Oui",
      type_conversion: formData.priere_salut === "Oui" ? formData.type_conversion || null : null,
      besoin: finalBesoins,
      infos_supplementaires: formData.infos_supplementaires || null,
      is_whatsapp: formData.is_whatsapp,
      eglise_id: formData.eglise_id,
      type_evangelisation: formData.type_evangelisation,
      date_evangelise: formData.date_evangelise,
      status_suivi: statusSuivi,
    };

    try {
      setLoading(true);
      const generatedId = crypto.randomUUID();
      const { error } = await supabase
        .from("evangelises")
        .insert([{ ...finalData, id: generatedId }]);
      if (error) throw error;
      const evangelise = { ...finalData, id: generatedId };

      if (urlCelluleId) {
        const suiviData = {
          prenom: evangelise.prenom, nom: evangelise.nom,
          telephone: evangelise.telephone, is_whatsapp: evangelise.is_whatsapp,
          ville: evangelise.ville, besoin: evangelise.besoin,
          infos_supplementaires: evangelise.infos_supplementaires,
          sexe: evangelise.sexe, age: evangelise.age,
          type_conversion: evangelise.type_conversion,
          priere_salut: evangelise.priere_salut,
          status_suivis_evangelises: "Envoyé",
          evangelise_id: evangelise.id,
          cellule_id: urlCelluleId, famille_id: null, conseiller_id: null,
          date_evangelise: evangelise.date_evangelise,
          date_suivi: new Date().toISOString(),
          eglise_id: evangelise.eglise_id,
          type_evangelisation: evangelise.type_evangelisation,
        };
        const { error: suiviError } = await supabase.from("suivis_des_evangelises").insert([suiviData]);
        if (suiviError) console.error("Erreur insertion suivis (cellule):", suiviError);
      }

      if (urlFamilleId) {
        const suiviData = {
          prenom: evangelise.prenom, nom: evangelise.nom,
          telephone: evangelise.telephone, is_whatsapp: evangelise.is_whatsapp,
          ville: evangelise.ville, besoin: evangelise.besoin,
          infos_supplementaires: evangelise.infos_supplementaires,
          sexe: evangelise.sexe, age: evangelise.age,
          type_conversion: evangelise.type_conversion,
          priere_salut: evangelise.priere_salut,
          status_suivis_evangelises: "Envoyé",
          evangelise_id: evangelise.id,
          cellule_id: null, famille_id: urlFamilleId, conseiller_id: null,
          date_evangelise: evangelise.date_evangelise,
          date_suivi: new Date().toISOString(),
          eglise_id: evangelise.eglise_id,
          type_evangelisation: evangelise.type_evangelisation,
        };
        const { error: suiviError } = await supabase.from("suivis_des_evangelises").insert([suiviData]);
        if (suiviError) console.error("Erreur insertion suivis (famille):", suiviError);
      }

      setSuccess(true);
      resetForm();
      if (onNewEvangelise) onNewEvangelise(evangelise);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Erreur globale:", err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-200 via-pink-100 to-yellow-100 p-4 sm:p-6">
      <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-3xl shadow-lg relative">

        {/* Logo + infos église */}
        <div className="flex flex-col items-center mb-4 gap-1">
          {eglise?.logo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={eglise.logo_url} alt={eglise.nom || "Logo"}
              className="w-20 h-20 object-contain" />
          )}
          {(eglise?.denomination || eglise?.nom) && (
            <p className="font-bold text-lg text-[#333699] text-center break-words px-2 leading-tight">
              {[eglise.denomination, eglise.nom].filter(Boolean).join(" - ")}
            </p>
          )}
          {eglise?.branche && (
            <p className="text-sm text-[#666] text-center">{eglise.branche}</p>
          )}
          {(eglise?.ville || eglise?.pays) && (
            <div className="flex items-center gap-2 text-sm text-[#c31850]">
              {eglise?.ville && (
                <span>{eglise.ville}{eglise?.pays ? " • " : ""}</span>
              )}
              {eglise?.pays && (
                <>
                  <img src={`https://flagcdn.com/w20/${getIsoCode(eglise.pays)}.png`}
                    width="20" height="14" alt={eglise.pays} />
                  <span>
                    {(() => {
                      const found = PAYS_DATA.find(p => p.fr === eglise.pays || p.en === eglise.pays);
                      return lang === "en" ? (found?.en || eglise.pays) : (found?.fr || eglise.pays);
                    })()}
                  </span>
                </>
              )}
            </div>
          )}

          {/* ✅ Nom cellule ou famille depuis l'URL */}
          {celluleFullInfo && (
            <p className="text-2xl font-semibold text-[#333699] mt-1 text-center">
              🏠 {celluleFullInfo}
            </p>
          )}
          {familleFullInfo && (
            <p className="text-2xl font-semibold text-[#333699] mt-1 text-center">
              👑 {familleFullInfo.split(" - ")[1] || familleFullInfo}
            </p>
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

        <p className="text-center text-gray-500 italic mb-4 sm:mb-6 text-sm sm:text-base">
          {t.subtitle}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 justify-center">

          <div className="flex justify-center w-full">
            <input type="date" className="input w-auto text-center"
              value={formData.date_evangelise}
              onChange={e => setFormData({ ...formData, date_evangelise: e.target.value })} />
          </div>

          <select className="input text-center" value={formData.type_evangelisation}
            onChange={e => setFormData({ ...formData, type_evangelisation: e.target.value })} required>
            <option value="">{t.typeEvang}</option>
            {t.typeEvangOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          <select className="input" value={formData.sexe}
            onChange={e => setFormData({ ...formData, sexe: e.target.value })} required>
            <option value="">{t.civility}</option>
            <option value="Homme">{t.homme}</option>
            <option value="Femme">{t.femme}</option>
          </select>

          <input className="input" type="text" placeholder={t.prenom} value={formData.prenom}
            onChange={e => setFormData({ ...formData, prenom: e.target.value })} required />
          <input className="input" type="text" placeholder={t.nom} value={formData.nom}
            onChange={e => setFormData({ ...formData, nom: e.target.value })} required />

          <select value={formData.age}
            onChange={e => setFormData({ ...formData, age: e.target.value })} className="input">
            <option value="">{t.age}</option>
            {t.ageOptions.map(v => <option key={v} value={v}>{v}</option>)}
          </select>

          <input className="input" type="text"
            placeholder={phonePrefix ? `${phonePrefix} ...` : t.telephone}
            value={formData.telephone} onChange={handlePhoneChange} />

          <input className="input" type="text" placeholder={t.ville} value={formData.ville}
            onChange={e => setFormData({ ...formData, ville: e.target.value })} />

          <label className="flex items-center gap-2 text-gray-700">
            <input type="checkbox" checked={formData.is_whatsapp}
              onChange={e => setFormData({ ...formData, is_whatsapp: e.target.checked })}
              className="w-5 h-5 accent-indigo-600 cursor-pointer" />
            {t.whatsapp}
          </label>

          <select className="input" value={formData.priere_salut} required
            onChange={e => setFormData({
              ...formData, priere_salut: e.target.value,
              type_conversion: e.target.value === "Oui" ? formData.type_conversion : "",
            })}>
            <option value="">{t.prayerSalvation}</option>
            <option value="Oui">{t.oui}</option>
            <option value="Non">{t.non}</option>
          </select>

          {formData.priere_salut === "Oui" && (
            <select className="input" value={formData.type_conversion}
              onChange={e => setFormData({ ...formData, type_conversion: e.target.value })} required>
              <option value="">{t.typeConversion}</option>
              {t.conversionOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          )}

          <div className="mt-4">
            <p className="font-semibold mb-2">{t.needs}</p>
            {t.needsOptions.map(b => (
              <label key={b.value} className="flex items-center gap-3 mb-2">
                <input type="checkbox" value={b.value} checked={formData.besoin.includes(b.value)}
                  onChange={() => handleBesoinChange(b.value)}
                  className="w-5 h-5 rounded border-gray-400 cursor-pointer accent-indigo-600" />
                <span>{b.label}</span>
              </label>
            ))}
            <label className="flex items-center gap-3 mb-2">
              <input type="checkbox" checked={showOtherField}
                onChange={() => setShowOtherField(!showOtherField)}
                className="w-5 h-5 rounded border-gray-400 cursor-pointer accent-indigo-600" />
              {t.other}
            </label>
            {showOtherField && (
              <input type="text" placeholder={t.specifyNeed} value={otherBesoin}
                onChange={e => setOtherBesoin(e.target.value)} className="input mt-1" />
            )}
          </div>

          <textarea placeholder={t.additionalInfo} rows={3}
            value={formData.infos_supplementaires}
            onChange={e => setFormData({ ...formData, infos_supplementaires: e.target.value })}
            className="input" />

          <div className="flex gap-4">
            <button type="button" onClick={resetForm}
              className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 rounded-2xl shadow-md transition-all">
              {t.cancel}
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:scale-105 text-white font-bold py-3 rounded-2xl shadow-md transition-all">
              {loading ? t.saving : t.add}
            </button>
          </div>
        </form>

        {success && (
          <p ref={successRef} className="text-green-600 font-semibold text-center mt-3">{t.success}</p>
        )}

        <style jsx>{`.input { width: 100%; padding: 12px; border-radius: 12px; border: 1px solid #ccc; }`}</style>
        <FooterHub />
      </div>
    </div>
  );
}
