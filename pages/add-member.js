"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import LogoutLink from "../components/LogoutLink";
import SendLinkPopup from "../components/SendLinkPopup";
import AccessGuard from "../components/AccessGuard";

export default function AdministrateurPage() {
  const router = useRouter();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedRole = localStorage.getItem("userRole");

    if (!storedRole) {
      router.push("/login");
      return;
    }

    let parsedRoles = [];
    try {
      parsedRoles = JSON.parse(storedRole);
      if (!Array.isArray(parsedRoles)) parsedRoles = [parsedRoles];
    } catch {
      parsedRoles = [storedRole];
    }

    parsedRoles = parsedRoles.map(r => r.toLowerCase().trim());
    setRoles(parsedRoles);

    // 🔥 Autoriser "admin" et "administrateur"
    const isAdmin =
      parsedRoles.includes("admin") || parsedRoles.includes("administrateur");

    if (!isAdmin) {
      alert("⛔ Accès non autorisé !");
      router.push("/login");
      return;
    }

    setLoading(false);
  }, [router]);

  if (loading) return <div className="text-center mt-20">Chargement...</div>;

  // ✅ Correction : "admin" et "administrateur" sont équivalents
  const hasRole = role =>
    roles.includes(role.toLowerCase()) ||
    (role === "admin" && roles.includes("administrateur")) ||
    (role === "administrateur" && roles.includes("admin"));

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center p-6"
      style={{
        background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)",
      }}
    >
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

      <div className="mb-4">
        <Image src="/logo.png" alt="SoulTrack Logo" width={90} height={90} />
      </div>

      <h1 className="text-4xl font-handwriting text-white mb-6 text-center">
        Espace Administrateur
      </h1>

      {/* ✅ Ces boutons sont visibles si admin OU administrateur */}
      {(hasRole("admin") || hasRole("administrateur")) && (
        <div className="flex flex-col md:flex-row gap-6 justify-center w-full max-w-4xl mb-8">
          <Link
            href="/admin/create-responsable-cellule"
            className="flex-1 bg-white rounded-3xl shadow-md flex flex-col justify-center items-center border-t-4 border-[#34a853] p-6 hover:shadow-xl transition-all duration-200 cursor-pointer h-32"
          >
            <div className="text-5xl mb-2">👤</div>
            <div className="text-lg font-bold text-gray-800 text-center">
              Créer une Cellule
            </div>
          </Link>

          <Link
            href="/admin/create-internal-user"
            className="flex-1 bg-white rounded-3xl shadow-md flex flex-col justify-center items-center border-t-4 border-[#4285F4] p-6 hover:shadow-xl transition-all duration-200 cursor-pointer h-32"
          >
            <div className="text-5xl mb-2">🧑‍💻</div>
            <div className="text-lg font-bold text-gray-800 text-center">
              Créer un Responsable
            </div>
          </Link>
        </div>
      )}

      <div className="flex flex-col gap-4 items-center justify-center w-full max-w-sm">
        {(hasRole("admin") || hasRole("administrateur")) && (
          <SendLinkPopup
            label="Voir / Copier liens…"
            type="voir_copier"
            buttonColor="from-[#005AA7] to-[#FFFDE4]"
          />
        )}
      </div>

      <div className="mt-10 text-center text-white text-lg font-handwriting-light max-w-2xl">
        Car le corps ne se compose pas d’un seul membre, mais de plusieurs. <br />
        1 Corinthiens 12:14 ❤️
      </div>
    </div>
  );
}
