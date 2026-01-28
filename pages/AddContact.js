"use client";
import { useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import supabase from "../lib/supabaseClient";

export default function AddContact() {
  const router = useRouter();

  const [etatContact, setEtatContact] = useState("Nouveau");
  const [formData, setFormData] = useState({
    prenom: "",
    nom: "",
    telephone: "",
    is_whatsapp: false,
    ville: "",
    sexe: "",
    statut: "",
    venu: "",
    priere_salut: "",
    type_conversion: "",
    besoin: [],
    besoinLibre: "",
    infos_supplementaires: "",
  });
  const [showBesoinLibre, setShowBesoinLibre] = useState(false);
  const [success, setSuccess] = useState(false);

  const besoinsOptions = ["Finances", "Santé", "Travail", "Les Enfants", "La Famille"];

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalBesoin = showBesoinLibre && formData.besoinLibre
      ? [...formData.besoin.filter((b) => b !== "Autre"), formData.besoinLibre]
      : formData.besoin;

    const dataToSend = {
      ...formData,
      etat_contact: etatContact,
      besoin: finalBesoin,
    };
    delete dataToSend.besoinLibre;

    try {
      const { error } = await supabase.from("membres_complets").insert([dataToSend]);
      if (error) throw error;

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);

      setFormData({
        prenom: "",
        nom: "",
        telephone: "",
        is_whatsapp: false,
        ville: "",
        sexe: "",
        statut: "",
        venu: "",
        priere_salut: "",
        type_conversion: "",
        besoin: [],
        besoinLibre: "",
        infos_supplementaires: "",
      });
      setShowBesoinLibre(false);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-200 via-pink-100 to-yellow-100 p-4 sm:p-6">
      <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-3xl shadow-lg relative">
        <button
          onClick={() => router.back()}
          className="absolute top-3 left-3 sm:top-4 sm:left-4 flex items-center text-black font-semibold hover:text-gray-800 transition-colors"
        >
          ← Retour
        </button>

        <div className="flex justify-center mb-4 sm:mb-6">
          <Image src="/logo.png" alt="SoulTrack Logo" width={70} height={70} className="sm:w-[80px] sm:h-[60px]" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-2">Ajouter un nouveau membre</h1>
        <p className="text-center text-gray-500 italic mb-4 sm:mb-6 text-sm sm:text-base">
          « Allez, faites de toutes les nations des disciples » – Matthieu 28:19
        </p>

        {/* Menu déroulant pour type de contact */}
        <label className="text-sm sm:text-base font-semibold mb-1">
          État du contact
        </label>
        <select
          value={etatContact}
          onChange={(e) => setEtatContact(e.target.value)}
          className="input mb-3"
        >
          <option value="Nouveau">Nouveau</option>
          <option value="Existant">Existant</option>
        </select>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:gap-4">
          {/* Prénom */}
          <label className="text-sm sm:text-base font-semibold mb-1">Prénom</label>
          <input
            type="text"
            value={formData.prenom}
            onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
            className="input"
            required
          />

          {/* Nom */}
          <label className="text-sm sm:text-base font-semibold mb-1">Nom</label>
          <input
            type="text"
            value={formData.nom}
            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
            className="input"
            required
          />

          {/* Téléphone */}
          <label className="text-sm sm:text-base font-semibold mb-1">Téléphone</label>
          <input
            type="text"
            value={formData.telephone}
            onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
            className="input"
          />

          {/* WhatsApp */}
          <label className="flex items-center gap-2 text-sm sm:text-base mb-1">
            <input
              type="checkbox"
              checked={formData.is_whatsapp}
              onChange={(e) => setFormData({ ...formData, is_whatsapp: e.target.checked })}
              className="w-4 h-4 sm:w-5 sm:h-5"
            />
            Numéro WhatsApp
          </label>

          {/* Ville */}
          <label className="text-sm sm:text-base font-semibold mb-1">Ville</label>
          <input
            type="text"
            value={formData.ville}
            onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
            className="input"
          />

          {/* Sexe */}
          <label className="text-sm sm:text-base font-semibold mb-1">Sexe</label>
          <select
            value={formData.sexe}
            onChange={(e) => setFormData({ ...formData, sexe: e.target.value })}
            className="input"
            required
          >
            <option value="">-- Choisir --</option>
            <option value="Homme">Homme</option>
            <option value="Femme">Femme</option>
          </select>

          {/* Statut */}
          <label className="text-sm sm:text-base font-semibold mb-1">Raison de la venue</label>
          <select
            value={formData.statut}
            onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
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
          <label className="text-sm sm:text-base font-semibold mb-1">Comment est-il venu ?</label>
          <select
            value={formData.venu}
            onChange={(e) => setFormData({ ...formData, venu: e.target.value })}
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
          <label className="text-sm sm:text-base font-semibold mb-1">Prière du salut</label>
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
            <option value="">-- Choisir --</option>
            <option value="Oui">Oui</option>
            <option value="Non">Non</option>
          </select>

          {/* Type de conversion */}
          {formData.priere_salut === "Oui" && (
            <>
              <label className="text-sm sm:text-base font-semibold mb-1">Type de conversion</label>
              <select
                value={formData.type_conversion}
                onChange={(e) => setFormData({ ...formData, type_conversion: e.target.value })}
                className="input"
                required
              >
                <option value="">-- Choisir --</option>
                <option value="Nouveau converti">Nouveau converti</option>
                <option value="Réconciliation">Réconciliation</option>
              </select>
            </>
          )}

          {/* Besoins */}
          <label className="text-sm sm:text-base font-semibold mb-1">Besoins</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {besoinsOptions.map(item => (
              <label key={item} className="flex items-center gap-1">
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
            <label className="flex items-center gap-1">
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
              onChange={(e) => setFormData({ ...formData, besoinLibre: e.target.value })}
              className="input mb-2"
            />
          )}

          {/* Informations supplémentaires */}
          <label className="text-sm sm:text-base font-semibold mb-1">Informations supplémentaires</label>
          <textarea
            placeholder="..."
            rows={2}
            value={formData.infos_supplementaires}
            onChange={(e) => setFormData({ ...formData, infos_supplementaires: e.target.value })}
            className="input mb-3"
          />

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-2">
            <button type="button" onClick={handleCancel} className="w-full bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 rounded-2xl shadow-md transition-all">
              Annuler
            </button>
            <button type="submit" className="w-full bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600 text-white font-bold py-3 rounded-2xl shadow-md transition-all">
              Ajouter
            </button>
          </div>

          {success && <p className="text-green-600 font-semibold text-center mt-4 animate-pulse">✅ Contact ajouté avec succès !</p>}
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
