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
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError || !data.user) {
        setError("❌ Email ou mot de passe incorrect");
        return;
      }

      // ✅ Stockage de l'email et rôle
      localStorage.setItem("userEmail", data.user.email);
      // Exemple : récupérer le rôle depuis la colonne 'role' de ton profil Supabase
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      const role = profile?.role || "Membre";
      localStorage.setItem("userRole", JSON.stringify([role]));

      console.log("✅ Login réussi :", data.user.email, "| Role :", role);

      // 🧭 Redirection selon rôle
      if (role === "ResponsableIntegration") {
        router.push("/membres-hub");
      } else if (role === "ResponsableEvangelisation") {
        router.push("/evangelisation-hub");
      } else if (role === "ResponsableCellule") {
        router.push("/cellules-hub");
      } else if (role === "Admin") {
        router.push("/index");
      } else {
        router.push("/index");
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
        <h1 className="text-2xl font-bold mb-6">Se connecter</h1>

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
