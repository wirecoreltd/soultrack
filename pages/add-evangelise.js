"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import supabase from "../lib/supabaseClient";
import { useLang } from "../hooks/useLang";

const translations = {
  fr: {
    loading: "Chargement...",
    noEglise: "Votre compte n'est pas rattaché à une église.",
    title: "Ajouter une personne évangélisée",
    typeEvang: "Type d'Évangélisation",
    typeEvangOptions: [
      { value: "Individuel", label: "Individuel" },
      { value: "Sortie de groupe", label: "Sortie de groupe" },
      { value: "Campagne d'évangélisation", label: "Campagne d'évangélisation" },
      { value: "Évangélisation de rue", label: "Évangélisation de rue" },
      { value: "Évangélisation maison", label: "Évangélisation maison" },
      { value: "Évangélisation stade", label: "Évangélisation stade" },
    ],
    civility: "Civilité",
    homme: "Homme",
    femme: "Femme",
    prenom: "Prénom",
    nom: "Nom",
    age: "-- Tranche d'âge --",
    ageOptions: [
      "12-17 ans", "18-25 ans", "26-30 ans", "31-40 ans",
      "41-55 ans", "56-69 ans", "70 ans et plus",
    ],
    telephone: "Téléphone",
    ville: "Ville",
    whatsapp: "WhatsApp",
    prayerSalvation: "-- Prière du salut ? --",
    oui: "Oui",
    non: "Non",
    typeConversion: "Type",
    conversionOptions: [
      { value: "Nouveau converti", label: "Nouveau converti" },
      { value: "Réconciliation", label: "Réconciliation" },
    ],
    needs: "Difficultés / Besoins :",
    needsOptions: [
      "Finances", "Santé", "Travail / Études", "Famille / Enfants",
      "Relations / Conflits", "Miracle", "Délivrance",
      "Addictions / Dépendances", "Guidance spirituelle", "Logement / Sécurité",
      "Communauté / Isolement", "Dépression / Santé mentale",
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
    typeEvang: "Type of Outreach",
    typeEvangOptions: [
      { value: "Individuel", label: "Individual" },
      { value: "Sortie de groupe", label: "Group outing" },
      { value: "Campagne d'évangélisation", label: "Evangelism campaign" },
      { value: "Évangélisation de rue", label: "Street evangelism" },
      { value: "Évangélisation maison", label: "House evangelism" },
      { value: "Évangélisation stade", label: "Stadium evangelism" },
    ],
    civility: "Title",
    homme: "Male",
    femme: "Female",
    prenom: "First name",
    nom: "Last name",
    age: "-- Age range --",
    ageOptions: [
      "12-17 yrs", "18-25 yrs", "26-30 yrs", "31-40 yrs",
      "41-55 yrs", "56-69 yrs", "70 yrs and over",
    ],
    telephone: "Phone",
    ville: "City",
    whatsapp: "WhatsApp",
    prayerSalvation: "-- Salvation prayer? --",
    oui: "Yes",
    non: "No",
    typeConversion: "Type",
    conversionOptions: [
      { value: "Nouveau converti", label: "New convert" },
      { value: "Réconciliation", label: "Reconciliation" },
    ],
    needs: "Difficulties / Needs:",
    needsOptions: [
      "Finances", "Health", "Work / Studies", "Family / Children",
      "Relationships / Conflicts", "Miracle", "Deliverance",
      "Addictions / Dependencies", "Spiritual guidance", "Housing / Safety",
      "Community / Isolation", "Depression / Mental health",
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

export default function AddEvangelise({ onNewEvangelise }) {
  const router = useRouter();

  const urlEgliseId = router.query.eglise_id || null;
  const urlCelluleId = router.query.cellule_id || null;
  const urlFamilleId = router.query.famille_id || null;
  const isFromLink = !!urlEgliseId;

  // ✅ Langue : priorité au paramètre URL ?lang=, sinon useLang()
  const { lang: hookLang } = useLang();
  const urlLang = router.query.lang;
  const lang = (urlLang === "en" || urlLang === "fr") ? urlLang : hookLang;
  const t = translations[lang] || translations.fr;

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

  useEffect(() => { 
    const fetchEglise = async () => { 
      if (!urlEgliseId) return; setFormData(prev => ({ ...prev, eglise_id: urlEgliseId })); 
      const { data, error } = await supabase 
        .from("eglises") .select(` id, nom, denomination, ville, pays, branche, logo_url `) 
        .eq("id", urlEgliseId) 
        .single(); 
      if (!error && data) { setEglise(data); } }; fetchEglise(); }, [urlEgliseId]);

  useEffect(() => {
    if (isFromLink) return;

    const fetchUserEglise = async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) return;

      const { data: profile, error } = await supabase 
        .from("profiles") 
        .select(` eglise_id, eglises ( id, nom, denomination, ville, pays, branche, logo_url ) `) 
        .eq("id", session.session.user.id) 
        .single(); 
      if (!error && profile) { setFormData(prev => ({ ...prev, eglise_id: profile.eglise_id })); setEglise(profile.eglises); }
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

  const resetForm = () => {
    setFormData(prev => ({
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
      eglise_id: prev.eglise_id,
      type_evangelisation: "",
      date_evangelise: new Date().toISOString().split("T")[0],
    }));
    setShowOtherField(false);
    setOtherBesoin("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.eglise_id) {
      alert(t.noEglise);
      return;
    }

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

      const { data: evangelise, error } = await supabase
        .from("evangelises")
        .insert([finalData])
        .select()
        .single();

      if (error) throw error;

      if (urlCelluleId) {
        const suiviData = {
          prenom: evangelise.prenom,
          nom: evangelise.nom,
          telephone: evangelise.telephone,
          is_whatsapp: evangelise.is_whatsapp,
          ville: evangelise.ville,
          besoin: evangelise.besoin,
          infos_supplementaires: evangelise.infos_supplementaires,
          sexe: evangelise.sexe,
          age: evangelise.age,
          type_conversion: evangelise.type_conversion,
          priere_salut: evangelise.priere_salut,
          status_suivis_evangelises: "Envoyé",
          evangelise_id: evangelise.id,
          cellule_id: urlCelluleId,
          famille_id: null,
          conseiller_id: null,
          date_evangelise: evangelise.date_evangelise,
          date_suivi: new Date().toISOString(),
          eglise_id: evangelise.eglise_id,
          type_evangelisation: evangelise.type_evangelisation,
        };

        const { error: suiviError } = await supabase
          .from("suivis_des_evangelises")
          .insert([suiviData]);

        if (suiviError) console.error("Erreur insertion suivis_des_evangelises (cellule) :", suiviError);
      }

      if (urlFamilleId) {
        const suiviData = {
          prenom: evangelise.prenom,
          nom: evangelise.nom,
          telephone: evangelise.telephone,
          is_whatsapp: evangelise.is_whatsapp,
          ville: evangelise.ville,
          besoin: evangelise.besoin,
          infos_supplementaires: evangelise.infos_supplementaires,
          sexe: evangelise.sexe,
          age: evangelise.age,
          type_conversion: evangelise.type_conversion,
          priere_salut: evangelise.priere_salut,
          status_suivis_evangelises: "Envoyé",
          evangelise_id: evangelise.id,
          cellule_id: null,
          famille_id: urlFamilleId,
          conseiller_id: null,
          date_evangelise: evangelise.date_evangelise,
          date_suivi: new Date().toISOString(),
          eglise_id: evangelise.eglise_id,
          type_evangelisation: evangelise.type_evangelisation,
        };

        const { error: suiviError } = await supabase
          .from("suivis_des_evangelises")
          .insert([suiviData]);

        if (suiviError) console.error("Erreur insertion suivis_des_evangelises (famille) :", suiviError);
      }

      setSuccess(true);
      resetForm();
      if (onNewEvangelise) onNewEvangelise(evangelise);
      setTimeout(() => setSuccess(false), 3000);

    } catch (err) {
      console.error("Erreur globale :", err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-200 via-pink-100 to-yellow-100 p-6">
      {/* ─── Logo + infos de l'église ─── */}
        <div className="flex flex-col items-center mb-3 sm:mb-6 gap-2">
          {egliseInfo?.logo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={egliseInfo.logo_url}
              alt={egliseInfo.nom || "Logo église"}
              style={{
                width: 50,
                height: 50,
                objectFit: "contain",                
              }}
            />
          )}

          {egliseInfo && (
            <div className="text-center leading-snug mt-1">
              <p className="font-bold text-lg text-[#c31850]">{egliseInfo.nom}</p>
              {egliseInfo.branche && (
                <p className="text-sm text-[#c31850]">{egliseInfo.branche}</p>
              )}
              <p className="text-sm text-[#c31850]">
                {[egliseInfo.ville, egliseInfo.pays].filter(Boolean).join(", ")}
              </p>
            </div>
          )}
        </div>  
          </div> 

        <h1 className="text-3xl font-bold text-center mb-2">{t.title}</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 justify-center">

          {/* Date */}
          <div className="flex justify-center w-full">
            <input
              type="date"
              className="input w-auto text-center"
              value={formData.date_evangelise}
              onChange={e => setFormData({ ...formData, date_evangelise: e.target.value })}
            />
          </div>

          {/* Type Évangélisation */}
          <select
            className="input text-center"
            value={formData.type_evangelisation}
            onChange={e => setFormData({ ...formData, type_evangelisation: e.target.value })}
            required
          >
            <option value="">{t.typeEvang}</option>
            {t.typeEvangOptions.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {/* Civilité */}
          <select
            className="input"
            value={formData.sexe}
            onChange={e => setFormData({ ...formData, sexe: e.target.value })}
            required
          >
            <option value="">{t.civility}</option>
            <option value="Homme">{t.homme}</option>
            <option value="Femme">{t.femme}</option>
          </select>

          {/* Prénom / Nom */}
          <input className="input" type="text" placeholder={t.prenom} value={formData.prenom}
            onChange={e => setFormData({ ...formData, prenom: e.target.value })} required />
          <input className="input" type="text" placeholder={t.nom} value={formData.nom}
            onChange={e => setFormData({ ...formData, nom: e.target.value })} required />

          {/* Âge */}
          <select value={formData.age} onChange={e => setFormData({ ...formData, age: e.target.value })} className="input">
            <option value="">{t.age}</option>
            {t.ageOptions.map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>

          {/* Téléphone / Ville */}
          <input className="input" type="text" placeholder={t.telephone} value={formData.telephone}
            onChange={e => setFormData({ ...formData, telephone: e.target.value })} />
          <input className="input" type="text" placeholder={t.ville} value={formData.ville}
            onChange={e => setFormData({ ...formData, ville: e.target.value })} />

          {/* WhatsApp */}
          <label className="flex items-center gap-2 text-gray-700">
            <input type="checkbox" checked={formData.is_whatsapp}
              onChange={e => setFormData({ ...formData, is_whatsapp: e.target.checked })}
              className="w-5 h-5 accent-indigo-600 cursor-pointer" />
            {t.whatsapp}
          </label>

          {/* Prière du salut */}
          <select className="input" value={formData.priere_salut} required
            onChange={e => setFormData({
              ...formData,
              priere_salut: e.target.value,
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
              {t.conversionOptions.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          )}

          {/* Besoins */}
          <div className="mt-4">
            <p className="font-semibold mb-2">{t.needs}</p>
            {t.needsOptions.map((b, i) => (
              <label key={b} className="flex items-center gap-3 mb-2">
                <input
                  type="checkbox"
                  value={b}
                  checked={formData.besoin.includes(b)}
                  onChange={() => handleBesoinChange(b)}
                  className="w-5 h-5 rounded border-gray-400 cursor-pointer accent-indigo-600"
                />
                <span>{b}</span>
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
          <p ref={successRef} className="text-green-600 font-semibold text-center mt-3">
            {t.success}
          </p>
        )}

        <style jsx>{`.input { width: 100%; padding: 12px; border-radius: 12px; border: 1px solid #ccc; }`}</style>
      </div>
    </div>
  );
}
