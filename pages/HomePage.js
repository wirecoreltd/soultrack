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
        "SoulTrack a transformé la gestion de nos communautés et membres.",
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
        <div className="max-w-6xl mx-auto px-6 lg:flex lg:items-center lg:justify-between">
          <div className="lg:w-1/2">
            <span className="bg-white/20 px-4 py-1 rounded-full text-sm">
              🚀 Plateforme moderne pour églises
            </span>

            <h1 className="text-4xl md:text-5xl font-extrabold mt-6 mb-6 leading-tight">
              Centralisez la gestion de votre église
            </h1>

            <p className="text-lg text-white/90 mb-8">
              Chaque membre, chaque petite communauté et chaque famille comptent.  
              Suivez la croissance, les présences et l’évangélisation dans une seule plateforme simple et puissante.
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
              src="/Dashboard.png"
              alt="Dashboard SoulTrack"
              width={700}
              height={450}
              className="rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.3)]"
            />
          </div>
        </div>
      </section>

      {/* ÉDIFIANT */}
      <section className="py-20 px-6 bg-white text-center max-w-4xl mx-auto space-y-6">
        <h2 className="text-3xl font-bold text-blue-700 mb-6">
          Le ministère est un appel. Le suivi est une responsabilité.
        </h2>
        <p className="text-lg md:text-xl text-gray-800 leading-relaxed">
          Chaque membre porte une histoire, chaque absence peut révéler une saison difficile et chaque silence peut cacher une bataille invisible.  
          <br /><br />
          Un berger attentif ne dirige pas seulement : il discerne, il veille, il accompagne avec intention.
          <br /><br />
          “Prenez soin du troupeau de Dieu…” – 1 Pierre 5:2
          <br /><br />
          Aimer, c’est aussi organiser. Servir une église, c’est structurer. Veiller, c’est suivre avec sagesse.
        </p>
      </section>

      {/* FEATURES */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto text-center">
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
                Organisation des communautés
              </h3>
              <p className="text-gray-600">
                Chaque cellule ou famille est encadrée par un leader. Suivez la croissance, les présences et l’accompagnement spirituel.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-3">
                Statistiques intelligentes
              </h3>
              <p className="text-gray-600">
                Visualisez la croissance et prenez de meilleures décisions pour votre église.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCT SHOWCASE */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto space-y-24">

          {/* Membres Hub */}
          <div className="lg:flex lg:items-center lg:gap-16">
            <div className="lg:w-1/2">
              <h3 className="text-3xl font-bold mb-6">👥 Membres Hub</h3>
              <p className="text-gray-600 mb-6">
                Suivez tous vos membres, leurs statuts, évolutions et leur intégration dans la communauté. Gardez une vision claire pour mieux accompagner chacun.
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
                Suivez conversions, baptêmes et nouvelles âmes avec précision. Gardez une vue d’ensemble et un suivi personnalisé de chaque disciple.
              </p>
            </div>
            <div className="lg:w-1/2">
              <Image
                src="/Espace Evangelisation.png"
                alt="Evangélisation Hub"
                width={500}
                height={200}
                className="rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] border"
              />
            </div>
          </div>

          {/* Organisation des communautés */}
          <div className="lg:flex lg:items-center lg:gap-16">
            <div className="lg:w-1/2">
              <h3 className="text-3xl font-bold mb-6">🏠 Organisation des communautés</h3>
              <p className="text-gray-600 mb-6">
                Organisez vos cellules et familles avec un leader dédié. Suivez les présences, les besoins spirituels et l’évolution de chaque petit groupe pour mieux soutenir votre église.
              </p>
            </div>
            <div className="lg:w-1/2">
              <Image
                src="/Espace Cellule.png"
                alt="Organisation des communautés"
                width={500}
                height={200}
                className="rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] border"
              />
            </div>
          </div>

          {/* Fiche Contact */}
          <div className="lg:flex lg:flex-row-reverse lg:items-center lg:gap-16">
            <div className="lg:w-1/2">
              <h3 className="text-3xl font-bold mb-6">📋 Fiche détaillée d’un membre</h3>
              <p className="text-gray-600 mb-6">
                Historique complet, présence, cellule, famille et suivi spirituel. Tous les détails nécessaires pour un accompagnement précis.
              </p>
            </div>
            <div className="lg:w-1/2">
              <Image
                src="/Details Membre.png"
                alt="Fiche contact"
                width={150} // réduite pour moitié
                height={375}
                className="rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] border"
              />
            </div>
          </div>

        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 px-6 bg-blue-50">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-blue-700 mb-12">
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
      <section className="py-24 px-6 bg-white text-center">
        <h2 className="text-3xl font-bold mb-6 text-gray-900">
          Prêt à mieux accompagner votre église ?
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
