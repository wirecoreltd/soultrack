"use client";

import { useRouter } from "next/navigation";
import PublicHeader from "../../components/PublicHeader";
import Footer from "../../components/Footer";

export default function HomePage() {
  const router = useRouter();

  const testimonials = [
    {
      name: "Past. Jean",
      church: "Église Bethel",
      message:
        "Avant SoulTrack, nous perdions des membres sans le voir. Aujourd’hui, chaque âme est suivie avec clarté.",
    },
    {
      name: "Past. Marie",
      church: "Église Grâce",
      message:
        "Je peux enfin voir qui s’éloigne, qui grandit et qui a besoin d’accompagnement.",
    },
    {
      name: "Responsable Samuel",
      church: "Église Lumière",
      message:
        "C’est devenu notre tableau de bord pastoral. On ne pilote plus à l’aveugle.",
    },
  ];

  return (
    <div className="bg-white text-gray-900">

      <PublicHeader />

      {/* HERO */}
      <section className="relative pt-28 pb-28 bg-gradient-to-br from-slate-950 via-blue-900 to-indigo-900 text-white px-6">

        <div className="max-w-5xl mx-auto text-center space-y-6">

          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            Un berger ne doit perdre aucune âme de vue.
          </h1>

          <p className="text-lg text-white/80">
            SoulTrack connecte chaque dimension de l’église pour offrir une vision complète du troupeau :
            membres, cellules, conseillers, évangélisation et structure globale.
          </p>

          <p className="text-white/60 italic">
            “Veillez sur le troupeau de Dieu, non par contrainte mais avec amour et discernement.”
          </p>

          <div className="flex flex-col md:flex-row gap-4 justify-center pt-4">
            <button
              onClick={() => router.push("/SignupEglise")}
              className="bg-white text-blue-900 px-8 py-3 rounded-xl font-semibold hover:scale-105 transition"
            >
              Créer mon église
            </button>

            <button
              onClick={() => router.push("/comment-ca-marche")}
              className="border border-white/30 px-8 py-3 rounded-xl hover:bg-white/10 transition"
            >
              Voir comment ça fonctionne
            </button>
          </div>

        </div>
      </section>

      {/* IMPACT / REALITY */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto text-center space-y-10">

          <h2 className="text-3xl font-bold">
            Ce que la majorité des églises vivent aujourd’hui
          </h2>

          <div className="grid md:grid-cols-3 gap-6 text-left">

            <div className="bg-white p-6 rounded-2xl shadow">
              <h3 className="font-semibold">❌ Membres perdus de vue</h3>
              <p className="text-sm text-gray-600 mt-2">
                On ne sait plus qui est actif, absent ou en difficulté.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow">
              <h3 className="font-semibold">❌ Suivi manuel</h3>
              <p className="text-sm text-gray-600 mt-2">
                Excel, carnets, mémoire humaine… donc beaucoup d’oublis.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow">
              <h3 className="font-semibold">❌ Vision partielle</h3>
              <p className="text-sm text-gray-600 mt-2">
                Impossible de voir l’état réel du troupeau.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* SOLUTION */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto text-center space-y-10">

          <h2 className="text-3xl font-bold">
            SoulTrack transforme cette réalité
          </h2>

          <p className="text-gray-600">
            Une seule plateforme. Une vision complète. Un suivi clair de chaque âme.
          </p>

          <div className="grid md:grid-cols-5 gap-4 text-sm">

            <div className="bg-blue-50 p-4 rounded-xl">👥 Membres</div>
            <div className="bg-blue-50 p-4 rounded-xl">🏠 Cellules</div>
            <div className="bg-blue-50 p-4 rounded-xl">🧭 Conseillers</div>
            <div className="bg-blue-50 p-4 rounded-xl">✝️ Évangélisation</div>
            <div className="bg-blue-50 p-4 rounded-xl">🔗 Église</div>

          </div>

        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto text-center space-y-12">

          <h2 className="text-3xl font-bold">
            Ce que disent les responsables
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow">
                <p className="text-gray-600 italic mb-4">"{t.message}"</p>
                <div className="font-semibold">{t.name}</div>
                <div className="text-sm text-gray-500">{t.church}</div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center bg-blue-900 text-white">

        <h2 className="text-3xl font-bold mb-6">
          Commencez à voir votre troupeau autrement
        </h2>

        <button
          onClick={() => router.push("/SignupEglise")}
          className="bg-white text-blue-900 px-10 py-4 rounded-xl font-semibold"
        >
          Créer mon église maintenant
        </button>

      </section>

      <Footer />
    </div>
  );
}
