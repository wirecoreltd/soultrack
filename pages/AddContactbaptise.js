"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import supabase from "../lib/supabaseClient";
import { checkLimiteAtteinte } from "../lib/checkLimite";
import { getPrefixForPays } from "../lib/phonePrefix";
import FooterHub from "../components/FooterHub";

export default function AddContactbaptise() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    prenom: "",
    nom: "",
    telephone: "",
    is_whatsapp: false,
    ville: "",
    sexe: "",
    age: "",
    venu: "",
    priere_salut: "",
    type_conversion: "",
    besoin: [],
    besoinLibre: "",
    infos_supplementaires: "",
    date_venu: new Date().toISOString().slice(0, 10),
    eglise_id: "",
    branche_id: "",
  });

  const [showBesoinLibre, setShowBesoinLibre] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [noPhone, setNoPhone] = useState(false);
  const [phonePrefix, setPhonePrefix] = useState("");

  const besoinsOptions = [
    "Finances",
    "Santé",
    "Travail / Études",
    "Famille / Enfants",
    "Miracle",
    "Délivrance",
    "Relations / Conflits",
    "Addictions / Dépendances",
    "Guidance spirituelle",
    "Logement / Sécurité",
    "Communauté / Isolement",
    "Dépression / Santé mentale",
  ];

  useEffect(() => {
    const fetchUserEglise = async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) return;

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("eglise_id, branche_id")
        .eq("id", session.session.user.id)
        .single();

      if (!error && profile) {
        setFormData(prev => ({
          ...prev,
          eglise_id: profile.eglise_id,
          branche_id: profile.branche_id,
        }));

        // Fetch infos église pour le préfixe téléphonique
        if (profile.eglise_id) {
          const { data: eglise } = await supabase
            .from("eglises")
            .select("pays")
            .eq("id", profile.eglise_id)
            .single();

          if (eglise?.pays) {
            const prefix = getPrefixForPays(eglise.pays);
            if (prefix) {
              setPhonePrefix(prefix);
              setFormData(prev => ({
                ...prev,
                telephone: prev.telephone || prefix,
              }));
            }
          }
        }
      }
    };

    fetchUserEglise();
  }, []);

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

  const handlePhoneChange = (e) => {
    setFormData(prev => ({ ...prev, telephone: e.target.value }));
  };

  const resetForm = () => {
    setFormData(prev => ({
      ...prev,
      prenom: "",
      nom: "",
      telephone: phonePrefix || "",
      is_whatsapp: false,
      ville: "",
      sexe: "",
      age: "",
      venu: "",
      priere_salut: "",
      type_conversion: "",
      besoin: [],
      besoinLibre: "",
      infos_supplementaires: "",
      date_venu: new Date().toISOString().slice(0, 10),
    }));
    setNoPhone(false);
    setShowBesoinLibre(false);
    setErrorMsg("");
  };

  const goBackToRapport = () => router.push("/rapport/RapportBaptemesPage?onglet=saisie");
  const handleCancel = () => goBackToRapport();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      if (!noPhone && !formData.telephone) {
        setErrorMsg("Le téléphone est requis ou cochez 'Pas de téléphone'");
        return;
      }

      const { atteinte, count, limite } = await checkLimiteAtteinte(formData.eglise_id);
      if (atteinte) {
        setErrorMsg(`❌ Limite atteinte : ${count}/${limite} membres. Upgradez votre plan.`);
        return;
      }

      const finalBesoin = showBesoinLibre && formData.besoinLibre
        ? [...formData.besoin.filter(b => b !== "Autre"), formData.besoinLibre]
        : formData.besoin;

      const { besoinLibre, ...rest } = formData;
      const dataToSend = {
        ...rest,
        telephone: noPhone ? "Pas de téléphone" : formData.telephone,
        etat_contact: "existant",
        bapteme_eau: "Non",
        veut_se_faire_baptiser: "Oui",
        besoin: finalBesoin,
      };

      const { error } = await supabase.from("membres_complets").insert([dataToSend]);
      if (error) throw error;

      setSuccess(true);
      resetForm();
      setTimeout(() => goBackToRapport(), 1500);

    } catch (err) {
      setErrorMsg(err.message || "Erreur lors de l'ajout.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-200 via-pink-100 to-yellow-100 p-4 sm:p-6">
      <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-3xl shadow-lg relative">

        <button
          onClick={goBackToRapport}
          className="absolute top-3 left-3 sm:top-4 sm:left-4 flex items-center text-black font-semibold hover:text-gray-800 transition-colors"
        >
          ← Retour
        </button>

        <div className="flex justify-center mb-4 sm:mb-6">
          <Image src="/logo.png" alt="SoulTrack Logo" width={70} height={70} className="sm:w-[80px] sm:h-[60px]" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-2">Ajouter un nouveau baptisé</h1>
        <p className="text-center text-gray-500 italic mb-4 sm:mb-6 text-sm sm:text-base">
          « Allez, faites de toutes les nations des disciples » – Matthieu 28:19
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:gap-4">

          {/* Date de venue */}
          <div className="flex flex-col">
            <label className="text-sm sm:text-base font-bold mb-1">Date de venue</label>
            <input
              type="date"
              value={formData.date_venu}
              onChange={e => setFormData({ ...formData, date_venu: e.target.value })}
              className="input"
              required
            />
          </div>

          {/* Civilité */}
          <div className="flex flex-col">
            <label className="text-sm sm:text-base font-bold mb-1">Civilité</label>
            <select
              value={formData.sexe}
              onChange={e => setFormData({ ...formData, sexe: e.target.value })}
              className="input"
              required
            >
              <option value="">-- Choisir --</option>
              <option value="Homme">Homme</option>
              <option value="Femme">Femme</option>
            </select>
          </div>

          {/* Prénom */}
          <div className="flex flex-col">
            <label className="text-sm sm:text-base font-bold mb-1">Prénom</label>
            <input
              type="text"
              value={formData.prenom}
              onChange={e => setFormData({ ...formData, prenom: e.target.value })}
              className="input"
              required
            />
          </div>

          {/* Nom */}
          <div className="flex flex-col">
            <label className="text-sm sm:text-base font-bold mb-1">Nom</label>
            <input
              type="text"
              value={formData.nom}
              onChange={e => setFormData({ ...formData, nom: e.target.value })}
              className="input"
              required
            />
          </div>

          {/* Téléphone avec préfixe automatique */}
          <div className="flex flex-col">
            <label className="text-sm sm:text-base font-bold mb-1">Téléphone</label>
            <input
              type="tel"
              value={noPhone ? "La personne n'a pas de téléphone" : formData.telephone}
              onChange={handlePhoneChange}
              disabled={noPhone}
              required={!noPhone}
              className="input"
              placeholder={phonePrefix ? `${phonePrefix} ...` : "Ex: 5 1234 5678"}
            />
            <label className="flex items-center mt-2 space-x-2 text-sm">
              <input
                type="checkbox"
                checked={noPhone}
                onChange={e => {
                  setNoPhone(e.target.checked);
                  setFormData(prev => ({
                    ...prev,
                    telephone: e.target.checked ? "Pas de téléphone" : (phonePrefix || ""),
                  }));
                }}
              />
              <span>La personne n&apos;a pas de téléphone</span>
            </label>
          </div>

          {/* WhatsApp */}
          <label className="flex items-center gap-2 text-sm sm:text-base font-bold">
            <input
              type="checkbox"
              checked={formData.is_whatsapp}
              onChange={e => setFormData({ ...formData, is_whatsapp: e.target.checked })}
              className="w-4 h-4 sm:w-5 sm:h-5"
            />
            Numéro WhatsApp
          </label>

          {/* Ville */}
          <div className="flex flex-col">
            <label className="text-sm sm:text-base font-bold mb-1">Ville</label>
            <input
              type="text"
              value={formData.ville}
              onChange={e => setFormData({ ...formData, ville: e.target.value })}
              className="input"
            />
          </div>

          {/* Tranche d'âge */}
          <div className="flex flex-col">
            <label className="text-sm sm:text-base font-bold mb-1">Tranche d&apos;âge</label>
            <select
              value={formData.age}
              onChange={e => setFormData({ ...formData, age: e.target.value })}
              className="input"
              required
            >
              <option value="">-- Choisir --</option>
              {["12-17 ans", "18-25 ans", "26-30 ans", "31-40 ans", "41-55 ans", "56-69 ans", "70 ans et plus"].map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>

          {/* Comment est-il venu */}
          <div className="flex flex-col">
            <label className="text-sm sm:text-base font-bold mb-1">Comment est-il venu ?</label>
            <select
              value={formData.venu}
              onChange={e => setFormData({ ...formData, venu: e.target.value })}
              className="input"
              required
            >
              <option value="">-- Choisir --</option>
              <option value="invité">Invité</option>
              <option value="réseaux">Réseaux</option>
              <option value="evangélisation">Évangélisation</option>
              <option value="autre">Autre</option>
            </select>
          </div>

          {/* Prière du salut */}
          <div className="flex flex-col">
            <label className="text-sm sm:text-base font-bold mb-1">Prière du salut ?</label>
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
              <option value="">-- Choisir --</option>
              <option value="Oui">Oui</option>
              <option value="Non">Non</option>
            </select>
          </div>

          {/* Type de conversion */}
          {formData.priere_salut === "Oui" && (
            <div className="flex flex-col">
              <label className="text-sm sm:text-base font-bold mb-1">Type de conversion</label>
              <select
                className="input"
                value={formData.type_conversion}
                onChange={e => setFormData({ ...formData, type_conversion: e.target.value })}
                required
              >
                <option value="">-- Choisir --</option>
                <option value="Nouveau converti">Nouveau converti</option>
                <option value="Réconciliation">Réconciliation</option>
              </select>
            </div>
          )}

          {/* Difficultés / Besoins */}
          <div className="flex flex-col">
            <label className="text-sm sm:text-base font-bold mb-1">Difficultés / Besoins</label>
            <div className="flex flex-wrap gap-2">
              {besoinsOptions.map(item => (
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
                Autre
              </label>
            </div>
          </div>

          {showBesoinLibre && (
            <input
              type="text"
              placeholder="Précisez..."
              value={formData.besoinLibre}
              onChange={e => setFormData({ ...formData, besoinLibre: e.target.value })}
              className="input"
            />
          )}

          {/* Informations supplémentaires */}
          <div className="flex flex-col">
            <label className="text-sm sm:text-base font-bold mb-1">Informations supplémentaires</label>
            <textarea
              placeholder="..."
              rows={2}
              value={formData.infos_supplementaires}
              onChange={e => setFormData({ ...formData, infos_supplementaires: e.target.value })}
              className="input"
            />
          </div>

          {/* Message d'erreur */}
          {errorMsg && (
            <p className="text-red-600 text-sm font-semibold text-center">{errorMsg}</p>
          )}

          {/* Boutons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-2">
            <button
              type="button"
              onClick={handleCancel}
              className="w-full bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 rounded-2xl shadow-md transition-all"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600 text-white font-bold py-3 rounded-2xl shadow-md transition-all"
            >
              Ajouter
            </button>
          </div>

          {success && (
            <p className="text-green-600 font-semibold text-center mt-4 animate-pulse">
              ✅ Contact ajouté avec succès !
            </p>
          )}

        </form>

        <FooterHub />

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
