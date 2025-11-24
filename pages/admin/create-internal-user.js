// pages/admin/create-internal-user.js
"use client";

import { useState } from "react";

export default function CreateInternalUser() {
  const [formData, setFormData] = useState({
    prenom: "",
    nom: "",
    email: "",
    role: "",
    telephone: "",
    sendMethod: "whatsapp", // ✅ par défaut WhatsApp
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const roleDescription = {
    Administrateur: "Administrateur",
    ResponsableIntegration: "Responsable Intégration",
    ResponsableEvangelisation: "Responsable Evangélisation",
    ResponsableCellule: "Responsable Cellule",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.role) {
      alert("Veuillez choisir un rôle !");
      return;
    }

    setLoading(true);

    try {
      // 1️⃣ Création utilisateur via API (sans mot de passe)
      const res = await fetch("/api/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || "Erreur création utilisateur");

      // 2️⃣ Génération du lien de réinitialisation Supabase
      const resetRes = await fetch("/api/send-reset-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      const resetData = await resetRes.json();
      if (!resetRes.ok) throw new Error(resetData?.error || "Erreur génération lien");

      const resetLink = resetData.reset_link;

      // 3️⃣ Préparer message WhatsApp
      const message = `
Bonjour ${formData.prenom},

Votre compte SoulTrack a été créé avec succès 🙌

👤 Rôle : ${roleDescription[formData.role]}

Pour définir votre mot de passe, cliquez ici :
➡️ ${resetLink}

🙏 Nous sommes heureux de vous compter parmi nous. Stay Bless !
      `.trim();

      const cleanPhone = formData.telephone.replace(/\D/g, "");
      const encodedMessage = encodeURIComponent(message);

      // 4️⃣ Redirection automatique vers WhatsApp
      if (formData.sendMethod === "whatsapp" && cleanPhone) {
        window.open(`https://wa.me/${cleanPhone}?text=${encodedMessage}`, "_blank");
      }

      // 5️⃣ Vider le formulaire
      setFormData({
        prenom: "",
        nom: "",
        email: "",
        role: "",
        telephone: "",
        sendMethod: "whatsapp",
      });

    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-200 via-pink-100 to-yellow-200 p-6">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-lg w-full max-w-md flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-center mb-4">Créer un utilisateur</h2>

        <input
          name="prenom"
          placeholder="Prénom"
          value={formData.prenom}
          onChange={handleChange}
          className="input"
          required
        />
        <input
          name="nom"
          placeholder="Nom"
          value={formData.nom}
          onChange={handleChange}
          className="input"
          required
        />
        <input
          name="telephone"
          placeholder="Téléphone"
          value={formData.telephone}
          onChange={handleChange}
          className="input"
        />
        <input
          name="email"
          placeholder="Email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          className="input"
          required
        />
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="input"
          required
        >
          <option value="">-- Choisir un rôle --</option>
          <option value="Administrateur">Administrateur</option>
          <option value="ResponsableIntegration">Responsable Intégration</option>
          <option value="ResponsableEvangelisation">Responsable Evangélisation</option>
          <option value="ResponsableCellule">Responsable Cellule</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600 text-white font-bold py-3 rounded-2xl shadow-md"
        >
          {loading ? "Création..." : "Créer et envoyer WhatsApp"}
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
