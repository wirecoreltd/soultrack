"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import supabase from "../lib/supabaseClient";
import Footer from "../components/Footer";

export default function PricingPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();
  }, []);

  const handleSignup = () => {
    if (user) router.push("/");
    else router.push("/signup-eglise");
  };

  const plans = [
    { name: "Free", members: "0 - 100", price: "$0 / mois", features: ["Gestion des membres", "Cellules et rapports", "Statistiques de base"], highlight: false },
    { name: "Starter", members: "101 - 1000", price: "$40 / mois", features: ["Toutes les fonctionnalités Free", "Rapports avancés", "Support email"], highlight: true },
    { name: "Growth", members: "1001 - 5000", price: "$80 / mois", features: ["Toutes les fonctionnalités Starter", "Export Excel/PDF", "Support prioritaire"], highlight: false },
    { name: "Enterprise", members: "5001 - 15 000", price: "$200 / mois", features: ["Toutes les fonctionnalités Growth", "Formation dédiée", "Support personnalisé"], highlight: false },
    { name: "Custom", members: "15 001+", price: "Contactez-nous", features: ["Fonctionnalités sur-mesure", "Intégration complète", "Support premium"], highlight: false },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="max-w-6xl mx-auto px-6 py-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Tarifs SoulTrack</h1>
        <p className="text-gray-700 mb-10 text-lg">Choisissez le plan adapté à la taille de votre église.</p>

        <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-5">
          {plans.map((plan, idx) => (
            <div key={idx} className={`flex flex-col justify-between border rounded-2xl p-6 shadow-md transition transform hover:scale-105 ${plan.highlight ? "border-blue-500 shadow-lg" : "border-gray-200"}`}>
              <div>
                <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                <p className="text-gray-500 mb-4">{plan.members}</p>
                <p className="text-2xl font-bold mb-4">{plan.price}</p>
                <ul className="text-gray-700 text-sm space-y-2 mb-6">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center">
                      <span className="text-green-500 mr-2">✔</span>{f}
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={handleSignup}
                className={`mt-auto px-4 py-3 rounded-xl font-semibold ${plan.highlight ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-gray-200 text-gray-800 hover:bg-gray-300"}`}
              >
                {plan.price === "Contactez-nous" ? "Contactez-nous" : "Commencer"}
              </button>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
