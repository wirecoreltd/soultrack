import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password, prenom, nom, telephone, responsable_id } = body;

    if (!email || !password || !responsable_id) {
      return Response.json({ error: "Champs manquants" }, { status: 400 });
    }

    // 🔹 1. Récupérer le profil du responsable
    const { data: responsable, error: respErr } = await supabaseAdmin
      .from("profiles")
      .select("eglise_id, branche_id")
      .eq("id", responsable_id)
      .single();

    if (respErr || !responsable) {
      return Response.json(
        { error: "Profil responsable introuvable" },
        { status: 400 }
      );
    }

    // 🔹 2. Créer l'utilisateur Auth
    const { data: authUser, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (authError) {
      return Response.json({ error: authError.message }, { status: 400 });
    }

    // 🔹 3. Créer le profil CONSEILLER avec eglise & branche
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: authUser.user.id,
        email,
        prenom,
        nom,
        telephone,
        role: "Conseiller",
        responsable_id,
        must_change_password: true,
        eglise_id: responsable.eglise_id,
        branche_id: responsable.branche_id,
      });

    if (profileError) {
      return Response.json(
        { error: profileError.message },
        { status: 400 }
      );
    }

    return Response.json({ success: true });
  } catch (err) {
    return Response.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
