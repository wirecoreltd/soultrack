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
        background: 'linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)',
      }}
    >
      {/* Déconnexion */}
      <div className="absolute top-4 right-4">
        <LogoutLink />
      </div>

      {/* Logo */}
      <div className="mb-4">
        <Image src="/logo.png" alt="SoulTrack Logo" width={90} height={90} />
      </div>

      {/* Titre */}
      <h1 className="text-4xl font-handwriting text-white mb-6">
        Espace Administrateur
      </h1>

      {/* Boutons */}
      <div className="flex flex-col gap-4 items-center justify-center w-full max-w-sm">
        {role === "Admin" && (
          <>
            <SendLinkPopup
              label="Voir / Copier liens…"
              type="voir_copier"
              buttonColor="from
