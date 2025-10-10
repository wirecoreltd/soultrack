// pages/suivis-evangelisation.js

import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient"; // ✅ chemin corrigé
import { Card, CardContent } from "../components/ui/card"; // ✅ chemin corrigé
import { Button } from "../components/ui/button"; // ✅ chemin corrigé

export default function SuivisEvangelisation() {
  const [suivis, setSuivis] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSuivis();
  }, []);

  const fetchSuivis = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("suivis_des_evangelises")
      .select(`
        id,
        prenom,
        nom,
        telephone,
        ville,
        besoin,
        infos_supplementaires,
        cellules (cellule)
      `);

    if (error) {
      console.error("Erreur lors du chargement :", error);
    } else {
      setSuivis(data);
    }
    setLoading(false);
  };

  if (loading) {
    return <p className="text-center mt-10">Chargement des suivis...</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-center mb-6">
        Suivis des Évangélisés
      </h1>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border-b">Prénom</th>
              <th className="py-2 px-4 border-b">Nom</th>
              <th className="py-2 px-4 border-b">Cellule</th>
              <th className="py-2 px-4 border-b">Détails</th>
            </tr>
          </thead>
          <tbody>
            {suivis.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">{item.prenom}</td>
                <td className="py-2 px-4 border-b">{item.nom}</td>
                <td className="py-2 px-4 border-b">
                  {item.cellules?.cellule || "Non défini"}
                </td>
                <td className="py-2 px-4 border-b">
                  <details>
                    <summary className="cursor-pointer text-blue-600">
                      Voir plus
                    </summary>
                    <div className="mt-2 text-sm text-gray-700">
                      <p>
                        <strong>Téléphone :</strong> {item.telephone || "N/A"}
                      </p>
                      <p>
                        <strong>Ville :</strong> {item.ville || "N/A"}
                      </p>
                      <p>
                        <strong>Besoin :</strong> {item.besoin || "N/A"}
                      </p>
                      <p>
                        <strong>Infos :</strong>{" "}
                        {item.infos_supplementaires || "N/A"}
                      </p>
                    </div>
                  </details>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
