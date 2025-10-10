// pages/suivis-evangelises.js
import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";

export default function SuivisEvangelises() {
  const [suivis, setSuivis] = useState([]);

  useEffect(() => {
    fetchSuivis();
  }, []);

  const fetchSuivis = async () => {
    const { data, error } = await supabase
      .from("suivis_des_evangelises")
      .select(
        `id, prenom, nom, telephone, is_whatsapp, ville, besoin, infos_supplementaires, cellule_id, responsable_cellule, date_suivi,
        cellules (nom)`
      )
      .order("date_suivi", { ascending: false });

    if (error) {
      console.error("Erreur chargement:", error);
      return;
    }
    setSuivis(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-100 to-indigo-50 p-6">
      <h1 className="text-3xl font-extrabold text-center text-indigo-700 mb-6">
        Suivis des évangélisés
      </h1>

      {suivis.length === 0 ? (
        <p className="text-center text-gray-500 italic mt-10">
          Aucune personne en suivi pour le moment.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-xl shadow-lg">
            <thead>
              <tr className="bg-indigo-600 text-white text-center">
                <th className="p-3">Prénom</th>
                <th className="p-3">Nom</th>
                <th className="p-3">Cellule</th>
                <th className="p-3">Détails</th>
              </tr>
            </thead>
            <tbody>
              {suivis.map((s) => (
                <tr key={s.id} className="border-t text-center hover:bg-indigo-50 transition">
                  <td className="p-3 font-semibold text-indigo-700">{s.prenom}</td>
                  <td className="p-3 font-semibold text-indigo-700">{s.nom}</td>
                  <td className="p-3 text-gray-700">
                    {s.cellules?.nom || "—"} <br />
                    <span className="text-sm text-gray-500 italic">
                      {s.responsable_cellule || ""}
                    </span>
                  </td>
                  <td className="p-3 text-left text-gray-600 text-sm">
                    <div><strong>📱 Téléphone :</strong> {s.telephone}</div>
                    <div><strong>💬 WhatsApp :</strong> {s.is_whatsapp ? "Oui" : "Non"}</div>
                    <div><strong>🏙 Ville :</strong> {s.ville || "—"}</div>
                    <div><strong>🙏 Besoin :</strong> {s.besoin || "—"}</div>
                    <div><strong>📝 Infos :</strong> {s.infos_supplementaires || "—"}</div>
                    <div className="mt-2 text-xs text-gray-400 italic">
                      Date : {new Date(s.date_suivi).toLocaleString("fr-FR")}
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
