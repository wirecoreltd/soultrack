"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import supabase from "../lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("Connexion en cours...");

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", email)
        .single();

      if (error || !data) {
        setMessage("❌ Utilisateur non trouvé !");
        return;
      }

      // ⚙️ Vérifie le mot de passe
      if (data.password_hash !== password) {
        setMessage("❌ Mot de passe incorrect !");
        return;
      }

      // ✅ Formatage du profil utilisateur
      const fullName = `${data.prenom} ${data.nom}`;
      const formattedRole = data.role || "Membre";

      // ✅ Sauvegarde dans le localStorage
      localStorage.setItem("userEmail", data.email);
      localStorage.setItem("userName", fullName);
      localStorage.setItem("userRole", formattedRole);
      localStorage.setItem("userId", data.id);

      // ✅ Multi-rôles (si un jour tu ajoutes un tableau)
      if (Array.isArray(data.roles)) {
        localStorage.setItem("userRoles", JSON.stringify(data.roles));
      } else {
        localStorage.setItem("userRoles", JSON.stringify([formattedRole]));
      }

      // ✅ Redirection selon le rôle principal
      if (formattedRole === "Admin") {
        router.push("/index");
      } else if (formattedRole === "ResponsableIntegration") {
        router.push("/membres-hub");
      } else if (formattedRole === "ResponsableEvangelisation") {
        router.push("/evangelisation-hub");
      } else if (formattedRole === "ResponsableCellule") {
        router.push("/cellules-hub");
      } else {
        router.push("/index");
      }
    } catch (err) {
      console.error("Erreur login :", err);
      setMessage("❌ Erreur lors de la connexion !");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-blue-50">
      <form
        onSubmit={handleLogin}
        className="bg-white p-6 rounded-xl shadow-lg w-96 space-y-4"
      >
        <h2 className="text-center text-2xl font-bold text-blue-700">
          Connexion
        </h2>
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 border rounded-lg"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Mot de passe"
          className="w-full p-2 border rounded-lg"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Se connecter
        </button>
        <p className="text-center text-sm text-gray-500">{message}</p>
      </form>
    </div>
  );
}
