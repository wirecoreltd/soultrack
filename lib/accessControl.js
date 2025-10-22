// lib/accessControl.js

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

  const accessMap = {
    Admin: [
      "/index",
      "/admin/create-internal-user",
      "/rapport",
      "/membres-hub",
      "/evangelisation-hub",
      "/administrateur",
      "/cellules-hub",
      "/admin/create-user",
      "admin/create-responsable-cellule,
      "/admin/reset-password",
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

    if (allowedPaths.some((allowed) => pathname.startsWith(allowed))) {
      return true;
    }
  }

  return false;
}
