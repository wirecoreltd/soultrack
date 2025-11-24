"use client";

import { useState } from "react";

export default function CreateInternalUser() {
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Membre");

  const [cellule_nom, setCelluleNom] = useState("");
  const [cellule_zone, setCelluleZone] = useState("");

  const [sendMethod, setSendMethod] = useState(""); // <--- obligatoire (whatsapp ou email)
  const [whatsappLink, setWhatsappLink] = useState("");

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ❗ Vérifier que l’utilisateur a choisi ENTRE WhatsApp OU Email
    if (!sendMethod) {
      alert("Veuillez choisir une méthode d’envoi : WhatsApp ou Email");
      return;
    }

    setLoading(true);
    setWhatsappLink("");

    try {
      const res = await fetch("/api/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prenom,
          nom,
          email,
          password,
          telephone,
          role,
          cellule_nom,
          cellule_zone,
          sendMethod, // <--- on envoie le choix
        }),
      });

      const data = await res.json();

      if (data.error) {
        alert("Erreur : " + data.error);
      } else {
        // Si WhatsApp → on affiche le lien
        if (sendMethod === "whatsapp") {
          setWhatsappLink(data.whatsappLink);
        }

        // Si email → confirmation
        if (sendMethod === "email") {
          alert("Email envoyé avec succès !");
        }
      }
    } catch (err) {
      console.error(err);
      alert("Erreur inattendue");
    }

    setLoading(false);
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Créer un Utilisateur</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">

        <input className="input" placeholder="Prénom" value={prenom} onChange={(e) => setPrenom(e.target.value)} required />
        <input className="input" placeholder="Nom" value={nom} onChange={(e) => setNom(e.target.value)} required />
        <input className="input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="input" placeholder="Téléphone" value={telephone} onChange={(e) => setTelephone(e.target.value)} />
        <input className="input" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} required />

        <select className="input" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="Membre">Membre</option>
          <option value="ResponsableCellule">Responsable Cellule</option>
        </select>

        {role === "ResponsableCellule" && (
          <>
            <input className="input" placeholder="Nom de la Cellule" value={cellule_nom} onChange={(e) => setCelluleNom(e.target.value)} required />
            <input className="input" placeholder="Zone / Ville" value={cellule_zone} onChange={(e) => setCelluleZone(e.target.value)} required />
          </>
        )}

        {/* --- CHOIX OBLIGATOIRE WHATSAPP OU EMAIL --- */}
        <div className="mt-4">
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

      {/* --- Si WhatsApp : afficher le bouton --- */}
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
