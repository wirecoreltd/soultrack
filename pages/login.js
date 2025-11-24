//pages/login.js

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "../lib/supabaseClient";
import Image from "next/image";

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

      const user = authData.user;
      localStorage.setItem("userEmail", email);
      localStorage.setItem("userId", user.id);

      // Récupération du profil
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
        case "Conseiller":
          router.push("/suivis-membres");
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
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-green-100 via-yellow-50 to-blue-100 p-6">
      <div className="bg-white p-8 rounded-3xl shadow-lg w-full max-w-md relative">
        <div className="flex justify-center mb-6">
          <Image src="/logo.png" alt="Logo" width={80} height={80} />
        </div>
        <h1 className="text-3xl font-bold text-center mb-6">Connexion</h1>

        <form onSubmit={handleLogin} className="flex flex-col w-full gap-4">
          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input"
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input"
          />

          {error && <p className="mt-2 text-center text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-green-400 to-blue-400 hover:from-green-500 hover:to-blue-500 text-white py-3 rounded-2xl mt-4"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <button
          onClick={() => router.push("/reset-password")}
          className="mt-4 text-blue-600 underline hover:text-blue-800 w-full text-center"
        >
          Mot de passe oublié ?
        </button>

        <style jsx>{`
          .input {
            width: 100%;
            border: 1px solid #ccc;
            border-radius: 12px;
            padding: 12px;
            color: black;
          }
        `}</style>
      </div>
    </div>
  );
}
