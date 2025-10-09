// pages/suivis-evangelisation.js
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function SuivisEvangelisation() {
  const [suivis, setSuivis] = useState([]);
  const [cellules, setCellules] = useState([]);
  const [selectedCellule, setSelectedCellule] = useState("");
  const [showRefus, setShowRefus] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [currentContact, setCurrentContact] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  useEffect(() => {
    fetchCellules();
    fetchSuivis();
  }, []);

  useEffect(() => {
    fetchSuivis(selectedCellule, showRefus);
  }, [selectedCellule, showRefus]);

  const fetchCellules = async () => {
    const { data, error } = await supabase
      .from("cellules")
      .select("id, cellule");
    if (!error) setCellules(data);
  };

  const fetchSuivis = async (cellule = null, refus = false) => {
    let query = supabase
      .from("suivis")
      .select(
        `
        id,
        statut,
        membre:membre_id (id, prenom, nom, telephone, email, ville, besoin, infos_supplementaires, is_whatsapp),
        cellule:cellule_id (id, cellule)
      `
      );

    if (refus) query = query.eq("statut", "refus");
    else query = query.in("statut", ["envoyé", "en cours"]);

    if (cellule) query = query.eq("cellule_id", cellule);

    const { data, error } = await query.order("created_at", { ascending: false });
    if (!error) setSuivis(data);
  };

  const openPopup = (contact) => {
    setCurrentContact(contact);
    setNewStatus(contact.statut);
    setShowPopup(true);
  };

  const handleStatusChange = (e) => {
    setNewStatus(e.target.value);
  };

  const handleValidate = async () => {
    if (!currentContact) return;

    await supabase
      .from("suivis")
      .update({ statut: newStatus })
      .eq("id", currentContact.id);

    if (newStatus === "actif") {
      await supabase
        .from("membres")
        .update({ statut: "actif" })
        .eq("id", currentContact.membre.id);
    }

    setShowPopup(false);
    fetchSuivis(selectedCellule, showRefus);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Suivi des évangélisés</h1>
  
      {/* Filtre cellule */}
      <div className="mb-6 max-w-md mx-auto">
        <label className="block mb-2 font-semibold">Filtrer par cellule :</label>
        <select
          className="w-full p-2 border rounded-lg"
          value={selectedCellule}
          onChange={(e) => setSelectedCellule(e.target.value)}
        >
          <option value="">-- Toutes les cellules --</option>
          {cellules.map((c) => (
            <option key={c.id} value={c.id}>
              {c.cellule}
            </option>
          ))}
        </select>
      </div>

      {/* Tableau */}
      <div className="overflow-x-auto">
        <table className="table-auto w-full max-w-4xl mx-auto border-collapse border border-gray-300 text-center">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-4 py-2">Nom</th>
              <th className="border px-4 py-2">Prénom</th>
              <th className="border px-4 py-2">Cellule</th>
              <th className="border px-4 py-2">Statut</th>
              <th className="border px-4 py-2">Détails</th>
            </tr>
          </thead>
          <tbody>
            {suivis.map((s) => (
              <tr key={s.id}>
                <td className="border px-4 py-2">{s.membre.nom}</td>
                <td className="border px-4 py-2">{s.membre.prenom}</td>
                <td className="border px-4 py-2">{s.cellule?.cellule || "—"}</td>
                <td className="border px-4 py-2">{s.statut}</td>
                <td className="border px-4 py-2">
                  <span
                    className="text-blue-600 cursor-pointer hover:underline"
                    onClick={() => openPopup(s)}
                  >
                    Afficher
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Lien "les refus" */}
      <div className="max-w-4xl mx-auto mt-4 text-right">
        <span
          className="text-blue-600 cursor-pointer hover:underline"
          onClick={() => setShowRefus(!showRefus)}
        >
          {showRefus ? "Retour aux en cours/envoyés" : "Voir les refus"}
        </span>
      </div>

      {/* Popup */}
      {showPopup && currentContact && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl max-w-md w-full relative">
            <h2 className="text-xl font-bold mb-4">Détails du contact</h2>
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
              onClick={() => setShowPopup(false)}
            >
              ✖
            </button>
            <div className="space-y-1 text-gray-700">
              <p>Nom : {currentContact.membre.nom}</p>
              <p>Prénom : {currentContact.membre.prenom}</p>
              <p>📱 Téléphone : {currentContact.membre.telephone}</p>
              <p>📧 Email : {currentContact.membre.email || "—"}</p>
              <p>🏙️ Ville : {currentContact.membre.ville || "—"}</p>
              <p>🙏 Besoin : {currentContact.membre.besoin || "—"}</p>
              <p>📝 Infos supplémentaires : {currentContact.membre.infos_supplementaires || "—"}</p>
              <p>WhatsApp : {currentContact.membre.is_whatsapp ? "✅ Oui" : "❌ Non"}</p>
            </div>

            <div className="mt-4">
              <label className="block mb-2 font-semibold">Changer le statut :</label>
              <select
                className="w-full p-2 border rounded-lg"
                value={newStatus}
                onChange={handleStatusChange}
              >
                <option value="envoyé">Envoyé</option>
                <option value="en cours">En cours</option>
                <option value="actif">Actif</option>
                <option value="refus">Refus</option>
              </select>

              {newStatus !== currentContact.statut && (
                <button
                  className="mt-4 w-full py-2 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600"
                  onClick={handleValidate}
                >
                  Valider
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
