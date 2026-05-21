"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import supabase from "../../lib/supabaseClient";
import HeaderPages from "../../components/HeaderPages";
import Footer from "../../components/Footer";
import ProtectedRoute from "../../components/ProtectedRoute";
import ImportMembresCelluleCSV from "../../components/ImportMembresCelluleCSV";
import { useLang } from "../../hooks/useLang";

const translations = {
  fr: {
    loading: "Chargement...",
    nonAuthentifie: "Utilisateur non authentifié",
    titre1: "Importer des ",
    titre2: "membres de cellule",
    subtitle: (
      <>
        Importez facilement vos membres via un fichier CSV.{" "}
        <span className="text-blue-300 font-semibold">Téléchargez le template</span>,
        remplissez-le et importez-le en quelques clics pour un{" "}
        <span className="text-blue-300 font-semibold">ajout rapide et fiable</span>.
      </>
    ),
    retour: "Retour aux membres",
  },
  en: {
    loading: "Loading...",
    nonAuthentifie: "User not authenticated",
    titre1: "Import ",
    titre2: "cell group members",
    subtitle: (
      <>
        Easily import your members via a CSV file.{" "}
        <span className="text-blue-300 font-semibold">Download the template</span>,
        fill it in and import it in a few clicks for a{" "}
        <span className="text-blue-300 font-semibold">fast and reliable import</span>.
      </>
    ),
    retour: "Back to members",
  },
};

export default function ImportCellulePage() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableCellule", "Superadmin"]}>
      <ImportCellulePageContent />
    </ProtectedRoute>
  );
}

function ImportCellulePageContent() {
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
        .select("id, eglise_id, role")
        .eq("id", authUser.id)
        .single();

      if (!profile) { setLoading(false); return; }

      const { data: cellule } = await supabase
        .from("cellules")
        .select("id")
        .eq("responsable_id", authUser.id)
        .limit(1)
        .single();

      setUser({
        id: authUser.id,
        eglise_id: profile.eglise_id,
        role: profile.role,
        cellule_id: cellule?.id || null,
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

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: "#333699" }}>
      <HeaderPages />

      <h1 className="text-2xl font-bold mt-4 mb-6 text-center">
        <span className="text-white">{t.titre1}</span>
        <span className="text-emerald-300">{t.titre2}</span>
      </h1>

      <div className="max-w-3xl w-full mb-6 text-center mx-auto">
        <p className="italic text-base text-white/90">{t.subtitle}</p>
      </div>

      <div className="flex justify-end max-w-6xl mx-auto mb-4">
        <button
          onClick={() => router.push("/membres-famille")}
          className="text-white font-semibold px-4 py-2 rounded shadow text-sm"
        >
          {t.retour}
        </button>
      </div>

      <div className="flex justify-center">
        <div className="w-full max-w-3xl">
          <ImportMembresCelluleCSV user={user} />
        </div>
      </div>

      <Footer />
    </div>
  );
}
