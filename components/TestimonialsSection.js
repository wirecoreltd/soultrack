"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

export default function TestimonialsSection() {
  const containerRef = useRef(null);

  const testimonials = [
    {
      name: "Past. Jean",
      church: "Église Bethel",
      message:
        "Avant SoulTrack, nous perdions la visibilité sur plusieurs membres.",
      avatar: "/avatar1.png",
    },
    {
      name: "Past. Marie",
      church: "Église Grâce",
      message:
        "Je peux enfin voir la réalité spirituelle de mon église.",
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
      message:
        "C’est devenu notre tableau de bord pastoral.",
      avatar: "/avatar3.png",
    },
  ];

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let scrollAmount = 0;

    const speed = 1; // vitesse

    const interval = setInterval(() => {
      scrollAmount += speed;

      if (
        scrollAmount >=
        container.scrollWidth / 2
      ) {
        scrollAmount = 0;
      }

      container.scrollLeft = scrollAmount;
    }, 20);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-24 bg-gray-50 overflow-hidden">
      <div className="max-w-6xl mx-auto text-center mb-12">
        <h2 className="text-3xl font-bold">
          Ce que disent les responsables
        </h2>
      </div>

      {/* CAROUSEL */}
      <div className="relative overflow-hidden">
        <div
          ref={containerRef}
          className="flex gap-6 w-max"
        >
          {[...testimonials, ...testimonials].map((t, i) => (
            <div
              key={i}
              className="w-[280px] flex-shrink-0 bg-white p-6 rounded-2xl shadow-sm"
            >
              <Image
                src={t.avatar}
                alt={t.name}
                width={60}
                height={60}
                className="rounded-full mx-auto mb-4"
              />

              <p className="text-gray-600 italic text-sm mb-4">
                "{t.message}"
              </p>

              <div className="font-semibold text-center">
                {t.name}
              </div>
              <div className="text-xs text-gray-500 text-center">
                {t.church}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
