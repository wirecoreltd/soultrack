"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import supabase from "../lib/supabaseClient";

export default function AddEvangelise({ onNewEvangelise }) {
  const router = useRouter();

  // ✅ Lire eglise_id, cellule_id et famille_id depuis l'URL
  const urlEgliseId = router.query.eglise_id || null;
  const urlCelluleId = router.query.cellule_id || null;
  const urlFamilleId = router.query.famille_id || null;
  const isFromLink = !!urlEgliseId && (!!urlCelluleId || !!urlFamilleId);

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

  const besoinsList = [
    "Finances", "Santé", "Travail / Études", "Famille / Enfants",
    "Relations / Conflits", "Miracle", "Délivrance",
    "Addictions / Dépendances", "Guidance spirituelle", "Logement / Sécurité",
    "Communauté / Isolement", "Dépression / Santé mentale"
  ];

  // ✅ Si pas de params URL → récupérer eglise_id depuis le profil connecté
  useEffect(() => {
    if (isFromLink) return;

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
      alert("Votre compte n'est pas rattaché à une église.");
      return;
    }

    const finalBesoins = [...formData.besoin];
    if (showOtherField && otherBesoin.trim()) finalBesoins.push(otherBesoin.trim());

    // ✅ status_suivi selon le contexte
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

      // 1. Insérer dans evangelises
      const { data: evangelise, error } = await supabase
        .from("evangelises")
        .insert([finalData])
        .select()
        .single();

      if (error) throw error;

      // ✅ 2. Si venu depuis un lien cellule → insérer dans suivis_des_evangelises avec cellule_id
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

        if (suiviError) {
          console.error("Erreur insertion suivis_des_evangelises (cellule) :", suiviError);
        }
      }

      // ✅ 3. Si venu depuis un lien famille → insérer dans suivis_des_evangelises avec famille_id
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

        if (suiviError) {
          console.error("Erreur insertion suivis_des_evangelises (famille) :", suiviError);
        }
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

  const handleCancel = () => resetForm();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-200 via-pink-100 to-yellow-100 p-6">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-lg">
        <div className="flex justify-center mb-6">
          <Image src="/logo.png" alt="SoulTrack Logo" width={80} height={80} />
        </div>

        <h1 className="text-3xl font-bold text-center mb-2">Ajouter une personne évangélisée</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 justify-center">

          {/* Date Evangelisation */}
          <div className="flex justify-center w-full">
            <input
              type="date"
              className="input w-auto text-center"
              value={formData.date_evangelise}
              onChange={e => setFormData({ ...formData, date_evangelise: e.target.value })}
            />
          </div>

          {/* Type Evangelisation */}
          <select
            className="input text-center"
            value={formData.type_evangelisation}
            onChange={e => setFormData({ ...formData, type_evangelisation: e.target.value })}
            required
          >
            <option value="">Type d'Evangélisation</option>
            <option value="Individuel">Individuel</option>
            <option value="Sortie de groupe">Sortie de groupe</option>
            <option value="Campagne d'évangélisation">Campagne d'évangélisation</option>
            <option value="Évangélisation de rue">Évangélisation de rue</option>
            <option value="Évangélisation maison">Évangélisation maison</option>
            <option value="Évangélisation stade">Évangélisation stade</option>
          </select>

          {/* Civilité */}
          <select
            className="input"
            value={formData.sexe}
            onChange={e => setFormData({ ...formData, sexe: e.target.value })}
            required
          >
            <option value="">Civilité</option>
            <option value="Homme">Homme</option>
            <option value="Femme">Femme</option>
          </select>

          {/* Prénom / Nom */}
          <input className="input" type="text" placeholder="Prénom" value={formData.prenom}
            onChange={e => setFormData({ ...formData, prenom: e.target.value })} required />
          <input className="input" type="text" placeholder="Nom" value={formData.nom}
            onChange={e => setFormData({ ...formData, nom: e.target.value })} required />

          {/* Age */}
          <select value={formData.age} onChange={e => setFormData({ ...formData, age: e.target.value })} className="input">
            <option value="">-- Tranche d'age --</option>
            <option value="12-17 ans">12-17 ans</option>
            <option value="18-25 ans">18-25 ans</option>
            <option value="26-30 ans">26-30 ans</option>
            <option value="31-40 ans">31-40 ans</option>
            <option value="41-55 ans">41-55 ans</option>
            <option value="56-69 ans">56-69 ans</option>
            <option value="70 ans et plus">70 ans et plus</option>
          </select>

          {/* Téléphone / Ville */}
          <input className="input" type="text" placeholder="Téléphone" value={formData.telephone}
            onChange={e => setFormData({ ...formData, telephone: e.target.value })} />
          <input className="input" type="text" placeholder="Ville" value={formData.ville}
            onChange={e => setFormData({ ...formData, ville: e.target.value })} />

          {/* WhatsApp */}
          <label className="flex items-center gap-2 text-gray-700">
            <input type="checkbox" checked={formData.is_whatsapp}
              onChange={e => setFormData({ ...formData, is_whatsapp: e.target.checked })}
              className="w-5 h-5 accent-indigo-600 cursor-pointer" />
            WhatsApp
          </label>

          {/* Prière */}
          <select className="input" value={formData.priere_salut} required
            onChange={e => setFormData({
              ...formData,
              priere_salut: e.target.value,
              type_conversion: e.target.value === "Oui" ? formData.type_conversion : ""
            })}>
            <option value="">-- Prière du salut ? --</option>
            <option value="Oui">Oui</option>
            <option value="Non">Non</option>
          </select>

          {formData.priere_salut === "Oui" && (
            <select className="input" value={formData.type_conversion}
              onChange={e => setFormData({ ...formData, type_conversion: e.target.value })} required>
              <option value="">Type</option>
              <option value="Nouveau converti">Nouveau converti</option>
              <option value="Réconciliation">Réconciliation</option>
            </select>
          )}

          {/* Besoins */}
          <div className="mt-4">
            <p className="font-semibold mb-2">Difficultés / Besoins :</p>
            {besoinsList.map(b => (
              <label key={b} className="flex items-center gap-3 mb-2">
                <input type="checkbox" value={b} checked={formData.besoin.includes(b)}
                  onChange={() => handleBesoinChange(b)}
                  className="w-5 h-5 rounded border-gray-400 cursor-pointer accent-indigo-600" />
                <span>{b}</span>
              </label>
            ))}
            <label className="flex items-center gap-3 mb-2">
              <input type="checkbox" checked={showOtherField}
                onChange={() => setShowOtherField(!showOtherField)}
                className="w-5 h-5 rounded border-gray-400 cursor-pointer accent-indigo-600" />
              Autre
            </label>
            {showOtherField && (
              <input type="text" placeholder="Précisez le besoin..." value={otherBesoin}
                onChange={e => setOtherBesoin(e.target.value)} className="input mt-1" />
            )}
          </div>

          <textarea placeholder="Informations supplémentaires..." rows={3}
            value={formData.infos_supplementaires}
            onChange={e => setFormData({ ...formData, infos_supplementaires: e.target.value })}
            className="input" />

          <div className="flex gap-4">
            <button type="button" onClick={handleCancel}
              className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 rounded-2xl shadow-md transition-all">
              Annuler
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:scale-105 text-white font-bold py-3 rounded-2xl shadow-md transition-all">
              {loading ? "Enregistrement..." : "Ajouter"}
            </button>
          </div>
        </form>

        {success && (
          <p ref={successRef} className="text-green-600 font-semibold text-center mt-3">
            ✅ Personne évangélisée ajoutée avec succès !
          </p>
        )}

        <style jsx>{`.input { width: 100%; padding: 12px; border-radius: 12px; border: 1px solid #ccc; }`}</style>
      </div>
    </div>
  );
}
