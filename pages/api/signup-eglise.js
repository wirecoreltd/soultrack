import { createClient } from "@supabase/supabase-js";
import { v2 as cloudinary } from "cloudinary";

// 🔐 Supabase admin
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 🔐 Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    const formData = await req.formData();

const nomEglise = formData.get("nomEglise");
const nomBranche = formData.get("nomBranche");
const denomination = formData.get("denomination");
const ville = formData.get("ville");
const localisation = formData.get("localisation");

const adminPrenom = formData.get("adminPrenom");
const adminNom = formData.get("adminNom");
const adminEmail = formData.get("adminEmail");
const adminPassword = formData.get("adminPassword");

    // =========================
    // 1️⃣ Upload logo (si présent)
    // =========================
    let logoUrl = null;

    if (req.body.logo) {
      const upload = await cloudinary.uploader.upload(req.body.logo, {
        folder: "soultrack/logos",
      });

      logoUrl = upload.secure_url;
    }

    // =========================
    // 2️⃣ Vérifier email
    // =========================
    const { data: existing } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("email", adminEmail)
      .maybeSingle();

    if (existing) {
      return res.status(400).json({ error: "Email déjà utilisé" });
    }

    // =========================
    // 3️⃣ Créer église
    // =========================
    const { data: egliseData, error: egliseError } = await supabaseAdmin
      .from("eglises")
      .insert([
        {
          nom: nomEglise,
          denomination,
          ville,
          pays: localisation,
          logo_url: logoUrl,
        },
      ])
      .select()
      .single();

    if (egliseError) {
      return res.status(400).json({ error: egliseError.message });
    }

    const egliseId = egliseData.id;

    // =========================
    // 4️⃣ Créer branche
    // =========================
    const { data: brancheData, error: brancheError } = await supabaseAdmin
      .from("branches")
      .insert([
        {
          nom: nomBranche,
          localisation,
          eglise_id: egliseId,
        },
      ])
      .select()
      .single();

    if (brancheError) {
      return res.status(400).json({ error: brancheError.message });
    }

    const brancheId = brancheData.id;

    // =========================
    // 5️⃣ Créer user auth
    // =========================
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
      });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    const adminUserId = authData.user.id;

    // =========================
    // 6️⃣ Créer profile admin
    // =========================
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert([
        {
          id: adminUserId,
          prenom: adminPrenom,
          nom: adminNom,
          email: adminEmail,
          role: "Administrateur",
          roles: ["Administrateur"],
          eglise_id: egliseId,
          branche_id: brancheId,
        },
      ])
      .select()
      .single();

    if (profileError) {
      return res.status(400).json({ error: profileError.message });
    }

    // =========================
    // ✅ SUCCESS
    // =========================
    return res.status(200).json({
      message: "Église créée avec succès",
      eglise: egliseData,
      branche: brancheData,
      admin: profileData,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
