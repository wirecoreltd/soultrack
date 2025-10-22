//pages/login.js
"use client";

import { useState } from "react";
import { useRouter } from "next/router";
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
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
    return hashHex;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 🔎 Vérifie si l'utilisateur existe
      const { data: user, error } = await supabase
        .from("profiles")
        .select("id, email, password_hash, roles")
        .eq("email", email.toLowerCase())
        .single();

      if (error || !user) {
        alert("❌ Utilisateur non trouvé !");
        setLoading(false);
        return;
      }

      // 🔑 Vérifie le mot de passe
      const hashedPassword = await hashPassword(password);
      if (hashedPassword !== user.password_hash) {
        alert("❌ Mot de passe incorrect !");
        setLoading(false);
        return;
      }

      // ✅ Sauvegarde du rôle dans le localStorage
      const userRole = Array.isArray(user.roles) ? user.roles[0] : user.roles;
      localStorage.setItem("userId", user.id);
      localStorage.setItem("userRole", userRole);

      alert(`✅ Bienvenue ${userRole} !`);
      router.push("/");

    } catch (err) {
      console.error(err);
      alert("Erreur de connexion !");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center"
      style={{
        background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)",
      }}
    >
      <h1 className="text-4xl font-bold text-white mb-6">Connexion</h1>

      <form onSubmit={handleLogin}
        className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md flex flex-col gap-4"
      >
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <button
          type="submit"
          disabled={loading}
          className="mt-2 bg-gradient-to-r from-blue-600 to-blue-400 text-white font-semibold rounded-xl py-2 hover:opacity-90 transition"
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </form>
    </div>
  );
}
