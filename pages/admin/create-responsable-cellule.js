"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { supabase } from "../../lib/supabaseClient";
import LogoutLink from "../../components/LogoutLink";

export default function CreateResponsableCellule() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    ville: "",
    cellule: "",
    responsable: "",
    telephone: "",
    telephone_responsable: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Validation simple
    if (
      !formData.ville ||
      !formData.cellule ||
      !formData.responsable ||
      !formData.telephone
    ) {
      setMessage("⚠️ Merci de remplir tous les champs obligatoires.");
      setLoading(false);
      return;
    }

    // Insertion dans Supabase
    const { error } = await supabase.from("cellules").insert([
      {
        ville: formData.ville.trim(),
        cellule: formData.cellule.trim(),
        responsable: formData.responsable.trim(),
        telephone: formData.telephone.trim(),
        telephone_responsable: formData.telephone_responsable.trim() || null,
      },
    ]);

    if (error) {
      console.error(error);
      setMessage("❌ Erreur lors de la création du responsable.");
    } else {
      setMessage("✅ Responsable de cellule créé avec succès !");
      setFormData({
        ville: "",
        cellule: "",
        responsable: "",
        telephone: "",
        telephone_responsable: "",
      });
    }

    setLoading(false);
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{
        background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)",
      }}
    >
      {/* 🔹 Top bar */}
      <div className="absolute top-4 left-4">
        <button
          onClick={() => router.back()}
          className="text-white font-semibold hover:text-gray-200 transition"
        >
          ← Retour
        </button>
      </div>

      <div className="absolute top-4 right-4">
        <LogoutLink />
      </div>

      {/* 🔹 Logo */}
      <div className="mb-4">
        <Image src="/logo.png" alt="SoulTrack Logo" width={80} height={80} />
      </div>

      {/* 🔹 Titre */}
      <h1 className="text-3xl text-white font-handwriting mb-6 text-center">
        Créer un Responsable de Cellule
      </h1>

      {/* 🔹 Formulaire */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl shadow-md p-6 w-full max-w-md space-y-4"
      >
        <div>
          <label className="block text-gray-700 font-semibold mb-1">
            Ville *
          </label>
          <input
            type="text"
            name="ville"
            value={formData.ville}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-2"
            placeholder="Ex : Abidjan"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-1">
            Nom de la cellule *
          </label>
          <input
            type="text"
            name="cellule"
            value={formData.cellule}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-2"
            placeholder="Ex : Cellule Grâce"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-1">
            Nom du responsable *
          </label>
          <input
            type="text"
            name="responsable"
            value={formData.responsable}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-2"
            placeholder="Ex : Jean Dupont"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-1">
            Téléphone *
          </label>
          <input
            type="text"
            name="telephone"
            value={formData.telephone}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-2"
            placeholder="Ex : +225 0700000000"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full text-white py-3 rounded-lg font-semibold transition ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-[#005AA7] to-[#FFFDE4] hover:opacity-90"
          }`}
        >
          {loading ? "Enregistrement..." : "Créer le responsable"}
        </button>

        {message && (
          <p className="text-center mt-3 font-semibold text-gray-700">
            {message}
          </p>
        )}
      </form>

      {/* 🔹 Verset */}
      <div className="mt-10 text-center text-white text-lg font-handwriting-light max-w-2xl">
        Car le corps ne se compose pas d’un seul membre, mais de plusieurs. <br />
        1 Corinthiens 12:14 ❤️
      </div>
    </div>
  );
}
