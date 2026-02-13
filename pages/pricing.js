"use client";

import { useRouter } from "next/navigation";
import PublicHeader from "../components/PublicHeader";
import Footer from "../components/Footer";

export default function PricingPage() {
  const router = useRouter();

  const plans = [
    {
      name: "Église Mini",
      range: "0–100 membres",
      price: "Gratuit",
      popular: false,
      features: [
        "Suivi de base des membres",
        "Liste des membres",
        "Accès aux cellules",
      ],
    },
    {
      name: "Église Standard",
      range: "101–1000 membres",
      price: "$50/mois",
      popular: true,
      features: [
        "Tout dans Mini",
        "Rapports d’activité avancés",
        "Statistiques de cultes & évangélisation",
      ],
    },
    {
      name: "Église Pro",
      range: "1001–5000 membres",
      price: "$70/mois",
      popular: false,
      features: [
        "Tout dans Standard",
        "Alertes & notifications avancées",
        "Exports PDF / Excel",
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
        "Multi‑branche / Multi‑cellules",
      ],
    },
    {
      name: "Église Enterprise",
      range: "Plus de 15000",
      price: "Contactez-nous",
      popular: false,
      features: [
        "Plan personnalisé",
        "Intégration & support dédié",
        "Options sur mesure",
      ],
    },
  ];

  return (
    <div className="bg-white text-gray-900 min-h-screen">
      <PublicHeader />

      {/* Hero */}
      <section className="text-center py-20 px-6 bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100">
        <h1 className="text-5xl font-bold mb-4 text-gray-900">
          Tarifs SoulTrack
        </h1>
        <p className="text-lg text-gray-700 mb-6 max-w-2xl mx-auto">
          Choisissez le plan adapté à la taille de votre église et à vos besoins de suivi spirituel.
        </p>
        <p className="text-gray-600 italic mb-8">
          « Que tout ce que vous faites se fasse avec amour » – 1 Corinthiens 16:14
        </p>
      </section>

      {/* Pricing Cards */}
      <section className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-5 gap-6">
        {plans.map((plan, idx) => (
          <div
            key={idx}
            className={`flex flex-col border rounded-2xl shadow-lg p-6 transition hover:shadow-xl ${
              plan.popular ? "border-blue-500" : "border-gray-200"
            }`}
          >
            {plan.popular && (
              <span className="self-start px-3 py-1 bg-blue-500 text-white rounded-full text-xs font-semibold mb-2 uppercase">
                Recommandé
              </span>
            )}
            <h2 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h2>
            <p className="text-sm text-gray-600 mb-4">{plan.range}</p>
            <p className="text-3xl font-bold text-gray-900 mb-6">{plan.price}</p>

            <ul className="flex-1 space-y-2 mb-6 text-sm text-gray-700">
              {plan.features.map((f, i) => (
                <li key={i}>✔ {f}</li>
              ))}
            </ul>

            <button
              onClick={() =>
                plan.price === "Contactez-nous"
                  ? router.push("/contact")
                  : router.push("/signup-eglise")
              }
              className={`mt-auto py-2 rounded-lg font-bold transition ${
                plan.popular
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-gray-200 text-gray-900 hover:bg-gray-300"
              }`}
            >
              {plan.price === "Contactez-nous" ? "Contactez-nous" : "Commencer"}
            </button>
          </div>
        ))}
      </section>

      {/* FAQ / Info supplémentaire */}
      <section className="max-w-4xl mx-auto px-6 py-16 text-center text-gray-700 text-sm">
        <h3 className="text-2xl font-semibold mb-4">Questions fréquentes</h3>
        <p>Les prix sont mensuels et peuvent évoluer selon la taille de votre église.</p>
        <p>Vous pouvez changer de plan à tout moment sans frais cachés.</p>
      </section>

      <Footer />
    </div>
  );
}
