"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import supabase from "../../lib/supabaseClient";
import EditUserModal from "../../components/EditUserModal";

export default function ListUsers() {
  const router = useRouter();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [roleFilter, setRoleFilter] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("profiles")
        .select(
          "id, prenom, nom, email, telephone, role, role_description, created_at"
        );

      if (roleFilter) query = query.eq("role", roleFilter);

      const { data, error } = await query;
      if (error) throw error;

      setUsers(data || []);
    } catch (err) {
      console.error("❌ Erreur récupération utilisateurs:", err);
      setMessage("Erreur lors de la récupération des utilisateurs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleDeleteConfirm = async () => {
    if (!deleteUser) return;

    const { error } = await supabase
      .from("profiles")
      .delete()
      .eq("id", deleteUser.id);

    if (!error) {
      setUsers((prev) => prev.filter((u) => u.id !== deleteUser.id));
      setDeleteUser(null);
    } else {
      alert("Erreur lors de la suppression.");
    }
  };

  if (loading)
    return <p className="text-center mt-10 text-lg">Chargement...</p>;

  if (message)
    return <p className="text-center text-red-600 mt-10">{message}</p>;

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-green-200 via-orange-100 to-purple-200">

      {/* Retour */}
      <button
        onClick={() => router.back()}
        className="absolute top-4 left-4 text-black font-semibold hover:text-gray-700 transition"
      >
        ← Retour
      </button>

      {/* Header / Logo */}
      <div className="flex flex-col items-center mb-6">
        <Image src="/logo.png" alt="SoulTrack Logo" width={80} height={80} />
        <h1 className="text-3xl font-bold text-center mt-2">
          Gestion des utilisateurs
        </h1>
        <p className="text-center text-gray-700 italic mt-1">
          Administration & gestion des accès
        </p>
      </div>

      {/* Filtres + bouton sur la même ligne */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 max-w-5xl mx-auto gap-3">
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="border p-2 rounded-xl shadow-sm text-center w-full sm:w-auto"
        >
          <option value="">Tous les rôles</option>
          <option value="Administrateur">Admin</option>
          <option value="ResponsableCellule">Responsable Cellule</option>
          <option value="ResponsableEvangelisation">Responsable Evangélisation</option>
          <option value="Conseiller">Conseiller</option>
          <option value="ResponsableIntegration">Responsable Intégration</option>
        </select>

        <button
          onClick={() => router.push("/admin/create-internal-user")}
          className="bg-gradient-to-r from-blue-400 to-indigo-500 text-white font-bold py-2 px-4 rounded-2xl shadow-md hover:from-blue-500 hover:to-indigo-600 w-full sm:w-auto"
        >
          ➕ Créer utilisateur
        </button>
      </div>

      {/* Liste style table mais responsive */}
      <div className="max-w-5xl mx-auto flex flex-col gap-3">
        {/* Header ligne table pour desktop */}
        <div className="hidden sm:grid grid-cols-5 gap-4 px-4 py-2 font-semibold text-white bg-indigo-600 rounded-t-xl">
          <span>Nom complet</span>
          <span>Email</span>
          <span>Téléphone</span>
          <span>Rôle</span>
          <span>Actions</span>
        </div>

        {users.map((user) => (
          <div
            key={user.id}
            className="bg-white/20 backdrop-blur-md rounded-xl shadow-md p-4 animate-fadeIn grid sm:grid-cols-5 items-center gap-2"
          >
            <span className="font-semibold text-gray-700">{user.prenom} {user.nom}</span>
            <span className="text-gray-700">{user.email}</span>
            <span className="text-gray-700">{user.telephone || "-"}</span>
            <span className="font-medium text-indigo-600">{user.role_description || user.role}</span>
            <div className="flex gap-3 mt-2 sm:mt-0">
              <button
                onClick={() => setSelectedUser(user)}
                className="text-blue-600 hover:text-blue-800 text-lg"
              >
                ✏️
              </button>
              <button
                onClick={() => setDeleteUser(user)}
                className="text-red-600 hover:text-red-800 text-lg"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Popup Edit */}
      {selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onUpdated={fetchUsers}
        />
      )}

      {/* Popup suppression */}
      {deleteUser && (
        <div className="fixed inset-0 flex items-center justify-center z-[999] bg-transparent">
          <div className="bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-xl w-[90%] max-w-md text-center animate-fadeIn border">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              Voulez-vous vraiment supprimer :
            </h2>
            <p className="text-lg font-semibold text-red-600 mb-6">
              {deleteUser.prenom} {deleteUser.nom}
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setDeleteUser(null)}
                className="bg-gray-300 px-5 py-2 rounded-xl font-semibold hover:bg-gray-400 transition"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="bg-red-500 text-white px-5 py-2 rounded-xl font-semibold hover:bg-red-600 transition"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>

    </div>
  );
}
