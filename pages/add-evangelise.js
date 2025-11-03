// ✅pages/add-evangelise.js

"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/router";
import Image from "next/image";

// --- Supabase Client ---
const supabase = createClient(
  "https://qdxbcbpbjozvxgpusadi.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkeGJjYnBiam96dnhncHVzYWRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyNjQ0NTQsImV4cCI6MjA3Mzg0MDQ1NH0.pWlel0AkViXCmKRHP0cvk84RCBH_VEWsZEZEKJscDZ8"
);

export default function AddEvangelise() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    telephone: "",
    ville: "",
    statut: "evangelisé",
    infos_supplementaires: "",
    is_whatsapp: false,
    besoin: "",
  });

  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from("evangelises").insert([formData]);
      if (error) throw error;

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);

      setFormData({
        nom: "",
        prenom: "",
        telephone: "",
        ville: "",
        statut: "evangelisé",
        infos_supplementaires: "",
        is_whatsapp: false,
        besoin: "",
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
      statut: "evangelisé",
      infos_supplementaires: "",
      is_whatsapp: false,
      besoin: "",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-200 via-pink-100 to-yellow-100 p-6">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-lg relative">

        {/* Flèche retour */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 flex items-center text-black hover:text-gray-800 transition-colors"
        >
          ← Retour
        </button>

        {/* Logo centré */}
        <div className="flex justify-center mb-6">
          <Image src="/logo.png" alt="SoulTrack Logo" width={80} height={80} />
        </div>

        {/* Titre */}
        <h1 className="text-3xl font-bold text-center mb-2">Ajouter une personne évangélisée</h1>
        <p className="text-center text-gray-500 italic mb-6">
          « Allez, faites de toutes les nations des disciples » – Matthieu 28:19
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input type="text" name="prenom" placeholder="Prénom" value={formData.prenom} onChange={handleChange} className="input" required />
          <input type="text" name="nom" placeholder="Nom" value={formData.nom} onChange={handleChange} className="input" required />
          <input type="text" name="telephone" placeholder="Téléphone" value={formData.telephone} onChange={handleChange} className="input" required />
          
          <label className="flex items-center gap-2 mt-1">
            <input type="checkbox" name="is_whatsapp" checked={formData.is_whatsapp} onChange={handleChange} />
            WhatsApp
          </label>

          <input type="text" name="ville" placeholder="Ville" value={formData.ville} onChange={handleChange} className="input" />

          <textarea
            name="besoin"
            value={formData.besoin}
            onChange={handleChange}
            rows={3}
            placeholder="Besoin de la personne"
            className="input"
          />

          <textarea
            name="infos_supplementaires"
            value={formData.infos_supplementaires}
            onChange={handleChange}
            rows={2}
            placeholder="Informations supplémentaires..."
            className="input"
          />

          {/* Boutons côte à côte */}
          <div className="flex gap-4 mt-2">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white font-bold py-3 rounded-2xl shadow-md transition-all"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600 text-white font-bold py-3 rounded-2xl shadow-md transition-all"
            >
              Ajouter
            </button>
          </div>
        </form>

        {success && (
          <p className="text-green-600 font-semibold text-center mt-3">
            ✅ Personne évangélisée ajoutée avec succès !
          </p>
        )}

        <style jsx>{`
          .input {
            width: 100%;
            border: 1px solid #ccc;
            border-radius: 12px;
            padding: 12px;
            text-align: left;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            color: black;
          }
        `}</style>
      </div>
    </div>
  );
}
