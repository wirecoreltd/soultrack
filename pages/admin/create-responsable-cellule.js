//admin/create-responsable-cellule.js

"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import LogoutLink from "../../components/LogoutLink";
import supabase from "../../lib/supabaseClient"; // ✅ import par défaut

export default function CreateResponsableCellule() {
  const router = useRouter();
  const [ville, setVille] = useState("");
  const [cellule, setCellule] = useState("");
  const [responsable, setResponsable] = useState("");
  const [telephone, setTelephone] = useState("");
  const [telephoneResponsable, setTelephoneResponsable] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!ville || !cellule || !responsable || !telephone) {
      alert("Merci de remplir tous les champs requis.");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("cellules")
        .insert([
          {
            ville,
            cellule,
            responsable,
            telephone,
            telephone_responsable: telephoneResponsable,
          },
        ]);

      if (error) throw error;

      alert("✅ Responsable de cellule enregistré avec succès !");
      router.push("/administrateur");
    } catch (err) {
      console.error(err);
      alert("❌ Erreur : " + err.message);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{
        background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)",
      }}
    >
      {/* 🔹 En-tête */}
      <div className="w-full max-w-3xl flex justify-between items-center mb-6">
        <button
          onClick={() => router.back()}
          className="text-white font-semibold hover:text-gray-200"
        >
          ← Retour
        </button>

        <div className="flex items-center gap-4">
          <Image src="/logo.png" alt="SoulTrack Logo" width={60} height={60} />
          <LogoutLink />
        </div>
      </div>

      {/* 🔹 Titre */}
      <h1 className="text-3xl text-white font-handwriting mb-6 text-center">
        Créer un Responsable de Cellule
      </h1>

      {/* 🔹 Formulaire */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl shadow-md p-8 w-full max-w-md flex flex-col gap-4"
      >
        <input
          type="text"
          placeholder="Ville"
          value={ville}
          onChange={(e) => setVille(e.target.value)}
          className="border p-3 rounded-xl"
          required
        />
        <input
          type="text"
          placeholder="Nom de la cellule"
          value={cellule}
          onChange={(e) => setCellule(e.target.value)}
          className="border p-3 rounded-xl"
          required
        />
        <input
          type="text"
          placeholder="Nom du responsable"
          value={responsable}
          onChange={(e) => setResponsable(e.target.value)}
          className="border p-3 rounded-xl"
          required
        />
        <input
          type="tel"
          placeholder="Téléphone"
          value={telephone}
          onChange={(e) => setTelephone(e.target.value)}
          className="border p-3 rounded-xl"
          required
        />
        <button
          type="submit"
          className="bg-gradient-to-r from-[#005AA7] to-[#FFFDE4] text-gray-800 font-semibold rounded-xl py-3 mt-4 hover:opacity-90 transition"
        >
          Enregistrer
        </button>
      </form>
    </div>
  );
}
