"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

export default function HomePage() {
  const router = useRouter();

  const testimonials = [
    {
      name: "Past. Jean",
      church: "Église Bethel",
      role: "Responsable Cellule",
      members: 150,
      message: "SoulTrack a révolutionné la gestion de nos cellules et membres.",
      avatar: "/avatar1.png",
    },
    {
      name: "Sœur Marie",
      church: "Église Lumière",
      role: "Superviseur Cellule",
      members: 300,
      message: "Grâce à SoulTrack, je peux suivre et accompagner chaque membre facilement.",
      avatar: "/avatar2.png",
    },
    {
      name: "Frère Paul",
      church: "Église Espoir",
      role: "Administrateur",
      members: 500,
      message: "Une plateforme intuitive et fiable pour toute l’église.",
      avatar: "/avatar3.png",
    },
  ];

  return (
    <div className="min-h-screen w-full bg-white text-gray-900">
      {/* Hero */}
      <section className="relative flex flex-col md:flex-row items-center justify-between max-w-6xl mx-auto px-6 py-16 gap-8">
        <div className="flex-1 space-y-6">
          <h1 className="text-5xl font-bold text-blue-700">
            Gérez vos cellules et membres avec SoulTrack
          </h1>
          <p className="text-lg text-gray-700">
            Suivez l’évolution spirituelle et organisationnelle de votre église facilement. 
            Comme il est écrit : <span className="italic">« Prenez soin les uns des autres » (1 Pierre 5:2)</span>
          </p>
          <button
            onClick={() => router.push("/signup-eglise")}
            className="mt-4 bg-gradient-to-r from-blue-500 to-amber-400 text-white font-bold py-3 px-6 rounded-2xl shadow-lg hover:scale-105 transition"
          >
            Commencer
          </button>
        </div>

        <div className="flex-1 flex justify-center">
          <div className="bg-blue-50 rounded-3xl p-6 shadow-lg">
            <Image
              src="/hero-illustration.png"
              alt="Illustration SoulTrack"
              width={400}
              height={300}
              className="rounded-2xl"
            />
          </div>
        </div>
      </section>

      {/* Fonctionnalités */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center text-blue-700 mb-10">Fonctionnalités clés</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white shadow-lg rounded-2xl p-6 text-center hover:scale-105 transition">
            <h3 className="font-semibold text-xl mb-2">Suivi des membres</h3>
            <p className="text-gray-600">Consultez l'évolution spirituelle de chaque membre et chaque cellule.</p>
          </div>
          <div className="bg-white shadow-lg rounded-2xl p-6 text-center hover:scale-105 transition">
            <h3 className="font-semibold text-xl mb-2">Rapports et statistiques</h3>
            <p className="text-gray-600">Analysez vos cultes, évangélisations et nouvelles conversions.</p>
          </div>
          <div className="bg-white shadow-lg rounded-2xl p-6 text-center hover:scale-105 transition">
            <h3 className="font-semibold text-xl mb-2">Communication facile</h3>
            <p className="text-gray-600">Envoyez des invitations, messages et rappels via WhatsApp ou Email.</p>
          </div>
        </div>
      </section>

      {/* Témoignages */}
      <section className="bg-blue-50 py-16">
        <h2 className="text-3xl font-bold text-center text-blue-700 mb-12">Ils utilisent SoulTrack</h2>
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 px-6">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-lg flex flex-col items-center hover:scale-105 transition">
              <Image src={t.avatar} alt={t.name} width={80} height={80} className="rounded-full mb-4" />
              <p className="text-gray-700 mb-2 italic text-center">"{t.message}"</p>
              <p className="font-semibold">{t.name}</p>
              <p className="text-sm text-gray-500">{t.role} - {t.members} membres</p>
              <p className="text-sm text-gray-400">{t.church}</p>
              <button className="mt-4 text-blue-600 underline text-sm hover:text-blue-800">
                Voir profil
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="max-w-6xl mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl font-bold text-blue-700 mb-6">Prêt à simplifier la gestion de votre église ?</h2>
        <button
          onClick={() => router.push("/signup-eglise")}
          className="bg-gradient-to-r from-blue-500 to-amber-400 text-white font-bold py-3 px-8 rounded-2xl shadow-lg hover:scale-105 transition"
        >
          Commencer maintenant
        </button>
      </section>
    </div>
  );
}
