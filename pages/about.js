"use client";

import PublicHeader from "../components/PublicHeader";
import Footer from "../components/Footer";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <PublicHeader />

      <main className="flex-grow max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold mb-6 text-center">À propos de SoulTrack</h1>
        <p className="text-gray-700 text-lg mb-4">
          SoulTrack est une plateforme conçue pour aider les églises et cellules
          à gérer leurs membres, suivre les présences, les évangélisations,
          et améliorer la communication entre responsables.
        </p>
        <p className="text-gray-700 text-lg mb-4">
          Notre mission est de simplifier la gestion communautaire et de fournir
          des statistiques fiables pour prendre des décisions éclairées.
        </p>
      </main>

      <Footer />
    </div>
  );
}
