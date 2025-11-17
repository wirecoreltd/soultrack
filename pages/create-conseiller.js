//pages/create-conseiller.js

"use client";

import { useState } from "react";
import supabase from "../lib/supabaseClient";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function CreateConseiller() {
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prenom || !nom || !telephone)
      return alert("Remplissez tous les champs !");

    setLoading(true);

    const { error } = await supabase
      .from("conseillers")
      .insert([{ prenom, nom, telephone, disponible: true }]);

    setLoading(false);

    if (error) {
      console.error(error);
      alert("Erreur lors de l'ajout du conseiller !");
    } else {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);

      // Reset fields
      setPrenom("");
      setNom("");
      setTelephone("");

      router.push("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-200 via-pink-100 to-yellow-100 p-6">

      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-lg relative">

        {/* 🔙 Bouton Retour */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 flex items-center text-black font-semibold hover:text-gray-800 transition-colors"
        >
          ← Retour
        </button>

        {/* 🟣 Logo */}
        <div className="flex justify-center mb-6">
          <Image src="/logo.png" alt="SoulTrack Logo" width={80} height={80} />
        </div>

        {/* 📝 Titre */}
        <h1 className="text-3xl font-bold text-center mb-4">
          Ajouter un Conseiller
        </h1>
        <p className="text-center text-gray-500 italic mb-6">
          « Les ouvriers sont peu nombreux » – Matthieu 9:37
        </p>

        {/* FORMULAIRE */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Prénom"
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
            className="input"
            required
          />

          <input
            type="text"
            placeholder="Nom"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className="input"
            required
          />

          <input
            type="text"
            placeholder="Téléphone"
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            className="input"
            required
          />

          {/* 🔘 Boutons */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-2xl text-white font-bold shadow-md transition-all bg-gradient-to-r
             ${loading
                ? "from-gray-400 to-gray-500"
                : "from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600"
              }`}
          >
            {loading ? "Création..." : "Créer le Conseiller"}
          </button>
        </form>

        {/* Message Confirm */}
        {success && (
          <p className="text-green-600 font-semibold text-center mt-4 animate-pulse">
            ✅ Conseiller ajouté avec succès !
          </p>
        )}

        {/* Styles globaux */}
        <style jsx>{`
          .input {
            width: 100%;
            border: 1px solid #ccc;
            border-radius: 12px;
            padding: 12px;
            text-align: left;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            color: black;
          }
        `}</style>
      </div>
    </div>
  );
}
