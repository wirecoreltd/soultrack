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

      {/* HERO */}
      <section className="pt-24 pb-28 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-4xl lg:text-5xl font-extrabold mb-6 leading-tight">
            La plateforme intelligente pour structurer et faire grandir votre église
          </h1>

          <p className="text-lg text-white/90 max-w-3xl mx-auto mb-8">
            Centralisez vos membres, vos cellules et votre évangélisation.
            Prenez des décisions basées sur des données claires.
          </p>

          <button
            onClick={() => router.push("/SignupEglise")}
            className="bg-white text-blue-700 px-8 py-4 rounded-xl font-semibold shadow-lg hover:scale-105 transition"
          >
            🚀 Commencer gratuitement
          </button>

          <div className="mt-12">
            <Image
              src="/Dashboard.png"
              alt="Dashboard"
              width={900}
              height={500}
              className="rounded-2xl shadow-2xl mx-auto border border-white/20"
            />
          </div>
        </div>
      </section>

      {/* PROBLEM SECTION */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">
            Beaucoup d’églises fonctionnent encore avec :
          </h2>

          <div className="grid md:grid-cols-3 gap-6 mt-10">
            <div className="bg-white p-6 rounded-xl shadow">
              📄 Fichiers Excel dispersés
            </div>
            <div className="bg-white p-6 rounded-xl shadow">
              🗂️ Notes papier ou WhatsApp
            </div>
            <div className="bg-white p-6 rounded-xl shadow">
              ❌ Aucune vision claire de la croissance
            </div>
          </div>

          <p className="mt-10 text-gray-600">
            Résultat : perte d’informations, manque de suivi et décisions
            basées sur l’intuition plutôt que sur des données réelles.
          </p>
        </div>
      </section>

      {/* SOLUTION */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto lg:flex lg:items-center lg:gap-16">
          <div className="lg:w-1/2">
            <h2 className="text-3xl font-bold mb-6 text-blue-700">
              SoulTrack change cela.
            </h2>

            <p className="text-gray-700 mb-6 leading-relaxed">
              Une plateforme simple qui centralise toutes les informations
              essentielles de votre église. Vous gagnez en clarté,
              en organisation et en efficacité.
            </p>

            <ul className="space-y-3 text-gray-700">
              <li>✔ Gestion complète des membres</li>
              <li>✔ Suivi structuré des cellules</li>
              <li>✔ Tableau de bord statistique</li>
              <li>✔ Suivi des nouvelles âmes</li>
            </ul>
          </div>

          <div className="lg:w-1/2 mt-10 lg:mt-0">
            <Image
              src="/Espace Membre.png"
              alt="Membres"
              width={500}
              height={300}
              className="rounded-xl shadow-lg border"
            />
          </div>
        </div>
      </section>

      {/* RESULTS */}
      <section className="py-20 px-6 bg-blue-600 text-white text-center">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          <div>
            <div className="text-4xl font-bold">+1000</div>
            <div className="mt-2">Membres suivis</div>
          </div>

          <div>
            <div className="text-4xl font-bold">+50</div>
            <div className="mt-2">Cellules organisées</div>
          </div>

          <div>
            <div className="text-4xl font-bold">100%</div>
            <div className="mt-2">Vision claire</div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-20 px-6 text-center bg-white">
        <h2 className="text-2xl lg:text-3xl font-bold mb-6">
          Donnez à votre église une structure digne de sa vision.
        </h2>

        <button
          onClick={() => router.push("/SignupEglise")}
          className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:scale-105 transition"
        >
          🚀 Créer mon compte maintenant
        </button>
      </section>

      <Footer />
    </div>
  );
}
