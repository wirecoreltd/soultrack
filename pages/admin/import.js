"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import supabase from "../../lib/supabaseClient";
import HeaderPages from "../../components/HeaderPages";
import Footer from "../../components/Footer";
import ProtectedRoute from "../../components/ProtectedRoute";
import ImportMembresCSV from "../../components/ImportMembresCSV";
import ImportMembresCelluleCSV from "../../components/ImportMembresCelluleCSV";
import ImportMembresFamilleCSV from "../../components/ImportMembresFamilleCSV";

export default function ImportPage() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableIntegration", "ResponsableCellule", "ResponsableFamilles"]}>
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
        .select("eglise_id, role")
        .eq("id", authUser.id)
        .single();

      if (!profile) { setLoading(false); return; }

      let cellule_id = null;
      let famille_id = null;

      if (profile.role === "ResponsableCellule") {
        const { data: cellules } = await supabase
          .from("cellules")
          .select("id")
          .eq("responsable_id", authUser.id);
        cellule_id = cellules?.[0]?.id || null;
      }

      if (profile.role === "ResponsableFamille") {
        const { data: familles } = await supabase
          .from("familles")
          .select("id")
          .eq("responsable_id", authUser.id);
        famille_id = familles?.[0]?.id || null;
      }

      setUser({
        eglise_id: profile.eglise_id,
        role: profile.role,
        cellule_id,
        famille_id,
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

  const renderImport = () => {
    switch (user.role) {
      case "ResponsableCellule":
        return <ImportMembresCelluleCSV user={user} />;
      case "ResponsableFamille":
        return <ImportMembresFamilleCSV user={user} />;
      default:
        return <ImportMembresCSV user={user} />;
    }
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: "#333699" }}>
      <HeaderPages />

      <h1 className="text-2xl font-bold mt-4 mb-6 text-center">
        <span className="text-white">Importer des </span>
        <span className="text-emerald-300">membres</span>
      </h1>

      <div className="max-w-3xl w-full mb-6 text-center mx-auto">
        <p className="italic text-base text-white/90">
          Importez facilement vos membres via un fichier CSV.{" "}
          <span className="text-blue-300 font-semibold">Telechargez le template</span>,
          remplissez-le et importez-le en quelques clics pour un{" "}
          <span className="text-blue-300 font-semibold">ajout rapide et fiable</span>.
        </p>
      </div>

      <div className="flex justify-end max-w-6xl mx-auto mb-4">
        <button
          onClick={() => router.back()}
          className="text-white font-semibold px-4 py-2 rounded shadow text-sm"
        >
          ← Retour
        </button>
      </div>

      <div className="flex justify-center">
        <div className="w-full max-w-3xl">
          {renderImport()}
        </div>
      </div>

      <Footer />
    </div>
  );
}
