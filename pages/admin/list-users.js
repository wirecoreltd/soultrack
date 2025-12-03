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
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("id, prenom, nom, email, telephone, role, role_description, created_at")
      .order("created_at", { ascending: true });

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    setUsers(data || []);
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

  // ✅ Mettre à jour un utilisateur dans la liste
  const handleUpdated = (updatedUser) => {
    if (!updatedUser || !updatedUser.id) return;
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

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
          <option value="Administrateur">Admin</option>
          <option value="ResponsableCellule">Responsable Cellule</option>
          <option value="ResponsableEvangelisation">Responsable Evangélisation</option>
          <option value="Conseiller">Conseiller</option>
          <option value="ResponsableIntegration">Responsable Intégration</option>
        </select>

        <button onClick={() => router.push("/admin/create-internal-user")} className="bg-gradient-to-r from-blue-400 to-indigo-500 text-white font-bold py-2 px-4 rounded-2xl shadow-md hover:from-blue-500 hover:to-indigo-600">
          ➕ Créer utilisateur
        </button>
      </div>

      <div className="max-w-
