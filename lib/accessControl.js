// lib/accessControl.js
export function canAccessPage(roles, pathname) {
  if (!roles || !pathname) return false;

  const cleanPath = pathname.toLowerCase().replace(/\/$/, "");
  const roleList = Array.isArray(roles) ? roles.map(r => r.trim()) : [roles.trim()];

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
    ResponsableIntegration: ["/index", "/membres-hub"],
    ResponsableEvangelisation: ["/index", "/evangelisation-hub"],
    ResponsableCellule: ["/cellules-hub"],
    Membre: ["/index"],
  };

  return roleList.some(role =>
    (accessMap[role] || []).some(path => cleanPath.startsWith(path))
  );
}
