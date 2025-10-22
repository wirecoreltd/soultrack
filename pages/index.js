// ✅ pages/index.js - Home page //

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import LogoutLink from "../components/LogoutLink";

export default function HomePage() {
  const router = useRouter();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedRoles = localStorage.getItem("userRole");

    if (!storedRoles) {
      router.push("/login");
      return;
    }

    try {
      const parsedRoles = JSON.parse(storedRoles);
      if (Array.isArray(parsedRoles)) {
        setRoles(parsedRoles.map(r => r.trim()));
      } else {
        setRoles([parsedRoles.trim()]);
      }
    } catch {
      setRoles([storedRoles.trim()]);
    }

    setLoading(false);
  }, [router]);

  if (loading) return <div className="text-center mt-20">Chargement...</div>;

  const hasRole = (role) => roles.includes(role);
  const handleRedirect = (path) => router.push(path);

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center p-6 text-center"
      style={{
        background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)",
      }}
    >
      <div className="absolute top-4 right-4">
        <LogoutLink />
      </div>

      <div className="mb-4">
        <Image src="/logo.png" alt="SoulTrack Logo" width={90} height={90} />
      </div>

      <h1 className="text-5xl sm:text-5xl font-handwriting text-white mb-2">
        SoulTrack
      </h1>

      <p className="text-white text-lg font-handwriting-light max-w-2xl mb-8">
        Chaque personne a une valeur infinie. Ensemble, nous avançons, nous
        grandissons, et nous partageons l’amour de Christ dans chaque action ❤️
      </p>

      <div className="flex flex-col md:flex-row flex-wrap gap-4 justify-center items-center w-full max-w-4xl mb-10">
        {(hasRole("ResponsableIntegration") || hasRole("Admin")) && (
          <div
            className="flex-1 min-w-[250px] w-full h-32 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center border-t-4 border-blue-500 p-3 hover:shadow-lg transition-all duration-200 cursor-pointer"
            onClick={() => handleRedirect("/membres-hub")}
          >
            <div className="text-4xl mb-1">👤</div>
            <div className="text-lg font-bold text-gray-800">
              Suivis des membres
            </div>
          </div>
        )}

        {(hasRole("ResponsableEvangelisation") || hasRole("Admin")) && (
          <div
            className="flex-1 min-w-[250px] w-full h-32 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center border-t-4 border-green-500 p-3 hover:shadow-lg transition-all duration-200 cursor-pointer"
            onClick={() => handleRedirect("/evangelisation-hub")}
          >
            <div className="text-4xl mb-1">🙌</div>
            <div className="text-lg font-bold text-gray-800">
              Évangélisation
            </div>
          </div>
        )}

        {(hasRole("ResponsableCellule") || hasRole("Admin")) && (
          <div
            className="flex-1 min-w-[250px] w-full h-32 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center border-t-4 border-purple-500 p-3 hover:shadow-lg transition-all duration-200 cursor-pointer"
            onClick={() => handleRedirect("/cellules-hub")}
          >
            <div className="text-4xl mb-1">🏠</div>
            <div className="text-lg font-bold text-gray-800">Cellule</div>
          </div>
        )}

        {hasRole("Admin") && (
          <>
            <div
              className="flex-1 min-w-[250px] w-full h-32 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center border-t-4 border-red-500 p-3 hover:shadow-lg transition-all duration-200 cursor-pointer"
              onClick={() => handleRedirect("/rapport")}
            >
              <div className="text-4xl mb-1">📊</div>
              <div className="text-lg font-bold text-gray-800">Rapport</div>
            </div>

            <div
              className="flex-1 min-w-[250px] w-full h-32 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center border-t-4 border-blue-400 p-3 hover:shadow-lg transition-all duration-200 cursor-pointer"
              onClick={() => handleRedirect("/administrateur")}
            >
              <div className="text-4xl mb-1">🧑‍💻</div>
              <div className="text-lg font-bold text-gray-800">Admin</div>
            </div>
          </>
        )}
      </div>

      <div className="text-white text-lg font-handwriting-light max-w-2xl">
        Car le corps ne se compose pas d’un seul membre, mais de plusieurs. <br />
        1 Corinthiens 12:14 ❤️
      </div>
    </div>
  );
}
