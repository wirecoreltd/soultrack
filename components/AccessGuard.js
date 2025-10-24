// /components/AccessGuard.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { canAccessPage } from "../lib/accessControl";

export default function AccessGuard({ children }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // 🧭 Vérifie l'accès quand la page change
    checkAccess();
  }, [router.pathname]);

  const checkAccess = () => {
    try {
      const rolesData = localStorage.getItem("userRole");
      if (!rolesData) {
        console.warn("🚫 Aucun rôle trouvé → redirection vers /login");
        router.push("/login");
        return;
      }

      const roles = JSON.parse(rolesData);

      // 🔍 Vérifie si l'utilisateur peut accéder à la page actuelle
      if (canAccessPage(roles, router.pathname)) {
        setAuthorized(true);
      } else {
        console.warn("⛔ Accès refusé :", router.pathname, "pour rôle(s)", roles);
        router.push("/index");
      }
    } catch (err) {
      console.error("Erreur AccessGuard :", err);
      router.push("/login");
    }
  };

  // 🕐 Pendant la vérification, on ne rend rien
  if (!authorized) return null;

  // ✅ Accès autorisé → affiche le contenu
  return <>{children}</>;
}
