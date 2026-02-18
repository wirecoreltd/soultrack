"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import PublicHeader from "../components/PublicHeader";
import Footer from "../components/Footer";

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="bg-white text-gray-900">
      <PublicHeader />

      <section className="pt-24 pb-24 bg-gradient-to-br from-blue-700 to-indigo-800 text-white">
  <div className="max-w-3xl mx-auto px-6 text-center space-y-6">

    {/* Bloc central méditatif et fluide */}
    <p className="text-lg lg:text-xl leading-relaxed text-white/90">
      Chaque membre porte une histoire, chaque absence peut révéler une saison difficile et chaque silence peut cacher une bataille invisible.  
      Un berger attentif ne dirige pas seulement : il discerne, il veille, il accompagne avec intention.
    </p>

    <p className="italic text-white/80">
      “Prenez soin du troupeau de Dieu…” – 1 Pierre 5:2
    </p>

    <p className="leading-relaxed text-white/90 font-medium">
      Aimer, c’est aussi organiser. Servir une église, c’est structurer. Veiller, c’est suivre avec sagesse.
    </p>

    <button
      onClick={() => router.push("/SignupEglise")}
      className="mt-6 bg-white text-blue-700 px-8 py-3 rounded-xl font-semibold shadow-lg hover:scale-105 transition"
    >
      🚀 Découvrir SoulTrack
    </button>

  </div>
</section>


      {/* TRANSITION */}
      <section className="py-16 px-6 bg-white text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl lg:text-3xl font-bold text-blue-700 mb-6">
            Une vision spirituelle mérite une structure claire
          </h2>

          <p className="text-gray-700 leading-relaxed">
            SoulTrack a été conçu pour aider les églises à exercer un leadership 
            attentif, organisé et intentionnel.  
            Parce que bien accompagner commence par bien connaître.
          </p>
        </div>
      </section>

      {/* HUBS */}
      <section className="py-16 px-6 bg-blue-50">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">

          <div className="bg-white p-6 rounded-2xl shadow hover:shadow-xl transition">
            <h3 className="text-xl font-semibold mb-3 text-blue-700">
              👥 Membres Hub
            </h3>
            <p className="text-gray-600 text-sm">
              Centralisez les informations essentielles de chaque membre : 
              coordonnées, situation spirituelle, suivi pastoral et notes privées.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow hover:shadow-xl transition">
            <h3 className="text-xl font-semibold mb-3 text-blue-600">
              📖 Cellule Hub
            </h3>
            <p className="text-gray-600 text-sm">
              Organisez les groupes de maison, suivez les présences, 
              identifiez les absences répétées et accompagnez efficacement.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow hover:shadow-xl transition">
            <h3 className="text-xl font-semibold mb-3 text-indigo-600">
              🌍 Évangélisation Hub
            </h3>
            <p className="text-gray-600 text-sm">
              Suivez les nouvelles âmes, planifiez les visites et assurez 
              un accompagnement structuré dès le premier contact.
            </p>
          </div>

        </div>
      </section>

      {/* IMAGE DASHBOARD */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-2xl lg:text-3xl font-bold mb-8">
            Une vision claire de votre troupeau
          </h2>

          <div className="flex justify-center">
            <Image
              src="/Dashboard.png"
              alt="Dashboard SoulTrack"
              width={750}
              height={420}
              className="rounded-2xl shadow-2xl border"
            />
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-16 px-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-center">
        <div className="max-w-4xl mx-auto">

          <h2 className="text-2xl lg:text-3xl font-bold mb-6">
            Accompagnez chaque membre avec sagesse et clarté
          </h2>

          <p className="mb-8 text-white/90">
            Donnez à votre église les outils nécessaires pour suivre chaque âme, comprendre ses besoins et agir avec intention.
          </p>

          <button
            onClick={() => router.push("/SignupEglise")}
            className="bg-white text-blue-700 px-8 py-3 rounded-xl font-semibold shadow-lg hover:scale-105 transition"
          >
            🚀 Créer mon compte
          </button>

        </div>
      </section>

      <Footer />
    </div>
  );
}
