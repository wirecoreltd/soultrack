"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import supabase from "../lib/supabaseClient";
import { checkLimiteAtteinte } from "../lib/checkLimite";
import { useLang } from "../hooks/useLang";
import { getPrefixForPays } from "../lib/phonePrefix";

const translations = {
  fr: {
    pageTitle: "Ajouter un nouveau membre",
    subtitle: "« Allez, faites de toutes les nations des disciples » – Matthieu 28:19",
    retour: "← Retour",
    dateVenue: "Date de venue",
    etatContact: "État du contact",
    etatNouveau: "Nouveau",
    etatExistant: "Existant",
    prenom: "Prénom",
    nom: "Nom",
    telephone: "Téléphone",
    isWhatsapp: "Numéro WhatsApp",
    ville: "Ville",
    civilite: "Civilité",
    choisir: "-- Choisir --",
    homme: "Homme",
    femme: "Femme",
    age: "Âge",
    age1: "12-17 ans",
    age2: "18-25 ans",
    age3: "26-30 ans",
    age4: "31-40 ans",
    age5: "41-55 ans",
    age6: "56-69 ans",
    age7: "70 ans et plus",
    raisonVenue: "Raison de la venue",
    statut1: "Veut rejoindre l'église",
    statut2: "A déjà son église",
    statut3: "Nouveau",
    statut4: "Visiteur",
    commentVenu: "Comment est-il venu ?",
    venu1: "Invité",
    venu2: "Réseaux",
    venu3: "Évangélisation",
    venu4: "Autre",
    priereSalut: "Prière du salut",
    oui: "Oui",
    non: "Non",
    typeConversion: "Type de conversion",
    convNouveau: "Nouveau converti",
    convReconciliation: "Réconciliation",
    besoins: "Difficultés / Besoins",
    besoinAutre: "Autre",
    besoinPrecisez: "Précisez...",
    infosSupp: "Informations supplémentaires",
    annuler: "Annuler",
    ajouter: "Ajouter",
    successMsg: "✅ Contact ajouté avec succès !",
    errEglise: "❌ Erreur : église non identifiée.",
    errLimite: (count, limite) => `❌ Limite atteinte : ${count}/${limite} membres. Upgradez votre plan.`,
  },
  en: {
    pageTitle: "Add a new member",
    subtitle: "\"Go and make disciples of all nations\" – Matthew 28:19",
    retour: "← Back",
    dateVenue: "Visit date",
    etatContact: "Contact status",
    etatNouveau: "New",
    etatExistant: "Existing",
    prenom: "First name",
    nom: "Last name",
    telephone: "Phone",
    isWhatsapp: "WhatsApp number",
    ville: "City",
    civilite: "Gender",
    choisir: "-- Choose --",
    homme: "Male",
    femme: "Female",
    age: "Age",
    age1: "12-17 years",
    age2: "18-25 years",
    age3: "26-30 years",
    age4: "31-40 years",
    age5: "41-55 years",
    age6: "56-69 years",
    age7: "70 years and over",
    raisonVenue: "Reason for visit",
    statut1: "Wants to join the church",
    statut2: "Already has a church",
    statut3: "New",
    statut4: "Visitor",
    commentVenu: "How did they come?",
    venu1: "Invited",
    venu2: "Social media",
    venu3: "Evangelism",
    venu4: "Other",
    priereSalut: "Salvation prayer",
    oui: "Yes",
    non: "No",
    typeConversion: "Conversion type",
    convNouveau: "New convert",
    convReconciliation: "Reconciliation",
    besoins: "Difficulties / Needs",
    besoinAutre: "Other",
    besoinPrecisez: "Please specify...",
    infosSupp: "Additional information",
    annuler: "Cancel",
    ajouter: "Add",
    successMsg: "✅ Contact added successfully!",
    errEglise: "❌ Error: church not identified.",
    errLimite: (count, limite) => `❌ Limit reached: ${count}/${limite} members. Please upgrade your plan.`,
  },
};

export default function AddContact() {
  const router = useRouter();
  const { lang } = useLang();
  const t = translations[lang];
  const [phonePrefix, setPhonePrefix] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [etatContact, setEtatContact] = useState("nouveau");
  const [formData, setFormData] = useState({
    prenom: "",
    nom: "",
    telephone: phonePrefix || "",
    is_whatsapp: false,
    ville: "",
    sexe: "",
    age: "",
    statut: "",
    date_venu: new Date().toISOString().slice(0, 10),
    venu: "",
    priere_salut: "",
    type_conversion: "",
    besoin: [],
    besoinLibre: "",
    infos_supplementaires: "",
    eglise_id: "",
  });
  const [showBesoinLibre, setShowBesoinLibre] = useState(false);
  const [success, setSuccess] = useState(false);
  const [egliseInfo, setEgliseInfo] = useState(null);

  const besoinsOptions = [
    "Finances", "Santé", "Travail / Études", "Famille / Enfants",
    "Relations / Conflits", "Addictions / Dépendances", "Miracle", "Délivrance",
    "Guidance spirituelle", "Logement / Sécurité", "Communauté / Isolement",
    "Dépression / Santé mentale",
  ];

  useEffect(() => {
    const fetchUserEglise = async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) return;

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("eglise_id")
        .eq("id", session.session.user.id)
        .single();

      if (!error && profile) {
        setFormData(prev => ({ ...prev, eglise_id: profile.eglise_id }));
      }
    };

    fetchUserEglise();
  }, []);

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

  const handleCancel = () => router.back();

  // ✅ Téléphone avec préfixe modifiable
  const handlePhoneChange = (e) => {
  const val = e.target.value;

  setFormData(prev => ({
    ...prev,
    telephone: val,
  }));
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    console.log("eglise_id au submit:", formData.eglise_id);

    if (!formData.eglise_id) {
      setErrorMsg(t.errEglise);
      return;
    }

    try {
      const { atteinte, count, limite } = await checkLimiteAtteinte(formData.eglise_id);
      if (atteinte) {
        setErrorMsg(t.errLimite(count, limite));
        return;
      }

      const finalBesoin = showBesoinLibre && formData.besoinLibre
        ? [...formData.besoin.filter((b) => b !== "Autre"), formData.besoinLibre]
        : formData.besoin;

      const dataToSend = {
        ...formData,
        etat_contact: etatContact,
        besoin: finalBesoin,
      };
      delete dataToSend.besoinLibre;

      const { error } = await supabase.from("membres_complets").insert([dataToSend]);
      if (error) throw error;

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);

      setFormData({
        prenom: "", nom: "", telephone: phonePrefix || "", is_whatsapp: false,
        ville: "", sexe: "", age: "", statut: "",
        date_venu: new Date().toISOString().slice(0, 10),
        venu: "", priere_salut: "", type_conversion: "",
        besoin: [], besoinLibre: "", infos_supplementaires: "",
        eglise_id: formData.eglise_id,
      });
      setShowBesoinLibre(false);

    } catch (err) {
      setErrorMsg("❌ " + err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-200 via-pink-100 to-yellow-100 p-4 sm:p-6">
      <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-3xl shadow-lg relative">
        <button
          onClick={() => router.back()}
          className="absolute top-3 left-3 sm:top-4 sm:left-4 flex items-center text-black font-semibold hover:text-gray-800 transition-colors"
        >
          {t.retour}
        </button>

        {/* ─── Logo + infos de l'église ─── */}
          <div className="flex flex-col items-center mb-3 sm:mb-6 gap-2">
            {egliseInfo?.logo_url && (
              <img
                src={egliseInfo.logo_url}
                alt={egliseInfo.nom || "Logo église"}
                className="w-12 h-12 object-contain"
              />
            )}
          
            {(egliseInfo?.denomination || egliseInfo?.nom) && (
              <p className="font-semibold text-lg text-[#c31850]">
                {[egliseInfo.denomination, egliseInfo.nom].filter(Boolean).join(" - ")}
              </p>
            )}
          
            {egliseInfo?.branche && (
              <p className="text-sm text-[#c31850]">{egliseInfo.branche}</p>
            )}
          
            {egliseInfo?.ville && (
              <p className="text-sm text-amber-500">{egliseInfo.ville}</p>
            )}
          
            {egliseInfo?.pays && (
              <p className="text-sm text-gray-700 flex items-center gap-1">
                <img
                  src={`https://flagcdn.com/w20/${getIsoCode(egliseInfo.pays)}.png`}
                  width="20"
                  height="14"
                  alt={egliseInfo.pays}
                />
                {egliseInfo.pays}
              </p>
            )}
          </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-2">{t.pageTitle}</h1>
        <p className="text-center text-gray-500 italic mb-4 sm:mb-6 text-sm sm:text-base">
          {t.subtitle}
        </p>

        {/* Date de venue */}
        <label className="text-sm sm:text-base font-semibold mb-1">{t.dateVenue}</label>
        <input
          type="date"
          value={formData.date_venu}
          onChange={e => setFormData({ ...formData, date_venu: e.target.value })}
          className="input"
          required
        />

        {/* État du contact */}
        <label className="text-sm sm:text-base font-semibold mb-1">{t.etatContact}</label>
        <select
          value={etatContact}
          onChange={(e) => setEtatContact(e.target.value)}
          className="input mb-3"
        >
          <option value="nouveau">{t.etatNouveau}</option>
          <option value="existant">{t.etatExistant}</option>
        </select>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:gap-4">
          {/* Prénom */}
          <div className="flex flex-col">
            <label className="text-sm sm:text-base font-bold mb-1">{t.prenom}</label>
            <input
              type="text"
              value={formData.prenom}
              onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
              className="input"
              required
            />
          </div>

          {/* Nom */}
          <div className="flex flex-col">
            <label className="text-sm sm:text-base font-bold mb-1">{t.nom}</label>
            <input
              type="text"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              className="input"
              required
            />
          </div>

          {/* Téléphone */}
          <div className="flex flex-col">
            <label className="text-sm sm:text-base font-bold mb-1">{t.telephone}</label>
            <input
              type="tel"
              value={formData.telephone}
              onChange={handlePhoneChange}
              className="input"
              placeholder={phonePrefix ? `${phonePrefix} ...` : t.telephone}
            />
          </div>

          {/* WhatsApp */}
          <label className="flex items-center gap-2 text-sm sm:text-base font-bold mb-1">
            <input
              type="checkbox"
              checked={formData.is_whatsapp}
              onChange={(e) => setFormData({ ...formData, is_whatsapp: e.target.checked })}
              className="w-4 h-4 sm:w-5 sm:h-5"
            />
            {t.isWhatsapp}
          </label>

          {/* Ville */}
          <div className="flex flex-col">
            <label className="text-sm sm:text-base font-bold mb-1">{t.ville}</label>
            <input
              type="text"
              value={formData.ville}
              onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
              className="input"
            />
          </div>

          {/* Sexe */}
          <div className="flex flex-col">
            <label className="text-sm sm:text-base font-bold mb-1">{t.civilite}</label>
            <select
              value={formData.sexe}
              onChange={(e) => setFormData({ ...formData, sexe: e.target.value })}
              className="input"
              required
            >
              <option value="">{t.choisir}</option>
              <option value="Homme">{t.homme}</option>
              <option value="Femme">{t.femme}</option>
            </select>
          </div>

          {/* Âge */}
          <label className="text-sm sm:text-base font-semibold">{t.age}</label>
          <select
            value={formData.age}
            onChange={e => setFormData({ ...formData, age: e.target.value })}
            className="input"
            required
          >
            <option value="">{t.choisir}</option>
            <option value="12-17 ans">{t.age1}</option>
            <option value="18-25 ans">{t.age2}</option>
            <option value="26-30 ans">{t.age3}</option>
            <option value="31-40 ans">{t.age4}</option>
            <option value="41-55 ans">{t.age5}</option>
            <option value="56-69 ans">{t.age6}</option>
            <option value="70 ans et plus">{t.age7}</option>
          </select>

          {/* Raison de la venue */}
          <div className="flex flex-col">
            <label className="text-sm sm:text-base font-bold mb-1">{t.raisonVenue}</label>
            <select
              value={formData.statut}
              onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
              className="input"
              required
            >
              <option value="">{t.choisir}</option>
              <option value="veut rejoindre l'église">{t.statut1}</option>
              <option value="a déjà son église">{t.statut2}</option>
              <option value="nouveau">{t.statut3}</option>
              <option value="visiteur">{t.statut4}</option>
            </select>
          </div>

          {/* Comment est-il venu */}
          <div className="flex flex-col">
            <label className="text-sm sm:text-base font-bold mb-1">{t.commentVenu}</label>
            <select
              value={formData.venu}
              onChange={(e) => setFormData({ ...formData, venu: e.target.value })}
              className="input"
              required
            >
              <option value="">{t.choisir}</option>
              <option value="invité">{t.venu1}</option>
              <option value="réseaux">{t.venu2}</option>
              <option value="evangélisation">{t.venu3}</option>
              <option value="autre">{t.venu4}</option>
            </select>
          </div>

          {/* Prière du salut */}
          <div className="flex flex-col">
            <label className="text-sm sm:text-base font-bold mb-1">{t.priereSalut}</label>
            <select
              value={formData.priere_salut}
              onChange={(e) => {
                const value = e.target.value;
                setFormData({
                  ...formData,
                  priere_salut: value,
                  type_conversion: value === "Oui" ? formData.type_conversion : "",
                });
              }}
              className="input"
              required
            >
              <option value="">{t.choisir}</option>
              <option value="Oui">{t.oui}</option>
              <option value="Non">{t.non}</option>
            </select>
          </div>

          {/* Type de conversion */}
          {formData.priere_salut === "Oui" && (
            <div className="flex flex-col">
              <label className="text-sm sm:text-base font-bold mb-1">{t.typeConversion}</label>
              <select
                value={formData.type_conversion}
                onChange={(e) => setFormData({ ...formData, type_conversion: e.target.value })}
                className="input"
                required
              >
                <option value="">{t.choisir}</option>
                <option value="Nouveau converti">{t.convNouveau}</option>
                <option value="Réconciliation">{t.convReconciliation}</option>
              </select>
            </div>
          )}

          {/* Besoins */}
          <label className="text-sm sm:text-base font-bold mb-1">{t.besoins}</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {besoinsOptions.map((item) => (
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

          {/* Informations supplémentaires */}
          <div className="flex flex-col">
            <label className="text-sm sm:text-base font-bold mb-1">{t.infosSupp}</label>
            <textarea
              rows={2}
              value={formData.infos_supplementaires}
              onChange={(e) => setFormData({ ...formData, infos_supplementaires: e.target.value })}
              className="input"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-2">
            {errorMsg && (
              <p className="text-red-600 text-sm font-semibold text-center">{errorMsg}</p>
            )}
            <button
              type="button"
              onClick={handleCancel}
              className="w-full bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 rounded-2xl shadow-md transition-all"
            >
              {t.annuler}
            </button>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600 text-white font-bold py-3 rounded-2xl shadow-md transition-all"
            >
              {t.ajouter}
            </button>
          </div>

          {success && (
            <p className="text-green-600 font-semibold text-center mt-4 animate-pulse">
              {t.successMsg}
            </p>
          )}
        </form>

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
