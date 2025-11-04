// pages/evangelisation.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "../lib/supabaseClient";
import Image from "next/image";
import LogoutLink from "../components/LogoutLink";

export default function Evangelisation() {
  const router = useRouter();
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

    // Ouverture WhatsApp
    const groups = [];
    for (let i = 0; i < toSend.length; i += 10) {
      groups.push(toSend.slice(i, i + 10));
    }

    groups.forEach((group, index) => {
      let message = "";
      if (index === 0) {
        message += `👋 Salut ${cellule.responsable},\n\n🙏 Voici les nouvelles âmes à suivre :\n\n`;
      } else {
        message += `👋 Salut ${cellule.responsable},\n\n🙏 Suite des âmes à suivre :\n\n`;
      }
      group.forEach((member, i) => {
        message += `- 👤 Nom : ${member.prenom || ""} ${member.nom || ""}\n`;
        message += `- 📱 Téléphone : ${member.telephone || "—"}\n`;
        message += `- 📲 WhatsApp : Oui\n`;
        message += `- 🏙 Ville : ${member.ville || "—"}\n`;
        message += `- 🙏 Besoin : ${member.besoin || "—"}\n`;
        message += `- 📝 Infos supplémentaires : ${member.infos_supplementaires || "—"}\n`;
        if (i < group.length - 1) message += "----------------------\n";
      });
      message += "🙏 Merci pour ton cœur ❤ et ton amour ✨";

      const phone = cellule.telephone.replace(/\D/g, "");
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");
    });

    // Supprimer les contacts envoyés
    const idsToDelete = toSend.map((c) => c.id);
    const { error: deleteError } = await supabase
      .from("evangelises")
      .delete()
      .in("id", idsToDelete);

    if (deleteError) console.error(deleteError.message);

    setContacts((prev) => prev.filter((c) => !checkedContacts[c.id]));
    setCheckedContacts({});
  };

  const userName = "Utilisateur";

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-gradient-to-br from-blue-800 to-cyan-400 text-white">
      {/* 🔹 Top bar */}
      <div className="w-full max-w-5xl mb-6">
        {/* Ligne principale : Retour à gauche, Déconnexion à droite */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => router.back()}
            className="flex items-center text-white hover:text-gray-200 transition-colors"
          >
            ← Retour
          </button>
          <LogoutLink />
        </div>

        {/* Ligne du dessous : Bienvenue aligné à droite */}
        <div className="flex justify-end mt-2">
          <p className="text-orange-200 text-sm">👋 Bienvenue {userName}</p>
        </div>
      </div>

      {/* Logo */}
      <Image src="/logo.png" alt="Logo" width={80} height={80} className="mb-3" />

      {/* Titre */}
      <h1 className="text-5xl font-handwriting text-center mb-2">Évangélisation</h1>
      <p className="text-center text-lg mb-4 font-handwriting-light">
        Chaque personne a une valeur infinie...
      </p>

      {/* Contrôles */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4 items-center">
        {/* Menu déroulant cellule (largeur auto) */}
        <select
          value={selectedCellule}
          onChange={(e) => setSelectedCellule(e.target.value)}
          className="border rounded-lg px-4 py-2 text-gray-800 w-auto inline-block"
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
            Envoyer WhatsApp
          </button>
        )}
      </div>

      {/* Toggle Vue */}
      <p
        onClick={() => setView(view === "card" ? "table" : "card")}
        className="cursor-pointer text-sm text-yellow-100 underline hover:text-white mb-4"
      >
        {view === "card" ? "Changer en vue table" : "Changer en vue carte"}
      </p>

      {/* Vue Carte (fond blanc, texte noir) */}
      {view === "card" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 w-full max-w-5xl">
          {contacts.map((member) => {
            const isOpen = detailsOpen[member.id];
            return (
              <div
                key={member.id}
                className="bg-white text-gray-900 rounded-2xl shadow-lg p-3 flex flex-col items-center transition-all duration-500 ease-in-out overflow-hidden w-full max-w-xs mx-auto border border-gray-200"
              >
                <h2 className="font-bold text-base mb-1 text-center">
                  {member.prenom} {member.nom}
                </h2>
                <p className="text-xs mb-1 text-center">
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
                  className="text-orange-600 underline text-sm"
                >
                  {isOpen ? "Fermer" : "Détails"}
                </button>

                {isOpen && (
                  <div className="text-xs mt-2 w-full text-center transition-all duration-500">
                    <p>🏙 Ville: {member.ville || "—"}</p>
                    <p>🙏 Besoin: {member.besoin || "—"}</p>
                    <p>📝 Infos supplémentaires: {member.infos_supplementaires || "—"}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Vue Table */}
      {view === "table" && (
        <div className="w-full max-w-5xl overflow-x-auto mt-4 relative">
          <table className="w-full bg-white/10 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 text-sm text-left">
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
                  <td className="text-center">
                    <button
                      onClick={() => toggleDetails(member.id)}
                      className="text-orange-600 underline"
                    >
                      Détails
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Popups rendues en dehors du tableau (overlay fixe) */}
          {contacts.map(
            (member) =>
              detailsOpen[member.id] && (
                <div
                  key={`popup-${member.id}`}
                  className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                >
                  <div className="bg-white text-gray-900 p-4 rounded-xl max-w-sm w-full relative">
                    <h3 className="font-bold mb-2">
                      {member.prenom} {member.nom}
                    </h3>
                    <p>📱 {member.telephone || "—"}</p>
                    <p>🏙 Ville: {member.ville || "—"}</p>
                    <p>🙏 Besoin: {member.besoin || "—"}</p>
                    <p>📝 Infos supplémentaires: {member.infos_supplementaires || "—"}</p>
                    <button
                      onClick={() => toggleDetails(member.id)}
                      className="absolute top-2 right-2 text-red-500 font-bold"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )
          )}
        </div>
      )}
    </div>
  );
}
