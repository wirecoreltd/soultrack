//lib/accessControl.js
/**
 * Vérifie si un ou plusieurs rôles ont le droit d'accéder à une page.
 * @param {string | string[]} roles - Rôle ou liste de rôles de l'utilisateur
 * @param {string} pathname - Chemin de la page actuelle
 * @returns {boolean} true si accès autorisé, false sinon
 */
export function canAccessPage(roles, pathname) {
  if (!roles || !pathname) return false;

  // 🧠 Supporte aussi bien un seul rôle qu’un tableau
  const roleList = Array.isArray(roles)
    ? roles.map((r) => r.trim())
    : [roles.trim()];

  // 🗺️ Routes principales autorisées pour chaque rôle
  const accessMap = {
    Admin: [
      "/index",
      "/admin",
      "/rapport",
      "/membres-hub",
      "/evangelisation-hub",
      "/cellules-hub",
      "/administrateur",
    ],

    ResponsableIntegration: ["/membres-hub"],

    ResponsableEvangelisation: ["/index", "/evangelisation-hub"],

    ResponsableCellule: ["/cellules-hub"],

    Membre: ["/index"],
  };

  // 🔑 Si l’un des rôles donne accès, on autorise
  for (const role of roleList) {
    const allowedPaths = accessMap[role];
    if (!allowedPaths) continue;

    // ✅ Autorise toutes les sous-pages de ces chemins
    for (const allowed of allowedPaths) {
      if (pathname.startsWith(allowed)) {
        return true;
      }
    }
  }

  return false;
}
