// pages/evangelisation.js

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Evangelisation() {
  const [contacts, setContacts] = useState([]);
  const [cellules, setCellules] = useState([]);
  const [selectedCellules, setSelectedCellules] = useState({});
  const [detailsOpen, setDetailsOpen] = useState({});
  const [view, setView] = useState("card"); // card ou table

  useEffect(() => {
    fetchContacts();
    fetchCellules();
  }, []);

  const fetchContacts = async () => {
    try {
      const { data, error } = await supabase
        .from("evangelises")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setContacts(data || []);
    } catch (err) {
      console.error("Erreur fetchContacts:", err.message);
      setContacts([]);
    }
  };

  const fetchCellules = async () => {
    try {
      const { data, error } = await supabase
        .from("cellules")
        .select("id, cellule, responsable, telephone");
      if (error) throw error;
      setCellules(data || []);
    } catch (err) {
      console.error("Erreur fetchCellules:", err.message);
      setCellules([]);
    }
  };

  // Fonction pour envoyer un ou plusieurs contacts
  const sendWhatsapp = async (contactIds) => {
    for (let id of contactIds) {
      const member = contacts.find((c) => c.id === id);
      const celluleId = selectedCellules[id];
      const cellule = cellules.find((c) => c.id === celluleId);

      if (!cellule) return alert("Cellule introuvable.");
      if (!cellule.telephone) return alert("Numéro de la cellule introuvable.");

      const phone = cellule.telephone.replace(/\D/g, "");
      if (!phone) return alert("Numéro de la cellule invalide.");

      const message = `👋 Salut ${cellule.responsable},\n\n🙏 Nous avons reçu une nouvelle personne à suivre :\n\n- Nom: ${member.prenom} ${member.nom}\n- Téléphone: ${member.telephone || "—"}\n- Ville: ${member.ville || "—"}\n- Besoin: ${member.besoin || "—"}\n- Infos: ${member.infos_supplementaires || "—"}\n\nMerci 🙏`;

      const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

      // Ouvrir WhatsApp
      window.open(waUrl, "_blank");

      // Enregistrer dans suivis_des_evangelises
      try {
        const { error } = await supabase
          .from("suivis_des_evangelises")
          .insert([
            {
              prenom: member.prenom,
              nom: member.nom,
              telephone: member.telephone,
              is_whatsapp: true,
              ville: member.ville,
              besoin: member.besoin,
              infos_supplementaires: member.infos_supplementaires,
              cellule_id: cellule.id,
              responsable_cellule: cellule.responsable,
            },
          ]);
        if (error) throw error;
      } catch (err) {
        console.error("Erreur insert suivi:", err.message);
      }
    }

    // Retirer les contacts envoyés de la liste
    setContacts((prev) => prev.filter((c) => !contactIds.includes(c.id)));
  };

  // Vérifie si au moins un contact a une cellule sélectionnée
  const canSend = Object.values(selectedCellules).some((v) => v);

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-gradient-to-b from-blue-600 to-blue-300">
      <h1 className="text-4xl font-bold text-white mb-6">Évangélisation</h1>

      {/* Toggle Card/Table */}
      <button
        className="mb-4 px-4 py-2 rounded-lg bg-white font-semibold"
        onClick={() => setView(view === "card" ? "table" : "card")}
      >
        {view === "card" ? "Voir en Table" : "Voir en Cards"}
      </button>

      {view === "card" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
          {contacts.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-2xl shadow-md p-4 flex flex-col justify-between"
            >
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-bold text-lg">{c.prenom} {c.nom}</h2>
              </div>

              <p className="mb-1">📱 {c.telephone || "—"}</p>
              <p className="mb-2 text-sm font-medium">{c.ville || "—"}</p>

              <button
                className="text-blue-500 underline mb-2"
                onClick={() => setDetailsOpen((prev) => ({ ...prev, [c.id]: !prev[c.id] }))}
              >
                {detailsOpen[c.id] ? "Fermer détails" : "Détails"}
              </button>

              {detailsOpen[c.id] && (
                <div className="text-sm text-gray-700 space-y-1 mb-2">
                  <p>Ville: {c.ville || "—"} | Besoin: {c.besoin || "—"} | Infos: {c.infos_supplementaires || "—"}</p>
                  <select
                    value={selectedCellules[c.id] || ""}
                    onChange={(e) =>
                      setSelectedCellules((prev) => ({ ...prev, [c.id]: e.target.value }))
                    }
                    className="border rounded-lg w-full mt-1 px-2 py-1"
                  >
                    <option value="">-- Sélectionner cellule --</option>
                    {cellules.map((cell) => (
                      <option key={cell.id} value={cell.id}>
                        {cell.cellule} ({cell.responsable})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="w-full max-w-6xl overflow-x-auto bg-white rounded-xl shadow-md">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-200">
              <tr>
                <th className="py-2 px-4 text-left">Prénom</th>
                <th className="py-2 px-4 text-left">Nom</th>
                <th className="py-2 px-4 text-left">Téléphone</th>
                <th className="py-2 px-4 text-left">Ville / Besoin / Infos</th>
                <th className="py-2 px-4 text-left">Cellule</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => (
                <tr key={c.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4">{c.prenom}</td>
                  <td className="py-2 px-4">{c.nom}</td>
                  <td className="py-2 px-4">{c.telephone || "—"}</td>
                  <td className="py-2 px-4">
                    Ville: {c.ville || "—"} | Besoin: {c.besoin || "—"} | Infos: {c.infos_supplementaires || "—"}
                  </td>
                  <td className="py-2 px-4">
                    <select
                      value={selectedCellules[c.id] || ""}
                      onChange={(e) =>
                        setSelectedCellules((prev) => ({ ...prev, [c.id]: e.target.value }))
                      }
                      className="border rounded-lg w-full px-2 py-1"
                    >
                      <option value="">-- Sélectionner cellule --</option>
                      {cellules.map((cell) => (
                        <option key={cell.id} value={cell.id}>
                          {cell.cellule} ({cell.responsable})
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {canSend && (
        <button
          className="mt-4 px-6 py-2 rounded-xl bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-white font-bold hover:opacity-90"
          onClick={() => sendWhatsapp(Object.keys(selectedCellules).filter((id) => selectedCellules[id]))}
        >
          Envoyer WhatsApp
        </button>
      )}
    </div>
  );
}
