// pages/reset-password.js
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "../lib/supabaseClient";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const { data, error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/update-password`,
      });

      if (resetError) throw resetError;

      setMessage("✅ Email de réinitialisation envoyé. Vérifiez votre boîte mail !");
    } catch (err) {
      console.error(err);
      setError("❌ Impossible d'envoyer l'email de réinitialisation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-yellow-50 to-blue-100 p-6">
      <form onSubmit={handleReset} className="bg-white p-8 rounded-3xl shadow-lg w-full max-w-md flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-center mb-4">Réinitialiser le mot de passe</h2>

        <input
          type="email"
          placeholder="Votre email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="input"
        />

        {error && <p className="text-red-500 text-center">{error}</p>}
        {message && <p className="text-green-500 text-center">{message}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-green-400 to-blue-400 hover:from-green-500 hover:to-blue-500 text-white font-bold py-3 rounded-2xl shadow-md"
        >
          {loading ? "Envoi..." : "Envoyer l'email"}
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
