"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function TestimonialsSection() {
  const testimonials = [
    { name: "Past. Jean", church: "Église Bethel", message: "Avant SoulTrack...", avatar: "/avatar1.png" },
    { name: "Past. Marie", church: "Église Grâce", message: "Je peux enfin voir...", avatar: "/avatar2.png" },
    { name: "Past. Paul", church: "Église Agape", message: "Excellent outil...", avatar: "/avatar3.png" },
    { name: "Bishop John", church: "Potter House", message: "Wonderful system...", avatar: "/avatar2.png" },
    { name: "Samuel", church: "Église Lumière", message: "Tableau de bord...", avatar: "/avatar3.png" },
  ];

  const CARD_WIDTH = 300;
  const [index, setIndex] = useState(0);
  const trackRef = useRef(null);

  const looped = [...testimonials, ...testimonials];
  const max = testimonials.length;

  // auto scroll
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => prev + 1);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // reset invisible
  useEffect(() => {
    if (index >= max) {
      setTimeout(() => {
        if (trackRef.current) {
          trackRef.current.style.transition = "none";
          setIndex(0);

          requestAnimationFrame(() => {
            trackRef.current.style.transition =
              "transform 700ms ease-in-out";
          });
        }
      }, 700);
    }
  }, [index]);

  const prev = () => setIndex((p) => Math.max(p - 1, 0));
  const next = () => setIndex((p) => p + 1);

  return (
    <section className="py-24 bg-gray-50 overflow-hidden relative">

      {/* TITLE */}
      <div className="max-w-6xl mx-auto text-center mb-12">
        <h2 className="text-3xl font-bold">
          Ce que disent les responsables
        </h2>
      </div>

      {/* CAROUSEL WRAPPER */}
      <div className="relative max-w-[900px] mx-auto">

        {/* LEFT ARROW */}
        <button
          onClick={prev}
          className="absolute left-[-50px] top-1/2 -translate-y-1/2 bg-white shadow-md rounded-full w-10 h-10 flex items-center justify-center hover:scale-110 transition z-10"
        >
          ◀
        </button>

        {/* RIGHT ARROW */}
        <button
          onClick={next}
          className="absolute right-[-50px] top-1/2 -translate-y-1/2 bg-white shadow-md rounded-full w-10 h-10 flex items-center justify-center hover:scale-110 transition z-10"
        >
          ▶
        </button>

        {/* VIEWPORT */}
        <div className="overflow-hidden px-8">

          <div
            ref={trackRef}
            className="flex transition-transform duration-700 ease-in-out"
            style={{
              transform: `translateX(-${index * CARD_WIDTH}px)`,
            }}
          >
            {looped.map((t, i) => {
              const isCenter = i === index + 1;

              return (
                <div key={i} className="flex-shrink-0 w-[300px] px-3">
                  <div
                    className={`bg-white p-6 rounded-2xl shadow-sm transition-all duration-500
                    ${isCenter ? "scale-110 shadow-xl" : "scale-95 opacity-80"}`}
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
      </div>
    </section>
  );
}
