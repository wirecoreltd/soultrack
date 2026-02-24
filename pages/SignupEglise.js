"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "../lib/supabaseClient";
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
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Vérification mot de passe
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
        // Redirection vers login
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-yellow-50 to-blue-100 p-6">
      <div className="bg-white p-10 rounded-3xl shadow-lg w-full max-w-md flex flex-col items-center">
        <h1 className="text-5xl font-handwriting text-black-800 mb-3 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Image src="/logo.png" alt="Logo SoulTrack" width={48} height={48} />
          SoulTrack
        </h1>
        <p className="text-center text-gray-700 mb-6">
          Créez votre Église et l’administrateur principal pour commencer.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col w-full gap-4">
          {/* Église & branche */}
          <input
            name="nomEglise"
            placeholder="Nom de l'Église"
            value={formData.nomEglise}
            onChange={handleChange}
            className="input"
            required
          />
          <input
            name="nomBranche"
            placeholder="Nom de la Branche"
            value={formData.nomBranche}
            onChange={handleChange}
            className="input"
            required
          />
          <input
            name="localisation"
            placeholder="Pays"
            value={formData.localisation}
            onChange={handleChange}
            className="input"
            required  
          />

          <hr className="my-2 border-gray-300" />

          {/* Admin */}
          <input
            name="adminPrenom"
            placeholder="Prénom de l'Admin"
            value={formData.adminPrenom}
            onChange={handleChange}
            className="input"
            required
          />
          <input
            name="adminNom"
            placeholder="Nom de l'Admin"
            value={formData.adminNom}
            onChange={handleChange}
            className="input"
            required
          />
          <input
            type="email"
            name="adminEmail"
            placeholder="Email de l'Admin"
            value={formData.adminEmail}
            onChange={handleChange}
            className="input"
            required
          />
          <input
            type="password"
            name="adminPassword"
            placeholder="Mot de passe"
            value={formData.adminPassword}
            onChange={handleChange}
            className="input"
            required
          />
          <input
            type="password"
            name="adminConfirmPassword"
            placeholder="Confirmer le mot de passe"
            value={formData.adminConfirmPassword}
            onChange={handleChange}
            className="input"
            required
          />

          {message && <p className="text-center text-red-500">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-green-400 to-blue-400 hover:from-green-500 hover:to-blue-500 text-white font-bold py-3 rounded-2xl shadow-md"
          >
            {loading ? "Création..." : "Créer l'Église"}
          </button>
        </form>

        <button
          onClick={() => router.push("/login")}
          className="mt-4 text-blue-600 underline hover:text-blue-800"
        >
          Déjà un compte ? Connectez-vous
        </button>

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
