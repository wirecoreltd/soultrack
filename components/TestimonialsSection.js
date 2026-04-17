"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

export default function TestimonialsSection() {
  const containerRef = useRef(null);

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
      name: "Past. Jean",
      church: "Église Agape",
      message: "Excellent outil pour structurer notre ministère.",
      avatar: "/avatar2.png",
    },
    {
      name: "Bishop Td Jakes",
      church: "Potter's House",
      message: "Wonderful. Brilliant system for church management.",
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

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let index = 0;

    const interval = setInterval(() => {
      index++;

      if (index >= testimonials.length) {
        index = 0;
      }

      const card = container.children[index];

      if (card) {
        container.scrollTo({
          left: card.offsetLeft - 20,
          behavior: "smooth",
        });
      }
    }, 2000); // 👉 toutes les 2 secondes

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-28 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto space-y-12">

        <h2 className="text-3xl font-bold text-center">
          Ce que disent les responsables
        </h2>

        {/* CAROUSEL */}
        <div
          ref={containerRef}
          className="flex gap-6 overflow-x-auto scroll-smooth px-2 pb-4"
        >
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="min-w-[320px] bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition flex-shrink-0"
            >
              <Image
                src={t.avatar}
                alt={t.name}
                width={60}
                height={60}
                className="rounded-full mx-auto mb-4"
              />

              <p className="text-gray-600 italic mb-4 text-center">
                "{t.message}"
              </p>

              <div className="text-center font-semibold">{t.name}</div>
              <div className="text-sm text-gray-500 text-center">
                {t.church}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
