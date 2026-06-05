// pages/ajouter-membre-Famille.js

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import supabase from "../../lib/supabaseClient";
import { useMembers } from "../../context/MembersContext";
import Footer from "../../components/Footer";
import FooterHub from "../../components/FooterHub";
import { checkLimiteAtteinte } from "../../lib/checkLimite";
import { useLang } from "../../hooks/useLang";
import { getPrefixForPays } from "../../lib/phonePrefix";

const translations = {
  fr: {
    pageTitle: "Ajouter un membre",    
    pageSubtitle1: "Ajoutez",
    pageSubtitle2: "facilement un membre à",
    pageSubtitle3: "votre Famille",
    pageSubtitle4: ". Renseignez ses informations, ses",
    pageSubtitle5: "besoins et son parcours spirituel",
    pageSubtitle6: ", puis associez-le à une Famille pour assurer",
    pageSubtitle7: "un suivi structuré et personnalisé",
    back: "← Retour",
    chooseFamille: "-- Choisir une Famille --",
    prenom: "Prénom",
    nom: "Nom",
    civilite: "Civilité",
    choose: "-- Choisir --",
    homme: "Homme",
    femme: "Femme",
    trancheAge: "Tranche d'âge",
    telephone: "Téléphone",
    telPlaceholder: "Ex: 5 1234 5678",
    noPhone: "La personne n'a pas de téléphone",
    whatsapp: "Numéro WhatsApp",
    ville: "Ville",
    commentVenu: "Comment est-il venu ?",
    invite: "Invité",
    reseaux: "Réseaux",
    evangelisation: "Evangélisation",
    autre: "Autre",
    priereSalut: "Prière du salut ?",
    oui: "Oui",
    non: "Non",
    typeConversion: "Type de conversion",
    nouveauConverti: "Nouveau converti",
    reconciliation: "Réconciliation",
    besoinsLabel: "Difficultés / Besoins",
    besoinFinances: "Finances",
    besoinSante: "Santé",
    besoinTravail: "Travail / Études",
    besoinFamille: "Famille / Enfants",
    besoinMiracle: "Miracle",
    besoinDelivrance: "Délivrance",
    besoinRelations: "Relations / Conflits",
    besoinAddictions: "Addictions / Dépendances",
    besoinGuidance: "Guidance spirituelle",
    besoinLogement: "Logement / Sécurité",
    besoinCommunaute: "Communauté / Isolement",
    besoinDepression: "Dépression / Santé mentale",
    besoinAutre: "Autre",
    besoinPrecisez: "Précisez...",
    infosSupp: "Informations supplémentaires",
    annuler: "Annuler",
    ajouter: "Ajouter",
    dateVenue: "Date de venue",
    successMsg: "✅ Membre ajouté avec succès",
    errEglise: "❌ Église non identifiée.",
    errLimite: "❌ Limite atteinte : {count}/{limite} membres. Upgradez votre plan.",
    errAjout: "❌ Impossible d'ajouter le membre : ",
    errFamille: "⚠️ Aucune Famille trouvée pour votre église.",
    errFamilleSelect: "❌ Aucune famille sélectionnée.",
    errUser: "⚠️ Utilisateur non connecté.",
    errNoPhone: "Le téléphone est requis ou cochez 'Pas de téléphone'",
  },
  en: {
    pageTitle: "Add a member",    
    pageSubtitle1: "Easily add",
    pageSubtitle2: "a member to",
    pageSubtitle3: "your Family",
    pageSubtitle4: ". Fill in their information, their",
    pageSubtitle5: "needs and spiritual journey",
    pageSubtitle6: ", then assign them to a Family to ensure",
    pageSubtitle7: "structured and personalized follow-up",
    back: "← Back",
    chooseFamille: "-- Choose a Family --",
    prenom: "First name",
    nom: "Last name",
    civilite: "Title",
    choose: "-- Choose --",
    homme: "Male",
    femme: "Female",
    trancheAge: "Age range",
    telephone: "Phone",
    telPlaceholder: "e.g. 5 1234 5678",
    noPhone: "This person has no phone",
    whatsapp: "WhatsApp number",
    ville: "City",
    commentVenu: "How did they come?",
    invite: "Invited",
    reseaux: "Social media",
    evangelisation: "Evangelism",
    autre: "Other",
    priereSalut: "Salvation prayer?",
    oui: "Yes",
    non: "No",
    typeConversion: "Type of conversion",
    nouveauConverti: "New convert",
    reconciliation: "Reconciliation",
    besoinsLabel: "Difficulties / Needs",
    besoinFinances: "Finances",
    besoinSante: "Health",
    besoinTravail: "Work / Studies",
    besoinFamille: "Family / Children",
    besoinMiracle: "Miracle",
    besoinDelivrance: "Deliverance",
    besoinRelations: "Relationships / Conflicts",
    besoinAddictions: "Addictions / Dependencies",
    besoinGuidance: "Spiritual guidance",
    besoinLogement: "Housing / Safety",
    besoinCommunaute: "Community / Isolation",
    besoinDepression: "Depression / Mental health",
    besoinAutre: "Other",
    besoinPrecisez: "Specify...",
    infosSupp: "Additional information",
    annuler: "Cancel",
    ajouter: "Add",
    dateVenue: "Date of arrival",
    successMsg: "✅ Member added successfully",
    errEglise: "❌ Church not identified.",
    errLimite: "❌ Limit reached: {count}/{limite} members. Please upgrade your plan.",
    errAjout: "❌ Unable to add member: ",
    errFamille: "⚠️ No Family found for your church.",
    errFamilleSelect: "❌ No family selected.",
    errUser: "⚠️ User not logged in.",
    errNoPhone: "Phone is required or check 'No phone'",
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

export default function AjouterMembreFamille() {
  return <AjouterMembreFamilleContent />;
}

function AjouterMembreFamilleContent() {
  const router = useRouter();
  
  const { setAllMembers } = useMembers();
  const { lang } = useLang();
  const t = translations[lang];
const urlEgliseId = router.query.eglise_id || null;
const urlFamilleId = router.query.famille_id || null;
const urlFamilleFull = router.query.famille_full
  ? decodeURIComponent(router.query.famille_full)
  : null;  
  
  const isFromLink = !!urlEgliseId && !!urlFamilleId;
  const [familleInfo, setFamilleInfo] = useState(null);

  const [egliseInfo, setEgliseInfo] = useState(null);
  const [showBesoinLibre, setShowBesoinLibre] = useState(false);
  const [Familles, setFamilles] = useState([]);
  const [success, setSuccess] = useState(false);
  const [noPhone, setNoPhone] = useState(false);
  const [phonePrefix, setPhonePrefix] = useState("");  
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    sexe: "",
    telephone: "",
    ville: "",
    age: "",
    venu: "",
    priere_salut: "",
    type_conversion: "",
    besoin: [],
    autreBesoin: "",
    besoinLibre: "",
    famille_id: "",
    infos_supplementaires: "",
    date_venu: new Date().toISOString().slice(0, 10),
    is_whatsapp: false,
  });

  const besoinsOptions = [
    { key: "besoinFinances",   value: "Finances" },
    { key: "besoinSante",      value: "Santé" },
    { key: "besoinTravail",    value: "Travail / Études" },
    { key: "besoinFamille",    value: "Famille / Enfants" },
    { key: "besoinMiracle",    value: "Miracle" },
    { key: "besoinDelivrance", value: "Délivrance" },
    { key: "besoinRelations",  value: "Relations / Conflits" },
    { key: "besoinAddictions", value: "Addictions / Dépendances" },
    { key: "besoinGuidance",   value: "Guidance spirituelle" },
    { key: "besoinLogement",   value: "Logement / Sécurité" },
    { key: "besoinCommunaute", value: "Communauté / Isolement" },
    { key: "besoinDepression", value: "Dépression / Santé mentale" },
  ];

  const [userScope, setUserScope] = useState({ eglise_id: null });

  useEffect(() => {
    if (urlEgliseId) {
      setUserScope({ eglise_id: urlEgliseId });
      return;
    }

    const fetchUserScope = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      if (!user) return;

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("eglise_id")
        .eq("id", user.id)
        .single();

      if (!error && profile) {
        setUserScope({ eglise_id: profile.eglise_id });
      }
    };

    fetchUserScope();
  }, [urlEgliseId]);

  // Fetch logo + infos église + préfixe téléphonique
  useEffect(() => {
    if (!userScope.eglise_id) return;

    const fetchEglise = async () => {
      const { data, error } = await supabase
        .from("eglises")
        .select("nom, branche, ville, pays, logo_url, denomination")
        .eq("id", userScope.eglise_id)
        .single();

      if (!error && data) {
        setEgliseInfo(data);
        const prefix = getPrefixForPays(data.pays);
        if (prefix) {
          setPhonePrefix(prefix);
          setFormData((prev) => ({
            ...prev,
            telephone: prev.telephone || prefix,
          }));
        }
      }
    };

    fetchEglise();
  }, [userScope.eglise_id]);

  useEffect(() => {
  if (router.query.famille_full) {
    setFamilleInfo(decodeURIComponent(router.query.famille_full));
  }
}, [router.query.famille_full]);

  // Fetch familles (uniquement si utilisateur connecté, pas via lien public)
  useEffect(() => {
    if (!userScope.eglise_id) return;
    if (isFromLink) return;

    const fetchFamilles = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;

      if (!userId) {
        alert(t.errUser);
        return;
      }

      const { data, error } = await supabase
        .from("familles")
        .select("id, ville, famille")
        .eq("responsable_id", userId)
        .eq("eglise_id", userScope.eglise_id);

      if (error || !data || data.length === 0) {
        alert(t.errFamille);
        return;
      }

      setFamilles(data);
      if (data.length === 1) {
        setFormData((prev) => ({ ...prev, famille_id: data[0].id }));
      }
    };

    fetchFamilles();
  }, [userScope, isFromLink]);

  const handleBesoinChange = (e) => {
    const { value, checked } = e.target;
    if (value === "Autre") {
      setShowBesoinLibre(checked);
      if (!checked) setFormData((prev) => ({ ...prev, besoinLibre: "" }));
    }
    setFormData((prev) => {
      const updatedBesoin = checked
        ? [...prev.besoin, value]
        : prev.besoin.filter((b) => b !== value);
      return { ...prev, besoin: updatedBesoin };
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handlePhoneChange = (e) => {
    setFormData((prev) => ({ ...prev, telephone: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const familleIdFinal = urlFamilleId || formData.famille_id;

    if (!userScope.eglise_id) {
      alert(t.errEglise);
      return;
    }

    if (!noPhone && !formData.telephone) {
      alert(t.errNoPhone);
      return;
    }

    if (!familleIdFinal) {
      alert(t.errFamilleSelect);
      return;
    }

    try {
      const { atteinte, count, limite } = await checkLimiteAtteinte(userScope.eglise_id);
      if (atteinte) {
        alert(t.errLimite.replace("{count}", count).replace("{limite}", limite));
        return;
      }

      const finalBesoin = showBesoinLibre && formData.besoinLibre
        ? [...formData.besoin.filter((b) => b !== "Autre"), formData.besoinLibre]
        : formData.besoin;

      const newMemberData = {
        nom: formData.nom,
        prenom: formData.prenom,
        telephone: noPhone ? "Pas de téléphone" : formData.telephone,
        ville: formData.ville,
        venu: formData.venu,
        famille_id: familleIdFinal,
        eglise_id: userScope.eglise_id,
        statut_suivis: 3,
        etat_contact: "existant",
        is_new_in_cellule: "true",
        is_whatsapp: formData.is_whatsapp,
        infos_supplementaires: formData.infos_supplementaires,
        besoin: finalBesoin.join(", "),
        autrebesoin: formData.autreBesoin || null,
        sexe: formData.sexe || null,
        age: formData.age || null,
        date_venu: formData.date_venu || null,
        bapteme_eau: false,
        bapteme_esprit: false,
        statut_initial: formData.statut_initial || null,
        priere_salut: formData.priere_salut || null,
        type_conversion: formData.type_conversion || null,
      };

      const { data: newMember, error } = await supabase
        .from("membres_complets")
        .insert([newMemberData])
        .select()
        .single();

      if (error) throw error;

      setAllMembers((prev) => [...prev, newMember]);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);

      setFormData({
        nom: "",
        prenom: "",
        sexe: "",
        age: "",
        telephone: phonePrefix || "",
        ville: "",
        venu: "",
        priere_salut: "",
        type_conversion: "",
        date_venu: new Date().toISOString().slice(0, 10),
        besoin: [],
        autreBesoin: "",
        besoinLibre: "",
        famille_id: urlFamilleId || (Familles.length === 1 ? Familles[0].id : ""),
        infos_supplementaires: "",
        is_whatsapp: false,
      });
      setNoPhone(false);
      setShowBesoinLibre(false);

    } catch (err) {
      alert(t.errAjout + err.message);
    }
  };

  const handleCancel = () => {
    setFormData({
      nom: "",
      prenom: "",
      sexe: "",
      telephone: phonePrefix || "",
      ville: "",
      age: "",
      venu: "",
      priere_salut: "",
      type_conversion: "",
      date_venu: new Date().toISOString().slice(0, 10),
      besoin: [],
      autreBesoin: "",
      besoinLibre: "",
      famille_id: urlFamilleId || (Familles.length === 1 ? Familles[0].id : ""),
      infos_supplementaires: "",
      is_whatsapp: false,
    });
    setNoPhone(false);
    setShowBesoinLibre(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-200 via-pink-100 to-yellow-100 p-6">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-lg relative">

        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 font-semibold"
        >
          {t.back}
        </button>

        <div className="flex flex-col items-center mb-3 sm:mb-6 gap-2">
          {egliseInfo?.logo_url && (
            <img src={egliseInfo.logo_url} alt={egliseInfo.nom || "Logo"}
              style={{ width: 50, height: 50, objectFit: "contain" }} />
          )}
          {(egliseInfo?.denomination || egliseInfo?.nom) && (
            <p className="font-semibold text-base text-[#c31850] text-center w-full break-words px-2">
              {[egliseInfo.denomination, egliseInfo.nom].filter(Boolean).join(" - ")}
            </p>
          )}
          {egliseInfo?.branche && (
            <p className="text-sm text-[#c31850] text-center">{egliseInfo.branche}</p>
          )}
          {egliseInfo?.ville && (
            <p className="text-sm text-amber-500">{egliseInfo.ville}</p>
          )}
          {egliseInfo?.pays && (
            <p className="text-sm text-gray-700 flex items-center gap-1">
              <img
                src={`https://flagcdn.com/w20/${getIsoCode(egliseInfo.pays)}.png`}
                width="20" height="14" alt={egliseInfo.pays}
              />
              {(() => {
                const found = PAYS_DATA.find(p => p.fr === egliseInfo.pays || p.en === egliseInfo.pays);
                return lang === "en" ? (found?.en || egliseInfo.pays) : (found?.fr || egliseInfo.pays);
              })()}
            </p>
          )}
          {familleInfo && (
  <p className="text-2xl font-semibold text-[#333699] mt-1 text-center">
    👑 {familleInfo}
  </p>
)}
        </div>

        <h1 className="text-xl font-bold mt-4 mb-6 text-center text-black">
          {t.pageTitle}<br /><span className="text-[#333699]">{t.pageTitleHighlight}</span>
        </h1>

        <div className="max-w-3xl w-full mb-6 text-center">
          <p className="italic text-base text-black/90">
            <span className="text-[#FFB07C] font-semibold">{t.pageSubtitle1}</span> {t.pageSubtitle2}{" "}
            <span className="text-[#FFB07C] font-semibold">{t.pageSubtitle3}</span>{t.pageSubtitle4}
            <span className="text-[#FFB07C] font-semibold"> {t.pageSubtitle5}</span>{t.pageSubtitle6}{" "}
            <span className="text-[#FFB07C] font-semibold">{t.pageSubtitle7}</span>.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {!isFromLink && Familles.length > 1 && (
            <select
              name="famille_id"
              value={formData.famille_id}
              onChange={handleChange}
              className="input"
              required
            >
              <option value="">{t.chooseFamille}</option>
              {Familles.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.ville} - {c.famille}
                </option>
              ))}
            </select>
          )}

          <label className="text-sm sm:text-base font-semibold">{t.dateVenue}</label>
          <input
            type="date"
            value={formData.date_venu}
            onChange={e => setFormData({ ...formData, date_venu: e.target.value })}
            className="input"
            required
          />

          <label className="text-sm sm:text-base font-semibold">{t.civilite}</label>
          <select className="input" value={formData.sexe} onChange={(e) => setFormData({ ...formData, sexe: e.target.value })} required>
            <option value="">{t.choose}</option>
            <option value="Homme">{t.homme}</option>
            <option value="Femme">{t.femme}</option>
          </select>

          <label className="text-sm sm:text-base font-semibold">{t.prenom}</label>
          <input name="prenom" placeholder={t.prenom} value={formData.prenom} onChange={handleChange} className="input" required />

          <label className="text-sm sm:text-base font-semibold">{t.nom}</label>
          <input name="nom" placeholder={t.nom} value={formData.nom} onChange={handleChange} className="input" required />

          {/* Téléphone avec préfixe automatique */}
          <div className="mb-2">
            <label className="block font-medium mb-1">{t.telephone}</label>
            <input
              type="tel"
              value={noPhone ? t.noPhone : formData.telephone}
              onChange={handlePhoneChange}
              disabled={noPhone}
              required={!noPhone}
              className="input"
              placeholder={phonePrefix ? `${phonePrefix} ...` : t.telPlaceholder}
            />
            <label className="flex items-center mt-2 space-x-2 text-sm">
              <input
                type="checkbox"
                checked={noPhone}
                onChange={(e) => {
                  setNoPhone(e.target.checked);
                  setFormData((prev) => ({
                    ...prev,
                    telephone: e.target.checked ? "Pas de téléphone" : (phonePrefix || ""),
                  }));
                }}
              />
              <span>{t.noPhone}</span>
            </label>
          </div>

          <label className="flex items-center gap-2 text-sm sm:text-base">
            <input type="checkbox" name="is_whatsapp" checked={formData.is_whatsapp} onChange={handleChange} />
            {t.whatsapp}
          </label>

          <label className="text-sm sm:text-base font-semibold">{t.ville}</label>
          <input name="ville" placeholder={t.ville} value={formData.ville} onChange={handleChange} className="input" />

          <label className="text-sm sm:text-base font-semibold">{t.trancheAge}</label>
          <select
            value={formData.age}
            onChange={e => setFormData({ ...formData, age: e.target.value })}
            className="input"
            required
          >
            <option value="">{t.choose}</option>
            {["12-17 ans", "18-25 ans", "26-30 ans", "31-40 ans", "41-55 ans", "56-69 ans", "70 ans et plus"].map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>

          <label className="text-sm sm:text-base font-semibold">{t.commentVenu}</label>
          <select name="venu" value={formData.venu} onChange={handleChange} className="input">
            <option value="">{t.choose}</option>
            <option value="invité">{t.invite}</option>
            <option value="réseaux">{t.reseaux}</option>
            <option value="evangélisation">{t.evangelisation}</option>
            <option value="autre">{t.autre}</option>
          </select>

          <label className="text-sm sm:text-base font-semibold">{t.priereSalut}</label>
          <select
            className="input"
            value={formData.priere_salut || ""}
            required
            onChange={(e) => {
              const value = e.target.value;
              setFormData({
                ...formData,
                priere_salut: value,
                type_conversion: value === "Oui" ? formData.type_conversion : "",
              });
            }}
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
                value={formData.type_conversion || ""}
                onChange={(e) => setFormData({ ...formData, type_conversion: e.target.value })}
                required
              >
                <option value="">{t.choose}</option>
                <option value="Nouveau converti">{t.nouveauConverti}</option>
                <option value="Réconciliation">{t.reconciliation}</option>
              </select>
            </>
          )}

          <label className="text-sm sm:text-base font-bold mb-1">{t.besoinsLabel}</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {besoinsOptions.map((item) => (
              <label key={item.value} className="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  value={item.value}
                  checked={formData.besoin.includes(item.value)}
                  onChange={handleBesoinChange}
                  className="w-4 h-4 sm:w-5 sm:h-5"
                />
                {t[item.key]}
              </label>
            ))}
            <label className="flex items-center gap-1 text-sm">
              <input
                type="checkbox"
                value="Autre"
                checked={showBesoinLibre}
                onChange={handleBesoinChange}
                className="w-4 h-4 sm:w-5 sm:h-5"
              />
              {t.besoinAutre}
            </label>
          </div>

          {showBesoinLibre && (
            <input
              type="text"
              placeholder={t.besoinPrecisez}
              value={formData.besoinLibre}
              onChange={(e) => setFormData({ ...formData, besoinLibre: e.target.value })}
              className="input mb-2"
            />
          )}

          <label className="text-sm sm:text-base font-semibold">{t.infosSupp}</label>
          <textarea
            name="infos_supplementaires"
            placeholder="..."
            value={formData.infos_supplementaires}
            onChange={handleChange}
            className="input"
          />

          <div className="flex gap-4 mt-4">
            <button type="button" onClick={handleCancel} className="flex-1 bg-gray-400 text-white py-3 rounded-xl">
              {t.annuler}
            </button>
            <button type="submit" className="flex-1 bg-blue-500 text-white py-3 rounded-xl">
              {t.ajouter}
            </button>
          </div>
        </form>

        {success && (
          <p className="mt-4 text-center text-green-600 font-semibold">
            {t.successMsg}
          </p>
        )}

        <FooterHub />

        <style jsx>{`
          .input {
            width: 100%;
            border: 1px solid #ccc;
            border-radius: 12px;
            padding: 12px;
          }
        `}</style>
      </div>
    </div>
  );
}
