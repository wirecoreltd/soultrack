// pages/evangelisation.js

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// ✅ Initialisation de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function EvangelisationPage() {
  const [evangelises, setEvangelises] = useState([]);
  const [cellules, setCellules] = useState([]);
  const [selectedCellule, setSelectedCellule] = useState("");
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [view, setView] = useState("table");

  // Charger les données depuis Supabase
  useEffect(() => {
    fetchEvangelises();
    fetchCellules();
  }, []);

  const fetchEvangelises = async () => {
    const { data, error } = await supabase.from("evangelises").select("*").order("id", { ascending: false });
    if (error) console.error("Erreur chargement évangélisés :", error);
    else setEvangelises(data || []);
  };

  const fetchCellules = async () => {
    const { data, error } = await supabase.from("cellules").select("id, cellule, responsable, telephone");
    if (error) console.error("Erreur chargement cellules :", error);
    else setCellules(data || []);
  };

  const toggleContactSelection = (id) => {
    setSelectedContacts((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleSendWhatsApp = async () => {
    if (!selectedCellule) {
      alert("Veuillez sélectionner une cellule avant d’envoyer.");
      return;
    }

    const cellule = cellules.find((c) => c.id === selectedCellule);
    if (!cellule) {
      alert("Cellule introuvable.");
      return;
    }

    const contactsToSend = evangelises.filter((e) =>
      selectedContacts.includes(e.id)
    );

    if (contactsToSend.length === 0) {
      alert("Veuillez sélectionner au moins une personne à envoyer.");
      return;
    }

    try {
      // 1️⃣ Insérer dans suivis_des_evangelises
      const suivisData = contactsToSend.map((e) => ({
        prenom: e.prenom,
        nom: e.nom,
        telephone: e.telephone,
        is_whatsapp: e.is_whatsapp,
        ville: e.ville,
        besoin: e.besoin,
        infos_supplementaires: e.infos_supplementaires,
        cellule_id: cellule.id,
        responsable_cellule: cellule.responsable,
      }));

      const { error: insertError } = await supabase
        .from("suivis_des_evangelises")
        .insert(suivisData);

      if (insertError) throw insertError;

      // 2️⃣ Supprimer de evangelises
      const { error: deleteError } = await supabase
        .from("evangelises")
        .delete()
        .in("id", selectedContacts);

      if (deleteError) throw deleteError;

      // 3️⃣ Actualiser la liste
      await fetchEvangelises();
      setSelectedContacts([]);

      alert("Contacts transférés avec succès au responsable de la cellule !");
    } catch (err) {
      console.error("Erreur envoi WhatsApp :", err);
      alert("Une erreur est survenue pendant l’envoi.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-indigo-100 p-6">
      <h1 className="text-3xl font-extrabold text-center text-indigo-700 mb-6">
        Liste des évangélisés
      </h1>

      {/* Sélecteur de cellule */}
      <div className="flex flex-col items-center mb-6">
        <select
          value={selectedCellule}
          onChange={(e) => setSelectedCellule(e.target.value)}
          className="w-80 border border-gray-400 rounded-xl p-3 shadow-sm text-gray-700"
        >
          <option value="">Sélectionner une cellule...</option>
          {cellules.map((c) => (
            <option key={c.id} value={c.id}>
              {c.cellule} — Responsable : {c.responsable}
            </option>
          ))}
        </select>

        {/* Bouton WhatsApp */}
        {selectedCellule && (
          <button
            onClick={handleSendWhatsApp}
            className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl font-semibold shadow-md"
          >
            📤 Envoyer par WhatsApp
          </button>
        )}
      </div>

      {/* Boutons de vue */}
      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={() => setView("card")}
          className={`px-4 py-2 rounded border font-semibold ${
            view === "card"
              ? "bg-indigo-600 text-white"
              : "bg-white text-indigo-600 border-indigo-400"
          }`}
        >
          Vue carte
        </button>
        <button
          onClick={() => setView("table")}
          className={`px-4 py-2 rounded border font-semibold ${
            view === "table"
              ? "bg-indigo-600 text-white"
              : "bg-white text-indigo-600 border-indigo-400"
          }`}
        >
          Vue tableau
        </button>
      </div>

      {/* Vue carte */}
      {view === "card" ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {evangelises.length === 0 ? (
            <p className="text-center text-gray-500 col-span-full">
              Aucune personne évangélisée enregistrée pour le moment.
            </p>
          ) : (
            evangelises.map((e) => (
              <div
                key={e.id}
                className={`p-4 border rounded-2xl shadow ${
                  selectedContacts.includes(e.id)
                    ? "border-green-500"
                    : "border-gray-300"
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <input
                    type="checkbox"
                    checked={selectedContacts.includes(e.id)}
                    onChange={() => toggleContactSelection(e.id)}
                  />
                  <h3 className="text-lg font-bold">
                    {e.prenom} {e.nom}
                  </h3>
                </div>

                <p className="text-sm text-gray-700">
                  📞 Téléphone : {e.telephone} <br />
                  💬 WhatsApp : {e.is_whatsapp ? "Oui" : "Non"} <br />
                  🏙 Ville : {e.ville || "—"} <br />
                  🙏 Besoin : {e.besoin || "—"} <br />
                  📝 Infos : {e.infos_supplementaires || "—"}
                </p>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Vue tableau */
        <div className="overflow-x-auto">
          {evangelises.length === 0 ? (
            <p className="text-center text-gray-500">
              Aucune personne évangélisée enregistrée pour le moment.
            </p>
          ) : (
            <table className="min-w-full border border-gray-300 rounded-xl bg-white shadow">
              <thead className="bg-indigo-100">
                <tr className="text-left">
                  <th className="p-3">Sélect.</th>
                  <th className="p-3">Prénom</th>
                  <th className="p-3">Nom</th>
                  <th className="p-3">Téléphone</th>
                  <th className="p-3">WhatsApp</th>
                  <th className="p-3 text-center">Détails</th>
                </tr>
              </thead>
              <tbody>
                {evangelises.map((e) => (
                  <tr
                    key={e.id}
                    className={`border-t ${
                      selectedContacts.includes(e.id)
                        ? "bg-green-50"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectedContacts.includes(e.id)}
                        onChange={() => toggleContactSelection(e.id)}
                      />
                    </td>
                    <td className="p-3">{e.prenom}</td>
                    <td className="p-3">{e.nom}</td>
                    <td className="p-3">{e.telephone}</td>
                    <td className="p-3">{e.is_whatsapp ? "Oui" : "Non"}</td>
                    <td className="p-3 text-sm text-gray-700">
                      <div className="space-y-1">
                        <div>🏙 Ville : {e.ville || "—"}</div>
                        <div>🙏 Besoin : {e.besoin || "—"}</div>
                        <div>📝 Infos : {e.infos_supplementaires || "—"}</div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
