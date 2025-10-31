//✅pages/add-member.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import supabase from "../lib/supabaseClient";

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

    if (!hasRole("admin") && !hasRole("administrateur")) {
      alert("⛔ Accès non autorisé !");
      return;
    }

    try {
      const { error } = await supabase.from("membres").insert([formData]);
      if (error) throw error;

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);

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

  const handleCancel = () => {
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
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-indigo-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-2xl relative">

        {/* Retour */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 flex items-center text-gray-700 font-semibold hover:text-gray-900 transition-colors"
        >
          ← Retour
        </button>

        {/* Titre */}
        <h1 className="text-3xl font-bold text-center mb-4">Ajouter un nouveau membre</h1>
        <p className="text-center text-gray-500 italic mb-6">
          « Allez, faites de toutes les nations des disciples » – Matthieu 28:19
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input type="text" name="prenom" placeholder="Prénom" value={formData.prenom} onChange={handleChange} className="input" required />
          <input type="text" name="nom" placeholder="Nom" value={formData.nom} onChange={handleChange} className="input" required />
          <input type="text" name="telephone" placeholder="Téléphone" value={formData.telephone} onChange={handleChange} className="input" required />
          <input type="text" name="ville" placeholder="Ville" value={formData.ville} onChange={handleChange} className="input" />
          
          <label className="flex items-center gap-2 mt-1">
            <input type="checkbox" name="is_whatsapp" checked={formData.is_whatsapp} onChange={handleChange} />
            WhatsApp
          </label>

          <select name="statut" value={formData.statut} onChange={handleChange} className="input">
            <option value="">-- Statut --</option>
            <option value="veut rejoindre ICC">Veut rejoindre ICC</option>
            <option value="a déjà mon église">A déjà son église</option>
            <option value="visiteur">Visiteur</option>
          </select>

          <select name="venu" value={formData.venu} onChange={handleChange} className="input">
            <option value="">-- Comment est-il venu ? --</option>
            <option value="invité">Invité</option>
            <option value="réseaux">Réseaux</option>
            <option value="evangélisation">Evangélisation</option>
            <option value="autre">Autre</option>
          </select>

          <select name="besoin" value={formData.besoin} onChange={handleChange} className="input">
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
            className="input"
          />

          {/* Boutons côte à côte */}
          <div className="flex gap-4 mt-2">
            {/* Annuler à gauche */}
            <button type="button" onClick={handleCancel} className="flex-1 bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white font-bold py-3 rounded-2xl shadow-md transition-all">
              Annuler
            </button>
            {/* Ajouter à droite */}
            <button type="submit" className="flex-1 bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-bold py-3 rounded-2xl shadow-md transition-all">
              Ajouter
            </button>
          </div>
        </form>

        {success && <p className="text-green-600 font-semibold text-center mt-3">✅ Membre ajouté avec succès !</p>}

        <style jsx>{`
          .input {
            width: 100%;
            border: 1px solid #ccc;
            border-radius: 12px;
            padding: 12px;
            text-align: center;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            color: black;
          }
        `}</style>
      </div>
    </div>
  );
}
