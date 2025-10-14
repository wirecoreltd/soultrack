//components/LogoutLink.js //
"use client";

import { useRouter } from "next/router";

export default function LogoutLink() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    router.push("/login");
  };

  return (
    <p
      onClick={handleLogout}
      className="absolute top-4 right-6 text-sm sm:text-base text-white font-semibold cursor-pointer hover:text-yellow-300 transition-all duration-200"
    >
      Déconnexion
    </p>
  );
}
