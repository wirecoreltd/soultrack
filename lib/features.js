// ─────────────────────────────────────────────
// DEFAULT FEATURES (SOURCE MÉTIER)
// ─────────────────────────────────────────────

export const DEFAULT_FEATURES = {
  cellules: true,
  conseiller: true,
  evangelisation: true,
  membres: true,
  rapport: true,
  presence: true,
  administrateur: true,
  notifications: true,

  // ❌ désactivé par défaut
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
