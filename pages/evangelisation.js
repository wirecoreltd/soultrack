// pages/evangelisation.js
"use client";
import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import Image from "next/image";

export default function Evangelisation() {
  const [members, setMembers] = useState([]);
  const [cellules, setCellules] = useState([]);
  const [selectedCellule, setSelectedCellule] = useState("");
  const [detailsOpen, setDetailsOpen] = useState({});
  const [view, setView] = useState("card"); // 'card' ou 'table'

  useEffect(() => {
    fetchMembers();
    fetchCellules();
  }, []);

  const fetchMembers = async () => {
    const { data, error } = await supabase
      .from("suivis_des_evangelises")
      .select("*")
      .order("date_suivi", { ascending: false });
    if (!error) setMembers(data || []);
  };

  const fetchCellules = async () => {
    const { data, error } = await supabase
      .from("cellules")
      .select("id, cellule, responsable, telephone");
    if (!error) setCellules(data || []);
  };

  const sendWhatsapp = async (member) => {
    if (!selectedCellule) return alert("Sélectionner une cellule d'abord.");
    const cellule = cellules.find((c) => c.id === selectedCellule);
    if (!cellule || !cellule.telephone) return alert("Numéro du responsable introuvable.");

    const phone = cellule.telephone.replace(/\D/g, "");
    const message = `👋 Salut ${cellule.responsable},

🙏 Voici une nouvelle personne à suivre :

- Nom: ${member.nom}
- Prénom: ${member.prenom}
- 📱 ${member.telephone}
- Whatsapp: ${member.is_whatsapp ? "Oui" : "Non"}
- Ville: ${member.ville || "—"}
- Besoin: ${member.besoin || "—"}
- Infos supplémentaires: ${member.infos_supplementaires || "—"}`;

    // Ouverture WhatsApp dans un nouvel onglet
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");

    // Optionnel : mettre à jour le statut du membre en "actif"
    try {
      await supabase
        .from("suivis_des_evangelises")
        .update({ statut: "actif" })
        .eq("id", member.id);

      // Mise à jour optimiste du state
      setMembers((prev) =>
        prev.map((m) => (m.id === member.id ? { ...m, statut: "actif" } : m))
      );
    } catch (err) {
      console.error("Erreur Supabase update:", err.message);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center p-6"
      style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}
    >
      {/* Retour */}
      <button
        onClick={() => window.history.back()}
        className="self-start mb-4 flex items-center text-white font-semibold hover:text-gray-200"
      >
        ← Retour
      </button>

      {/* Logo */}
      <div className="mt-2 mb-2">
        <Image src="/logo.png" alt="Logo" width={80} height={80} />
      </div>

      <h1 className="text-5xl sm:text-6xl font-handwriting text-white text-center mb-3">
        Évangélisation
      </h1>

      {/* Menu Cellule */}
      <div className="mb-6 w-full max-w-md">
        <select
          value={selectedCellule}
          onChange={(e) => setSelectedCellule(e.target.value)}
          className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="">-- Sélectionner cellule --</option>
          {cellules.map((c) => (
            <option key={c.id} value={c.id}>
              {c.cellule} ({c.responsable})
            </option>
          ))}
        </select>
      </div>

      {/* Toggle Visuel */}
      <p
        className="self-end text-orange-500 cursor-pointer mb-4"
        onClick={() => setView(view === "card" ? "table" : "card")}
      >
        {view === "card" ? "Voir en Table" : "Voir en Card"}
      </p>

      {/* CARDS */}
      {view === "card" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
          {members.map((m) => (
            <div
              key={m.id}
              className="bg-white p-4 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300"
            >
              <h2 className="text-lg font-bold">{m.prenom} {m.nom}</h2>
              <p className="text-sm mb-2">📱 {m.telephone || "—"}</p>

              <button
                onClick={() =>
                  setDetailsOpen((prev) => ({ ...prev, [m.id]: !prev[m.id] }))
                }
                className="text-blue-500 underline mb-2"
              >
                {detailsOpen[m.id] ? "Fermer détails" : "Détails"}
              </button>

              {detailsOpen[m.id] && (
                <div className="text-sm space-y-2">
                  <p>Nom: {m.nom}</p>
                  <p>Prénom: {m.prenom}</p>
                  <p>📱 {m.telephone}</p>
                  <p>Whatsapp: {m.is_whatsapp ? "Oui" : "Non"}</p>
                  <p>Ville: {m.ville || "—"}</p>
                  <p>Besoin: {m.besoin || "—"}</p>
                  <p>Infos supplémentaires: {m.infos_supplementaires || "—"}</p>

                  {selectedCellule && (
                    <div className="flex items-center mt-2">
                      <input
                        type="checkbox"
                        id={`send-${m.id}`}
                        className="mr-2"
                        onChange={() => sendWhatsapp(m)}
                      />
                      <label htmlFor={`send-${m.id}`}>Envoyer par WhatsApp</label>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        // TABLE
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
              {members.map((m) => (
                <tr key={m.id} className="border-b">
                  <td className="py-2 px-4">{m.prenom}</td>
                  <td className="py-2 px-4">{m.nom}</td>
                  <td className="py-2 px-4">{m.telephone || "—"}</td>
                  <td className="py-2 px-4">
                    <button
                      className="text-blue-500 underline"
                      onClick={() =>
                        setDetailsOpen((prev) => ({ ...prev, [m.id]: !prev[m.id] }))
                      }
                    >
                      {detailsOpen[m.id] ? "Fermer détails" : "Détails"}
                    </button>

                    {detailsOpen[m.id] && (
                      <div className="mt-2 text-sm space-y-2">
                        <p>Prénom: {m.prenom}</p>
                        <p>Nom: {m.nom}</p>
                        <p>📱 {m.telephone}</p>
                        <p>Whatsapp: {m.is_whatsapp ? "Oui" : "Non"}</p>
                        <p>Ville: {m.ville || "—"}</p>
                        <p>Besoin: {m.besoin || "—"}</p>
                        <p>Infos supplémentaires: {m.infos_supplementaires || "—"}</p>

                        {selectedCellule && (
                          <div className="flex items-center mt-2">
                            <input
                              type="checkbox"
                              id={`send-table-${m.id}`}
                              className="mr-2"
                              onChange={() => sendWhatsapp(m)}
                            />
                            <label htmlFor={`send-table-${m.id}`}>
                              Envoyer par WhatsApp
                            </label>
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
