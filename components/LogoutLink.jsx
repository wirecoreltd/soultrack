import LogoutLink from "../components/LogoutLink"; // ✅ on l’importe en haut

export default function HomePage() {
  // ton code...

  return (
    <div className="min-h-screen flex flex-col items-center justify-between p-6 gap-2">
      
      {/* Logo */}
      <div className="mt-1">
        <Image src="/logo.png" alt="SoulTrack Logo" width={80} height={80} />
      </div>

      {/* Titre + Déconnexion */}
      <div className="flex flex-col items-center mt-2">
        <h1 className="text-5xl sm:text-5xl font-handwriting text-white text-center">
          SoulTrack
        </h1>

        {/* 🔵 ICI tu mets ton texte cliquable de déconnexion */}
        <LogoutLink />
      </div>

      {/* le reste de ton contenu... */}
    </div>
  );
}
