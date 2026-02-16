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
      message: "SoulTrack a révolutionné la gestion de nos cellules et membres.",
      avatar: "/avatar1.png",
    },
    {
      name: "Past. Marie",
      church: "Église Grâce",
      message: "Un outil simple et efficace pour suivre nos rapports et présences.",
      avatar: "/avatar2.png",
    },
    {
      name: "Past. Samuel",
      church: "Église Lumière",
      message: "Les statistiques claires nous permettent de mieux planifier.",
      avatar: "/avatar3.png",
    },
  ];

  return (
    <div className="bg-white text-gray-900">
      <PublicHeader />

      {/* HERO */}
      <section className="relative pt-24 pb-32 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-6 lg:flex lg:items-center lg:justify-between">
          
          <div className="lg:w-1/2">
            <span className="bg-white/20 px-4 py-1 rounded-full text-sm">
              🚀 Plateforme de gestion d’église moderne
            </span>

            <h1 className="text-5xl font-extrabold mt-6 mb-6 leading-tight">
              Gérez votre église avec clarté et efficacité
            </h1>

            <p className="text-lg text-white/90 mb-8">
              Membres, cellules, présences, rapports et statistiques.
              Tout centralisé dans une seule plateforme intelligente.
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
              alt="SoulTrack dashboard"
              width={600}
              height={400}
              className="rounded-2xl shadow-2xl"
            />
          </div>

        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">
            Tout ce dont votre église a besoin
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-xl font-semibold mb-3">Gestion des membres</h3>
              <p className="text-gray-600">
                Suivi complet du parcours spirituel, statut, conversion et cellule.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition">
              <div className="text-4xl mb-4">🏠</div>
              <h3 className="text-xl font-semibold mb-3">Organisation des cellules</h3>
              <p className="text-gray-600">
                Gérez responsables, présences et rapports facilement.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-3">Statistiques intelligentes</h3>
              <p className="text-gray-600">
                Données visuelles pour guider vos décisions et votre croissance.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 px-6">
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
          Prêt à moderniser la gestion de votre église ?
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
