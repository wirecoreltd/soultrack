// ✅ pages/api/create-user.js

// pages/api/create-user.js

import { createClient } from "@supabase/supabase-js";
import fetch from "node-fetch"; // Pour l'envoi WhatsApp si besoin

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Méthode non autorisée" });

  try {
    const { prenom, nom, email, password, role, telephone } = req.body;

    // 1️⃣ Crée un utilisateur dans Supabase Auth
    const { data: userData, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (createError) throw createError;
    const user = userData.user;

    // 2️⃣ Ajoute le profil avec must_change_password = true
    const { error: profileError } = await supabase.from("profiles").insert({
      id: user.id,
      prenom,
      nom,
      email,
      role,
      telephone: telephone || "",
      must_change_password: true, // flag première connexion
    });

    if (profileError) throw profileError;

    // 3️⃣ Préparer message pour email et WhatsApp
    const loginUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/login`;
    const message = `
Bonjour ${prenom},

Bienvenue sur SoulTrack ! 🎉
Voici vos informations de connexion :

- Email: ${email}
- Mot de passe: ${password}
- URL de connexion: ${loginUrl}

Petit mot d'encouragement : "La famille est le premier lieu où l'amour et la foi se transmettent. Prenez soin de ceux qui vous entourent."

Merci !
`;

    // 4️⃣ Envoyer Email via SendGrid ou Supabase Functions
    if (process.env.SENDGRID_API_KEY) {
      await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email }] }],
          from: { email: process.env.EMAIL_FROM },
          subject: "Bienvenue sur SoulTrack",
          content: [{ type: "text/plain", value: message }],
        }),
      });
    }

    // 5️⃣ Envoyer WhatsApp via Twilio ou 360dialog
    if (process.env.WHATSAPP_API_URL && process.env.WHATSAPP_TOKEN) {
      await fetch(process.env.WHATSAPP_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: telephone,
          type: "text",
          text: { body: message },
        }),
      });
    }

    return res.status(200).json({ message: "Utilisateur créé et notifications envoyées !" });
  } catch (err) {
    console.error("Erreur création utilisateur:", err);
    return res.status(500).json({ error: err.message });
  }
}

