"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

  const [index, setIndex] = useState(0);

  const prev = () => {
    setIndex((i) => (i === 0 ? testimonials.length - 1 : i - 1));
  };

  const next = () => {
    setIndex((i) => (i === testimonials.length - 1 ? 0 : i + 1));
  };

  const t = testimonials[index];

  return (
    <section className="py-28 px-6 bg-gray-50">
      <div className="max-w-4xl mx-auto text-center space-y-10">

        <h2 className="text-3xl font-bold">
          Ce que disent les responsables
        </h2>

        {/* CAROUSEL BOX */}
        <div className="relative bg-white rounded-2xl shadow-md p-10 transition-all duration-300">

          {/* LEFT BUTTON */}
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-gray-100 hover:bg-gray-200 p-2 rounded-full"
          >
            <ChevronLeft />
          </button>

          {/* RIGHT BUTTON */}
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-gray-100 hover:bg-gray-200 p-2 rounded-full"
          >
            <ChevronRight />
          </button>

          {/* CONTENT */}
          <div className="space-y-4 px-10">
            <Image
              src={t.avatar}
              alt={t.name}
              width={70}
              height={70}
              className="rounded-full mx-auto"
            />

            <p className="text-gray-600 italic text-lg">
              "{t.message}"
            </p>

            <div className="font-semibold">{t.name}</div>
            <div className="text-sm text-gray-500">{t.church}</div>
          </div>

        </div>

        {/* DOTS */}
        <div className="flex justify-center gap-2">
          {testimonials.map((_, i) => (
            <div
              key={i}
              className={`h-2 w-2 rounded-full transition ${
                i === index ? "bg-blue-600 w-4" : "bg-gray-300"
              }`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
