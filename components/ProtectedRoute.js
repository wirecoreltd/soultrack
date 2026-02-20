"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "../lib/supabaseClient";

export default function ProtectedRoute({ allowedRoles = [], children }) {
  const [userRoles, setUserRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchRoles = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, roles")
          .eq("id", user.id)
          .single();

        // Si `roles` existe, on prend le tableau, sinon fallback sur role string
        if (profile?.roles && profile.roles.length > 0) {
          setUserRoles(profile.roles);
        } else if (profile?.role) {
          setUserRoles([profile.role]);
        }
      }
      setLoading(false);
    };
    fetchRoles();
  }, []);

  if (loading) return <div className="text-white text-center mt-20">Chargement...</div>;

  // ✅ Vérification : au moins un rôle correspond à allowedRoles
  const hasAccess = userRoles.some(r => allowedRoles.includes(r));

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-800 text-white p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">🚫 Accès refusé</h1>
        <p className="mb-6">Vous n’avez pas les permissions nécessaires pour accéder à cette page.</p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-semibold"
        >
          ← Retour
        </button>
      </div>
    );
  }

  return children;
}
