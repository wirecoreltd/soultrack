// lib/accessControl.js

/**
 * Vérifie si un rôle donné a le droit d'accéder à une page.
 * @param {string} role - Le rôle de l'utilisateur (Admin, ResponsableIntegration, ResponsableEvangelisation, ResponsableCellule)
 * @param {string} pathname - Le chemin de la page actuelle (ex: "/admin/create-internal-user")
 * @returns {boolean} true si accès autorisé, false sinon
 */
export function canAccessPage(role, pathname) {
  if (!role || !pathname) return false;

  // 🔠 Normalisation du rôle
  const normalizedRole = role.trim();

  // 🔐 Cartographie des accès par rôle
  const accessMap = {
    Admin: [
      "/index",
      "/admin/create-internal-user",
      "/rapport",
      "/membres-hub",
      "/evangelisation-hub",
      "/administrateur",
      "/cellules-hub",      
      "/admin/reset-password", // si tu ajoutes une page reset
    ],

    ResponsableIntegration: [
      "/membres-hub",
    ],

    ResponsableEvangelisation: [
      "/index",
      "/evangelisation-hub",
    ],
    
    ResponsableCellule: [
      "/cellules-hub",
    ],    

    Membre: [
      "/index",
    ],
  };

  // 🧱 Si le rôle n’a pas de règle d’accès connue
  if (!accessMap[normalizedRole]) return false;

  // 🟢 Autorise si le chemin correspond à une route autorisée
  const allowed = accessMap[normalizedRole].some((allowedPath) =>
    pathname.startsWith(allowedPath)
  );

  return allowed;
}
