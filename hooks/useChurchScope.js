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
          .select("id, role, eglise_id, branche_id")
          .eq("id", session.user.id)
          .single();

        if (profileError || !profileData) {
          throw new Error("Profil introuvable");
        }

        if (!profileData.eglise_id || !profileData.branche_id) {
          throw new Error("Profil sans église ou branche");
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
   * - branche_id
   */
  const scopedQuery = (table) => {
    if (!profile) return null;

    return supabase
      .from(table)
      .select("*")
      .eq("eglise_id", profile.eglise_id)
      .eq("branche_id", profile.branche_id)
      .not("eglise_id", "is", null);
  };

  return {
    profile,
    loading,
    error,
    scopedQuery,
  };
}
