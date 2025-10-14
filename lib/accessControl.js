// /lib/accessControl.js

// Définition centralisée des accès par rôle
export const ROLE_PERMISSIONS = {
  Admin: {
    pages: [
      "/index",
      "/membres-hub",
      "/evangelisation-hub",
      "/rapport",
      "/admin/create-internal-user",
    ],
    actions: ["create_user", "view_reports", "send_links", "manage_members"],
  },
  ResponsableIntegration: {
    pages: ["/index", "/membres-hub"],
    actions: ["manage_members", "send_links"],
  },
  ResponsableEvangelisation: {
    pages: ["/index", "/evangelisation-hub"],
    actions: ["send_links"],
  },
  Membre: {
    pages: ["/index"],
    actions: [],
  },
};

// Vérifie si un rôle a accès à une page donnée
export const canAccessPage = (role, path) => {
  if (!ROLE_PERMISSIONS[role]) return false;
  return ROLE_PERMISSIONS[role].pages.includes(path);
};

// Vérifie si un rôle peut faire une action donnée
export const canPerformAction = (role, action) => {
  if (!ROLE_PERMISSIONS[role]) return false;
  return ROLE_PERMISSIONS[role].actions.includes(action);
};
