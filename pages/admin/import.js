"use client";
import { useEffect, useState } from "react";
import supabase from "../../lib/supabaseClient";
import ImportMembresCSV from "../../components/ImportMembresCSV";

export default function ImportPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        setLoading(false);
        return;
      }

      const userId = session.session.user.id;

      // 1. Récupère le profil
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("eglise_id, branche_id")
        .eq("id", userId)
        .single();

      if (error || !profile) {
        setLoading(false);
        return;
      }

      // 2. Récupère la cellule dont il est responsable
      const { data: cellule } = await supabase
        .from("cellules")
        .select("id")
        .eq("responsable_id", userId)
        .single();

      setUser({
        eglise_id: profile.eglise_id,
        branche_id: profile.branche_id,
        cellule_id: cellule?.id || null,
      });

      setLoading(false);
    };

    fetchUser();
  }, []);

  if (loading) return <p className="text-center mt-10">Chargement...</p>;

  if (!user) {
    return (
      <p className="text-center mt-10 text-red-600">
        Utilisateur non authentifié
      </p>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">
          Importer des membres (Cellule)
        </h1>
        <ImportMembresCSV user={user} />
      </div>
    </div>
  );
}
