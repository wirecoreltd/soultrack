//pages/cellule.hub.js

"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import supabase from "../lib/supabaseClient";

export default function CelluleHub() {
  const router = useRouter();
  const { id } = router.query; // récupère l'id de la cellule depuis l'URL

  const [cellule, setCellule] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🧭 Récupérer les infos de la cellule
  const fetchCellule = async () => {
    const { data, error } = await supabase
      .from("cellules")
      .select("*")
      .eq("id", id)
      .single();

    if (!error) setCellule(data);
  };

  // 👥 Récupérer les membres liés à cette cellule
  const fetchMembersByCellule = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("membres")
      .select(`
        *,
        cellule:cellule_id (
          cellule,
          responsable
        )
      `)
      .eq("cellule_id", id)
      .order("created_at", { ascending: true });

    if (!error && data) setMembers(data);
    else setMembers([]);

    setLoading(false);
  };

  useEffect(() => {
    if (id) {
      fetchCellule();
      fetchMembersByCellule();
    }
  }, [id]);

  // 🌀 Affichage en cours de chargement
  if (loading && !cellule) {
    return <p className="p-6 text-gray-500">Chargement en cours...</p>;
  }

  return (
    <div className="p-6">
      {/* ✅ Infos de la cellule */}
      {cellule && (
        <div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-100 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            {cellule.cellule}
          </h1>
          <p className="text-gray-600">🏙️ Ville : {cellule.ville}</p>
          <p className="text-gray-600">👤 Responsable : {cellule.responsable}</p>
          <p className="text-gray-600">📞 Téléphone : {cellule.telephone}</p>
        </div>
      )}

      {/* 👥 Liste des membres */}
      <h2 className="text-xl font-bold mb-3">Membres de cette cellule :</h2>

      {loading ? (
        <p className="text-gray-500 italic">Chargement des membres...</p>
      ) : members.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((m) => (
            <div
              key={m.id}
              className="bg-white shadow rounded-2xl p-4 border border-gray-100"
            >
              <h3 className="text-lg font-bold text-gray-800">
                {m.prenom} {m.nom}
              </h3>
              <p className="text-gray-500 text-sm">{m.email}</p>
              <p className="text-gray-700 mt-1">📞 {m.telephone}</p>
              <p className="text-green-600 font-semibold mt-1">
                🏠 Intégré à :{" "}
                {m.cellule
                  ? `${m.cellule.cellule} (${m.cellule.responsable})`
                  : "Aucune cellule attribuée"}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 italic">Aucun membre trouvé pour cette cellule.</p>
      )}
    </div>
  );
}
