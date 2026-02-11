"use client";

export default function Footer() {
  return (
    <footer className="w-full bg-[#222244] text-white py-4 mt-10">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center text-sm px-4">
        <span>© 2026 SoulTrack. Tous droits réservés.</span>
        <span>Version 1.0.3</span>
        <a href="mailto:support@soultrack.com" className="hover:underline">
          Contact : support@soultrack.com
        </a>
      </div>
    </footer>
  );
}
