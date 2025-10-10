// pages/evangelisation.js
"use client";
import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";

export default function ListEvangelises() {
  const [evangelises, setEvangelises] = useState([]);
  const [cellules, setCellules] = useState([]);
  const [selectedCellule, setSelectedCellule] = useState("");
  const [detailsOpen, setDetailsOpen] = useState({});
  const [view, setView] = useState("card"); // 'card' ou 'table'

  useEffect(() => {
    fetchEvangelises();
    fetchCellules();
  }, []);

  const fetchEvangelises = async () => {
    try {
      const { data, error } = await supabase
        .from("evangelises")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setEvangelises(data || []);
    } catch (err) {
      console.error("Erreur fetchEvangelises:", err.message);
      setEvangelises([]);
    }
  };

  const fetchCellules = async () => {
    try {
      const { data, error } = await supabase
        .from("cellules")
        .select("*");
      if (error) throw error;
      setCellules(data || []);
    } catch (err) {
      console.error("Erreur fetchCellules:", err.message);
      setCellules([]);
    }
  };

  const sendWhatsapp = async () => {
    if (!selectedCellule) return alert("Veuillez sélectionner une cellule.");
    const cellule = cellules.find((c) => c.id === selectedCellule);
    if (!cellule || !cellule.telephone) return alert("Cellule introuvable.");

    evangelises.forEach(member => {
      if (!member.send_whatsapp) return; // checkbox non cochée
      const message = `👋 Salut ${cellule.responsable},

🙏 Dieu nous a envoyé une nouvelle âme à suivre.
Voici ses infos :

- 👤 Nom : ${member.prenom} ${member.nom}
- 📱 Téléphone : ${member.telephone || "—"}
- 🏙 Ville : ${member.ville || "—"}
- 🙏 Besoin : ${member.besoin || "—"}
- 📝 Infos supplémentaires : ${member.infos_supplementaires || "—"}
- 💬 Comment est-il venu ? : ${member.comment || "—"}

Merci pour ton cœur ❤ et son amour ✨`;

      const waUrl = `https://wa.me/${cellule.telephone}?text=${encodeURIComponent(message)}`;
      window.open(waUrl, "_blank");

      // Déplacer le contact dans suivis_des_evangelises
      supabase.from("suivis_des_evangelises").insert([{
        prenom: member.prenom,
        nom: member.nom,
        telephone: member.telephone,
        is_whatsapp: member.is_whatsapp,
        ville: member.ville,
        besoin: member.besoin,
        infos_supplementaires: member.infos_supplementaires,
        comment: member.comment,
        cellule_id: cellule.id,
        responsable_cellule: cellule.responsable
      }]);

      // Supprimer le contact de la liste actuelle
      supabase.from("evangelises").delete().eq("id", member.id);
    });

    // Recharger la liste
    fetchEvangelises();
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6" style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}>
      <h1 className="text-5xl font-handwriting text-white mb-4">Evangelisation</h1>

      {/* Menu déroulant Cellule */}
      <div className="mb-4 w-full max-w-md flex justify-center items-center gap-4">
        <select
          value={selectedCellule}
          onChange={(e) => setSelectedCellule(e.target.value)}
          className="border rounded-lg px-4 py-2 text-gray-700 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="">-- Sélectionner cellule --</option>
          {cellules.map((c) => (
            <option key={c.id} value={c.id}>{c.cellule} ({c.responsable})</option>
          ))}
        </select>

        <button
          onClick={sendWhatsapp}
          className="py-2 px-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700"
        >
          Envoyer WhatsApp
        </button>
      </div>

      {/* Toggle Visuel */}
      <p
        className="self-end text-orange-500 cursor-pointer mb-4"
        onClick={() => setView(view === "card" ? "table" : "card")}
      >
        Visuel
      </p>

      {/* Affichage Card ou Table */}
      {view === "card" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
          {evangelises.map(member => (
            <div key={member.id} className="bg-white p-4 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer flex flex-col justify-between border-t-4" style={{ borderTopColor: "#34A853" }}>
              <h2 className="text-lg font-bold text-gray-800 mb-1">{member.prenom} {member.nom}</h2>

              <p className="mt-2 text-blue-500 underline cursor-pointer"
                 onClick={() => setDetailsOpen(prev => ({ ...prev, [member.id]: !prev[member.id] }))}>
                 {detailsOpen[member.id] ? "Fermer détails" : "Détails"}
              </p>

              {detailsOpen[member.id] && (
                <div className="mt-2 text-sm text-gray-700 space-y-1">
                  <p><strong>Prénom:</strong> {member.prenom}</p>
                  <p><strong>Nom:</strong> {member.nom}</p>
                  <p><strong>Téléphone:</strong> {member.telephone || "—"}</p>
                  <p><strong>WhatsApp:</strong> {member.is_whatsapp ? "Oui" : "Non"}</p>
                  <p><strong>Ville:</strong> {member.ville || "—"}</p>
                  <p><strong>Besoin:</strong> {member.besoin || "—"}</p>
                  <p><strong>Infos supplémentaires:</strong> {member.infos_supplementaires || "—"}</p>
                  <p><strong>Comment est-il venu ?</strong> {member.comment || "—"}</p>
                  <label className="flex items-center gap-2 mt-2">
                    <input type="checkbox" checked={member.send_whatsapp || false} 
                           onChange={() => setEvangelises(prev => prev.map(m => m.id === member.id ? {...m, send_whatsapp: !m.send_whatsapp} : m))} />
                    Envoyer par WhatsApp
                  </label>
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
                <th className="py-2 px-4">Détails</th>
              </tr>
            </thead>
            <tbody>
              {evangelises.map(member => (
                <tr key={member.id} className="border-b">
                  <td className="py-2 px-4">{member.prenom}</td>
                  <td className="py-2 px-4">{member.nom}</td>
                  <td className="py-2 px-4">
                    <p className="text-blue-500 underline cursor-pointer"
                       onClick={() => setDetailsOpen(prev => ({ ...prev, [member.id]: !prev[member.id] }))}>
                      {detailsOpen[member.id] ? "Fermer détails" : "Détails"}
                    </p>
                    {detailsOpen[member.id] && (
                      <div className="mt-2 text-sm text-gray-700 space-y-1">
                        <p><strong>Prénom:</strong> {member.prenom}</p>
                        <p><strong>Nom:</strong> {member.nom}</p>
                        <p><strong>Téléphone:</strong> {member.telephone || "—"}</p>
                        <p><strong>WhatsApp:</strong> {member.is_whatsapp ? "Oui" : "Non"}</p>
                        <p><strong>Ville:</strong> {member.ville || "—"}</p>
                        <p><strong>Besoin:</strong> {member.besoin || "—"}</p>
                        <p><strong>Infos supplémentaires:</strong> {member.infos_supplementaires || "—"}</p>
                        <p><strong>Comment est-il venu ?</strong> {member.comment || "—"}</p>
                        <label className="flex items-center gap-2 mt-2">
                          <input type="checkbox" checked={member.send_whatsapp || false} 
                                 onChange={() => setEvangelises(prev => prev.map(m => m.id === member.id ? {...m, send_whatsapp: !m.send_whatsapp} : m))} />
                          Envoyer par WhatsApp
                        </label>
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
