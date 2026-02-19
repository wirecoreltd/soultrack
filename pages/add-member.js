"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import supabase from "../lib/supabaseClient";

export default function AddMember() {
  const router = useRouter();
  const { token } = router.query;

  const [formData, setFormData] = useState({
    sexe: "",
    nom: "",
    prenom: "",
    telephone: "",
    ville: "",
    statut: "",
    venu: "",
    besoin: [],
    besoinLibre: "",
    is_whatsapp: false,
    infos_supplementaires: "",
    priere_salut: "",
    type_conversion: "",
    eglise_id: "",
    branche_id: "",
  });

  const [showBesoinLibre, setShowBesoinLibre] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const besoinsOptions = ["Finances", "Santé", "Travail", "Les Enfants", "La Famille"];

  // Récupération eglise_id et branche_id de l'utilisateur connecté
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
      }
      setLoading(false);
    };

    fetchUserEglise();
  }, []);

  // Vérification du token
  useEffect(() => {
    if (!token) return;

    const verifyToken = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("access_tokens")
        .select("*")
        .eq("token", token)
        .gte("expires_at", new Date().toISOString())
        .single();

      if (error || !data) setErrorMsg("Lien invalide ou expiré.");
      setLoading(false);
    };

    verifyToken();
  }, [token]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Concat besoin avec besoinLibre si coché
    const finalBesoin = showBesoinLibre && formData.besoinLibre
      ? [...formData.besoin.filter(b => b !== "Autre"), formData.besoinLibre]
      : formData.besoin;

    const dataToSend = {
      ...formData,
      besoin: finalBesoin,
      etat_contact: "Nouveau",
      eglise_id: formData.eglise_id,
      branche_id: formData.branche_id,
    };

    delete dataToSend.besoinLibre;

    try {
      // Vérifier si le téléphone existe déjà
      if (!formData.telephone) throw new Error("Le téléphone est requis.");

      const { data: existing } = await supabase
        .from("membres_complets")
        .select("id")
        .eq("telephone", formData.telephone)
        .single();

      if (existing) throw new Error("Ce numéro de téléphone existe déjà.");

      const { error } = await supabase.from("membres_complets").insert([dataToSend]);
      if (error) throw error;

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);

      setFormData(prev => ({
        ...prev,
        sexe: "",
        nom: "",
        prenom: "",
        telephone: "",
        ville: "",
        statut: "",
        venu: "",
        besoin: [],
        besoinLibre: "",
        is_whatsapp: false,
        infos_supplementaires: "",
        priere_salut: "",
        type_conversion: "",
      }));
      setShowBesoinLibre(false);

    } catch (err) {
      setErrorMsg(err.message || "Erreur lors de l'ajout du membre.");
    }
  };

  const handleCancel = () => {
    setFormData(prev => ({
      ...prev,
      sexe: "",
      nom: "",
      prenom: "",
      telephone: "",
      ville: "",
      statut: "",
      venu: "",
      besoin: [],
      besoinLibre: "",
      is_whatsapp: false,
      infos_supplementaires: "",
      priere_salut: "",
      type_conversion: "",
    }));
    setShowBesoinLibre(false);
    setErrorMsg("");
  };

  if (loading) return <p className="text-center mt-10">Vérification du lien...</p>;
  if (errorMsg) return <p className="text-center mt-10 text-red-600">{errorMsg}</p>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-200 via-pink-100 to-yellow-100 p-4 sm:p-6">
      <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-3xl shadow-lg relative">
        <button
          onClick={() => window.close()}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 text-black font-bold hover:text-gray-800 transition-colors text-xl"
          aria-label="Fermer"
        >
          ✕
        </button>

        <div className="flex justify-center mb-4 sm:mb-6">
          <Image src="/logo.png" alt="SoulTrack Logo" width={70} height={70} />
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-2">Ajouter un nouveau membre</h1>
        <p className="text-center text-gray-500 italic mb-4 sm:mb-6 text-sm sm:text-base">
          « Allez, faites de toutes les nations des disciples » – Matthieu 28:19
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:gap-4">
          {/* Prénom */}
          <label className="text-sm sm:text-base font-semibold">Prénom</label>
          <input
            type="text"
            value={formData.prenom}
            onChange={e => setFormData({...formData, prenom: e.target.value})}
            className="input"
            required
          />

          {/* Nom */}
          <label className="text-sm sm:text-base font-semibold">Nom</label>
          <input
            type="text"
            value={formData.nom}
            onChange={e => setFormData({...formData, nom: e.target.value})}
            className="input"
            required
          />

          {/* Téléphone */}
          <label className="text-sm sm:text-base font-semibold">Téléphone</label>
          <input
            type="text"
            value={formData.telephone}
            onChange={e => setFormData({...formData, telephone: e.target.value})}
            className="input"
            required
          />

          {/* WhatsApp */}
          <label className="flex items-center gap-2 text-sm sm:text-base">
            <input
              type="checkbox"
              checked={formData.is_whatsapp}
              onChange={e => setFormData({...formData, is_whatsapp: e.target.checked})}
            />
            Numéro WhatsApp
          </label>

          {/* Ville */}
          <label className="text-sm sm:text-base font-semibold">Ville</label>
          <input
            type="text"
            value={formData.ville}
            onChange={e => setFormData({...formData, ville: e.target.value})}
            className="input"
          />

          {/* Sexe */}
          <label className="text-sm sm:text-base font-semibold">Sexe</label>
          <select
            value={formData.sexe}
            onChange={e => setFormData({...formData, sexe: e.target.value})}
            className="input"
            required
          >
            <option value="">-- Choisir --</option>
            <option value="Homme">Homme</option>
            <option value="Femme">Femme</option>
          </select>

          {/* Statut */}
          <label className="text-sm sm:text-base font-semibold">Statut</label>
          <select
            value={formData.statut}
            onChange={e => setFormData({...formData, statut: e.target.value})}
            className="input"
            required
          >
            <option value="">-- Choisir --</option>
            <option value="veut rejoindre ICC">Veut rejoindre ICC</option>
            <option value="a déjà son église">A déjà son église</option>
            <option value="nouveau">Nouveau</option>
            <option value="visiteur">Visiteur</option>
          </select>

          {/* Comment est-il venu */}
          <label className="text-sm sm:text-base font-semibold">Comment est-il venu ?</label>
          <select
            value={formData.venu}
            onChange={e => setFormData({...formData, venu: e.target.value})}
            className="input"
            required
          >
            <option value="">-- Choisir --</option>
            <option value="invité">Invité</option>
            <option value="réseaux">Réseaux</option>
            <option value="evangélisation">Évangélisation</option>
            <option value="autre">Autre</option>
          </select>

          {/* Prière du salut */}
          <label className="text-sm sm:text-base font-semibold">Prière du salut</label>
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

          {formData.priere_salut === "Oui" && (
            <>
              <label className="text-sm sm:text-base font-semibold">Type de conversion</label>
              <select
                className="input"
                value={formData.type_conversion}
                onChange={e => setFormData({...formData, type_conversion: e.target.value})}
                required
              >
                <option value="">-- Choisir --</option>
                <option value="Nouveau converti">Nouveau converti</option>
                <option value="Réconciliation">Réconciliation</option>
              </select>
            </>
          )}

          {/* Besoins */}
          <label className="text-sm sm:text-base font-bold mb-1">Besoins</label>
          <div className="flex flex-wrap gap-2 mb-2">
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

          {showBesoinLibre && (
            <input
              type="text"
              placeholder="Précisez..."
              value={formData.besoinLibre}
              onChange={e => setFormData({...formData, besoinLibre: e.target.value})}
              className="input mb-2"
            />
          )}

          {/* Infos supplémentaires */}
          <label className="text-sm sm:text-base font-semibold">Informations supplémentaires</label>
          <textarea
            placeholder="..."
            rows={2}
            value={formData.infos_supplementaires}
            onChange={e => setFormData({...formData, infos_supplementaires: e.target.value})}
            className="input"
          />

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-2">
            <button type="button" onClick={handleCancel} className="w-full bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 rounded-2xl shadow-md transition-all">
              Annuler
            </button>
            <button type="submit" className="w-full bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600 text-white font-bold py-3 rounded-2xl shadow-md transition-all">
              Ajouter
            </button>
          </div>
        </form>

        {success && <p className="text-green-600 font-semibold text-center mt-4 animate-pulse">✅ Membre ajouté avec succès !</p>}

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
