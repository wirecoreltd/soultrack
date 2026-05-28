"use client";

export default function Footer() {
  return (
    <footer className="w-full py-4 mt-5">
      <div className="max-w-5xl mx-auto flex items-center justify-center gap-2">
        <a
          href="https://www.soultrack.org"
          target="_blank"
          rel="noopener noreferrer"
          className="opacity-60 hover:opacity-90 transition-opacity"
        >
          <img
            src="/logo.png"
            alt="SoulTrack"
            style={{ width: 28, height: 28, objectFit: "contain" }}
          />
        </a>
        <p className="text-xs" style={{ color: "#c8d0f0" }}>
          © {new Date().getFullYear()} SoulTrack. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
