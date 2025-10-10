// pages/suivis-evangelisation.js

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function SuivisEvangelisation() {
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    fetchSuivis();
  }, []);

  const fetchSuivis = async () => {
    try {
      const { data, error } = await supabase
        .from("suivis_des_evangelises")
        .select(`
          id,
          prenom,
          nom,
          telephone,
          is_whatsapp,
          ville,
          besoin,
          infos_supplementaires,
          cellule_id,
          responsable_cellule,
          date_suivi
        `)
        .order("date_suivi", { ascending: false });

      if (error) throw error;
      setContacts(data || []);
    } catch (err) {
      console.error("Erreur fetchSuivis:", err.message);
      setContacts([]);
    }
  };

  return (
    <div className="min-h-screen p-6 flex flex-col items-center bg-gradient-to-b from-blue-600 to-blue-300">
      <h1 className="text-4xl font-bold text-white mb-6">Suivis des Évangélisés</h1>

      {contacts.length === 0 ? (
        <p className="text-white text-lg">Aucun contact suivi pour le moment.</p>
      ) : (
        <div className="w-full max-w-6xl overflow-x-auto bg-white rounded-xl shadow-md">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-200">
              <tr>
                <th className="py-3 px-4 text-left">Prénom</th>
                <th className="py-3 px-4 text-left">Nom</th>
                <th className="py-3 px-4 text-left">Téléphone</th>
                <th className="py-3 px-4 text-left">WhatsApp</th>
                <th className="py-3 px-4 text-left">Ville</th>
                <th className="py-3 px-4 text-left">Besoin</th>
                <th className="py-3 px-4 text-left">Infos supplémentaires</th>
                <th className="py-3 px-4 text-left">Cellule</th>
                <th className="py-3 px-4 text-left">Responsable</th>
                <th className="py-3 px-4 text-left">Date du suivi</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => (
                <tr key={c.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4">{c.prenom}</td>
                  <td className="py-2 px-4">{c.nom}</td>
                  <td className="py-2 px-4">{c.telephone || "—"}</td>
                  <td className="py-2 px-4">{c.is_whatsapp ? "✅" : "❌"}</td>
                  <td className="py-2 px-4">{c.ville || "—"}</td>
                  <td className="py-2 px-4">{c.besoin || "—"}</td>
                  <td className="py-2 px-4">{c.infos_supplementaires || "—"}</td>
                  <td className="py-2 px-4">{c.cellule_id || "—"}</td>
                  <td className="py-2 px-4">{c.responsable_cellule || "—"}</td>
                  <td className="py-2 px-4">{c.date_suivi ? new Date(c.date_suivi).toLocaleString("fr-FR") : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button
        onClick={() => window.history.back()}
        className="mt-6 px-6 py-2 rounded-xl bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-white font-bold hover:opacity-90"
      >
        ← Retour
      </button>
    </div>
  );
}
