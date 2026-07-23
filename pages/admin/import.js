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
import { useLang } from "../../hooks/useLang";

const translations = {
  fr: {
    loading: "Chargement...",
    nonAuthentifie: "Utilisateur non authentifié",
    titre1: "Importer des ",
    titre2: "membres",
    retour: "← Retour",
    subtitleCellule: (
      <>
        Importez facilement les membres de votre{" "}
        <span className="text-blue-300 font-semibold">cellule</span> via un fichier CSV.{" "}
        <span className="text-blue-300 font-semibold">Téléchargez le template</span>,
        remplissez-le et importez-le en quelques clics pour un{" "}
        <span className="text-blue-300 font-semibold">ajout rapide et fiable</span>.
      </>
    ),
    subtitleFamille: (
      <>
        Importez facilement les membres de votre{" "}
        <span className="text-blue-300 font-semibold">famille</span> via un fichier CSV.{" "}
        <span className="text-blue-300 font-semibold">Téléchargez le template</span>,
        remplissez-le et importez-le en quelques clics pour un{" "}
        <span className="text-blue-300 font-semibold">ajout rapide et fiable</span>.
      </>
    ),
    subtitleDefault: (
      <>
        Importez facilement vos membres via un fichier CSV.{" "}
        <span className="text-blue-300 font-semibold">Téléchargez le template</span>,
        remplissez-le et importez-le en quelques clics pour un{" "}
        <span className="text-blue-300 font-semibold">ajout rapide et fiable</span>.
      </>
    ),
  },
  en: {
    loading: "Loading...",
    nonAuthentifie: "User not authenticated",
    titre1: "Import ",
    titre2: "members",
    retour: "← Back",
    subtitleCellule: (
      <>
        Easily import members of your{" "}
        <span className="text-blue-300 font-semibold">cell group</span> via a CSV file.{" "}
        <span className="text-blue-300 font-semibold">Download the template</span>,
        fill it in and import it in a few clicks for a{" "}
        <span className="text-blue-300 font-semibold">fast and reliable import</span>.
      </>
    ),
    subtitleFamille: (
      <>
        Easily import members of your{" "}
        <span className="text-blue-300 font-semibold">family group</span> via a CSV file.{" "}
        <span className="text-blue-300 font-semibold">Download the template</span>,
        fill it in and import it in a few clicks for a{" "}
        <span className="text-blue-300 font-semibold">fast and reliable import</span>.
      </>
    ),
    subtitleDefault: (
      <>
        Easily import your members via a CSV file.{" "}
        <span className="text-blue-300 font-semibold">Download the template</span>,
        fill it in and import it in a few clicks for a{" "}
        <span className="text-blue-300 font-semibold">fast and reliable import</span>.
      </>
    ),
  },
};

export default function ImportPage() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableIntegration", "ResponsableCellule", "ResponsableFamilles"]}>
      <ImportPageContent />
    </ProtectedRoute>
  );
}

function ImportPageContent() {
  const router = useRouter();
  const { lang } = useLang();
  const t = translations[lang];

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

      if (profile.role === "ResponsableFamilles") {
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
        <div className="text-white text-center">{t.loading}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#333699" }}>
        <div className="text-red-300 text-center">{t.nonAuthentifie}</div>
      </div>
    );
  }

  const renderImport = () => {
    switch (user.role) {
      case "ResponsableCellule":
        return <ImportMembresCelluleCSV user={user} />;
      case "ResponsableFamilles":
        return <ImportMembresFamilleCSV user={user} />;
      default:
        return <ImportMembresCSV user={user} />;
    }
  };

  const getSubtitle = () => {
    if (user.role === "ResponsableCellule") {
      return <p className="italic text-base text-white/90">{t.subtitleCellule}</p>;
    }
    if (user.role === "ResponsableFamilles") {
      return <p className="italic text-base text-white/90">{t.subtitleFamille}</p>;
    }
    return <p className="italic text-base text-white/90">{t.subtitleDefault}</p>;
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: "#333699" }}>
      <HeaderPages />

      <h1 className="text-2xl font-bold mt-4 mb-6 text-center">
        <span className="text-white">{t.titre1}</span>
        <span className="text-emerald-300">{t.titre2}</span>
      </h1>

      <div className="max-w-3xl w-full mb-6 text-center mx-auto">
        {getSubtitle()}
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
