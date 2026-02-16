"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import PublicHeader from "../components/PublicHeader";
import Footer from "../components/Footer";

export default function HomePage() {
  const router = useRouter();

  const testimonials = [
    {
      name: "Past. Jean",
      church: "Église Bethel",
      message:
        "SoulTrack a transformé la gestion de nos cellules et membres.",
      avatar: "/avatar1.png",
    },
    {
      name: "Past. Marie",
      church: "Église Grâce",
      message:
        "Un outil clair et puissant pour suivre notre croissance spirituelle.",
      avatar: "/avatar2.png",
    },
    {
      name: "Past. Samuel",
      church: "Église Lumière",
      message:
        "Les statistiques nous aident à prendre de meilleures décisions.",
      avatar: "/avatar3.png",
    },
  ];

  return (
    <div className="bg-white text-gray-900">
      <PublicHeader />

      {/* HERO */}
      <section className="pt-20 pb-24 bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-6 lg:flex lg:items-center lg:justify-between gap-12">
          <div className="lg:w-1/2">
            <span className="bg-white/20 px-4 py-1 rounded-full text-sm backdrop-blur">
              🚀 Plateforme moderne pour églises
            </span>

            <h1 className="text-4xl lg:text-5xl font-extrabold mt-6 mb-5 leading-tight">
              Centralisez et développez votre église intelligemment
            </h1>

            <p className="text-base lg:text-lg text-white/90 mb-8">
              Gérez membres, cellules, évangélisation, présences et statistiques
              depuis une seule plateforme simple et puissante.
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => router.push("/SignupEglise")}
                className="bg-white text-blue-700 font-semibold px-6 py-3 rounded-xl shadow-lg hover:scale-105 transition"
              >
                🚀 Essai gratuit
              </button>

              <button
                onClick={() => router.push("/login")}
                className="border border-white px-6 py-3 rounded-xl hover:bg-white hover:text-blue-700 transition"
              >
                Connexion
              </button>
            </div>

            <div className="mt-6 text-sm text-white/80">
              ✔ Installation rapide &nbsp; ✔ Support inclus &nbsp; ✔ Sécurisé
            </div>
          </div>

          <div className="lg:w-1/2 mt-10 lg:mt-0">
            <Image
              src="/Dashboard.png"
              alt="Dashboard SoulTrack"
              width={700}
              height={450}
              className="rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.35)] border border-white/20"
            />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-16 px-6 bg-blue-50">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-10">
            Une solution complète pour votre ministère
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "👥",
                title: "Gestion des membres",
                desc: "Fiches détaillées, suivi spirituel, statut et historique complet.",
              },
              {
                icon: "🏠",
                title: "Organisation des cellules",
                desc: "Responsables, présences et rapports centralisés.",
              },
              {
                icon: "📊",
                title: "Statistiques intelligentes",
                desc: "Analysez la croissance et prenez de meilleures décisions.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition border border-blue-100"
              >
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SHOWCASE */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto space-y-20">

          {[
            {
              title: "👥 Membres Hub",
              desc: "Vue claire de tous vos membres avec statut, cellule et évolution.",
              img: "/Espace Membre.png",
            },
            {
              title: "✝️ Évangélisation Hub",
              desc: "Suivi des nouvelles âmes, conversions et baptêmes.",
              img: "/Espace Evangelisation.png",
            },
            {
              title: "🏠 Cellules Hub",
              desc: "Organisation des responsables et analyse de croissance.",
              img: "/Espace Cellule.png",
            },
            {
              title: "📋 Fiche détaillée",
              desc: "Historique complet d’un membre : présence, cellule et suivi.",
              img: "/Details Membre.png",
            },
          ].map((item, i) => (
            <div
              key={i}
              className={`lg:flex lg:items-center lg:gap-14 ${
                i % 2 !== 0 ? "lg:flex-row-reverse" : ""
              }`}
            >
              <div className="lg:w-1/2">
                <h3 className="text-2xl font-bold mb-4 text-blue-700">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>

              <div className="lg:w-1/2 mt-6 lg:mt-0">
                <Image
                  src={item.img}
                  alt={item.title}
                  width={500}
                  height={300}
                  className="rounded-xl shadow-lg border border-blue-100"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-16 px-6 bg-indigo-50">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-10">
            Ils font confiance à SoulTrack
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-xl shadow-md border border-indigo-100"
              >
                <Image
                  src={t.avatar}
                  alt={t.name}
                  width={50}
                  height={50}
                  className="rounded-full mx-auto mb-3"
                />
                <p className="italic text-gray-600 text-sm mb-3">
                  "{t.message}"
                </p>
                <h4 className="font-semibold text-sm">{t.name}</h4>
                <p className="text-xs text-gray-500">{t.church}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-center">
        <h2 className="text-2xl lg:text-3xl font-bold mb-6">
          Prêt à digitaliser votre église ?
        </h2>
        <button
          onClick={() => router.push("/SignupEglise")}
          className="bg-white text-blue-700 px-8 py-4 rounded-xl font-semibold shadow-lg hover:scale-105 transition"
        >
          🚀 Créer mon compte maintenant
        </button>
      </section>

      <Footer />
    </div>
  );
}
