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
    <button
      onClick={handleLogout}
      className="text-sm sm:text-base text-white cursor-pointer hover:text-yellow-300 transition-all duration-200"
    >
      Déconnexion
    </button>
  );
}
