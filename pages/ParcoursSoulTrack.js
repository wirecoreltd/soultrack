"use client";

import { useRouter } from "next/navigation";

export default function AddMemberTimeline() {
  const router = useRouter();

  return (
    <section className="py-20 bg-white">
      <div className="max-w-5xl mx-auto px-6 text-center">
        
        {/* Titre section */}
        <h2 className="text-3xl font-bold text-blue-700 mb-16">
          Ajouter et suivre les membres
        </h2>

        {/* Timeline container */}
        <div className="relative flex flex-col items-center">

          {/* Ligne horizontale */}
          <div className="absolute top-10 w-full h-1 bg-blue-200"></div>

          {/* Cercle étape */}
          <div className="relative z-10 bg-blue-600 text-white w-20 h-20 rounded-full flex items-center justify-center shadow-xl text-3xl">
            👤➕
          </div>

          {/* Contenu en dessous */}
          <div className="mt-12 max-w-xl bg-blue-50 p-8 rounded-2xl shadow-lg">
            
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Add Member
            </h3>

            <p className="text-gray-700 mb-6">
              Ajoutez un nouveau membre et assignez-le à un conseiller 
              ou responsable de cellule pour suivre son parcours spirituel.
            </p>

            <button
              onClick={() => router.push("/members")}
              className="bg-gradient-to-r from-blue-500 to-amber-400 text-white font-semibold px-6 py-3 rounded-xl shadow-md hover:scale-105 transition"
            >
              Voir la liste des membres
            </button>

            <p className="text-sm text-gray-500 mt-4">
              Suivi individuel par responsable et suivi global pour l’église.
            </p>

          </div>
        </div>

      </div>
    </section>
  );
}
