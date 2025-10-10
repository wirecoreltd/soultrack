=// pages/evangelisation.js

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";

export default function Evangelisation() {
  const [evangelises, setEvangelises] = useState([]);
  const [cellules, setCellules] = useState([]);
  const [selectedCellules, setSelectedCellules] = useState({});
  const [detailsOpen, setDetailsOpen] = useState({});
  const [view, setView] = useState("card"); // 'card' ou 'table'

  useEffect(() => {
    fetchEvangelises();
    fetchCellules();
  }, []);

  const fetchEvangelises = async () => {
    const { data, error } = await supabase
      .from("evangelises")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) console.error("Erreur fetch evangelises:", error);
    else setEvangelises(data || []);
  };

  const fetchCellules = async () => {
    const { data, error } = await supabase
      .from("cellules")
      .select("*")
      .order("cellule");
    if (error) console.error("Erreur fetch cellules:", error);
    else setCellules(data || []);
  };

  const sendWhatsapp = async (member) => {
    const cellule = cellules.find((c) => c.id === selectedCellules[member.id]);
    if (!cellule) return alert("Cellule introuvable.");
    const phone = cellule.telephone.replace(/\D/g, "");
    if (!phone) return alert("Numéro de la cellule invalide.");

    const message = `👋 Salut ${cellule.responsable},

🙏 Dieu nous a envoyé une nouvelle âme à suivre.
Voici ses infos :

- 👤 Nom : ${member.prenom} ${member.nom}
- 📱 Téléphone : ${member.telephone || "—"}
- 🏙 Ville : ${member.ville || "—"}
- 🙏 Besoin : ${member.besoin || "—"}
- 📝 Infos supplémentaires : ${member.infos_supplementaires || "—"}

Merci pour ton cœur ❤ et son amour ✨`;

    // ouvrir WhatsApp
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");

    // enregistrer dans suivis_des_evangelises
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
    if (error) return console.error("Erreur suivi:", error);

    // retirer de la liste
    setEvangelises((prev) => prev.filter((m) => m.id !== member.id));
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-b from-blue-400 to-blue-200">
      <h1 className="text-4xl font-bold mb-6 text-center text-white">Évangélisation</h1>

      <div className="flex justify-center mb-4">
        <button
          className="px-4 py-2 bg-white rounded-lg shadow"
          onClick={() => setView(view === "card" ? "table" : "card")}
        >
          Voir en {view === "card" ? "Table" : "Card"}
        </button>
      </div>

      {view === "card" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {evangelises.map((member) => (
            <div key={member.id} className="bg-white p-4 rounded-xl shadow">
              <h2 className="font-bold text-lg mb-2">{member.prenom} {member.nom}</h2>
              <p>📱 {member.telephone || "—"}</p>

              <button
                className="mt-2 text-blue-500 underline"
                onClick={() => setDetailsOpen((prev) => ({ ...prev, [member.id]: !prev[member.id] }))}
              >
                {detailsOpen[member.id] ? "Fermer détails" : "Détails"}
              </button>

              {detailsOpen[member.id] && (
                <div className="mt-2 p-2 bg-gray-50 rounded">
                  <div className="grid grid-cols-4 gap-4 mb-2 font-medium text-sm">
                    <div>Prénom</div>
                    <div>Nom</div>
                    <div>Téléphone</div>
                    <div>WhatsApp</div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 mb-2 text-sm">
                    <div>{member.prenom}</div>
                    <div>{member.nom}</div>
                    <div>{member.telephone || "—"}</div>
                    <div>{member.is_whatsapp ? "Oui" : "Non"}</div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-2 text-sm">
                    <div>Ville: {member.ville || "—"}</div>
                    <div>Besoin: {member.besoin || "—"}</div>
                    <div>Infos: {member.infos_supplementaires || "—"}</div>
                  </div>

                  <select
                    value={selectedCellules[member.id] || ""}
                    onChange={(e) => setSelectedCellules((prev) => ({ ...prev, [member.id]: e.target.value }))}
                    className="border rounded px-2 py-1 w-full mb-2 text-sm"
                  >
                    <option value="">-- Sélectionner cellule --</option>
                    {cellules.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.cellule} ({c.responsable})
                      </option>
                    ))}
                  </select>

                  {selectedCellules[member.id] && (
                    <button
                      onClick={() => sendWhatsapp(member)}
                      className="mt-2 w-full py-2 bg-green-500 text-white rounded-lg font-bold"
                    >
                      Envoyer
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl p-2 shadow">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-2">Prénom</th>
                <th className="p-2">Nom</th>
                <th className="p-2">Téléphone</th>
                <th className="p-2">WhatsApp</th>
                <th className="p-2">Détails</th>
              </tr>
            </thead>
            <tbody>
              {evangelises.map((member) => (
                <tr key={member.id} className="border-b">
                  <td className="p-2">{member.prenom}</td>
                  <td className="p-2">{member.nom}</td>
                  <td className="p-2">{member.telephone || "—"}</td>
                  <td className="p-2">{member.is_whatsapp ? "Oui" : "Non"}</td>
                  <td className="p-2">
                    <button
                      className="text-blue-500 underline"
                      onClick={() => setDetailsOpen((prev) => ({ ...prev, [member.id]: !prev[member.id] }))}
                    >
                      {detailsOpen[member.id] ? "Fermer détails" : "Détails"}
                    </button>

                    {detailsOpen[member.id] && (
                      <div className="mt-2 p-2 bg-gray-50 rounded">
                        <div className="grid grid-cols-3 gap-4 mb-2 text-sm">
                          <div>Ville: {member.ville || "—"}</div>
                          <div>Besoin: {member.besoin || "—"}</div>
                          <div>Infos: {member.infos_supplementaires || "—"}</div>
                        </div>

                        <select
                          value={selectedCellules[member.id] || ""}
                          onChange={(e) => setSelectedCellules((prev) => ({ ...prev, [member.id]: e.target.value }))}
                          className="border rounded px-2 py-1 w-full mb-2 text-sm"
                        >
                          <option value="">-- Sélectionner cellule --</option>
                          {cellules.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.cellule} ({c.responsable})
                            </option>
                          ))}
                        </select>

                        {selectedCellules[member.id] && (
                          <button
                            onClick={() => sendWhatsapp(member)}
                            className="mt-2 w-full py-2 bg-green-500 text-white rounded-lg font-bold"
                          >
                            Envoyer
                          </button>
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
