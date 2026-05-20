"use client";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full py-6 mt-auto">
      <div className="max-w-5xl mx-auto text-center text-sm text-gray-400 space-y-2">

        <div>
          © {new Date().getFullYear()} SoulTrack. Tous droits réservés.
        </div>

        <div className="flex justify-center gap-4 text-blue-300 underline">
          <Link href="/site/terms">Terms of Service</Link>
          <Link href="/site/privacy">Privacy Policy</Link>
          <Link href="/site/refund">Refund Policy</Link>
        </div>

      </div>
    </footer>
  );
}
