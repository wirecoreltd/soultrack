"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import PublicHeader from "../components/PublicHeader";
import Footer from "../components/Footer";

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="bg-white text-gray-900">
      <PublicHeader />

      {/* HERO */}
      <section className="pt-24 pb-28 bg-gradient-to-br from-blue-700 to-indigo-800 text-white">
        <div className="max-w-5xl mx-auto px-6 text-center">

          <h1 className="text-4xl lg:text-5xl font-extrabold mb-6 leading-tight">
            Connaître son troupeau est une responsabilité spirituelle.
          </h1>

          <p className="text-lg text-white/90 mb-4 max-w-3xl mx-auto">
            Le berger qui laisse 99 brebis pour chercher celle qui est perdue
            savait exactement combien il en avait.
          </p>

          <p className="italic text-white/80 mb-8">
            “Si un homme a cent brebis…” – Matthieu 18:12
          </p>

          <p className="text-lg max-w-3xl mx-auto mb-10">
            Pour accompagner, il faut connaître.  
            Pour restaurer, il faut suivre.  
            Pour faire grandir, il faut mesurer.
          </p>

          <button
            onClick={() => router.push("/SignupEglise")}
            className="bg-white text-blue-700 px-8 py-4 rounded-xl font-semibold shadow-lg hover:scale-105 transition"
          >
            🚀 Commencer gratuitement
          </button>

        </div>
      </section>

      {/* CONSCIENCE + REALITE */}
      <section className="py-20 px-6 bg-blue-50 text-center">
        <div className="max-w-5xl mx-auto">

          <h2 className="text-3xl font-bold mb-6">
            L’amour pastoral nécessite de la structure.
          </h2>

          <p className="text-gray-700 leading-relaxed mb-10">
            Derrière chaque absence se cache peut-être une difficulté.
            Derrière chaque silence se cache peut-être une lutte.
            Sans visibilité claire, certaines brebis peuvent s’éloigner
            sans que personne ne le remarque.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow border">
              👥 Membres non suivis
            </div>
            <div className="bg-white p-6 rounded-xl shadow border">
              📉 Croissance non mesurée
            </div>
            <div className="bg-white p-6 rounded-xl shadow border">
              ❌ Absences invisibles
            </div>
          </div>

        </div>
      </section>

      {/* SOLUTION TECH + SPIRITUEL */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto lg:flex lg:items-center lg:gap-16">

          <div className="lg:w-1/2">

            <h2 className="text-3xl font-bold mb-6 text-blue-700">
              SoulTrack allie vision spirituelle et intelligence numérique.
            </h2>

            <p className="text-gray-700 mb-6 leading-relaxed">
              Une plateforme moderne conçue pour aider les responsables
              à exercer un leadership éclairé, structuré et intentionnel.
            </p>

            <ul className="space-y-3 text-gray-700">
              <li>✔ Fiches membres détaillées</li>
              <li>✔ Suivi des présences et cellules</li>
              <li>✔ Évangélisation organisée</li>
              <li>✔ Tableaux de bord stratégiques</li>
              <li>✔ Données centralisées et sécurisées</li>
            </ul>

            <p className="mt-6 text-gray-600">
              Non pour contrôler, mais pour mieux servir.
            </p>

          </div>

          <div className="lg:w-1/2 mt-10 lg:mt-0">
            <Image
              src="/Dashboard.png"
              alt="Dashboard SoulTrack"
              width={600}
              height={350}
              className="rounded-2xl shadow-2xl border"
            />
          </div>

        </div>
      </section>

      {/* IMPACT */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-center">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">

          <div>
            <div className="text-4xl font-bold">Clarté</div>
            <p className="mt-3 text-white/90">
              Une vision précise de votre communauté.
            </p>
          </div>

          <div>
            <div className="text-4xl font-bold">Anticipation</div>
            <p className="mt-3 text-white/90">
              Identifier rapidement les besoins.
            </p>
          </div>

          <div>
            <div className="text-4xl font-bold">Croissance</div>
            <p className="mt-3 text-white/90">
              Mesurer et structurer le développement.
            </p>
          </div>

        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-20 px-6 text-center bg-white">
        <h2 className="text-2xl lg:text-3xl font-bold mb-6">
          Être un bon intendant, c’est connaître ce que Dieu nous confie.
        </h2>

        <p className="text-gray-600 mb-8">
          Donnez à votre église les outils nécessaires pour accompagner chaque âme avec attention.
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
