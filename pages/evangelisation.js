//pages/evangelisation.js
"use client";
import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";

export default function ListEvangelises() {
  const [evangelises, setEvangelises] = useState([]);
  const [detailsOpen, setDetailsOpen] = useState({});
  const [selectedWhatsapp, setSelectedWhatsapp] = useState({});
  const [cellules, setCellules] = useState({});
  const [selectedCellule, setSelectedCellule] = useState("");

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
    else setEvangelises(data);
  };

  const fetchCellules = async () => {
    const { data, error } = await supabase
      .from("cellules")
      .select("*");
    if (error) console.error(error);
    else setCellules(data);
  };

  const handleCheckbox = (id) => {
    setSelectedWhatsapp((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const sendWhatsappToResponsable = () => {
    const cellule = cellules.find((c) => String(c.id) === selectedCellule);
    if (!cellule) return alert("Veuillez sélectionner une cellule !");
    const responsable = cellule.responsable;

    const contacts = evangelises.filter(
      (e) => selectedWhatsapp[e.id]
    );

    contacts.forEach((contact) => {
      const phone = cellule.telephone.replace(/\D/g, "");
      const message = `👋 Salut ${responsable},

🙏 Dieu nous a envoyé une nouvelle âme à suivre.
Voici ses infos :

- 👤 Nom : ${contact.prenom} ${contact.nom}
- 📱 Téléphone : ${contact.telephone || "—"}
- 🏙 Ville : ${contact.ville || "—"}
- 🙏 Besoin : ${contact.besoin || "—"}
- 📝 Infos supplémentaires : ${contact.infos_supplementaires || "—"}
- 💬 Comment est-il venu ? : —

Merci pour ton cœur ❤ et son amour ✨`;

      const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
      window.open(waUrl, "_blank");
    });
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <h1 className="text-3xl font-bold text-center mb-6">Liste des Évangélisés</h1>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-xl shadow">
          <thead>
            <tr className="bg-gray-200">
              <th className="py-2 px-4">Prénom</th>
              <th className="py-2 px-4">Nom</th>
              <th className="py-2 px-4">Détails</th>
            </tr>
          </thead>
          <tbody>
            {evangelises.map((e) => (
              <tr key={e.id} className="border-b">
                <td className="py-2 px-4">{e.prenom}</td>
                <td className="py-2 px-4">{e.nom}</td>
                <td className="py-2 px-4">
                  <p
                    className="text-blue-500 underline cursor-pointer"
                    onClick={() =>
                      setDetailsOpen((prev) => ({ ...prev, [e.id]: !prev[e.id] }))
                    }
                  >
                    {detailsOpen[e.id] ? "Fermer détails" : "Détails"}
                  </p>

                  {detailsOpen[e.id] && (
                    <div className="mt-2 text-sm text-gray-700 space-y-1">
                      <p><strong>Téléphone:</strong> {e.telephone || "—"}</p>
                      <p><strong>WhatsApp:</strong> {e.is_whatsapp ? "Oui" : "Non"}</p>
                      <p><strong>Ville:</strong> {e.ville || "—"}</p>
                      <p><strong>Besoin:</strong> {e.besoin || "—"}</p>
                      <p><strong>Infos supplémentaires:</strong> {e.infos_supplementaires || "—"}</p>

                      <div className="flex items-center gap-2 mt-2">
                        <input
                          type="checkbox"
                          checked={selectedWhatsapp[e.id] || false}
                          onChange={() => handleCheckbox(e.id)}
                        />
                        <label>Envoyer par WhatsApp</label>
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sélection cellule + bouton WhatsApp */}
      <div className="mt-6 flex flex-col sm:flex-row gap-4 items-center">
        <select
          value={selectedCellule}
          onChange={(e) => setSelectedCellule(e.target.value)}
          className="border rounded-lg px-3 py-2"
        >
          <option value="">-- Sélectionner cellule --</option>
          {cellules.map((c) => (
            <option key={c.id} value={c.id}>
              {c.cellule} ({c.responsable})
            </option>
          ))}
        </select>

        <button
          onClick={sendWhatsappToResponsable}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold"
        >
          Envoyer WhatsApp
        </button>
      </div>
    </div>
  );
}
