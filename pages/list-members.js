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
    if (!error && data) setMembers(data);
  };

  const fetchCellules = async () => {
    const { data, error } = await supabase
      .from("cellules")
      .select("id, cellule, responsable, telephone");
    if (!error && data) setCellules(data);
  };

  const handleChangeStatus = async (id, newStatus) => {
    await supabase.from("membres").update({ statut: newStatus }).eq("id", id);
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, statut: newStatus } : m))
    );
  };

  const handleStatusUpdateFromEnvoyer = (id, newStatus) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, statut: newStatus } : m))
    );
  };

  const getBorderColor = (m) => {
    const s = m.statut;
    if (m.star) return "#FBC02D";
    if (s === "actif") return "#4285F4";
    if (s === "a déjà mon église") return "#EA4335";
    if (s === "ancien") return "#999999";
    if (s === "veut rejoindre ICC" || s === "visiteur") return "#34A853";
    return "#ccc";
  };

  const statusOptions = [
    "actif",
    "ancien",
    "veut rejoindre ICC",
    "visiteur",
    "a déjà mon église",
  ];

  const filteredMembers = members.filter((m) => {
    if (!filter) return true;
    if (filter === "star") return m.star;
    return m.statut === filter;
  });

  const nouveaux = filteredMembers.filter(
    (m) => m.statut === "visiteur" || m.statut === "veut rejoindre ICC"
  );
  const anciens = filteredMembers.filter(
    (m) => m.statut !== "visiteur" && m.statut !== "veut rejoindre ICC"
  );

  const tableMembers = [
    ...nouveaux,
    ...anciens,
  ];

  const getFormattedDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const latestNewMember = nouveaux[0];
  const latestDateText = latestNewMember
    ? `💖 Bien aimé venu le ${getFormattedDate(latestNewMember.created_at)}`
    : null;

  const scrollToTop = () =>
    window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <div
      className="min-h-screen flex flex-col items-center p-6"
      style={{ background: "linear-gradient(135deg,#2E3192 0%,#92EFFD 100%)" }}
    >
      <div className="flex justify-between w-full max-w-5xl items-center mb-4">
        <button
          onClick={() => window.history.back()}
          className="flex items-center text-white font-semibold hover:text-gray-200"
        >
          ← Retour
        </button>
        <LogoutLink className="bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition" />
      </div>

      <Image src="/logo.png" alt="SoulTrack Logo" width={80} height={80} />
      <h1 className="text-5xl sm:text-6xl font-handwriting text-white text-center mb-3">
        SoulTrack
      </h1>
      <p className="text-white text-center text-lg font-handwriting-light mb-2">
        Chaque personne a une valeur infinie. Ensemble, nous avançons ❤️
      </p>

      <p
        className="self-end text-orange-500 cursor-pointer mb-4"
        onClick={() => setView(view === "card" ? "table" : "card")}
      >
        {view === "card" ? "Vue Table" : "Vue Carte"}
      </p>

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

      {/* ====== VUE CARTE ====== */}
      {view === "card" ? (
        <div className="w-full max-w-5xl space-y-8">
          {latestDateText && (
            <p className="text-white mb-2 text-xl text-center">{latestDateText}</p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMembers.map((m) => (
              <div
                key={m.id}
                className="bg-white p-3 rounded-xl shadow-md hover:shadow-xl transition relative"
                style={{
                  borderTop: `6px solid ${getBorderColor(m)}`,
                }}
              >
                {/* ✅ Statut au-dessus du nom */}
                <div
                  className="text-xs font-semibold mb-1"
                  style={{ color: getBorderColor(m) }}
                >
                  {m.star ? "⭐ S.T.A.R" : m.statut || "—"}
                </div>

                <h2 className="text-lg font-bold text-gray-800 break-words">
                  {m.prenom} {m.nom}
                </h2>

                <p className="text-sm text-gray-600 mt-1">
                  📱 {m.telephone || "—"}
                </p>

                {/* ✅ menu statut sous le téléphone */}
                <select
                  value={m.statut}
                  onChange={(e) => handleChangeStatus(m.id, e.target.value)}
                  className="border rounded-md px-2 py-1 text-sm mt-2 w-full"
                >
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>

                {/* détails */}
                <p
                  className="mt-2 text-blue-500 underline cursor-pointer text-sm"
                  onClick={() =>
                    setDetailsOpen((prev) => ({
                      ...prev,
                      [m.id]: !prev[m.id],
                    }))
                  }
                >
                  {detailsOpen[m.id] ? "Fermer détails" : "Détails"}
                </p>

                {detailsOpen[m.id] && (
                  <div className="mt-2 text-sm text-gray-700 space-y-1">
                    <p>Besoin : {m.besoin || "—"}</p>
                    <p>Infos : {m.infos_supplementaires || "—"}</p>
                    <p>Comment venu : {m.comment || "—"}</p>
                    <select
                      value={selectedCellules[m.id] || ""}
                      onChange={(e) =>
                        setSelectedCellules((p) => ({
                          ...p,
                          [m.id]: e.target.value,
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
                    {selectedCellules[m.id] && (
                      <BoutonEnvoyer
                        membre={m}
                        cellule={cellules.find(
                          (c) =>
                            String(c.id) ===
                            String(selectedCellules[m.id])
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
      ) : (
        /* ====== VUE TABLE ====== */
        <div className="w-full max-w-5xl bg-white rounded-xl shadow-lg overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-700">
            <thead className="bg-indigo-600 text-white uppercase text-xs">
              <tr>
                <th className="px-3 py-2 w-[30%]">Nom complet</th>
                <th className="px-3 py-2 w-[25%]">Téléphone</th>
                <th className="px-3 py-2 w-[25%]">Statut</th>
                <th className="px-3 py-2 w-[20%] text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {tableMembers.map((m) => {
                const color = getBorderColor(m);
                // ✅ fond plus visible
                const hex = color.replace("#", "");
                const r = parseInt(hex.slice(0, 2), 16);
                const g = parseInt(hex.slice(2, 4), 16);
                const b = parseInt(hex.slice(4, 6), 16);
                const bgColor = `rgba(${r}, ${g}, ${b}, 0.12)`; // intensité augmentée

                return (
                  <tr
                    key={m.id}
                    className="border-b"
                    style={{ backgroundColor: bgColor }}
                  >
                    <td className="px-3 py-2 font-semibold">
                      {m.prenom} {m.nom}
                    </td>
                    <td className="px-3 py-2">{m.telephone}</td>

                    {/* ✅ colonne statut = menu déroulant */}
                    <td className="px-3 py-2">
                      <select
                        value={m.statut}
                        onChange={(e) =>
                          handleChangeStatus(m.id, e.target.value)
                        }
                        className="border rounded-md px-2 py-1 text-sm w-full"
                        style={{ color }}
                      >
                        {statusOptions.map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </td>

                    <td className="px-3 py-2 text-center">
                      <button
                        onClick={() => setPopupMember(m)}
                        className="text-blue-600 underline text-sm"
                      >
                        Détails
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

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
            <p
              className="text-sm font-semibold mb-2"
              style={{ color: getBorderColor(popupMember) }}
            >
              {popupMember.statut}
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
                setSelectedCellules((p) => ({
                  ...p,
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
                    String(c.id) ===
                    String(selectedCellules[popupMember.id])
                )}
                onStatusUpdate={handleStatusUpdateFromEnvoyer}
              />
            )}
          </div>
        </div>
      )}

      <button
        onClick={scrollToTop}
        className="fixed bottom-5 right-5 text-white text-2xl font-bold"
      >
        ↑
      </button>
    </div>
  );
}
