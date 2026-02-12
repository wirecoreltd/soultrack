"use client";

import PublicHeader from "../components/PublicHeader";
import Footer from "../components/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <PublicHeader />

      {/* ========== Hero Section ========== */}
      <main className="flex-grow">
        <section className="pt-20 pb-16 text-center px-6">
          <h1 className="text-5xl font-bold mb-4">SoulTrack</h1>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto mb-6">
            La solution ultime pour gérer votre église et vos cellules.
            Simplifiez le suivi des membres, les présences, l’évangélisation
            et les communications — tout en mettant Dieu au centre.
          </p>

          {/* Verset biblique inspirant */}
          <blockquote className="italic text-gray-600 max-w-2xl mx-auto mb-8">
            "Car là où deux ou trois sont assemblés en mon nom, je suis au milieu d’eux."
            <span className="block font-semibold mt-2 text-gray-800">— Matthieu 18:20</span>
          </blockquote>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => (window.location.href = "/signup-eglise")}
              className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-2xl hover:bg-blue-600 transition"
            >
              Commencer gratuitement
            </button>
            <button
              onClick={() => (window.location.href = "/login")}
              className="px-6 py-3 border border-blue-500 text-blue-500 font-semibold rounded-2xl hover:bg-blue-500 hover:text-white transition"
            >
              Déjà inscrit ? Connexion
            </button>
          </div>
        </section>

        {/* ========== Features Section ========== */}
        <section className="bg-gray-50 py-16 px-6">
          <h2 className="text-3xl font-bold text-center mb-10">
            Ce que SoulTrack vous apporte
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Feature card 1 */}
            <div className="p-6 bg-white border rounded-2xl shadow-sm hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-2">Gestion des membres</h3>
              <p className="text-gray-700">
                Suivez l’évolution de chaque membre, sa cellule, son statut et
                ses interactions au sein de l’église.
              </p>
            </div>

            {/* Feature card 2 */}
            <div className="p-6 bg-white border rounded-2xl shadow-sm hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-2">Suivi des cellules</h3>
              <p className="text-gray-700">
                Gère facilement les cellules, leurs responsables, présences et
                évènements.
              </p>
            </div>

            {/* Feature card 3 */}
            <div className="p-6 bg-white border rounded-2xl shadow-sm hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-2">Statistiques intelligentes</h3>
              <p className="text-gray-700">
                Obtenez des vues claires et des rapports sur les présences,
                l’évangélisation et la croissance spirituelle.
              </p>
            </div>
          </div>
        </section>

        {/* ========== Why Choose Us Section ========== */}
        <section className="py-16 px-6">
          <h2 className="text-3xl font-bold text-center mb-10">
            Pourquoi choisir SoulTrack ?
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-6xl mx-auto">
            <div>
              <p className="text-gray-700 mb-6">
                SoulTrack est pensé spécialement pour les églises qui désirent
                porter une attention particulière à chaque âme et à chaque
                cellule. Avec des outils puissants mais simples à utiliser,
                vous gagnez du temps pour ce qui compte réellement : votre
                ministère.
              </p>
              <p className="text-gray-700">
                Notre plateforme offre des fonctions complètes de gestion, de
                communication et de statistiques, tout en étant accessible à
                toutes les tailles d’église.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="p-4 border rounded-xl shadow-sm">
                <h4 className="font-semibold text-lg">Accessible partout</h4>
                <p className="text-gray-700 text-sm">
                  Utilisez SoulTrack sur web et appareils mobiles sans installation.
                </p>
              </div>
              <div className="p-4 border rounded-xl shadow-sm">
                <h4 className="font-semibold text-lg">Support inclus</h4>
                <p className="text-gray-700 text-sm">
                  Assistance et documentation pour vous aider à avancer.
                </p>
              </div>
              <div className="p-4 border rounded-xl shadow-sm">
                <h4 className="font-semibold text-lg">Évolutivité</h4>
                <p className="text-gray-700 text-sm">
                  Convient aux petites et grandes églises, avec croissance sans
                  limite.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
