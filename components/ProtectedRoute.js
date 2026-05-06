"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "../lib/supabaseClient";
import HeaderPages from "./HeaderPages";
import Footer from "./Footer";

/**
 * ProtectedRoute
 *
 * Props :
 *   allowedRoles   string[]  — rôles autorisés (vide = tous les connectés)
 *   requiredFeature string   — feature requise pour l'église (optionnel)
 *                             ex: "familles", "cellules", "evangelisation"
 *                             Si absent, pas de vérification feature.
 */
export default function ProtectedRoute({ allowedRoles = [], requiredFeature = null, children }) {
  const router  = useRouter();
  const [status, setStatus] = useState("loading"); // "loading" | "ok" | "no_role" | "no_feature"

  useEffect(() => {
    const checkAccess = async () => {
      // ── 1. Session ──
      const { data } = await supabase.auth.getSession();
      if (!data?.session) {
        setStatus("no_role");
        return;
      }

      // ── 2. Vérification des rôles ──
      const storedRoles = localStorage.getItem("userRole");
      let roles = [];
      if (storedRoles) {
        try {
          const parsed = JSON.parse(storedRoles);
          roles = Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          roles = [storedRoles];
        }
      }

      const roleOk =
        allowedRoles.length === 0 ||
        roles.includes("Superadmin") ||        // Superadmin passe toujours
        roles.some((r) => allowedRoles.includes(r));

      if (!roleOk) {
        setStatus("no_role");
        return;
      }

      // ── 3. Vérification feature (si requise) ──
      if (requiredFeature && !roles.includes("Superadmin")) {
        // Priorité : localStorage
        let activeFeatures = [];
        const storedFeatures = localStorage.getItem("egliseFeatures");

        if (storedFeatures) {
          try {
            activeFeatures = JSON.parse(storedFeatures);
          } catch {
            activeFeatures = [];
          }
        } else {
          // Fallback : recharger depuis Supabase
          const storedEgliseId = localStorage.getItem("egliseId");
          if (storedEgliseId) {
            const { data: features } = await supabase
              .from("eglise_features")
              .select("feature")
              .eq("eglise_id", storedEgliseId)
              .eq("active", true);
            activeFeatures = (features || []).map((f) => f.feature);
            localStorage.setItem("egliseFeatures", JSON.stringify(activeFeatures));
          }
        }

        if (!activeFeatures.includes(requiredFeature)) {
          setStatus("no_feature");
          return;
        }
      }

      setStatus("ok");
    };

    checkAccess();
  }, [allowedRoles, requiredFeature]);

  // ── États ──────────────────────────────────────────────────────────────────
  if (status === "loading") {
    return <p className="text-center mt-10 text-white text-lg">Chargement...</p>;
  }

  if (status === "no_role") {
    return (
      <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
        <HeaderPages />
        <div className="flex-1 flex flex-col justify-center items-center text-center p-6">
          <h3 className="text-3xl font-bold text-red-600 mb-4">🚫 Accès refusé</h3>
          <p className="text-xl text-white max-w-md">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  if (status === "no_feature") {
    return (
      <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
        <HeaderPages />
        <div className="flex-1 flex flex-col justify-center items-center text-center p-6">
          <h3 className="text-3xl font-bold text-orange-400 mb-4">🔒 Fonctionnalité non activée</h3>
          <p className="text-xl text-white max-w-md">
            Cette fonctionnalité n'est pas activée pour votre église.
            Contactez l'administrateur SoulTrack pour en savoir plus.
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  return <>{children}</>;
}
