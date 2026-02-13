"use client";

import { useRouter } from "next/navigation";
import PublicHeader from "../components/PublicHeader";
import Footer from "../components/Footer";

export default function Pricing() {
  const router = useRouter();

  const plans = [
    {
      name: "Église Mini",
      range: "0–100 membres",
      price: "Gratuit",
      popular: false,
      features: [
        "Suivi des membres",
        "Liste des membres",
        "Gestion des cellules",
      ],
    },
    {
      name: "Église Standard",
      range: "101–1000 membres",
      price: "$50/mois",
      popular: true,
      features: [
        "Tout dans Mini",
        "Rapports avancés",
        "Statistiques cultes & évangélisation",
      ],
    },
    {
      name: "Église Pro",
      range: "1001–5000 membres",
      price: "$70/mois",
      popular: false,
      features: [
        "Tout dans Standard",
        "Alertes automatiques",
        "Export PDF/Excel",
      ],
    },
    {
      name: "Église Plus",
      range: "5001–15000 membres",
      price: "$200/mois",
      popular: false,
      features: [
        "Tout dans Pro",
        "Support prioritaire",
        "Multi-branche",
      ],
    },
    {
      name: "Église Enterprise",
      range: "15000+ membres",
      price: "Contactez-nous",
      popular: false,
      features: [
        "Plan sur mesure",
        "Support dédié",
        "Personnalisation complète",
      ],
    },
  ];

  return (
    <div className="bg-white text-gray-900">
      <PublicHeader />

      {/* Hero */}
      <section className="text-center py-20 px-6 bg-gradient-to-r from-blue-200 via-blue-300 to-blue-400">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
          Tarifs SoulTrack
        </h1>
        <p className="text-lg text-white/90 mb-6 max-w-2xl mx-auto">
          Choisissez le plan parfait pour votre église — du petit groupe aux milliers de membres.
        </p>
      </section>

      {/* Pricing Cards */}
      <section className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-5 gap-8">
        {plans.map((plan, idx) => (
          <div
            key={idx}
            className={`relative flex flex-col rounded-3xl p-6 bg-white shadow-2xl transition hover:scale-105 ${
              plan.popular ? "border-2 border-blue-500" : "border border-gray-200"
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full shadow-lg">
                Most Popular
              </div>
            )}

            {/* Plan Header */}
            <div className="mb-4 text-center">
              <h2 className="text-xl font-bold text-gray-900">{plan.name}</h2>
              <p className="text-sm text-gray-500">{plan.range}</p>
            </div>

            {/* Price */}
            <div className="text-center mb-6">
              <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
            </div>

            {/* Features */}
            <ul className="flex-1 space-y-3 text-sm text-gray-700 mb-6">
              {plan.features.map((feat, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="text-blue-500">✔</span> {feat}
                </li>
              ))}
            </ul>

            {/* Button */}
            <button
              onClick={() =>
                plan.price === "Contactez-nous"
                  ? router.push("/contact")
                  : router.push("/signup-eglise")
              }
              className={`mt-auto py-3 rounded-xl font-semibold text-sm transition ${
                plan.popular
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-blue-100 text-blue-800 hover:bg-blue-200"
              }`}
            >
              {plan.price === "Contactez-nous" ? "Contactez-nous" : "Commencer"}
            </button>
          </div>
        ))}
      </section>

      {/* FAQ / Info */}
      <section className="max-w-4xl mx-auto px-6 py-16 text-center text-gray-700 text-sm">
        <h3 className="text-2xl font-semibold mb-4">Questions fréquentes</h3>
        <p className="mb-2">📌 Les tarifs sont mensuels et peuvent évoluer selon le nombre de membres.</p>
        <p className="mb-2">🔄 Vous pouvez changer de plan à tout moment sans frais cachés.</p>
      </section>

      <Footer />
    </div>
  );
}
