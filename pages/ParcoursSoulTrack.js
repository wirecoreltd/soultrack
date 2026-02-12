"use client";

import Image from "next/image";

export default function ParcoursSoulTrack() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Hero */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-amber-50">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-700 mb-6">
            Découvrez le parcours SoulTrack
          </h1>
          <p className="text-gray-700 text-lg md:text-xl">
            Suivez chaque membre, évangélisé et cellule de votre église avec simplicité et efficacité.
            <br />
            <span className="italic">« Prenez soin les uns des autres » (1 Pierre 5:2)</span>
          </p>
          <div className="mt-8">
            <button
              onClick={() => window.location.href = "/signup-eglise"}
              className="bg-gradient-to-r from-blue-500 to-amber-400 text-white font-bold py-3 px-6 rounded-2xl shadow-lg hover:scale-105 transition"
            >
              Commencer maintenant
            </button>
          </div>
        </div>
      </section>

      {/* Flowchart étapes */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-blue-700 mb-12">
            Comment ça fonctionne
          </h2>

          <div className="relative flex flex-col md:flex-row justify-between items-center gap-10">
            {/* Étape 1 */}
            <div className="flex flex-col items-center md:w-1/3">
              <div className="bg-gradient-to-r from-blue-400 to-blue-600 text-white p-6 rounded-full shadow-xl">
                <span className="text-4xl">👤</span>
              </div>
              <h3 className="mt-4 font-semibold text-xl text-gray-900">1. Ajout & Suivi</h3>
              <p className="mt-2 text-gray-600 text-sm md:text-base">
                Ajoutez un Membre ou un Évangélisé et assignez-le à un Conseiller ou Responsable de Cellule pour le suivi.
              </p>
            </div>

            {/* Flèche 1 → 2 */}
            <div className="hidden md:block absolute left-1/3 top-1/2 w-1/3 border-t-4 border-blue-300"></div>

            {/* Étape 2 */}
            <div className="flex flex-col items-center md:w-1/3">
              <div className="bg-gradient-to-r from-green-400 to-green-600 text-white p-6 rounded-full shadow-xl">
                <span className="text-4xl">📋</span>
              </div>
              <h3 className="mt-4 font-semibold text-xl text-gray-900">2. Liste & Détails</h3>
              <p className="mt-2 text-gray-600 text-sm md:text-base">
                Consultez tous les membres, leur carte individuelle, photo, et les informations clés pour un suivi précis.
              </p>
            </div>

            {/* Flèche 2 → 3 */}
            <div className="hidden md:block absolute left-2/3 top-1/2 w-1/3 border-t-4 border-green-300"></div>

            {/* Étape 3 */}
            <div className="flex flex-col items-center md:w-1/3">
              <div className="bg-gradient-to-r from-purple-400 to-purple-600 text-white p-6 rounded-full shadow-xl">
                <span className="text-4xl">📊</span>
              </div>
              <h3 className="mt-4 font-semibold text-xl text-gray-900">3. Suivi & Administration</h3>
              <p className="mt-2 text-gray-600 text-sm md:text-base">
                Suivi global des présences, formations, baptêmes et rapports. Les administrateurs gèrent les utilisateurs et rôles.
              </p>
            </div>
          </div>

          {/* Flèches mobile */}
          <div className="mt-10 md:hidden flex flex-col items-center gap-10">
            <div className="w-1/2 border-t-4 border-blue-300"></div>
            <div className="w-1/2 border-t-4 border-green-300"></div>
          </div>

          {/* Cascade des rapports */}
          <div className="mt-20">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Cascade des rapports entre Églises</h3>
            <div className="flex flex-col md:flex-row items-center justify-around gap-6">
              <div className="text-center">
                <div className="bg-amber-400 text-white p-4 rounded-lg text-xl font-bold">Église Mère</div>
                <p className="text-gray-600 text-sm mt-2">Supervision globale</p>
              </div>
              <div className="text-center">
                <div className="bg-blue-500 text-white p-4 rounded-lg text-xl font-bold">Église Superviseur</div>
                <p className="text-gray-600 text-sm mt-2">Coordonne les rapports</p>
              </div>
              <div className="text-center">
                <div className="bg-green-500 text-white p-4 rounded-lg text-xl font-bold">Église Supervisée</div>
                <p className="text-gray-600 text-sm mt-2">Fournit les données & suivis</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="max-w-6xl mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl font-bold text-blue-700 mb-6">Prêt à simplifier la gestion de votre église ?</h2>
        <button
          onClick={() => window.location.href = "/signup-eglise"}
          className="bg-gradient-to-r from-blue-500 to-amber-400 text-white font-bold py-3 px-8 rounded-2xl shadow-lg hover:scale-105 transition"
        >
          Commencer maintenant
        </button>
      </section>
    </div>
  );
}
