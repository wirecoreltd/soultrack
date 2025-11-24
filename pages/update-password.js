// pages/update-password.js
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import supabase from "../lib/supabaseClient";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = searchParams.get("access_token"); // Supabase envoie token dans l'URL

  useEffect(() => {
    if (!token) {
      alert("Token manquant. Veuillez refaire la demande de réinitialisation.");
      router.push("/reset-password");
    }
  }, [token, router]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas !");
      return;
    }

    setLoading(true);

    try {
      const { data, error: updateError } = await supabase.auth.updateUser({
        access_token: token,
        password: password,
      });

      if (updateError) throw updateError;

      alert("✅ Mot de passe mis à jour avec succès !");
      router.push("/login");
    } catch (err) {
      console.error(err);
      setError("❌ Impossible de mettre à jour le mot de passe");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-yellow-50 to-blue-100 p-6">
      <form onSubmit={handleUpdate} className="bg-white p-8 rounded-3xl shadow-lg w-full max-w-md flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-center mb-4">Mettre à jour le mot de passe</h2>

        <input
          type="password"
          placeholder="Nouveau mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="input"
        />
        <input
          type="password"
          placeholder="Confirmer le mot de passe"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          className="input"
        />

        {error && <p className="text-red-500 text-center">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-green-400 to-blue-400 hover:from-green-500 hover:to-blue-500 text-white font-bold py-3 rounded-2xl shadow-md"
        >
          {loading ? "Chargement..." : "Mettre à jour"}
        </button>
      </form>

      <style jsx>{`
        .input {
          width: 100%;
          border: 1px solid #ccc;
          border-radius: 12px;
          padding: 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  );
}
