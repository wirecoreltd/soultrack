"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import supabase from "../../lib/supabaseClient";
import EditUserModal from "../../components/EditUserModal";
import HeaderPages from "../../components/HeaderPages";
import ProtectedRoute from "../../components/ProtectedRoute";
import Footer from "../../components/Footer";

/* =========================
   Couleurs rôles
========================= */
const roleColors = {
  Administrateur: "#EF4444",
  ResponsableIntegration: "#3B82F6",
  ResponsableCellule: "#10B981",
  ResponsableEvangelisation: "#8B5CF6",
  SuperviseurCellule: "#F59E0B",
  Conseiller: "#14B8A6",
};

/* =========================
   Format date
========================= */
const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("fr-FR");
};

/* =========================
   Ligne utilisateur
========================= */
function UserRow({ u, setSelectedUser, setDeleteUser }) {
  const roleLabels = {
    Administrateur: "Administrateur",
    ResponsableIntegration: "Responsable Intégration",
    ResponsableCellule: "Responsable Cellule",
    ResponsableEvangelisation: "Responsable Évangélisation",
    SuperviseurCellule: "Superviseur Cellule",
    Conseiller: "Conseiller",
  };

  const roles = u.roles || [];
  const rolesDisplay =
    roles.length > 0
      ? roles.map((r) => roleLabels[r] || r).join(" / ")
      : "";

  const mainRole = roles[0];
  const borderColor = roleColors[mainRole] || "#F59E0B";

  return (
    <>
      {/* ================= DESKTOP ================= */}
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
          {formatDate(u.created_at)}
        </div>
        <div className="flex-[1] flex justify-center gap-2">
          <button onClick={() => setSelectedUser(u)} className="text-blue-400 hover:text-blue-600">✏️</button>
          <button onClick={() => setDeleteUser(u)} className="text-red-400 hover:text-red-600">🗑️</button>
        </div>
      </div>

      {/* ================= MOBILE ================= */}
      <div
        className="sm:hidden flex flex-col p-4 rounded-xl bg-white/10 border-l-4 gap-2"
        style={{ borderLeftColor: borderColor }}
      >
        <div className="text-right text-amber-300 text-xs">
          Créer le : {formatDate(u.created_at)}
        </div>
        <div className="text-center space-y-1.5">
          <div className="text-white font-semibold">{u.prenom} {u.nom}</div>
          <div className="text-white flex justify-center items-center gap-1">
            <span>📞</span><span>{u.telephone || "-"}</span>
          </div>
          <div className="text-white flex justify-center items-center gap-1 break-all">
            <span>📧</span><span>{u.email}</span>
          </div>
          <div className="flex justify-center items-center gap-1 text-orange-400 font-semibold mt-1">
            <span>🎖️</span><span>{rolesDisplay}</span>
          </div>
        </div>
        <div className="mt-2 flex justify-center gap-3 pt-2">
          <button onClick={() => setSelectedUser(u)} className="text-blue-400 text-sm leading-none">✏️</button>
          <button onClick={() => setDeleteUser(u)} className="text-red-400 text-base leading-none">🗑️</button>
        </div>
      </div>
    </>
  );
}

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
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("");
  const [roles, setRoles] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);
  const [search, setSearch] = useState("");

  // ✅ Plus de branche_id dans le scope
  const [egliseId, setEgliseId] = useState(null);

  // ─── Récupérer eglise_id de l'admin connecté ───
  useEffect(() => {
    const fetchUserScope = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      if (!user) return;

      // ✅ On ne sélectionne plus branche_id
      const { data: profile } = await supabase
        .from("profiles")
        .select("eglise_id")
        .eq("id", user.id)
        .single();

      if (profile?.eglise_id) {
        setEgliseId(profile.eglise_id);
      }
    };
    fetchUserScope();
  }, []);

  // ─── Charger les utilisateurs dès qu'on a eglise_id ───
  useEffect(() => {
    if (!egliseId) return;
    fetchUsers();
  }, [egliseId]);

  const fetchUsers = async () => {
    setLoading(true);

    // ✅ Filtre uniquement par eglise_id (plus de branche_id)
    const { data } = await supabase
      .from("profiles")
      .select("id, prenom, nom, email, telephone, roles, created_at")
      .eq("eglise_id", egliseId)
      .order("created_at", { ascending: true });

    setUsers(data || []);

    const allRoles = Array.from(
      new Set((data || []).flatMap((u) => u.roles || []))
    );
    setRoles(allRoles);
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteUser?.id) return;
    await supabase.from("profiles").delete().eq("id", deleteUser.id);
    setUsers(users.filter((u) => u.id !== deleteUser.id));
    setDeleteUser(null);
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
    return <p className="text-center mt-10 text-white">Chargement...</p>;

  return (
    <div className="min-h-screen p-6 bg-[#333699]">
      <HeaderPages />

      <h1 className="text-2xl font-bold mt-4 mb-6 text-blue-300 text-center text-white">
        Gestion des <span className="text-emerald-300">utilisateurs</span>
      </h1>

      <div className="max-w-3xl w-full mb-6 text-center mx-auto">
        <p className="italic text-base text-white/90">
          Visualiser, filtrer et gérer tous les utilisateurs de votre église. Chaque{" "}
          <span className="text-blue-300 font-semibold">rôle a une responsabilité spécifique</span>, et
          chaque utilisateur contribue à la croissance et au soutien des membres. Utilisez cette interface{" "}
          <span className="text-blue-300 font-semibold">
            pour accompagner, encadrer et développer une communauté solide et fraternelle
          </span>.
        </p>
      </div>

      <div className="max-w-6xl w-full mx-auto mb-6 flex flex-col gap-3">
        <input
          type="text"
          placeholder="Chercher..."
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
            <option value="">Tous les rôles</option>
            {roles.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
          <span className="text-white text-sm">Total : {filteredUsers.length}</span>
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => router.push("/admin/create-internal-user")}
            className="text-white px-4 py-2"
          >
            ➕ Ajouter
          </button>
        </div>
      </div>

      {/* En-tête tableau desktop */}
      <div className="max-w-6xl mx-auto space-y-2">
        <div className="hidden sm:flex text-sm font-semibold text-white border-b pb-2">
          <div className="flex-[2] ml-2">Nom</div>
          <div className="flex-[2]">Email</div>
          <div className="flex-[2]">Téléphone</div>
          <div className="flex-[2]">Rôles</div>
          <div className="flex-[2]">Créé le</div>
          <div className="flex-[1] text-center">Actions</div>
        </div>

        {filteredUsers.map((u) => (
          <UserRow
            key={u.id}
            u={u}
            setSelectedUser={setSelectedUser}
            setDeleteUser={setDeleteUser}
          />
        ))}
      </div>

      {/* Modal édition */}
      {selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onUpdated={handleUpdated}
        />
      )}

      {/* Modal suppression */}
      {deleteUser && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded-xl text-center shadow-lg">
            <p className="mb-2 font-semibold text-gray-800">
              Supprimer {deleteUser.prenom} {deleteUser.nom} ?
            </p>
            <p className="text-sm text-gray-500 mb-4">Cette action est irréversible.</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setDeleteUser(null)}
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
