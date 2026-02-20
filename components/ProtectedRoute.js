"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "../lib/supabaseClient";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data?.session) {
        router.replace("/login");
        return;
      }

      const storedRoles = localStorage.getItem("userRole");
      let roles = [];
      if (storedRoles) {
        try {
          roles = JSON.parse(storedRoles);
          if (!Array.isArray(roles)) roles = [roles];
        } catch {
          roles = [storedRoles];
        }
      }

      // ✅ Administrateur a toujours accès
      if (roles.includes("Administrateur")) {
        setHasAccess(true);
      } else if (allowedRoles.length === 0) {
        // Si pas de roles spécifiés, on autorise tous les utilisateurs connectés
        setHasAccess(true);
      } else {
        // Vérifie si l'utilisateur a au moins un rôle autorisé
        setHasAccess(roles.some(r => allowedRoles.includes(r)));
      }

      setLoading(false);
    };

    checkAccess();
  }, [router, allowedRoles]);

  if (loading) return null;

  if (!hasAccess) return <p className="text-red-600 text-center mt-10">🚫 Accès refusé<br/>Vous n’avez pas les permissions nécessaires pour accéder à cette page.</p>;

  return <>{children}</>;
}
