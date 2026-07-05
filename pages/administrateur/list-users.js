"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import supabase from "../../lib/supabaseClient";
import EditUserModal from "../../components/EditUserModal";
import HeaderPages from "../../components/HeaderPages";
import ProtectedRoute from "../../components/ProtectedRoute";
import Footer from "../../components/Footer";
import { useFeature } from "../../components/FeaturesContext";
import { useLang } from "../../hooks/useLang";

const translations = {
  fr: {
    // En-tête
    titreGestion: "Gestion des",
    titreAccent: "utilisateurs",

    // Intro
    intro: "Visualiser, filtrer et gérer tous les utilisateurs de votre église. Chaque",
    introAccent1: "rôle a une responsabilité spécifique",
    introCellules: " : responsables de cellules",
    introConseiller: ", conseillers",
    introFamilles: ", responsables de familles",
    intro2: "et chaque utilisateur contribue à la croissance et au soutien des membres. Utilisez cette interface",
    introAccent2: "pour accompagner, encadrer et développer une communauté solide et fraternelle",

    // Champs / filtres
    chercher: "Chercher...",
    tousRoles: "Tous les rôles",
    total: "Total :",
    ajouter: "➕ Ajouter",
    importerBtn: "📥 Importer une liste",

    // En-tête tableau
    nom: "Nom",
    email: "Email",
    telephone: "Téléphone",
    roles: "Rôles",
    creeLe: "Créé le",
    actions: "Actions",

    // Mobile
    mobileCreeLe: "Créer le :",

    // Chargement
    chargement: "Chargement...",

    // Suppression
    suppressionTitre: (prenom, nom) => `Supprimer ${prenom} ${nom} ?`,
    suppressionSub: "Cette action est irréversible.",
    annuler: "Annuler",
    supprimer: "Supprimer",

    // Libellés rôles
    roleLabels: {
      Administrateur: "Administrateur",
      ResponsableIntegration: "Responsable Intégration",
      ResponsableCellule: "Responsable Cellule",
      ResponsableEvangelisation: "Responsable Évangélisation",
      SuperviseurCellule: "Superviseur Cellule",
      Conseiller: "Conseiller",
      ResponsableFamilles: "Responsable Familles",
    },
  },
  en: {
    // En-tête
    titreGestion: "Manage",
    titreAccent: "users",

    // Intro
    intro: "View, filter and manage all users in your church. Each",
    introAccent1: "role has a specific responsibility",
    introCellules: ": cell group leaders",
    introConseiller: ", counselors",
    introFamilles: ", family leaders",
    intro2: "and each user contributes to the growth and support of members. Use this interface",
    introAccent2: "to accompany, guide and build a strong, brotherly community",

    // Champs / filtres
    chercher: "Search...",
    tousRoles: "All roles",
    total: "Total:",
    ajouter: "➕ Add",
    importerBtn: "📥 Import a list",

    // En-tête tableau
    nom: "Name",
    email: "Email",
    telephone: "Phone",
    roles: "Roles",
    creeLe: "Created on",
    actions: "Actions",

    // Mobile
    mobileCreeLe: "Created:",

    // Chargement
    chargement: "Loading...",

    // Suppression
    suppressionTitre: (prenom, nom) => `Delete ${prenom} ${nom}?`,
    suppressionSub: "This action is irreversible.",
    annuler: "Cancel",
    supprimer: "Delete",

    // Libellés rôles
    roleLabels: {
      Administrateur: "Administrator",
      ResponsableIntegration: "Integration Leader",
      ResponsableCellule: "Cell Group Leader",
      ResponsableEvangelisation: "Evangelization Leader",
      SuperviseurCellule: "Cell Supervisor",
      Conseiller: "Counselor",
      ResponsableFamilles: "Family Leader",
    },
  },
};

/* =========================
   Format date
========================= */
const formatDate = (date, lang) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString(lang === "en" ? "en-GB" : "fr-FR");
};

/* =========================
   Page principale
========================= */
export default function ListUsers() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur"]}>
      <ListUsersContent />
    </ProtectedRoute>
  );
}

function ListUsersContent() {
  const { lang } = useLang();
  const t = translations[lang];

  // ─────────────────────────────────────────────
  // ✅ FEATURES — tous les hooks en premier
  // ─────────────────────────────────────────────
  const cellulesActive    = useFeature("cellules");
  const conseillerActive  = useFeature("conseiller");
  const famillesActive    = useFeature("familles");

  const router = useRouter();
  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [role, setRole]             = useState("");
  const [roles, setRoles]           = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);
  const [search, setSearch]         = useState("");
  const [egliseId, setEgliseId]     = useState(null);

  // ─────────────────────────────────────────────
  // Rôles à masquer selon features désactivées
  // ─────────────────────────────────────────────
  const hiddenRoles = useMemo(() => [
    ...(!cellulesActive   ? ["ResponsableCellule", "SuperviseurCellule"] : []),
    ...(!conseillerActive ? ["Conseiller"] : []),
    ...(!famillesActive   ? ["ResponsableFamilles"] : []),
  ], [cellulesActive, conseillerActive, famillesActive]);

  // ─────────────────────────────────────────────
  // Couleurs de bordure par rôle
  // ─────────────────────────────────────────────
  const roleColors = useMemo(() => ({
    Administrateur:            "#EF4444",
    ResponsableIntegration:    "#3B82F6",
    ResponsableEvangelisation: "#8B5CF6",
    ...(cellulesActive   && { ResponsableCellule:  "#10B981" }),
    ...(cellulesActive   && { SuperviseurCellule:  "#F59E0B" }),
    ...(conseillerActive && { Conseiller:          "#14B8A6" }),
    ...(famillesActive   && { ResponsableFamilles: "#F97316" }),
  }), [cellulesActive, conseillerActive, famillesActive]);

  // ─── Récupérer eglise_id de l'admin connecté ───
  useEffect(() => {
    const fetchUserScope = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("eglise_id")
        .eq("id", user.id)
        .single();

      if (profile?.eglise_id) setEgliseId(profile.eglise_id);
    };
    fetchUserScope();
  }, []);

  // ─── Charger les utilisateurs dès qu'on a eglise_id ───
  useEffect(() => {
    if (!egliseId) return;
    fetchUsers();
  }, [egliseId, hiddenRoles]);

  const fetchUsers = async () => {
    setLoading(true);

    const { data } = await supabase
      .from("profiles")
      .select("id, prenom, nom, email, telephone, roles, created_at")
      .eq("eglise_id", egliseId)
      .order("created_at", { ascending: true });

    setUsers(data || []);

    const allRoles = Array.from(
      new Set((data || []).flatMap((u) => u.roles || []))
    ).filter((r) => !hiddenRoles.includes(r));

    setRoles(allRoles);
    setLoading(false);
  };

  // ─── Recalculer les rôles affichés si hiddenRoles change ───
  useEffect(() => {
    if (users.length === 0) return;
    const allRoles = Array.from(
      new Set(users.flatMap((u) => u.roles || []))
    ).filter((r) => !hiddenRoles.includes(r));
    setRoles(allRoles);
  }, [hiddenRoles, users]);

  const handleDelete = async () => {
    if (!deleteUser?.id) return;
    try {
      const { error: authError } = await supabase.functions.invoke("dynamic-worker", {
        body: { member_id: deleteUser.id },
      });
      if (authError) console.warn("Edge Function (ignoré):", authError);

      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", deleteUser.id);

      if (profileError) throw profileError;

      setUsers(users.filter((u) => u.id !== deleteUser.id));
      setDeleteUser(null);
    } catch (err) {
      console.error("Erreur suppression :", err);
      alert("❌ Erreur : " + (err.message || "inconnue"));
    }
  };

  const handleUpdated = (updatedUser) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
    );
  };

  const filteredUsers = users
    .filter((u) => (role ? u.roles?.includes(role) : true))
    .filter(
      (u) =>
        u.prenom?.toLowerCase().includes(search.toLowerCase()) ||
        u.nom?.toLowerCase().includes(search.toLowerCase())
    );

  if (loading)
    return <p className="text-center mt-10 text-white">{t.chargement}</p>;

  return (
    <div className="min-h-screen p-6 bg-[#333699]">
      <HeaderPages />

      <h1 className="text-2xl font-bold mt-4 mb-6 text-blue-300 text-center text-white">
        {t.titreGestion} <span className="text-emerald-300">{t.titreAccent}</span>
      </h1>

      {/* ─── Intro conditionnée par features ─── */}
      <div className="max-w-3xl w-full mb-6 text-center mx-auto">
        <p className="italic text-base text-white/90">
          {t.intro}{" "}
          <span className="text-blue-300 font-semibold">{t.introAccent1}</span>
          {cellulesActive   && t.introCellules}
          {conseillerActive && t.introConseiller}
          {famillesActive   && t.introFamilles}
          {" "}{t.intro2}{" "}
          <span className="text-blue-300 font-semibold">{t.introAccent2}</span>.
        </p>
      </div>

      {/* ─── Barre de recherche + filtres ─── */}
      <div className="max-w-6xl w-full mx-auto mb-6 flex flex-col gap-3">
        <input
          type="text"
          placeholder={t.chercher}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-1/2 mx-auto px-4 py-2 rounded-md text-black"
        />

        <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="px-4 py-2 rounded-md text-black"
          >
            <option value="">{t.tousRoles}</option>
            {roles.map((r) => (
              <option key={r} value={r}>
                {t.roleLabels[r] || r}
              </option>
            ))}
          </select>
          <span className="text-white text-sm">
            {t.total} {filteredUsers.length}
          </span>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={() => router.push("/admin/import-user")}
            className="text-white px-4 py-2"
          >
            {t.importerBtn}
          </button>
          <button
            onClick={() => router.push("/administrateur/create-internal-user")}
            className="text-white px-4 py-2"
          >
            {t.ajouter}
          </button>
        </div>
      </div>

      {/* ─── Tableau ─── */}
      <div className="max-w-6xl mx-auto space-y-2">

        {/* En-tête desktop */}
        <div className="hidden sm:flex text-sm font-semibold text-white border-b pb-2">
          <div className="flex-[2] ml-2">{t.nom}</div>
          <div className="flex-[2]">{t.email}</div>
          <div className="flex-[2]">{t.telephone}</div>
          <div className="flex-[2]">{t.roles}</div>
          <div className="flex-[2]">{t.creeLe}</div>
          <div className="flex-[1] text-center">{t.actions}</div>
        </div>

        {filteredUsers.map((u) => (
          <UserRow
            key={u.id}
            u={u}
            roleColors={roleColors}
            roleLabels={t.roleLabels}
            hiddenRoles={hiddenRoles}
            setSelectedUser={setSelectedUser}
            setDeleteUser={setDeleteUser}
            lang={lang}
            t={t}
          />
        ))}
      </div>

      {/* ─── Modal édition ─── */}
      {selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onUpdated={handleUpdated}
        />
      )}

      {/* ─── Modal suppression ─── */}
      {deleteUser && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded-xl text-center shadow-lg">
            <p className="mb-2 font-semibold text-gray-800">
              {t.suppressionTitre(deleteUser.prenom, deleteUser.nom)}
            </p>
            <p className="text-sm text-gray-500 mb-4">{t.suppressionSub}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setDeleteUser(null)}
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                {t.annuler}
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
              >
                {t.supprimer}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

/* =========================
   Ligne utilisateur
========================= */
function UserRow({ u, roleColors, roleLabels, hiddenRoles, setSelectedUser, setDeleteUser, lang, t }) {
  const roles = (u.roles || []).filter((r) => !hiddenRoles.includes(r));

  const rolesDisplay =
    roles.length > 0
      ? roles.map((r) => roleLabels[r] || r).join(" / ")
      : "";

  const mainRole    = roles[0];
  const borderColor = roleColors[mainRole] || "#F59E0B";

  return (
    <>
      {/* ═══════════ DESKTOP ═══════════ */}
      <div
        className="hidden sm:flex flex-row items-center px-4 py-3 rounded-lg gap-2 bg-white/10 border-l-4 text-sm"
        style={{ borderLeftColor: borderColor }}
      >
        <div className="flex-[2] text-white font-semibold">
          {u.prenom} {u.nom}
        </div>
        <div className="flex-[2] text-white">{u.email}</div>
        <div className="flex-[2] text-white">{u.telephone || "-"}</div>
        <div className="flex-[2] text-white">{rolesDisplay}</div>
        <div className="flex-[2] text-amber-300 text-sm">
          {formatDate(u.created_at, lang)}
        </div>
        <div className="flex-[1] flex justify-center gap-2">
          <button
            onClick={() => setSelectedUser(u)}
            className="text-blue-400 hover:text-blue-600"
          >
            ✏️
          </button>
          <button
            onClick={() => setDeleteUser(u)}
            className="text-red-400 hover:text-red-600"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* ═══════════ MOBILE ═══════════ */}
      <div
        className="sm:hidden flex flex-col p-4 rounded-xl bg-white/10 border-l-4 gap-2"
        style={{ borderLeftColor: borderColor }}
      >
        <div className="text-right text-amber-300 text-xs">
          {t.mobileCreeLe} {formatDate(u.created_at, lang)}
        </div>
        <div className="text-center space-y-1.5">
          <div className="text-white font-semibold">
            {u.prenom} {u.nom}
          </div>
          <div className="text-white flex justify-center items-center gap-1">
            <span>📞</span>
            <span>{u.telephone || "-"}</span>
          </div>
          <div className="text-white flex justify-center items-center gap-1 break-all">
            <span>📧</span>
            <span>{u.email}</span>
          </div>
          {rolesDisplay && (
            <div className="flex justify-center items-center gap-1 text-orange-400 font-semibold mt-1">
              <span>{rolesDisplay}</span>
            </div>
          )}
        </div>
        <div className="mt-2 flex justify-center gap-3 pt-2">
          <button
            onClick={() => setSelectedUser(u)}
            className="text-blue-400 text-sm leading-none"
          >
            ✏️
          </button>
          <button
            onClick={() => setDeleteUser(u)}
            className="text-red-400 text-base leading-none"
          >
            🗑️
          </button>
        </div>
      </div>
    </>
  );
}
