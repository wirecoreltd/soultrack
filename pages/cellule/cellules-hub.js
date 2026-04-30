"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import SendLinkPopup from "../../components/SendLinkPopup";
import LogoutLink from "../../components/LogoutLink";
import { useEffect, useState } from "react";
import supabase from "../../lib/supabaseClient";
import HeaderPages from "../../components/HeaderPages";
import ProtectedRoute from "../../components/ProtectedRoute";
import Footer from "../../components/Footer";

export default function CellulesHub() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableCellule", "SuperviseurCellule"]}>
      <CellulesHubContent />
    </ProtectedRoute>
  );
}

function CellulesHubContent() {
  const router = useRouter();
  const [prenom, setPrenom] = useState("cher membre");

  const [role, setRole] = useState(null);
  const [loadingRole, setLoadingRole] = useState(true);

  useEffect(() => {
    const fetchPrenom = async () => {
      try {
        const userEmail = localStorage.getItem("userEmail");
        if (!userEmail) return;

        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("prenom")
          .eq("email", userEmail)
          .single();

        if (error) throw error;
        setPrenom(profileData?.prenom || "cher membre");
      } catch (err) {
        console.error("Erreur récupération prénom :", err);
        setPrenom("cher membre");
      }
    };

    fetchPrenom();
  }, []);

  useEffect(() => {
    const fetchRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      setRole(data?.role);
      setLoadingRole(false);
    };

    fetchRole();
  }, []);

  const canCreateCellule =
    role === "Administrateur" || role === "SuperviseurCellule" || role === "Superadmin";

  return (
    <div
      className="min-h-screen flex flex-col items-center p-6"
      style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}
    >
      <HeaderPages />

      {/* 🔹 Titre */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mt-4 mb-6 text-blue-300 text-center text-white">
          Espace Cellule
        </h1>

        <div className="max-w-3xl w-full mb-6 text-center">
          <p className="italic text-base text-white/90">
            Chaque cellule est un <span className="text-blue-300 font-semibold">espace</span> où les âmes grandissent, sont{" "}
            <span className="text-blue-300 font-semibold">accompagnées et encouragées dans leur cheminement</span>. Ensemble,
            unissons nos forces et faisons fructifier chaque vie.
          </p>
        </div>
      </div>

      {/* Liste des cellules */}
      <div className="flex flex-col md:flex-row gap-6 justify-center w-full max-w-5xl mb-6 flex-wrap">

        <Link href="/cellule/list-cellules" className="card">
          <div className="text-5xl mb-2">🏠</div>
          <div className="text-lg font-bold text-gray-800 text-center">
            Liste des Cellules
          </div>
        </Link>

        <Link href="/cellule/ajouter-membre-cellule" className="card">
          <div className="text-5xl mb-2">➕</div>
          <div className="text-lg font-bold text-gray-800 text-center">
            Ajouter un membre
          </div>
        </Link>

        <Link href="/cellule/membres-cellule" className="card">
          <div className="text-5xl mb-2">👥</div>
          <div className="text-lg font-bold text-gray-800 text-center">
            Membres de la Cellule
          </div>
        </Link>

        <Link href="/evangelisation/suivis-evangelisation" className="card">
          <div className="text-5xl mb-2">💗</div>
          <div className="text-lg font-bold text-gray-800 text-center">
            Suivis évangélisés
          </div>
        </Link>

        <Link href="/membres/suivis-membres" className="card">
          <div className="text-5xl mb-2">💌</div>
          <div className="text-lg font-bold text-gray-800 text-center">
            Suivis membres
          </div>
        </Link>

        <Link href="/cellule/attendance_cellule" className="card">
          <div className="text-5xl mb-2">👨‍👩‍👦‍👦</div>
          <div className="text-lg font-bold text-gray-800 text-center">
            Présences & stats
          </div>
        </Link>

        <Link href="/cellule/EtatCellulePage" className="card">
          <div className="text-5xl mb-2">🌱</div>
          <div className="text-lg font-bold text-gray-800 text-center">
            Etat Cellule
          </div>
        </Link>

        <Link href="/admin/import" className="card orange">
          <div className="text-4xl mb-1">📤</div>
          <div className="text-lg font-bold text-gray-800 text-center">
            Import membres
          </div>
        </Link>

        {/* ✅ BOUTON CORRIGÉ */}
        {!loadingRole && canCreateCellule && (
          <Link href="/admin/create-cellule" className="card orange">
            <div className="text-4xl mb-1">🛠️</div>
            <div className="text-lg font-bold text-gray-800 text-center">
              Créer une Cellule
            </div>
          </Link>
        )}

      </div>

      {/* SendLink */}
      <div className="w-full max-w-md mb-3">
        <SendLinkPopup
          label="Envoyer formulaire Cellule – Nouveau membre"
          type="ajouter_membre_cellule"
          buttonColor="from-[#f7971e] to-[#ffd200]"
        />
      </div>

      <div className="w-full max-w-md mb-6">
        <SendLinkPopup
          label="Envoyer formulaire Cellule – Évangélisation"
          type="ajouter_evangelise_cellule"
          buttonColor="from-[#11998e] to-[#38ef7d]"
        />
      </div>

      <Footer />
    </div>
  );
}
