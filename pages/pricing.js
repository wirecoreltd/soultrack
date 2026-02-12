"use client";

import PublicHeader from "../components/PublicHeader";
import Footer from "../components/Footer";

const plans = [
  { range: "0 - 100", price: "Gratuit", features: ["Membres jusqu'à 100", "Accès aux statistiques de base"] },
  { range: "101 - 1000", price: "$50/mois", features: ["Membres jusqu'à 1000", "Stats avancées", "Support email"] },
  { range: "1001 - 5000", price: "$70/mois", features: ["Membres jusqu'à 5000", "Toutes les fonctionnalités", "Support prioritaire"] },
  { range: "5001 - 15000", price: "$200/mois", features: ["Membres jusqu'à 15000", "Fonctionnalités premium", "Support dédié"] },
  { range: "> 15000", price: "Contactez-nous", features: ["Plan sur mesure pour grandes églises"] },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <PublicHeader />

      <main className="flex-grow max-w-6xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold mb-10 text-center">Nos Tarifs</h1>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan.range} className="border rounded-2xl p-6 shadow hover:shadow-lg transition">
              <h2 className="text-xl font-bold mb-2">{plan.range}</h2>
              <p className="text-2xl font-bold mb-4">{plan.price}</p>
              <ul className="text-gray-700 space-y-1">
                {plan.features.map((f, idx) => (
                  <li key={idx}>• {f}</li>
                ))}
              </ul>
              {plan.price === "Contactez-nous" ? (
                <button className="mt-4 w-full px-4 py-2 border border-blue-500 text-blue-500 rounded-2xl hover:bg-blue-500 hover:text-white transition font-semibold">
                  Nous contacter
                </button>
              ) : (
                <button className="mt-4 w-full px-4 py-2 bg-blue-500 text-white rounded-2xl hover:bg-blue-600 transition font-semibold">
                  S’inscrire
                </button>
              )}
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
