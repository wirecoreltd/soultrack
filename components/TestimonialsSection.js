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

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // 🔥 4 éléments visibles propres (sans coupe)
  const getVisible = () => {
    const res = [];
    for (let i = 0; i < 4; i++) {
      res.push(testimonials[(index + i) % testimonials.length]);
    }
    return res;
  };

  const visible = getVisible();

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto text-center mb-12">
        <h2 className="text-3xl font-bold">
          Ce que disent les responsables
        </h2>
      </div>

      {/* VIEWPORT FIXE */}
      <div className="max-w-6xl mx-auto overflow-hidden px-4">

        {/* GRID 4 COLONNES STRICTES */}
        <div className="grid grid-cols-4 gap-6">

          {visible.map((t, i) => {
            const isCenter = i === 1; // carte focus (2e position)

            return (
              <div
                key={i}
                className={`bg-white p-6 rounded-2xl shadow-sm transition-all duration-500
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
    </section>
  );
}
