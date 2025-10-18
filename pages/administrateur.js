"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import LogoutLink from "../components/LogoutLink";
import SendLinkPopup from "../components/SendLinkPopup";
import { canAccessPage } from "../lib/accessControl";
import Link from "next/link";

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
      className="relative min-h-screen flex flex-col items-center justify-center p-6 text-center"
      style={{
        background: 'linear-gradient(135deg,                            
      }}
    >
      {                  }
      <div className="absolute top-4 right-4">
        <LogoutLink />
      </div>

      {          }
      <div className="mb-4">
        <Image src="/logo.png" alt="SoulTrack Logo" width={90} height={90} />
      </div>

      {           }
      <h1 className="text-4xl font-handwriting text-white mb-6">
        Espace Administrateur
      </h1>

      {             }
      <div className="flex flex-col gap-4 items-center justify-center w-full max-w-sm">
        {role === "Admin" && (
          <>
            <SendLinkPopup
              label="Voir / Copier liens…"
              type="voir_copier"
              buttonColor={'from-[#005AA7] to-[#FFFDE4]'}
            />
            <Link href="/admin/create-internal-user">
              <div className="bg-white p-4 rounded shadow-md hover:shadow-xl transition-shadow duration-300 flex items-center justify-center w-full max-w-sm">
                <span className="text-lg font-bold">
                  Créer un utilisateur interne
                </span>
                <span className="ml-2">👥</span>
              </div>
            </Link>
          </>
        )}
      </div>

      {/* Verset */}
      <div className="mt-10 text-center text-white text-lg font-handwriting-light max-w-2xl">
        Car le corps ne se compose pas d’un seul membre, mais de plusieurs.
        <br /> 1 Corinthiens 12:14 ❤️
      </div>
    </div>
  );
}
