"use client";

import { createContext, useContext, useEffect, useState } from "react";
import supabase from "../../lib/supabaseClient";
import { buildFeaturesState, canAccessFeature } from "../../lib/features";

const FeaturesContext = createContext(null);

export function FeaturesProvider({ children }) {
  const [features, setFeatures] = useState(null);
  const [loadingFeatures, setLoadingFeatures] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from("profiles")
          .select("eglise_id, roles, role")
          .eq("id", user.id)
          .single();

        if (!profile?.eglise_id) return;

        // Superadmin voit tout → pas de filtre
        const roles = Array.isArray(profile.roles) ? profile.roles : [profile.role];
        if (roles.includes("Superadmin")) {
          setFeatures(null); // null = tout visible
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

// ─── Hook ────────────────────────────────────────────────────────────────────
export function useFeatures() {
  const ctx = useContext(FeaturesContext);
  if (!ctx) throw new Error("useFeatures must be used inside FeaturesProvider");
  return ctx;
}

// ─── Helper direct ────────────────────────────────────────────────────────────
export function useFeature(key) {
  const { features } = useFeatures();
  if (features === null) return true; // Superadmin → tout actif
  return canAccessFeature(features, key);
}
