// pages/evangelisation.js
"use client";
import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";

export default function Evangelisation() {
  const [contacts, setContacts] = useState([]);
  const [cellules, setCellules] = useState([]);
  const [selectedCellule, setSelectedCellule] = useState("");
  const [detailsOpen, setDetailsOpen] = useState({});
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
      .select("*")
      .order("ville", { ascending: true });
    if (!error) setCellules(data || []);
  };

  const toggleDetails = (id) => {
    setDetailsOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const sendWhatsapp = async (contact) => {
    if (!selectedCellule) return alert("Sélectionnez une cellule d'abord !");
    const cellule = cellules.find((c) => c.id === selectedCellule);
    if (!cellule) return alert("Cellule introuvable");

    const phone = cellule.telephone.replace(/\D/g, "");
    const message = `👋 Salut ${cellule.responsable},

Nous avons un nouveau contact à suivre :
Nom : ${contact.nom}
Prénom : ${contact.prenom}
📱 Téléphone : ${contact.telephone || "—"}
Ville : ${contact.ville || "—"}
Besoin : ${contact.besoin || "—"}
Infos supplémentaires : ${contact.infos_supplementaires || "—"}
WhatsApp : ${contact.is_whatsapp ? "Oui" : "Non"}`;

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <div className="min-h-screen p-6 flex flex-col items-center" style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}>
      <h1 className="text-5xl text-white font-handwriting mb-4">Évangélisation</h1>

      {/* Menu cellule */}
      <div className="mb-4 w-full max-w-md flex gap-4">
        <select
          value={selectedCellule}
          onChange={(e) => setSelectedCellule(e.target.value)}
          className="flex-1 border rounded-lg px-3 py-2"
        >
          <option value="">-- Sélectionner cellule --</option>
          {cellules.map((c) => (
            <option key={c.id} value={c.id}>
              {c.cellule} ({c.responsable})
            </option>
          ))}
        </select>

        <p
          className="cursor-pointer text-orange-500 font-semibold"
          onClick={() => setView(view === "card" ? "table" : "card")}
        >
          {view === "card" ? "Voir en Table" : "Voir en Card"}
        </p>
      </div>

      {view === "card" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
          {contacts.map((c) => (
            <div key={c.id} className="bg-white p-4 rounded-2xl shadow-md relative">
              <p className="font-bold">{c.prenom} {c.nom}</p>
              <p>📱 {c.telephone || "—"}</p>
              <p
                className="mt-2 text-blue-500 underline cursor-pointer"
                onClick={() => toggleDetails(c.id)}
              >
                {detailsOpen[c.id] ? "Fermer détails" : "Détails"}
              </p>

              {detailsOpen[c.id] && (
                <div className="mt-2 text-sm space-y-1">
                  <p>Nom : {c.nom}</p>
                  <p>Prénom : {c.prenom}</p>
                  <p>📱 {c.telephone || "—"}</p>
                  <p>WhatsApp : {c.is_whatsapp ? "Oui" : "Non"}</p>
                  <p>Ville : {c.ville || "—"}</p>
                  <p>Besoin : {c.besoin || "—"}</p>
                  <p>Infos supplémentaires : {c.infos_supplementaires || "—"}</p>
                  {selectedCellule && (
                    <div className="flex items-center gap-2 mt-2">
                      <input type="checkbox" id={`whatsapp-${c.id}`} />
                      <label htmlFor={`whatsapp-${c.id}`}>Envoyer par WhatsApp</label>
                      <button
                        className="ml-auto bg-green-500 text-white px-3 py-1 rounded"
                        onClick={() => sendWhatsapp(c)}
                      >
                        Envoyer
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto w-full max-w-5xl">
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
                <tr key={c.id} className="border-b">
                  <td className="py-2 px-4">{c.prenom}</td>
                  <td className="py-2 px-4">{c.nom}</td>
                  <td className="py-2 px-4">{c.telephone || "—"}</td>
                  <td className="py-2 px-4">
                    <p
                      className="text-blue-500 underline cursor-pointer"
                      onClick={() => toggleDetails(c.id)}
                    >
                      {detailsOpen[c.id] ? "Fermer détails" : "Détails"}
                    </p>

                    {detailsOpen[c.id] && (
                      <div className="mt-2 text-sm space-y-1">
                        <p>WhatsApp : {c.is_whatsapp ? "Oui" : "Non"}</p>
                        <p>Ville : {c.ville || "—"}</p>
                        <p>Besoin : {c.besoin || "—"}</p>
                        <p>Infos supplémentaires : {c.infos_supplementaires || "—"}</p>
                        {selectedCellule && (
                          <div className="flex items-center gap-2 mt-2">
                            <input type="checkbox" id={`whatsapp-${c.id}`} />
                            <label htmlFor={`whatsapp-${c.id}`}>Envoyer par WhatsApp</label>
                            <button
                              className="ml-auto bg-green-500 text-white px-3 py-1 rounded"
                              onClick={() => sendWhatsapp(c)}
                            >
                              Envoyer
                            </button>
                          </div>
                        )}
                      </div>
                    )}
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
