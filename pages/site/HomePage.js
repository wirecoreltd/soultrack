"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import PublicHeader from "../../components/PublicHeader";
import Footer from "../../components/Footer";
import TestimonialsSection from "../../components/TestimonialsSection";

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="relative text-gray-900">

      {/* TOP BRAND BAND */}
      <div className="h-6 bg-[#333699]" />

      {/* TOP GRADIENT TRANSITION */}
      <div className="h-24 bg-gradient-to-b from-[#333699] to-white" />

      <PublicHeader />

      {/* HERO */}
      <section className="relative pt-28 pb-28 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.15),transparent)]" />

        <div className="relative max-w-5xl mx-auto text-center px-6 space-y-8">
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
            Voir chaque âme. Comprendre chaque mouvement. Guider chaque vie.
          </h1>

          <p className="text-lg md:text-xl text-white/80 leading-relaxed">
            SoulTrack est un système complet de pilotage pastoral...
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

      {/* GLOBAL VISION */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto text-center space-y-12">

          <h2 className="text-3xl font-bold">
            Une vision complète du troupeau, en un seul endroit
          </h2>

          <p className="text-gray-600 max-w-3xl mx-auto">
            SoulTrack relie toutes les dimensions de votre ministère pour transformer des données dispersées
            en une vision claire et actionnable.
          </p>

          <div className="grid md:grid-cols-3 gap-8">

            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <h3 className="font-semibold">👥 Membres Hub</h3>
              <p className="text-sm text-gray-600 mt-2">
                Une vue centralisée de chaque membre pour suivre son parcours, son engagement et son évolution. 
              Toutes les informations essentielles sont regroupées pour garder une vision claire du troupeau et agir au bon moment.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <h3 className="font-semibold">🏠 Cellules Hub</h3>
              <p className="text-sm text-gray-600 mt-2">
                Organise les groupes, les responsables et les présences hebdomadaires. Donne une vision vivante de la 
              dynamique des cellules et aide à maintenir la connexion et la croissance.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <h3 className="font-semibold">🧭 Conseillers Hub</h3>
              <p className="text-sm text-gray-600 mt-2">
                Offre un suivi personnalisé par responsable. Chaque conseiller peut accompagner, noter, discerner les 
                besoins et intervenir de manière ciblée sur les membres qui lui sont confiés.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <h3 className="font-semibold">✝️ Évangélisation Hub</h3>
              <p className="text-sm text-gray-600 mt-2">
                Regroupe les nouvelles âmes, les décisions, les suivis et les baptêmes. Permet de ne laisser 
              aucun contact sans accompagnement et d’assurer une progression spirituelle structurée.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <h3 className="font-semibold">⚙️ Admin Hub</h3>
              <p className="text-sm text-gray-600 mt-2">
                Analyse toutes les données du ministère pour en ressortir des indicateurs clairs. Aide à 
                prendre des décisions stratégiques basées sur des faits concrets et mesurables.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <h3 className="font-semibold">📊 Rapports Hub</h3>
              <p className="text-sm text-gray-600 mt-2">
                Analyse toutes les données du ministère pour en ressortir des indicateurs clairs. Aide à 
                prendre des décisions stratégiques basées sur des faits concrets et mesurables.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* MODULE DETAIL (plus profond = envie d’utiliser) */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto space-y-20">

          <div className="lg:flex lg:items-center lg:gap-14">
            <div className="lg:w-1/2 space-y-4">
              <h3 className="text-3xl font-bold">👥 Chaque âme compte</h3>
              <p className="text-gray-600">
                Vous voyez qui est actif, absent, en croissance ou en danger spirituel.
                Plus aucun membre n’est invisible.
              </p>
            </div>
            <div className="lg:w-1/2">
              <Image src="/membres-hub.png" width={600} height={400} alt="membres" className="rounded-2xl shadow-lg"/>
            </div>
          </div>

          <div className="lg:flex lg:flex-row-reverse lg:items-center lg:gap-14">
            <div className="lg:w-1/2 space-y-4">
              <h3 className="text-3xl font-bold">🏠 Une église structurée</h3>
              <p className="text-gray-600">
                Les cellules permettent un suivi proche et humain, avec des responsables identifiés.
              </p>
            </div>
            <div className="lg:w-1/2">
              <div className="bg-gray-100 rounded-2xl h-64 flex items-center justify-center">
                Interface Cellules
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* TESTIMONIALS COMPONENT */}
      <TestimonialsSection />

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
            <div className="h-24 bg-gradient-to-t from-[#333699] to-white" />

      {/* BOTTOM BRAND BAND */}
      <div className="h-6 bg-[#333699]" />
    </div>
    </div>
   </div>
  
  );
}
