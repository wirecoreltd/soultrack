"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function TestimonialsSection() {
  const testimonials = [
    { name: "Past. Jean", church: "Église Bethel", message: "Avant SoulTrack, nous perdions la visibilité sur plusieurs membres.", avatar: "/avatar1.png" },
    { name: "Past. Marie", church: "Église Grâce", message: "Je peux enfin voir la réalité spirituelle de mon église.", avatar: "/avatar2.png" },
    { name: "Past. Paul", church: "Église Agape", message: "Excellent outil pour structurer notre ministère.", avatar: "/avatar3.png" },
    { name: "Bishop John", church: "Potter House", message: "Wonderful system for church management.", avatar: "/avatar2.png" },
    { name: "Samuel", church: "Église Lumière", message: "C’est devenu notre tableau de bord pastoral.", avatar: "/avatar3.png" },
  ];

  const [index, setIndex] = useState(0);

  const VISIBLE = 3;
  const max = testimonials.length;

  // 👉 auto move TOUJOURS vers la droite
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % max);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const next = () => setIndex((prev) => (prev + 1) % max);
  const prev = () => setIndex((prev) => (prev - 1 + max) % max);

  // 👉 duplication pour effet infini propre
  const looped = [...testimonials, ...testimonials];

  const CARD_WIDTH = 100 / VISIBLE; // 3 cartes visibles

  return (
    <section className="py-24 bg-gray-50 overflow-hidden">
      <div className="max-w-6xl mx-auto text-center mb-12">
        <h2 className="text-3xl font-bold">
          Ce que disent les responsables
        </h2>
      </div>

      <div className="relative max-w-6xl mx-auto px-16">

        {/* LEFT */}
        <button
          onClick={prev}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white shadow-lg w-10 h-10 rounded-full flex items-center justify-center z-20"
        >
          ←
        </button>

        {/* RIGHT */}
        <button
          onClick={next}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white shadow-lg w-10 h-10 rounded-full flex items-center justify-center z-20"
        >
          →
        </button>

        {/* VIEWPORT */}
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{
              transform: `translateX(-${index * (100 / VISIBLE)}%)`,
              width: `${(looped.length / VISIBLE) * 100}%`,
            }}
          >
            {looped.map((t, i) => {
              const isActive = i === index + 1;

              return (
                <div
                  key={i}
                  style={{ width: `${CARD_WIDTH}%` }}
                  className={`px-3 transition-all duration-500
                    ${isActive ? "scale-105" : "scale-95 opacity-80"}
                  `}
                >
                  <div className="bg-white p-6 rounded-2xl shadow-sm h-full">
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
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
