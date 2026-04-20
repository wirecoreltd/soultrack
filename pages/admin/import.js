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

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("eglise_id, branche_id, cellule_id")
        .eq("id", userId)
        .single();

      if (!error && profile) {
        setUser(profile);
      }

      setLoading(false);
    };

    fetchUser();
  }, []);

  if (loading) {
    return <p className="text-center mt-10">Chargement...</p>;
  }

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
