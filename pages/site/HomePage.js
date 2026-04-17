"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import PublicHeader from "../../components/PublicHeader";
import Footer from "../../components/Footer";

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="bg-white text-gray-900">

      <PublicHeader />

      {/* HERO - STYLE JETON */}
      <section className="relative min-h-[90vh] flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 text-white overflow-hidden">

        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.2),transparent)]" />

        <div className="relative max-w-6xl mx-auto text-center px-6 space-y-8">

          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tight">
            Pilotez votre église avec une clarté totale
          </h1>

          <p className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto">
            SoulTrack transforme la gestion de votre église en un système structuré :
            membres, cellules, conseillers et croissance spirituelle en un seul endroit.
          </p>

          <div className="flex flex-col md:flex-row gap-4 justify-center pt-6">
            <button
              onClick={() => router.push("/SignupEglise")}
              className="bg-white text-blue-950 px-8 py-4 rounded-xl font-semibold hover:scale-105 transition"
            >
              Démarrer gratuitement
            </button>

            <button
              onClick={() => router.push("/comment-ca-marche")}
              className="border border-white/30 px-8 py-4 rounded-xl hover:bg-white/10 transition"
            >
              Voir comment ça marche
            </button>
          </div>

          {/* TRUST BAR */}
          <div className="pt-10 text-white/60 text-sm flex flex-wrap justify-center gap-8">
            <span>⛪ Églises structurées</span>
            <span>👥 Suivi des membres</span>
            <span>📊 Vision complète</span>
            <span>✝️ Croissance spirituelle</span>
          </div>

        </div>
      </section>

      {/* FEATURES GRID - PREMIUM */}
      <section className="py-28 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto text-center space-y-16">

          <div className="space-y-4">
            <h2 className="text-4xl font-bold">
              Tout ce dont votre église a besoin
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Une plateforme unique pour organiser, suivre et faire grandir votre église sans perte d’information.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">

            {[
              {
                title: "👥 Membres Hub",
                desc: "Suivi complet des membres : activité, présence, progression spirituelle et historique.",
              },
              {
                title: "🏠 Cellules Hub",
                desc: "Organisation des groupes de maison avec suivi des responsables et croissance.",
              },
              {
                title: "🧭 Conseillers Hub",
                desc: "Assignation intelligente des responsables pour un accompagnement réel.",
              },
              {
                title: "✝️ Évangélisation",
                desc: "Suivi des nouvelles âmes, décisions et baptêmes sans perte d’information.",
              },
              {
                title: "🔗 Structure Église",
                desc: "Organisation globale de votre église et de ses branches.",
              },
              {
                title: "📊 Rapports",
                desc: "Analyses et insights pour prendre de meilleures décisions.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition text-left border border-gray-100"
              >
                <h3 className="font-bold text-lg mb-3">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}

          </div>
        </div>
      </section>

      {/* STORY SECTION */}
      <section className="py-28 px-6 bg-white">
        <div className="max-w-6xl mx-auto space-y-24">

          <div className="lg:flex items-center gap-16">
            <div className="lg:w-1/2 space-y-4">
              <h3 className="text-3xl font-bold">Chaque âme devient visible</h3>
              <p className="text-gray-600">
                Ne perdez plus jamais un membre dans votre église.
                Suivez leur parcours spirituel avec précision et amour.
              </p>
            </div>
            <div className="lg:w-1/2">
              <div className="h-72 bg-gray-100 rounded-2xl flex items-center justify-center">
                Image Membres
              </div>
            </div>
          </div>

          <div className="lg:flex flex-row-reverse items-center gap-16">
            <div className="lg:w-1/2 space-y-4">
              <h3 className="text-3xl font-bold">Une structure claire et simple</h3>
              <p className="text-gray-600">
                Organisez vos cellules, responsables et départements sans confusion.
              </p>
            </div>
            <div className="lg:w-1/2">
              <div className="h-72 bg-gray-100 rounded-2xl flex items-center justify-center">
                Image Structure
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-28 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto space-y-12">

          <h2 className="text-3xl font-bold text-center">
            Ce que disent les responsables
          </h2>

          <div className="flex gap-6 overflow-x-auto pb-4">

            {[
              "Un outil indispensable pour notre église.",
              "On a enfin une vision claire de chaque membre.",
              "Simple, puissant et très structuré.",
              "Nos cellules sont enfin organisées.",
            ].map((t, i) => (
              <div key={i} className="min-w-[320px] bg-white p-6 rounded-2xl shadow">
                “{t}”
              </div>
            ))}

          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-28 px-6 text-center bg-blue-950 text-white">
        <h2 className="text-4xl font-bold mb-6">
          Commencez à structurer votre église aujourd’hui
        </h2>

        <button
          onClick={() => router.push("/SignupEglise")}
          className="bg-white text-blue-950 px-10 py-4 rounded-xl font-semibold hover:scale-105 transition"
        >
          Créer mon église
        </button>
      </section>

      <Footer />
    </div>
  );
}
