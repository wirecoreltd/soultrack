"use client";

import { useEffect, useState } from "react";
import supabase from "../../lib/supabaseClient";
import ProtectedRoute from "../../components/ProtectedRoute";
import HeaderPages from "../../components/HeaderPages";
import Footer from "../../components/Footer";

export default function FeaturesPage() {
  return (
    <ProtectedRoute allowedRoles={["Superadmin"]}>
      <Features />
    </ProtectedRoute>
  );
}

// ─────────────────────────────────────────────
// FEATURES LIST
// ─────────────────────────────────────────────
const ALL_FEATURES = [
  { key: "membres", label: "Membres", emoji: "🧭" },
  { key: "evangelisation", label: "Évangélisation", emoji: "✝️" },
  { key: "cellules", label: "Cellules", emoji: "🏠" },
  { key: "conseiller", label: "Conseiller", emoji: "🤝" },
  { key: "familles", label: "Familles", emoji: "👑" },
  { key: "rapport", label: "Rapport", emoji: "📊" },
  { key: "presence", label: "Présence", emoji: "✍🏻" },
];

function Features() {
  const [eglises, setEglises] = useState([]);
  const [selected, setSelected] = useState(null);

  const [features, setFeatures] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeCount, setActiveCount] = useState(0);

  // ─────────────────────────────────────────────
  // LOAD EGLISES
  // ─────────────────────────────────────────────
  useEffect(() => {
    const fetchEglises = async () => {
      const { data } = await supabase
        .from("eglises")
        .select("id, nom, ville");

      setEglises(data || []);
    };

    fetchEglises();
  }, []);

  // ─────────────────────────────────────────────
  // LOAD FEATURES (IMPORTANT FIX ICI)
  // ─────────────────────────────────────────────
  const fetchFeatures = async (egliseId) => {
    setLoading(true);

    const { data, error } = await supabase
      .from("eglise_features")
      .select("feature, active")
      .eq("eglise_id", egliseId);

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    // ✔ STEP 1 : reset TOTAL depuis ALL_FEATURES
    const map = Object.fromEntries(
      ALL_FEATURES.map((f) => [f.key, false])
    );

    // ✔ STEP 2 : overwrite avec DB
    data?.forEach((f) => {
      map[f.feature] = f.active;
    });

    setFeatures(map);

    // ✔ compteur actifs
    const count = Object.values(map).filter(Boolean).length;
    setActiveCount(count);

    setLoading(false);
  };

  // ─────────────────────────────────────────────
  // TOGGLE FEATURE
  // ─────────────────────────────────────────────
  const toggle = async (key) => {
    if (!selected) return;

    const newValue = !features[key];

    // UI optimiste
    const updated = { ...features, [key]: newValue };
    setFeatures(updated);

    setActiveCount(Object.values(updated).filter(Boolean).length);

    // DB update
    const { error } = await supabase
      .from("eglise_features")
      .upsert(
        {
          eglise_id: selected.id,
          feature: key,
          active: newValue,
        },
        { onConflict: "eglise_id,feature" }
      );

    if (error) {
      console.error(error);

      // rollback
      setFeatures(features);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6 bg-[#333699]">

      <HeaderPages />

      {/* HEADER */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white mt-4">
          🔧 Modules Églises
        </h1>
        <p className="text-white/80 mt-2">
          Activation des fonctionnalités par église
        </p>
      </div>

      {/* SELECT */}
      <div className="w-full max-w-3xl mb-6">
        <select
          className="w-full p-3 rounded-xl"
          onChange={(e) => {
            const eg = eglises.find((x) => x.id === e.target.value);
            setSelected(eg);
            fetchFeatures(eg.id);
          }}
        >
          <option>-- Sélectionner une église --</option>
          {eglises.map((e) => (
            <option key={e.id} value={e.id}>
              {e.nom} {e.ville ? `(${e.ville})` : ""}
            </option>
          ))}
        </select>
      </div>

      {/* STATS */}
      {selected && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 w-full max-w-3xl">

          <div className="bg-white rounded-xl p-6 text-center shadow">
            <h2 className="text-3xl font-bold text-[#333699]">
              {activeCount}
            </h2>
            <p className="text-gray-600">Modules actifs</p>
          </div>

          <div className="bg-white rounded-xl p-6 text-center shadow">
            <h2 className="text-3xl font-bold text-[#333699]">
              {ALL_FEATURES.length}
            </h2>
            <p className="text-gray-600">Total modules</p>
          </div>

        </div>
      )}

      {/* GRID */}
      {selected && (
        <div className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">

          {loading ? (
            <p className="text-white col-span-full text-center">
              Chargement...
            </p>
          ) : (
            ALL_FEATURES.map((f) => {
              const active = features[f.key];

              return (
                <div
                  key={f.key}
                  onClick={() => toggle(f.key)}
                  className={`bg-white rounded-xl shadow p-5 text-center cursor-pointer hover:shadow-xl transition ${
                    active ? "border-2 border-green-500" : ""
                  }`}
                >
                  <div className="text-3xl mb-2">{f.emoji}</div>

                  <h3 className="font-bold text-[#333699]">
                    {f.label}
                  </h3>

                  <div
                    className={`mt-3 text-sm font-bold ${
                      active ? "text-green-600" : "text-gray-400"
                    }`}
                  >
                    {active ? "ACTIVÉ" : "DÉSACTIVÉ"}
                  </div>
                </div>
              );
            })
          )}

        </div>
      )}

      <Footer />
    </div>
  );
}
