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
  const [sendMethod, setSendMethod] = useState(""); // whatsapp ou email
  const [loading, setLoading] = useState(false);

  const [whatsappLink, setWhatsappLink] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!sendMethod) {
      alert("Veuillez choisir une méthode d’envoi des accès.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Les mots de passe ne correspondent pas.");
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

      if (data.error) {
        alert("Erreur : " + data.error);
      } else {
        if (sendMethod === "whatsapp") {
          setWhatsappLink(data.whatsappLink);
        } else {
          alert("Email envoyé avec succès !");
        }
      }
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la création.");
    }

    setLoading(false);
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Créer un utilisateur</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">

        <input
          className="input"
          placeholder="Prénom"
          value={prenom}
          onChange={(e) => setPrenom(e.target.value)}
          required
        />

        <input
          className="input"
          placeholder="Nom"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          required
        />

        <input
          className="input"
          placeholder="Téléphone"
          value={telephone}
          onChange={(e) => setTelephone(e.target.value)}
        />

        <input
          className="input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          className="input"
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <input
          className="input"
          type="password"
          placeholder="Confirmer le mot de passe"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <select
          className="input"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          required
        >
          <option value="">Sélectionner un rôle</option>
          <option value="ResponsableIntegration">Responsable Integration</option>
          <option value="ResponsableEvangelisation">Responsable Evangelisation</option>
          <option value="ResponsableCellule">ResponsableCellule</option>
          <option value="Administrateur">Administrateur</option>
        </select>

        <div className="mt-3">
          <p className="font-semibold mb-2">Envoyer les accès via :</p>

          <label className="flex items-center gap-2 mb-1">
            <input
              type="radio"
              name="sendMethod"
              value="whatsapp"
              onChange={(e) => setSendMethod(e.target.value)}
            />
            WhatsApp
          </label>

          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="sendMethod"
              value="email"
              onChange={(e) => setSendMethod(e.target.value)}
            />
            Email
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white py-3 rounded-xl shadow-md"
        >
          {loading ? "Création..." : "Créer l'utilisateur"}
        </button>
      </form>

      {whatsappLink && (
        <a
          href={whatsappLink}
          target="_blank"
          className="mt-6 block bg-green-500 text-white py-3 px-4 rounded-xl text-center shadow-md"
        >
          📲 Envoyer via WhatsApp
        </a>
      )}

      <style jsx>{`
        .input {
          width: 100%;
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
