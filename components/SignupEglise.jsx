"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function SignupEglise() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nomEglise: "",
    nomBranche: "",
    localisation: "",
    adminPrenom: "",
    adminNom: "",
    adminEmail: "",
    adminPassword: "",
    adminConfirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Vérification mot de passe
    if (formData.adminPassword !== formData.adminConfirmPassword) {
      setMessage("❌ Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    setMessage("⏳ Création en cours...");

    try {
      const res = await fetch("/api/signup-eglise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json().catch(() => null);

      if (res.ok) {
        setMessage("✅ Église et admin créés avec succès !");
        setFormData({
          nomEglise: "",
          nomBranche: "",
          localisation: "",
          adminPrenom: "",
          adminNom: "",
          adminEmail: "",
          adminPassword: "",
          adminConfirmPassword: "",
        });
        // Optionnel : rediriger vers login
        router.push("/login");
      } else {
        setMessage(`❌ Erreur: ${data?.error || "Réponse vide du serveur"}`);
      }
    } catch (err) {
      setMessage("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => router.push("/");

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-purple-200 via-pink-100 to-yellow-200 p-6">
      <div className="bg-white p-8 rounded-3xl shadow-lg w-full max-w-md relative">

        {/* Flèche retour */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 flex items-center text-gray-700 hover:text-gray-900 transition-colors"
        >
          ← Retour
        </button>

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image src="/logo.png" alt="SoulTrack Logo" width={80} height={80} />
        </div>

        {/* Titre */}
        <h1 className="text-3xl font-bold text-center mb-6">Créer une église</h1>

        <form onSubmit={handleSubmit} className="flex flex-col w-full gap-4">
          {/* Église & branche */}
          <input
            name="nomEglise"
            placeholder="Nom de l'église"
            value={formData.nomEglise}
            onChange={handleChange}
            className="input"
            required
          />
          <input
            name="nomBranche"
            placeholder="Nom de la branche"
            value={formData.nomBranche}
            onChange={handleChange}
            className="input"
            required
          />
          <input
            name="localisation"
            placeholder="Localisation"
            value={formData.localisation}
            onChange={handleChange}
            className="input"
            required
          />

          {/* Admin */}
          <input
            name="adminPrenom"
            placeholder="Prénom de l'admin"
            value={formData.adminPrenom}
            onChange={handleChange}
            className="input"
            required
          />
          <input
            name="adminNom"
            placeholder="Nom de l'admin"
            value={formData.adminNom}
            onChange={handleChange}
            className="input"
            required
          />
          <input
            name="adminEmail"
            placeholder="Email de l'admin"
            type="email"
            value={formData.adminEmail}
            onChange={handleChange}
            className="input"
            required
          />
          <input
            name="adminPassword"
            placeholder="Mot de passe"
            type="password"
            value={formData.adminPassword}
            onChange={handleChange}
            className="input"
            required
          />
          <input
            name="adminConfirmPassword"
            placeholder="Confirmer le mot de passe"
            type="password"
            value={formData.adminConfirmPassword}
            onChange={handleChange}
            className="input"
            required
          />

          {/* Boutons */}
          <div className="flex gap-4 mt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white font-bold py-3 rounded-2xl shadow-md transition-all duration-200"
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600 text-white font-bold py-3 rounded-2xl shadow-md transition-all duration-200"
            >
              {loading ? "Création..." : "Créer"}
            </button>
          </div>
        </form>

        {message && (
          <p className="mt-4 text-center text-sm text-gray-700">{message}</p>
        )}

        <style jsx>{`
          .input {
            width: 100%;
            border: 1px solid #ccc;
            border-radius: 12px;
            padding: 12px;
            text-align: left;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            color: black;
          }
        `}</style>
      </div>
    </div>
  );
}
