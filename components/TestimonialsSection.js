"use client";

import Image from "next/image";

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: "Past. Jean",
      church: "Église Bethel",
      message:
        "Avant SoulTrack, nous perdions la visibilité sur plusieurs membres. Aujourd’hui, chaque âme est suivie avec précision.",
      avatar: "/avatar1.png",
    },
    {
      name: "Past. Marie",
      church: "Église Grâce",
      message:
        "Je peux enfin voir la réalité spirituelle de mon église et agir au bon moment.",
      avatar: "/avatar2.png",
    },
    {
      name: "Responsable Samuel",
      church: "Église Lumière",
      message:
        "C’est devenu notre tableau de bord pastoral. Simple, clair et stratégique.",
      avatar: "/avatar3.png",
    },
  ];

  return (
    <section className="py-24 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto text-center space-y-12">

        <h2 className="text-3xl font-bold">
          Ce que disent les responsables
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-sm">
              <Image
                src={t.avatar}
                alt={t.name}
                width={60}
                height={60}
                className="rounded-full mx-auto mb-4"
              />
              <p className="text-gray-600 italic mb-4">"{t.message}"</p>
              <div className="font-semibold">{t.name}</div>
              <div className="text-sm text-gray-500">{t.church}</div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
