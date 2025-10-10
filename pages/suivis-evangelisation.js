// pages/suivis-evangelises.js
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { Card } from "@/components/ui/card";

export default function SuivisEvangelises() {
  const [suivis, setSuivis] = useState([]);

  useEffect(() => {
    fetchSuivis();
  }, []);

  async function fetchSuivis() {
    const { data, error } = await supabase
      .from("suivis_des_evangelises")
      .select(`
        id,
        prenom,
        nom,
        ville,
        besoin,
        infos_supplementaires,
        cellule_id,
        responsable_cellule,
        date_suivi,
        cellules(cellule)
      `);

    if (error) {
      console.error("Erreur récupération suivis :", error);
    } else {
      setSuivis(data || []);
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-center mb-6">
        Suivis des Évangélisés
      </h1>

      {suivis.length === 0 ? (
        <p className="text-center text-gray-600">
          Aucun contact suivi pour le moment.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 text-center">
            <thead className="bg-gray-200">
              <tr>
                <th>Prénom</th>
                <th>Nom</th>
                <th>Cellule</th>
                <th>Détails</th>
              </tr>
            </thead>
            <tbody>
              {suivis.map((s) => (
                <tr key={s.id} className="border-b hover:bg-gray-50">
                  <td className="py-2">{s.prenom}</td>
                  <td className="py-2">{s.nom}</td>
                  <td className="py-2">
                    {s.cellules?.cellule || "Non attribuée"}
                  </td>
                  <td className="text-left p-3 text-sm">
                    <div className="leading-tight">
                      <strong>Ville :</strong> {s.ville || "—"} <br />
                      <strong>Besoin :</strong> {s.besoin || "—"} <br />
                      <strong>Infos :</strong>{" "}
                      {s.infos_supplementaires || "—"} <br />
                      <strong>Responsable :</strong>{" "}
                      {s.responsable_cellule || "—"} <br />
                      <strong>Date du suivi :</strong>{" "}
                      {new Date(s.date_suivi).toLocaleDateString("fr-FR")}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
