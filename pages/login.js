// pages/login.js
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "../lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError || !authData.user) {
        setError("❌ Email ou mot de passe incorrect");
        setLoading(false);
        return;
      }

      // Connexion réussie, stocker userId et info de base
      const user = authData.user;
      localStorage.setItem("userEmail", email);
      localStorage.setItem("userId", user.id);

      // Récupérer le profil pour redirection selon rôle
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, role, prenom, nom, telephone")
        .eq("id", user.id)
        .single();

      if (profileError) {
        setError("❌ Impossible de récupérer le profil");
        setLoading(false);
        return;
      }

      localStorage.setItem("userRole", JSON.stringify([profile.role]));
      localStorage.setItem("profile", JSON.stringify(profile));

      // Redirection selon rôle
      switch (profile.role) {
        case "Administrateur":
          router.push("/");
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
        case "SuperviseurCellule":
          router.push("/cellules-hub");
          break;
        case "Conseiller":
          router.push("/conseiller-hub");
          break;
        default:
          router.push("/");
      }
    } catch (err) {
      console.error(err);
      setError("❌ Erreur lors de la connexion");
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
          Bienvenue sur SoulTrack ! Une plateforme pour garder le contact et suivre chaque membre.
        </p>

        <form onSubmit={handleLogin} className="flex flex-col w-full gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border border-gray-300 p-3 rounded-lg w-full text-center shadow-sm"
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border border-gray-300 p-3 rounded-lg w-full text-center shadow-sm"
          />

          {error && <p className="text-red-500 text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-green-400 to-blue-400 hover:from-green-500 hover:to-blue-500 text-white font-bold py-3 rounded-2xl shadow-md"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <button
          onClick={() => router.push("/reset-password")}
          className="mt-4 text-blue-600 underline hover:text-blue-800"
        >
          Mot de passe oublié ?
        </button>
            
        <button
          onClick={() => router.push("/SignupEglise")}
          className="mt-4 text-orange-400 underline hover:text-blue-800"
        >
          Création de compte
        </button>

            
      </div>
    </div>
  );
}
