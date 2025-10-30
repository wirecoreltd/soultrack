// pages/ajouter-membre-cellule.js

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import supabase from "../lib/supabaseClient";
import Image from "next/image";

export default function AjouterMembreCellule() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    telephone: "",
    ville: "",
    statut: "nouveau",
    venu: "",
    besoin: "",
    is_whatsapp: false,
    infos_supplementaires: "",
  });

  const [cellule, setCellule] = useState(null);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // ✅ Récupération de la cellule du responsable
  useEffect(() => {
    const fetchCellule = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) {
          setErrorMessage("⚠️ Responsable non identifié !");
          return;
        }

        const { data, error } = await supabase
          .from("cellules")
          .select("id, nom_cellule")
          .eq("responsable_id", userId)
          .single();

        if (error || !data) {
          setErrorMessage("⚠️ Aucune cellule trouvée pour ce responsable !");
        } else {
          setCellule(data);
          setErrorMessage("");
        }
      } catch (err) {
        setErrorMessage("Erreur lors de la récupération de la cellule !");
      }
    };

    fetchCellule();
  }, []);

  // 🟢 Changement des champs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // 🟢 Envoi du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!cellule) {
      setErrorMessage("⚠️ Impossible d’ajouter le membre : cellule introuvable.");
      return;
    }

    try {
      const { error } = await supabase.from("membres").insert([
        {
          ...formData,
          cellule_id: cellule.id,
          responsable_id: localStorage.getItem("userId"),
        },
      ]);

      if (error) throw error;

      setSuccess(true);
      setErrorMessage("");

      // Réinitialiser le formulaire
      setFormData({
        nom: "",
        prenom: "",
        telephone: "",
        ville: "",
        statut: "nouveau",
        venu: "",
        besoin: "",
        is_whatsapp: false,
        infos_supplementaires: "",
      });

      // 🔁 Redirection après 2 secondes
      setTimeout(() => {
        setSuccess(false);
        router.push("/list-members-cellule");
      }, 2000);
    } catch (err) {
      setErrorMessage("Erreur lors de l’ajout du membre : " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-100 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-2xl">

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image src="/logo.png" alt="SoulTrack Logo" width={80} height={80} />
        </div>

        <button
          onClick={() => router.back()}
          className="flex items-center text-orange-500 font-semibold mb-4 hover:text-orange-600 transition-colors"
        >
          ← Retour
        </button>

        <h1 className="text-3xl font-extrabold text-center text-indigo-700 mb-2">
          Ajouter un membre à ma cellule
        </h1>
        <p className="text-center text-gray-500 italic mb-6">
          {cellule ? `📍 ${cellule.nom_cellule}` : "Aucune cellule trouvée"}
        </p>

        {errorMessage && (
          <div className="text-red-600 font-semibold text-center mb-4">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            name="prenom"
            placeholder="Prénom"
            value={formData.prenom}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-400"
          />
          <input
            type="text"
            name="nom"
            placeholder="Nom"
            value={formData.nom}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-400"
          />
          <input
            type="text"
            name="telephone"
            placeholder="Téléphone"
            value={formData.telephone}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-400"
          />

          <label className="flex items-center gap-2 mt-1">
            <input
              type="checkbox"
              name="is_whatsapp"
              checked={formData.is_whatsapp}
              onChange={handleChange}
            />
            WhatsApp
          </label>

          <input
            type="text"
            name="ville"
            placeholder="Ville"
            value={formData.ville}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-400"
          />

          <select
            name="statut"
            value={formData.statut}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-400"
          >
            <option value="">-- Statut --</option>
            <option value="veut rejoindre ICC">Veut rejoindre ICC</option>
            <option value="a déjà mon église">A déjà son église</option>
            <option value="visiteur">Visiteur</option>
          </select>

          <select
            name="venu"
            value={formData.venu}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-400"
          >
            <option value="">-- Comment est-il venu ? --</option>
            <option value="invité">Invité</option>
            <option value="réseaux">Réseaux</option>
            <option value="evangélisation">Evangélisation</option>
            <option value="autre">Autre</option>
          </select>

          <select
            name="besoin"
            value={formData.besoin}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-400"
          >
            <option value="">-- Besoin --</option>
            <option value="Finances">Finances</option>
            <option value="Santé">Santé</option>
            <option value="Travail">Travail</option>
            <option value="Les Enfants">Les Enfants</option>
            <option value="La Famille">La Famille</option>
          </select>

          <textarea
            name="infos_supplementaires"
            value={formData.infos_supplementaires}
            onChange={handleChange}
            rows={3}
            placeholder="Informations supplémentaires..."
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-400"
          />

          <div className="flex gap-4 justify-between">
            <button
              type="button"
              onClick={() =>
                setFormData({
                  nom: "",
                  prenom: "",
                  telephone: "",
                  ville: "",
                  statut: "nouveau",
                  venu: "",
                  besoin: "",
                  is_whatsapp: false,
                  infos_supplementaires: "",
                })
              }
              className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-2xl shadow-md transition-all"
            >
              Annuler
            </button>

            <button
              type="submit"
              className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl shadow-md transition-all"
            >
              Ajouter
            </button>
          </div>
        </form>

        {success && (
          <div className="text-green-600 font-semibold text-center mt-3">
            ✅ Membre ajouté avec succès !
          </div>
        )}
      </div>
    </div>
  );
}

