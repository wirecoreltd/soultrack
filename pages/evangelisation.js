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
const [selectedTargetType, setSelectedTargetType] = useState("");
const [selectedTarget, setSelectedTarget] = useState("");
const [detailsOpen, setDetailsOpen] = useState({});
const [checkedContacts, setCheckedContacts] = useState({});
const [editMember, setEditMember] = useState(null);
const [view, setView] = useState("card");

useEffect(() => {
fetchContacts();
fetchCellules();
fetchConseillers();
}, []);

const fetchContacts = async () => {
const { data } = await supabase.from("evangelises").select("*").order("created_at", { ascending: false });
setContacts(data || []);
};

const fetchCellules = async () => {
const { data } = await supabase.from("cellules").select("id, cellule, responsable, telephone");
setCellules(data || []);
};

const fetchConseillers = async () => {
const { data } = await supabase.from("profiles").select("id, prenom, nom, telephone").eq("role", "Conseiller");
setConseillers(data || []);
};

const handleCheck = (id) => setCheckedContacts((prev) => ({ ...prev, [id]: !prev[id] }));
const selectedTargetObject =
selectedTargetType === "cellule" ? cellules.find((c) => c.id === selectedTarget) : conseillers.find((c) => c.id === selectedTarget);
const checkedCount = Object.values(checkedContacts).filter(Boolean).length;

return (
<div className="min-h-screen w-full flex flex-col items-center p-6" style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}>
{/* HEADER */} <div className="w-full max-w-5xl mb-6"> <div className="flex justify-between items-center">
<button onClick={() => router.back()} className="text-white">← Retour</button> <LogoutLink /> </div> <div className="flex justify-end mt-2"> <p className="text-orange-200 text-sm">👋 Bienvenue Utilisateur</p> </div> </div>


  {/* LOGO ET TITRE */}
  <Image src="/logo.png" alt="Logo" width={90} height={90} className="mb-3" />
  <h1 className="text-4xl text-white text-center mb-6">Évangélisation</h1>

  {/* SELECT DESTINATAIRE */}
  <div className="flex flex-col sm:flex-row gap-4 mb-4 items-center justify-center w-full max-w-5xl">
    <select
      value={selectedTargetType}
      onChange={(e) => { setSelectedTargetType(e.target.value); setSelectedTarget(""); }}
      className="border rounded-xl px-4 py-2 text-gray-800 shadow-md w-full sm:w-60 text-center"
    >
      <option value="">📍 Envoyer à…</option>
      <option value="cellule">Une Cellule</option>
      <option value="conseiller">Un Conseiller</option>
    </select>

    {selectedTargetType && (
      <select
        value={selectedTarget}
        onChange={(e) => setSelectedTarget(e.target.value)}
        className="border rounded-xl px-4 py-2 text-gray-800 shadow-md w-full sm:w-72 text-center"
      >
        <option value="">-- Choisir {selectedTargetType} --</option>
        {selectedTargetType === "cellule"
          ? cellules.map((c) => <option key={c.id} value={c.id}>{c.cellule} — {c.responsable}</option>)
          : conseillers.map((c) => <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>)}
      </select>
    )}
  </div>

  {/* BOUTON ENVOYER SI CONTACT SELECTIONNE */}
  {selectedTarget && checkedCount > 0 && (
    <div className="mb-4 flex justify-center">
      <BoutonEnvoyerContacts
        contacts={contacts}
        checkedContacts={checkedContacts}
        cellule={selectedTargetType === "cellule" ? selectedTargetObject : null}
        conseiller={selectedTargetType === "conseiller" ? selectedTargetObject : null}
        onEnvoye={(id) => {
          setContacts((prev) => prev.filter((c) => c.id !== id));
          setCheckedContacts((prev) => { const copy = { ...prev }; delete copy[id]; return copy; });
        }}
        showToast={(msg) => alert(msg)}
      />
    </div>
  )}

  {/* BASCULE VUE */}
  <p onClick={() => setView(view === "card" ? "table" : "card")} className="cursor-pointer text-yellow-100 underline hover:text-white text-sm mb-4">
    {view === "card" ? "Vue Table" : "Vue Carte"}
  </p>

  {/* VUE CARTE */}
  {view === "card" && (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-5xl">
      {contacts.map((member) => (
        <div key={member.id} className="bg-white rounded-lg shadow p-4 relative">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold">{member.prenom} {member.nom}</p>
              <p className="text-gray-600 text-sm">📱 {member.telephone || "—"}</p>
            </div>
            <input type="checkbox" checked={checkedContacts[member.id] || false} onChange={() => handleCheck(member.id)} className="w-5 h-5 cursor-pointer" />
          </div>

          <button onClick={() => setEditMember(member)} className="text-blue-600 text-sm mt-3 block mx-auto">
            ✏️ Modifier le contact
          </button>

          {editMember && editMember.id === member.id && (
            <EditMemberPopup
              member={editMember}
              cellules={cellules}
              conseillers={conseillers}
              onClose={() => setEditMember(null)}
              onUpdateMember={(updated) => {
                setContacts((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
                setEditMember(null);
              }}
            />
          )}
        </div>
      ))}
    </div>
  )}

  {/* VUE TABLE */}
  {view === "table" && (
    <div className="overflow-x-auto w-full max-w-6xl">
      <table className="min-w-full bg-white rounded-lg shadow">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3">✔</th>
            <th className="p-3 text-left">Prénom</th>
            <th className="p-3 text-left">Nom</th>
            <th className="p-3 text-left">Téléphone</th>
            <th className="p-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((member) => (
            <tr key={member.id} className="border-b">
              <td className="p-3 text-center">
                <input type="checkbox" checked={checkedContacts[member.id] || false} onChange={() => handleCheck(member.id)} className="w-5 h-5 cursor-pointer" />
              </td>
              <td className="p-3">{member.prenom}</td>
              <td className="p-3">{member.nom}</td>
              <td className="p-3">{member.telephone || "—"}</td>
              <td className="p-3">
                <button onClick={() => setEditMember(member)} className="text-blue-600 text-sm">
                  ✏️ Modifier
                </button>
                {editMember && editMember.id === member.id && (
                  <EditMemberPopup
                    member={editMember}
                    cellules={cellules}
                    conseillers={conseillers}
                    onClose={() => setEditMember(null)}
                    onUpdateMember={(updated) => {
                      setContacts((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
                      setEditMember(null);
                    }}
                  />
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
