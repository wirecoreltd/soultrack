// pages/admin/reset-password.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import supabase from "../../lib/supabaseClient";
import bcrypt from "bcryptjs";
import { canAccessPage } from "../../lib/accessControl";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    newPassword: "",
  });

  // 🔐 Vérifie si l'utilisateur est bien Admin
  useEffect(() => {
    const storedRole = localStorage.getItem("userRole");
    if (!storedRole) {
      router.replace("/login");
      return;
    }

    const canAccess = canAccessPage(storedRole, router.pathname);
    if (!canAccess) {
      alert("⛔ Accès non autorisé !");
      router.replace("/login");
      return;
    }

    setRole(storedRole);
    setLoading(false);
  }, [router]);

  if (loading) return <div className="text-center mt-20">Chargement...</div>;

  // 🔁 Gestion du formulaire
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      // Vérifie que le profil existe
      const { data: profile, error: fetchError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", formData.email)
        .single();

      if (fetchError || !profile) {
        alert("❌ Utilisateur introuvable !");
        setLoading(false);
        return;
      }

      // Hash le nouveau mot de passe
      const newHash = await bcrypt.hash(formData.newPassword, 10);

      // Met à jour le mot de passe dans Supabase
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ password_hash: newHash, updated_at: new Date() })
        .eq("email", formData.email);

      if (updateError) {
        console.error("Erreur update:", updateError);
        alert("Erreur lors de la mise à jour du mot de passe ❌");
        return;
      }

      alert("✅ Mot de passe réinitialisé avec succès !");
      router.push("/index");
    } catch (err) {
      console.error("Erreur inattendue:", err);
      alert("Erreur inattendue ❌");
    } finally {
      setLoading(false);
    }
  };

  // 🔴 Déconnexion
  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    router.push("/login");
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{
        background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)",
      }}
    >
      <h1 className="text-4xl font-bold text-white mb-6">
        🔑 Réinitialiser un mot de passe
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md flex flex-col gap-4"
      >
        <div>
          <label className="block text-gray-700 font-semibold mb-1">
            Email de l'utilisateur
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-1">
            Nouveau mot de passe
          </label>
          <input
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 bg-gradient-to-r from-blue-600 to-blue-400 text-white font-semibold rounded-xl py-2 hover:opacity-90 transition"
        >
          {loading ? "Mise à jour..." : "Réinitialiser le mot de passe"}
        </button>
      </form>

      <button
        onClick={() => router.push("/index")}
        className="mt-4 text-white underline hover:opacity-80"
      >
        ⬅️ Retour à l’accueil
      </button>

      <p
        onClick={handleLogout}
        className="mt-3 text-sm text-white cursor-pointer hover:underline"
      >
        Se déconnecter
      </p>
    </div>
  );
}
