"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function PublicHeader() {
  const router = useRouter();
  const [openMenu, setOpenMenu] = useState(false);

  const navItems = [
    { label: "Accueil", path: "/HomePage" },
    { label: "Process", path: "/CommentCaMarche" },
    { label: "À propos", path: "/about" },
    { label: "Pricing", path: "/pricing" },
    { label: "Contact", path: "/contact" },
  ];

  return (
    <header className="w-full bg-white shadow-md">
      <div className="max-w-6xl mx-auto flex justify-between items-center p-4">
        {/* Logo */}
        <div
          className="flex items-center cursor-pointer"
          onClick={() => router.push("/HomePage")}
        >
          <Image src="/logo.png" alt="Logo SoulTrack" width={50} height={50} />
          <span className="ml-3 text-2xl font-bold text-gray-800">SoulTrack</span>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <span
              key={item.label}
              onClick={() => router.push(item.path)}
              className="cursor-pointer text-gray-700 hover:text-blue-500 font-semibold transition"
            >
              {item.label}
            </span>
          ))}

          <button
            onClick={() => router.push("/login")}
            className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-2xl hover:bg-blue-600 transition font-semibold"
          >
            Connexion
          </button>

          <button
            onClick={() => router.push("/SignupEglise")}
            className="ml-2 px-4 py-2 border border-blue-500 text-blue-500 rounded-2xl hover:bg-blue-500 hover:text-white transition font-semibold"
          >
            Inscription
          </button>
        </nav>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setOpenMenu(!openMenu)}
            className="text-gray-700 focus:outline-none"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {openMenu && (
        <div className="md:hidden bg-white shadow-md px-4 pb-4 flex flex-col gap-2">
          {navItems.map((item) => (
            <span
              key={item.label}
              onClick={() => {
                router.push(item.path);
                setOpenMenu(false);
              }}
              className="cursor-pointer text-gray-700 hover:text-blue-500 font-semibold transition"
            >
              {item.label}
            </span>
          ))}

          <button
            onClick={() => {
              router.push("/login");
              setOpenMenu(false);
            }}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-2xl hover:bg-blue-600 transition font-semibold"
          >
            Connexion
          </button>

          <button
            onClick={() => {
              router.push("/SignupEglise");
              setOpenMenu(false);
            }}
            className="mt-2 px-4 py-2 border border-blue-500 text-blue-500 rounded-2xl hover:bg-blue-500 hover:text-white transition font-semibold"
          >
            Inscription
          </button>
        </div>
      )}
    </header>
  );
}
