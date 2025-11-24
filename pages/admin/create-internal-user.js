//*pages/admin/create-internal-user.js
"use client";

import { useState } from "react";

export default function CreateUserForm() {
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");
  const [sendMethod, setSendMethod] = useState(""); // "whatsapp" | "email"

  const [loading, setLoading] = useState(false);
  const [whatsappLink, setWhatsappLink] = useState("");
  const [mailtoLink, setMailtoLink] = useState("");
  const [message, setMessage] = useState("");

  const normalizePhone = (p) => p.replace(/\D/g, "");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setWhatsappLink("");
    setMailtoLink("");

    if (!sendMethod) {
      setMessage("Veuillez choisir une méthode d'envoi (WhatsApp ou Email).");
      return;
    }
    if (password !== confirmPassword) {
      setMessage("Les mots de passe ne correspondent pas.");
      return;
    }
    if (!prenom || !nom || !email || !password || !role) {
      setMessage("Merci de remplir tous les champs obligatoires.");
      return;
    }
    if (sendMethod === "whatsapp" && !telephone) {
      setMessage("Le numéro de téléphone est requis pour WhatsApp.");
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
        setMessage(data?.error || "Erreur serveur lors de la création.");
        setLoading(false);
        return;
      }

      // Si envoi WhatsApp demandé -> l'API renvoie whatsapp_link
      if (sendMethod === "whatsapp") {
        if (!data.whatsapp_link) {
          setMessage("Impossible de générer le lien WhatsApp. Vérifie le numéro.");
          setLoading(false);
          return;
        }
        setWhatsappLink(data.whatsapp_link);

        // Tentative de redirection automatique (dans le même onglet — évite popup blockers)
        try {
          // navigation directe — moins susceptible d'être bloquée
          window.location.assign(data.whatsapp_link);
          // Si la navigation est bloquée pour une raison, l'utilisateur verra le bouton ci-dessous
        } catch (err) {
          // fallback: afficher lien — l'utilisateur cliquera dessus
        }

        setMessage("Utilisateur créé. Si la redirection ne fonctionne pas, cliquez sur le bouton WhatsApp.");
      }

      // Si envoi Email demandé -> on vérifie status renvoyé par l'API
      if (sendMethod === "email") {
        if (data.email_status === "sent") {
          setMessage("Email envoyé avec succès !");
        } else {
          // fallback : générer mailto pour que l'admin puisse envoyer manuellement
          const subject = encodeURIComponent("Vos accès SoulTrack");
          const body = encodeURIComponent(
            `Bonjour ${prenom},\n\nVoici vos accès :\nEmail: ${email}\nMot de passe: ${password}\n\nConnectez-vous ici: ${window.location.origin}/login\n\nBonne journée.`
          );
          const mailto = `mailto:${email}?subject=${subject}&body=${body}`;
          setMailtoLink(mailto);
          setMessage(
            "L'email n'a pas pu être envoyé automatiquement. Utilisez le bouton ci-dessous pour l'envoyer manuellement."
          );
        }
      }
    } catch (err) {
      console.error(err);
      setMessage("Erreur inattendue. Vérifie la console serveur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Créer un utilisateur</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input className="input" placeholder="Prénom" value={prenom} onChange={(e) => setPrenom(e.target.value)} required />
        <input className="input" placeholder="Nom" value={nom} onChange={(e) => setNom(e.target.value)} required />
        <input className="input" placeholder="Téléphone (ex: 2305xxxxxxx)" value={telephone} onChange={(e) => setTelephone(e.target.value)} />
        <input className="input" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="input" type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <input className="input" type="password" placeholder="Confirmer le mot de passe" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />

        <select className="input" value={role} onChange={(e) => setRole(e.target.value)} required>
          <option value="">Sélectionner un rôle</option>
          <option value="ResponsableIntegration">Responsable Integration</option>
          <option value="ResponsableEvangelisation">Responsable Evangelisation</option>
          <option value="ResponsableCellule">ResponsableCellule</option>
          <option value="Administrateur">Administrateur</option>
        </select>

        <div className="mt-2">
          <p className="font-semibold mb-2">Envoyer les accès via :</p>
          <label className="flex items-center gap-2 mb-1">
            <input type="radio" name="sendMethod" value="whatsapp" onChange={(e) => setSendMethod(e.target.value)} /> WhatsApp
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="sendMethod" value="email" onChange={(e) => setSendMethod(e.target.value)} /> Email
          </label>
        </div>

        <button type="submit" disabled={loading} className="bg-green-600 text-white py-2 rounded">
          {loading ? "Création..." : "Créer & Envoyer"}
        </button>
      </form>

      {message && <p className="mt-3 text-sm text-gray-700">{message}</p>}

      {/* Bouton visible pour envoyer via WhatsApp (fallback si auto-redirect bloqué) */}
      {whatsappLink && (
        <a href={whatsappLink} target="_blank" rel="noreferrer" className="mt-3 inline-block bg-green-500 text-white py-2 px-4 rounded">
          📲 Ouvrir WhatsApp (envoyer le message)
        </a>
      )}

      {/* Bouton mailto fallback */}
      {mailtoLink && (
        <a href={mailtoLink} className="mt-3 inline-block bg-blue-600 text-white py-2 px-4 rounded">
          ✉️ Ouvrir le client mail (envoyer manuellement)
        </a>
      )}

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

