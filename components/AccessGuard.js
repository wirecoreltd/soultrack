// /components/AccessGuard.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { canAccessPage } from "../lib/accessControl";

export default function AccessGuard({ children }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const rolesData = localStorage.getItem("userRole");
    if (!rolesData) {
      router.push("/login");
      return;
    }

    let roles = [];
    try {
      roles = JSON.parse(rolesData);
      if (!Array.isArray(roles)) roles = [roles];
    } catch {
      roles = [rolesData];
    }

    if (canAccessPage(roles, router.pathname)) {
      setAuthorized(true);
    } else {
      // 🔹 Si on est déjà sur index, ne pas rediriger pour éviter boucle
      if (router.pathname !== "/index") router.push("/index");
      setAuthorized(false);
    }
  }, [router.pathname]);

  if (!authorized) return null;
  return <>{children}</>;
}

