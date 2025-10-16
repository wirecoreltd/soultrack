"use client";

import { useState } from "react";
import { useRouter } from "next/router";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Exemple de comptes de test (tu peux remplacer par ton backend)
  const users = [
    { email: "admin@example.com", password: "admin123", role: "Admin" },
    { email: "integration@example.com", password: "1234", role: "ResponsableIntegration" },
    { email: "evangelisation@example.com", password: "1234", role: "ResponsableEvangelisation" },
    { email: "membre@example.com", password: "1234", role: "Membre" },
  ];

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    const user = users.find(
      (u) => u.email === email.trim() && u.password === password.trim()
    );

    if (!user) {
      setError("❌ Identifiants invalides");
      return;
    }

    // ✅ Enregistre le rôle et l'ID utilisateur dans le localStorage
    localStorage.setItem("userRole", user.role);
    localStorage.setItem("userId", user.email);

    // Redirige selon le rôle (tous vont vers /index, la logique interne gère la suite)
    router.push("/");
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-center items-center p-6"
      style={{
        background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)",
      }}
    >
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Connexion
        </h1>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Adresse email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm font-semibold text-center">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="mt-2 bg-gradient-to-r from-blue-600 to-blue-400 text-white font-semibold rounded-xl py-2 hover:opacity-90 transition"
          >
            Se connecter
          </button>
        </form>
      </div>

      <p className="mt-4 text-white text-center text-sm">
        SoulTrack © 2025 — Chaque membre compte ❤️
      </p>
    </div>
  );
}
