// ✅ pages/evangelisation.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "../lib/supabaseClient";
import Image from "next/image";
import LogoutLink from "../components/LogoutLink";
import BoutonEnvoyer from "../components/BoutonEnvoyer";

export default function Evangelisation({ session, showToast, handleAfterSend, conseillers }) {
  const router = useRouter();
  const [contacts, setContacts] = useState([]);
  const [cellules, setCellules] = useState([]);
  const [detailsOpen, setDetailsOpen] = useState({});
  const [checkedContacts, setCheckedContacts] = useState({});
  const [view, setView] = useState("card");
  const [selectedTargetType, setSelectedTargetType] = useState({});
  const [selectedTargets, setSelectedTargets] = useState({});

  useEffect(() => {
    fetchContacts();
    fetchCellules();
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

  const toggleDetails = (id) =>
    setDetailsOpen((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleCheck = (id) =>
    setCheckedContacts((prev) => ({ ...prev, [id]: !prev[id] }));

  const userName = "Utilisateur";

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
        <div className="flex justify-end mt-2">
          <p className="text-orange-200 text-sm">👋 Bienvenue {userName}</p>
        </div>
      </div>

      {/* LOGO ET TITRE */}
      <Image src="/logo.png" alt="Logo" width={90} height={90} className="mb-3" />
      <h1 className="text-4xl text-white text-center mb-2">Évangélisation</h1>

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
          {contacts.map((m) => {
            const isOpen = detailsOpen[m.id];
            return (
              <div key={m.id} className="bg-white text-gray-900 rounded-2xl shadow-xl p-4">
                <h2 className="font-bold text-lg mb-1 text-center text-blue-800">
                  {m.prenom} {m.nom}
                </h2>
                <p className="text-sm text-center mb-2">📱 {m.telephone || "—"}</p>

                {/* ENVOYER À */}
                <div className="mt-2 w-full">
                  <label className="font-semibold text-sm">Envoyer à :</label>
                  <select
                    value={selectedTargetType[m.id] || ""}
                    onChange={(e) =>
                      setSelectedTargetType((prev) => ({ ...prev, [m.id]: e.target.value }))
                    }
                    className="mt-1 w-full border rounded px-2 py-1 text-sm"
                  >
                    <option value="">-- Choisir une option --</option>
                    <option value="cellule">Une Cellule</option>
                    <option value="conseiller">Un Conseiller</option>
                  </select>

                  {(selectedTargetType[m.id] === "cellule" ||
                    selectedTargetType[m.id] === "conseiller") && (
                    <select
                      value={selectedTargets[m.id] || ""}
                      onChange={(e) =>
                        setSelectedTargets((prev) => ({ ...prev, [m.id]: e.target.value }))
                      }
                      className="mt-1 w-full border rounded px-2 py-1 text-sm"
                    >
                      <option value="">-- Choisir {selectedTargetType[m.id]} --</option>
                      {selectedTargetType[m.id] === "cellule"
                        ? cellules.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.cellule} ({c.responsable})
                            </option>
                          ))
                        : conseillers.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.nom}
                            </option>
                          ))}
                    </select>
                  )}

                  {selectedTargets[m.id] && (
                    <div className="pt-2">
                      <BoutonEnvoyer
                        membre={m}
                        type={selectedTargetType[m.id]}
                        cible={
                          selectedTargetType[m.id] === "cellule"
                            ? cellules.find((c) => c.id === selectedTargets[m.id])
                            : conseillers.find((c) => c.id === selectedTargets[m.id])
                        }
                        onEnvoyer={(id) =>
                          handleAfterSend(
                            id,
                            selectedTargetType[m.id],
                            selectedTargetType[m.id] === "cellule"
                              ? cellules.find((c) => c.id === selectedTargets[m.id])
                              : conseillers.find((c) => c.id === selectedTargets[m.id])
                          )
                        }
                        session={session}
                        showToast={showToast}
                      />
                    </div>
                  )}
                </div>

                <button
                  onClick={() => toggleDetails(m.id)}
                  className="text-orange-500 underline text-sm mt-2"
                >
                  {isOpen ? "Fermer détails" : "Détails"}
                </button>

                {isOpen && (
                  <div className="text-gray-700 text-sm mt-2 space-y-2 w-full text-center flex flex-col items-center">
                    <p>💬 WhatsApp : {m.is_whatsapp ? "Oui" : "Non"}</p>
                    <p>🏙 Ville: {m.ville || "—"}</p>
                    <p>❓Besoin : {formatBesoin(m.besoin)}</p>
                    <p>📝 Infos: {m.infos_supplementaires || "—"}</p>
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

          {/* POPUP DÉTAILS */}
          {contacts.map(
            (member) =>
              detailsOpen[member.id] && (
                <div
                  key={member.id}
                  className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 transition-all duration-200"
                >
                  <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md relative">
                    <button
                      onClick={() => toggleDetails(member.id)}
                      className="absolute top-3 right-3 text-red-500 font-bold text-xl"
                    >
                      ✖
                    </button>
                    <h2 className="text-xl font-bold mb-2 text-black text-center">
                      {member.prenom} {member.nom}
                    </h2>
                    <p className="text-black text-sm mb-1">📱 {member.telephone || "—"}</p>
                    <p className="text-black text-sm mb-1">
                      💬 WhatsApp : {member.is_whatsapp ? "Oui" : "Non"}
                    </p>
                    <p className="text-black text-sm mb-1">🏙 Ville : {member.ville || "—"}</p>
                    <p className="text-black text-sm mb-1">
                      ❓ Besoin : {formatBesoin(member.besoin)}
                    </p>
                    <p className="text-black text-sm mb-1">
                      📝 Infos : {member.infos_supplementaires || "—"}
                    </p>
                  </div>
                </div>
              )
          )}
        </div>
      )}
    </div>
  );
}
