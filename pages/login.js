"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "../lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setMessage("");

    try {
      // 🔍 Récupération du profil correspondant à l’email
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("id, email, password_hash, role, roles")
        .ilike("email", `%${email}%`);

      if (error) throw error;
      if (!profiles || profiles.length === 0) {
        setMessage("Utilisateur non trouvé ❌");
        return;
      }

      const user = profiles[0];

      // 🔑 Vérifie le mot de passe (pour l’instant simple hash simulé)
      const isValid =
        password === user.password_hash ||
        password === "admin123" || // mot de passe de secours
        password === "fabrice123"; // pour tests initiaux

      if (!isValid) {
        setMessage("Mot de passe incorrect ❌");
        return;
      }

      // 🧠 Détermine les rôles de l'utilisateur
      const roles = user.roles && user.roles.length > 0 ? user.roles : [user.role || "Membre"];

      // 💾 Sauvegarde les infos dans le localStorage
      localStorage.setItem("email", user.email);
      localStorage.setItem("roles", JSON.stringify(roles));
      localStorage.setItem("userId", user.id);

      // 🎯 Redirection selon le rôle principal
      const mainRole = roles[0];
      switch (mainRole) {
        case "Admin":
          router.push("/admin");
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
          break;
      }
    } catch (err) {
      console.error(err);
      setMessage("Erreur de connexion ❌");
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-800 to-blue-600 text-white">
      <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-xl w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Connexion</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-lg text-black"
            required
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-lg text-black"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold transition"
          >
            Se connecter
          </button>
        </form>
        {message && <p className="mt-4 text-center text-red-300">{message}</p>}
      </div>
    </div>
  );
}
