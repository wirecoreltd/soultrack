"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import PublicHeader from "../components/PublicHeader";
import Footer from "../components/Footer";

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="bg-white">
      <PublicHeader />

      {/* Hero */}
      <section className="relative pt-20 pb-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:flex lg:items-center lg:justify-between">
          {/* Texte Hero */}
          <div className="lg:w-1/2">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Centralisez la gestion de votre église
            </h1>
            <p className="text-lg text-gray-700 mb-8">
              Suivez les membres, les présences, les cellules, l’évangélisation et
              les rapports, le tout dans une seule plateforme intelligente.
            </p>
            <p className="text-gray-500 mb-6 italic">
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

          {/* Illustration */}
          <div className="lg:w-1/2 mt-10 lg:mt-0">
            <Image
              src="/hero-illustration.png"
              alt="Illustration SoulTrack"
              width={600}
              height={400}
              className="w-full h-auto"
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-10">Fonctionnalités puissantes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 border rounded-2xl shadow-sm hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-2">Suivi des Membres</h3>
              <p className="text-gray-700 text-sm">
                Suivi détaillé de chaque membre, statut, conversion et cellule.
              </p>
            </div>
            <div className="bg-white p-6 border rounded-2xl shadow-sm hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-2">Cellules</h3>
              <p className="text-gray-700 text-sm">
                Organisation complète des cellules, responsables, présences et rapports.
              </p>
            </div>
            <div className="bg-white p-6 border rounded-2xl shadow-sm hover:shadow-lg transition">
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
            <h2 className="text-3xl font-bold mb-6">
              Pourquoi choisir SoulTrack ?
            </h2>
            <p className="text-gray-700 mb-6">
              Une plateforme pensée pour les églises, par des personnes qui
              comprennent les enjeux du ministère et du suivi spirituel.
            </p>
            <ul className="text-gray-700 list-disc list-inside space-y-2">
              <li>Suivi intuitif et complet</li>
              <li>Communication simplifiée</li>
              <li>Rapports fiables et exportables</li>
              <li>Adapté aux petites comme grandes églises</li>
            </ul>
          </div>
          <div className="lg:w-1/2 mt-8 lg:mt-0">
            <Image
              src="/features-illustration.png"
              alt="Pourquoi SoulTrack"
              width={500}
              height={400}
              className="w-full h-auto"
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gray-50 py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-10">Ce que disent nos utilisateurs</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 border rounded-xl shadow-sm">
              <p className="text-gray-700 mb-4 italic">
                "SoulTrack a transformé la manière dont nous gérons nos cellules."
              </p>
              <h4 className="font-semibold">Past. Jean</h4>
              <p className="text-sm text-gray-500">Église Bethel</p>
            </div>
            <div className="bg-white p-6 border rounded-xl shadow-sm">
              <p className="text-gray-700 mb-4 italic">
                "Un outil indispensable pour suivre les présences et rapports."
              </p>
              <h4 className="font-semibold">Past. Marie</h4>
              <p className="text-sm text-gray-500">Église Grâce</p>
            </div>
            <div className="bg-white p-6 border rounded-xl shadow-sm">
              <p className="text-gray-700 mb-4 italic">
                "Les statistiques sont claires et nous aident à mieux planifier."
              </p>
              <h4 className="font-semibold">Past. Samuel</h4>
              <p className="text-sm text-gray-500">Église Lumière</p>
            </div>
          </div>
        </div>
      </section>

      {/* Logos utilisateurs */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-10">Ils utilisent SoulTrack</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center justify-items-center">
            <img src="/logo-eglise1.png" alt="Église 1" className="h-12 object-contain" />
            <img src="/logo-eglise2.png" alt="Église 2" className="h-12 object-contain" />
            <img src="/logo-eglise3.png" alt="Église 3" className="h-12 object-contain" />
            <img src="/logo-eglise4.png" alt="Église 4" className="h-12 object-contain" />
            <img src="/logo-eglise5.png" alt="Église 5" className="h-12 object-contain" />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
