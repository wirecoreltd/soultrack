"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import supabase from "../../lib/supabaseClient";
import EditUserModal from "../../components/EditUserModal";

export default function ListUsers() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("id, prenom, nom, telephone, role, role_description");

    if (!error) setUsers(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (user) => {
    if (!confirm(`Voulez-vous vraiment supprimer ${user.prenom} ${user.nom} ?`)) return;
    const { error } = await supabase.from("profiles").delete().eq("id", user.id);
    if (!error) setUsers(users.filter((u) => u.id !== user.id));
  };

  if (loading) return <p className="text-center mt-10 text-lg">Chargement...</p>;

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-green-200 via-orange-100 to-purple-200">
      <button
        onClick={() => router.back()}
        className="absolute top-4 left-4 text-black font-semibold hover:text-gray-700 transition"
      >
        ← Retour
      </button>

      <div className="flex justify-between items-center max-w-5xl mx-auto mb-6">
        <button
          onClick={() => router.push("/admin/create-internal-user")}
          className="bg-gradient-to-r from-blue-400 to-indigo-500 text-white font-bold py-2 px-4 rounded-2xl shadow-md"
        >
          ➕ Créer utilisateur
        </button>
      </div>

      <div className="max-w-5xl mx-auto border border-gray-200 rounded-xl overflow-hidden">
        <div className="grid grid-cols-[2fr_1fr_auto] gap-4 px-4 py-2 bg-indigo-600 text-white font-semibold">
          <span>Nom complet</span>
          <span>Rôle</span>
          <span className="text-center">Actions</span>
        </div>

        {users.map((user) => (
          <div
            key={user.id}
            className="grid grid-cols-[2fr_1fr_auto] gap-4 px-4 py-3 items-center border-b border-gray-200"
          >
            <span className="font-semibold text-gray-700">{user.prenom} {user.nom}</span>
            <span className="text-indigo-600 font-medium">{user.role_description || user.role}</span>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setSelectedUser(user)}
                className="text-blue-600 hover:text-blue-800 text-lg"
              >
                ✏️
              </button>
              <button
                onClick={() => handleDelete(user)}
                className="text-red-600 hover:text-red-800 text-lg"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onUpdated={fetchUsers}
        />
      )}
    </div>
  );
}
