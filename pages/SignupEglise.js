import { createClient } from "@supabase/supabase-js";
import { v2 as cloudinary } from "cloudinary";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  try {
    const formData = await req.formData();

    // ======================
    // 1. Extract fields
    // ======================
    const nomEglise = formData.get("nomEglise");
    const nomBranche = formData.get("nomBranche");
    const denomination = formData.get("denomination");
    const ville = formData.get("ville");
    const localisation = formData.get("localisation");

    const adminPrenom = formData.get("adminPrenom");
    const adminNom = formData.get("adminNom");
    const adminEmail = formData.get("adminEmail");
    const adminPassword = formData.get("adminPassword");

    const logoFile = formData.get("logo");

    // ======================
    // 2. Validation minimale
    // ======================
    if (!nomEglise || !adminEmail || !adminPassword) {
      return Response.json(
        { error: "Champs obligatoires manquants" },
        { status: 400 }
      );
    }

    // ======================
    // 3. Upload logo (Cloudinary)
    // ======================
    let logoUrl = null;

    if (logoFile && logoFile.size > 0) {
      const buffer = Buffer.from(await logoFile.arrayBuffer());

      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            { folder: "soultrack/logos" },
            (err, result) => {
              if (err) reject(err);
              else resolve(result);
            }
          )
          .end(buffer);
      });

      logoUrl = uploadResult.secure_url;
    }

    // ======================
    // 4. Check email exist
    // ======================
    const { data: existing } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("email", adminEmail)
      .maybeSingle();

    if (existing) {
      return Response.json(
        { error: "Email déjà utilisé" },
        { status: 400 }
      );
    }

    // ======================
    // 5. Create church
    // ======================
    const { data: eglise, error: egliseError } = await supabaseAdmin
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
      return Response.json({ error: egliseError.message }, { status: 400 });
    }

    // ======================
    // 6. Create branch
    // ======================
    const { data: branche, error: brancheError } = await supabaseAdmin
      .from("branches")
      .insert([
        {
          nom: nomBranche,
          localisation,
          eglise_id: eglise.id,
        },
      ])
      .select()
      .single();

    if (brancheError) {
      return Response.json({ error: brancheError.message }, { status: 400 });
    }

    // ======================
    // 7. Create auth user
    // ======================
    const { data: auth, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
      });

    if (authError) {
      return Response.json({ error: authError.message }, { status: 400 });
    }

    // ======================
    // 8. Create profile
    // ======================
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert([
        {
          id: auth.user.id,
          prenom: adminPrenom,
          nom: adminNom,
          email: adminEmail,
          role: "Administrateur",
          roles: ["Administrateur"],
          eglise_id: eglise.id,
          branche_id: branche.id,
        },
      ])
      .select()
      .single();

    if (profileError) {
      return Response.json({ error: profileError.message }, { status: 400 });
    }

    // ======================
    // SUCCESS
    // ======================
    return Response.json({
      message: "Église créée avec succès",
      eglise,
      branche,
      profile,
    });

  } catch (err) {
    return Response.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
