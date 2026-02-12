"use client";

import Footer from "../components/Footer";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="max-w-5xl mx-auto px-6 py-20 text-center">
        <h1 className="text-4xl font-bold mb-6">À propos de SoulTrack</h1>
        <p className="text-gray-700 text-lg mb-4">
          SoulTrack est une plateforme moderne pour gérer efficacement les églises et leurs membres.
        </p>
        <p className="text-gray-700 text-lg mb-4">
          Notre objectif est de simplifier la gestion des cellules, le suivi des nouveaux venus et les rapports statistiques.
        </p>
        <p className="text-gray-700 text-lg">
          Avec SoulTrack, vous pouvez consacrer plus de temps au ministère et moins à la paperasse.
        </p>
      </div>

      <Footer />
    </div>
  );
}
