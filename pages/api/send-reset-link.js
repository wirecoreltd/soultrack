import supabase from "../../lib/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Méthode non autorisée" });

  const { email } = req.body;

  if (!email) return res.status(400).json({ error: "Email requis" });

  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/update-password`,
    });

    if (error) throw error;

    res.status(200).json({ reset_link: `${process.env.NEXT_PUBLIC_BASE_URL}/login` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
