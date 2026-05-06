"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import HeaderPages from "../../components/HeaderPages";
import ProtectedRoute from "../../components/ProtectedRoute";
import Footer from "../../components/Footer";
import supabase from "../../lib/supabaseClient";

// ─── Liste des features disponibles ──────────────────────────────────────────
const ALL_FEATURES = [
  { key: "membres",        label: "Gestion des membres", emoji: "🧭" },
  { key: "evangelisation", label: "Évangélisation",      emoji: "✝️" },
  { key: "cellules",       label: "Cellules",            emoji: "🏠" },
  { key: "conseiller",     label: "Conseiller",          emoji: "🤝" },
  { key: "familles",       label: "Familles",            emoji: "👑" },
  { key: "rapport",        label: "Rapport",             emoji: "📈" },
  { key: "presence",       label: "Présence",            emoji: "✍🏻" },
];

export default function SuperadminHub() {
  return (
    <ProtectedRoute allowedRoles={["Superadmin"]}>
      <SuperadminHubContent />
    </ProtectedRoute>
  );
}

function SuperadminHubContent() {
  const [userName,     setUserName]     = useState("");
  const [loadingUser,  setLoadingUser]  = useState(true);

  // ─── États gestion features ───────────────────────────────────────────────
  const [eglises,         setEglises]         = useState([]);
  const [selectedEglise,  setSelectedEglise]  = useState(null);
  const [features,        setFeatures]        = useState({}); // { feature_key: boolean }
  const [loadingEglises,  setLoadingEglises]  = useState(false);
  const [loadingFeatures, setLoadingFeatures] = useState(false);
  const [saving,          setSaving]          = useState(null); // feature en cours de sauvegarde
  const [showFeaturesPanel, setShowFeaturesPanel] = useState(false);

  // ─── Charger l'utilisateur ────────────────────────────────────────────────
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) { setLoadingUser(false); return; }
      const name   = session.user.user_metadata?.full_name || "Utilisateur";
      setUserName(name.split(" ")[0]);
      setLoadingUser(false);
    };
    fetchUser();
  }, []);

  // ─── Charger toutes les églises ───────────────────────────────────────────
  const fetchEglises = async () => {
    setLoadingEglises(true);
    const { data, error } = await supabase
      .from("eglises")
      .select("id, nom, ville, pays")
      .order("nom", { ascending: true });
    if (!error) setEglises(data || []);
    setLoadingEglises(false);
  };

  // ─── Charger les features d'une église ───────────────────────────────────
  const fetchFeatures = async (egliseId) => {
    setLoadingFeatures(true);
    const { data, error } = await supabase
      .from("eglise_features")
      .select("feature, active")
      .eq("eglise_id", egliseId);

    if (!error && data) {
      const map = {};
      data.forEach((f) => { map[f.feature] = f.active; });
      // S'assurer que toutes les features sont présentes (même celles pas encore en base)
      ALL_FEATURES.forEach((f) => {
        if (map[f.key] === undefined) map[f.key] = false;
      });
      setFeatures(map);
    }
    setLoadingFeatures(false);
  };

  // ─── Sélectionner une église ──────────────────────────────────────────────
  const handleSelectEglise = async (eglise) => {
    setSelectedEglise(eglise);
    await fetchFeatures(eglise.id);
  };

  // ─── Ouvrir le panel ──────────────────────────────────────────────────────
  const handleOpenPanel = async () => {
    setShowFeaturesPanel(true);
    if (eglises.length === 0) await fetchEglises();
  };

  // ─── Toggle une feature ───────────────────────────────────────────────────
  const handleToggleFeature = async (featureKey) => {
    if (!selectedEglise) return;
    const newValue = !features[featureKey];
    setSaving(featureKey);

    // Optimistic update
    setFeatures((prev) => ({ ...prev, [featureKey]: newValue }));

    const { error } = await supabase
      .from("eglise_features")
      .upsert(
        { eglise_id: selectedEglise.id, feature: featureKey, active: newValue },
        { onConflict: "eglise_id,feature" }
      );

    if (error) {
      console.error("Erreur toggle feature :", error);
      // Rollback
      setFeatures((prev) => ({ ...prev, [featureKey]: !newValue }));
      alert("❌ Erreur lors de la mise à jour");
    }

    setSaving(null);
  };

  // ─── Tout activer / tout désactiver ──────────────────────────────────────
  const handleToggleAll = async (activate) => {
    if (!selectedEglise) return;
    setSaving("all");

    const newFeatures = {};
    ALL_FEATURES.forEach((f) => { newFeatures[f.key] = activate; });
    setFeatures(newFeatures);

    const rows = ALL_FEATURES.map((f) => ({
      eglise_id: selectedEglise.id,
      feature:   f.key,
      active:    activate,
    }));

    const { error } = await supabase
      .from("eglise_features")
      .upsert(rows, { onConflict: "eglise_id,feature" });

    if (error) {
      console.error("Erreur toggle all :", error);
      alert("❌ Erreur lors de la mise à jour");
      await fetchFeatures(selectedEglise.id);
    }

    setSaving(null);
  };

  if (loadingUser) return <p className="text-white mt-10 text-center">Chargement...</p>;

  return (
    <div
      className="min-h-screen flex flex-col items-center p-6 text-center space-y-6"
      style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}
    >
      <HeaderPages />

      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mt-4 mb-2 text-white">Espace Super Admin</h1>
        {userName && <p className="text-blue-200 text-sm">Connecté en tant que {userName}</p>}
      </div>

      {/* ─── Cartes principales ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-5xl mb-2">

        <Link href="/Superadmin/temoignages"
          className="bg-white rounded-2xl shadow-md flex flex-col justify-center items-center border-t-4 border-[#0D9488] p-6 hover:shadow-lg transition-all duration-200 cursor-pointer h-32">
          <div className="text-4xl mb-2">💡</div>
          <div className="text-lg font-bold text-gray-800">Témoignages</div>
        </Link>

        <Link href="/Superadmin/AdminDashboard"
          className="bg-white rounded-2xl shadow-md flex flex-col justify-center items-center border-t-4 border-[#0D9488] p-6 hover:shadow-lg transition-all duration-200 cursor-pointer h-32">
          <div className="text-4xl mb-2">🏆</div>
          <div className="text-lg font-bold text-gray-800">Eglise Count</div>
        </Link>

        <Link href="/Superadmin/page"
          className="bg-white rounded-2xl shadow-md flex flex-col justify-center items-center border-t-4 border-[#0D9488] p-6 hover:shadow-lg transition-all duration-200 cursor-pointer h-32">
          <div className="text-4xl mb-2">💰</div>
          <div className="text-lg font-bold text-gray-800">Billing</div>
        </Link>

        {/* ✅ NOUVEAU — Carte gestion des features */}
        <button
          onClick={handleOpenPanel}
          className="bg-white rounded-2xl shadow-md flex flex-col justify-center items-center border-t-4 border-[#7C3AED] p-6 hover:shadow-lg transition-all duration-200 cursor-pointer h-32 w-full"
        >
          <div className="text-4xl mb-2">🔧</div>
          <div className="text-lg font-bold text-gray-800">Modules par église</div>
        </button>

      </div>

      {/* ─── Panel gestion features ──────────────────────────────────────── */}
      {showFeaturesPanel && (
        <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl p-6 text-left">

          {/* En-tête panel */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">🔧 Modules par église</h2>
              <p className="text-sm text-gray-500 mt-1">
                Activez ou désactivez les fonctionnalités disponibles pour chaque église.
              </p>
            </div>
            <button
              onClick={() => { setShowFeaturesPanel(false); setSelectedEglise(null); setFeatures({}); }}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ✕
            </button>
          </div>

          {/* Sélecteur d'église */}
          {loadingEglises ? (
            <p className="text-gray-500 text-center py-6">Chargement des églises...</p>
          ) : (
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-600 mb-2">
                Sélectionner une église
              </label>
              <select
                value={selectedEglise?.id || ""}
                onChange={(e) => {
                  const eglise = eglises.find((eg) => eg.id === e.target.value);
                  if (eglise) handleSelectEglise(eglise);
                }}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                <option value="">-- Choisir une église --</option>
                {eglises.map((eg) => (
                  <option key={eg.id} value={eg.id}>
                    {eg.nom} {eg.ville ? `— ${eg.ville}` : ""} {eg.pays ? `(${eg.pays})` : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Features de l'église sélectionnée */}
          {selectedEglise && (
            <>
              {loadingFeatures ? (
                <p className="text-gray-500 text-center py-6">Chargement des modules...</p>
              ) : (
                <>
                  {/* Boutons tout activer / tout désactiver */}
                  <div className="flex gap-3 mb-5">
                    <button
                      onClick={() => handleToggleAll(true)}
                      disabled={saving === "all"}
                      className="flex-1 py-2 rounded-xl bg-emerald-500 text-white font-semibold text-sm hover:bg-emerald-600 disabled:opacity-50 transition"
                    >
                      ✅ Tout activer
                    </button>
                    <button
                      onClick={() => handleToggleAll(false)}
                      disabled={saving === "all"}
                      className="flex-1 py-2 rounded-xl bg-red-400 text-white font-semibold text-sm hover:bg-red-500 disabled:opacity-50 transition"
                    >
                      ❌ Tout désactiver
                    </button>
                  </div>

                  {/* Liste des features */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {ALL_FEATURES.map((f) => {
                      const isActive  = features[f.key] === true;
                      const isSaving  = saving === f.key || saving === "all";

                      return (
                        <div
                          key={f.key}
                          onClick={() => !isSaving && handleToggleFeature(f.key)}
                          className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                            isActive
                              ? "border-emerald-400 bg-emerald-50"
                              : "border-gray-200 bg-gray-50 opacity-70"
                          } ${isSaving ? "opacity-50 cursor-not-allowed" : "hover:shadow-md"}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{f.emoji}</span>
                            <span className="font-semibold text-gray-800 text-sm">{f.label}</span>
                          </div>

                          {/* Toggle visuel */}
                          <div className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${isActive ? "bg-emerald-500" : "bg-gray-300"}`}>
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 ${isActive ? "translate-x-7" : "translate-x-1"}`} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Résumé */}
                  <p className="text-xs text-gray-400 text-center mt-4">
                    {Object.values(features).filter(Boolean).length} module{Object.values(features).filter(Boolean).length > 1 ? "s" : ""} activé{Object.values(features).filter(Boolean).length > 1 ? "s" : ""} sur {ALL_FEATURES.length} pour {selectedEglise.nom}
                  </p>
                </>
              )}
            </>
          )}
        </div>
      )}

      <Footer />
    </div>
  );
}
