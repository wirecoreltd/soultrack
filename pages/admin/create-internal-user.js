// pages/admin/create-internal-user.js
"use client";
import { useState } from "react";

export default function CreateInternalUser() {
  const [formData, setFormData] = useState({
    prenom: "",
    nom: "",
    email: "",
    password: "",
    Téléphone: "",
    role: "",
    cellule_nom: "",
    cellule_zone: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("⏳ Création en cours...");

    const res = await fetch("/api/create-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json().catch(() => null);

    if (res.ok) setMessage("✅ Utilisateur créé avec succès !");
    else setMessage(`❌ Erreur: ${data?.error || "Réponse vide du serveur"}`);
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-xl shadow-md">
      <h1 className="text-xl font-semibold mb-4">Créer un utilisateur</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="prenom" placeholder="Prénom" onChange={handleChange} className="input" />
        <input name="nom" placeholder="Nom" onChange={handleChange} className="input" />
        <input name="email" placeholder="Email" onChange={handleChange} className="input" />
        <input name="password" placeholder="Mot de passe" type="password" onChange={handleChange} className="input" />
        <input name="telephone" placeholder="Téléphone" onChange={handleChange} className="input" />

        <select name="role" onChange={handleChange} className="input">
          <option value="">-- Sélectionne un rôle --</option>
          <option value="Administrateur">Administrateur</option>
          <option value="ResponsableIntegration">Responsable Intégration</option>
          <option value="ResponsableCellule">Responsable de Cellule</option>
          <option value="ResponsableEvangelisation">Responsable Evangélisation</option>
          
        </select>

        {/* Champs visibles uniquement si rôle = ResponsableCellule */}
        {formData.role === "ResponsableCellule" && (
          <div className="space-y-3 border-t pt-3">
            <input name="cellule_nom" placeholder="Nom de la cellule" onChange={handleChange} className="input" />
            <input name="cellule_zone" placeholder="Zone / Localisation" onChange={handleChange} className="input" />
          </div>
        )}

        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg">
          Créer l’utilisateur
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-700">{message}</p>

      <style jsx>{`
        .input {
          width: 100%;
          border: 1px solid #ccc;
          border-radius: 8px;
          padding: 10px;
        }
      `}</style>
    </div>
  );
}
