"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import supabase from "../../lib/supabaseClient";
import EditUserModal from "../../components/EditUserModal"; // 🔥 Popup import

export default function ListUsers() {
  const router = useRouter();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // Filtres
  const [roleFilter, setRoleFilter] = useState("");

  // Popup
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("profiles")
        .select("id, prenom, nom, email, telephone, role, created_at");

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

  const handleDelete = async (id) => {
    if (!confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) return;

    const { error } = await supabase.from("profiles").delete().eq("id", id);

    if (error) {
      alert("Erreur suppression utilisateur.");
    } else {
      setUsers((prev) => prev.filter((u) => u.id !== id));
    }
  };

  if (loading)
    return <p className="text-center mt-10 text-lg">Chargement...</p>;

  if (message)
    return <p className="text-center text-red-600 mt-10">{message}</p>;

  return (
    <div className="min-h-screen flex items-start justify-center bg-white p-6">

      <div className="w-full max-w-5xl bg-white p-8 rounded-3xl shadow-lg relative">

        {/* RETOUR */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 text-black font-semibold hover:text-gray-700 transition"
        >
          ← Retour
        </button>

        {/* LOGO */}
        <div className="flex justify-center mb-6">
          <Image src="/logo.png" alt="SoulTrack Logo" width={80} height={80} />
        </div>

        <h1 className="text-3xl font-bold text-center mb-1">
          Gestion des utilisateurs
        </h1>
        <p className="text-center text-gray-500 italic mb-6">
          Administration & gestion des accès
        </p>

        {/* BOUTON CREER */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => router.push("/admin/create-internal-user")}
            className="bg-gradient-to-r from-blue-400 to-indigo-500 text-white font-bold py-2 px-4 rounded-2xl shadow-md hover:from-blue-500 hover:to-indigo-600"
          >
            ➕ Créer utilisateur
          </button>
        </div>

        {/* FILTRE ROLE CENTRE */}
        <div className="w-full flex justify-center mb-6">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border p-2 rounded-xl shadow-sm text-center"
          >
            <option value="">Tous les rôles</option>
            <option value="admin">Admin</option>
            <option value="responsable">Responsable</option>
            <option value="user">Utilisateur</option>
          </select>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto rounded-2xl shadow-md bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-indigo-500 text-white text-left">
              <tr>
                <th className="py-3 px-4">Nom complet</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Téléphone</th>
                <th className="py-3 px-4">Rôle</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b hover:bg-indigo-50 transition"
                >
                  <td className="py-3 px-4 font-semibold text-gray-700">
                    {user.prenom} {user.nom}
                  </td>

                  <td className="py-3 px-4">{user.email}</td>

                  <td className="py-3 px-4">{user.telephone || "-"}</td>

                  <td className="py-3 px-4 font-medium text-indigo-600">
                    {user.role}
                  </td>

                  <td className="py-3 px-4 flex gap-4">
                    {/* EDIT */}
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="text-blue-600 hover:text-blue-800 text-lg"
                    >
                      ✏️
                    </button>

                    {/* DELETE */}
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="text-red-600 hover:text-red-800 text-lg"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* POPUP EDITION */}
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
