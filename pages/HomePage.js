"use client";

import PublicHeader from "../components/PublicHeader";
import Footer from "../components/Footer";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <PublicHeader />

      <main className="flex-grow flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-5xl font-bold mb-4">Bienvenue sur SoulTrack</h1>
        <p className="text-lg mb-6 text-gray-700 max-w-xl">
          La plateforme de gestion d’églises et cellules qui simplifie vos suivis,
          statistiques et communications.
        </p>

        <button
          onClick={() => router.push("/signup-eglise")}
          className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-2xl hover:bg-blue-600 transition mb-4"
        >
          Essayer la version web
        </button>

        <button
          onClick={() => router.push("/login")}
          className="px-6 py-3 border border-blue-500 text-blue-500 font-semibold rounded-2xl hover:bg-blue-500 hover:text-white transition"
        >
          Déjà inscrit ? Connexion
        </button>
      </main>

      <Footer />
    </div>
  );
}
