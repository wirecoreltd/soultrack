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
      <section className="pt-24 pb-32 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-6 lg:flex lg:items-center lg:justify-between">
          <div className="lg:w-1/2">
            <span className="bg-white/20 px-4 py-1 rounded-full text-sm">
              🚀 Plateforme moderne pour églises
            </span>

            <h1 className="text-5xl font-extrabold mt-6 mb-6 leading-tight">
              Centralisez toute la gestion de votre église
            </h1>

            <p className="text-lg text-white/90 mb-8">
              Membres, cellules, évangélisation, présences et statistiques.
              Une solution simple, claire et puissante.
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => router.push("/SignupEglise")}
                className="bg-white text-blue-700 font-semibold px-6 py-3 rounded-xl hover:bg-gray-100 transition"
              >
                🚀 Commencer gratuitement
              </button>

              <button
                onClick={() => router.push("/login")}
                className="border border-white px-6 py-3 rounded-xl hover:bg-white hover:text-blue-700 transition"
              >
                Connexion
              </button>
            </div>
          </div>

          <div className="lg:w-1/2 mt-12 lg:mt-0">
            <Image
              src="/hero-illustration.png"
              alt="Dashboard SoulTrack"
              width={700}
              height={450}
              className="rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.3)]"
            />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">
            Une solution complète pour votre ministère
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-xl font-semibold mb-3">
                Gestion des membres
              </h3>
              <p className="text-gray-600">
                Suivi complet du parcours spirituel et administratif.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition">
              <div className="text-4xl mb-4">🏠</div>
              <h3 className="text-xl font-semibold mb-3">
                Organisation des cellules
              </h3>
              <p className="text-gray-600">
                Responsables, présences et rapports centralisés.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-3">
                Statistiques intelligentes
              </h3>
              <p className="text-gray-600">
                Visualisez la croissance et prenez de meilleures décisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCT SHOWCASE */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto space-y-32">

          {/* Membres Hub */}
          <div className="lg:flex lg:items-center lg:gap-16">
            <div className="lg:w-1/2">
              <h3 className="text-3xl font-bold mb-6">👥 Membres Hub</h3>
              <p className="text-gray-600 mb-6">
                Une vue claire de tous vos membres, leur statut, cellule
                et évolution spirituelle.
              </p>
            </div>
            <div className="lg:w-1/2">
              <Image
                src="/Espace Membre.png"
                alt="Membres Hub"
                width={500}
                height={200}
                className="rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] border"
              />
            </div>
          </div>

          {/* Evangélisation Hub */}
          <div className="lg:flex lg:flex-row-reverse lg:items-center lg:gap-16">
            <div className="lg:w-1/2">
              <h3 className="text-3xl font-bold mb-6">✝️ Évangélisation Hub</h3>
              <p className="text-gray-600 mb-6">
                Suivez conversions, baptêmes et nouvelles âmes facilement.
              </p>
            </div>
            <div className="lg:w-1/2">
              <Image
                src="/Espace Evangelisation"
                alt="Evangélisation Hub"
                width={500}
                height={200}
                className="rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] border"
              />
            </div>
          </div>

          {/* Cellules Hub */}
          <div className="lg:flex lg:items-center lg:gap-16">
            <div className="lg:w-1/2">
              <h3 className="text-3xl font-bold mb-6">🏠 Cellules Hub</h3>
              <p className="text-gray-600 mb-6">
                Organisez vos responsables, suivez les présences
                et analysez la croissance.
              </p>
            </div>
            <div className="lg:w-1/2">
              <Image
                src="/Espace Cellule"
                alt="Cellules Hub"
                width={500}
                height={200}
                className="rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] border"
              />
            </div>
          </div>

          {/* Fiche Contact */}
          <div className="lg:flex lg:flex-row-reverse lg:items-center lg:gap-16">
            <div className="lg:w-1/2">
              <h3 className="text-3xl font-bold mb-6">
                📋 Fiche détaillée d’un membre
              </h3>
              <p className="text-gray-600 mb-6">
                Historique complet, présence, cellule, évolution
                et suivi spirituel.
              </p>
            </div>
            <div className="lg:w-1/2">
              <Image
                src="/Details Membre.png"
                alt="Fiche contact"
                width={200}
                height={500}
                className="rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] border"
              />
            </div>
          </div>

        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">
            Ils font confiance à SoulTrack
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl shadow-lg">
                <Image
                  src={t.avatar}
                  alt={t.name}
                  width={60}
                  height={60}
                  className="rounded-full mx-auto mb-4"
                />
                <p className="italic text-gray-600 mb-4">"{t.message}"</p>
                <h4 className="font-semibold">{t.name}</h4>
                <p className="text-sm text-gray-500">{t.church}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 px-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-center">
        <h2 className="text-3xl font-bold mb-6">
          Prêt à transformer la gestion de votre église ?
        </h2>
        <button
          onClick={() => router.push("/SignupEglise")}
          className="bg-white text-blue-700 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition"
        >
          🚀 Créer mon compte maintenant
        </button>
      </section>

      <Footer />
    </div>
  );
}
