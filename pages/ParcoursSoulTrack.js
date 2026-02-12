"use client";

export default function FlowchartProcess() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6 text-center">
        
        {/* Titel */}
        <h2 className="text-3xl font-bold text-blue-700 mb-12">
          Comment fonctionne SoulTrack
        </h2>

        {/* Flowchart */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">

          {/* Step 1 */}
          <div className="flex flex-col items-center md:w-1/3">
            <div className="bg-blue-500 text-white rounded-full p-6 shadow-lg">
              <span className="text-4xl font-bold">1</span>
            </div>
            <h3 className="mt-4 text-xl font-semibold text-gray-900">
              Saisie & Attribution
            </h3>
            <p className="text-gray-600 mt-2">
              Ajouter membres & évangélisés, puis les attribuer aux conseillers ou responsables de cellule.
            </p>
          </div>

          {/* Arrow */}
          <div className="hidden md:block w-12 border-t-4 border-blue-300"></div>

          {/* Step 2 */}
          <div className="flex flex-col items-center md:w-1/3">
            <div className="bg-amber-500 text-white rounded-full p-6 shadow-lg">
              <span className="text-4xl font-bold">2</span>
            </div>
            <h3 className="mt-4 text-xl font-semibold text-gray-900">
              Visualisation & Détails
            </h3>
            <p className="text-gray-600 mt-2">
              Liste des membres avec cartes individuelles, photos et infos pour un suivi approfondi.
            </p>
          </div>

          {/* Arrow */}
          <div className="hidden md:block w-12 border-t-4 border-amber-300"></div>

          {/* Step 3 */}
          <div className="flex flex-col items-center md:w-1/3">
            <div className="bg-purple-500 text-white rounded-full p-6 shadow-lg">
              <span className="text-4xl font-bold">3</span>
            </div>
            <h3 className="mt-4 text-xl font-semibold text-gray-900">
              Suivi & Administration
            </h3>
            <p className="text-gray-600 mt-2">
              Suivi global des activités (présence, évangélisation, baptême) et gestion des accès administratifs.
            </p>
          </div>

        </div>

        {/* Mobile arrows */}
        <div className="md:hidden mt-8 flex flex-col gap-6 items-center">
          <div className="border-t-4 border-blue-300 w-1/4"></div>
          <div className="border-t-4 border-amber-300 w-1/4"></div>
        </div>

      </div>
    </section>
  );
}
