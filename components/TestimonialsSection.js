"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: "Past. Jean",
      church: "Église Bethel",
      message: "Avant SoulTrack, nous perdions la visibilité sur plusieurs membres.",
      avatar: "/avatar1.png",
    },
    {
      name: "Past. Marie",
      church: "Église Grâce",
      message: "Je peux enfin voir la réalité spirituelle de mon église.",
      avatar: "/avatar2.png",
    },
    {
      name: "Past. Paul",
      church: "Église Agape",
      message: "Excellent outil pour structurer notre ministère.",
      avatar: "/avatar3.png",
    },
    {
      name: "Bishop John",
      church: "Potter House",
      message: "Wonderful system for church management.",
      avatar: "/avatar2.png",
    },
    {
      name: "Samuel",
      church: "Église Lumière",
      message: "C’est devenu notre tableau de bord pastoral.",
      avatar: "/avatar3.png",
    },
  ];

  const [index, setIndex] = useState(0);

  const CARD_WIDTH = 300;

  const max = testimonials.length;

  // 👉 AUTO (droite → gauche visuel)
  useEffect(() => {
    const interval = setInterval(() => {
      next();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // 👉 droite → gauche (visuel)
  const next = () => {
    setIndex((prev) => (prev + 1) % max);
  };

  // 👉 gauche → droite
  const prev = () => {
    setIndex((prev) => (prev - 1 + max) % max);
  };

  const looped = [...testimonials, ...testimonials];

  return (
    <section className="py-24 bg-gray-50 overflow-hidden">
      
      <div className="max-w-6xl mx-auto text-center mb-12">
        <h2 className="text-3xl font-bold">
          Ce que disent les responsables
        </h2>
      </div>

      {/* WRAPPER */}
      <div className="relative max-w-6xl mx-auto px-20">

        {/* FLÈCHE GAUCHE (décollée) */}
        <button
          onClick={prev}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white shadow-lg rounded-full w-11 h-11 flex items-center justify-center hover:scale-110 transition z-20"
        >
          ←
        </button>

        {/* FLÈCHE DROITE (décollée) */}
        <button
          onClick={next}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white shadow-lg rounded-full w-11 h-11 flex items-center justify-center hover:scale-110 transition z-20"
        >
          →
        </button>

        {/* VIEWPORT */}
        <div className="overflow-hidden">

          {/* TRACK */}
          <div
            className="flex gap-6 transition-transform duration-700 ease-in-out"
            style={{
              transform: `translateX(-${index * CARD_WIDTH}px)`,
            }}
          >

            {looped.map((t, i) => {
              const isCenter = i === index + 1;

              return (
                <div
                  key={i}
                  className={`flex-shrink-0 w-[260px] bg-white p-6 rounded-2xl shadow-sm transition-all duration-500
                    ${isCenter ? "scale-110 shadow-xl z-10" : "scale-95 opacity-80"}
                  `}
                >
                  <Image
                    src={t.avatar}
                    alt={t.name}
                    width={60}
                    height={60}
                    className="rounded-full mx-auto mb-4"
                  />

                  <p className="text-gray-600 italic text-sm mb-4 text-center">
                    "{t.message}"
                  </p>

                  <div className="font-semibold text-center">{t.name}</div>
                  <div className="text-xs text-gray-500 text-center">
                    {t.church}
                  </div>
                </div>
              );
            })}

          </div>
        </div>
      </div>
    </section>
  );
}
