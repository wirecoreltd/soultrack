// pages/api/send-access.js
import supabase from "../../lib/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  const { email, phone, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email et mot de passe requis" });
  }

  try {
    // 1. Générer un lien magique de connexion
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/login`,
      },
    });

    if (error) {
      console.error("Erreur Supabase OTP:", error);
      return res.status(500).json({ error: "Erreur en envoyant le lien" });
    }

    // 2. Lien WhatsApp prêt à envoyer manuellement
    let whatsappMessage = null;
    if (phone) {
      whatsappMessage = `https://wa.me/${phone.replace(
        /[^0-9]/g,
        ""
      )}?text=${encodeURIComponent(
        `Bienvenue !\nVoici vos accès :\nEmail: ${email}\nMot de passe temporaire: ${password}\nLien de connexion : ${process.env.NEXT_PUBLIC_SITE_URL}/login`
      )}`;
    }

    return res.status(200).json({
      success: true,
      message: "Email de connexion envoyé.",
      whatsappLink: whatsappMessage, // pour affichage dans ton app
    });
  } catch (err) {
    console.error("Erreur API:", err);
    return res.status(500).json({ error: "Erreur interne serveur" });
  }
}
