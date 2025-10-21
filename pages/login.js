// ✅ pages/login.js
"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import supabase from "../lib/supabaseClient";
import Image from "next/image";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // 🧩 On interroge la table "profiles"
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, password, roles") // ⚡ "roles" doit être un champ text[] (tableau)
      .eq("email", email)
      .single();

    if (error || !data) {
      setMessage("Utilisateur non trouvé ❌");
      setLoading(false);
      return;
    }

    if (data.password !== password) {
      setMessage("Mot de passe incorrect ❌");
      setLoading(false);
      return;
    }

    try {
      // 🧠 Si "roles" est un tableau → on garde, sinon on convertit
      const rolesArray = Array.isArray(data.roles)
        ? data.roles
        : [data.roles || ""];

      // 💾 Sauvegarde des infos utilisateur
      localStorage.setItem("userEmail", data.email);
      localStorage.setItem("userId", data.id);
      localStorage.setItem("userRole", JSON.stringify(rolesArray));

      setMessage("Connexion réussie ✅");
      router.push("/");
    } catch (err) {
      console.error("Erreur de login:", err);
      setMessage("Erreur interne ⚠️");
    }

    setLoading(false);
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-center items-center text-center px-6"
      style={{
        background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)",
      }}
    >
      {/* Logo */}
      <Image
        src="/logo.png"
        alt="SoulTrack Logo"
        width={100}
        height={100}
        className="mb-6"
      />

      <h1 className="text-4xl font-bold text-white mb-4">Connexion</h1>

      <form
        onSubmit={handleLogin}
        className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm"
      >
        <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 p-3 border rounded-xl focus:outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Mot de passe"
          className="w-full mb-4 p-3 border rounded-xl focus:outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition"
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>

        {message && (
          <p className="mt-4 text-gray-700 font-semibold">{message}</p>
        )}
      </form>
    </div>
  );
}
