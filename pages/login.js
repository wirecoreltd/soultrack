// pages/login.js
"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import supabase from "../lib/supabaseClient";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      // Vérifier dans la table profiles
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", email)
        .single();

      if (error || !data) {
        setErrorMsg("Utilisateur introuvable.");
        return;
      }

      // Vérifier le mot de passe
      // Ici on suppose que le mot de passe est stocké en clair (pour simplifier),
      // sinon il faudra comparer avec le hash
      if (data.password_hash !== password) {
        setErrorMsg("Mot de passe incorrect.");
        return;
      }

      // Sauvegarder userId dans localStorage
      localStorage.setItem("userId", data.id);

      // Rediriger vers home
      router.push("/home");
    } catch (err) {
      console.error(err);
      setErrorMsg("Erreur lors de la connexion.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-100 to-indigo-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-2xl">
        <h1 className="text-3xl font-extrabold text-center text-indigo-700 mb-6">
          Connexion
        </h1>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
            />
          </div>

          {errorMsg && (
            <p className="text-red-500 text-center font-semibold">{errorMsg}</p>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-md transition-all duration-200"
          >
            Se connecter
          </button>
        </form>
      </div>
    </div>
  );
}
