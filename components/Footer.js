"use client";

export default function Footer() {
  return (
    <footer className="w-full py-4 mt-auto">
      <div className="max-w-5xl mx-auto flex flex-col items-center gap-1">
        <a
          href="https://www.soultrack.org"
          target="_blank"
          rel="noopener noreferrer"
          className="opacity-50 hover:opacity-80 transition-opacity"
        >
          <img
            src="/logo.png"
            alt="SoulTrack"
            style={{ width: 22, height: 22, objectFit: "contain" }}
          />
        </a>
        <p className="text-xs" style={{ color: "#6b7fc4" }}>
          © {new Date().getFullYear()} SoulTrack. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
