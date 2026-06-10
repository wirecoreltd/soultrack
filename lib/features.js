// ─────────────────────────────────────────────
// DEFAULT FEATURES (SOURCE MÉTIER)
// ─────────────────────────────────────────────
export const DEFAULT_FEATURES = {
  membres: true,
  evangelisation: true,
  cellules: true,
  conseiller: true,
  rapport: true,
  administrateur: true,
  presence: true,  
  notifications: true,
  // ❌ désactivés par défaut
  enfants: false,
  familles: false,
};

// ─────────────────────────────────────────────
// ROUTES DES MODULES (NAVIGATION)
// ─────────────────────────────────────────────
export const FEATURE_ROUTES = {
  cellules: "/cellule/cellules-hub",
  conseiller: "/conseiller/conseiller-hub",
  evangelisation: "/evangelisation/evangelisation-hub",
  familles: "/famille/familles-hub",
  membres: "/membres/membres-hub",
  rapport: "/rapport/rapport-hub",
  presence: "/Presence",
  enfants: "/enfants/enfants-hub",
  administrateur: "/administrateur/administrateur",
  notifications: "/admin/notifications",
};

// ─────────────────────────────────────────────
// MERGE DB + DEFAULT (IMPORTANT)
// ─────────────────────────────────────────────
export function buildFeaturesState(dbData = []) {
  const map = { ...DEFAULT_FEATURES };
  dbData.forEach((row) => {
    map[row.feature] = row.active === true;
  });
  return map;
}

// ─────────────────────────────────────────────
// SAFE CHECK (ANTI BUG UI)
// ─────────────────────────────────────────────
export function isFeatureActive(features, key) {
  return features?.[key] === true;
}

// ─────────────────────────────────────────────
// SAFE ACCESS + FALLBACK (ULTRA ROBUSTE)
// ─────────────────────────────────────────────
export function canAccessFeature(features, key) {
  if (!features) return DEFAULT_FEATURES[key] === true;
  return features[key] === true;
}

// ─────────────────────────────────────────────
// SEED FEATURES (appelé à la création d'église)
// ─────────────────────────────────────────────
export async function seedDefaultFeatures(supabaseClient, egliseId) {
  const rows = Object.entries(DEFAULT_FEATURES).map(([feature, active]) => ({
    eglise_id: egliseId,
    feature,
    active,
  }));

  const { error } = await supabaseClient
    .from("eglise_features")
    .insert(rows);

  if (error) console.error("Erreur seed features:", error.message);
}
