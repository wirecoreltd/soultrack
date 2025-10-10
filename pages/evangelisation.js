// pages/evangelisation.js
"use client";
import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";

export default function Evangelisation() {
  const [contacts, setContacts] = useState([]);
  const [detailsOpen, setDetailsOpen] = useState({});
  const [cellules, setCellules] = useState([]);
  const [selectedCellules, setSelectedCellules] = useState({});
  const [checkedContacts, setCheckedContacts] = useState({});
  const [view, setView] = useState("card"); // 'card' ou 'table'

  useEffect(() => {
    fetchContacts();
    fetchCellules();
  }, []);

  const fetchContacts = async () => {
    const { data, error } = await supabase
      .from("suivis_des_evangelises")
      .select("*")
      .order("date_suivi", { ascending: false });
    if (!error) setContacts(data || []);
  };

  const fetchCellules = async () => {
    const { data, error } = await supabase
      .from("cellules")
      .select("*");
    if (!error) setCellules(data || []);
  };

  const toggleDetail = (id) => {
    setDetailsOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleCheck = (id) => {
    setCheckedContacts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const sendWhatsapp = async (celluleId) => {
    const cellule = cellules.find((c) => String(c.id) === String(celluleId));
    if (!cellule) return alert("Cellule introuvable.");

    const selectedContacts = contacts.filter((c) => checkedContacts[c.id]);
    if (selectedContacts.length === 0) return alert("Aucun contact sélectionné.");

    selectedContacts.forEach((member) => {
      const phone = cellule.telephone.replace(/\D/g, "");
      const message = `👋 Salut ${cellule.responsable},

Voici les infos du contact :

- Nom : ${member.nom}
- Prénom : ${member.prenom}
- Téléphone : ${member.telephone || "—"}
- WhatsApp : ${member.is_whatsapp ? "Oui" : "Non"}
- Ville : ${member.ville || "—"}
- Besoin : ${member.besoin || "—"}
- Infos supplémentaires : ${member.infos_supplementaires || "—"}`;

      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6" style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}>
      <h1 className="text-5xl font-bold text-white mb-6">Évangélisation</h1>

      {/* Toggle Card / Table */}
      <p className="self-end text-orange-500 cursor-pointer mb-4" onClick={() => setView(view === "card" ? "table" : "card")}>
        Voir en {view === "card" ? "Table" : "Card"}
      </p>

      {view === "card" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
          {contacts.map((c) => (
            <div key={c.id} className="bg-white p-4 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer">
              <p className="font-bold">{c.prenom} {c.nom}</p>
              <p>📱 {c.telephone || "—"}</p>
              <button
                className="text-blue-500 mt-2 underline"
                onClick={() => toggleDetail(c.id)}
              >
                {detailsOpen[c.id] ? "Fermer détails" : "Détails"}
              </button>

              {detailsOpen[c.id] && (
                <div className="mt-2 text-gray-700">
                  <p>Nom : {c.nom}</p>
                  <p>Prénom : {c.prenom}</p>
                  <p>📱 {c.telephone || "—"}</p>
                  <p>WhatsApp : {c.is_whatsapp ? "Oui" : "Non"}</p>
                  <p>Ville : {c.ville || "—"}</p>
                  <p>Besoin : {c.besoin || "—"}</p>
                  <p>Infos supplémentaires : {c.infos_supplementaires || "—"}</p>

                  <div className="mt-2">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={checkedContacts[c.id] || false} onChange={() => toggleCheck(c.id)} />
                      Envoyer par WhatsApp
                    </label>

                    {selectedCellules[c.id] && (
                      <button
                        onClick={() => sendWhatsapp(selectedCellules[c.id])}
                        className="mt-2 w-full py-2 rounded-xl text-white font-bold bg-gradient-to-r from-green-400 via-green-500 to-green-600"
                      >
                        Envoyer au responsable
                      </button>
                    )}
                  </div>

                  <select
                    value={selectedCellules[c.id] || ""}
                    onChange={(e) => setSelectedCellules((prev) => ({ ...prev, [c.id]: e.target.value }))}
                    className="mt-2 border rounded-lg px-2 py-1 w-full"
                  >
                    <option value="">-- Sélectionner cellule --</option>
                    {cellules.map((cell) => (
                      <option key={cell.id} value={cell.id}>{cell.cellule} ({cell.responsable})</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="w-full max-w-5xl overflow-x-auto">
          <table className="min-w-full bg-white rounded-xl">
            <thead>
              <tr className="bg-gray-200">
                <th className="py-2 px-4">Prénom</th>
                <th className="py-2 px-4">Nom</th>
                <th className="py-2 px-4">Téléphone</th>
                <th className="py-2 px-4">Détails</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => (
                <React.Fragment key={c.id}>
                  <tr className="border-b">
                    <td className="py-2 px-4">{c.prenom}</td>
                    <td className="py-2 px-4">{c.nom}</td>
                    <td className="py-2 px-4">{c.telephone || "—"}</td>
                    <td className="py-2 px-4">
                      <button
                        className="text-blue-500 underline"
                        onClick={() => toggleDetail(c.id)}
                      >
                        {detailsOpen[c.id] ? "Fermer détails" : "Détails"}
                      </button>
                    </td>
                  </tr>

                  {detailsOpen[c.id] && (
                    <tr>
                      <td colSpan={4} className="bg-gray-50 p-4 text-gray-700">
                        <p>WhatsApp : {c.is_whatsapp ? "Oui" : "Non"} | Ville : {c.ville || "—"}</p>
                        <p>Besoin : {c.besoin || "—"}</p>
                        <p>Infos supplémentaires : {c.infos_supplementaires || "—"}</p>

                        <div className="mt-2">
                          <label className="flex items-center gap-2">
                            <input type="checkbox" checked={checkedContacts[c.id] || false} onChange={() => toggleCheck(c.id)} />
                            Envoyer par WhatsApp
                          </label>

                          {selectedCellules[c.id] && (
                            <button
                              onClick={() => sendWhatsapp(selectedCellules[c.id])}
                              className="mt-2 w-full py-2 rounded-xl text-white font-bold bg-gradient-to-r from-green-400 via-green-500 to-green-600"
                            >
                              Envoyer au responsable
                            </button>
                          )}
                        </div>

                        <select
                          value={selectedCellules[c.id] || ""}
                          onChange={(e) => setSelectedCellules((prev) => ({ ...prev, [c.id]: e.target.value }))}
                          className="mt-2 border rounded-lg px-2 py-1 w-full"
                        >
                          <option value="">-- Sélectionner cellule --</option>
                          {cellules.map((cell) => (
                            <option key={cell.id} value={cell.id}>{cell.cellule} ({cell.responsable})</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
