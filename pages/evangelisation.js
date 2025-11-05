// ✅ pages/evangelisation.js
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

  const sendWhatsapp = async () => {
    alert("Fonction OK ✅ (inchangée)");
  };

  const userName = "Utilisateur";

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center p-6"
      style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}
    >
      {/* ✅ Top bar */}
      <div className="w-full max-w-5xl mb-6">
        <div className="flex justify-between items-center">
          <button
            onClick={() => router.back()}
            className="flex items-center text-white hover:text-gray-200 transition-colors"
          >
            ← Retour
          </button>
          <LogoutLink />
        </div>
        <div className="flex justify-end mt-2">
          <p className="text-orange-200 text-sm">👋 Bienvenue {userName}</p>
        </div>
      </div>

      {/* ✅ Logo */}
      <Image
        src="/logo.png"
        alt="Logo"
        width={90}
        height={90}
        className="mb-3 drop-shadow-lg"
      />

      {/* ✅ Titre */}
      <h1 className="text-4xl md:text-5xl font-handwriting text-white text-center mb-2 drop-shadow-md">
        Évangélisation
      </h1>
      <p className="text-center text-lg text-white/90 mb-4 max-w-lg">
        ✨ Chaque âme compte éternellement… ✨
      </p>

      {/* ✅ Sélecteur + Bouton */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4 items-center">
        <select
          value={selectedCellule}
          onChange={(e) => setSelectedCellule(e.target.value)}
          className="border rounded-xl px-4 py-2 text-gray-800 shadow-md"
        >
          <option value="">📍 Sélectionner cellule</option>
          {cellules.map((c) => (
            <option key={c.id} value={c.id}>
              {c.cellule} — {c.responsable}
            </option>
          ))}
        </select>

        {selectedCellule && (
          <button
            onClick={sendWhatsapp}
            className="bg-green-500 text-white font-bold px-4 py-2 rounded-xl shadow-md hover:bg-green-600 transition-all"
          >
            ✅ Envoyer WhatsApp
          </button>
        )}
      </div>

      {/* ✅ Toggle Vue */}
      <p
        onClick={() => setView(view === "card" ? "table" : "card")}
        className="cursor-pointer text-yellow-100 underline hover:text-white text-sm mb-4"
      >
        {view === "card" ? "Vue Table" : "Vue Carte"}
      </p>

      {/* ✅ Vue Carte */}
      {view === "card" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-5xl">
          {contacts.map((member) => {
            const isOpen = detailsOpen[member.id];
            return (
              <div
                key={member.id}
                className="bg-white text-gray-900 rounded-2xl shadow-xl p-4 border border-gray-200"
              >
                <h2 className="font-bold text-lg mb-1 text-center text-blue-800">
                  {member.prenom} {member.nom}
                </h2>

                <p className="text-sm text-center mb-2">
                  📱 {member.telephone || "—"}
                </p>

                <label className="flex items-center justify-center gap-2 text-sm mb-2">
                  <input
                    type="checkbox"
                    checked={checkedContacts[member.id] || false}
                    onChange={() => handleCheck(member.id)}
                  />
                  ✅ WhatsApp
                </label>

                <button
                  onClick={() => toggleDetails(member.id)}
                  className="text-orange-500 underline text-sm mt-1"
                >
                  {isOpen ? "Fermer Détails" : "Détails"}
                </button>

                {isOpen && (
                  <div className="text-gray-700 text-sm mt-2 space-y-2 w-full">
                    <p>🏙 Ville: {member.ville || "—"}</p>
                    <p>❓Besoin : {
                          (() => {
                            if (!member.besoin) return "—";
                            if (Array.isArray(member.besoin)) return member.besoin.join(", ");
                            try {
                              const arr = JSON.parse(member.besoin);
                              return Array.isArray(arr) ? arr.join(", ") : member.besoin;
                            } catch { return member.besoin; }
                          })()
                        }</p>
                    <p>📝 Infos: {member.infos_supplementaires || "—"}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ✅ Vue Table */}
      {view === "table" && (
        <div className="w-full max-w-5xl overflow-x-auto mt-4">
          <table className="w-full text-sm bg-white/10 backdrop-blur-sm rounded-xl shadow-lg border border-white/20">
            <thead className="bg-white/20 text-white">
              <tr>
                <th className="p-3">Prénom</th>
                <th className="p-3">Nom</th>
                <th className="p-3 text-center">WhatsApp</th>
                <th className="p-3 text-center">Détails</th>
              </tr>
            </thead>

            <tbody>
              {contacts.map((member) => (
                <tr key={member.id} className="hover:bg-white/20">
                  <td className="p-3">{member.prenom}</td>
                  <td className="p-3">{member.nom}</td>
                  <td className="text-center">
                    <input
                      type="checkbox"
                      checked={checkedContacts[member.id] || false}
                      onChange={() => handleCheck(member.id)}
                    />
                  </td>
                  <td className="text-left">
                    <button
                      onClick={() => toggleDetails(member.id)}
                      className="text-yellow-300 underline"
                    >
                      Détails
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ✅ Popup Détails */}
{contacts.map(
  (member) =>
    detailsOpen[member.id] && (
      <div
        key={`popup-${member.id}`}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      >
        <div className="bg-white rounded-2xl shadow-xl p-6 relative w-80 text-gray-800">
          <button
            onClick={() => toggleDetails(member.id)}
            className="absolute top-2 right-2 text-red-500 font-bold"
          >
            ✕
          </button>

          <h2 className="text-lg font-bold text-center mb-3">
            {member.prenom} {member.nom}
          </h2>

          <p>📱 {member.telephone || "—"}</p>
          <p>🏙 {member.ville || "—"}</p>
          <p>🙏 {
            (() => {
              if (!member.besoin) return "—";
              if (Array.isArray(member.besoin)) return member.besoin.join(", ");
              try {
                const arr = JSON.parse(member.besoin);
                return Array.isArray(arr) ? arr.join(", ") : member.besoin;
              } catch { return member.besoin; }
            })()
          }</p>
          <p>📝 {member.infos_supplementaires || "—"}</p>
        </div>
      </div>
    )
)}


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
