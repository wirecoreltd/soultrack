"use client";

export default function Footer() {
  return (
    <footer className="w-full bg-[#333699] text-white py-4 mt-auto">
      <div className="max-w-5xl mx-auto text-center text-sm">
        © {new Date().getFullYear()} SoulTrack. Tous droits réservés.
    <a href="mailto:support@soultrack.com" className="hover:underline">
          Contact : support@soultrack.com
        </a>
      </div>
    </footer>
  );
}
