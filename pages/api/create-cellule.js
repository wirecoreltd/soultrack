export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  const { nom, zone, responsable_id, responsable_nom, telephone } = req.body;

  try {
    const {
      data: { user }
    } = await supabaseAdmin.auth.getUser(
      req.headers.authorization?.replace("Bearer ", "")
    );

    if (!user) {
      return res.status(401).json({ error: "Utilisateur non authentifié" });
    }

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("eglise_id, branche_id")
      .eq("id", user.id)
      .single();

    if (!profile?.eglise_id || !profile?.branche_id) {
      return res.status(400).json({ error: "Église ou branche manquante" });
    }

    const { error } = await supabaseAdmin.from("cellules").insert({
      cellule: nom,
      ville: zone,
      responsable: responsable_nom,
      responsable_id,
      telephone,
      eglise_id: profile.eglise_id,
      branche_id: profile.branche_id,
      created_at: new Date(),
    });

    if (error) throw error;

    return res.status(200).json({ message: "Cellule créée avec succès ✅" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
