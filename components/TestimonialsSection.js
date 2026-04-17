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

  const [startIndex, setStartIndex] = useState(0);

  // auto slide toutes les 5 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      setStartIndex((prev) =>
        (prev + 1) % testimonials.length
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [testimonials.length]);

  // fonction pour récupérer 4 éléments visibles
  const getVisible = () => {
    const result = [];
    for (let i = 0; i < 4; i++) {
      result.push(testimonials[(startIndex + i) % testimonials.length]);
    }
    return result;
  };

  const visible = getVisible();

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto text-center mb-12">
        <h2 className="text-3xl font-bold">
          Ce que disent les responsables
        </h2>
      </div>

      {/* CAROUSEL */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 px-6">

        {visible.map((t, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-2xl shadow-sm transition-all duration-700"
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

            <div className="font-semibold text-center">
              {t.name}
            </div>
            <div className="text-xs text-gray-500 text-center">
              {t.church}
            </div>
          </div>
        ))}

      </div>
    </section>
  );
}
