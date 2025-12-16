import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    const { prenom, nom, email, password, role, telephone, sendMethod } = req.body;

    if (!sendMethod) {
      return res.status(400).json({ error: "Méthode d’envoi non choisie." });
    }

    // ============================================================
    // 1️⃣ CREATION UTILISATEUR AUTH
    // ============================================================
    const { data: userData, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (createError) throw createError;

    const user = userData.user;

    // ============================================================
    // 2️⃣ INSERTION DANS TABLE profiles
    // ============================================================
    const { error: profileError } = await supabase.from("profiles").insert({
      id: user.id,
      prenom,
      nom,
      email,
      telephone,
      role,
      must_change_password: true,
    });

    if (profileError) throw profileError;

    // ============================================================
    // 3️⃣ MESSAGE TEMPLATE
    // ============================================================
    const loginUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/login`;

    const message = `
Bonjour ${prenom},

Votre compte SoulTrack a été créé avec succès 🙌

Voici vos accès :

📧 Email : ${email}
🔑 Mot de passe : ${password}

Connectez-vous ici :
➡️ ${loginUrl}

🙏 Nous sommes heureux de vous compter parmi nous. Que Dieu vous bénisse !
– L'équipe SoulTrack
    `.trim();

    // ============================================================
    // 4️⃣ ENVOI EMAIL SI sendMethod === "email"
    // ============================================================
    let emailStatus = "not_sent";
    let whatsappLink = null;

    if (sendMethod === "email") {
      if (!process.env.SENDGRID_API_KEY) {
        emailStatus = "failed_no_key";
      } else {
        try {
          const emailRes = await fetch("https://api.sendgrid.com/v3/mail/send", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              personalizations: [{ to: [{ email }] }],
              from: { email: process.env.EMAIL_FROM || "no-reply@soultrack.app" },
              subject: "Vos accès SoulTrack",
              content: [{ type: "text/plain", value: message }],
            }),
          });

          emailStatus = emailRes.ok ? "sent" : "failed";
        } catch (err) {
          console.error("Erreur SendGrid:", err);
          emailStatus = "failed";
        }
      }
    }

    // ============================================================
    // 5️⃣ LIEN WHATSAPP SI sendMethod === "whatsapp"
    // ============================================================
    if (sendMethod === "whatsapp") {
      if (!telephone) {
        return res.status(400).json({
          error: "Numéro de téléphone requis pour envoyer via WhatsApp.",
        });
      }

      const cleanPhone = telephone.replace(/\D/g, "");
      const encoded = encodeURIComponent(message);

      whatsappLink = `https://wa.me/${cleanPhone}?text=${encoded}`;
    }

    // ============================================================
    // 6️⃣ RESPONSE
    // ============================================================
    return res.status(200).json({
      message: "Utilisateur créé avec succès",
      email_status: emailStatus,
      whatsapp_link: whatsappLink,
      sendMethod,
    });

  } catch (err) {
    console.error("Erreur création:", err);
    return res.status(500).json({ error: err.message });
  }
}
