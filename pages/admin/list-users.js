"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import supabase from "../../lib/supabaseClient";

export default function ListUsers() {
  const router = useRouter();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // 🔍 Filtres
  const [roleFilter, setRoleFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("profiles")
        .select("id, prenom, nom, email, role, created_at");

      // Ajouter filtres
      if (roleFilter) query = query.eq("role", roleFilter);
      if (dateFrom) query = query.gte("created_at", dateFrom);
      if (dateTo) query = query.lte("created_at", dateTo);

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
  }, [roleFilter, dateFrom, dateTo]);

  const handleDelete = async (id) => {
    if (!confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) return;

    const { error } = await supabase.from("profiles").delete().eq("id", id);

    if (error) {
      alert("Erreur suppression utilisateur.");
    } else {
      setUsers((prev) => prev.filter((u) => u.id !== id));
    }
  };

  const resetFilters = () => {
    setRoleFilter("");
    setDateFrom("");
    setDateTo("");
  };

  if (loading)
    return <p className="text-center mt-10 text-lg">Chargement...</p>;

  if (message)
    return <p className="text-center text-red-600 mt-10">{message}</p>;

  return (
    <div className="min-h-screen flex items-start justify-center bg-gradient-to-br from-purple-200 via-pink-100 to-yellow-100 p-6">
      
      <div className="w-full max-w-5xl bg-white p-8 rounded-3xl shadow-lg relative">

        {/* 🔙 RETOUR */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 flex items-center text-black font-semibold hover:text-gray-700 transition"
        >
          ← Retour
        </button>

        {/* LOGO */}
        <div className="flex justify-center mb-6">
          <Image src="/logo.png" alt="SoulTrack Logo" width={80} height={80} />
        </div>

        {/* TITRE */}
        <h1 className="text-3xl font-bold text-center mb-1">Gestion des utilisateurs</h1>
        <p className="text-center text-gray-500 italic mb-6">
          Administration & gestion des accès
        </p>

        {/* ➕ BOUTON CREER UTILISATEUR */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => router.push("/admin/create-internal-user")}
            className="bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600 text-white font-bold py-2 px-4 rounded-2xl shadow-md transition"
          >
            ➕ Créer utilisateur
          </button>
        </div>

        {/* 🔍 FILTRES */}
        <div className="bg-gray-100 p-4 rounded-2xl mb-6 shadow-sm">
          <h3 className="font-semibold mb-2 text-gray-700">Filtres</h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* rôle */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="border p-2 rounded-xl"
            >
              <option value="">Tous les rôles</option>
              <option value="admin">Admin</option>
              <option value="responsable">Responsable</option>
              <option value="user">Utilisateur</option>
            </select>

            {/* dates */}
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="border p-2 rounded-xl"
            />

            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="border p-2 rounded-xl"
            />

            <button
              onClick={resetFilters}
              className="bg-gray-300 hover:bg-gray-400 rounded-xl p-2 font-semibold"
            >
              Réinitialiser
            </button>
          </div>
        </div>

        {/* TABLEAU */}
        <div className="overflow-x-auto rounded-2xl shadow-md">
          <table className="min-w-full text-sm">
            <thead className="bg-indigo-500 text-white text-left">
              <tr>
                <th className="py-3 px-4">Nom complet</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Rôle</th>
                <th className="py-3 px-4">Créé le</th>
                <th className="py-3 px-4 text-center">Actions</th>
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

                  <td className="py-3 px-4 font-medium text-indigo-600">
                    {user.role}
                  </td>

                  <td className="py-3 px-4">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>

                  {/* ✏️🗑️ ACTIONS */}
                  <td className="py-3 px-4 text-center flex gap-3 justify-center">

                    {/* EDIT */}
                    <button
                      onClick={() =>
                        router.push(`/admin/edit-user?id=${user.id}`)
                      }
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
    </div>
  );
}
