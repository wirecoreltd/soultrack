"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import PublicHeader from "../../components/PublicHeader";
import Footer from "../../components/Footer";
import TestimonialsSection from "../../components/TestimonialsSection";

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="bg-white text-gray-900">

      <PublicHeader />

      {/* HERO */}
      <section className="relative pt-28 pb-28 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.15),transparent)]" />

        <div className="relative max-w-5xl mx-auto text-center px-6 space-y-8">

          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
            Voir chaque âme. Comprendre chaque mouvement. Guider chaque vie.
          </h1>

          <p className="text-lg md:text-xl text-white/80 leading-relaxed">
            SoulTrack est un système complet de pilotage pastoral qui connecte votre église :
            membres, cellules, conseillers, évangélisation, baptêmes et structure globale.
          </p>

          <p className="text-white/70 italic">
            Une église ne se gère pas. Elle se veille.
          </p>

          <div className="flex flex-col md:flex-row gap-4 justify-center pt-4">
            <button
              onClick={() => router.push("/SignupEglise")}
              className="bg-white text-blue-900 px-8 py-3 rounded-xl font-semibold hover:scale-105 transition"
            >
              Créer mon église
            </button>

            <button
              onClick={() => router.push("/comment-ca-marche")}
              className="border border-white/30 px-8 py-3 rounded-xl hover:bg-white/10 transition"
            >
              Comprendre le système
            </button>
          </div>

        </div>
      </section>

      {/* GLOBAL VISION - CARDS AMÉLIORÉES */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto text-center space-y-12">

          <h2 className="text-3xl font-bold">
            Une vision complète du troupeau, en un seul endroit
          </h2>

          <p className="text-gray-600 max-w-3xl mx-auto">
            SoulTrack transforme votre gestion pastorale en un système structuré, clair et actionnable.
          </p>

          <div className="grid md:grid-cols-3 gap-10">

            <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition text-left">
              <h3 className="font-bold text-lg mb-2">👥 Membres Hub</h3>
              <p className="text-sm text-gray-600">
                Suivi complet de chaque membre : activité, présence, croissance spirituelle, historique, alertes et accompagnement personnalisé.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition text-left">
              <h3 className="font-bold text-lg mb-2">🏠 Cellules Hub</h3>
              <p className="text-sm text-gray-600">
                Organisation des groupes de maison avec suivi des responsables, des réunions et de la croissance communautaire.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition text-left">
              <h3 className="font-bold text-lg mb-2">🧭 Conseillers Hub</h3>
              <p className="text-sm text-gray-600">
                Attribution intelligente des responsables avec suivi des visites, accompagnement et impact spirituel.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition text-left">
              <h3 className="font-bold text-lg mb-2">✝️ Évangélisation Hub</h3>
              <p className="text-sm text-gray-600">
                Suivi des nouvelles âmes, décisions, baptêmes et parcours spirituel sans perte d’information.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition text-left">
              <h3 className="font-bold text-lg mb-2">🔗 Église Hub</h3>
              <p className="text-sm text-gray-600">
                Vision globale de l’église : structure, départements, branches et organisation hiérarchique.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition text-left">
              <h3 className="font-bold text-lg mb-2">📊 Rapports Hub</h3>
              <p className="text-sm text-gray-600">
                Analyse complète pour prendre des décisions stratégiques basées sur des données réelles.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* TESTIMONIALS - SCROLL HORIZONTAL */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto space-y-10">

          <h2 className="text-3xl font-bold text-center">
            Témoignages
          </h2>

          <div className="flex gap-6 overflow-x-auto pb-4 scroll-smooth">

            <div className="min-w-[300px] bg-gray-50 p-6 rounded-2xl shadow">
              “Un outil incroyable pour structurer notre église.”
            </div>

            <div className="min-w-[300px] bg-gray-50 p-6 rounded-2xl shadow">
              “On ne perd plus aucune âme dans le suivi.”
            </div>

            <div className="min-w-[300px] bg-gray-50 p-6 rounded-2xl shadow">
              “Tout est clair, simple et puissant.”
            </div>

            <div className="min-w-[300px] bg-gray-50 p-6 rounded-2xl shadow">
              “Nos cellules ont enfin une vraie structure.”
            </div>

          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center bg-blue-900 text-white">
        <h2 className="text-3xl font-bold mb-6">
          Commencez à voir votre église autrement
        </h2>

        <button
          onClick={() => router.push("/SignupEglise")}
          className="bg-white text-blue-900 px-10 py-4 rounded-xl font-semibold hover:scale-105 transition"
        >
          Démarrer SoulTrack
        </button>
      </section>

      <Footer />
    </div>
  );
}
