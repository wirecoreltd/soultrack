"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "../lib/supabaseClient";
import Image from "next/image";
import LogoutLink from "../components/LogoutLink";
import BoutonEnvoyerContacts from "../components/BoutonEnvoyerContacts";
import EditMemberPopup from "../components/EditMemberPopup";

export default function Evangelisation() {
const router = useRouter();
const [contacts, setContacts] = useState([]);
const [cellules, setCellules] = useState([]);
const [conseillers, setConseillers] = useState([]);
const [selectedTargetType, setSelectedTargetType] = useState(""); // "cellule" ou "conseiller"
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
.from("profiles")
.select("id, prenom, nom, telephone")
.eq("role", "Conseiller");
setConseillers(data || []);
};

const toggleDetails = (id) =>
setDetailsOpen((prev) => ({ ...prev, [id]: !prev[id] }));

const handleCheck = (id) =>
setCheckedContacts((prev) => ({ ...prev, [id]: !prev[id] }));

const formatBesoin = (b) => {
if (!b) return "\u2014";
if (Array.isArray(b)) return b.join(", ");
try {
const arr = JSON.parse(b);
return Array.isArray(arr) ? arr.join(", ") : b;
} catch {
return b;
}
};

const selectedTargetObject =
selectedTargetType === "cellule"
? cellules.find((c) => c.id === selectedTarget)
: conseillers.find((c) => c.id === selectedTarget);

const handleUpdateMember = (updated) => {
setContacts((prev) =>
prev.map((c) => (c.id === updated.id ? updated : c))
);
};

return (
<div
className="min-h-screen w-full flex flex-col items-center p-6"
style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}
>
{/* HEADER */} <div className="w-full max-w-5xl mb-6"> <div className="flex justify-between items-center">
<button onClick={() => router.back()} className="text-white">
\u2190 Retour </button> <LogoutLink /> </div> <div className="flex justify-end mt-2"> <p className="text-orange-200 text-sm">\u{1F44B} Bienvenue Utilisateur</p> </div> </div>

  {/* LOGO ET TITRE */}
  <Image src="/logo.png" alt="Logo" width={90} height={90} className="mb-3" />
  <h1 className="text-4xl text-white text-center mb-6">Évangélisation</h1>

  {/* SELECT DESTINATAIRE */}
  <div className="flex flex-col sm:flex-row gap-2 mb-6 items-center w-full max-w-5xl">
    <select
      value={selectedTargetType}
      onChange={(e) => {
        setSelectedTargetType(e.target.value);
        setSelectedTarget("");
      }}
      className="border rounded-xl px-4 py-2 text-gray-800 shadow-md w-full sm:w-60"
    >
      <option value="">\u{1F4CD} Envoyer à…</option>
      <option value="cellule">Une Cellule</option>
      <option value="conseiller">Un Conseiller</option>
    </select>

    {selectedTargetType && (
      <select
        value={selectedTarget}
        onChange={(e) => setSelectedTarget(e.target.value)}
        className="border rounded-xl px-4 py-2 text-gray-800 shadow-md w-full sm:w-72"
      >
        <option value="">-- Choisir {selectedTargetType} --</option>
        {selectedTargetType === "cellule"
          ? cellules.map((c) => (
              <option key={c.id} value={c.id}>
                {c.cellule} — {c.responsable}
              </option>
            ))
          : conseillers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.prenom} {c.nom}
              </option>
            ))}
      </select>
    )}

    {selectedTarget && (
      <div className="mt-2 w-full sm:w-48">
        <BoutonEnvoyerContacts
          contacts={contacts}
          checkedContacts={checkedContacts}
          cellule={selectedTargetType === "cellule" ? selectedTargetObject : null}
          conseiller={selectedTargetType === "conseiller" ? selectedTargetObject : null}
          onEnvoye={(id) => {
            setContacts((prev) => prev.filter((c) => c.id !== id));
            setCheckedContacts((prev) => {
              const copy = { ...prev };
              delete copy[id];
              return copy;
            });
          }}
          showToast={(msg) => alert(msg)}
        />
      </div>
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
  {view === "card' && (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-5xl">
      {contacts.map((member) => {
        const isOpen = detailsOpen[member.id];
        return (
          <div key={member.id} className="bg-white text-gray-900 rounded-2xl shadow-xl p-4">
            <h2 className="font-bold text-lg mb-1 text-center text-black-800">
              {member.prenom} {member.nom}
            </h2>
            <p className="text-sm text-center mb-2">\u{1F4F1} {member.telephone || "\u2014"}</p>
            <label className="flex items-center justify-center gap-2 text-sm mb-2">
              <input
                type="checkbox"
                checked={checkedContacts[member.id] || false}
                onChange={() => handleCheck(member.id)}
              />
              \u2705 Envoyer ce Contact
            </label>
            <button
              onClick={() => toggleDetails(member.id)}
              className="text-orange-500 underline text-sm mt-1 block mx-auto text-center"
            >
              {isOpen ? "Fermer Détails" : "Détails"}
            </button>

            {isOpen && (
              <div className="text-gray-700 text-sm mt-2 space-y-2 w-full flex flex-col items-left">
                <p>\u{1F4AC} WhatsApp : {member.is_whatsapp ? "Oui" : "Non"}</p>
                <p>\u{1F3D9} Ville: {member.ville || "\u2014"}</p>
                <p>\u2753 Besoin : {formatBesoin(member.besoin)}</p>
                <p>\u{1F4DD} Infos: {member.infos_supplementaires || "\u2014"}</p>

                {/* ✏️ Modifier le contact */}
                <button
                  onClick={() => setEditMember(member)}
                  className="text-blue-600 text-sm mt-4 block mx-auto"
                >
                  \u270F\uFE0F Modifier le contact
                </button>

                {/* Fermer détails */}
                <button
                  onClick={() => toggleDetails(member.id)}
                  className="text-orange-500 underline text-sm mt-2 block mx-auto"
                >
                  Fermer détails
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  )}
</div>
);
}
