"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

export default function ParcoursSoulTrack() {
  const router = useRouter();

  const features = [
    {
      title: "Ajouter et suivre les membres",
      description: "Ajoutez un membre et assignez-le à un responsable ou conseiller pour un suivi spirituel complet.",
      icon: "/icons/member.png",
      button: { label: "Voir la liste des membres", link: "/members" },
    },
    {
      title: "Ajouter les évangélisés",
      description: "Ajoutez un nouvel évangélisé et suivez sa progression spirituelle avec vos responsables.",
      icon: "/icons/evangelise.png",
      button: { label: "Voir la liste des membres", link: "/members" },
    },
    {
      title: "Liste des membres",
      description: "Consultez tous les membres avec leurs cartes individuelles, photos et détails.",
      icon: "/icons/card.png",
      button: null,
    },
    {
      title: "Suivi des membres",
      description: "Gérez la présence au culte, l’évangélisation, la formation et le baptême. Suivi individuel et global.",
      icon: "/icons/follow-up.png",
      button: { label: "Voir le hub de suivi", link: "/follow-up" },
    },
    {
      title: "Gestion des responsables et cellules",
      description: "Créez des responsables et des cellules, attribuez des membres et suivez chaque âme.",
      icon: "/icons/hierarchy.png",
      button: null,
    },
    {
      title: "Relier les églises",
      description: "Reliez votre église aux autres pour plus de visibilité et un reporting clair.",
      icon: "/icons/churches.png",
      button: null,
    },
    {
      title: "Administration et sécurité",
      description: "Créez des utilisateurs, gérez les rôles et les accès selon la hiérarchie.",
      icon: "/icons/admin.png",
      button: null,
    },
  ];

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
    <div className="min-h-screen bg-white text-gray-900">
      {/* Hero */}
      <section className="relative flex flex-col md:flex-row items-center justify-between max-w-6xl mx-auto px-6 py-16 gap-8">
        <div className="flex-1 space-y-6">
          <h1 className="text-5xl font-bold text-blue-700">
            Découvrez le parcours SoulTrack
          </h1>
          <p className="text-lg text-gray-700">
            Un chemin simple et visuel pour gérer vos cellules, membres et activités spirituelles. 
            <span className="italic"> « Veillez les uns sur les autres » (Galates 6:2)</span>
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
              alt="Illustration parcours SoulTrack"
              width={400}
              height={300}
              className="rounded-2xl"
            />
          </div>
        </div>
      </section>

      {/* Features / Process */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center text-blue-700 mb-12">Comment ça marche</h2>
        <div className="grid md:grid-cols-2 gap-10">
          {features.map((f, i) => (
            <div key={i} className="flex flex-col items-center bg-white shadow-lg rounded-2xl p-6 text-center hover:scale-105 transition">
              <Image src={f.icon} alt={f.title} width={80} height={80} className="mb-4" />
              <h3 className="font-semibold text-xl mb-2">{f.title}</h3>
              <p className="text-gray-600 mb-4">{f.description}</p>
              {f.button && (
                <button
                  onClick={() => router.push(f.button.link)}
                  className="bg-gradient-to-r from-blue-500 to-amber-400 text-white font-bold py-2 px-4 rounded-xl shadow-md hover:scale-105 transition"
                >
                  {f.button.label}
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
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
