// pages/ajouter-membre-cellule.js
// ✅ pages/ajouter-membre-cellule.js
"use client";

import { useState, useEffect } from "react";
import supabase from "../lib/supabaseClient";
import Image from "next/image";
import { useRouter } from "next/router";

export default function AjouterMembreCellule() {
  const router = useRouter();

  const [responsableId, setResponsableId] = useState(null);
  const [cellule, setCellule] = useState(null);
  const [formData, setFormData] = useState({
    prenom: "",
    nom: "",
    telephone: "",
    ville: "",
    besoin: "",
    is_whatsapp: false,
    infos_supplementaires: "",
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // 🧩 Récupérer l'ID et le rôle du responsable
  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail");
    if (!storedEmail) {
      setError("⚠️ Responsable non identifié !");
      return;
    }

    const fetchResponsable = async () => {
      const { data: profil, error: profilError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", storedEmail)
        .single();

      if (profilError || !profil) {
        setError("⚠️ Erreur lors de la récupération du profil !");
        return;
      }

      setResponsableId(profil.id);

      // ✅ Récupération correcte de la cellule (utilise 'cellule' et non 'nom_cellule')
      const { data: cellules, error: celluleError } = await supabase
        .from("cellules")
        .select("id, cellule")
        .eq("responsable_id", profil.id);

      if (celluleError) {
        console.error("❌ Erreur récupération cellule:", celluleError);
        setError("⚠️ Erreur lors de la récupération de la cellule !");
        return;
      }

      if (!cellules || cellules.length === 0) {
        setError("⚠️ Aucune cellule trouvée pour ce responsable !");
        return;
      }

      setCellule(cellules[0]); // 🟢 cellule trouvée !
      setError("");
    };

    fetchResponsable();
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
    setError("");

    if (!responsableId || !cellule) {
      setError("⚠️ Responsable ou cellule introuvable !");
      return;
    }

    const newMembre = {
      ...formData,
      cellule_id: cellule.id,
      cellule_nom: cellule.cellule,
      responsable_id: responsableId,
      statut: "nouveau",
    };

    const { error: insertError } = await supabase
      .from("membres")
      .insert([newMembre]);

    if (insertError) {
      console.error(insertError);
      setError("❌ Impossible d’ajouter le membre.");
      return;
    }

    // ✅ Réinitialiser le formulaire et afficher succès
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
    setFormData({
      prenom: "",
      nom: "",
      telephone: "",
      ville: "",
      besoin: "",
      is_whatsapp: false,
      infos_supplementaires: "",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-blue-50 p-6">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md">
        {/* 🔹 Logo */}
        <div className="flex justify-center mb-6">
          <Image
            src="/logo.png"
            alt="Logo"
            width={80}
            height={80}
            className="object-contain"
          />
        </div>

        <h1 className="text-3xl font-bold text-center text-orange-600 mb-3">
          Ajouter un membre à ma cellule
        </h1>
        <p className="text-center text-gray-500 italic mb-6">
          « Allez, faites de toutes les nations des disciples » – Matthieu 28:19
        </p>

        {/* 🔻 Message d’erreur */}
        {error && (
          <div className="bg-red-100 text-red-700 text-center py-2 px-4 rounded-xl mb-4 font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            name="prenom"
            placeholder="Prénom"
            value={formData.prenom}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-400"
            required
          />
          <input
            type="text"
            name="nom"
            placeholder="Nom"
            value={formData.nom}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-400"
            required
          />
          <input
            type="text"
            name="telephone"
            placeholder="Téléphone"
            value={formData.telephone}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-400"
            required
          />

          <label className="flex items-center gap-2">
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
            className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-400"
          />

          <select
            name="besoin"
            value={formData.besoin}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-400"
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
            className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-400"
          />

          {/* 🔘 Boutons */}
          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl shadow-md transition-all"
            >
              Ajouter
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-2xl shadow-md transition-all"
            >
              Retour
            </button>
          </div>
        </form>

        {success && (
          <div className="text-green-600 font-semibold text-center mt-4">
            ✅ Membre ajouté avec succès !
          </div>
        )}
      </div>
    </div>
  );
}
