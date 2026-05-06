"use client";

import { createContext, useContext, useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";

// ✅ SOURCE UNIQUE — tout vient de lib/features
import {
  buildFeaturesState,
  canAccessFeature,
  DEFAULT_FEATURES,
} from "../lib/features";

const FeaturesContext = createContext(null);

export function FeaturesProvider({ children }) {
  const [features, setFeatures] = useState(null);
  const [loadingFeatures, setLoadingFeatures] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setLoadingFeatures(false); // ✅ ne pas rester bloqué
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("eglise_id, roles, role")
          .eq("id", user.id) // ✅ fix bug markdown
          .single();

        if (!profile?.eglise_id) {
          setLoadingFeatures(false); // ✅ ne pas rester bloqué
          return;
        }

        // ✅ Superadmin voit tout
        const roles = Array.isArray(profile.roles)
          ? profile.roles
          : [profile.role];

        if (roles.includes("Superadmin")) {
          setFeatures(null); // null = tout visible
          setLoadingFeatures(false); // ✅ FIX — était oublié avant
          return;
        }

        const { data: dbFeatures } = await supabase
          .from("eglise_features")
          .select("feature, active")
          .eq("eglise_id", profile.eglise_id);

        setFeatures(buildFeaturesState(dbFeatures || []));
      } catch (err) {
        console.error("FeaturesContext error:", err);
      } finally {
        setLoadingFeatures(false);
      }
    };

    load();
  }, []);

  return (
    <FeaturesContext.Provider value={{ features, loadingFeatures }}>
      {children}
    </FeaturesContext.Provider>
  );
}

// ─── Hook global ─────────────────────────────────────────────────────────────
export function useFeatures() {
  const ctx = useContext(FeaturesContext);
  if (!ctx) throw new Error("useFeatures must be used inside FeaturesProvider");
  return ctx;
}

// ─── Hook par clé ─────────────────────────────────────────────────────────────
export function useFeature(key) {
  const { features } = useFeatures();
  if (features === null) return true; // Superadmin → tout actif
  return canAccessFeature(features, key);
}
