import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import { useRouter } from "next/router";

export default function ListeEvangelises() {
  const [evangelises, setEvangelises] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("membres")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) console.error(error);
      else setEvangelises(data);

      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-100 to-indigo-50 p-6">
      <div className="max-w-5xl mx-auto bg-white p-8 rounded-3xl shadow-xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-extrabold text-indigo-700">
            Liste des personnes évangélisées
          </h1>
          <button
            onClick={() => router.push("/add-evangelise")}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-2xl shadow-md"
          >
            + Ajouter
          </button>
        </div>

        {loading ? (
          <p className="text-center text-gray-500">Chargement...</p>
        ) : evangelises.length === 0 ? (
          <p className="text-center text-gray-500">
            Aucune personne évangélisée pour le moment.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-indigo-100 text-indigo-700 font-semibold">
                  <th className="p-3 border-b">Prénom</th>
                  <th className="p-3 border-b">Nom</th>
                  <th className="p-3 border-b">Téléphone</th>
                  <th className="p-3 border-b">WhatsApp</th>
                  <th className="p-3 border-b">Ville</th>
                  <th className="p-3 border-b">Besoin</th>
                  <th className="p-3 border-b">Date</th>
                </tr>
              </thead>
              <tbody>
                {evangelises.map((e) => (
                  <tr key={e.id} className="hover:bg-indigo-50">
                    <td className="p-3 border-b">{e.prenom}</td>
                    <td className="p-3 border-b">{e.nom}</td>
                    <td className="p-3 border-b">{e.telephone}</td>
                    <td className="p-3 border-b text-center">
                      {e.is_whatsapp ? "✅" : "❌"}
                    </td>
                    <td className="p-3 border-b">{e.ville}</td>
                    <td className="p-3 border-b">{e.besoin}</td>
                    <td className="p-3 border-b text-gray-500 text-sm">
                      {new Date(e.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
