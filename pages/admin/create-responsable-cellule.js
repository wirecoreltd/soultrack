"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import LogoutLink from "../../components/LogoutLink";
import supabase from "../../lib/supabaseClient";

export default function CreateResponsableCellule() {
  const router = useRouter();
  const [ville, setVille] = useState("");
  const [cellule, setCellule] = useState("");
  const [responsableId, setResponsableId] = useState(""); // ⚡ stocke l'ID du responsable
  const [telephone, setTelephone] = useState("");
  const [responsables, setResponsables] = useState([]); // ⚡ liste des responsables

  // 🔹 Récupérer les responsables depuis profiles
  useEffect(() => {
    const fetchResponsables = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, prenom, nom, roles")
        .contains("roles", ["ResponsableCellule"]); // filtre par rôle

      if (error) {
        console.error("Erreur fetch responsables:", error);
      } else {
        setResponsables(data);
      }
    };

    fetchResponsables();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!ville || !cellule || !responsableId || !telephone) {
      alert("Merci de remplir tous les champs requis.");
      return;
    }

    try {
      const responsable = responsables.find(r => r.id === responsableId);
      const responsableNom = `${responsable.prenom} ${responsable.nom}`;

      const { data, error } = await supabase
        .from("cellules")
        .insert([
          {
            ville,
            cellule,
            responsable: responsableNom,
            telephone,
            responsable_id: responsableId, // lien direct vers le profil
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
      style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}
    >
      <div className="w-full max-w-3xl flex justify-between items-center mb-6">
        <button onClick={() => router.back()} className="text-white font-semibold hover:text-gray-200">
          ← Retour
        </button>
        <div className="flex items-center gap-4">
          <Image src="/logo.png" alt="SoulTrack Logo" width={60} height={60} />
          <LogoutLink />
        </div>
      </div>

      <h1 className="text-3xl text-white font-handwriting mb-6 text-center">
        Créer un Responsable de Cellule
      </h1>

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

        {/* 🔹 Menu déroulant pour les responsables */}
        <select
          value={responsableId}
          onChange={(e) => setResponsableId(e.target.value)}
          className="border p-3 rounded-xl"
          required
        >
          <option value="">Sélectionnez un responsable</option>
          {responsables.map((respo) => (
            <option key={respo.id} value={respo.id}>
              {respo.prenom} {respo.nom}
            </option>
          ))}
        </select>

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
