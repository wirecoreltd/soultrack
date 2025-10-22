//pages/login.js
"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import supabase from "../lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const { data: user, error: loginError } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", email)
        .single();

      if (loginError || !user) {
        setMessage("❌ Utilisateur non trouvé !");
        return;
      }

      // Vérifie le mot de passe hashé
      const encoder = new TextEncoder();
      const hashBuffer = await crypto.subtle.digest(
        "SHA-256",
        encoder.encode(password)
      );
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashedPassword = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

      if (hashedPassword !== user.password_hash) {
        setMessage("❌ Mot de passe incorrect !");
        return;
      }

      // ✅ Corrige ici : détecte le bon rôle (role ou roles[0])
      const userRole =
        user.role ||
        (Array.isArray(user.roles) && user.roles.length > 0
          ? user.roles[0]
          : null);

      if (!userRole) {
        setMessage("❌ Aucun rôle attribué à cet utilisateur !");
        return;
      }

      // Stocke les infos
      localStorage.setItem("userId", user.id);
      localStorage.setItem("userRole", userRole);
      localStorage.setItem("userEmail", user.email);

      // ✅ Redirige selon le rôle
      if (userRole === "Admin") router.push("/index");
      else if (userRole === "ResponsableIntegration") router.push("/membres-hub");
      else if (userRole === "ResponsableEvangelisation") router.push("/evangelisation-hub");
      else if (userRole === "ResponsableCellule") router.push("/cellules-hub");
      else router.push("/index");

    } catch (err) {
      console.error("Erreur de connexion:", err);
      setMessage("⚠️ Une erreur est survenue lors de la connexion.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 to-blue-400 text-white p-4">
      <h1 className="text-4xl font-handwriting mb-4">Connexion</h1>
      <form
        onSubmit={handleLogin}
        className="bg-white text-gray-800 rounded-2xl shadow-lg p-8 w-full max-w-sm"
      >
        <label className="block mb-2 font-semibold">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        <label className="block mb-2 font-semibold">Mot de passe</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-6 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
        >
          Se connecter
        </button>

        {message && (
          <p className="text-center text-red-500 font-semibold mt-4">{message}</p>
        )}
      </form>
    </div>
  );
}
