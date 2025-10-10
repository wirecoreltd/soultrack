// pages/evangelisation.js
import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";

export default function Evangelisation() {
  const [evangelises, setEvangelises] = useState([]);
  const [cellules, setCellules] = useState([]);
  const [selectedCellule, setSelectedCellule] = useState("");
  const [viewMode, setViewMode] = useState("table");
  const [checkedIds, setCheckedIds] = useState([]);

  // 🔹 Charger les données
  useEffect(() => {
    fetchEvangelises();
    fetchCellules();
  }, []);

  const fetchEvangelises = async () => {
    const { data, error } = await supabase
      .from("evangelises")
      .select("*")
      .order("id", { ascending: false });

    if (!error) setEvangelises(data);
  };

  const fetchCellules = async () => {
    const { data, error } = await supabase.from("cellules").select("id, nom, responsable, telephone");
    if (!error) setCellules(data || []);
  };

  // 🔹 Cocher / décocher
  const handleCheck = (id) => {
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // 🔹 Envoi WhatsApp
  const handleSendWhatsapp = async () => {
    if (!selectedCellule) {
      alert("Veuillez sélectionner une cellule avant d’envoyer.");
      return;
    }

    const cellule = cellules.find((c) => c.id === selectedCellule);
    if (!cellule) {
      alert("Cellule introuvable.");
      return;
    }

    const contactsToSend = evangelises.filter((e) => checkedIds.includes(e.id));

    // Insérer dans la table suivis_des_evangelises
    for (const ev of contactsToSend) {
      await supabase.from("suivis_des_evangelises").insert([
        {
          prenom: ev.prenom,
          nom: ev.nom,
          telephone: ev.telephone,
          is_whatsapp: ev.is_whatsapp,
          ville: ev.ville,
          besoin: ev.besoin,
          infos_supplementaires: ev.infos_supplementaires,
          comment: ev.comment,
          cellule_id: selectedCellule,
          responsable_cellule: cellule.responsable,
        },
      ]);
    }

    // Supprimer de la table evangelises
    await supabase.from("evangelises").delete().in("id", checkedIds);

    // Message WhatsApp
    const contactsText = contactsToSend
      .map(
        (ev) =>
          `👤 Nom : ${ev.prenom} ${ev.nom}\n📱 Téléphone : ${ev.telephone}\n🏙 Ville : ${ev.ville || "—"}\n🙏 Besoin : ${ev.besoin || "—"}\n📝 Infos supplémentaires : ${ev.infos_supplementaires || "—"}`
      )
      .join("\n\n");

    const message = encodeURIComponent(
      `👋 Salut ${cellule.responsable},\n\n🙏 Dieu nous a envoyé une nouvelle âme à suivre.\nVoici ses infos :\n\n${contactsText}\n\nMerci pour ton cœur ❤ et ton amour ✨`
    );

    window.open(`https://wa.me/${cellule.telephone}?text=${message}`, "_blank");

    // Mise à jour de l’affichage
    setEvangelises((prev) => prev.filter((e) => !checkedIds.includes(e.id)));
    setCheckedIds([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-100 to-indigo-50 p-6">
      <h1 className="text-3xl font-extrabold text-center text-indigo-700 mb-4">
        Liste des personnes évangélisées
      </h1>

      {/* Menu déroulant cellule */}
      <div className="flex justify-center mb-6">
        <select
          value={selectedCellule}
          onChange={(e) => setSelectedCellule(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400"
        >
          <option value="">Sélectionner une cellule...</option>
          {cellules.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nom} ({c.responsable})
            </option>
          ))}
        </select>
      </div>

      {/* Bouton WhatsApp (affiché seulement si une cellule est sélectionnée) */}
      {selectedCellule && (
        <div className="flex justify-center mb-6">
          <button
            onClick={handleSendWhatsapp}
            className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded-2xl shadow-md transition-all duration-200"
          >
            📤 Envoyer par WhatsApp
          </button>
        </div>
      )}

      {/* Changement d’affichage */}
      <div className="flex justify-center mb-6">
        <div className="flex gap-4">
          <button
            onClick={() => setViewMode("table")}
            className={`px-4 py-2 rounded-xl ${
              viewMode === "table"
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Mode Table
          </button>
          <button
            onClick={() => setViewMode("cards")}
            className={`px-4 py-2 rounded-xl ${
              viewMode === "cards"
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Mode Cartes
          </button>
        </div>
      </div>

      {/* TABLE VIEW */}
      {viewMode === "table" && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-xl shadow-lg">
            <thead>
              <tr className="bg-indigo-600 text-white text-left">
                <th className="p-3 text-center">✔</th>
                <th className="p-3 text-center">Prénom</th>
                <th className="p-3 text-center">Nom</th>
                <th className="p-3 text-center">Téléphone</th>
                <th className="p-3 text-center">WhatsApp</th>
                <th className="p-3 text-center">Détails</th>
              </tr>
            </thead>
            <tbody>
              {evangelises.map((e) => (
                <tr key={e.id} className="border-t text-center">
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={checkedIds.includes(e.id)}
                      onChange={() => handleCheck(e.id)}
                    />
                  </td>
                  <td className="p-3">{e.prenom}</td>
                  <td className="p-3">{e.nom}</td>
                  <td className="p-3">{e.telephone}</td>
                  <td className="p-3">
                    {e.is_whatsapp ? "Oui" : "Non"}
                  </td>
                  <td className="p-3 text-sm text-gray-600 text-left">
                    <div><strong>Ville :</strong> {e.ville || "—"}</div>
                    <div><strong>Besoin :</strong> {e.besoin || "—"}</div>
                    <div><strong>Infos :</strong> {e.infos_supplementaires || "—"}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CARDS VIEW */}
      {viewMode === "cards" && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {evangelises.map((e) => (
            <div
              key={e.id}
              className="bg-white p-5 rounded-2xl shadow-lg border relative"
            >
              <input
                type="checkbox"
                checked={checkedIds.includes(e.id)}
                onChange={() => handleCheck(e.id)}
                className="absolute top-3 right-3"
              />
              <h2 className="text-xl font-bold text-indigo-700">
                {e.prenom} {e.nom}
              </h2>
              <p className="text-gray-700 mt-1">
                📱 {e.telephone} ({e.is_whatsapp ? "WhatsApp" : "Non"})
              </p>
              <p className="text-gray-600 mt-2">
                🏙 <strong>Ville :</strong> {e.ville || "—"}
              </p>
              <p className="text-gray-600">
                🙏 <strong>Besoin :</strong> {e.besoin || "—"}
              </p>
              <p className="text-gray-600">
                📝 <strong>Infos :</strong> {e.infos_supplementaires || "—"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
