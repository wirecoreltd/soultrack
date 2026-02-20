"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import supabase from "../../lib/supabaseClient";
import EditUserModal from "../../components/EditUserModal";
import HeaderPages from "../../components/HeaderPages";
import ProtectedRoute from "../../components/ProtectedRoute";
import Footer from "../../components/Footer";

/* =========================
   Ligne utilisateur
========================= */
function UserRow({ u, setSelectedUser, setDeleteUser }) {
  // Table de correspondance pour l'affichage lisible des rôles
  const roleLabels = {
    Administrateur: "Administrateur",
    ResponsableIntegration: "Responsable Intégration",
    ResponsableCellule: "Responsable Cellule",
    ResponsableEvangelisation: "Responsable Évangélisation",
    SuperviseurCellule: "Superviseur Cellule",
    Conseiller: "Conseiller",
  };

  // Construire la chaîne à afficher pour les rôles
  const rolesDisplay = (u.roles && u.roles.length > 0)
    ? u.roles.map(role => roleLabels[role] || role).join(" / ")
    : roleLabels[u.role] || u.role || "";

  return (
    <div className="flex flex-row items-center px-4 py-2 rounded-lg gap-2 bg-white/15 border-l-4 text-sm" style={{ borderLeftColor: "#F59E0B" }}>
      <div className="flex-[2] text-white font-semibold">{u.prenom} {u.nom}</div>
      <div className="flex-[2] text-white">{u.email}</div>
      <div className="flex-[2] text-white font-medium">{rolesDisplay}</div>
      {/* Actions */}
      <div className="flex-[1] flex justify-center gap-2">
        <button onClick={() => setSelectedUser(u)} className="text-blue-400 hover:text-blue-600 text-lg">✏️</button>
        <button onClick={() => setDeleteUser(u)} className="text-red-400 hover:text-red-600 text-lg">🗑️</button>
      </div>
    </div>
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

  const [userScope, setUserScope] = useState({
    eglise_id: null,
    branche_id: null,
  });

  /* =========================
     Récupération scope utilisateur
  ========================== */
  useEffect(() => {
    const fetchUserScope = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      if (!user) return;

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("eglise_id, branche_id")
        .eq("id", user.id)
        .single();

      if (!error && profile) {
        setUserScope({
          eglise_id: profile.eglise_id,
          branche_id: profile.branche_id,
        });
      }
    };
    fetchUserScope();
  }, []);

  /* =========================
     Récupération utilisateurs
  ========================== */
  useEffect(() => {
    if (!userScope.eglise_id || !userScope.branche_id) return;
    fetchUsers();
  }, [userScope]);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("id, prenom, nom, email, telephone, roles, created_at")
      .eq("eglise_id", userScope.eglise_id)
      .eq("branche_id", userScope.branche_id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    setUsers(data || []);

    // Liste unique de tous les rôles pour le filtre
    const allRoles = Array.from(new Set((data || []).flatMap(u => u.roles || [])));
    setRoles(allRoles);
    setLoading(false);
  };

  /* =========================
     Delete utilisateur
  ========================== */
  const handleDelete = async () => {
    if (!deleteUser?.id) return;
    const { error } = await supabase.from("profiles").delete().eq("id", deleteUser.id);
    if (!error) {
      setUsers(users.filter(u => u.id !== deleteUser.id));
      setDeleteUser(null);
    }
  };

  /* =========================
     Update utilisateur
  ========================== */
  const handleUpdated = (updatedUser) => {
    if (!updatedUser || !updatedUser.id) return;
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

  /* =========================
     Filtrage + recherche
  ========================== */
  const filteredUsers = users
    .filter(u => role ? u.roles?.includes(role) : true)
    .filter(u => u.prenom.toLowerCase().includes(search.toLowerCase()) || u.nom.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <p className="text-center mt-10 text-white text-lg">Chargement...</p>;

  return (
    <div className="min-h-screen p-6 bg-[#333699]">
      <HeaderPages />

      <h1 className="text-4xl text-white text-center mb-6 font-bold">Gestion des utilisateurs</h1>

      {/* Barre recherche / filtre / actions */}
      <div className="max-w-6xl w-full mx-auto mb-6 flex flex-col gap-3">
        <div className="flex justify-center">
          <input
            type="text"
            placeholder="Chercher un membre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-1/2 px-4 py-2 rounded-md text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="px-4 py-2 rounded-md text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            <option value="">Tous les rôles</option>
            {roles.map(r => <option key={r} value={r}>{r}</option>)}
          </select>

          <span className="text-white text-sm font-medium">
            Total : {filteredUsers.length}
          </span>
        </div>

        <div className="flex justify-end">
          <button
             onClick={() => router.push("/admin/create-internal-user")}
             className="text-white font-semibold px-4 py-2 rounded shadow text-sm"
           >
             ➕ Ajouter un utilisateur
           </button>
        </div>
      </div>

      {/* Liste des utilisateurs */}
      <div className="max-w-6xl mx-auto space-y-2">
        <div className="hidden sm:flex text-sm font-semibold text-white border-b pb-2">
          <div className="flex-[2]">Nom complet</div>
          <div className="flex-[2]">Email</div>
          <div className="flex-[2]">Rôles</div>
          <div className="flex-[1] text-center">Actions</div>
        </div>

        {filteredUsers.length === 0 ? (
          <p className="text-white text-center mt-6">Aucun utilisateur</p>
        ) : (
          filteredUsers.map(u => (
            <UserRow key={u.id} u={u} setSelectedUser={setSelectedUser} setDeleteUser={setDeleteUser} />
          ))
        )}
      </div>

      {/* Modals */}
      {selectedUser && <EditUserModal user={selectedUser} onClose={() => setSelectedUser(null)} onUpdated={handleUpdated} />}

      {deleteUser && (
        <div className="fixed inset-0 flex items-center justify-center z-[999] bg-black/50">
          <div className="bg-white p-8 rounded-3xl shadow-xl w-[90%] max-w-md text-center">
            <h2 className="text-xl font-bold mb-4">Voulez-vous vraiment supprimer :</h2>
            <p className="text-lg font-semibold text-red-600 mb-6">{deleteUser.prenom} {deleteUser.nom}</p>
            <div className="flex gap-4 justify-center">
              <button onClick={() => setDeleteUser(null)} className="bg-gray-300 px-5 py-2 rounded-xl font-semibold hover:bg-gray-400">Annuler</button>
              <button onClick={handleDelete} className="bg-red-500 text-white px-5 py-2 rounded-xl font-semibold hover:bg-red-600">Supprimer</button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
