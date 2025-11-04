// pages/evangelisation.js
"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import Image from "next/image";

export default function Evangelisation() {
  const [contacts, setContacts] = useState([]);
  const [cellules, setCellules] = useState([]);
  const [selectedCellule, setSelectedCellule] = useState("");
  const [detailsOpen, setDetailsOpen] = useState({});
  const [checkedContacts, setCheckedContacts] = useState({});
  const [view, setView] = useState("card");

  useEffect(() => {
    fetchContacts();
    fetchCellules();
  }, []);

  const fetchContacts = async () => {
    const { data, error } = await supabase
      .from("evangelises")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setContacts(data || []);
  };

  const fetchCellules = async () => {
    const { data, error } = await supabase
      .from("cellules")
      .select("id, cellule, responsable, telephone");
    if (!error) setCellules(data || []);
  };

  const toggleDetails = (id) =>
    setDetailsOpen((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleCheck = (id) =>
    setCheckedContacts((prev) => ({ ...prev, [id]: !prev[id] }));

  const getBorderColor = (c) => {
    if (c.statut === "actif") return "#4285F4";
    if (c.statut === "veut rejoindre ICC" || c.statut === "visiteur") return "#34A853";
    if (c.statut === "ancien") return "#999999";
    return "#ccc";
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center p-6 transition-all duration-200"
      style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}
    >
      {/* HEADER */}
      <div className="w-full max-w-5xl mb-6 flex justify-between items-center">
        <button
          onClick={() => window.history.back()}
          className="text-white hover:text-gray-200 transition-colors"
        >
          ← Retour
        </button>
        <Image src="/logo.png" alt="Logo" width={80} height={80} />
      </div>

      <h1 className="text-5xl sm:text-6xl font-handwriting text-white mb-2 text-center">
        Évangélisation
      </h1>
      <p className="text-white text-lg max-w-xl mx-auto italic mb-4 text-center">
        Chaque personne a une valeur infinie...
      </p>

      {/* Cellule + WhatsApp */}
      <div className="mb-4 w-full max-w-5xl flex flex-col sm:flex-row gap-2">
        <select
          value={selectedCellule}
          onChange={(e) => setSelectedCellule(e.target.value)}
          className="border rounded-lg px-4 py-2 w-full text-gray-800"
        >
          <option value="">-- Sélectionner cellule --</option>
          {cellules.map((c) => (
            <option key={c.id} value={c.id}>
              {c.cellule} ({c.responsable})
            </option>
          ))}
        </select>
        {selectedCellule && (
          <button className="bg-green-500 text-white font-bold px-4 py-2 rounded-lg shadow-lg hover:bg-green-600 transition-all">
            Envoyer par WhatsApp
          </button>
        )}
      </div>

      {/* Toggle vue */}
      <p
        onClick={() => setView(view === "card" ? "table" : "card")}
        className="cursor-pointer text-sm text-yellow-100 underline hover:text-white mb-4"
      >
        {view === "card" ? "Changer en vue table" : "Changer en vue carte"}
      </p>

      {/* VUE CARTE */}
      {view === "card" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-6xl">
          {contacts.map((member) => {
            const isOpen = detailsOpen[member.id];
            return (
              <div
                key={member.id}
                className="bg-white p-4 rounded-xl shadow-md border-l-4 transition duration-200 overflow-hidden relative"
                style={{ borderLeftColor: getBorderColor(member) }}
              >
                <h2 className="text-lg font-bold text-gray-800 text-center">
                  {member.prenom} {member.nom}
                </h2>
                <p className="text-sm text-gray-600 text-center mb-1">
                  📱 {member.telephone || "—"}
                </p>
                <label className="flex items-center gap-2 text-sm mb-2 justify-center">
                  <input
                    type="checkbox"
                    checked={checkedContacts[member.id] || false}
                    onChange={() => handleCheck(member.id)}
                  />
                  WhatsApp
                </label>

                <button
                  onClick={() => toggleDetails(member.id)}
                  className="text-orange-500 underline text-sm mx-auto block"
                >
                  {isOpen ? "Fermer" : "Détails"}
                </button>

                {isOpen && (
                  <div className="text-gray-700 text-sm mt-2 space-y-1 w-full">
                    <p>🏙 Ville: {member.ville || "—"}</p>
                    <p>🙏 Besoin: {member.besoin || "—"}</p>
                    <p>📝 Infos: {member.infos_supplementaires || "—"}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* VUE TABLE */}
      {view === "table" && (
        <div className="w-full max-w-6xl overflow-x-auto transition duration-200">
          <table className="w-full text-sm text-left text-white border-separate border-spacing-0 bg-gradient-to-tr from-orange-400/30 via-yellow-200/20 to-pink-300/20 backdrop-blur-md rounded-2xl shadow-lg">
            <thead className="bg-yellow-200/40 text-gray-900 uppercase text-sm">
              <tr>
                <th className="px-4 py-2 rounded-tl-lg">Nom complet</th>
                <th className="px-4 py-2">Téléphone</th>
                <th className="px-4 py-2 text-center">WhatsApp</th>
                <th className="px-4 py-2 rounded-tr-lg text-center">Détails</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((member) => (
                <tr
                  key={member.id}
                  className="hover:bg-yellow-200/50 transition-all border-b border-gray-300"
                >
                  <td className="px-4 py-2 border-l-4 rounded-l-md" style={{ borderLeftColor: getBorderColor(member) }}>
                    {member.prenom} {member.nom}
                  </td>
                  <td className="px-4 py-2">{member.telephone || "—"}</td>
                  <td className="px-4 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={checkedContacts[member.id] || false}
                      onChange={() => handleCheck(member.id)}
                    />
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => toggleDetails(member.id)}
                      className="text-orange-400 underline text-sm"
                    >
                      {detailsOpen[member.id] ? "Fermer" : "Détails"}
                    </button>

                    {detailsOpen[member.id] && (
                      <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
                        <div className="bg-white text-black p-6 rounded-xl w-96 max-h-[90vh] overflow-y-auto relative space-y-2">
                          <button
                            onClick={() => toggleDetails(member.id)}
                            className="absolute top-2 right-2 text-red-500 font-bold"
                          >
                            ✕
                          </button>

                          <h2 className="text-lg font-bold text-gray-800 text-center">
                            {member.prenom} {member.nom}
                          </h2>

                          <p>📱 Téléphone: {member.telephone || "—"}</p>
                          <p>🏙 Ville: {member.ville || "—"}</p>
                          <p>🙏 Besoin: {member.besoin || "—"}</p>
                          <p>📝 Infos: {member.infos_supplementaires || "—"}</p>
                        </div>
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
