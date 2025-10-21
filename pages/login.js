// ✅ pages/login.js
"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import supabase from "../lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // 🧮 Fonction pour hasher le mot de passe (SHA-256)
  async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const hashedPassword = await hashPassword(password);

      // 🔍 Vérifie dans la table profiles
      const { data: user, error } = await supabase
        .from("profiles")
        .select("id, prenom, nom, email, password_hash, roles")
        .eq("email", email)
        .single();

      if (error || !user) {
        alert("❌ Utilisateur non trouvé !");
        setLoading(false);
        return;
      }

      if (user.password_hash !== hashedPassword) {
        alert("❌ Mot de passe incorrect !");
        setLoading(false);
        return;
      }

      // ✅ Stocke l’ID et le rôle (en JSON)
      localStorage.setItem("userId", user.id);
      localStorage.setItem("userRole", JSON.stringify(user.roles));

      // ✅ Redirection selon rôle
      if (user.roles.includes("Admin")) {
        router.push("/");
      } else if (user.roles.includes("ResponsableEvangelisation")) {
        router.push("/evangelisation-hub");
      } else if (user.roles.includes("ResponsableIntegration")) {
        router.push("/membres-hub");
      } else if (user.roles.includes("ResponsableCellule")) {
        router.push("/cellules-hub");
      } else {
        router.push("/");
      }
    } catch (err) {
      console.error(err);
      alert("❌ Une erreur s’est produite lors de la connexion");
    }

    setLoading(false);
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-center items-center p-6"
      style={{
        background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)",
      }}
    >
      <div className="flex flex-col items-center mb-6">
        <Image src="/logo.png" alt="SoulTrack Logo" width={90} height={90} />
        <h1 className="text-4xl text-white font-bold mt-4 mb-2">SoulTrack</h1>
        <p className="text-white text-center max-w-md">
          Connectez-vous pour suivre et servir avec excellence 💪
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md"
      >
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full border rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full border rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-400 text-white py-2 rounded-xl font-semibold hover:opacity-90 transition"
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </form>
    </div>
  );
}
