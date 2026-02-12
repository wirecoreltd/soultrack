"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

export default function ParcoursSoulTrack() {
  const router = useRouter();

  const steps = [
    {
      id: 1,
      title: "Ajouter & Suivre Membres",
      icon: "/icons/member-plus.png",
      description:
        "Ajoutez un membre et assignez-le à un conseiller ou responsable de cellule pour débuter le suivi.",
      buttonText: "Voir liste des membres",
      buttonLink: "/members",
    },
    {
      id: 2,
      title: "Ajouter Évangélisés",
      icon: "/icons/dove.png",
      description:
        "Ajoutez un évangélisé et suivez sa progression avec vos responsables et conseillers.",
      buttonText: "Voir liste des membres",
      buttonLink: "/members",
    },
    {
      id: 3,
      title: "Liste des Membres",
      icon: "/icons/id-card.png",
      description:
        "Visualisez tous les membres avec leur carte individuelle, photo et statut.",
      buttonText: null,
    },
    {
      id: 4,
      title: "Suivi des Membres",
      icon: "/icons/checklist.png",
      description:
        "Gérez présences, évangélisation, baptêmes, formation — suivi individuel et global.",
      buttonText: "Voir le hub de suivi",
      buttonLink: "/follow-up",
    },
    {
      id: 5,
      title: "Responsables & Cellules",
      icon: "/icons/network.png",
      description:
        "Créez des responsables, cellules de maison et suivez chaque âme dans son parcours.",
      buttonText: null,
    },
    {
      id: 6,
      title: "Relier les Églises",
      icon: "/icons/church-connect.png",
      description:
        "Reliez votre église aux autres pour plus de visibilité et reports clairs.",
      buttonText: null,
    },
    {
      id: 7,
      title: "Administration & Sécurité",
      icon: "/icons/shield.png",
      description:
        "Gestion des utilisateurs et rôles selon la hiérarchie (Admin, Conseiller, etc.).",
      buttonText: null,
    },
  ];

  return (
    <div className="bg-white text-gray-900 min-h-screen">
      {/* Hero */}
      <section className="text-center px-6 py-16 max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-blue-700 mb-4">
          Parcours SoulTrack — Comment ça marche
        </h1>
        <p className="text-lg text-gray-700 mb-6">
          Suivez chaque étape de la gestion de votre église avec clarté.
        </p>
        <button
          onClick={() => router.push("/signup-eglise")}
          className="bg-gradient-to-r from-blue-500 to-amber-400 text-white font-bold py-3 px-8 rounded-2xl shadow-md hover:scale-105 transition"
        >
          Commencer maintenant
        </button>
      </section>

      {/* Timeline */}
      <section className="relative max-w-4xl mx-auto px-6 py-12">
        {/* Vertical line */}
        <div className="absolute left-1/2 transform -translate-x-1/2 h-full border-l-2 border-blue-200"></div>

        {steps.map((step, idx) => (
          <div
            key={step.id}
            className={`relative mb-12 flex ${
              idx % 2 === 0 ? "justify-start" : "justify-end"
            }`}
          >
            <div className="w-1/2 flex items-center justify-center">
              {/* Step marker circle */}
              <div className="z-10 flex items-center justify-center flex-col text-center">
                <div className="bg-blue-500 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shadow-lg">
                  {step.id}
                </div>
                <div className="mt-2 text-sm font-semibold text-blue-600">
                  {step.title}
                </div>
              </div>
            </div>
            <div className="w-1/2 p-4">
              <div className="bg-gray-50 p-4 rounded-2xl shadow-md">
                <div className="flex items-center gap-3 mb-2">
                  <Image
                    src={step.icon}
                    alt={step.title}
                    width={40}
                    height={40}
                  />
                  <h3 className="text-lg font-semibold text-gray-800">
                    {step.title}
                  </h3>
                </div>
                <p className="text-gray-700 text-sm">{step.description}</p>
                {step.buttonText && (
                  <button
                    onClick={() => router.push(step.buttonLink)}
                    className="mt-3 bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 transition"
                  >
                    {step.buttonText}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* CTA final */}
      <section className="text-center px-6 py-16">
        <h2 className="text-3xl font-bold text-blue-700 mb-4">
          Prêt à simplifier la gestion de votre église ?
        </h2>
        <button
          onClick={() => router.push("/signup-eglise")}
          className="bg-gradient-to-r from-blue-500 to-amber-400 text-white font-bold py-3 px-8 rounded-2xl shadow-md hover:scale-105 transition"
        >
          Commencer maintenant
        </button>
      </section>
    </div>
  );
}
