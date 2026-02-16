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

  const hubs = [
    {
      title: "👥 Membres Hub",
      desc: "Gérez chaque membre avec une fiche complète incluant informations personnelles, statut spirituel, cellule d’appartenance, historique de présence et suivi pastoral. Une vue claire pour accompagner chaque personne avec précision.",
      img: "/Espace Membre.png",
      bg: "bg-blue-50",
    },
    {
      title: "✝️ Évangélisation Hub",
      desc: "Suivez les nouvelles âmes, les conversions, les baptêmes et les parcours d’intégration. Visualisez l’impact de vos actions d’évangélisation et identifiez les prochaines étapes pour un meilleur accompagnement.",
      img: "/Espace Evangelisation.png",
      bg: "bg-indigo-50",
    },
    {
      title: "🏠 Cellules Hub",
      desc: "Organisez vos responsables, gérez les groupes, suivez les présences hebdomadaires et analysez la croissance de vos cellules. Un outil essentiel pour structurer et développer votre ministère local.",
      img: "/Espace Cellule.png",
      bg: "bg-blue-100/60",
    },
    {
      title: "📋 Fiche détaillée",
      desc: "Accédez à une vue complète d’un membre : informations clés, historique, suivi spirituel, intégration en cellule et interactions pastorales. Tout est centralisé pour un accompagnement personnalisé.",
      img: "/Details Membre.png",
      bg: "bg-indigo-100/60",
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

      {/* SHOWCASE HUBS */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto space-y-16">

          {hubs.map((hub, i) => (
            <div
              key={i}
              className={`${hub.bg} rounded-3xl px-8 py-12 lg:flex lg:items-center lg:gap-14 shadow-sm`}
            >
              <div className={`lg:w-1/2 ${i % 2 !== 0 ? "lg:order-2" : ""}`}>
                <h3 className="text-2xl font-bold mb-4 text-blue-700">
                  {hub.title}
                </h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {hub.desc}
                </p>
              </div>

              <div className="lg:w-1/2 mt-8 lg:mt-0 flex justify-center">
                <Image
                  src={hub.img}
                  alt={hub.title}
                  width={hub.title.includes("Fiche") ? 250 : 480}
                  height={hub.title.includes("Fiche") ? 150 : 280}
                  className="rounded-xl shadow-lg border border-white"
                />
              </div>
            </div>
          ))}

        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-16 px-6 bg-blue-600 text-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-10">
            Ils font confiance à SoulTrack
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="bg-white text-gray-800 p-6 rounded-xl shadow-lg"
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
      <section className="py-20 px-6 bg-white text-center">
        <h2 className="text-2xl lg:text-3xl font-bold mb-6 text-gray-900">
          Prêt à faire passer votre église au niveau supérieur ?
        </h2>

        <p className="text-gray-600 mb-8">
          Structurez votre organisation, suivez votre croissance et concentrez-vous
          sur votre mission.
        </p>

        <button
          onClick={() => router.push("/SignupEglise")}
          className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:scale-105 transition"
        >
          🚀 Créer mon compte maintenant
        </button>
      </section>

      <Footer />
    </div>
  );
}
