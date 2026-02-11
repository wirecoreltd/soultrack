"use client";

export default function Footer() {
  return (
    <footer className="w-full py-4 mt-auto">
      <div
        className="max-w-5xl mx-auto text-center text-sm"
        style={{ color: "#808080" }}
      >
        © {new Date().getFullYear()} SoulTrack. Tous droits réservés.
      </div>
    </footer>
  );
}
