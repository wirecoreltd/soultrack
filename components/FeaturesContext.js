"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import supabase from "../lib/supabaseClient";
import {
  buildFeaturesState,
  canAccessFeature,
  DEFAULT_FEATURES,
} from "../lib/features";

const FeaturesContext = createContext(null);

// Pages publiques du site marketing : jamais besoin des features,
// ne doivent jamais être bloquées par ce loader (SEO + perf)
const PUBLIC_ROUTES = ["/", "/pricing", "/about", "/contact", "/fonctionnement", "/terms", "/privacy", "/refund"];

export function FeaturesProvider({ children }) {
  const [features, setFeatures] = useState(null);
  const [loadingFeatures, setLoadingFeatures] = useState(true);
  const router = useRouter();
  const isPublicRoute = PUBLIC_ROUTES.includes(router.pathname);

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
  // ne sont pas chargées, MAIS uniquement pour les pages privées de l'app.
  // Sans ça, features passe de null → valeur réelle, ce qui provoque un
  // unmount/remount de TOUS les composants enfants et réinitialise leur
  // state (loading, formData, etc.) — mais les pages publiques du site
  // (accueil, pricing, about...) n'ont pas besoin de features et ne
  // doivent jamais être bloquées, sinon Google ne voit que "Chargement..."
  // au lieu du vrai contenu (title, meta, canonical, H1...).
  if (loadingFeatures && !isPublicRoute) {
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
