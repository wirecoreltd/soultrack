"use client";

import { useRouter } from "next/navigation";
import Footer from "../components/Footer";
import Image from "next/image";

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Hero */}
      <div className="flex flex-col items-center justify-center text-center py-20 px-6">
        <Image src="/logo.png" alt="Logo SoulTrack" width={80} height={80} />
        <h1 className="text-5xl font-bold mt-6 mb-4">Bienvenue sur SoulTrack</h1>
        <p className="text-gray-700 mb-8 text-lg max-w-2xl">
          Gérez votre église, vos membres et vos cellules de manière simple, intuitive et moderne.
        </p>
        <button
          onClick={() => router.push("/signup-eglise")}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-2xl shadow-md transition"
        >
          Version Web / Commencer
        </button>
      </div>

      {/* Section Features */}
      <div className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-8">
        <div className="text-center p-6 border rounded-2xl shadow-sm">
          <h3 className="text-xl font-semibold mb-2">Gestion des Membres</h3>
          <p className="text-gray-700 text-sm">Suivi complet des membres et de leurs cellules.</p>
        </div>
        <div className="text-center p-6 border rounded-2xl shadow-sm">
          <h3 className="text-xl font-semibold mb-2">Rapports et Statistiques</h3>
          <p className="text-gray-700 text-sm">Analysez l’activité de votre église facilement.</p>
        </div>
        <div className="text-center p-6 border rounded-2xl shadow-sm">
          <h3 className="text-xl font-semibold mb-2">Communication Simplifiée</h3>
          <p className="text-gray-700 text-sm">Envoyez des messages et des invitations via WhatsApp ou email.</p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
