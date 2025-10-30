"use client";

import { useEffect, useState } from "react";
import supabase from "../../lib/supabaseClient";

export default function ListUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, prenom, nom, email, role, created_at");

        if (error) throw error;
        setUsers(data || []);
      } catch (err) {
        console.error("❌ Erreur récupération utilisateurs:", err);
        setMessage("Erreur lors de la récupération des utilisateurs.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <p className="text-center mt-10">Chargement...</p>;
  if (message) return <p className="text-center text-red-600 mt-10">{message}</p>;

  return (
    <div className="p-6 min-h-screen bg-gradient-to-b from-green-100 to-green-50">
      <h2 className="text-3xl font-bold text-center text-green-700 mb-6">👤 Liste des utilisateurs</h2>
      <div className="overflow-x-auto bg-white rounded-3xl shadow-2xl p-6">
        <table className="min-w-full text-sm">
          <thead className="bg-green-600 text-white">
            <tr>
              <th className="py-3 px-4 text-left">Nom complet</th>
              <th className="py-3 px-4 text-left">Email</th>
              <th className="py-3 px-4 text-left">Rôle</th>
              <th className="py-3 px-4 text-left">Créé le</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b hover:bg-green-50 transition-all">
                <td className="py-3 px-4 font-semibold text-gray-700">{user.prenom} {user.nom}</td>
                <td className="py-3 px-4">{user.email}</td>
                <td className="py-3 px-4 font-medium text-green-700">{user.role}</td>
                <td className="py-3 px-4">{new Date(user.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
