/* pages/evangelisation-hub.js */
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";

export default function EvangelisationHub() {
  const router = useRouter();

  return (
    <div
      className="min-h-screen flex flex-col items-center p-6"
      style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}
    >
      {/* Top bar: Flèche retour + logo */}
      <div className="w-full max-w-5xl flex justify-between items-center mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center text-white font-semibold hover:text-gray-200 transition-colors"
        >
          ← Retour
        </button>
        <Image src="/logo.png" alt="SoulTrack Logo" width={50} height={50} />
      </div>

      {/* Titre */}
      <h1 className="text-3xl font-login text-white mb-6 text-center">
        Évangélisation
      </h1>

      {/* Cartes principales */}
      <div className="flex flex-col md:flex-row gap-6 justify-center w-full max-w-5xl">
        {/* Ajouter un évangélisé */}
        <Link
          href="/add-evangelise"
          className="flex-1 bg-white rounded-3xl shadow-md flex flex-col justify-center items-center border-t-4 border-[#4285F4] p-6 hover:shadow-xl transition-all duration-200 cursor-pointer h-32"
        >
          <div className="text-5xl mb-2">➕</div>
          <div className="text-lg font-bold text-gray-800 text-center">Ajouter un évangélisé</div>
        </Link>

        {/* Liste des évangélisés */}
        <Link
          href="/evangelisation"
          className="flex-1 bg-white rounded-3xl shadow-md flex flex-col justify-center items-center border-t-4 border-[#34a853] p-6 hover:shadow-xl transition-all duration-200 cursor-pointer h-32"
        >
          <div className="text-5xl mb-2">👥</div>
          <div className="text-lg font-bold text-gray-800 text-center">Liste des évangélisés</div>
        </Link>

        {/* Suivis des évangélisés */}
        <Link
          href="/suivis-evangelisation"
          className="flex-1 bg-white rounded-3xl shadow-md flex flex-col justify-center items-center border-t-4 border-[#ff9800] p-6 hover:shadow-xl transition-all duration-200 cursor-pointer h-32"
        >
          <div className="text-5xl mb-2">📋</div>
          <div className="text-lg font-bold text-gray-800 text-center">Suivis des évangélisés</div>
        </Link>
      </div>

      {/* Verset biblique */}
      <div className="mt-auto mb-4 text-center text-white text-lg font-handwriting max-w-2xl">
        Car le corps ne se compose pas d’un seul membre, mais de plusieurs. <br />
        1 Corinthiens 12:14 ❤️
      </div>
    </div>
  );
}
