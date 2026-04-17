"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function TestimonialsSection() {
  const testimonials = [
    { name: "Past. Jean", church: "Église Bethel", message: "Avant SoulTrack...", avatar: "/avatar1.png" },
    { name: "Past. Marie", church: "Église Grâce", message: "Je peux enfin voir...", avatar: "/avatar2.png" },
    { name: "Past. Paul", church: "Église Agape", message: "Excellent outil...", avatar: "/avatar3.png" },
    { name: "Bishop John", church: "Potter House", message: "Wonderful system...", avatar: "/avatar2.png" },
    { name: "Samuel", church: "Église Lumière", message: "Tableau de bord...", avatar: "/avatar3.png" },
  ];

  const [index, setIndex] = useState(0);
  const max = testimonials.length;

  const VISIBLE = 3;

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % max);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const next = () => setIndex((prev) => (prev + 1) % max);
  const prev = () => setIndex((prev) => (prev - 1 + max) % max);

  // duplication pour effet infini fluide
  const looped = [...testimonials, ...testimonials];

  const CARD_PERCENT = 100 / VISIBLE;

  return (
    <section className="py-24 bg-gray-50 overflow-hidden">
      <div className="max-w-6xl mx-auto text-center mb-12">
        <h2 className="text-3xl font-bold">
          Ce que disent les responsables
        </h2>
      </div>

      {/* WRAPPER */}
      <div className="relative max-w-5xl mx-auto px-10">

        {/* VIEWPORT */}
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{
              transform: `translateX(-${index * CARD_PERCENT}%)`,
              width: `${(looped.length / VISIBLE) * 100}%`,
            }}
          >
            {looped.map((t, i) => {
              const isCenter = i === index + 1;

              return (
                <div
                  key={i}
                  style={{ width: `${CARD_PERCENT}%` }}
                  className="px-3 flex justify-center"
                >
                  <div
                    className={`bg-white p-6 rounded-2xl shadow-md w-[260px] transition-all duration-500
                      ${isCenter ? "scale-110" : "scale-95 opacity-70"}
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
                </div>
              );
            })}
          </div>
        </div>

        {/* 🔥 FLÈCHES PLUS PROCHE DES CARTES */}
        <button
          onClick={prev}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white shadow-lg w-10 h-10 rounded-full flex items-center justify-center z-20"
        >
          ←
        </button>

        <button
          onClick={next}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white shadow-lg w-10 h-10 rounded-full flex items-center justify-center z-20"
        >
          →
        </button>
      </div>
    </section>
  );
}
