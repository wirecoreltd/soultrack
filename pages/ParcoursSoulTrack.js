"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

export default function ParcoursSoulTrackFlow() {
  const router = useRouter();

  const steps = [
    {
      id: 1,
      title: "Ajouter et suivre les membres",
      icon: "/icons/add-member.png",
      description:
        "Ajoutez un membre et assignez-le à un conseiller ou responsable de cellule pour suivre son parcours spirituel.",
      button: { text: "Voir la liste des membres", link: "/members" },
      color: "bg-blue-200",
    },
    {
      id: 2,
      title: "Ajouter des évangélisés",
      icon: "/icons/dove.png",
      description:
        "Ajoutez un évangélisé et suivez sa progression avec responsables et conseillers.",
      button: { text: "Voir la liste des membres", link: "/members" },
      color: "bg-green-200",
    },
    {
      id: 3,
      title: "Liste des membres",
      icon: "/icons/profile-card.png",
      description:
        "Consultez tous les membres avec cartes individuelles et statut de suivi.",
      button: null,
      color: "bg-yellow-200",
    },
    {
      id: 4,
      title: "Suivi des membres",
      icon: "/icons/checklist.png",
      description:
        "Gérez la présence, l’évangélisation, la formation et le baptême. Suivi individuel et global pour chaque cellule et église.",
      button: { text: "Voir le hub de suivi", link: "/follow-up" },
      color: "bg-purple-200",
    },
    {
      id: 5,
      title: "Gestion des responsables et cellules",
      icon: "/icons/network.png",
      description:
        "Créez responsables, cellules de maison et attribuez les membres.",
      button: null,
      color: "bg-orange-200",
    },
    {
      id: 6,
      title: "Relier les églises",
      icon: "/icons/churches.png",
      description:
        "Reliez votre église aux autres pour visibilité et reporting : Église mère → Superviseur → Supervisée.",
      button: null,
      color: "bg-teal-200",
    },
    {
      id: 7,
      title: "Administration et sécurité",
      icon: "/icons/shield.png",
      description:
        "Contrôle complet : création des utilisateurs, gestion des rôles et accès selon la hiérarchie.",
      button: null,
      color: "bg-red-200",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-16 text-center">
        <h1 className="text-5xl font-bold text-blue-700 mb-4">
          Parcours SoulTrack
        </h1>
        <p className="text-lg text-gray-700 mb-8">
          Découvrez comment SoulTrack simplifie la gestion de vos membres et cellules, avec un parcours clair et visuel.
        </p>
        <button
          onClick={() => router.push("/signup-eglise")}
          className="bg-gradient-to-r from-blue-500 to-amber-400 text-white font-bold py-3 px-8 rounded-2xl shadow-lg hover:scale-105 transition"
        >
          Commencer maintenant
        </button>
      </section>

      {/* Flowchart */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-16">
          {steps.map((step, index) => (
            <div key={step.id} className="relative flex items-center">
              {/* Ligne et flèche */}
              {index < steps.length - 1 && (
                <div
                  className={`absolute top-12 left-1/2 md:left-auto md:right-0 w-1 h-12 md:h-1 md:w-12 bg-gray-300 transform ${
                    index % 2 === 0 ? "rotate-0" : "rotate-0 md:rotate-0"
                  }`}
                />
              )}

              {/* Card étape */}
              <div
                className={`flex-1 flex flex-col items-center p-6 rounded-2xl shadow-lg ${step.color} hover:scale-105 transition`}
              >
                <div className="w-20 h-20 mb-4">
                  <Image
                    src={step.icon}
                    alt={step.title}
                    width={80}
                    height={80}
                  />
                </div>
                <h3 className="text-2xl font-semibold mb-2 text-center">
                  {step.title}
                </h3>
                <p className="text-gray-700 text-center mb-4">
                  {step.description}
                </p>
                {step.button && (
                  <button
                    onClick={() => router.push(step.button.link)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-xl shadow hover:bg-blue-600 transition"
                  >
                    {step.button.text}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
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
