//pages/administrateur.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import LogoutLink from "../components/LogoutLink";
import SendLinkPopup from "../components/SendLinkPopup";
import { canAccessPage } from "../lib/accessControl";

export default function AdministrateurPage() {
  const router = useRouter();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedRole = localStorage.getItem("userRole");
    if (!storedRole) {
      router.push("/login");
      return;
    }

    // Vérifie les droits d’accès
    const canAccess = canAccessPage(storedRole, "/administrateur");
    if (!canAccess) {
      alert("⛔ Accès non autorisé !");
      router.push("/login");
      return;
    }

    setRole(storedRole);
    setLoading(false);
  }, [router]);

  if (loading) return <div className="text-center mt-20">Chargement...</div>;

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center p-6"
      style={{
        background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)",
      }}
    >
      {/* 🔹 Boutons de navigation */}
      <div className="absolute top-4 left-4">
        <button
          onClick={() => router.back()}
          className="text-white font-semibold hover:text-gray-200 transition"
        >
          ← Retour
        </button>
      </div>

      <div className="absolute top-4 right-4">
        <LogoutLink />
      </div>

      {/* 🔹 Logo */}
      <div className="mb-4">
        <Image src="/logo.png" alt="SoulTrack Logo" width={90} height={90} />
      </div>

      {/* 🔹 Titre */}
      <h1 className="text-4xl font-handwriting text-white mb-6 text-center">
        Espace Administrateur
      </h1>

      {/* 🔹 Cartes principales */}
      <div className="flex flex-col md:flex-row gap-6 justify-center w-full max-w-4xl mb-8">
        {/* ✅ Carte : Créer un responsable de cellule */}
        <Link
          href="/admin/create-responsable-cellule"
          className="flex-1 bg-white rounded-3xl shadow-md flex flex-col justify-center items-center border-t-4 border-[#34a853] p-6 hover:shadow-xl transition-all duration-200 cursor-pointer h-32"
        >
          <div className="text-5xl mb-2">👤</div>
          <div className="text-lg font-bold text-gray-800 text-center">
            Créer une Cellule
          </div>
        </Link>

        {/* ✅ Carte : Créer un utilisateur interne */}
        <Link
          href="/admin/create-internal-user"
          className="flex-1 bg-white rounded-3xl shadow-md flex flex-col justify-center items-center border-t-4 border-[#4285F4] p-6 hover:shadow-xl transition-all duration-200 cursor-pointer h-32"
        >
          <div className="text-5xl mb-2">🧑‍💻</div>
          <div className="text-lg font-bold text-gray-800 text-center">
            Créer Un Responsable
          </div>
        </Link>
      </div>

      {/* 🔹 Bouton administrateur supplémentaire */}
      <div className="flex flex-col gap-4 items-center justify-center w-full max-w-sm">
        {role === "Admin" && (
          <SendLinkPopup
            label="Voir / Copier liens…"
            type="voir_copier"
            buttonColor="from-[#005AA7] to-[#FFFDE4]"
          />
        )}
      </div>

      {/* 🔹 Verset */}
      <div className="mt-10 text-center text-white text-lg font-handwriting-light max-w-2xl">
        Car le corps ne se compose pas d’un seul membre, mais de plusieurs. <br />
        1 Corinthiens 12:14 ❤️
      </div>
    </div>
  );
}
