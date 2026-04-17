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

  // AUTO ROTATION → toujours vers la droite
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % max);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const prev = () => setIndex((prev) => (prev - 1 + max) % max);
  const next = () => setIndex((prev) => (prev + 1) % max);

  // 👉 récupérer 3 cartes autour de l’index
  const getItem = (i) => testimonials[(i + max) % max];

  const left = getItem(index - 1);
  const center = getItem(index);
  const right = getItem(index + 1);

  const Card = ({ item, isCenter }) => (
    <div
      className={`transition-all duration-700 ease-in-out transform
        ${isCenter ? "scale-110 z-10" : "scale-95 opacity-70"}
      `}
    >
      <div className="bg-white p-6 rounded-2xl shadow-md w-[280px]">
        <Image
          src={item.avatar}
          alt={item.name}
          width={60}
          height={60}
          className="rounded-full mx-auto mb-4"
        />

        <p className="text-gray-600 italic text-sm mb-4 text-center">
          "{item.message}"
        </p>

        <div className="font-semibold text-center">{item.name}</div>
        <div className="text-xs text-gray-500 text-center">
          {item.church}
        </div>
      </div>
    </div>
  );

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto text-center mb-12">
        <h2 className="text-3xl font-bold">
          Ce que disent les responsables
        </h2>
      </div>

      <div className="relative flex items-center justify-center gap-6">

        {/* LEFT */}
        <button
          onClick={prev}
          className="absolute left-4 bg-white shadow-lg w-10 h-10 rounded-full flex items-center justify-center"
        >
          ←
        </button>

        {/* 3 CARDS FIXES */}
        <div className="flex items-center gap-6">
          <Card item={left} isCenter={false} />
          <Card item={center} isCenter={true} />
          <Card item={right} isCenter={false} />
        </div>

        {/* RIGHT */}
        <button
          onClick={next}
          className="absolute right-4 bg-white shadow-lg w-10 h-10 rounded-full flex items-center justify-center"
        >
          →
        </button>
      </div>
    </section>
  );
}
