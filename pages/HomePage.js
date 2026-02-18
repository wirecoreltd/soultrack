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
        "SoulTrack a transformé la gestion de nos cellules et membres et nous permet de mieux accompagner chaque âme.",
      avatar: "/avatar1.png",
    },
    {
      name: "Past. Marie",
      church: "Église Grâce",
      message:
        "Un outil clair et puissant qui m’aide à prendre soin de mon troupeau avec sagesse et organisation.",
      avatar: "/avatar2.png",
    },
    {
      name: "Past. Samuel",
      church: "Église Lumière",
      message:
        "Les statistiques et hubs de SoulTrack nous permettent de mieux planifier, suivre et encourager nos membres.",
      avatar: "/avatar3.png",
    },
  ];

  return (
    <div className="bg-white text-gray-900">
      <PublicHeader />

      {/* HERO Inspirant centré */}
      <section className="pt-24 pb-24 bg-gradient-to-br from-blue-700 to-indigo-800 text-white text-center px-6">
        <div className="max-w-3xl mx-auto space-y-6">
          
          <h1 className="text-4xl lg:text-5xl font-bold">
            Le ministère est un appel. Le suivi est une responsabilité.
          </h1>

          <p className="text-lg lg:text-xl leading-relaxed">
            Chaque membre porte une histoire, chaque absence peut révéler une saison difficile et chaque silence peut cacher une bataille invisible.
          </p>

          <p className="text-lg lg:text-xl leading-relaxed">
            Un berger attentif ne dirige pas seulement : il discerne, il veille, il accompagne avec intention.
          </p>

          <p className="italic text-lg lg:text-xl">“Prenez soin du troupeau de Dieu…” – 1 Pierre 5:2</p>

          <p className="text-lg lg:text-xl leading-relaxed font-medium">
            Aimer, c’est aussi organiser. Servir une église, c’est structurer. Veiller, c’est suivre avec sagesse.
          </p>

          <button
            onClick={() => router.push("/SignupEglise")}
            className="mt-6 bg-white text-blue-700 px-8 py-3 rounded-xl font-semibold shadow-lg hover:scale-105 transition"
          >
            🚀 Découvrir SoulTrack
          </button>
        </div>
      </section>

      {/* FEATURES / Points clés */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-10">Une solution complète pour votre ministère</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-xl font-semibold mb-2">Gestion des Membres</h3>
              <p className="text-gray-600">
                Suivi complet du parcours spirituel et administratif de chaque membre, pour ne perdre aucune âme de vue.
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition">
              <div className="text-4xl mb-4">🏠</div>
              <h3 className="text-xl font-semibold mb-2">Organisation des Cellules</h3>
              <p className="text-gray-600">
                Créez et suivez vos cellules, responsables et présences, tout en visualisant la croissance de chaque groupe.
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2">Statistiques et Rapports</h3>
              <p className="text-gray-600">
                Visualisez la progression spirituelle et l’impact de vos actions pour mieux planifier votre ministère.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCT HUBS */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto space-y-24">

          {/* Membres Hub */}
          <div className="lg:flex lg:items-center lg:gap-12 bg-blue-50 p-6 rounded-2xl">
            <div className="lg:w-1/2">
              <h3 className="text-3xl font-bold mb-4">👥 Membres Hub</h3>
              <p className="text-gray-700 mb-4">
                Une vue complète de tous vos membres, leur statut, cellule et évolution spirituelle. Suivez chaque âme et accompagnez-la efficacement.
              </p>
            </div>
            <div className="lg:w-1/2">
              <Image
                src="/Espace Membre.png"
                alt="Membres Hub"
                width={500}
                height={200}
                className="rounded-2xl shadow-lg border"
              />
            </div>
          </div>

          {/* Evangélisation Hub */}
          <div className="lg:flex lg:flex-row-reverse lg:items-center lg:gap-12 bg-indigo-50 p-6 rounded-2xl">
            <div className="lg:w-1/2">
              <h3 className="text-3xl font-bold mb-4">✝️ Évangélisation Hub</h3>
              <p className="text-gray-700 mb-4">
                Suivez toutes vos conversions, baptêmes et nouvelles âmes. Centralisez les suivis avec vos conseillers et responsables de cellules.
              </p>
            </div>
            <div className="lg:w-1/2">
              <Image
                src="/Espace Evangelisation.png"
                alt="Évangélisation Hub"
                width={500}
                height={200}
                className="rounded-2xl shadow-lg border"
              />
            </div>
          </div>

          {/* Cellules Hub */}
          <div className="lg:flex lg:items-center lg:gap-12 bg-blue-100/20 p-6 rounded-2xl">
            <div className="lg:w-1/2">
              <h3 className="text-3xl font-bold mb-4">🏠 Cellules Hub</h3>
              <p className="text-gray-700 mb-4">
                Organisez vos responsables, suivez les présences et analysez la croissance spirituelle des cellules. Une vue globale et détaillée.
              </p>
            </div>
            <div className="lg:w-1/2">
              <Image
                src="/Espace Cellule.png"
                alt="Cellules Hub"
                width={500}
                height={200}
                className="rounded-2xl shadow-lg border"
              />
            </div>
          </div>

          {/* Fiche contact */}
          <div className="lg:flex lg:flex-row-reverse lg:items-center lg:gap-12 bg-white p-6 rounded-2xl shadow-lg">
            <div className="lg:w-1/2">
              <h3 className="text-3xl font-bold mb-4">📋 Fiche détaillée d’un membre</h3>
              <p className="text-gray-700 mb-4">
                Accédez à l’historique complet, la présence aux cultes, la cellule, l’évolution et le suivi spirituel. Chaque membre est suivi avec soin et attention.
              </p>
            </div>
            <div className="lg:w-1/2">
              <Image
                src="/Details Membre.png"
                alt="Fiche contact"
                width={100} // moitié de la taille originale
                height={250}
                className="rounded-2xl shadow-lg border"
              />
            </div>
          </div>

        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 px-6 bg-blue-50">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12 text-blue-800">Ils font confiance à SoulTrack</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-lg">
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
      <section className="py-20 px-6 bg-white text-center">
        <h2 className="text-3xl font-bold mb-6">
          Prêt à prendre soin de votre troupeau et de votre église ?
        </h2>
        <button
          onClick={() => router.push("/SignupEglise")}
          className="bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-800 transition"
        >
          🚀 Créer mon compte maintenant
        </button>
      </section>

      <Footer />
    </div>
  );
}
