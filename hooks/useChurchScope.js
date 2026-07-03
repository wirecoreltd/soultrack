// ═══════════════════════════════════════════════════════════════
// HOOK : useChurchScope
// ═══════════════════════════════════════════════════════════════
// Description : Hook React (client) qui initialise le contexte
// "église" de l'utilisateur connecté. Récupère la session Supabase,
// charge le profil utilisateur associé (id, role, eglise_id), et
// expose une fonction utilitaire `scopedQuery` permettant de
// requêter n'importe quelle table Supabase en filtrant
// AUTOMATIQUEMENT sur l'église de l'utilisateur (eglise_id).
//
// Tables Supabase utilisées :
// - profiles   (lecture)  → id, role, eglise_id de l'utilisateur connecté
// - <table>    (lecture)  → toute table passée à scopedQuery(table, columns),
//                            filtrée par eglise_id
//
// Realtime : aucun (pas d'abonnement realtime dans ce hook)
//
// Edge Function : aucune
// ═══════════════════════════════════════════════════════════════

"use client";
import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";

export default function useChurchScope() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        // 🔐 Session
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          throw new Error("Session absente");
        }

        // 👤 Profil
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, role, eglise_id") // ✅ branche_id retiré
          .eq("id", session.user.id)
          .single();

        if (profileError || !profileData) {
          throw new Error("Profil introuvable");
        }

        if (!profileData.eglise_id) {
          throw new Error("Profil sans église"); // ✅ validation branche_id supprimée
        }

        setProfile(profileData);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  /**
   * 🎯 scopedQuery
   * Applique AUTOMATIQUEMENT :
   * - eglise_id
   */
  const scopedQuery = (table) => {
    if (!profile) return null;
    return supabase
      .from(table)
      .select("*")
      .eq("eglise_id", profile.eglise_id) // ✅ .eq("branche_id", ...) supprimé
      .not("eglise_id", "is", null);
  };

  return {
    profile,
    loading,
    error,
    scopedQuery,
  };
}
