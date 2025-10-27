// components/AccessGuard.js

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { canAccessPage } from "../lib/accessControl";

export default function AccessGuard({ children }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(null); // null = en cours

  useEffect(() => {
    const checkAccess = () => {
      const rolesData = localStorage.getItem("userRole");
      if (!rolesData) {
        if (router.pathname !== "/login") router.push("/login");
        setAuthorized(false);
        return;
      }

      let roles = [];
      try {
        roles = JSON.parse(rolesData);
        if (!Array.isArray(roles)) roles = [roles];
      } catch {
        roles = [rolesData];
      }

      // Vérifie si la page est autorisée
      if (canAccessPage(roles, router.pathname)) {
        setAuthorized(true);
      } else {
        // 🔹 Redirige uniquement si on n’est pas déjà sur /
        if (router.pathname !== "/") router.push("/");
        setAuthorized(false);
      }
    };

    // Exécute la vérification après un petit délai (évite les conflits)
    const timer = setTimeout(checkAccess, 200);
    return () => clearTimeout(timer);
  }, [router.pathname]);

  if (authorized === null) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        Chargement...
      </div>
    );
  }

  if (!authorized) return null;

  return <>{children}</>;
}
