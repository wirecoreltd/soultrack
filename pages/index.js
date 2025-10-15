// pages/list-members.js
"use client";
import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import Image from "next/image";
import BoutonEnvoyer from "../components/BoutonEnvoyer";
import LogoutLink from "../components/LogoutLink";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

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
    try {
      const { data, error } = await supabase
        .from("membres")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setMembers(data || []);
    } catch (err) {
      console.error("Erreur fetchMembers:", err.message);
      setMembers([]);
    }
  };

  const fetchCellules = async () => {
    try {
      const { data, error } = await supabase
        .from("cellules")
        .select("id, cellule, responsable, telephone");
      if (error) throw error;
      setCellules(data || []);
    } catch (err) {
      console.error("Erreur fetchCellules:", err.message);
      setCellules([]);
    }
  };

  const handleChangeStatus = async (id, newStatus) => {
    try {
      await supabase.from("membres").update({ statut: newStatus }).eq("id", id);
      setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, statut: newStatus } : m)));
    } catch (err) {
      console.error("Erreur update statut:", err.message);
    }
  };

  const handleStatusUpdateFromEnvoyer = (id, newStatus) => {
    // update local state instantly (used by BoutonEnvoyer)
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, statut: newStatus } : m)));
  };

  const getBorderColor = (member) => {
    if (member.star) return "#FBC02D";
    if (member.statut === "actif") return "#4285F4";
    if (member.statut === "a déjà mon église") return "#EA4335";
    if (member.statut === "ancien") return "#6B7280"; // gray-500
    if (member.statut === "veut rejoindre ICC" || member.statut === "visiteur") return "#2563EB"; // blue-600 for Nouveau
    return "#D1D5DB"; // gray-300
  };

  const getBgTint = (member) => {
    // gentle tints
    if (member.star) return "rgba(251,192,45,0.08)";
    if (member.statut === "actif") return "rgba(66,133,244,0.06)";
    if (member.statut === "a déjà mon église") return "rgba(234,67,53,0.06)";
    if (member.statut === "ancien") return "rgba(107,114,128,0.04)";
    if (member.statut === "veut rejoindre ICC" || member.statut === "visiteur") return "rgba(37,99,235,0.06)";
    return "transparent";
  };

  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return format(d, "EEEE d MMMM yyyy", { locale: fr });
    } catch {
      return "";
    }
  };

  // filtering & ordering
  const filteredMembers = members.filter((m) => {
    if (!filter) return true;
    if (filter === "star") return m.star === true;
    return m.statut === filter;
  });

  const nouveaux = filteredMembers.filter((m) => m.statut === "visiteur" || m.statut === "veut rejoindre ICC");
  const anciens = filteredMembers.filter((m) => m.statut !== "visiteur" && m.statut !== "veut rejoindre ICC");
  const allMembersOrdered = [...nouveaux, ...anciens];

  const statusOptions = ["actif", "ancien", "veut rejoindre ICC", "visiteur", "a déjà mon église"];

  const countFiltered = filteredMembers.length;

  // small helper for left color bar in table rows
  const leftBarStyle = (m) => ({ borderLeft: `6px solid ${getBorderColor(m)}` });

  return (
    <div className="min-h-screen flex flex-col items-center p-6" style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}>
      <div className="flex justify-between w-full max-w-5xl items-center mb-4">
        <button onClick={() => window.history.back()} className="flex items-center text-white font-semibold hover:text-gray-200">
          ← Retour
        </button>

        <LogoutLink className="bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition" />
      </div>

      <div className="mt-2 mb-2">
        <Image src="/logo.png" alt="SoulTrack Logo" width={80} height={80} />
      </div>

      <h1 className="text-5xl sm:text-6xl font-handwriting text-white text-center mb-3">SoulTrack</h1>
      <p className="text-center text-white text-lg mb-2 font-handwriting-light">Chaque personne a une valeur infinie. Ensemble, nous avançons ❤️</p>

      <p className="self-end text-orange-500 cursor-pointer mb-4" onClick={() => setView(view === "card" ? "table" : "card")}>
        {view === "card" ? "Vue Table" : "Vue Carte"}
      </p>

      {/* filters (kept intact) */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-4 w-full max-w-md">
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="border rounded-lg px-4 py-2 text-gray-700 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-400">
          <option value="">-- Filtrer par statut --</option>
          <option value="actif">Actif</option>
          <option value="ancien">Ancien</option>
          <option value="veut rejoindre ICC">Veut rejoindre ICC</option>
          <option value="visiteur">Visiteur</option>
          <option value="a déjà mon église">A déjà mon église</option>
          <option value="star">⭐ Star</option>
        </select>
        <span className="text-white italic text-opacity-80">Résultats: {countFiltered}</span>
      </div>

      {/* === VIEW: CARDS === */}
      {view === "card" ? (
        <div className="w-full max-w-5xl space-y-8">
          {/* "Bien aimé venu le ..." as a soft badge - only if there are nouveaux */}
          {nouveaux.length > 0 && (
            <div className="flex justify-end">
              <div className="px-3 py-2 rounded-lg bg-white/20 text-white text-sm font-medium" style={{ backdropFilter: "blur(4px)" }}>
                💖 Bien aimé venu le {formatDate(nouveaux[0].created_at)}
              </div>
            </div>
          )}

          {/* NOUVEAUX (cards) - background forced to white */}
          {nouveaux.length > 0 && (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {nouveaux.map((m) => (
                  <div key={m.id} className="p-3 rounded-xl shadow-md hover:shadow-xl transition-all duration-200 border-t-4 bg-white" style={{ borderTopColor: getBorderColor(m) }}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-sm font-semibold" style={{ color: getBorderColor(m) }}>
                        {m.star ? "⭐ S.T.A.R" : m.statut || "—"}
                      </div>
                      <div>
                        <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">Nouveau</span>
                      </div>
                    </div>

                    <div className="mb-2">
                      <div className="text-lg font-bold text-gray-800">{m.prenom}</div>
                      <div className="text-lg font-bold text-gray-800">{m.nom}</div>
                    </div>

                    <div className="text-sm text-gray-600 mb-2">📱 {m.telephone || "—"}</div>

                    <select value={m.statut} onChange={(e) => handleChangeStatus(m.id, e.target.value)} className="border rounded-md px-2 py-1 text-xs text-gray-700 mb-2 w-full">
                      {statusOptions.map((s) => (<option key={s} value={s}>{s}</option>))}
                    </select>

                    <div>
                      <p className="text-blue-500 underline cursor-pointer text-sm" onClick={() => setDetailsOpen((prev) => ({ ...prev, [m.id]: !prev[m.id] }))}>
                        {detailsOpen[m.id] ? "Fermer détails" : "Détails"}
                      </p>

                      {detailsOpen[m.id] && (
                        <div className="mt-2 text-sm text-gray-700 space-y-1">
                          <p>Besoin : {m.besoin || "—"}</p>
                          <p>Infos : {m.infos_supplementaires || "—"}</p>
                          <p>Comment venu : {m.comment || "—"}</p>

                          <select value={selectedCellules[m.id] || ""} onChange={(e) => setSelectedCellules((prev) => ({ ...prev, [m.id]: e.target.value }))} className="border rounded-lg px-2 py-1 text-sm w-full">
                            <option value="">-- Sélectionner cellule --</option>
                            {cellules.map((c) => (<option key={c.id} value={c.id}>{c.cellule} ({c.responsable})</option>))}
                          </select>

                          {selectedCellules[m.id] && (
                            <BoutonEnvoyer membre={m} cellule={cellules.find((c) => String(c.id) === String(selectedCellules[m.id]))} onStatusUpdate={handleStatusUpdateFromEnvoyer} />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* separator stylized: gradient blue -> gray (title for anciens) */}
          {anciens.length > 0 && (
            <div className="flex items-center justify-center mt-6 mb-2">
              <div className="h-0.5 flex-1" style={{ background: "linear-gradient(90deg,#3b82f6, #94a3b8)" }} />
              <div className="mx-3 text-white text-lg font-medium">Membres existants──────</div>
              <div className="h-0.5 flex-1" style={{ background: "linear-gradient(90deg,#3b82f6,#94a3b8)" }} />
            </div>
          )}

          {/* ANCIENS (cards) - details option added */}
          {anciens.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {anciens.map((m) => (
                <div key={m.id} className="p-3 rounded-xl shadow-md hover:shadow-xl transition-all duration-200" style={{ borderTop: `6px solid ${getBorderColor(m)}`, background: getBgTint(m) }}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-sm font-semibold" style={{ color: getBorderColor(m) }}>{m.star ? "⭐ S.T.A.R" : m.statut || "—"}</div>
                  </div>

                  <div className="mb-2">
                    <div className="text-lg font-bold text-gray-800">{m.prenom}</div>
                    <div className="text-lg font-bold text-gray-800">{m.nom}</div>
                  </div>

                  <div className="text-sm text-gray-600 mb-2">📱 {m.telephone || "—"}</div>

                  <select value={m.statut} onChange={(e) => handleChangeStatus(m.id, e.target.value)} className="border rounded-md px-2 py-1 text-xs text-gray-700 mb-2 w-full">
                    {statusOptions.map((s) => (<option key={s} value={s}>{s}</option>))}
                  </select>

                  <div>
                    <p className="text-blue-500 underline cursor-pointer text-sm" onClick={() => setDetailsOpen((prev) => ({ ...prev, [m.id]: !prev[m.id] }))}>
                      {detailsOpen[m.id] ? "Fermer détails" : "Détails"}
                    </p>

                    {detailsOpen[m.id] && (
                      <div className="mt-2 text-sm text-gray-700 space-y-1">
                        <p>Besoin : {m.besoin || "—"}</p>
                        <p>Infos : {m.infos_supplementaires || "—"}</p>
                        <p>Comment venu : {m.comment || "—"}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* === VIEW: TABLE === */
        <div className="w-full max-w-5xl bg-white rounded-xl shadow-lg overflow-x-auto p-4">
          {/* "Bien aimé venu le..." above the table if nouveaux exist */}
          {nouveaux.length > 0 && (
            <div className="mb-3 flex justify-end">
              <div className="px-3 py-2 rounded-md bg-blue-50 text-blue-800 text-sm" style={{ borderRadius: 8 }}>
                💖 Bien aimé venu le {formatDate(nouveaux[0].created_at)}
              </div>
            </div>
          )}

          <table className="w-full text-sm text-left text-gray-700">
            <thead className="bg-indigo-600 text-white text-sm uppercase">
              <tr>
                <th className="px-4 py-2 w-[35%]">Nom complet</th>
                <th className="px-4 py-2 w-[25%]">Téléphone</th>
                <th className="px-4 py-2 w-[20%]">Statut</th>
                <th className="px-4 py-2 w-[20%]">Détails</th>
              </tr>
            </thead>
            <tbody>
              {/* nouveaux rows first */}
              {nouveaux.map((m) => (
                <tr key={m.id} className="border-b" style={{ background: getBgTint(m) }}>
                  <td className="px-4 py-3" style={leftBarStyle(m)}>
                    <div className="font-semibold">{m.prenom} {m.nom}</div>
                    <div className="text-xs text-gray-600 mt-1">💖 Bien aimé venu le {formatDate(m.created_at)}</div>
                  </td>
                  <td className="px-4 py-3">{m.telephone}</td>
                  <td className="px-4 py-3">
                    <select value={m.statut} onChange={(e) => handleChangeStatus(m.id, e.target.value)} className="border rounded-md px-2 py-1 text-sm w-full">
                      {statusOptions.map((s) => (<option key={s} value={s}>{s}</option>))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => setPopupMember(m)} className="text-blue-600 underline text-sm">Détails</button>
                  </td>
                </tr>
              ))}

              {/* separator band (stylish gradient blue -> gray) in-table */}
              {anciens.length > 0 && (
                <tr>
                  <td colSpan={4} className="py-3">
                    <div style={{ height: 36, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(90deg,#3b82f6,#94a3b8, #f1f5f9)" }}>
                      <span className="text-sm font-medium text-white">Membres existants──────</span>
                    </div>
                  </td>
                </tr>
              )}

              {/* anciens rows */}
              {anciens.map((m) => (
                <tr key={m.id} className="border-b" style={{ background: getBgTint(m) }}>
                  <td className="px-4 py-3" style={leftBarStyle(m)}>
                    <div className="font-semibold">{m.prenom} {m.nom}</div>
                    <div className="text-xs text-gray-600 mt-1">💖 Bien aimé venu le {formatDate(m.created_at)}</div>
                  </td>
                  <td className="px-4 py-3">{m.telephone}</td>
                  <td className="px-4 py-3">
                    <select value={m.statut} onChange={(e) => handleChangeStatus(m.id, e.target.value)} className="border rounded-md px-2 py-1 text-sm w-full">
                      {statusOptions.map((s) => (<option key={s} value={s}>{s}</option>))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => setPopupMember(m)} className="text-blue-600 underline text-sm">Détails</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Popup details - includes status dropdown now */}
      {popupMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md relative">
            <button onClick={() => setPopupMember(null)} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl">✖</button>
            <h2 className="text-xl font-bold mb-2 text-indigo-700">{popupMember.prenom} {popupMember.nom}</h2>
            <p className="text-gray-700 text-sm mb-1">📱 {popupMember.telephone || "—"}</p>

            <p className="text-sm text-gray-700 mb-2">Statut :</p>
            <select value={popupMember.statut} onChange={(e) => { handleChangeStatus(popupMember.id, e.target.value); setPopupMember((p) => ({ ...p, statut: e.target.value })); }} className="border rounded-md px-3 py-2 text-sm mb-3 w-full">
              {statusOptions.map((s) => (<option key={s} value={s}>{s}</option>))}
            </select>

            <p className="text-sm text-gray-700 mb-1">Besoin : {popupMember.besoin || "—"}</p>
            <p className="text-sm text-gray-700 mb-1">Infos : {popupMember.infos_supplementaires || "—"}</p>
            <p className="text-sm text-gray-700">Comment venu : {popupMember.comment || "—"}</p>
          </div>
        </div>
      )}
    </div>
  );
}
