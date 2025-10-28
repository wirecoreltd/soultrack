//pages/add-member.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import supabase from "../lib/supabaseClient";
import Image from "next/image";

export default function AddMember() {
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

  const [success, setSuccess] = useState(false);

  // ✅ Gestion du rôle (facultatif)
  const [roles, setRoles] = useState([]);
  useEffect(() => {
    const storedRole = localStorage.getItem("userRole");
    if (storedRole) {
      let parsedRoles = [];
      try {
        parsedRoles = JSON.parse(storedRole);
        if (!Array.isArray(parsedRoles)) parsedRoles = [parsedRoles];
      } catch {
        parsedRoles = [storedRole];
      }
      setRoles(parsedRoles.map(r => r.toLowerCase().trim()));
    }
  }, []);

  const hasRole = role =>
    roles.includes(role.toLowerCase()) ||
    (role === "admin" && roles.includes("administrateur")) ||
    (role === "administrateur" && roles.includes("admin"));

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🔹 Vérification rôle si nécessaire
    if (!hasRole("admin") && !hasRole("administrateur")) {
      alert("⛔ Accès non autorisé !");
      return;
    }

    try {
      const { error } = await supabase.from("membres").insert([formData]);
      if (error) throw error;

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);

      // Reset formulaire
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
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-100 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-2xl">

        {/* 🔹 Logo au centre */}
        <div className="flex justify-center mb-6">
          <Image
            src="/logo.png"
            alt="SoulTrack Logo"
            width={80}
            height={80}
            className="object-contain"
          />
        </div>

        <button
          onClick={() => router.back()}
          className="flex items-center text-orange-500 font-semibold mb-4 hover:text-orange-600 transition-colors"
        >
          ← Retour
        </button>

        <h1 className="text-3xl font-extrabold text-center text-indigo-700 mb-2">
          Ajouter un nouveau membre
        </h1>
        <p className="text-center text-gray-500 italic mb-6">
          « Allez, faites de toutes les nations des disciples » – Matthieu 28:19
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Prénom */}
          <input
            type="text"
            name="prenom"
            placeholder="Prénom"
            value={formData.prenom}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            required
          />

          {/* Nom */}
          <input
            type="text"
            name="nom"
            placeholder="Nom"
            value={formData.nom}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            required
          />

          {/* Téléphone */}
          <input
            type="text"
            name="telephone"
            placeholder="Téléphone"
            value={formData.telephone}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
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
            className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />

          {/* Statut */}
          <select
            name="statut"
            value={formData.statut}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="">-- Statut --</option>
            <option value="veut rejoindre ICC">Veut rejoindre ICC</option>
            <option value="a déjà mon église">A déjà son église</option>
            <option value="visiteur">Visiteur</option>
          </select>

          {/* Comment est venu */}
          <select
            name="venu"
            value={formData.venu}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
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
            className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
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
            className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />

          {/* Boutons */}
          <div className="flex gap-4">
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


