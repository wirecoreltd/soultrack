// pages/api/signup-eglise.js
import { createClient } from "@supabase/supabase-js";
import { addMonths } from "date-fns";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  const {
    nomEglise,
    denomination,
    ville,
    localisation,
    logoUrl,
    adminPrenom,
    adminNom,
    adminEmail,
    adminPassword,
    planId = "free",
  } = req.body;

  try {
    // 1️⃣ Vérifier si l'email existe déjà
    const { data: existing } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("email", adminEmail)
      .maybeSingle();

    if (existing) {
      return res.status(400).json({ error: "Email déjà utilisé" });
    }

    // 2️⃣ Créer l'église (sans branche)
    const { data: egliseData, error: egliseError } = await supabaseAdmin
      .from("eglises")
      .insert([{
        nom: nomEglise,
        denomination,
        ville,
        pays: localisation,
        logo_url: logoUrl ?? null,
      }])
      .select()
      .single();

    if (egliseError) return res.status(400).json({ error: egliseError.message });

    const egliseId = egliseData.id;

    // 3️⃣ Créer l'utilisateur admin dans Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
    });

    if (authError) return res.status(400).json({ error: authError.message });

    const adminUserId = authData.user.id;

    // 4️⃣ Créer le profil admin (sans branche_id)
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert([{
        id: adminUserId,
        prenom: adminPrenom,
        nom: adminNom,
        email: adminEmail,
        role: "Administrateur",
        roles: ["Administrateur"],
        eglise_id: egliseId,
        must_change_password: false,
      }])
      .select()
      .single();

    if (profileError) return res.status(400).json({ error: profileError.message });

    // 5️⃣ Créer la souscription
    const { error: subError } = await supabaseAdmin
      .from("subscriptions")
      .insert([{
        eglise_id: egliseId,
        plan_id: planId,
        status: "active",
        started_at: new Date().toISOString(),
        expires_at: planId === "free" ? null : addMonths(new Date(), 1).toISOString(),
      }]);

    if (subError) return res.status(400).json({ error: subError.message });

    return res.status(200).json({
      message: "Église et admin créés avec succès !",
      eglise: egliseData,
      admin: profileData,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
