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
    const { prenom, nom, email, password, role, telephone } = req.body;

    // --- 1️⃣ Création utilisateur Auth ---
    const { data: userData, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (createError) throw createError;

    const user = userData.user;

    // --- 2️⃣ Insertion dans profiles ---
    const { error: profileError } = await supabase.from("profiles").insert({
      id: user.id,
      prenom,
      nom,
      email,
      telephone,
      role,
      must_change_password: true, // ⭐ OBLIGE changement au premier login
    });

    if (profileError) throw profileError;

    // =====================================================================================
    // 3️⃣ Préparation des messages email & WhatsApp
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

    // =====================================================================================
    // 4️⃣ Envoi EMAIL via SendGrid (si clé présente)
    let emailStatus = "not_sent";

    if (process.env.SENDGRID_API_KEY) {
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
      } catch (e) {
        console.error("Erreur SendGrid:", e);
        emailStatus = "failed";
      }
    }

    // =====================================================================================
    // 5️⃣ Génération du lien WhatsApp (pas d’API nécessaire)
    // si téléphone fourni
    let whatsappLink = null;

    if (telephone) {
      const cleanPhone = telephone.replace(/\D/g, "");
      const encoded = encodeURIComponent(message);

      whatsappLink = `https://wa.me/${cleanPhone}?text=${encoded}`;
    }

    // =====================================================================================

    return res.status(200).json({
      message: "Utilisateur créé avec succès",
      email_status: emailStatus,
      whatsapp_link: whatsappLink, // 👉 lien simple pour envoyer le message
    });

  } catch (err) {
    console.error("Erreur creation:", err);
    return res.status(500).json({ error: err.message });
  }
}
