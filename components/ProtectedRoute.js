// components/ProtectedRoute.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "../lib/supabaseClient";

export default function ProtectedRoute({ allowedRoles = [], children }) {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        setUserRole(profile?.role || null);
      }
      setLoading(false);
    };
    fetchRole();
  }, []);

  if (loading) return <div className="text-white text-center mt-20">Chargement...</div>;

  if (!allowedRoles.includes(userRole)) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-800 text-white p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">🚫 Accès refusé</h1>
        <p className="mb-6">Vous n’avez pas les permissions nécessaires pour accéder à cette page.</p>
        <button
          onClick={() => router.back()} // retourne à la page précédente
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-semibold"
        >
          ← Retour
        </button>
      </div>
    );
  }

  return children;
}
