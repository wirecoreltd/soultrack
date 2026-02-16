"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import PublicHeader from "../components/PublicHeader";
import Footer from "../components/Footer";

export default function CommentCaMarche() {
  const router = useRouter();

  const steps = [
    {
      number: "01",
      title: "Créez votre église",
      desc: "Inscrivez votre église en quelques minutes. Configurez les informations principales et invitez votre équipe administrative.",
      icon: "🏛️",
    },
    {
      number: "02",
      title: "Ajoutez vos membres",
      desc: "Importez ou ajoutez vos membres manuellement. Chaque personne dispose d’une fiche complète avec suivi et historique.",
      icon: "👥",
    },
    {
      number: "03",
      title: "Organisez vos cellules",
      desc: "Structurez vos groupes, attribuez les responsables et suivez les présences chaque semaine.",
      icon: "🏠",
    },
    {
      number: "04",
      title: "Suivez l’évangélisation",
      desc: "Enregistrez les nouvelles âmes, conversions et baptêmes pour mesurer votre impact.",
      icon: "✝️",
    },
    {
      number: "05",
      title: "Analysez votre croissance",
      desc: "Accédez aux statistiques et rapports pour prendre des décisions stratégiques et accompagner votre église.",
      icon: "📊",
    },
  ];

  return (
    <div className="bg-white text-gray-900">
      <PublicHeader />

      {/* HERO */}
      <section className="pt-20 pb-20 bg-gradient-to-br from-blue-600 to-indigo-700 text-white text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-4xl lg:text-5xl font-extrabold mb-6">
            Comment fonctionne SoulTrack ?
          </h1>
          <p className="text-lg text-white/90">
            Une plateforme simple, structurée et puissante pour gérer
            et développer votre église étape par étape.
          </p>
        </div>
      </section>

      {/* STEPS */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto space-y-16">

          {steps.map((step, index) => (
            <div
              key={index}
              className={`lg:flex lg:items-center lg:gap-16 ${
                index % 2 !== 0 ? "lg:flex-row-reverse" : ""
              }`}
            >
              {/* Texte */}
              <div className="lg:w-1/2">
                <div className="text-blue-600 font-bold text-sm mb-2">
                  ÉTAPE {step.number}
                </div>

                <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                  <span className="text-3xl">{step.icon}</span>
                  {step.title}
                </h2>

                <p className="text-gray-600 leading-relaxed">
                  {step.desc}
                </p>
              </div>

              {/* Illustration placeholder */}
              <div className="lg:w-1/2 mt-8 lg:mt-0">
                <div className="bg-blue-50 rounded-2xl h-64 flex items-center justify-center shadow-inner border border-blue-100">
                  <span className="text-blue-400 text-sm">
                    Capture écran correspondante
                  </span>
                </div>
              </div>
            </div>
          ))}

        </div>
      </section>

      {/* WHY SECTION */}
      <section className="py-20 px-6 bg-blue-50 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">
            Pourquoi SoulTrack simplifie votre gestion ?
          </h2>

          <p className="text-gray-700 mb-8">
            Parce que tout est centralisé dans une seule plateforme :
            membres, cellules, évangélisation et statistiques.
            Plus besoin de fichiers Excel dispersés ou de suivis manuels.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="font-semibold mb-2">Simple</h3>
              <p className="text-sm text-gray-600">
                Interface intuitive adaptée aux responsables d’église.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <div className="text-3xl mb-3">🔒</div>
              <h3 className="font-semibold mb-2">Sécurisé</h3>
              <p className="text-sm text-gray-600">
                Données protégées et accessibles uniquement à votre équipe.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <div className="text-3xl mb-3">📈</div>
              <h3 className="font-semibold mb-2">Stratégique</h3>
              <p className="text-sm text-gray-600">
                Des statistiques claires pour guider vos décisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-20 px-6 text-center bg-white">
        <h2 className="text-2xl lg:text-3xl font-bold mb-6">
          Prêt à commencer ?
        </h2>

        <button
          onClick={() => router.push("/SignupEglise")}
          className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:scale-105 transition"
        >
          🚀 Créer mon compte gratuitement
        </button>
      </section>

      <Footer />
    </div>
  );
}
