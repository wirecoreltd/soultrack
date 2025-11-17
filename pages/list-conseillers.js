"use client";

import { useState, useEffect } from "react";
import supabase from "../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function ListConseillers() {
  const [conseillers, setConseillers] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchConseillers();
  }, []);

  const fetchConseillers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("conseillers")
      .select("*")
      .order("prenom", { ascending: true });

    if (error) {
      console.error(error);
      alert("Erreur lors de la récupération des conseillers.");
    } else {
      setConseillers(data);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("Voulez-vous vraiment supprimer ce conseiller ?")) return;

    const { error } = await supabase
      .from("conseillers")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      alert("Erreur lors de la suppression !");
    } else {
      setConseillers(prev => prev.filter(c => c.id !== id));
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-gradient-to-br from-purple-200 via-pink-100 to-yellow-100">
      <div className="w-full max-w-5xl mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Liste des Conseillers</h1>
        <button
          onClick={() => router.push("/create-conseiller")}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          + Ajouter un Conseiller
        </button>
      </div>

      {loading ? (
        <p>Chargement...</p>
      ) : (
        <div className="w-full max-w-5xl overflow-x-auto">
          <table className="w-full table-auto border-collapse border border-gray-300">
            <thead className="bg-gray-200 text-gray-800">
              <tr>
                <th className="px-4 py-2 border">Prénom</th>
                <th className="px-4 py-2 border">Nom</th>
                <th className="px-4 py-2 border">Téléphone</th>
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {conseillers.map(c => (
                <tr key={c.id} className="hover:bg-gray-100">
                  <td className="px-4 py-2 border">{c.prenom}</td>
                  <td className="px-4 py-2 border">{c.nom}</td>
                  <td className="px-4 py-2 border">{c.telephone}</td>
                  <td className="px-4 py-2 border flex gap-2">
                    <button
                      onClick={() => router.push(`/edit-conseiller/${c.id}`)}
                      className="bg-yellow-400 hover:bg-yellow-500 text-white px-2 py-1 rounded"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
              {conseillers.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-gray-500">
                    Aucun conseiller trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
