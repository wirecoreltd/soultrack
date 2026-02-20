export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const body = await req.json();

    const {
      prenom,
      nom,
      telephone,
      email,
      password,
      responsable_id,
    } = body;

    if (!email || !password || !responsable_id) {
      return NextResponse.json(
        { error: "Champs manquants" },
        { status: 400 }
      );
    }

    // 1️⃣ récupérer église + branche du responsable
    const { data: responsable, error: respErr } = await supabaseAdmin
      .from("profiles")
      .select("eglise_id, branche_id")
      .eq("id", responsable_id)
      .single();

    if (respErr || !responsable) {
      return NextResponse.json(
        { error: "Responsable introuvable" },
        { status: 400 }
      );
    }

    // 2️⃣ créer l'utilisateur auth
    const { data: authUser, error: authErr } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (authErr) {
      return NextResponse.json(
        { error: authErr.message },
        { status: 400 }
      );
    }

    // 3️⃣ créer le profil conseiller lié à église + branche
    const { error: profileErr } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: authUser.user.id,
        email,
        prenom,
        nom,
        telephone,
        role: "Conseiller",
        roles: ["Conseiller"],
        responsable_id,
        must_change_password: true,
        eglise_id: responsable.eglise_id,
        branche_id: responsable.branche_id,
      });

    if (profileErr) {
      return NextResponse.json(
        { error: profileErr.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("create-conseiller error:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
