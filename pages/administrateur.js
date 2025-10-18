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
      className="min-h-screen flex flex-col items-center p-6"
      style={{
        background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)",
      }}
    >
      {/* 🔹 Top bar: Retour + logo + Déconnexion */}
      <div className="w-full max-w-5xl flex justify-between items-center mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center text-white font-semibold hover:text-gray-200 transition-colors"
        >
          ← Retour
        </button>

        <div className="flex items-center gap-4">
          <Image src="/logo.png" alt="SoulTrack Logo" width={50} height={50} />
          <LogoutLink className="bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition" />
        </div>
      </div>

      {/* 🔹 Titre */}
      <h1 className="text-3xl font-login text-white mb-6 text-center">
        Espace Administrateur
      </h1>

      {/* 🔹 Cartes principales */}
      <div className="flex flex-col md:flex-row gap-6 justify-center w-full max-w-5xl mb-6">
        {/* Carte pour créer un utilisateur */}
        <Link
          href="/admin/create-internal-user"
          className="flex-1 bg-white rounded-3xl shadow-md flex flex-col justify-center items-center border-t-4 border-[#4285F4] p-6 hover:shadow-xl transition-all duration-200 cursor-pointer h-32"
        >
          <div className="text-5xl mb-2">🧑‍💻</div>
          <div className="text-lg font-bold text-gray-800 text-center">
            Créer un utilisateur
          </div>
        </Link>
      </div>

      {/* 🔹 Bouton administrateur */}
      <div className="flex flex-col gap-4 items-center justify-center w-full max-w-sm mb-10">
        {role === "Admin" && (
          <SendLinkPopup
            label="Voir / Copier liens…"
            type="voir_copier"
            buttonColor="from-[#005AA7] to-[#FFFDE4]"
          />
        )}
      </div>

      {/* 🔹 Verset */}
      <div className="mt-auto mb-4 text-center text-white text-lg font-handwriting-light max-w-2xl">
        Car le corps ne se compose pas d’un seul membre, mais de plusieurs. <br />
        1 Corinthiens 12:14 ❤️
      </div>
    </div>
  );
}
