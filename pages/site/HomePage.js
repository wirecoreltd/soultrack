-"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import PublicHeader from "../../components/PublicHeader";
import Footer from "../../components/Footer";

export default function HomePage() {
  const router = useRouter();

  const testimonials = [
    {
      name: "Past. Jean",
      church: "Église Bethel",
      message:
        "SoulTrack nous aide à veiller avec précision sur chaque membre et à mieux accompagner les âmes confiées.",
      avatar: "/avatar1.png",
    },
    {
      name: "Past. Marie",
      church: "Église Grâce",
      message:
        "Une vision claire du troupeau. Nous savons enfin où agir, comment suivre et comment restaurer.",
      avatar: "/avatar2.png",
    },
    {
      name: "Past. Samuel",
      church: "Église Lumière",
      message:
        "Les rapports et indicateurs nous permettent de conduire l’église avec sagesse et structure.",
      avatar: "/avatar3.png",
    },
  ];

  return (
    <div className="bg-white text-gray-900">

      <PublicHeader />

      {/* HERO */}
      <section className="relative pt-28 pb-28 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.15),transparent)]" />

        <div className="relative max-w-5xl mx-auto text-center px-6 space-y-8">

          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
            Veillez sur le troupeau, sans perdre une seule âme.
          </h1>

          <p className="text-lg md:text-xl text-white/80 leading-relaxed">
            SoulTrack est une plateforme de gestion pastorale conçue pour aider les églises à suivre,
            comprendre et accompagner chaque membre avec précision, structure et discernement.
          </p>

          <p className="text-white/70 italic">
            “Sois le berger qui connaît ses brebis par leur nom.”
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
              className="border border-white/30 px-8 py-3 rounded-xl font-semibold hover:bg-white/10 transition"
            >
              Comprendre le système
            </button>
          </div>

        </div>
      </section>

      {/* VALUE */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto text-center space-y-12">

          <h2 className="text-3xl font-bold">
            Une vision simple : aucune âme ne doit être perdue dans l’oubli
          </h2>

          <p className="text-gray-600 max-w-3xl mx-auto leading-relaxed">
            SoulTrack n’est pas un simple outil administratif.
            C’est un système de suivi pastoral conçu pour structurer le ministère,
            renforcer le lien avec les membres et donner une vision claire de l’état du troupeau.
          </p>

          <div className="grid md:grid-cols-3 gap-8 pt-6">

            <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition">
              <div className="text-3xl mb-3">👁️</div>
              <h3 className="font-semibold mb-2">Vision du troupeau</h3>
              <p className="text-sm text-gray-600">
                Comprendre qui est présent, absent, fragile ou en croissance.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition">
              <div className="text-3xl mb-3">🧭</div>
              <h3 className="font-semibold mb-2">Direction pastorale</h3>
              <p className="text-sm text-gray-600">
                Prendre des décisions basées sur des données réelles et non sur des suppositions.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition">
              <div className="text-3xl mb-3">🛡️</div>
              <h3 className="font-semibold mb-2">Protection spirituelle</h3>
              <p className="text-sm text-gray-600">
                Identifier les besoins, les blocages et les situations sensibles.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* MODULES */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto space-y-24">

          <div className="lg:flex lg:items-center lg:gap-14">
            <div className="lg:w-1/2 space-y-4">
              <h3 className="text-3xl font-bold">👥 Suivi des membres</h3>
              <p className="text-gray-600">
                Chaque membre possède un parcours clair. Historique, statut spirituel,
                engagement et évolution sont centralisés pour un accompagnement précis.
              </p>
            </div>
            <div className="lg:w-1/2 mt-6 lg:mt-0">
              <div className="bg-gray-100 rounded-2xl h-64 flex items-center justify-center">
                <span className="text-gray-400">Interface Membres</span>
              </div>
            </div>
          </div>

          <div className="lg:flex lg:flex-row-reverse lg:items-center lg:gap-14">
            <div className="lg:w-1/2 space-y-4">
              <h3 className="text-3xl font-bold">✝️ Évangélisation & baptêmes</h3>
              <p className="text-gray-600">
                Suivez les nouvelles âmes, les décisions, les baptêmes et les étapes spirituelles
                pour ne laisser aucun suivi incomplet.
              </p>
            </div>
            <div className="lg:w-1/2 mt-6 lg:mt-0">
              <div className="bg-gray-100 rounded-2xl h-64 flex items-center justify-center">
                <span className="text-gray-400">Interface Évangélisation</span>
              </div>
            </div>
          </div>

          <div className="lg:flex lg:items-center lg:gap-14">
            <div className="lg:w-1/2 space-y-4">
              <h3 className="text-3xl font-bold">📊 Rapports & analyse</h3>
              <p className="text-gray-600">
                Des indicateurs simples et puissants pour comprendre la dynamique de l’église
                et ajuster la vision pastorale.
              </p>
            </div>
            <div className="lg:w-1/2 mt-6 lg:mt-0">
              <div className="bg-gray-100 rounded-2xl h-64 flex items-center justify-center">
                <span className="text-gray-400">Dashboard Analytics</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto text-center space-y-12">

          <h2 className="text-3xl font-bold">
            Témoignages de responsables
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-sm">
                <Image
                  src={t.avatar}
                  alt={t.name}
                  width={60}
                  height={60}
                  className="rounded-full mx-auto mb-4"
                />
                <p className="text-gray-600 italic mb-4">"{t.message}"</p>
                <div className="font-semibold">{t.name}</div>
                <div className="text-sm text-gray-500">{t.church}</div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center bg-white">
        <h2 className="text-3xl font-bold mb-6">
          Structurer votre ministère commence maintenant
        </h2>

        <button
          onClick={() => router.push("/SignupEglise")}
          className="bg-blue-900 text-white px-10 py-4 rounded-xl font-semibold hover:scale-105 transition"
        >
          Démarrer SoulTrack
        </button>
      </section>

      <Footer />
    </div>
  );
}
