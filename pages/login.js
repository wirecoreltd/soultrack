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
  const [loading, setLoading] = useState(false);

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
        setMessage("❌ Utilisateur non trouvé !");
        setLoading(false);
        return;
      }

      // ✅ TEMP : on compare le mot de passe directement (sans hash)
      const plainPasswords = {
        "admin@soultrack.com": "admin123",
        "fabrice.g@soultrack.com": "fabrice123",
      };

      if (plainPasswords[email] !== password) {
        setMessage("❌ Mot de passe incorrect !");
        setLoading(false);
        return;
      }

      // Stocke les infos du user
      localStorage.setItem("userRole", data.roles?.[0] || data.role);
      localStorage.setItem("userId", data.id);
      localStorage.setItem("userEmail", data.email);
      localStorage.setItem("userName", `${data.prenom} ${data.nom}`);

      // ✅ Redirection selon le rôle
      const roles = data.roles || [];
      if (roles.includes("Admin")) {
        router.push("/administrateur");
      } else if (roles.includes("ResponsableEvangelisation")) {
        router.push("/evangelisation-hub");
      } else if (roles.includes("ResponsableIntegration")) {
        router.push("/membres-hub");
      } else if (roles.includes("ResponsableCellule")) {
        router.push("/cellules-hub");
      } else {
        router.push("/index");
      }
    } catch (err) {
      console.error(err);
      setMessage("Erreur de connexion ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 to-blue-500 p-6"
    >
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-blue-700 mb-6">
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
            className="bg-blue-700 hover:bg-blue-800 text-white font-semibold p-3 rounded-xl transition duration-200"
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
