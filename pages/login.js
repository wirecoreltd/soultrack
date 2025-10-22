//pages/login.js

"use client";
import { useState } from "react";
import { useRouter } from "next/router";
import bcrypt from "bcryptjs"; // ✅ pour vérifier les mots de passe
import supabase from "../lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1️⃣ Récupérer l'utilisateur depuis Supabase
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", email)
        .single();

      if (profileError || !profile) {
        setError("Utilisateur introuvable");
        setLoading(false);
        return;
      }

      // 2️⃣ Vérifier le mot de passe avec bcrypt
      const verified = bcrypt.compareSync(password, profile.password_hash);

      if (!verified) {
        setError("Mot de passe incorrect");
        setLoading(false);
        return;
      }

      // 3️⃣ Déterminer le rôle
      let formattedRole = "Membre";
      if (Array.isArray(profile.roles) && profile.roles.length > 0) {
        if (profile.roles.includes("Admin")) formattedRole = "Admin";
        else if (profile.roles.includes("ResponsableIntegration")) formattedRole = "ResponsableIntegration";
        else if (profile.roles.includes("ResponsableEvangelisation")) formattedRole = "ResponsableEvangelisation";
        else if (profile.roles.includes("ResponsableCellule")) formattedRole = "ResponsableCellule";
      }

      // 4️⃣ Stocker localement
      localStorage.setItem("userId", profile.id);
      localStorage.setItem("userRole", formattedRole);

      // 5️⃣ Redirection selon rôle
      switch (formattedRole) {
        case "Admin":
          router.push("/index");
          break;
        case "ResponsableIntegration":
          router.push("/membres-hub");
          break;
        case "ResponsableEvangelisation":
          router.push("/evangelisation-hub");
          break;
        case "ResponsableCellule":
          router.push("/cellules-hub");
          break;
        default:
          router.push("/index");
      }
    } catch (err) {
      console.error("Erreur de connexion :", err);
      setError("❌ Une erreur est survenue lors de la connexion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-yellow-50 to-blue-100 p-6">
      <div className="bg-white p-10 rounded-3xl shadow-lg w-full max-w-md flex flex-col items-center">
        <h1 className="text-5xl font-handwriting text-black-800 mb-3 flex flex-col sm:flex-row items-center justify-center gap-3">
          <img src="/logo.png" alt="Logo SoulTrack" className="w-12 h-12 object-contain" />
          SoulTrack
        </h1>

        <p className="text-center text-gray-700 mb-6">
          Bienvenue sur SoulTrack !<br />
          Une plateforme pour garder le contact, organiser les visites,
          et soutenir chaque membre dans sa vie spirituelle.
        </p>

        <form onSubmit={handleLogin} className="flex flex-col w-full gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-gray-300 p-3 rounded-lg w-full text-center shadow-sm focus:outline-green-500 focus:ring-2 focus:ring-green-200 transition"
            required
            autoComplete="email"
          />

          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-gray-300 p-3 rounded-lg w-full text-center shadow-sm focus:outline-green-500 focus:ring-2 focus:ring-green-200 transition"
            required
            autoComplete="current-password"
          />

          {error && <p className="text-red-500 text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-green-400 to-blue-400 hover:from-green-500 hover:to-blue-500 text-white font-bold py-3 rounded-2xl shadow-md transition-all duration-200"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <p className="text-center italic font-semibold mt-4 text-green-600">
          "Aimez-vous les uns les autres comme je vous ai aimés." – Jean 13:34
        </p>
      </div>
    </div>
  );
}


