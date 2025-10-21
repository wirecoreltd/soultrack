//admin/create-responsable-cellule.js
"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import LogoutLink from "../../components/LogoutLink";
import supabase from "../../lib/supabaseClient";

// 🧮 Fonction pour hasher le mot de passe (compatible navigateur)
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
}

export default function CreateResponsableCellule() {
  const router = useRouter();
  const [ville, setVille] = useState("");
  const [cellule, setCellule] = useState("");
  const [responsable, setResponsable] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!ville || !cellule || !responsable || !telephone || !email || !password) {
      alert("Merci de remplir tous les champs requis.");
      return;
    }

    try {
      // Séparer le prénom et le nom
      const [prenom, nom] = responsable.split(" ");

      // 1️⃣ Vérifier si un profil existe déjà avec cet email
      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (existing) {
        alert("⚠️ Cet email est déjà utilisé pour un autre utilisateur !");
        return;
      }

      // 2️⃣ Hacher le mot de passe
      const hashedPassword = await hashPassword(password);

      // 3️⃣ Créer le profil du responsable
      const { data: newProfile, error: profileError } = await supabase
        .from("profiles")
        .insert([
          {
            email,
            password_hash: hashedPassword,
            prenom,
            nom,
            role: "ResponsableCellule",
          },
        ])
        .select()
        .single();

      if (profileError) throw profileError;

      // 4️⃣ Créer la cellule liée
      const { error: celluleError } = await supabase
        .from("cellules")
        .insert([
          {
            ville,
            cellule,
            responsable,
            telephone,
            responsable_id: newProfile.id,
          },
        ]);

      if (celluleError) throw celluleError;

      alert("✅ Responsable et cellule créés avec succès !");
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
          placeholder="Nom complet du responsable"
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
        <input
          type="email"
          placeholder="Email du responsable"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-3 rounded-xl"
          required
        />
        <input
          type="password"
          placeholder="Mot de passe (temporaire)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-3 rounded-xl"
          required
        />

        <button
          type="submit"
          className="bg-gradient-to-r from-[#005AA7] to-[#FFFDE4] text-gray-800 font-semibold rounded-xl py-3 mt-4 hover:opacity-90 transition"
        >
          Enregistrer le Responsable
        </button>
      </form>
    </div>
  );
}

