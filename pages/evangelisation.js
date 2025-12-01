// ✅ pages/evangelisation.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "../lib/supabaseClient";
import Image from "next/image";
import LogoutLink from "../components/LogoutLink";
import EditEvangelisePopup from "../components/EditEvangelisePopup";

export default function Evangelisation() {
  const router = useRouter();
  const [contacts, setContacts] = useState([]);
  const [cellules, setCellules] = useState([]);
  const [conseillers, setConseillers] = useState([]);
  const [detailsOpen, setDetailsOpen] = useState({});
  const [checkedContacts, setCheckedContacts] = useState({});
  const [editMember, setEditMember] = useState(null);
  const [view, setView] = useState("card");

  // Menu centralisé envoyer à
  const [targetType, setTargetType] = useState(""); // "cellule" ou "conseiller"
  const [targetId, setTargetId] = useState("");

  useEffect(() => {
    fetchContacts();
    fetchCellules();
    fetchConseillers();
  }, []);

  const fetchContacts = async () => {
    const { data } = await supabase
      .from("evangelises")
      .select("*")
      .order("created_at", { ascending: false });
    setContacts(data || []);
  };

  const fetchCellules = async () => {
    const { data } = await supabase
      .from("cellules")
      .select("id, cellule, responsable, telephone");
    setCellules(data || []);
  };

  const fetchConseillers = async () => {
    const { data } = await supabase
      .from("conseillers")
      .select("*");
    setConseillers(data || []);
  };

  const toggleDetails = (id) =>
    setDetailsOpen((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleCheck = (id) =>
    setCheckedContacts((prev) => ({ ...prev, [id]: !prev[id] }));

  const formatBesoin = (b) => {
    if (!b) return "—";
    if (Array.isArray(b)) return b.join(", ");
    try {
      const arr = JSON.parse(b);
      return Array.isArray(arr) ? arr.join(", ") : b;
    } catch {
      return b;
    }
  };

  const sendWhatsapp = () => {
    const selectedIds = Object.keys(checkedContacts).filter((id) => checkedContacts[id]);
    if (selectedIds.length === 0) {
      alert("⚠️ Sélectionnez au moins un contact à envoyer");
      return;
    }
    if (!targetType || !targetId) {
      alert("⚠️ Choisissez une cellule ou un conseiller");
      return;
    }
    alert(`✅ WhatsApp envoyé aux ${selectedIds.length} contact(s)`);
  };

  const handleUpdateMember = (updated) => {
    setContacts((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
  };

  const userName = "Utilisateur";

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center p-6"
      style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}
    >
      {/* HEADER */}
      <div className="w-full max-w-5xl mb-6">
        <div className="flex justify-between items-center">
          <button onClick={() => router.back()} className="text-white">
            ← Retour
          </button>
          <LogoutLink />
        </div>
        <div className="flex justify-end mt-2">
          <p className="text-orange-200 text-sm">👋 Bienvenue {userName}</p>
        </div>
      </div>

      {/* LOGO ET TITRE */}
      <Image src="/logo.png" alt="Logo" width={90} height={90} className="mb-3" />
      <h1 className="text-4xl text-white text-center mb-2">Évangélisation</h1>

      {/* MENU ENVOYER À CENTRALISE */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4 items-center justify-center w-full max-w-md">
        <select
          value={targetType}
          onChange={(e) => { setTargetType(e.target.value); setTargetId(""); }}
          className="w-full border rounded px-3 py-2 text-sm shadow-sm"
        >
          <option value="">-- Envoyer à --</option>
          <option value="cellule">Cellule</option>
          <option value="conseiller">Conseiller</option>
        </select>

        {targetType && (
          <select
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm shadow-sm"
          >
            <option value="">-- Choisir {targetType} --</option>
            {targetType === "cellule"
              ? cellules.map((c) => (
                  <option key={c.id} value={c.id}>{c.cellule} ({c.responsable})</option>
                ))
              : conseillers.map((c) => (
                  <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>
                ))
            }
          </select>
        )}

        {Object.values(checkedContacts).some(Boolean) && targetId && (
          <button
            onClick={sendWhatsapp}
            className="bg-green-500 text-white font-bold px-4 py-2 rounded-xl shadow-md hover:bg-green-600 transition-all"
          >
            ✅ Envoyer WhatsApp
          </button>
        )}
      </div>

      {/* BASCULE VUE */}
      <p
        onClick={() => setView(view === "card" ? "table" : "card")}
        className="cursor-pointer text-yellow-100 underline hover:text-white text-sm mb-4"
      >
        {view === "card" ? "Vue Table" : "Vue Carte"}
      </p>

      {/* VUE CARTE */}
      {view === "card" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-5xl">
          {contacts.map((member) => {
            const isOpen = detailsOpen[member.id];
            return (
              <div key={member.id} className="bg-white text-gray-900 rounded-2xl shadow-xl p-4 relative">
                <h2 className="font-bold text-lg mb-1 text-center text-blue-800">
                  {member.prenom} {member.nom}
                </h2>
                <p className="text-sm text-center mb-2">📱 {member.telephone || "—"}</p>

                {/* CASE À COCHER */}
                <label className="flex items-center justify-center gap-2 text-sm mb-2">
                  <input
                    type="checkbox"
                    checked={checkedContacts[member.id] || false}
                    onChange={() => handleCheck(member.id)}
                  />
                  ✅ Envoyer ce Contact
                </label>

                <button
                  onClick={() => toggleDetails(member.id)}
                  className="text-orange-500 underline text-sm mt-2 block mx-auto"
                >
                  {isOpen ? "Fermer détails" : "Détails"}
                </button>

                {isOpen && (
                  <div className="text-gray-700 text-sm mt-2 space-y-2 w-full text-center flex flex-col items-center">
                    <p>💬 WhatsApp : {member.is_whatsapp ? "Oui" : "Non"}</p>
                    <p>🏙 Ville: {member.ville || "—"}</p>
                    <p>❓ Besoin : {formatBesoin(member.besoin)}</p>
                    <p>📝 Infos: {member.infos_supplementaires || "—"}</p>

                    {/* ✏️ Modifier le contact */}
                    <button
                      onClick={() => setEditMember(member)}
                      className="text-blue-600 text-sm mt-2 block mx-auto"
                    >
                      ✏️ Modifier le contact
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* VUE TABLE */}
      {view === "table" && (
        <div className="w-full max-w-6xl overflow-x-auto mt-4 transition duration-200">
          <table className="w-full text-sm text-left text-white border-separate border-spacing-0">
            <thead className="bg-gray-200 text-gray-800 text-sm uppercase rounded-t-md">
              <tr>
                <th className="px-4 py-2 rounded-tl-lg">Prénom</th>
                <th className="px-4 py-2">Nom</th>
                <th className="px-4 py-2 text-center">Envoyer ce Contact</th>
                <th className="px-4 py-2 rounded-tr-lg text-center">Détails</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((member) => (
                <tr
                  key={member.id}
                  className="hover:bg-white/10 transition duration-150 border-b border-blue-300"
                >
                  <td className="px-4 py-2">{member.prenom}</td>
                  <td className="px-4 py-2">{member.nom}</td>
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
                      className="text-orange-500 underline text-sm"
                    >
                      {detailsOpen[member.id] ? "Fermer détails" : "Détails"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* POPUP EDIT */}
      {editMember && (
        <EditEvangelisePopup
          member={editMember}
          cellules={cellules}
          conseillers={conseillers}
          onClose={() => setEditMember(null)}
          onUpdateMember={(m) => handleUpdateMember(m)}
        />
      )}
    </div>
  );
}
