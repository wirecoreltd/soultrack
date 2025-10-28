"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "../lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 🔹 Authentification
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError || !data.user) {
        setError("❌ Email ou mot de passe incorrect");
        return;
      }

      console.log("✅ Login réussi :", data.user.email);

      // 🔹 Récupérer le profil (pour connaître le rôle)
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("email", data.user.email)
        .single();

      if (profileError || !profile) {
        setError("❌ Impossible de récupérer le profil utilisateur");
        console.error("Erreur profil :", profileError);
        return;
      }

      const role = profile.role;
      console.log("🎭 Rôle :", role);

      // 🔹 Stocker infos utilisateur
      localStorage.setItem("userEmail", data.user.email);
      localStorage.setItem("userRole", role);

      // 🔹 Redirection selon le rôle
      if (role === "Administrateur") {
        router.push("/"); // page index.js
      } else if (role === "ResponsableIntegration") {
        router.push("/membres-hub");
      } else if (role === "ResponsableEvangelisation") {
        router.push("/evangelisation-hub");
      } else if (role === "ResponsableCellule") {
        router.push("/cellules-hub");
      } else {
        router.push("/"); // par défaut
      }
    } catch (err) {
      console.error("Erreur lors du login :", err);
      setError("❌ Erreur lors de la connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm"
      >
        <h1 className="text-2xl font-bold mb-6 text-center">Se connecter</h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
          required
        />

        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>

        {error && <p className="mt-4 text-red-500 text-center">{error}</p>}
      </form>
    </div>
  );
}
