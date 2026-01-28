"use client";
import { useState } from "react";
import { useRouter } from "next/router";
import supabase from "../lib/supabaseClient";

export default function AddContact() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    etat_contact: "Nouveau", // Nouveau par défaut
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
  });

  const [showBesoinLibre, setShowBesoinLibre] = useState(false);
  const [success, setSuccess] = useState(false);

  const besoinsOptions = ["Finances", "Santé", "Travail", "Enfants", "Famille"];

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const finalBesoin = showBesoinLibre && formData.besoinLibre
      ? [...formData.besoin.filter((b) => b !== "Autre"), formData.besoinLibre]
      : formData.besoin;

    const dataToSend = {
      ...formData,
      besoin: finalBesoin,
    };
    delete dataToSend.besoinLibre;

    try {
      await supabase.from("membres_complets").insert([dataToSend]);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        router.push("/list-members"); // retour après ajout
      }, 1000);

      // Reset du formulaire
      setFormData({
        etat_contact: "Nouveau",
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
      });
      setShowBesoinLibre(false);

    } catch (err) {
      alert(err.message);
    }
  };

  const handleCancel = () => router.push("/list-members");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-200 via-pink-100 to-yellow-100 p-4 sm:p-6">
      <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-3xl shadow-lg relative">
        <button
          onClick={() => router.back()}
          className="absolute top-3 left-3 sm:top-4 sm:left-4 flex items-center text-black font-semibold hover:text-gray-800 transition-colors"
        >
          ← Retour
        </button>

        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-4">Ajouter un contact</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:gap-4">
          {/* Nouveau / Existant */}
          <div className="flex items-center gap-3">
            <label className="w-32 text-sm font-semibold">État contact</label>
            <select
              className="input flex-1"
              value={formData.etat_contact}
              onChange={(e) => setFormData({ ...formData, etat_contact: e.target.value })}
              required
            >
              <option value="Nouveau">Nouveau</option>
              <option value="Existant">Existant</option>
            </select>
          </div>

          {/* Prénom */}
          <div className="flex items-center gap-3">
            <label className="w-32 text-sm font-semibold">Prénom</label>
            <input
              type="text"
              value={formData.prenom}
              onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
              className="input flex-1"
              required
            />
          </div>

          {/* Nom */}
          <div className="flex items-center gap-3">
            <label className="w-32 text-sm font-semibold">Nom</label>
            <input
              type="text"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              className="input flex-1"
              required
            />
          </div>

          {/* Téléphone */}
          <div className="flex items-center gap-3">
            <label className="w-32 text-sm font-semibold">Téléphone</label>
            <input
              type="text"
              value={formData.telephone}
              onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
              className="input flex-1"
            />
          </div>

          {/* WhatsApp */}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={formData.is_whatsapp}
              onChange={(e) => setFormData({ ...formData, is_whatsapp: e.target.checked })}
            />
            Numéro WhatsApp
          </label>

          {/* Ville */}
          <div className="flex items-center gap-3">
            <label className="w-32 text-sm font-semibold">Ville</label>
            <input
              type="text"
              value={formData.ville}
              onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
              className="input flex-1"
            />
          </div>

          {/* Sexe */}
          <div className="flex items-center gap-3">
            <label className="w-32 text-sm font-semibold">Sexe</label>
            <select
              className="input flex-1"
              value={formData.sexe}
              onChange={(e) => setFormData({ ...formData, sexe: e.target.value })}
              required
            >
              <option value="">-- Choisir --</option>
              <option value="Homme">Homme</option>
              <option value="Femme">Femme</option>
            </select>
          </div>

          {/* Raison de la venue */}
          <div className="flex items-center gap-3">
            <label className="w-32 text-sm font-semibold">Raison</label>
            <select
              className="input flex-1"
              value={formData.statut}
              onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
              required
            >
              <option value="">-- Choisir --</option>
              <option value="veut rejoindre ICC">Veut rejoindre ICC</option>
              <option value="a déjà son église">A déjà son église</option>
              <option value="nouveau">Nouveau</option>
              <option value="visiteur">Visiteur</option>
            </select>
          </div>

          {/* Comment est-il venu */}
          <div className="flex items-center gap-3">
            <label className="w-32 text-sm font-semibold">Venue par</label>
            <select
              className="input flex-1"
              value={formData.venu}
              onChange={(e) => setFormData({ ...formData, venu: e.target.value })}
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
          <div className="flex items-center gap-3">
            <label className="w-32 text-sm font-semibold">Salut reçu ?</label>
            <select
              className="input flex-1"
              value={formData.priere_salut}
              onChange={(e) => {
                const value = e.target.value;
                setFormData({
                  ...formData,
                  priere_salut: value,
                  type_conversion: value === "Oui" ? formData.type_conversion : "",
                });
              }}
              required
            >
              <option value="">-- Choisir --</option>
              <option value="Oui">Oui</option>
              <option value="Non">Non</option>
            </select>
          </div>

          {/* Type de conversion */}
          {formData.priere_salut === "Oui" && (
            <div className="flex items-center gap-3">
              <label className="w-32 text-sm font-semibold">Conversion</label>
              <select
                className="input flex-1"
                value={formData.type_conversion}
                onChange={(e) => setFormData({ ...formData, type_conversion: e.target.value })}
                required
              >
                <option value="">-- Choisir --</option>
                <option value="Nouveau converti">Nouveau converti</option>
                <option value="Réconciliation">Réconciliation</option>
              </select>
            </div>
          )}

          {/* Besoins */}
          <p className="text-sm font-semibold mt-2 mb-1">Besoins</p>
          <div className="flex flex-wrap gap-2">
            {besoinsOptions.map(item => (
              <label key={item} className="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  value={item}
                  checked={formData.besoin.includes(item)}
                  onChange={handleBesoinChange}
                  className="w-4 h-4 rounded border-gray-400"
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
                className="w-4 h-4 rounded border-gray-400"
              />
              Autre
            </label>
            {showBesoinLibre && (
              <input
                type="text"
                placeholder="Précisez..."
                value={formData.besoinLibre}
                onChange={(e) => setFormData({ ...formData, besoinLibre: e.target.value })}
                className="input mt-1"
              />
            )}
          </div>

          {/* Infos supplémentaires */}
          <label className="text-sm font-semibold mt-2">Infos supplémentaires</label>
          <textarea
            placeholder="..."
            rows={2}
            value={formData.infos_supplementaires}
            onChange={(e) => setFormData({ ...formData, infos_supplementaires: e.target.value })}
            className="input"
          />

          {/* Boutons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-3">
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

        <style jsx>{`
          .input {
            width: 100%;
            border: 1px solid #ccc;
            border-radius: 12px;
            padding: 10px;
            font-size: 0.95rem;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
        `}</style>
      </div>
    </div>
  );
}
