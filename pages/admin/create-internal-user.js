//pages/admin/create-internal-user.js
"use client";

import { useState } from "react";

export default function CreateInternalUser() {
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");
  const [sendMethod, setSendMethod] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const roleLabels = {
    Administrateur: "Administrateur",
    ResponsableCellule: "Responsable Cellule",
    ResponsableEvangelisation: "Responsable Évangélisation",
    ResponsableIntegration: "Responsable Intégration",
  };

  const resetForm = () => {
    setPrenom("");
    setNom("");
    setTelephone("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setRole("");
    setSendMethod("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!sendMethod) {
      setMessage("Veuillez choisir une méthode d'envoi.");
      return;
    }
    if (password !== confirmPassword) {
      setMessage("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prenom,
          nom,
          telephone,
          email,
          password,
          role,
          sendMethod,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data?.error || "Erreur serveur.");
        setLoading(false);
        return;
      }

      // MESSAGE POUR WHATSAPP
      const roleDesc = roleLabels[role] ?? role;
      const waMessage = encodeURIComponent(
        `Bonjour ${prenom},\n\nVoici vos accès SoulTrack :\n\n` +
        `Rôle : ${roleDesc}\n` +
        `Email : ${email}\nMot de passe : ${password}\n\n` +
        `Connectez-vous ici : ${typeof window !== "undefined" ? window.location.origin + "/login" : ""}\n\n` +
        `Bienvenue dans l’équipe !`
      );

      // OUVERTURE DIRECTE WHATSAPP
      if (sendMethod === "whatsapp") {
        const phone = telephone.replace(/\D/g, "");
        const link = `https://wa.me/${phone}?text=${waMessage}`;
        window.location.assign(link);
      }

      // ENVOI PAR EMAIL
      if (sendMethod === "email") {
        if (data.email_status === "sent") {
          setMessage("Email envoyé !");
        } else {
          setMessage(
            "Email non envoyé automatiquement. Vérifiez votre configuration SendGrid."
          );
        }
      }

      // RESET FORMULAIRE APRÈS ENVOI
      resetForm();
    } catch (err) {
      console.error(err);
      setMessage("Erreur inconnue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Créer un utilisateur interne</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input className="input" placeholder="Prénom" value={prenom} onChange={(e) => setPrenom(e.target.value)} required />
        <input className="input" placeholder="Nom" value={nom} onChange={(e) => setNom(e.target.value)} required />

        <input className="input" placeholder="Téléphone (format international)" value={telephone} onChange={(e) => setTelephone(e.target.value)} />

        <input className="input" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <input className="input" type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} required />

        <input className="input" type="password" placeholder="Confirmer le mot de passe" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />

        <select className="input" value={role} onChange={(e) => setRole(e.target.value)} required>
          <option value="">Sélectionner un rôle</option>
          <option value="Administrateur">Administrateur</option>
          <option value="ResponsableCellule">Responsable Cellule</option>
          <option value="ResponsableEvangelisation">Responsable Évangélisation</option>
          <option value="ResponsableIntegration">Responsable Intégration</option>
        </select>

        <div className="mt-2">
          <p className="font-semibold mb-2">Envoyer les accès via :</p>
          <label className="flex items-center gap-2 mb-1">
            <input type="radio" name="sendMethod" value="whatsapp" onChange={(e) => setSendMethod(e.target.value)} checked={sendMethod === "whatsapp"} />
            WhatsApp
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="sendMethod" value="email" onChange={(e) => setSendMethod(e.target.value)} checked={sendMethod === "email"} />
            Email
          </label>
        </div>

        <button type="submit" disabled={loading} className="bg-green-600 text-white py-2 rounded">
          {loading ? "Création..." : "Créer & Envoyer"}
        </button>
      </form>

      {message && <p className="mt-3 text-sm text-gray-700">{message}</p>}

      <style jsx>{`
        .input {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
}
