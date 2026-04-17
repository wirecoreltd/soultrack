"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

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

  const CARD_WIDTH = 300;
  const SPEED = 1; // 1 step = 1 card

  const [index, setIndex] = useState(0);
  const trackRef = useRef(null);

  const looped = [...testimonials, ...testimonials];
  const max = testimonials.length;

  // 👉 mouvement automatique toujours dans le même sens (→ visuel fluide)
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => prev + SPEED);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // 👉 reset invisible (clé du carousel infini parfait)
  useEffect(() => {
    if (index >= max) {
      // attendre fin animation
      setTimeout(() => {
        if (trackRef.current) {
          trackRef.current.style.transition = "none";
        }

        setIndex(0);

        // réactiver transition après reset
        requestAnimationFrame(() => {
          if (trackRef.current) {
            trackRef.current.style.transition =
              "transform 700ms ease-in-out";
          }
        });
      }, 700);
    }
  }, [index]);

  return (
    <section className="py-24 bg-gray-50 overflow-hidden">
      <div className="max-w-6xl mx-auto text-center mb-12">
        <h2 className="text-3xl font-bold">
          Ce que disent les responsables
        </h2>
      </div>

      <div className="relative max-w-6xl mx-auto overflow-hidden px-10">
        <div
          ref={trackRef}
          className="flex gap-6"
          style={{
            transform: `translateX(-${index * CARD_WIDTH}px)`,
            transition: "transform 700ms ease-in-out",
          }}
        >
          {looped.map((t, i) => {
            const isCenter = i === index + 1;

            return (
              <div
                key={i}
                className={`flex-shrink-0 w-[260px] bg-white p-6 rounded-2xl shadow-sm transition-all duration-500
                ${isCenter ? "scale-110 shadow-xl z-10" : "scale-95 opacity-80"}`}
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
