"use client";
import { useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import supabase from "../lib/supabaseClient";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", email)
      .eq("password", password)
      .single();

    if (error || !data) {
      setError("Identifiants incorrects. Veuillez réessayer.");
      return;
    }

    // Enregistrer les infos dans le localStorage
    localStorage.setItem("userId", data.id);
    localStorage.setItem("role", data.role);
    router.push("/home");
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-center items-center"
      style={{
        background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)",
      }}
    >
      {/* Logo */}
      <div className="mb-4">
        <Image src="/logo.png" alt="SoulTrack Logo" width={90} height={90} />
      </div>

      {/* Titre */}
      <h1 className="text-4xl font-handwriting text-white mb-8">
        SoulTrack Login
      </h1>

      {/* Formulaire */}
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-2xl shadow-md w-80 flex flex-col gap-4"
      >
        <input
          type="email"
          placeholder="Adresse e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <button
          type="submit"
          className="bg-gradient-to-r from-blue-600 to-cyan-400 text-white py-2 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all"
        >
          Se connecter
        </button>
      </form>
    </div>
  );
}
