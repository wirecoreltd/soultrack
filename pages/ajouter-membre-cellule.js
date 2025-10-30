// pages/ajouter-membre-cellule.js
// pages/ajouter-membre-cellule.js
"use client";

import { useState, useEffect } from "react";
import supabase from "../lib/supabaseClient";
import { useRouter } from "next/router";
import { useUser } from "@supabase/auth-helpers-react";

export default function AddMemberCellule() {
  const router = useRouter();
  const { user } = useUser();
  const [cellule, setCellule] = useState(null);
  const [loadingCellule, setLoadingCellule] = useState(true);

  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    telephone: "",
    ville: "",
    venu: "",
    besoin: "",
    is_whatsapp: false,
    infos_supplementaires: "",
  });

  const [success, setSuccess] = useState(false);

  // ✅ Récupération de la cellule du responsable
  useEffect(() => {
    const fetchCellule = async () => {
      if (!user) return;

      setLoadingCellule(true);
      const { data, error } = await supabase
        .from("cellules")
        .select("id, cellule")
        .eq("responsable_id", user.id)
        .single();

      if (error) {
        console.error("Erreur récupération cellule :", error.message);
        setCellule(null);
      } else {
        setCellule(data);
      }
      setLoadingCellule(false);
    };

    fetchCellule();
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cellule) return alert("Cellule introuvable pour ce responsable !");

    try {
      // ✅ Ajout dans membres avec cellule_id et statut "Integrer"
      const { error } = await supabase.from("membres").insert([
        {
          ...formData,
          statut: "Integrer",
          cellule_id: cellule.id,
        },
      ]);

      if (error) throw error;

      setSuccess(true);
      setFormData({
        nom: "",
        prenom: "",
        telephone: "",
        ville: "",
        venu: "",
        besoin: "",
        is_whatsapp: false,
        infos_supplementaires: "",
      });

      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      alert("❌ " + err.message);
    }
  };

  if (loadingCellule)
    return <p className="text-center mt-10 text-xl text-gray-700">Chargement...</p>;

  if (!cellule)
    return (
      <p className="text-center mt-10 text-xl text-red-600">
        Aucune cellule trouvée pour ce responsable !
      </p>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 to-blue-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-2xl">
        {/* Flèche retour */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-orange-600 font-semibold mb-4 hover:text-orange-700 transition-colors"
        >
          ← Retour
        </button>

        <h1 className="text-3xl font-extrabold text-center text-orange-700 mb-2">
          Ajouter un membre à ma cellule
        </h1>
        <p className="text-center text-gray-500 italic mb-6">
          Cellule : <span className="font-semibold">{cellule.cellule}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Prénom */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Prénom</label>
            <input
              type="text"
              name="prenom"
              value={formData.prenom}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              required
            />
          </div>

          {/* Nom */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Nom</label>
            <input
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              required
            />
          </div>

          {/* Téléphone + WhatsApp */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Téléphone</label>
            <input
              type="text"
              name="telephone"
              value={formData.telephone}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              required
            />
            <div className="mt-2 flex items-center">
              <input
                type="checkbox"
                name="is_whatsapp"
                checked={formData.is_whatsapp}
                onChange={handleChange}
                className="mr-2"
              />
              <label className="text-gray-700">Ce numéro est WhatsApp</label>
            </div>
          </div>

          {/* Ville */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Ville</label>
            <input
              type="text"
              name="ville"
              value={formData.ville}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {/* Comment est venu */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Comment est-il venu ?</label>
            <select
              name="venu"
              value={formData.venu}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option value="">-- Sélectionner --</option>
              <option value="invité">Invité</option>
              <option value="réseaux">Réseaux</option>
              <option value="evangélisation">Evangélisation</option>
              <option value="autre">Autre</option>
            </select>
          </div>

          {/* Besoin */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Besoin de la personne ?</label>
            <select
              name="besoin"
              value={formData.besoin}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option value="">-- Sélectionner --</option>
              <option value="Finances">Finances</option>
              <option value="Santé">Santé</option>
              <option value="Travail">Travail</option>
              <option value="Les Enfants">Les Enfants</option>
              <option value="La Famille">La Famille</option>
            </select>
          </div>

          {/* Infos supplémentaires */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Informations supplémentaires</label>
            <textarea
              name="infos_supplementaires"
              value={formData.infos_supplementaires}
              onChange={handleChange}
              rows={3}
              placeholder="Ajoute ici d'autres détails utiles sur la personne..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {/* Boutons */}
          <div className="flex justify-between mt-4 gap-4">
            <button
              type="submit"
              className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl shadow-md transition-all duration-200"
            >
              Ajouter
            </button>
            <button
              type="button"
              onClick={() =>
                setFormData({
                  nom: "",
                  prenom: "",
                  telephone: "",
                  ville: "",
                  venu: "",
                  besoin: "",
                  is_whatsapp: false,
                  infos_supplementaires: "",
                })
              }
              className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-2xl shadow-md transition-all duration-200"
            >
              Annuler
            </button>
          </div>
        </form>

        {/* Message de succès */}
        {success && (
          <div className="text-green-600 font-semibold text-center mt-3">
            ✅ Membre ajouté avec succès !
          </div>
        )}
      </div>
    </div>
  );
}
