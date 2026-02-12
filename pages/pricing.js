"use client";

import { useRouter } from "next/navigation";

export default function Pricing() {
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
      price: "Contactez‑nous",
      popular: false,
      features: [
        "Plan personnalisé",
        "Intégration & support dédié",
        "Options sur mesure",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Hero */}
      <section className="text-center py-16 px-6">
        <h1 className="text-4xl font-bold text-blue-700 mb-4">
          Tarifs SoulTrack
        </h1>
        <p className="text-lg text-gray-700 mb-8">
          Choisissez le plan adapté à la taille de votre église et à vos besoins de suivi
          spirituel, des membres et des cellules.
        </p>
      </section>

      {/* Pricing Grid */}
      <section className="max-w-6xl mx-auto px-6 grid md:grid-cols-5 gap-6">
        {plans.map((plan, idx) => (
          <div
            key={idx}
            className={`flex flex-col border rounded-2xl shadow-lg p-6 transition hover:shadow-xl ${
              plan.popular ? "border-blue-500" : "border-gray-200"
            }`}
          >
            {plan.popular && (
              <span className="text-white bg-blue-500 px-3 py-1 rounded-full text-xs uppercase font-semibold self-start mb-2">
                Recommandé
              </span>
            )}
            <h2 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h2>
            <p className="text-sm text-gray-600 mb-4">{plan.range}</p>
            <p className="text-3xl font-bold text-gray-900 mb-6">{plan.price}</p>

            <ul className="flex-1 space-y-2 mb-6 text-sm text-gray-700">
              {plan.features.map((f, i) => (
                <li key={i}>✔ {f}</li>
              ))}
            </ul>

            <button
              onClick={() =>
                plan.price === "Contactez‑nous"
                  ? router.push("/contact")
                  : router.push("/signup-eglise")
              }
              className={`mt-auto text-center py-2 rounded-lg font-bold ${
                plan.popular
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-gray-200 text-gray-900 hover:bg-gray-300"
              } transition`}
            >
              {plan.price === "Contactez‑nous"
                ? "Contactez‑nous"
                : "Commencer"}
            </button>
          </div>
        ))}
      </section>

      {/* Optional: FAQ */}
      <section className="max-w-4xl mx-auto px-6 py-16 text-center text-sm text-gray-700">
        <h3 className="text-2xl font-semibold mb-4">Questions fréquentes</h3>
        <p>Les prix sont mensuels et facturés automatiquement.</p>
        <p>Vous pouvez changer de plan à tout moment sans frais cachés.</p>
      </section>
    </div>
  );
}
