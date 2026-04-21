"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import supabase from "../../lib/supabaseClient";
import HeaderPages from "../../components/HeaderPages";
import Footer from "../../components/Footer";
import ProtectedRoute from "../../components/ProtectedRoute";
import ImportMembresCSV from "../../components/ImportMembresCSV";

export default function ImportPage() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableCellule", "SuperviseurCellule"]}>
      <ImportPageContent />
    </ProtectedRoute>
  );
}

function ImportPageContent() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) { setLoading(false); return; }

      const { data: profile } = await supabase
        .from("profiles")
        .select("eglise_id, branche_id")
        .eq("id", authUser.id)
        .single();

      if (!profile) { setLoading(false); return; }

      const { data: cellule } = await supabase
        .from("cellules")
        .select("id")
        .eq("responsable_id", authUser.id)
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#333699" }}>
        <div className="text-white text-center">Chargement...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#333699" }}>
        <div className="text-red-300 text-center">Utilisateur non authentifie</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: "#333699" }}>
      <HeaderPages />

      {/* Titre */}
      <h1 className="text-2xl font-bold mt-4 mb-6 text-center">
        <span className="text-white">Importer des </span>
        <span className="text-emerald-300">membres</span>
      </h1>

      {/* Sous-titre */}
      <div className="max-w-3xl w-full mb-6 text-center mx-auto">
        <p className="italic text-base text-white/90">
          Importez facilement vos membres via un fichier CSV.{" "}
          <span className="text-blue-300 font-semibold">Telechargez le template</span>,
          remplissez-le et importez-le en quelques clics pour un{" "}
          <span className="text-blue-300 font-semibold">ajout rapide et fiable</span>.
        </p>
      </div>

      {/* Bouton retour */}
      <div className="flex justify-end max-w-6xl mx-auto mb-4">
        <button
          onClick={() => router.push("/membres-cellule")}
          className="text-white font-semibold px-4 py-2 rounded shadow text-sm"
        >
          Retour aux membres
        </button>
      </div>

      {/* Contenu principal */}
      <div className="flex justify-center">
        <div className="w-full max-w-3xl">
          <ImportMembresCSV user={user} />
        </div>
      </div>

      <Footer />
    </div>
  );
}
