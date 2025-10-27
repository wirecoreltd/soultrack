// lib/accessControl.js

export function canAccessPage(roles, pathname) {
  if (!roles || !pathname) return false;

  const path = pathname.toLowerCase().replace(/\/$/, "");
  const roleList = Array.isArray(roles) ? roles : [roles];

  const normalizedRoles = roleList.map(r => r.trim());

  const accessMap = {
    Admin: [
      "/index",
      "/admin",
      "/rapport",
      "/membres-hub",
      "/evangelisation-hub",
      "/cellules-hub",
      "/administrateur",
      "/suivis-membres",
      "/suivis-evangelisation",
    ],
    ResponsableIntegration: ["/membres-hub"], // accès strict
    ResponsableEvangelisation: ["/evangelisation-hub"], 
    ResponsableCellule: ["/cellules-hub"],
    Membre: [], // pas d'accès par défaut à /index
  };

  for (const role of normalizedRoles) {
    const allowed = accessMap[role];
    if (!allowed) continue;

    // 🔹 comparaison stricte : path doit correspondre exactement à une des routes autorisées
    if (allowed.includes(path)) return true;
  }

  return false;
}
