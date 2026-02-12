"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

export default function ParcoursSoulTrack() {
  const router = useRouter();

  const steps = [
    {
      id: 1,
      title: "Ajouter et suivre les membres",
      icon: "/icons/member-plus.png",
      description:
        "Ajoutez un nouveau membre et assignez-le à un conseiller ou responsable de cellule pour suivre son parcours spirituel.",
      buttonText: "Voir la liste des membres",
      buttonLink: "/members",
      bg: "bg-blue-100",
    },
    {
      id: 2,
      title: "Ajouter des évangélisés",
      icon: "/icons/dove.png",
      description:
        "Ajoutez un nouvel évangélisé et suivez sa progression avec vos responsables et conseillers.",
      buttonText: "Voir la liste des membres",
      buttonLink: "/members",
      bg: "bg-green-100",
    },
    {
      id: 3,
      title: "Liste des membres",
      icon: "/icons/id-card.png",
      description:
        "Consultez tous les membres avec leurs détails et cartes individuelles pour un suivi complet.",
      buttonText: "Voir les membres",
      buttonLink: "/members",
      bg: "bg-yellow-100",
    },
    {
      id: 4,
      title: "Suivi des membres",
      icon: "/icons/checklist.png",
      description:
        "Gérez la présence au culte, l’évangélisation, formation et baptême. Suivi individuel et global pour chaque cellule et église.",
      buttonText: "Voir le hub de suivi",
      buttonLink: "/follow-up",
      bg: "bg-purple-100",
    },
    {
      id: 5,
      title: "Gestion des responsables et cellules",
      icon: "/icons/network.png",
      description:
        "Créez des responsables, des cellules de maison et attribuez des membres. Suivez l’évolution spirituelle de chaque âme dans sa cellule.",
      buttonText: "Voir le hub cellule",
      buttonLink: "/cellules",
      bg: "bg-pink-100",
    },
    {
      id: 6,
      title: "Relier les églises",
      icon: "/icons/church-connect.png",
      description:
        "Reliez votre église aux autres pour plus de visibilité et un reporting clair : Église mère → Église superviseur → Église supervisée.",
      buttonText: null,
      bg: "bg-orange-100",
    },
    {
      id: 7,
      title: "Administration et sécurité",
      icon: "/icons/shield.png",
      description:
        "Contrôle complet pour l’administrateur : création des utilisateurs, gestion des rôles et accès selon la hiérarchie.",
      buttonText: null,
      bg: "bg-red-100",
    },
  ];

  return (
    <div className="min-h-screen w-full bg-white text-gray-900">
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-16 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex-1 space-y-6">
          <h1 className="text-5xl font-bold text-blue-700">
            Découvrez comment SoulTrack simplifie la gestion de votre église
          </h1>
          <p className="text-lg text-gray-700">
            Un parcours simple pour suivre les membres, cellules et activités spirituelles,
            tout en gardant une visibilité complète sur votre église.
          </p>
          <button
            onClick={() => router.push("/signup-eglise")}
            className="mt-4 bg-gradient-to-r from-blue-500 to-amber-400 text-white font-bold py-3 px-6 rounded-2xl shadow-lg hover:scale-105 transition"
          >
            Commencer maintenant
          </button>
        </div>
        <div className="flex-1 flex justify-center">
          <div className="bg-blue-50 rounded-3xl p-6 shadow-lg">
            <Image
              src="/hub-mockup.png"
              alt="Mockup SoulTrack Hub"
              width={400}
              height={300}
              className="rounded-2xl"
            />
          </div>
        </div>
      </section>

      {/* Flowchart Steps */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center text-blue-700 mb-10">
          Comment ça marche
        </h2>

        <div className="grid md:grid-cols-2 gap-10">
          {steps.map((step, i) => (
            <div
              key={step.id}
              className={`flex flex-col md:flex-row items-center gap-6 p-6 rounded-2xl shadow-lg ${step.bg}`}
            >
              <div className="flex-shrink-0">
                <Image
                  src={step.icon}
                  alt={step.title}
                  width={80}
                  height={80}
                />
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="text-xl font-semibold">{step.title}</h3>
                <p className="text-gray-700">{step.description}</p>
                {step.buttonText && (
                  <button
                    onClick={() => router.push(step.buttonLink)}
                    className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:scale-105 transition"
                  >
                    {step.buttonText}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Final */}
      <section className="max-w-6xl mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl font-bold text-blue-700 mb-6">
          Prêt à simplifier la gestion de votre église ?
        </h2>
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
