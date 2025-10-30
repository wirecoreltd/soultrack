// pages/ajouter-membre-cellule.js
"use client";

import { useState, useEffect } from "react";
import supabase from "../lib/supabaseClient";
import { useRouter } from "next/router";

export default function AddMemberCellule() {
  const router = useRouter();

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
  const [celluleId, setCelluleId] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Récupérer la cellule du responsable connecté
  useEffect(() => {
    const fetchCellule = async () => {
      try {
        const responsableId = localStorage.getItem("responsable_id"); // Assure-toi que c'est le bon champ
        if (!responsableId) throw new Error("Responsable non trouvé");

        const { data, error } = await supabase
          .from("cellules")
          .select("id, cellule")
          .eq("responsable_id", responsableId)
          .single();

        if (error || !data) {
          alert("Aucune cellule trouvée pour ce responsable !");
          setLoading(false);
          return;
        }

        setCelluleId(data.id);
      } catch (err) {
        console.error(err);
        alert("Erreur lors de la récupération de la cellule !");
      } finally {
        setLoading(false);
      }
    };

    fetchCellule();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!celluleId) {
      alert("Impossible d’ajouter le membre : cellule introuvable.");
      return;
    }

    try {
      const memberData = {
        ...formData,
        statut: "Integrer",
        cellule_id: celluleId,
      };

      const { error } = await supabase.from("membres").insert([memberData]);
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

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert("Erreur lors de l'ajout du membre : " + err.message);
    }
  };

  if (loading) return <p className="text-center mt-10 text-gray-700">Chargement...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 to-blue-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-2xl">
        {/* Flèche retour */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-orange-500 font-semibold mb-4 hover:text-orange-600 transition-colors"
        >
          ← Retour
        </button>

        <h1 className="text-3xl font-extrabold text-center text-gray-800 mb-2">
          Ajouter un membre à ma cellule
        </h1>
        <p className="text-center text-gray-500 italic mb-6">
          « Allez, faites de toutes les nations des disciples » – Matthieu 28:19
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
              className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl shadow-md transition-all duration-200"
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
              className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl shadow-md transition-all duration-200"
            >
              Annuler
            </button>
          </div>

          {/* Message succès */}
          {success && (
            <div className="text-green-600 font-semibold text-center mt-3">
              ✅ Membre ajouté avec succès !
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
