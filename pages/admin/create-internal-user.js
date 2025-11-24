//pages/admin/create-internal-user.js

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function CreateInternalUser() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    prenom: "",
    nom: "",
    email: "",
    role: "",
    telephone: "",
    sendMethod: "whatsapp", // ✅ par défaut WhatsApp
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const roleDescription = {
    Administrateur: "Administrateur",
    ResponsableIntegration: "Responsable Intégration",
    ResponsableEvangelisation: "Responsable Evangélisation",
    ResponsableCellule: "Responsable Cellule",
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.role || !formData.email) {
      setMessage("❌ Veuillez remplir tous les champs obligatoires !");
      return;
    }

    setLoading(true);
    setMessage("⏳ Création en cours...");

    try {
      const res = await fetch("/api/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erreur création utilisateur");

      // Générer lien de réinitialisation mot de passe (via API)
      const resetRes = await fetch("/api/send-reset-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });
      const resetData = await resetRes.json();
      if (!resetRes.ok) throw new Error(resetData?.error || "Erreur génération lien");

      const resetLink = resetData.reset_link;

      const messageText = `
Bonjour ${formData.prenom},

Votre compte SoulTrack a été créé avec succès 🙌

👤 Rôle : ${roleDescription[formData.role]}

Pour définir votre mot de passe, cliquez ici :
➡️ ${resetLink}

🙏 Nous sommes heureux de vous compter parmi nous. Stay Bless !
      `.trim();

      const cleanPhone = formData.telephone.replace(/\D/g, "");
      const encodedMessage = encodeURIComponent(messageText);

      if (formData.sendMethod === "whatsapp" && cleanPhone) {
        window.open(`https://wa.me/${cleanPhone}?text=${encodedMessage}`, "_blank");
      }

      setFormData({
        prenom: "",
        nom: "",
        email: "",
        role: "",
        telephone: "",
        sendMethod: "whatsapp",
      });

      setMessage("✅ Utilisateur créé avec succès !");
    } catch (err) {
      console.error(err);
      setMessage("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-purple-200 via-pink-100 to-yellow-200 p-6">
      <div className="bg-white p-8 rounded-3xl shadow-lg w-full max-w-md relative">
        <button onClick={() => router.back()} className="absolute top-4 left-4 text-gray-700 hover:text-gray-900">← Retour</button>
        <div className="flex justify-center mb-6"><Image src="/logo.png" alt="Logo" width={80} height={80} /></div>
        <h1 className="text-3xl font-bold text-center mb-6">Créer un utilisateur interne</h1>

        <form onSubmit={handleSubmit} className="flex flex-col w-full gap-4">
          <input
            name="prenom"
            placeholder="Prénom"
            value={formData.prenom}
            onChange={handleChange}
            className="input"
          />
          <input
            name="nom"
            placeholder="Nom"
            value={formData.nom}
            onChange={handleChange}
            className="input"
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

          <div className="flex gap-4 mt-4">
            <button type="button" onClick={() => router.push("/")} className="flex-1 bg-gray-400 hover:bg-gray-500 text-white py-3 rounded-2xl">Annuler</button>
            <button type="submit" disabled={loading} className="flex-1 bg-blue-400 hover:bg-blue-500 text-white py-3 rounded-2xl">{loading ? "Création..." : "Créer"}</button>
          </div>
        </form>

        {message && <p className="mt-4 text-center text-sm text-gray-700">{message}</p>}

        <style jsx>{`
          .input { width:100%; border:1px solid #ccc; border-radius:12px; padding:12px; color:black; }
        `}</style>
      </div>
    </div>
  );
}
