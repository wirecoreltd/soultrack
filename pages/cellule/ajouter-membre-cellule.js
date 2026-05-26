// pages/cellule/ajouter-membre-cellule.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import supabase from "../../lib/supabaseClient";
import { useMembers } from "../../context/MembersContext";
import { checkLimiteAtteinte } from "../../lib/checkLimite";
import { useLang } from "../../hooks/useLang";
import { getPrefixForPays } from "../../lib/phonePrefix";

const translations = {
  fr: {
    pageTitlePrefix: "Ajouter un membre à ma",
    pageTitleHighlight: "Cellule",
    pageSubtitle1: "Ajoutez",
    pageSubtitle2: "facilement un membre à",
    pageSubtitle3: "votre cellule",
    pageSubtitle4: ". Renseignez ses informations, ses",
    pageSubtitle5: "besoins et son parcours spirituel",
    pageSubtitle6: ", puis associez-le à une cellule pour assurer",
    pageSubtitle7: "un suivi structuré et personnalisé",
    back: "← Retour",
    chooseCellule: "-- Choisir une cellule --",
    prenom: "Prénom",
    nom: "Nom",
    civilite: "-- Civilité --",
    homme: "Homme",
    femme: "Femme",
    trancheAge: "-- Tranche d'âge --",
    telephone: "Téléphone",
    whatsapp: "WhatsApp",
    ville: "Ville",
    commentVenu: "-- Comment est-il venu ? --",
    invite: "Invité",
    reseaux: "Réseaux",
    evangelisation: "Evangélisation",
    autre: "Autre",
    priereSalut: "-- Prière du salut ? --",
    oui: "Oui",
    non: "Non",
    typeConversion: "Type",
    nouveauConverti: "Nouveau converti",
    reconciliation: "Réconciliation",
    besoinsLabel: "Difficultés / Besoins",
    besoinFinances: "Finances",
    besoinSante: "Santé",
    besoinTravail: "Travail / Études",
    besoinFamille: "Famille / Enfants",
    besoinRelations: "Relations / Conflits",
    besoinAddictions: "Addictions / Dépendances",
    besoinGuidance: "Guidance spirituelle",
    besoinLogement: "Logement / Sécurité",
    besoinCommunaute: "Communauté / Isolement",
    besoinDepression: "Dépression / Santé mentale",
    besoinAutre: "Autre",
    besoinPrecisez: "Précisez...",
    infosSupp: "Informations supplémentaires...",
    annuler: "Annuler",
    ajouter: "Ajouter",
    successMsg: "✅ Membre ajouté avec succès",
    errEglise: "❌ Église non identifiée.",
    errLimite: "❌ Limite atteinte : {count}/{limite} membres. Upgradez votre plan.",
    errAjout: "❌ Impossible d'ajouter le membre : ",
    errCellule: "⚠️ Aucune cellule trouvée pour votre église.",
  },
  en: {
    pageTitlePrefix: "Add a member to my",
    pageTitleHighlight: "Cell",
    pageSubtitle1: "Easily add",
    pageSubtitle2: "a member to",
    pageSubtitle3: "your cell",
    pageSubtitle4: ". Fill in their information, their",
    pageSubtitle5: "needs and spiritual journey",
    pageSubtitle6: ", then assign them to a cell to ensure",
    pageSubtitle7: "structured and personalized follow-up",
    back: "← Back",
    chooseCellule: "-- Choose a cell --",
    prenom: "First name",
    nom: "Last name",
    civilite: "-- Title --",
    homme: "Male",
    femme: "Female",
    trancheAge: "-- Age range --",
    telephone: "Phone",
    whatsapp: "WhatsApp",
    ville: "City",
    commentVenu: "-- How did they come? --",
    invite: "Invited",
    reseaux: "Social media",
    evangelisation: "Evangelism",
    autre: "Other",
    priereSalut: "-- Salvation prayer? --",
    oui: "Yes",
    non: "No",
    typeConversion: "Type",
    nouveauConverti: "New convert",
    reconciliation: "Reconciliation",
    besoinsLabel: "Difficulties / Needs",
    besoinFinances: "Finances",
    besoinSante: "Health",
    besoinTravail: "Work / Studies",
    besoinFamille: "Family / Children",
    besoinRelations: "Relationships / Conflicts",
    besoinAddictions: "Addictions / Dependencies",
    besoinGuidance: "Spiritual guidance",
    besoinLogement: "Housing / Safety",
    besoinCommunaute: "Community / Isolation",
    besoinDepression: "Depression / Mental health",
    besoinAutre: "Other",
    besoinPrecisez: "Specify...",
    infosSupp: "Additional information...",
    annuler: "Cancel",
    ajouter: "Add",
    successMsg: "✅ Member added successfully",
    errEglise: "❌ Church not identified.",
    errLimite: "❌ Limit reached: {count}/{limite} members. Please upgrade your plan.",
    errAjout: "❌ Unable to add member: ",
    errCellule: "⚠️ No cell found for your church.",
  },
};

export default function AjouterMembreCellule() {
  return <AjouterMembreCelluleContent />;
}

function AjouterMembreCelluleContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAllMembers } = useMembers();
  const { lang: hookLang } = useLang();

  // ✅ Lire ?lang= depuis l'URL
  const urlLang = searchParams.get("lang");
  const lang = (urlLang === "en" || urlLang === "fr") ? urlLang : hookLang;
  const t = translations[lang] || translations.fr;

  const urlEgliseId = searchParams.get("eglise_id");
  const urlCelluleId = searchParams.get("cellule_id");
  const isFromLink = !!urlEgliseId && !!urlCelluleId;

  const [egliseInfo, setEgliseInfo] = useState(null);
  const [phonePrefix, setPhonePrefix] = useState("");
  const [showBesoinLibre, setShowBesoinLibre] = useState(false);
  const [cellules, setCellules] = useState([]);
  const [success, setSuccess] = useState(false);
  const [userScope, setUserScope] = useState({ eglise_id: null });

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
    cellule_id: urlCelluleId || "",
    infos_supplementaires: "",
    date_venu: new Date().toISOString().slice(0, 10),
    is_whatsapp: false,
  });

  const besoinsOptions = [
    { key: "besoinFinances",   value: "Finances" },
    { key: "besoinSante",      value: "Santé" },
    { key: "besoinTravail",    value: "Travail / Études" },
    { key: "besoinFamille",    value: "Famille / Enfants" },
    { key: "besoinRelations",  value: "Relations / Conflits" },
    { key: "besoinAddictions", value: "Addictions / Dépendances" },
    { key: "besoinGuidance",   value: "Guidance spirituelle" },
    { key: "besoinLogement",   value: "Logement / Sécurité" },
    { key: "besoinCommunaute", value: "Communauté / Isolement" },
    { key: "besoinDepression", value: "Dépression / Santé mentale" },
  ];

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
        .from("profiles").select("eglise_id").eq("id", user.id).single();
      if (!error && profile) setUserScope({ eglise_id: profile.eglise_id });
    };
    fetchUserScope();
  }, [urlEgliseId]);

  // ✅ Fetch infos église + préfixe téléphonique automatique
  useEffect(() => {
    if (!userScope.eglise_id) return;
    const fetchEglise = async () => {
      const { data, error } = await supabase
        .from("eglises")
        .select("nom, branche, ville, pays, logo_url")
        .eq("id", userScope.eglise_id)
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
  }, [userScope.eglise_id]);

  useEffect(() => {
    if (!userScope.eglise_id || isFromLink) return;
    const fetchCellules = async () => {
      const userId = localStorage.getItem("userId");
      const { data, error } = await supabase
        .from("cellules").select("id, ville, cellule")
        .eq("responsable_id", userId).eq("eglise_id", userScope.eglise_id);
      if (error || !data || data.length === 0) { alert(t.errCellule); return; }
      setCellules(data);
      if (data.length === 1) setFormData(prev => ({ ...prev, cellule_id: data[0].id }));
    };
    fetchCellules();
  }, [userScope, isFromLink]);

  const handleBesoinChange = (e) => {
    const { value, checked } = e.target;
    if (value === "Autre") {
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  // ✅ Téléphone avec préfixe protégé
  const handlePhoneChange = (e) => {
    const val = e.target.value;
    if (phonePrefix && !val.startsWith(phonePrefix)) {
      setFormData(prev => ({ ...prev, telephone: phonePrefix }));
      return;
    }
    setFormData(prev => ({ ...prev, telephone: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const celluleIdFinal = urlCelluleId || formData.cellule_id;
    if (!userScope.eglise_id) { alert(t.errEglise); return; }
    try {
      const { atteinte, count, limite } = await checkLimiteAtteinte(userScope.eglise_id);
      if (atteinte) {
        alert(t.errLimite.replace("{count}", count).replace("{limite}", limite));
        return;
      }
      const newMemberData = {
        nom: formData.nom,
        prenom: formData.prenom,
        telephone: formData.telephone,
        ville: formData.ville,
        venu: formData.venu,
        cellule_id: celluleIdFinal,
        eglise_id: userScope.eglise_id,
        statut_suivis: 3,
        etat_contact: "existant",
        is_new_in_cellule: "true",
        is_whatsapp: formData.is_whatsapp,
        infos_supplementaires: formData.infos_supplementaires,
        besoin: formData.besoin.join(", "),
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
        .from("membres_complets").insert([newMemberData]).select().single();
      if (error) throw error;
      setAllMembers(prev => [...prev, newMember]);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      setFormData({
        nom: "", prenom: "", sexe: "", age: "",
        telephone: phonePrefix || "", ville: "", venu: "",
        priere_salut: "", type_conversion: "",
        date_venu: new Date().toISOString().slice(0, 10),
        besoin: [], autreBesoin: "",
        cellule_id: urlCelluleId || (cellules.length === 1 ? cellules[0].id : ""),
        infos_supplementaires: "",
        is_whatsapp: false,
      });
    } catch (err) {
      alert(t.errAjout + err.message);
    }
  };

  const handleCancel = () => {
    setFormData({
      nom: "", prenom: "", sexe: "", telephone: phonePrefix || "",
      ville: "", age: "", venu: "", priere_salut: "", type_conversion: "",
      date_venu: new Date().toISOString().slice(0, 10),
      besoin: [], autreBesoin: "",
      cellule_id: urlCelluleId || (cellules.length === 1 ? cellules[0].id : ""),
      infos_supplementaires: "",
      is_whatsapp: false,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-200 via-pink-100 to-yellow-100 p-6">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-lg relative">

        <button onClick={() => router.back()} className="absolute top-4 left-4 font-semibold">
          {t.back}
        </button>

        {/* Logo + infos église */}
        <div className="flex flex-col items-center mb-3 sm:mb-6 gap-2">
          {egliseInfo?.logo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={egliseInfo.logo_url} alt={egliseInfo.nom || "Logo"}
              style={{ width: 50, height: 50, objectFit: "contain" }} />
          )}
          {egliseInfo && (
            <div className="text-center leading-snug mt-1">
              <p className="font-bold text-lg text-[#c31850]">{egliseInfo.nom}</p>
              {egliseInfo.branche && <p className="text-sm text-[#c31850]">{egliseInfo.branche}</p>}
              <p className="text-sm text-[#c31850]">{[egliseInfo.ville, egliseInfo.pays].filter(Boolean).join(", ")}</p>
            </div>
          )}
        </div>

        {/* ✅ Titre corrigé */}
        <h1 className="text-2xl font-bold mt-4 mb-6 text-center text-black">
          {t.pageTitlePrefix} <span className="text-[#333699]">{t.pageTitleHighlight}</span>
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

          {!isFromLink && cellules.length > 1 && (
            <select name="cellule_id" value={formData.cellule_id}
              onChange={handleChange} className="input" required>
              <option value="">{t.chooseCellule}</option>
              {cellules.map(c => (
                <option key={c.id} value={c.id}>{c.ville} - {c.cellule}</option>
              ))}
            </select>
          )}

          <input type="date" value={formData.date_venu}
            onChange={e => setFormData({ ...formData, date_venu: e.target.value })}
            className="input" required />

          <input name="prenom" placeholder={t.prenom} value={formData.prenom}
            onChange={handleChange} className="input" required />
          <input name="nom" placeholder={t.nom} value={formData.nom}
            onChange={handleChange} className="input" required />

          <select className="input" value={formData.sexe}
            onChange={e => setFormData({ ...formData, sexe: e.target.value })} required>
            <option value="">{t.civilite}</option>
            <option value="Homme">{t.homme}</option>
            <option value="Femme">{t.femme}</option>
          </select>

          <select value={formData.age}
            onChange={e => setFormData({ ...formData, age: e.target.value })}
            className="input" required>
            <option value="">{t.trancheAge}</option>
            {["12-17 ans", "18-25 ans", "26-30 ans", "31-40 ans", "41-55 ans", "56-69 ans", "70 ans et plus"].map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>

          {/* ✅ Téléphone avec préfixe automatique */}
          <input
            placeholder={phonePrefix ? `${phonePrefix} ...` : t.telephone}
            value={formData.telephone}
            onChange={handlePhoneChange}
            className="input"
          />
          <label className="flex items-center gap-2">
            <input type="checkbox" name="is_whatsapp" checked={formData.is_whatsapp} onChange={handleChange} />
            {t.whatsapp}
          </label>

          <input name="ville" placeholder={t.ville} value={formData.ville}
            onChange={handleChange} className="input" />

          <select name="venu" value={formData.venu} onChange={handleChange} className="input">
            <option value="">{t.commentVenu}</option>
            <option value="invité">{t.invite}</option>
            <option value="réseaux">{t.reseaux}</option>
            <option value="evangélisation">{t.evangelisation}</option>
            <option value="autre">{t.autre}</option>
          </select>

          <select className="input" value={formData.priere_salut || ""} required
            onChange={e => {
              const value = e.target.value;
              setFormData({ ...formData, priere_salut: value,
                type_conversion: value === "Oui" ? formData.type_conversion : "" });
            }}>
            <option value="">{t.priereSalut}</option>
            <option value="Oui">{t.oui}</option>
            <option value="Non">{t.non}</option>
          </select>

          {formData.priere_salut === "Oui" && (
            <select className="input" value={formData.type_conversion || ""}
              onChange={e => setFormData({ ...formData, type_conversion: e.target.value })} required>
              <option value="">{t.typeConversion}</option>
              <option value="Nouveau converti">{t.nouveauConverti}</option>
              <option value="Réconciliation">{t.reconciliation}</option>
            </select>
          )}

          <label className="text-sm sm:text-base font-bold mb-1">{t.besoinsLabel}</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {besoinsOptions.map(item => (
              <label key={item.value} className="flex items-center gap-1 text-sm">
                <input type="checkbox" value={item.value}
                  checked={formData.besoin.includes(item.value)}
                  onChange={handleBesoinChange} className="w-4 h-4 sm:w-5 sm:h-5" />
                {t[item.key]}
              </label>
            ))}
            <label className="flex items-center gap-1 text-sm">
              <input type="checkbox" value="Autre" checked={showBesoinLibre}
                onChange={handleBesoinChange} className="w-4 h-4 sm:w-5 sm:h-5" />
              {t.besoinAutre}
            </label>
          </div>

          {showBesoinLibre && (
            <input type="text" placeholder={t.besoinPrecisez}
              value={formData.besoinLibre}
              onChange={e => setFormData({ ...formData, besoinLibre: e.target.value })}
              className="input mb-2" />
          )}

          <textarea name="infos_supplementaires" placeholder={t.infosSupp}
            value={formData.infos_supplementaires} onChange={handleChange} className="input" />

          <div className="flex gap-4 mt-4">
            <button type="button" onClick={handleCancel}
              className="flex-1 bg-gray-400 text-white py-3 rounded-xl">{t.annuler}</button>
            <button type="submit"
              className="flex-1 bg-blue-500 text-white py-3 rounded-xl">{t.ajouter}</button>
          </div>
        </form>

        {success && (
          <p className="mt-4 text-center text-green-600 font-semibold">{t.successMsg}</p>
        )}

        <style jsx>{`
          .input { width: 100%; border: 1px solid #ccc; border-radius: 12px; padding: 12px; }
        `}</style>
      </div>
    </div>
  );
}
