"use client";

import { useRouter } from "next/navigation";
import PublicHeader from "../components/PublicHeader";
import Footer from "../components/Footer";

export default function Pricing() {
  const router = useRouter();

  const plans = [
    {
      name: "Église Mini",
      emoji: "🌱",
      range: "0–100 membres",
      price: "Gratuit",
      popular: false,
      features: [
        "👥 Suivi des membres",
        "📋 Liste complète",
        "🏠 Gestion des cellules",
      ],
    },
    {
      name: "Église Standard",
      emoji: "🚀",
      range: "101–1000 membres",
      price: "$50/mois",
      popular: true,
      features: [
        "✔ Tout dans Mini",
        "📊 Rapports avancés",
        "📈 Statistiques complètes",
      ],
    },
    {
      name: "Église Pro",
      emoji: "🔥",
      range: "1001–5000 membres",
      price: "$70/mois",
      popular: false,
      features: [
        "✔ Tout dans Standard",
        "🔔 Alertes automatiques",
        "📤 Export PDF / Excel",
      ],
    },
    {
      name: "Église Plus",
      emoji: "💎",
      range: "5001–15000 membres",
      price: "$200/mois",
      popular: false,
      features: [
        "✔ Tout dans Pro",
        "⭐ Support prioritaire",
        "🌍 Multi-branche",
      ],
    },
    {
      name: "Église Enterprise",
      emoji: "🏆",
      range: "15000+ membres",
      price: "Contactez-nous",
      popular: false,
      features: [
        "⚙ Plan personnalisé",
        "🤝 Support dédié",
        "🔒 Sécurité avancée",
      ],
    },
  ];

  return (
    <div className="bg-white text-gray-900">
      <PublicHeader />

      {/* Hero */}
      <section className="text-center py-20 px-6 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
          Tarifs SoulTrack ✨
        </h1>
        <p className="text-lg text-white/90 max-w-2xl mx-auto">
          Une solution adaptée à chaque taille d’église.
        </p>
      </section>

      {/* Pricing Cards */}
      <section className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-5 gap-8">
        {plans.map((plan, idx) => (
          <div
            key={idx}
            className={`relative flex flex-col rounded-3xl p-6 transition duration-300 shadow-xl hover:scale-105 ${
              plan.popular
                ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white"
                : "bg-white border border-gray-200"
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-white text-blue-600 text-xs font-bold rounded-full shadow-md">
                ⭐ Most Popular
              </div>
            )}

            <div className="text-center mb-4">
              <h2 className="text-xl font-bold">
                {plan.emoji} {plan.name}
              </h2>
              <p className={`text-sm ${plan.popular ? "text-white/80" : "text-gray-500"}`}>
                {plan.range}
              </p>
            </div>

            <div className="text-center mb-6">
              <span className="text-4xl font-extrabold">
                {plan.price}
              </span>
            </div>

            <ul className={`flex-1 space-y-3 text-sm mb-6 ${
              plan.popular ? "text-white/90" : "text-gray-700"
            }`}>
              {plan.features.map((feat, i) => (
                <li key={i}>{feat}</li>
              ))}
            </ul>

            <button
              onClick={() =>
                plan.price === "Contactez-nous"
                  ? router.push("/contact")
                  : router.push("/signup-eglise")
              }
              className={`mt-auto py-3 rounded-xl font-semibold transition ${
                plan.popular
                  ? "bg-white text-blue-600 hover:bg-gray-100"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              {plan.price === "Contactez-nous"
                ? "📞 Contactez-nous"
                : "🚀 Commencer"}
            </button>
          </div>
        ))}
      </section>

      <Footer />
    </div>
  );
}
