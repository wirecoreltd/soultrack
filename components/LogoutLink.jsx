"use client";
import { useRouter } from "next/router";

export default function LogoutLink({ className = "" }) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    router.push("/login");
  };

  return (
    <p
      onClick={handleLogout}
      className={`text-sm text-white mt-2 cursor-pointer hover:underline ${className}`}
    >
      Se déconnecter
    </p>
  );
}
