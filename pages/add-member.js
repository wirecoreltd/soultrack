//✅pages/add-member.js

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
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
    besoin: [],
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

    if (type === "checkbox" && name === "besoin") {
      setFormData(prev => {
        const updatedBesoin = checked
          ? [...prev.besoin, value]
          : prev.besoin.filter(b => b !== value);
        return { ...prev, besoin: updatedBesoin };
      });
      return;
    }

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
        besoin: [],
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
      besoin: [],
      is_whatsapp: false,
      infos_supplementaires: "",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-200 via-pink-100 to-yellow-100 p-6">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-lg relative">

        {/* Flèche retour */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 flex items-center text-black font-semibold hover:text-gray-800 transition-colors"
        >
          ← Retour
        </button>

        {/* Logo centré */}
        <div className="flex justify-center mb-6">
          <Image src="/logo.png" alt="SoulTrack Logo" width={80} height={80} />
        </div>

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

          {/* ✅ BESOINS en Checkboxes */}
          <div>
            <p className="font-semibold mb-1">Besoin :</p>

            {["Finances", "Santé", "Travail", "Les Enfants", "La Famille"].map((item) => (
              <label key={item} className="flex items-center gap-2 mb-1 cursor-pointer">
                <input
                  type="checkbox"
                  name="besoin"
                  value={item}
                  checked={formData.besoin.includes(item)}
                  onChange={handleChange}
                  className="rounded-md"
                />
                {item}
              </label>
            ))}
          </div>

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
            <button type="button" onClick={handleCancel} className="flex-1 bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white font-bold py-3 rounded-2xl shadow-md transition-all">
              Annuler
            </button>
            <button type="submit" className="flex-1 bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600 text-white font-bold py-3 rounded-2xl shadow-md transition-all">
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
            text-align: left; /* ✅ correction faite */
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            color: black;
          }
        `}</style>
      </div>
    </div>
  );
}
