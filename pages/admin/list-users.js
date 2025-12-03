"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import supabase from "../../lib/supabaseClient";
import EditUserModal from "../../components/EditUserModal";

export default function ListUsers() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("");
  const [roles, setRoles] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("id, prenom, nom, role_description, created_at")
      .order("created_at", { ascending: true });

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    setUsers(data || []);
    const uniqueRoles = [...new Set((data || []).map(u => u.role_description).filter(Boolean))];
    setRoles(uniqueRoles);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async () => {
    if (!deleteUser?.id) return;
    const { error } = await supabase.from("profiles").delete().eq("id", deleteUser.id);
    if (!error) {
      setUsers(users.filter(u => u.id !== deleteUser.id));
      setDeleteUser(null);
    }
  };

  const handleUpdated = (updatedUser) => {
    if (!updatedUser || !updatedUser.id) return;
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

  const filteredUsers = roleFilter ? users.filter(u => u.role_description === roleFilter) : users;

  if (loading) return <p className="text-center mt-10 text-lg">Chargement...</p>;

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-green-200 via-orange-100 to-purple-200">
      <button onClick={() => router.back()} className="absolute top-4 left-4 text-black font-semibold hover:text-gray-700">← Retour</button>

      <div className="flex flex-col items-center mb-6">
        <Image src="/logo.png" alt="Logo" width={80} height={80} />
        <h1 className="text-3xl font-bold text-center mt-2">Gestion des utilisateurs</h1>
      </div>

      <div className="flex justify-start items-center mb-6 max-w-5xl mx-auto gap-4">
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="border p-2 rounded-xl shadow-sm text-left w-auto">
          <option value="">Tous les rôles</option>
          {roles.map(r => <option key={r} value={r}>{r}</option>)}
        </select>

        <button onClick={() => router.push("/admin/create-internal-user")} className="bg-gradient-to-r from-blue-400 to-indigo-500 text-white font-bold py-2 px-4 rounded-2xl shadow-md hover:from-blue-500 hover:to-indigo-600">
          ➕ Créer utilisateur
        </button>
      </div>

      <div className="max-w-5xl mx-auto border border-gray-200 rounded-xl overflow-hidden">
        <div className="grid grid-cols-[2fr_1fr_auto] gap-4 px-4 py-2 bg-indigo-600 text-white font-semibold">
          <span>Nom complet</span>
          <span>Rôle</span>
          <span className="text-center">Actions</span>
        </div>

        {filteredUsers.map(user => (
          <div key={user.id} className="grid grid-cols-[2fr_1fr_auto] gap-4 px-4 py-3 border-b border-gray-200">
            <span className="font-semibold text-gray-700">{user.prenom} {user.nom}</span>
            <span className="text-indigo-600 font-medium text-left">{user.role_description}</span>
            <div className="flex justify-center gap-3">
              <button onClick={() => setSelectedUser(user)} className="text-blue-600 hover:text-blue-800 text-lg">✏️</button>
              <button onClick={() => setDeleteUser(user)} className="text-red-600 hover:text-red-800 text-lg">🗑️</button>
            </div>
          </div>
        ))}
      </div>

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
    </div>
  );
}
