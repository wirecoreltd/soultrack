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
      message: "Les statistiques claires nous permettent de mieux planifier nos actions.",
      avatar: "/avatar3.png",
    },
  ];

  const logos = [
    "/logo1.png",
    "/logo2.png",
    "/logo3.png",
    "/logo4.png",
    "/logo5.png",
  ];

  return (
    <div className="bg-white text-gray-900">
      <PublicHeader />

      {/* Hero */}
      <section className="relative pt-20 pb-32 bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100">
        <div className="max-w-7xl mx-auto px-6 lg:flex lg:items-center lg:justify-between">
          <div className="lg:w-1/2">
            <h1 className="text-5xl font-bold mb-6 text-gray-900">
              Centralisez la gestion de votre église
            </h1>
            <p className="text-lg text-gray-700 mb-6">
              Suivez les membres, les cellules, les présences, l’évangélisation et les rapports, 
              le tout dans une seule plateforme intelligente.
            </p>
            <p className="text-gray-600 italic mb-8">
              « Que tout ce que vous faites se fasse avec amour » – 1 Corinthiens 16:14
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => router.push("/signup-eglise")}
                className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-2xl hover:bg-blue-700 transition"
              >
                Commencer gratuitement
              </button>
              <button
                onClick={() => router.push("/login")}
                className="border border-blue-600 text-blue-600 font-semibold px-6 py-3 rounded-2xl hover:bg-blue-600 hover:text-white transition"
              >
                Connexion
              </button>
            </div>
          </div>

          <div className="lg:w-1/2 mt-10 lg:mt-0">
            <Image
              src="/hero-illustration.png"
              alt="Illustration SoulTrack"
              width={600}
              height={400}
              className="w-full h-auto rounded-xl shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-gradient-to-b from-pink-50 via-purple-50 to-blue-50">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-10">Fonctionnalités puissantes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl shadow-lg bg-pink-100 hover:scale-105 transition">
              <div className="text-3xl mb-4">👥</div>
              <h3 className="text-xl font-semibold mb-2">Suivi des Membres</h3>
              <p className="text-gray-700 text-sm">
                Suivi détaillé de chaque membre, statut, conversion et cellule.
              </p>
            </div>
            <div className="p-6 rounded-2xl shadow-lg bg-purple-100 hover:scale-105 transition">
              <div className="text-3xl mb-4">🏠</div>
              <h3 className="text-xl font-semibold mb-2">Cellules</h3>
              <p className="text-gray-700 text-sm">
                Organisation complète des cellules, responsables, présences et rapports.
              </p>
            </div>
            <div className="p-6 rounded-2xl shadow-lg bg-blue-100 hover:scale-105 transition">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2">Statistiques</h3>
              <p className="text-gray-700 text-sm">
                Données visuelles pour guider vos décisions spirituelles.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pourquoi SoulTrack */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto lg:flex lg:gap-12">
          <div className="lg:w-1/2">
            <h2 className="text-3xl font-bold mb-6">Pourquoi choisir SoulTrack ?</h2>
            <p className="text-gray-700 mb-6">
              Une plateforme pensée pour les églises, par des personnes qui comprennent 
              les enjeux du ministère et du suivi spirituel.
            </p>
            <ul className="text-gray-700 list-disc list-inside space-y-2">
              <li>Suivi intuitif et complet des membres</li>
              <li>Communication simplifiée et efficace</li>
              <li>Rapports fiables et exportables</li>
              <li>Adapté aux petites et grandes églises</li>
            </ul>
          </div>
          <div className="lg:w-1/2 mt-8 lg:mt-0">
            <Image
              src="/features-illustration.png"
              alt="Pourquoi SoulTrack"
              width={500}
              height={400}
              className="w-full h-auto rounded-xl shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-10">Ce que disent nos utilisateurs</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-lg">
                <div className="flex justify-center mb-4">
                  <Image
                    src={t.avatar}
                    alt={t.name}
                    width={60}
                    height={60}
                    className="rounded-full"
                  />
                </div>
                <p className="text-gray-700 mb-4 italic">"{t.message}"</p>
                <h4 className="font-semibold">{t.name}</h4>
                <p className="text-sm text-gray-500">{t.church}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ils utilisent SoulTrack */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-10">Ils utilisent SoulTrack</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center justify-items-center">
            {logos.map((logo, i) => (
              <div key={i} className="bg-gray-100 p-4 rounded-lg shadow-sm">
                <Image
                  src={logo}
                  alt={`Logo ${i + 1}`}
                  width={80}
                  height={40}
                  className="object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
