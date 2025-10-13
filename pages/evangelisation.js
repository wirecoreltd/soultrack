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

  const sendWhatsapp = async () => {
    const toSend = contacts.filter((c) => checkedContacts[c.id]);
    if (!selectedCellule) return alert("Sélectionne une cellule !");
    const cellule = cellules.find((c) => String(c.id) === selectedCellule);
    if (!cellule) return alert("Cellule introuvable !");
    if (toSend.length === 0) return alert("Aucun contact sélectionné !");

    const now = new Date().toISOString();
    const suivisData = toSend.map((member) => ({
      prenom: member.prenom,
      nom: member.nom,
      telephone: member.telephone,
      is_whatsapp: true,
      ville: member.ville,
      besoin: member.besoin,
      infos_supplementaires: member.infos_supplementaires,
      cellule_id: selectedCellule,
      responsable_cellule: cellule.responsable,
      date_suivi: now,
    }));

    const { error: insertError } = await supabase
      .from("suivis_des_evangelises")
      .insert(suivisData);

    if (insertError) {
      console.error("Erreur lors de l'insertion du suivi :", insertError.message);
      alert("❌ Une erreur est survenue lors de l’enregistrement des suivis.");
      return;
    }

    const groups = [];
    for (let i = 0; i < toSend.length; i += 10) {
      groups.push(toSend.slice(i, i + 10));
    }

    groups.forEach((group, index) => {
      let message = "";

      if (index === 0) {
        message += `👋 Salut ${cellule.responsable},\n\n🙏 Dieu nous a envoyé de nouvelles âmes à suivre.\nVoici leurs infos :\n\n`;
      } else {
        message += `👋 Salut ${cellule.responsable},\n\n🙏 Voici la suite des âmes à suivre :\n\n`;
      }

      group.forEach((member, i) => {
        message += `- 👤 Nom : ${member.prenom || ""} ${member.nom || ""}\n`;
        message += `- 📱 Téléphone : ${member.telephone || "—"}\n`;
        message += `- 📲 WhatsApp : Oui\n`;
        message += `- 🏙 Ville : ${member.ville || "—"}\n`;
        message += `- 🙏 Besoin : ${member.besoin || "—"}\n`;
        message += `- 📝 Infos supplémentaires : ${member.infos_supplementaires || "—"}\n`;
        if (i < group.length - 1) message += "----------------------\n";
        else message += "\n";
      });

      message += "🙏 Merci pour ton cœur ❤ et ton amour ✨";

      const phone = cellule.telephone.replace(/\D/g, "");
      window.open(
        `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
        "_blank"
      );
    });

    const idsToDelete = toSend.map((c) => c.id);
    const { error: deleteError } = await supabase
      .from("evangelises")
      .delete()
      .in("id", idsToDelete);

    if (deleteError) {
      console.error("Erreur lors de la suppression :", deleteError.message);
    }

    setContacts((prev) => prev.filter((c) => !checkedContacts[c.id]));
    setCheckedContacts({});
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-gradient-to-br from-blue-800 to-cyan-400 text-white">
      <button
        onClick={() => window.history.back()}
        className="self-start mb-4 font-semibold hover:text-gray-200"
      >
        ← Retour
      </button>

      <Image src="/logo.png" alt="Logo" width={80} height={80} className="mb-3" />

      <h1 className="text-5xl font-handwriting text-center mb-2">Évangélisation</h1>

      <p className="text-center text-lg mb-4 font-handwriting-light">
        Chaque personne a une valeur infinie...
      </p>

      <div className="mb-2 w-full max-w-md flex flex-col sm:flex-row gap-2">
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
          <button
            onClick={sendWhatsapp}
            className="bg-green-500 text-white font-bold px-4 py-2 rounded-lg shadow-lg hover:bg-green-600 transition-all"
          >
            Envoyer par WhatsApp
          </button>
        )}
      </div>

      <p
        onClick={() => setView(view === "card" ? "table" : "card")}
        className="cursor-pointer text-sm text-yellow-100 underline hover:text-white mb-4"
      >
        {view === "card" ? "Changer en vue table" : "Changer en vue carte"}
      </p>

      {/* Vue cartes */}
      {view === "card" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 w-full max-w-5xl">
          {contacts.map((member) => {
            const isOpen = detailsOpen[member.id];
            return (
              <div
                key={member.id}
                className="bg-gradient-to-tr from-orange-400/60 via-yellow-200/30 to-pink-300/30 backdrop-blur-md rounded-2xl shadow-lg p-3 flex flex-col items-center transition-all duration-500 ease-in-out overflow-hidden w-full max-w-xs mx-auto border border-white/20"
              >
                <h2 className="font-bold text-white text-base mb-1 text-center">
                  {member.prenom} {member.nom}
                </h2>
                <p className="text-xs text-white/95 mb-1 text-center">
                  📱 {member.telephone || "—"}
                </p>
                <label className="flex items-center gap-2 text-xs mb-1">
                  <input
                    type="checkbox"
                    checked={checkedContacts[member.id] || false}
                    onChange={() => handleCheck(member.id)}
                  />
                  WhatsApp
                </label>

                <button
                  onClick={() => toggleDetails(member.id)}
                  className="text-yellow-100 underline text-sm"
                >
                  {isOpen ? "Fermer" : "Détails"}
                </button>

                {isOpen && (
                  <div className="text-xs text-white/95 mt-2 w-full text-center transition-all duration-500">
                    <p>🏙 Ville: {member.ville || "—"}</p>
                    <p>🙏 Besoin: {member.besoin || "—"}</p>
                    <p>
                      📝 Infos supplémentaires: {member.infos_supplementaires || "—"}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Vue table */}
      {view === "table" && (
        <div className="w-full max-w-5xl overflow-x-auto mt-4 relative">
          <table className="w-full bg-gradient-to-tr from-orange-400/30 via-yellow-200/20 to-pink-300/20 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 text-sm">
            <thead className="bg-yellow-200/40 text-gray-900">
              <tr>
                <th className="p-3 text-left">Prénom</th>
                <th className="p-3 text-left">Nom</th>
                <th className="p-3 text-center">WhatsApp</th>
                <th className="p-3 text-center">Détails</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((member) => (
                <tr key={member.id} className="hover:bg-yellow-200/50 transition-all">
                  <td className="p-3">{member.prenom}</td>
                  <td className="p-3">{member.nom}</td>
                  <td className="text-center">
                    <input
                      type="checkbox"
                      checked={checkedContacts[member.id] || false}
                      onChange={() => handleCheck(member.id)}
                    />
                  </td>
                  <td
                    onClick={() => toggleDetails(member.id)}
                    className="text-orange-600 underline text-center cursor-pointer"
                  >
                    Détails
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Popup */}
          {contacts.map((member) =>
            detailsOpen[member.id] ? (
              <div
                key={member.id}
                className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50"
              >
                <div className="bg-gradient-to-tr from-orange-400/60 via-yellow-200/40 to-pink-300/30 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-6 w-80 text-gray-900 text-sm relative">
                  <button
                    onClick={() => toggleDetails(member.id)}
                    className="absolute top-3 right-3 text-sm text-orange-600 hover:text-orange-700 underline"
                  >
                    Fermer
                  </button>
                  <h3 className="text-lg font-bold mb-3 text-center text-white">
                    {member.prenom} {member.nom}
                  </h3>
                  <p>📱 Téléphone : {member.telephone || "—"}</p>
                  <p>🏙 Ville : {member.ville || "—"}</p>
                  <p>🙏 Besoin : {member.besoin || "—"}</p>
                  <p>📝 Infos : {member.infos_supplementaires || "—"}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <input
                      type="checkbox"
                      checked={checkedContacts[member.id] || false}
                      onChange={() => handleCheck(member.id)}
                    />
                    <span>WhatsApp</span>
                  </div>
                </div>
              </div>
            ) : null
          )}
        </div>
      )}
    </div>
  );
}
