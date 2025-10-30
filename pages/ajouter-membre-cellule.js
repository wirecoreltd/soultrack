// pages/ajouter-membre-cellule.js
"use client";

import { useState, useEffect } from "react";
import supabase from "../lib/supabaseClient";
import { useRouter } from "next/router";
import { useUser } from "@supabase/auth-helpers-react"; // ✅ pour récupérer l'utilisateur connecté

export default function AddMemberCellule() {
  const router = useRouter();
  const user = useUser(); // utilisateur connecté Supabase
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

  // Récupération de la cellule du responsable connecté
  useEffect(() => {
    const fetchCellule = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("cellules")
          .select("id")
          .eq("responsable_id", user.id)
          .single();

        if (error || !data) {
          console.error("Erreur récupération cellule :", error?.message);
          return alert("⚠️ Aucune cellule trouvée pour ce responsable !");
        }

        setCelluleId(data.id);
      } catch (err) {
        console.error("Erreur récupération cellule :", err.message);
        alert("⚠️ Impossible de récupérer la cellule du responsable.");
      }
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
    if (!celluleId) return alert("⚠️ Aucune cellule trouvée pour ce responsable !");

    try {
      const { error } = await supabase.from("membres").insert([
        {
          ...formData,
          statut: "Intégré",
          cellule_id: celluleId,
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

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert("❌ Erreur ajout membre : " + err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-orange-200 via-white to-blue-100">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-2xl">
        {/* Flèche retour */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-orange-500 font-semibold mb-4 hover:text-orange-600 transition-colors"
        >
          ← Retour
        </button>

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src="/logo.png" alt="Logo" className="w-20 h-18" />
        </div>

        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Ajouter un membre à ma cellule
        </h1>
        <p className="text-center text-gray-500 italic mb-6">
          🌿 « Chaque âme compte » – Luc 15:7
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1">Prénom</label>
            <input
              type="text"
              name="prenom"
              value={formData.prenom}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-orange-400 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Nom</label>
            <input
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-orange-400 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Téléphone</label>
            <input
              type="text"
              name="telephone"
              value={formData.telephone}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-orange-400 focus:outline-none"
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

          <div>
            <label className="block text-gray-700 mb-1">Ville</label>
            <input
              type="text"
              name="ville"
              value={formData.ville}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-orange-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Comment est-il venu ?</label>
            <select
              name="venu"
              value={formData.venu}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-orange-400 focus:outline-none"
            >
              <option value="">-- Sélectionner --</option>
              <option value="invité">Invité</option>
              <option value="réseaux">Réseaux</option>
              <option value="evangélisation">Evangélisation</option>
              <option value="autre">Autre</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Besoin de la personne ?</label>
            <select
              name="besoin"
              value={formData.besoin}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-orange-400 focus:outline-none"
            >
              <option value="">-- Sélectionner --</option>
              <option value="Finances">Finances</option>
              <option value="Santé">Santé</option>
              <option value="Travail">Travail</option>
              <option value="Les Enfants">Les Enfants</option>
              <option value="La Famille">La Famille</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Informations supplémentaires</label>
            <textarea
              name="infos_supplementaires"
              value={formData.infos_supplementaires}
              onChange={handleChange}
              rows={3}
              placeholder="Ajoute ici d'autres détails utiles sur la personne..."
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-orange-400 focus:outline-none"
            />
          </div>

          <div className="flex justify-start gap-4 mt-4">
            <button
              type="submit"
              className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl shadow-md transition-all"
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
              className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-2xl shadow-md transition-all"
            >
              Annuler
            </button>
          </div>
        </form>

        {success && (
          <p className="mt-4 text-center text-green-600 font-semibold">
            ✅ Membre ajouté avec succès à ta cellule !
          </p>
        )}
      </div>
    </div>
  );
}
