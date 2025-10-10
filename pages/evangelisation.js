//pages/evangelisation.js
"use client";
import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";

export default function ListEvangelises() {
  const [evangelises, setEvangelises] = useState([]);
  const [cellules, setCellules] = useState([]);
  const [detailsOpen, setDetailsOpen] = useState({});
  const [selectedCellules, setSelectedCellules] = useState({});
  const [selectedForWhatsapp, setSelectedForWhatsapp] = useState({});
  const [view, setView] = useState("card"); // card ou table
  const [filterCellule, setFilterCellule] = useState("");

  useEffect(() => {
    fetchEvangelises();
    fetchCellules();
  }, []);

  const fetchEvangelises = async () => {
    const { data, error } = await supabase
      .from("evangelises")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) console.error(error);
    else setEvangelises(data || []);
  };

  const fetchCellules = async () => {
    const { data, error } = await supabase.from("cellules").select("*");
    if (error) console.error(error);
    else setCellules(data || []);
  };

  const handleWhatsappCheckbox = (id, checked) => {
    setSelectedForWhatsapp((prev) => ({ ...prev, [id]: checked }));
  };

  const sendWhatsapp = (celluleId) => {
    const cellule = cellules.find((c) => String(c.id) === String(celluleId));
    if (!cellule) return alert("Cellule introuvable.");

    const selectedContacts = evangelises.filter(
      (e) => selectedForWhatsapp[e.id] === true
    );
    if (selectedContacts.length === 0) return alert("Aucun contact sélectionné.");

    selectedContacts.forEach((contact) => {
      const phone = cellule.telephone.replace(/\D/g, "");
      if (!phone) return;

      const message = `👋 Salut ${cellule.responsable},

🙏 Dieu nous a envoyé une nouvelle âme à suivre.
Voici ses infos :

- 👤 Nom : ${contact.prenom} ${contact.nom}
- 📱 Téléphone : ${contact.telephone || "—"}
- 🏙 Ville : ${contact.ville || "—"}
- 🙏 Besoin : ${contact.besoin || "—"}
- 📝 Infos supplémentaires : ${contact.infos_supplementaires || "—"}
- 💬 Comment est-il venu ? : ${contact.comment || "—"}

Merci pour ton cœur ❤ et son amour ✨`;

      const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
      window.open(waUrl, "_blank");
    });
  };

  const filteredEvangelises = filterCellule
    ? evangelises.filter((e) => String(e.cellule_id) === filterCellule)
    : evangelises;

  return (
    <div className="min-h-screen p-6 bg-gradient-to-b from-indigo-100 to-indigo-50">
      <h1 className="text-3xl font-bold mb-4 text-center text-indigo-700">
        Liste des évangélisés
      </h1>

      {/* Toggle Table / Card */}
      <p
        className="text-right mb-4 cursor-pointer text-indigo-600 underline"
        onClick={() => setView(view === "card" ? "table" : "card")}
      >
        {view === "card" ? "Afficher en tableau" : "Afficher en cartes"}
      </p>

      {/* Filtre cellule */}
      <div className="mb-4">
        <select
          value={filterCellule}
          onChange={(e) => setFilterCellule(e.target.value)}
          className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="">-- Filtrer par cellule --</option>
          {cellules.map((c) => (
            <option key={c.id} value={c.id}>
              {c.cellule} ({c.responsable})
            </option>
          ))}
        </select>
      </div>

      {view === "card" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvangelises.map((ev) => (
            <div
              key={ev.id}
              className="bg-white p-4 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300"
            >
              <h2 className="text-lg font-bold mb-1">{ev.prenom} {ev.nom}</h2>
              <p>📱 {ev.telephone || "—"}</p>
              <p>🏙 {ev.ville || "—"}</p>

              <p
                className="mt-2 text-blue-500 underline cursor-pointer"
                onClick={() =>
                  setDetailsOpen((prev) => ({ ...prev, [ev.id]: !prev[ev.id] }))
                }
              >
                {detailsOpen[ev.id] ? "Fermer détails" : "Détails"}
              </p>

              {detailsOpen[ev.id] && (
                <div className="mt-2 text-sm text-gray-700 space-y-1">
                  <p>🙏 Besoin : {ev.besoin || "—"}</p>
                  <p>📝 Infos supplémentaires : {ev.infos_supplementaires || "—"}</p>
                  <p>💬 Comment est-il venu ? : {ev.comment || "—"}</p>
                  <label className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      checked={selectedForWhatsapp[ev.id] || false}
                      onChange={(e) =>
                        handleWhatsappCheckbox(ev.id, e.target.checked)
                      }
                    />
                    Envoyer par WhatsApp
                  </label>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <table className="min-w-full bg-white rounded-xl shadow-md">
          <thead>
            <tr className="bg-gray-200">
              <th className="py-2 px-4">Prénom</th>
              <th className="py-2 px-4">Nom</th>
              <th className="py-2 px-4">Ville</th>
              <th className="py-2 px-4">Détails</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvangelises.map((ev) => (
              <tr key={ev.id} className="border-b">
                <td className="py-2 px-4">{ev.prenom}</td>
                <td className="py-2 px-4">{ev.nom}</td>
                <td className="py-2 px-4">{ev.ville || "—"}</td>
                <td className="py-2 px-4">
                  <p
                    className="text-blue-500 underline cursor-pointer"
                    onClick={() =>
                      setDetailsOpen((prev) => ({ ...prev, [ev.id]: !prev[ev.id] }))
                    }
                  >
                    {detailsOpen[ev.id] ? "Fermer" : "Détails"}
                  </p>

                  {detailsOpen[ev.id] && (
                    <div className="mt-2 text-sm text-gray-700 space-y-1">
                      <p>📱 {ev.telephone || "—"}</p>
                      <p>🙏 Besoin : {ev.besoin || "—"}</p>
                      <p>📝 Infos supplémentaires : {ev.infos_supplementaires || "—"}</p>
                      <p>💬 Comment est-il venu ? : {ev.comment || "—"}</p>
                      <label className="flex items-center gap-2 mt-2">
                        <input
                          type="checkbox"
                          checked={selectedForWhatsapp[ev.id] || false}
                          onChange={(e) =>
                            handleWhatsappCheckbox(ev.id, e.target.checked)
                          }
                        />
                        Envoyer par WhatsApp
                      </label>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Bouton WhatsApp global */}
      <div className="mt-4 flex gap-2 items-center">
        <select
          value={filterCellule}
          onChange={(e) => setFilterCellule(e.target.value)}
          className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="">-- Sélectionner cellule pour WhatsApp --</option>
          {cellules.map((c) => (
            <option key={c.id} value={c.id}>
              {c.cellule} ({c.responsable})
            </option>
          ))}
        </select>

        <button
          className="py-2 px-4 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600"
          onClick={() => sendWhatsapp(filterCellule)}
          disabled={!filterCellule}
        >
          Envoyer WhatsApp
        </button>
      </div>
    </div>
  );
}
