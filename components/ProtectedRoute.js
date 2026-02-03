"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const rolesStr = localStorage.getItem("userRole");
    let roles = [];

    if (rolesStr) {
      try {
        roles = JSON.parse(rolesStr);
      } catch {
        roles = [rolesStr];
      }
    }

    // Si pas connecté → login
    if (!userId) {
      router.replace("/login");
      return;
    }

    // Si rôle non autorisé → login
    if (allowedRoles.length > 0 && !roles.some((r) => allowedRoles.includes(r))) {
      router.replace("/login");
      return;
    }

    setAuthorized(true);
  }, [router, allowedRoles]);

  if (!authorized) return null; // ou un loader si tu veux

  return <>{children}</>;
}
