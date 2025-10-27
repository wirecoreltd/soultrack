// pages/admin/user-management.js

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "../../lib/supabaseClient";
import Link from "next/link";

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 🔹 Charger les utilisateurs depuis Supabase
  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    if (error) {
      console.error("Erreur lors du fetch:", error);
      setLoading(false);
      return;
    }
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 🔹 Supprimer un utilisateur
  const handleDelete = async (id) => {
    if (!confirm("⚠️ Voulez-vous vraiment supprimer cet utilisateur ?")) return;

    const { error } = await supabase.from("profiles").delete().eq("id", id);
    if (error) {
      alert("Erreur lors de la suppression : " + error.message);
      return;
    }
    alert("Utilisateur supprimé ✅");
    fetchUsers();
  };

  // 🔹 Modifier un utilisateur (simple prompt pour exemple)
  const handleEdit = async (user) => {
    const newRole = prompt("Modifier le rôle :", user.role);
    if (!newRole) return;

    const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", user.id);
    if (error) {
      alert("Erreur lors de la modification : " + error.message);
      return;
    }
    alert("Rôle mis à jour ✅");
    fetchUsers();
  };

  if (loading) return <div className="text-center mt-20">Chargement...</div>;

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-center">Gestion des utilisateurs</h1>

      <div className="mb-6 text-center">
        <Link
          href="/admin/create-internal-user"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          ➕ Créer un nouvel utilisateur
        </Link>
      </div>

      <table className="w-full table-auto border-collapse border border-gray-300 bg-white rounded-lg shadow-md">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-4 py-2">Nom</th>
            <th className="border px-4 py-2">Prénom</th>
            <th className="border px-4 py-2">Email</th>
            <th className="border px-4 py-2">Role</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="text-center">
              <td className="border px-4 py-2">{user.nom}</td>
              <td className="border px-4 py-2">{user.prenom}</td>
              <td className="border px-4 py-2">{user.email}</td>
              <td className="border px-4 py-2">{user.role}</td>
              <td className="border px-4 py-2 space-x-2">
                <button
                  onClick={() => handleEdit(user)}
                  className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500 transition"
                >
                  ✏️ Modifier
                </button>
                <button
                  onClick={() => handleDelete(user.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                >
                  🗑️ Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
