"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import supabase from "../lib/supabaseClient";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (!storedUserId) {
      alert("Utilisateur non identifié. Veuillez vous reconnecter.");
      router.push("/login");
    } else {
      setUserId(storedUserId);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas !");
      return;
    }

    setLoading(true);
    try {
      // 🔹 Met à jour Supabase Auth ET le flag must_change_password
      const { data: authData, error: authError } = await supabase.auth.updateUser({
        password,
        data: { must_change_password: false }, // ⚡ Mettre à false dans Auth
      });

      if (authError) throw authError;

      // 🔹 Mettre à jour le flag dans table profiles pour usage interne
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ must_change_password: false })
        .eq("id", userId);

      if (profileError) throw profileError;

      alert("✅ Mot de passe changé avec succès !");
      router.push("/"); // Redirection vers le dashboard
    } catch (err) {
      console.error("Erreur changement mot de passe :", err);
      setError("❌ Erreur lors du changement de mot de passe");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-yellow-50 to-blue-100 p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-3xl shadow-lg w-full max-w-md flex flex-col gap-4"
      >
        <h2 className="text-2xl font-bold text-center mb-4">
          Changer votre mot de passe
        </h2>

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
          className="bg-gradient-to-r from-green-400 to-blue-400 hover:from-green-500 hover:to-blue-500 text-white font-bold py-3 rounded-2xl shadow-md transition-all duration-200"
        >
          {loading ? "Chargement..." : "Changer"}
        </button>

        <p className="text-center text-gray-500 text-sm mt-4">
          Après avoir changé votre mot de passe, vous serez redirigé vers votre tableau de bord.
        </p>
      </form>

      <style jsx>{`
        .input {
          width: 100%;
          border: 1px solid #ccc;
          border-radius: 12px;
          padding: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
}
