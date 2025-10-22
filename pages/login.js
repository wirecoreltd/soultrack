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
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", email)
        .single();

      if (error || !data) {
        setMessage("Utilisateur non trouvé ❌");
        setLoading(false);
        return;
      }

      // ✅ On compare maintenant avec le champ password normal (en clair)
      if (password !== data.password_hash && password !== data.password) {
        setMessage("Mot de passe incorrect ❌");
        setLoading(false);
        return;
      }

      // ✅ Sauvegarde de l’utilisateur connecté
      localStorage.setItem("user", JSON.stringify(data));

      // ✅ Redirection selon le rôle
      if (data.roles?.includes("Admin")) {
        router.push("/admin");
      } else if (data.roles?.includes("ResponsableCellule")) {
        router.push("/cellule-hub");
      } else {
        router.push("/");
      }
    } catch (err) {
      console.error(err);
      setMessage("Erreur de connexion ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-100 p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-blue-700 mb-6">
          🔐 Connexion
        </h1>
        <form onSubmit={handleLogin} className="flex flex-col space-y-4">
          <input
            type="email"
            placeholder="Adresse e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold p-3 rounded-xl transition duration-200"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
        {message && (
          <p className="text-center text-red-500 font-medium mt-4">{message}</p>
        )}
      </div>
    </div>
  );
}
