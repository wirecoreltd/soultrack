// ✅ pages/evangelisation.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "../lib/supabaseClient";
import Image from "next/image";
import LogoutLink from "../components/LogoutLink";
import EditEvangelisePopup from "../components/EditEvangelisePopup";
import BoutonEnvoyer from "../components/BoutonEnvoyer";

export default function Evangelisation() {
  const router = useRouter();
  const [contacts, setContacts] = useState([]);
  const [cellules, setCellules] = useState([]);
  const [conseillers, setConseillers] = useState([]);
  const [selectedTargetType, setSelectedTargetType] = useState(""); // centralisé
  const [selectedTarget, setSelectedTarget] = useState("");
  const [detailsOpen, setDetailsOpen] = useState({});
  const [checkedContacts, setCheckedContacts] = useState({});
  const [view, setView] = useState("card");
  const [editMember, setEditMember] = useState(null);

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
      .select("id, prenom, nom, telephone");
    setConseillers(data || []);
  };

  const toggleDetails = (id) =>
    setDetailsOpen((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleCheck = (id) =>
    setCheckedContacts((prev) => ({ ...prev, [id]: !prev[id] }));

  const sendWhatsapp = () => {
    alert("✅ Envoi WhatsApp pour les contacts sélectionnés");
  };

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
      </div>

      {/* LOGO ET TITRE */}
      <Image src="/logo.png" alt="Logo" width={90} height={90} className="mb-3" />
      <h1 className="text-4xl text-white text-center mb-4">Évangélisation</h1>

      {/* ENVOYER À CENTRALISE */}
      <div className="flex flex-col items-center mb-4 w-full max-w-md">
        <label className="font-semibold mb-1 text-white">Envoyer à :</label>
        <select
          value={selectedTargetType}
          onChange={(e) => {
            setSelectedTargetType(e.target.value);
            setSelectedTarget("");
          }}
          className="mt-1 w-full border rounded px-3 py-2 text-gray-800 shadow-md text-center"
        >
          <option value="">-- Choisir une option --</option>
          <option value="cellule">Une Cellule</option>
          <option value="conseiller">Un Conseiller</option>
        </select>

        {selectedTargetType && (
          <select
            value={selectedTarget}
            onChange={(e) => setSelectedTarget(e.target.value)}
            className="mt-2 w-full border rounded px-3 py-2 text-gray-800 shadow-md text-center"
          >
            <option value="">-- Choisir {selectedTargetType} --</option>
            {selectedTargetType === "cellule"
              ? cellules.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.cellule} ({c.responsable})
                  </option>
                ))
              : conseillers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.prenom} {c.nom}
                  </option>
                ))}
          </select>
        )}

        {selectedTarget && Object.values(checkedContacts).some((v) => v) && (
          <button
            onClick={sendWhatsapp}
            className="mt-3 bg-green-500 text-white font-bold px-4 py-2 rounded-xl shadow-md hover:bg-green-600 transition-all"
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
              <div
                key={member.id}
                className="bg-white text-gray-900 rounded-2xl shadow-xl p-4 flex flex-col items-center"
              >
                <h2 className="font-bold text-lg mb-1 text-center text-blue-800">
                  {member.prenom} {member.nom}
                </h2>
                <p className="text-sm text-center mb-2">📱 {member.telephone || "—"}</p>
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
                  className="text-orange-500 underline text-sm mt-1 block mx-auto text-center"
                >
                  {isOpen ? "Fermer Détails" : "Détails"}
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
                      className="text-blue-600 text-sm mt-4 block mx-auto"
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

      {/* POPUP MODIFIER CONTACT */}
      {editMember && (
        <EditEvangelisePopup
          member={editMember}
          cellules={cellules}
          conseillers={conseillers}
          onClose={() => setEditMember(null)}
          onUpdateMember={(updated) => {
            setContacts((prev) =>
              prev.map((c) => (c.id === updated.id ? updated : c))
            );
          }}
        />
      )}
    </div>
  );
}
