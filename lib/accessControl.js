// lib/accessControl.js
/**
 * Vérifie si un ou plusieurs rôles ont le droit d'accéder à une page.
 * @param {string[] | string} roles - Rôle ou liste de rôles de l'utilisateur
 * @param {string} pathname - Chemin de la page actuelle
 * @returns {boolean} true si accès autorisé, false sinon
 */
export function canAccessPage(roles, pathname) {
  if (!roles || !pathname) return false;

  const roleList = Array.isArray(roles) ? roles : [roles];
  const normalizedRoles = roleList.map(r => r.toLowerCase().trim());

  const accessMap = {
    admin: [
      "/index",
      "/administrateur",
      "/rapport",
      "/membres-hub",
      "/evangelisation-hub",
      "/cellules-hub",
      "/admin/create-internal-user",
      "/admin/create-responsable-cellule",
      "/admin/reset-password",
    ],
    responsableintegration: ["/membres-hub"],
    responsableevangelisation: ["/index", "/evangelisation-hub"],
    responsablecellule: ["/cellules-hub"],
    membre: ["/index"],
  };

  for (const role of normalizedRoles) {
    const allowedPaths = accessMap[role];
    if (!allowedPaths) continue;

    if (allowedPaths.some(p => pathname.startsWith(p))) return true;
  }

  return false;
}
