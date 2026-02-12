"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

export default function ParcoursSoulTrack() {
  const router = useRouter();

  const parcoursSteps = [
    {
      id: 1,
      title: "Ajouter et suivre les membres",
      subtitle: "Add Member",
      icon: "/icons/add-member.png",
      text: "Ajoutez un nouveau membre et assignez-le à un conseiller ou responsable de cellule pour suivre son parcours spirituel.",
      button: { text: "Voir la liste des membres", link: "/members" },
      color: "bg-blue-100",
    },
    {
      id: 2,
      title: "Ajouter des évangélisés",
      subtitle: "Add Evangelisés",
      icon: "/icons/dove.png",
      text: "Ajoutez un nouvel évangélisé et suivez sa progression avec vos responsables et conseillers.",
      button: { text: "Voir la liste des membres", link: "/members" },
      color: "bg-green-100",
    },
    {
      id: 3,
      title: "Liste des membres",
      subtitle: "Tous les membres",
      icon: "/icons/profile-card.png",
      text: "Consultez tous les membres, avec leurs détails et cartes individuelles pour un suivi complet.",
      button: null,
      color: "bg-yellow-100",
    },
    {
      id: 4,
      title: "Suivi des membres",
      subtitle: "Follow-Up",
      icon: "/icons/checklist.png",
      text: "Gérez le suivi spirituel et organisationnel des membres : présence au culte, évangélisation, formation et baptême.",
      button: { text: "Voir le hub de suivi", link: "/follow-up" },
      color: "bg-purple-100",
    },
    {
      id: 5,
      title: "Gestion des responsables et cellules",
      subtitle: "Cellules & Responsables",
      icon: "/icons/network.png",
      text: "Créez des responsables, des cellules de maison et attribuez des membres. Suivez l’évolution spirituelle de chaque âme dans sa cellule.",
      button: null,
      color: "bg-orange-100",
    },
    {
      id: 6,
      title: "Relier les églises",
      subtitle: "Églises connectées",
      icon: "/icons/churches.png",
      text: "Reliez votre église aux autres pour plus de visibilité et un reporting clair. Cascade des rapports : Église mère → Église superviseur → Église supervisée.",
      button: null,
      color: "bg-teal-100",
    },
    {
      id: 7,
      title: "Administration et sécurité",
      subtitle: "Admin Hub",
      icon: "/icons/shield.png",
      text: "Contrôle complet pour l’administrateur, création des utilisateurs, gestion des rôles et accès selon la hiérarchie.",
      button: null,
      color: "bg-red-100",
    },
  ];

  return (
    <div className="min-h-screen w-full bg-white text-gray-900">
      {/* Hero */}
      <section className="flex flex-col md:flex-row items-center justify-between max-w-6xl mx-auto px-6 py-16 gap-8">
        <div className="flex-1 space-y-6">
          <h1 className="text-5xl font-bold text-blue-700">
            Découvrez comment SoulTrack simplifie la gestion de votre église
          </h1>
          <p className="text-lg text-gray-700">
            Un parcours simple pour suivre les membres, cellules et activités spirituelles, tout en gardant une visibilité complète sur votre église.
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
              src="/hero-hub.png"
              alt="Hub SoulTrack"
              width={400}
              height={300}
              className="rounded-2xl"
            />
          </div>
        </div>
      </section>

      {/* Parcours / Flowchart */}
      <section className="max-w-6xl mx-auto px-6 py-16 space-y-12">
        {parcoursSteps.map((step, i) => (
          <div key={step.id} className={`flex flex-col md:flex-row items-center gap-6 ${i % 2 === 0 ? "" : "md:flex-row-reverse"}`}>
            {/* Icône */}
            <div className={`flex-shrink-0 w-28 h-28 rounded-full flex items-center justify-center ${step.color}`}>
              <Image src={step.icon} alt={step.subtitle} width={60} height={60} />
            </div>

            {/* Texte */}
            <div className="flex-1 space-y-3">
              <h3 className="text-2xl font-semibold text-blue-700">{step.title}</h3>
              <p className="text-gray-700">{step.text}</p>
              {step.button && (
                <button
                  onClick={() => router.push(step.button.link)}
                  className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-xl shadow hover:bg-blue-600 transition"
                >
                  {step.button.text}
                </button>
              )}
            </div>
          </div>
        ))}
      </section>

      {/* Témoignages fictifs */}
      <section className="bg-blue-50 py-16">
        <h2 className="text-3xl font-bold text-center text-blue-700 mb-12">Ils utilisent SoulTrack</h2>
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 px-6">
          {[
            { name: "Past. Jean", role: "Responsable Cellule", members: 150, message: "SoulTrack a révolutionné la gestion de nos cellules et membres.", avatar: "/avatar1.png" },
            { name: "Sœur Marie", role: "Superviseur Cellule", members: 300, message: "Grâce à SoulTrack, je peux suivre et accompagner chaque membre facilement.", avatar: "/avatar2.png" },
            { name: "Frère Paul", role: "Administrateur", members: 500, message: "Une plateforme intuitive et fiable pour toute l’église.", avatar: "/avatar3.png" }
          ].map((t, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-lg flex flex-col items-center hover:scale-105 transition">
              <Image src={t.avatar} alt={t.name} width={80} height={80} className="rounded-full mb-4" />
              <p className="text-gray-700 mb-2 italic text-center">"{t.message}"</p>
              <p className="font-semibold">{t.name}</p>
              <p className="text-sm text-gray-500">{t.role} - {t.members} membres</p>
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
