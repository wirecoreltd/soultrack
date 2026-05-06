"use client";

import { useEffect, useState } from "react";
import supabase from "../../lib/supabaseClient";

const ALL_FEATURES = [
  { key: "membres", label: "Gestion des membres", emoji: "🧭" },
  { key: "evangelisation", label: "Évangélisation", emoji: "✝️" },
  { key: "cellules", label: "Cellules", emoji: "🏠" },
  { key: "conseiller", label: "Conseiller", emoji: "🤝" },
  { key: "familles", label: "Familles", emoji: "👑" },
  { key: "rapport", label: "Rapport", emoji: "📈" },
  { key: "presence", label: "Présence", emoji: "✍🏻" },
];

export default function FeaturesPage() {
  const [eglises, setEglises] = useState([]);
  const [selectedEglise, setSelectedEglise] = useState(null);
  const [features, setFeatures] = useState({});
  const [loading, setLoading] = useState(false);

  // ─── load eglises ───
  useEffect(() => {
    const fetchEglises = async () => {
      const { data } = await supabase
        .from("eglises")
        .select("id, nom")
        .order("nom");

      setEglises(data || []);
    };

    fetchEglises();
  }, []);

  // ─── load features ───
  const fetchFeatures = async (egliseId) => {
    setLoading(true);

    const { data } = await supabase
      .from("eglise_features")
      .select("feature, active")
      .eq("eglise_id", egliseId);

    const map = {};
    data?.forEach((f) => (map[f.feature] = f.active));

    ALL_FEATURES.forEach((f) => {
      if (map[f.key] === undefined) map[f.key] = false;
    });

    setFeatures(map);
    setLoading(false);
  };

  // ─── toggle feature ───
  const toggleFeature = async (key) => {
    if (!selectedEglise) return;

    const newValue = !features[key];

    setFeatures((prev) => ({ ...prev, [key]: newValue }));

    await supabase.from("eglise_features").upsert(
      {
        eglise_id: selectedEglise.id,
        feature: key,
        active: newValue,
      },
      { onConflict: "eglise_id,feature" }
    );
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <h1 className="text-2xl font-bold mb-6">🔧 Modules des églises</h1>

      {/* SELECT Eglise */}
      <select
        className="border p-2 rounded mb-6 w-full max-w-md"
        onChange={(e) => {
          const eg = eglises.find((x) => x.id === e.target.value);
          setSelectedEglise(eg);
          fetchFeatures(eg.id);
        }}
      >
        <option>-- choisir une église --</option>
        {eglises.map((e) => (
          <option key={e.id} value={e.id}>
            {e.nom}
          </option>
        ))}
      </select>

      {loading && <p>Chargement...</p>}

      {/* FEATURES */}
      {selectedEglise && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ALL_FEATURES.map((f) => {
            const active = features[f.key];

            return (
              <div
                key={f.key}
                onClick={() => toggleFeature(f.key)}
                className={`p-4 rounded-xl border cursor-pointer flex items-center justify-between transition ${
                  active ? "bg-green-100 border-green-400" : "bg-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{f.emoji}</span>
                  <span className="font-semibold">{f.label}</span>
                </div>

                <div
                  className={`w-10 h-5 rounded-full relative transition ${
                    active ? "bg-green-500" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition ${
                      active ? "right-0.5" : "left-0.5"
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
