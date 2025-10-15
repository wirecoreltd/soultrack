// pages/list-members.js
"use client";
import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import Image from "next/image";
import BoutonEnvoyer from "../components/BoutonEnvoyer";
import LogoutLink from "../components/LogoutLink";

export default function ListMembers() {
  const [members, setMembers] = useState([]);
  const [filter, setFilter] = useState("");
  const [detailsOpen, setDetailsOpen] = useState({});
  const [cellules, setCellules] = useState([]);
  const [selectedCellules, setSelectedCellules] = useState({});
  const [view, setView] = useState("card");
  const [popupMember, setPopupMember] = useState(null);

  useEffect(() => {
    fetchMembers();
    fetchCellules();
  }, []);

  const fetchMembers = async () => {
    const { data, error } = await supabase
      .from("membres")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) console.error("Erreur fetchMembers:", error.message);
    setMembers(data || []);
  };

  const fetchCellules = async () => {
    const { data, error } = await supabase
      .from("cellules")
      .select("id, cellule, responsable, telephone");
    if (error) console.error("Erreur fetchCellules:", error.message);
    setCellules(data || []);
  };

  const handleChangeStatus = async (id, newStatus) => {
    try {
      await supabase.from("membres").update({ statut: newStatus }).eq("id", id);
      setMembers((prev) =>
        prev.map((m) =>
          m.id === id ? { ...m, statut: newStatus } : m
        )
      );
    } catch (err) {
      console.error("Erreur update statut:", err.message);
    }
  };

  const handleStatusUpdateFromEnvoyer = (id, newStatus) => {
    setMembers((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, statut: newStatus } : m
      )
    );
  };

  const getBorderColor = (member) => {
    if (member.star) return "#FBC02D";
    if (member.statut === "actif") return "#4285F4";
    if (member.statut === "a déjà mon église") return "#EA4335";
    if (member.statut === "ancien") return "#999999";
    if (member.statut === "veut rejoindre ICC" || member.statut === "visiteur")
      return "#34A853";
    return "#ccc";
  };

  const filteredMembers = members.filter((m) => {
    if (!filter) return true;
    if (filter === "star") return m.star === true;
    return m.statut === filter;
  });

  const nouveaux = filteredMembers.filter(
    (m) => m.statut === "visiteur" || m.statut === "veut rejoindre ICC"
  );
  const anciens = filteredMembers.filter(
    (m) =>
      m.statut !== "visiteur" &&
      m.statut !== "veut rejoindre ICC"
  );

  const statusOptions = [
    "actif",
    "ancien",
    "veut rejoindre ICC",
    "visiteur",
    "a déjà mon église",
  ];

  return (
    <div
      className="min-h-screen flex flex-col items-center p-6"
      style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}
    >
      <div className="flex justify-between w-full max-w-5xl items-center mb-4">
        <button
          onClick={() => window.history.back()}
          className="flex items-center text-white font-semibold hover:text-gray-200"
        >
          ← Retour
        </button>

        {/* ✅ Logout bouton stylé */}
        <LogoutLink className="bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition" />
      </div>

      <div className="mt-2 mb-2">
        <Image src="/logo.png" alt="SoulTrack Logo" width={80} height={80} />
      </div>

      <h1 className="text-5xl sm:text-6xl font-handwriting text-white text-center mb-3">
        SoulTrack
      </h1>

      <p className="text-center text-white text-lg mb-2 font-handwriting-light">
        Chaque personne a une valeur infinie. Ensemble, nous avançons ❤️
      </p>

      <p
        className="self-end text-orange-500 cursor-pointer mb-4"
        onClick={() => setView(view === "card" ? "table" : "card")}
      >
        {view === "card" ? "Vue Table" : "Vue Carte"}
      </p>

      {/* === FILTRES === */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-4 w-full max-w-md">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded-lg px-4 py-2 text-gray-700 shadow-sm w-full focus:ring-2 focus:ring-indigo-400"
        >
          <option value="">-- Filtrer par statut --</option>
          {statusOptions.map((s) => (
            <option key={s}>{s}</option>
          ))}
          <option value="star">⭐ Star</option>
        </select>
        <span className="text-white italic text-opacity-80">
          Résultats: {filteredMembers.length}
        </span>
      </div>

      {/* === VUE CARTE === */}
      {view === "card" ? (
        <div className="w-full max-w-5xl space-y-8">
          {[{ title: "🆕 Nouveaux contacts", list: nouveaux },
            { title: "👥 Membres existants", list: anciens }].map(
            ({ title, list }) =>
              list.length > 0 && (
                <div key={title}>
                  <p className="text-white mb-2 text-xl">{title}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {list.map((member) => (
                      <div
                        key={member.id}
                        className="bg-white p-3 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 border-t-4 flex flex-col justify-between"
                        style={{ borderTopColor: getBorderColor(member) }}
                      >
                        {/* === Nom + Statut === */}
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex flex-col break-words">
                            <span className="text-lg font-bold text-gray-800 leading-tight">
                              {member.prenom}
                            </span>
                            <span className="text-lg font-bold text-gray-800 leading-tight">
                              {member.nom}
                            </span>
                          </div>
                          <span
                            className="text-sm font-semibold"
                            style={{ color: getBorderColor(member) }}
                          >
                            {member.star
                              ? "⭐ S.T.A.R"
                              : member.statut || "—"}
                          </span>
                        </div>

                        {/* === Téléphone + Sélecteur statut === */}
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm text-gray-600">
                            📱 {member.telephone || "—"}
                          </p>
                          <select
                            value={member.statut}
                            onChange={(e) =>
                              handleChangeStatus(member.id, e.target.value)
                            }
                            className="border rounded-md px-2 py-1 text-xs text-gray-700"
                          >
                            {statusOptions.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* === Détails === */}
                        <p
                          className="text-blue-500 underline cursor-pointer text-sm mt-1"
                          onClick={() =>
                            setDetailsOpen((prev) => ({
                              ...prev,
                              [member.id]: !prev[member.id],
                            }))
                          }
                        >
                          {detailsOpen[member.id] ? "Fermer détails" : "Détails"}
                        </p>

                        {detailsOpen[member.id] && (
                          <div className="mt-2 text-sm text-gray-700 space-y-1">
                            <p>Besoin : {member.besoin || "—"}</p>
                            <p>Infos : {member.infos_supplementaires || "—"}</p>
                            <p>Comment venu : {member.comment || "—"}</p>
                            <p className="text-green-600 font-semibold">Cellule :</p>
                            <select
                              value={selectedCellules[member.id] || ""}
                              onChange={(e) =>
                                setSelectedCellules((prev) => ({
                                  ...prev,
                                  [member.id]: e.target.value,
                                }))
                              }
                              className="border rounded-lg px-2 py-1 text-sm w-full"
                            >
                              <option value="">-- Sélectionner cellule --</option>
                              {cellules.map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.cellule} ({c.responsable})
                                </option>
                              ))}
                            </select>

                            {selectedCellules[member.id] && (
                              <BoutonEnvoyer
                                membre={member}
                                cellule={cellules.find(
                                  (c) =>
                                    String(c.id) ===
                                    String(selectedCellules[member.id])
                                )}
                                onStatusUpdate={handleStatusUpdateFromEnvoyer}
                              />
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
          )}
        </div>
      ) : (
        /* === VUE TABLE === */
        <div className="w-full max-w-5xl bg-white rounded-xl shadow-lg overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-700">
            <thead className="bg-indigo-600 text-white text-sm uppercase">
              <tr>
                <th className="px-4 py-2">Nom complet</th>
                <th className="px-4 py-2">Téléphone</th>
                <th className="px-4 py-2">Statut</th>
                <th className="px-4 py-2">Détails</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((m) => (
                <tr key={m.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 font-semibold">
                    {m.prenom} {m.nom}
                  </td>
                  <td className="px-4 py-2">{m.telephone}</td>
                  <td className="px-4 py-2">
                    <select
                      value={m.statut}
                      onChange={(e) =>
                        handleChangeStatus(m.id, e.target.value)
                      }
                      className="border rounded-md px-2 py-1 text-sm"
                    >
                      {statusOptions.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => setPopupMember(m)}
                      className="text-blue-600 underline text-sm"
                    >
                      Détails
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ✅ POPUP DÉTAILS TABLE */}
      {popupMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md relative">
            <button
              onClick={() => setPopupMember(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl"
            >
              ✖
            </button>
            <h2 className="text-xl font-bold mb-2 text-indigo-700">
              {popupMember.prenom} {popupMember.nom}
            </h2>
            <p className="text-gray-700 text-sm mb-1">
              📱 {popupMember.telephone || "—"}
            </p>
            <p className="text-sm text-gray-700 mb-2">
              Statut :{" "}
              <span
                style={{ color: getBorderColor(popupMember) }}
                className="font-semibold"
              >
                {popupMember.star ? "⭐ S.T.A.R" : popupMember.statut}
              </span>
            </p>
            <p className="text-sm text-gray-700 mb-1">
              Besoin : {popupMember.besoin || "—"}
            </p>
            <p className="text-sm text-gray-700 mb-1">
              Infos : {popupMember.infos_supplementaires || "—"}
            </p>
            <p className="text-sm text-gray-700 mb-3">
              Comment venu : {popupMember.comment || "—"}
            </p>
            <select
              value={selectedCellules[popupMember.id] || ""}
              onChange={(e) =>
                setSelectedCellules((prev) => ({
                  ...prev,
                  [popupMember.id]: e.target.value,
                }))
              }
              className="border rounded-lg px-3 py-2 text-sm w-full mb-3"
            >
              <option value="">-- Sélectionner cellule --</option>
              {cellules.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.cellule} ({c.responsable})
                </option>
              ))}
            </select>

            {selectedCellules[popupMember.id] && (
              <BoutonEnvoyer
                membre={popupMember}
                cellule={cellules.find(
                  (c) =>
                    String(c.id) === String(selectedCellules[popupMember.id])
                )}
                onStatusUpdate={handleStatusUpdateFromEnvoyer}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

