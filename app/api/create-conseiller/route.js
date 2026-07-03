// ═══════════════════════════════════════════════════════════════
// API : Création d'un Conseiller (create-conseiller)
// ═══════════════════════════════════════════════════════════════
// Description : Crée le compte auth et le profil d'un Conseiller à
// partir d'un membre existant, rattaché à un responsable (église +
// branche). Enregistre également une statistique de ministère
// "Conseiller" si un membre_id est fourni.
//
// Tables Supabase utilisées :
// - profiles                (lecture + écriture) → profil responsable + nouveau conseiller
// - membres_complets        (lecture)             → sexe du membre (pour stats)
// - stats_ministere_besoin  (écriture)            → statistique ministère "Conseiller"
//
// Auth Supabase : création via supabaseAdmin.auth.admin.createUser
// ═══════════════════════════════════════════════════════════════

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
      membre_id, // ✅ AJOUT IMPORTANT
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

    const newUserId = authUser.user.id;

    // 3️⃣ créer le profil conseiller
    const { error: profileErr } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: newUserId,
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

    // 4️⃣ ⭐ AJOUT stats_ministere_besoin
    if (membre_id) {
      const { data: membre } = await supabaseAdmin
        .from("membres_complets")
        .select("sexe")
        .eq("id", membre_id)
        .single();

      await supabaseAdmin
        .from("stats_ministere_besoin")
        .insert({
          membre_id,
          eglise_id: responsable.eglise_id,
          branche_id: responsable.branche_id,
          type: "ministere",
          valeur: "Conseiller",
          date_action: new Date().toISOString().split("T")[0],
          sexe: membre?.sexe || null,
        });
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
