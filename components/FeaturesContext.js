"use client";
import { createContext, useContext, useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
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
          setFeatures(buildFeaturesState([])); // ✅ état défini, pas null
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("eglise_id, roles, role")
          .eq("id", user.id)
          .single();

        if (!profile?.eglise_id) {
          setFeatures(buildFeaturesState([])); // ✅ état défini, pas null
          return;
        }

        const roles = Array.isArray(profile.roles)
          ? profile.roles
          : [profile.role];

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
        setFeatures(buildFeaturesState([])); // ✅ ne pas rester bloqué sur erreur
      } finally {
        setLoadingFeatures(false);
      }
    };

    load();
  }, []);

  // ✅ FIX PRINCIPAL — on bloque le rendu des enfants tant que les features
  // ne sont pas chargées. Sans ça, features passe de null → valeur réelle,
  // ce qui provoque un unmount/remount de TOUS les composants enfants
  // et réinitialise leur state (loading, formData, etc.)
  if (loadingFeatures) {
    return <p className="text-center mt-10 text-white text-lg">Chargement...</p>;
  }

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
