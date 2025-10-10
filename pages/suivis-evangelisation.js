// pages/suivis-evangelises.js
"use client";
import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";

export default function SuivisEvangelises() {
  const [contacts, setContacts] = useState([]);
  const [detailsOpen, setDetailsOpen] = useState({});

  useEffect(() => {
    fetchSuivis();
  }, []);

  const fetchSuivis = async () => {
    try {
      const { data, error } = await supabase
        .from("suivis_des_evangelises")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setContacts(data || []);
    } catch (err) {
      console.error("Erreur fetchSuivis:", err.message);
      setContacts([]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6" style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}>
      <h1 className="text-5xl font-handwriting text-white mb-4">Suivis des Evangelisés</h1>

      <div className="w-full max-w-5xl overflow-x-auto">
        <table className="min-w-full bg-white rounded-xl">
          <thead>
            <tr className="bg-gray-200">
              <th className="py-2 px-4">Nom</th>
              <th className="py-2 px-4">Prénom</th>
              <th className="py-2 px-4">Cellule</th>
              <th className="py-2 px-4">Détails</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map(contact => (
              <tr key={contact.id} className="border-b">
                <td className="py-2 px-4">{contact.nom}</td>
                <td className="py-2 px-4">{contact.prenom}</td>
                <td className="py-2 px-4">{contact.cellule}</td>
                <td className="py-2 px-4">
                  <p
                    className="text-blue-500 underline cursor-pointer"
                    onClick={() => setDetailsOpen(prev => ({ ...prev, [contact.id]: !prev[contact.id] }))}
                  >
                    {detailsOpen[contact.id] ? "Fermer détails" : "Détails"}
                  </p>

                  {detailsOpen[contact.id] && (
                    <div className="mt-2 text-sm text-gray-700 space-y-1">
                      <p><strong>Prénom:</strong> {contact.prenom}</p>
                      <p><strong>Nom:</strong> {contact.nom}</p>
                      <p><strong>Téléphone:</strong> {contact.telephone || "—"}</p>
                      <p><strong>WhatsApp:</strong> {contact.is_whatsapp ? "Oui" : "Non"}</p>
                      <p><strong>Ville:</strong> {contact.ville || "—"}</p>
                      <p><strong>Besoin:</strong> {contact.besoin || "—"}</p>
                      <p><strong>Infos supplémentaires:</strong> {contact.infos_supplementaires || "—"}</p>
                      <p><strong>Comment est-il venu ?</strong> {contact.comment || "—"}</p>
                      <p><strong>Cellule responsable:</strong> {contact.responsable_cellule || "—"}</p>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
