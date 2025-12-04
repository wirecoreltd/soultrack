import supabase from "../../lib/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Méthode non autorisée" });

  const data = req.body;

  const { error } = await supabase.from("attendance").insert([data]);

  if (error) return res.status(400).json({ error: error.message });

  res.status(200).json({ success: true });
}
