import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Méthode non autorisée" });

  try {
    const { prenom, nom, email, telephone, password } = req.body;
    if (!email || !prenom || !nom || !password)
      return res.status(400).json({ error: "Informations manquantes" });

    const loginUrl = process.env.NEXT_PUBLIC_APP_URL + "/login"; // ex: https://app.soultrack.com/login
    const messageText = `Bonjour ${prenom},\n\nBienvenue sur SoulTrack !\n\nVoici vos identifiants :\nEmail : ${email}\nMot de passe : ${password}\n\nConnectez-vous ici : ${loginUrl}\n\nBonne journée et que Dieu vous bénisse 🙏`;

    // 🔹 Envoi email via Supabase (Postmark ou SMTP configuré)
    const { error: emailError } = await supabase.functions.invoke("send-email", {
      method: "POST",
      body: {
        to: email,
        subject: "Vos accès SoulTrack",
        text: messageText,
      },
    });

    if (emailError) console.error("Erreur envoi email :", emailError);

    // 🔹 Génération lien WhatsApp
    let waLink = "";
    if (telephone) {
      const phone = telephone.replace(/\D/g, ""); // chiffres seulement
      const encodedMessage = encodeURIComponent(messageText);
      waLink = `https://wa.me/${phone}?text=${encodedMessage}`;
    }

    res.status(200).json({
      message: "Accès envoyés avec succès",
      emailSent: !emailError,
      whatsappLink: waLink,
    });
  } catch (err) {
    console.error("Erreur API send-access :", err);
    res.status(500).json({ error: err.message });
  }
}
