// pages/add-evangelise.js
"use client";
import { useState } from "react";
import Image from "next/image";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

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

  const [loading, setLoading] = useState(false);
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
    setLoading(true);
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
      alert("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-200 via-amber-100 to-yellow-200 p-6">
      <div className="bg-white/70 rounded-3xl shadow-lg p-8 w-full max-w-md relative">
        
        {/* Bouton retour */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 text-white bg-amber-500 hover:bg-amber-600 transition px-3 py-1.5 rounded-full shadow-md"
        >
          ← Retour
        </button>

        {/* Logo */}
        <div className="flex justify-center mb-4 mt-6">
          <Image src="/images/logo.png" alt="Logo" width={80} height={80} />
        </div>

        {/* Titre */}
        <h1 className="text-3xl font-handwriting text-center mb-2 text-gray-800">
          Ajouter une Personne Évangélisée
        </h1>
        <p className="text-center text-gray-600 italic mb-6">
          « Allez, faites de toutes les nations des disciples » – Matthieu 28:19
        </p>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Prénom</label>
            <input
              type="text"
              name="prenom"
              value={formData.prenom}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-full border border-gray-300 focus:ring-2 focus:ring-amber-400 outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Nom</label>
            <input
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-full border border-gray-300 focus:ring-2 focus:ring-amber-400 outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Téléphone</label>
            <input
              type="text"
              name="telephone"
              value={formData.telephone}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-full border border-gray-300 focus:ring-2 focus:ring-amber-400 outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="is_whatsapp"
              checked={formData.is_whatsapp}
              onChange={handleChange}
              className="h-5 w-5"
            />
            <label className="text-gray-700 font-medium">Ce numéro a WhatsApp</label>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Ville</label>
            <input
              type="text"
              name="ville"
              value={formData.ville}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-full border border-gray-300 focus:ring-2 focus:ring-amber-400 outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Besoin de la personne
            </label>
            <textarea
              name="besoin"
              value={formData.besoin}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 rounded-2xl border border-gray-300 focus:ring-2 focus:ring-amber-400 outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Informations supplémentaires
            </label>
            <textarea
              name="infos_supplementaires"
              value={formData.infos_supplementaires}
              onChange={handleChange}
              rows={2}
              className="w-full px-4 py-2 rounded-2xl border border-gray-300 focus:ring-2 focus:ring-amber-400 outline-none"
            />
          </div>

          {/* Boutons */}
          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={() =>
                setFormData({
                  nom: "",
                  prenom: "",
                  telephone: "",
                  ville: "",
                  statut: "evangelisé",
                  infos_supplementaires: "",
                  is_whatsapp: false,
                  besoin: "",
                })
              }
              className="flex-1 mr-2 bg-gradient-to-r from-amber-400 to-yellow-300 hover:opacity-90 text-white font-semibold py-2 rounded-full shadow-md transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 ml-2 bg-gradient-to-r from-yellow-400 to-amber-400 hover:opacity-90 text-white font-semibold py-2 rounded-full shadow-md transition"
            >
              {loading ? "Ajout..." : "Ajouter"}
            </button>
          </div>
        </form>

        {/* Message succès */}
        {success && (
          <div className="text-green-600 font-semibold text-center mt-4">
            ✅ Personne évangélisée ajoutée avec succès !
          </div>
        )}
      </div>
    </div>
  );
}
