"use client";

import { useRouter } from "next/navigation";
import PublicHeader from "../../components/PublicHeader";
import Footer from "../../components/Footer";

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="bg-white text-gray-900">

      <PublicHeader />

      {/* HERO */}
      <section className="relative pt-28 pb-28 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white text-center px-6">

        <div className="max-w-4xl mx-auto space-y-6">

          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            Voir son troupeau. Comprendre son état. Guider chaque âme.
          </h1>

          <p className="text-lg text-white/80">
            SoulTrack connecte chaque dimension de l’église :
            membres, cellules, conseillers, évangélisation et structure globale.
          </p>

          <p className="text-white/60 italic">
            Un seul système. Une vision complète du troupeau.
          </p>

          <div className="flex gap-4 justify-center pt-4 flex-col md:flex-row">
            <button
              onClick={() => router.push("/SignupEglise")}
              className="bg-white text-blue-900 px-8 py-3 rounded-xl font-semibold"
            >
              Créer mon église
            </button>

            <button
              onClick={() => router.push("/comment-ca-marche")}
              className="border border-white/30 px-8 py-3 rounded-xl"
            >
              Comprendre le système
            </button>
          </div>

        </div>
      </section>

      {/* VISION GLOBALE */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto text-center space-y-10">

          <h2 className="text-3xl font-bold">
            Une vision globale du troupeau, en temps réel
          </h2>

          <p className="text-gray-600">
            Une église n’est pas une liste de membres.
            C’est un système vivant où chaque âme est connectée à une structure, un suivi et une mission.
          </p>

          <div className="grid md:grid-cols-3 gap-6">

            <div className="bg-white p-6 rounded-2xl shadow">
              <h3 className="font-semibold">👥 Individus</h3>
              <p className="text-sm text-gray-600 mt-2">
                Chaque membre avec son état, son historique et son parcours.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow">
              <h3 className="font-semibold">🏠 Cellules</h3>
              <p className="text-sm text-gray-600 mt-2">
                Groupes de proximité pour le suivi et la croissance.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow">
              <h3 className="font-semibold">🧭 Conseillers</h3>
              <p className="text-sm text-gray-600 mt-2">
                Accompagnement spirituel structuré et assigné.
              </p>
            </div>

          </div>

          <div className="grid md:grid-cols-2 gap-6 pt-6">

            <div className="bg-white p-6 rounded-2xl shadow">
              <h3 className="font-semibold">✝️ Évangélisation</h3>
              <p className="text-sm text-gray-600 mt-2">
                Suivi des nouvelles âmes, conversions et baptêmes.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow">
              <h3 className="font-semibold">🔗 Structure Église</h3>
              <p className="text-sm text-gray-600 mt-2">
                Organisation globale multi-niveaux et branches.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* POSITIONNEMENT */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-6">

          <h2 className="text-3xl font-bold">
            Ce que SoulTrack change réellement
          </h2>

          <p className="text-gray-600">
            Avant : des fichiers, du suivi manuel, des informations dispersées.
            <br /><br />
            Maintenant : une vision unifiée du troupeau, où chaque action est connectée.
          </p>

        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center bg-blue-900 text-white">

        <h2 className="text-3xl font-bold mb-6">
          Voir clair dans son troupeau commence ici
        </h2>

        <button
          onClick={() => router.push("/SignupEglise")}
          className="bg-white text-blue-900 px-10 py-4 rounded-xl font-semibold"
        >
          Démarrer SoulTrack
        </button>

      </section>

      <Footer />
    </div>
  );
}
