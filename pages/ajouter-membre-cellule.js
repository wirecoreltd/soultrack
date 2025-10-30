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
  const [responsableCelluleId, setResponsableCelluleId] = useState(null);
  const [celluleId, setCelluleId] = useState(null);

  // ✅ Récupérer la cellule du responsable connecté
  useEffect(() => {
    const fetchCellule = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) return;

        setResponsableCelluleId(userId);

        const { data, error } = await supabase
          .from("cellules")
          .select("id, nom_cellule")
          .eq("responsable_id", userId);

        if (error) throw error;

        if (!data || data.length === 0) {
          setCelluleId(null);
          console.warn("⚠️ Aucune cellule assignée à ce responsable !");
          return;
        }

        // Prendre la première cellule si plusieurs
        setCelluleId(data[0].id);
      } catch (err) {
        console.error("Erreur récupération cellule :", err.message);
        setCelluleId(null);
      }
    };
    fetchCellule();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!celluleId) {
      alert(
        "⚠️ Vous n'avez pas encore de cellule assignée. Contactez l'administrateur !"
      );
      return;
    }

    try {
      const { error } = await supabase.from("membres").insert([
        {
          ...formData,
          statut: "Integrer",
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
      alert("❌ Impossible d’ajouter le membre : " + err.message);
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
          <img src="/logo.png" alt="Logo" className="w-20 h-20" />
        </div>

        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Ajouter un membre à ma cellule
        </h1>
        <p className="text-center text-gray-500 italic mb-6">
          « Allez, faites de toutes les nations des disciples » – Matthieu 28:19
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Prénom */}
          <input
            type="text"
            name="prenom"
            placeholder="Prénom"
            value={formData.prenom}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-orange-400 focus:outline-none"
            required
          />

          {/* Nom */}
          <input
            type="text"
            name="nom"
            placeholder="Nom"
            value={formData.nom}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-orange-400 focus:outline-none"
            required
          />

          {/* Téléphone */}
          <input
            type="text"
            name="telephone"
            placeholder="Téléphone"
            value={formData.telephone}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-orange-400 focus:outline-none"
            required
          />

          {/* WhatsApp */}
          <label className="flex items-center gap-2 mt-1">
            <input
              type="checkbox"
              name="is_whatsapp"
              checked={formData.is_whatsapp}
              onChange={handleChange}
            />
            WhatsApp
          </label>

          {/* Ville */}
          <input
            type="text"
            name="ville"
            placeholder="Ville"
            value={formData.ville}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-orange-400 focus:outline-none"
          />

          {/* Comment est-il venu */}
          <select
            name="venu"
            value={formData.venu}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-orange-400 focus:outline-none"
          >
            <option value="">-- Comment est-il venu ? --</option>
            <option value="invité">Invité</option>
            <option value="réseaux">Réseaux</option>
            <option value="evangélisation">Evangélisation</option>
            <option value="autre">Autre</option>
          </select>

          {/* Besoin */}
          <select
            name="besoin"
            value={formData.besoin}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-orange-400 focus:outline-none"
          >
            <option value="">-- Besoin --</option>
            <option value="Finances">Finances</option>
            <option value="Santé">Santé</option>
            <option value="Travail">Travail</option>
            <option value="Les Enfants">Les Enfants</option>
            <option value="La Famille">La Famille</option>
          </select>

          {/* Infos supplémentaires */}
          <textarea
            name="infos_supplementaires"
            value={formData.infos_supplementaires}
            onChange={handleChange}
            rows={3}
            placeholder="Informations supplémentaires..."
            className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-orange-400 focus:outline-none"
          />

          {/* Boutons */}
          <div className="flex gap-4 mt-4">
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
            <button
              type="submit"
              className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl shadow-md transition-all"
            >
              Ajouter
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
