"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "../lib/supabaseClient";
import HeaderPages from "./HeaderPages";
import Footer from "./Footer";

export default function ProtectedRoute({ allowedRoles = [], children }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data?.session) {
        setHasAccess(false);
        setLoading(false);
        return;
      }

      const storedRoles = localStorage.getItem("userRole");
      let roles = [];
      if (storedRoles) {
        try {
          const parsedRoles = JSON.parse(storedRoles);
          roles = Array.isArray(parsedRoles) ? parsedRoles : [parsedRoles];
        } catch {
          roles = [storedRoles];
        }
      }

      if (allowedRoles.length === 0 || roles.some(r => allowedRoles.includes(r))) {
        setHasAccess(true);
      } else {
        setHasAccess(false);
      }
      setLoading(false);
    };

    checkAccess();
  }, [allowedRoles]);

  if (loading) {
    return <p className="text-center mt-10 text-white text-lg">Chargement...</p>;
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-gradient-to-br from-purple-200 via-pink-100 to-yellow-200">
        <HeaderPages />

        <div className="flex-1 flex flex-col justify-center items-center text-center p-6">
          <img src="/logo.png" alt="Logo SoulTrack" className="w-32 h-32 mb-6 opacity-20" />
          <h1 className="text-5xl font-bold text-red-600 mb-4">🚫 Accès refusé</h1>
          <p className="text-xl text-gray-700 max-w-md">
            Vous n’avez pas les permissions nécessaires pour accéder à cette page.
          </p>
        </div>

        <Footer />
      </div>
    );
  }

  return <>{children}</>;
}
