"use client";

import PublicHeader from "../components/PublicHeader";
import Footer from "../components/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <PublicHeader />

      {/* Hero Section */}
      <main className="flex-grow flex flex-col items-center justify-center text-center px-6 py-16">
        <h1 className="text-5xl font-bold mb-4">Bienvenue sur SoulTrack</h1>
        <p className="text-lg mb-6 text-gray-700 max-w-2xl">
          SoulTrack facilite la gestion des églises et cellules : suivez les présences, l’évangélisation,
          et gardez votre troupeau connecté selon les enseignements de la Parole.
        </p>

        <blockquote className="italic text-gray-600 mb-8 max-w-xl">
          "Car là où deux ou trois sont assemblés en mon nom, je suis au milieu d’eux."  
          <span className="block font-semibold mt-2">– Matthieu 18:20</span>
        </blockquote>

        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <button
            onClick={() => window.location.href = "/signup-eglise"}
            className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-2xl hover:bg-blue-600 transition"
          >
            Créer mon Église
          </button>

          <button
            onClick={() => window.location.href = "/login"}
            className="px-6 py-3 border border-blue-500 text-blue-500 font-semibold rounded-2xl hover:bg-blue-500 hover:text-white transition"
          >
            Déjà inscrit ? Connexion
          </button>
        </div>

        {/* Sections Avantages */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
          <div className="p-6 border rounded-2xl shadow hover:shadow-lg transition">
            <h3 className="text-xl font-bold mb-2">Gestion complète</h3>
            <p className="text-gray-700">
              Suivez les présences, les nouveaux membres, et l’évangélisation de chaque cellule en temps réel.
            </p>
          </div>

          <div className="p-6 border rounded-2xl shadow hover:shadow-lg transition">
            <h3 className="text-xl font-bold mb-2">Communication facilitée</h3>
            <p className="text-gray-700">
              Contactez les responsables, envoyez des rappels, ou communiquez avec votre troupeau facilement via SMS ou WhatsApp.
            </p>
          </div>

          <div className="p-6 border rounded-2xl shadow hover:shadow-lg transition">
            <h3 className="text-xl font-bold mb-2">Décisions éclairées</h3>
            <p className="text-gray-700">
              Obtenez des statistiques globales et par cellule pour prendre des décisions basées sur des données fiables.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
