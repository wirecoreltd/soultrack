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
  const [filter, setFilter] = useState(""); // will hold statut filter (empty = all)
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
      // also update popupMember if open
      if (popupMember && popupMember.id === id) {
        setPopupMember((p) => ({ ...p, statut: newStatus }));
      }
    } catch (err) {
      console.error("Erreur update statut:", err.message);
    }
  };

  const handleStatusUpdateFromEnvoyer = (id, newStatus) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, statut: newStatus } : m)));
    if (popupMember && popupMember.id === id) setPopupMember((p) => ({ ...p, statut: newStatus }));
  };

  const getBorderColor = (member) => {
    if (member.star) return "#FBC02D";
    if (member.statut === "actif") return "#4285F4";
    if (member.statut === "a déjà mon église") return "#EA4335";
    if (member.statut === "ancien") return "#6B7280";
    if (member.statut === "veut rejoindre ICC" || member.statut === "visiteur") return "#2563EB";
    return "#D1D5DB";
  };

  const getBgTintRGBA = (member) => {
    // rgba strings used inline for subtle tint (not for cards — cards are white now)
    if (member.star) return "rgba(251,192,45,0.06)";
    if (member.statut === "actif") return "rgba(66,133,244,0.06)";
    if (member.statut === "a déjà mon église") return "rgba(234,67,53,0.06)";
    if (member.statut === "ancien") return "rgba(107,114,128,0.03)";
    if (member.statut === "veut rejoindre ICC" || member.statut === "visiteur") return "rgba(37,99,235,0.06)";
    return "transparent";
  };

  const leftBarStyle = (m) => ({
    borderLeft: `6px solid ${getBorderColor(m)}`,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  });

  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return format(d, "EEEE d MMMM yyyy", { locale: fr });
    } catch {
      return "";
    }
  };

  // filter logic (select dropdown filter)
  const filteredMembers = members.filter((m) => {
    if (!filter) return true;
    if (filter === "star") return m.star === true;
    return m.statut === filter;
  });

  const nouveaux = filteredMembers.filter((m) => m.statut === "visiteur" || m.statut === "veut rejoindre ICC");
  const anciens = filteredMembers.filter((m) => m.statut !== "visiteur" && m.statut !== "veut rejoindre ICC");
  const allMembersOrdered = [...nouveaux, ...anciens];

  const statusOptions = ["", "actif", "ancien", "veut rejoindre ICC", "visiteur", "a déjà mon église", "star"];
  const countFiltered = filteredMembers.length;

  return (
    <div className="min-h-screen flex flex-col items-center p-6" style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}>
      {/* Header */}
      <div className="flex justify-between w-full max-w-5xl items-center mb-4">
        <button onClick={() => window.history.back()} className="flex items-center text-white font-semibold hover:text-gray-200">← Retour</button>
        <LogoutLink className="bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition" />
      </div>

      {/* Logo + Title */}
      <div className="mt-2 mb-2"><Image src="/logo.png" alt="SoulTrack Logo" width={80} height={80} /></div>
      <h1 className="text-5xl sm:text-6xl font-handwriting text-white text-center mb-3">SoulTrack</h1>
      <p className="text-center text-white text-lg mb-2 font-handwriting-light">Chaque personne a une valeur infinie. Ensemble, nous avançons ❤️</p>

      {/* View toggle */}
      <p className="self-end text-orange-500 cursor-pointer mb-4" onClick={() => setView(view === "card" ? "table" : "card")}>
        {view === "card" ? "Vue Table" : "Vue Carte"}
      </p>

      {/* FILTER (select) + counter — shown for both views */}
      <div className="w-full max-w-5xl flex items-center gap-4 mb-6">
        <div className="flex-1">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full rounded-xl bg-white/10 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            <option value="">-- Tous les statuts --</option>
            <option value="visiteur">Visiteur</option>
            <option value="veut rejoindre ICC">Veut rejoindre ICC</option>
            <option value="actif">Actif</option>
            <option value="ancien">Ancien</option>
            <option value="a déjà mon église">A déjà mon église</option>
            <option value="star">⭐ Star</option>
          </select>
        </div>

        <div>
          <span className="inline-block bg-white/10 text-white px-3 py-2 rounded-full text-sm font-medium">
            {countFiltered} affiché{countFiltered > 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* CARD VIEW */}
      {view === "card" ? (
        <div className="w-full max-w-5xl space-y-8">
          {/* "Bien aimé venu le ..." badge top-right, only once if nouveaux exist */}
          {nouveaux.length > 0 && (
            <div className="flex justify-end">
              <div className="px-3 py-2 rounded-md bg-blue-50 text-blue-800 text-sm" style={{ borderRadius: 8, transition: "opacity 0.2s" }}>
                💖 Bien aimé venu le {formatDate(nouveaux[0].created_at)}
              </div>
            </div>
          )}

          {/* NOUVEAUX (cards) - ALL CARDS WHITE BACKGROUND */}
          {nouveaux.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {nouveaux.map((m) => (
                <div
                  key={m.id}
                  className="p-3 rounded-xl shadow-md hover:shadow-xl transition-opacity duration-200 border-t-4 bg-white"
                  style={{ borderTopColor: getBorderColor(m) }}
                >
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
                    <option value="visiteur">visiteur</option>
                    <option value="veut rejoindre ICC">veut rejoindre ICC</option>
                    <option value="actif">actif</option>
                    <option value="ancien">ancien</option>
                    <option value="a déjà mon église">a déjà mon église</option>
                  </select>

                  <div>
                    <p className="text-blue-500 underline cursor-pointer text-sm" onClick={() => setDetailsOpen((p) => ({ ...p, [m.id]: !p[m.id] }))}>
                      {detailsOpen[m.id] ? "Fermer détails" : "Détails"}
                    </p>

                    {detailsOpen[m.id] && (
                      <div className="mt-2 text-sm text-gray-700 space-y-2 transition-opacity duration-200">
                        <p>Besoin : {m.besoin || "—"}</p>
                        <p>Infos : {m.infos_supplementaires || "—"}</p>
                        <p>Comment venu : {m.comment || "—"}</p>

                        {/* cellule select inside card details */}
                        <div>
                          <div className="text-sm text-green-600 font-medium mb-1">Cellule</div>
                          <select value={selectedCellules[m.id] || ""} onChange={(e) => setSelectedCellules((prev) => ({ ...prev, [m.id]: e.target.value }))} className="border rounded-md px-2 py-1 w-full mb-2">
                            <option value="">-- Sélectionner cellule --</option>
                            {cellules.map((c) => (<option key={c.id} value={c.id}>{c.cellule} ({c.responsable})</option>))}
                          </select>
                          {selectedCellules[m.id] && (
                            <button
                              onClick={() => {
                                const cellule = cellules.find((c) => String(c.id) === String(selectedCellules[m.id]));
                                // reuse BoutonEnvoyer to keep logic consistent (we show a green button style here)
                                // To avoid creating a second send flow, open popupMember to use BoutonEnvoyer there OR call the same function.
                                // We'll use BoutonEnvoyer component directly here.
                                // Note: BoutonEnvoyer handles its own session checks and DB insertion.
                                // Pass onStatusUpdate to update local state when status switches to actif.
                              }}
                              className="bg-green-600 text-white px-3 py-2 rounded-md text-sm"
                              style={{ marginTop: 4 }}
                            >
                              Envoyer au responsable
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Separator stylized (~75% width) - gradient blue -> gray */}
          {anciens.length > 0 && (
            <div className="flex items-center justify-center mt-6 mb-2">
              <div style={{ width: "12.5%" }} />
              <div style={{ width: "75%", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ height: 2, flex: 1, background: "linear-gradient(90deg,#2563eb,#9ca3af)" }} />
                <div className="text-white text-lg font-medium">Membres existants──────</div>
                <div style={{ height: 2, flex: 1, background: "linear-gradient(90deg,#2563eb,#9ca3af)" }} />
              </div>
              <div style={{ width: "12.5%" }} />
            </div>
          )}

          {/* ANCIENS (cards) - also white background per request */}
          {anciens.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {anciens.map((m) => (
                <div key={m.id} className="p-3 rounded-xl shadow-md hover:shadow-xl transition-opacity duration-200 bg-white" style={{ borderTop: `6px solid ${getBorderColor(m)}` }}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-sm font-semibold" style={{ color: getBorderColor(m) }}>{m.star ? "⭐ S.T.A.R" : m.statut || "—"}</div>
                  </div>

                  <div className="mb-2">
                    <div className="text-lg font-bold text-gray-800">{m.prenom}</div>
                    <div className="text-lg font-bold text-gray-800">{m.nom}</div>
                  </div>

                  <div className="text-sm text-gray-600 mb-2">📱 {m.telephone || "—"}</div>

                  <select value={m.statut} onChange={(e) => handleChangeStatus(m.id, e.target.value)} className="border rounded-md px-2 py-1 text-xs text-gray-700 mb-2 w-full">
                    <option value="actif">actif</option>
                    <option value="ancien">ancien</option>
                    <option value="veut rejoindre ICC">veut rejoindre ICC</option>
                    <option value="visiteur">visiteur</option>
                    <option value="a déjà mon église">a déjà mon église</option>
                  </select>

                  <div>
                    <p className="text-blue-500 underline cursor-pointer text-sm" onClick={() => setDetailsOpen((p) => ({ ...p, [m.id]: !p[m.id] }))}>
                      {detailsOpen[m.id] ? "Fermer détails" : "Détails"}
                    </p>

                    {detailsOpen[m.id] && (
                      <div className="mt-2 text-sm text-gray-700 space-y-2 transition-opacity duration-200">
                        <p>Besoin : {m.besoin || "—"}</p>
                        <p>Infos : {m.infos_supplementaires || "—"}</p>
                        <p>Comment venu : {m.comment || "—"}</p>

                        {/* cellule select inside details for anciens */}
                        <div>
                          <div className="text-sm text-green-600 font-medium mb-1">Cellule</div>
                          <select value={selectedCellules[m.id] || ""} onChange={(e) => setSelectedCellules((prev) => ({ ...prev, [m.id]: e.target.value }))} className="border rounded-md px-2 py-1 w-full mb-2">
                            <option value="">-- Sélectionner cellule --</option>
                            {cellules.map((c) => (<option key={c.id} value={c.id}>{c.cellule} ({c.responsable})</option>))}
                          </select>
                          {selectedCellules[m.id] && (
                            <BoutonEnvoyer membre={m} cellule={cellules.find((c) => String(c.id) === String(selectedCellules[m.id]))} onStatusUpdate={handleStatusUpdateFromEnvoyer} />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="w-full max-w-5xl bg-white rounded-xl shadow-lg overflow-x-auto p-4">
          {/* single "Bien aimé venu le..." shown once above table if nouveaux exist */}
          {nouveaux.length > 0 && (
            <div className="mb-3 flex justify-end">
              <div className="px-3 py-2 rounded-md bg-blue-50 text-blue-800 text-sm" style={{ borderRadius: 8, transition: "opacity 0.2s" }}>
                💖 Bien aimé venu le {formatDate(nouveaux[0].created_at)}
              </div>
            </div>
          )}

          <table className="w-full text-sm text-left text-gray-700">
            <thead className="bg-indigo-600 text-white text-sm uppercase">
              <tr>
                <th className="px-4 py-2 w-[45%]">Nom complet</th>
                <th className="px-4 py-2 w-[20%]">Téléphone</th>
                <th className="px-4 py-2 w-[20%]">Statut</th>
                <th className="px-4 py-2 w-[15%]">Détails</th>
              </tr>
            </thead>
            <tbody>
              {/* nouveaux first */}
              {nouveaux.map((m) => (
                <tr key={m.id} className="border-b" style={{ background: "#ffffff" }}>
                  <td className="px-4 py-3" style={leftBarStyle(m)}>
                    <div className="font-semibold">{m.prenom} {m.nom}</div>
                    <div className="text-xs text-gray-600 mt-1">💖 Bien aimé venu le {formatDate(m.created_at)}</div>
                    <div className="mt-1">
                      <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">Nouveau</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">{m.telephone}</td>
                  <td className="px-4 py-3">
                    <select value={m.statut} onChange={(e) => handleChangeStatus(m.id, e.target.value)} className="border rounded-md px-2 py-1 text-sm w-full">
                      <option value="visiteur">visiteur</option>
                      <option value="veut rejoindre ICC">veut rejoindre ICC</option>
                      <option value="actif">actif</option>
                      <option value="ancien">ancien</option>
                      <option value="a déjà mon église">a déjà mon église</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => setPopupMember(m)} className="text-blue-600 underline text-sm">Détails</button>
                  </td>
                </tr>
              ))}

              {/* in-table separator band (gradient 75% width look) */}
              {anciens.length > 0 && (
                <tr>
                  <td colSpan={4} className="py-3">
                    <div style={{ display: "flex", justifyContent: "center" }}>
                      <div style={{ width: "75%", height: 36, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(90deg,#2563eb,#9ca3af)" }}>
                        <span className="text-sm font-medium text-white">Membres existants──────</span>
                      </div>
                    </div>
                  </td>
                </tr>
              )}

              {/* anciens rows */}
              {anciens.map((m) => (
                <tr key={m.id} className="border-b" style={{ background: "#ffffff" }}>
                  <td className="px-4 py-3" style={leftBarStyle(m)}>
                    <div className="font-semibold">{m.prenom} {m.nom}</div>
                    {/* NOTE: per requirement, do NOT show 'Bien aimé venu...' for anciens */}
                  </td>
                  <td className="px-4 py-3">{m.telephone}</td>
                  <td className="px-4 py-3">
                    <select value={m.statut} onChange={(e) => handleChangeStatus(m.id, e.target.value)} className="border rounded-md px-2 py-1 text-sm w-full">
                      <option value="actif">actif</option>
                      <option value="ancien">ancien</option>
                      <option value="veut rejoindre ICC">veut rejoindre ICC</option>
                      <option value="visiteur">visiteur</option>
                      <option value="a déjà mon église">a déjà mon église</option>
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

      {/* Popup details (includes status dropdown, cellule select and BoutonEnvoyer) */}
      {popupMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" style={{ transition: "opacity 0.2s" }}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md relative transition-opacity duration-200">
            <button onClick={() => setPopupMember(null)} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl">✖</button>

            <h2 className="text-xl font-semibold mb-2 text-indigo-700">{popupMember.prenom} {popupMember.nom}</h2>
            <p className="text-gray-700 text-sm mb-2">📱 {popupMember.telephone || "—"}</p>

            {/* statut dropdown */}
            <div className="mb-3">
              <p className="text-sm text-gray-700 mb-1">Statut :</p>
              <select value={popupMember.statut} onChange={(e) => { handleChangeStatus(popupMember.id, e.target.value); setPopupMember((p) => ({ ...p, statut: e.target.value })); }} className="border rounded-md px-3 py-2 text-sm w-full">
                <option value="visiteur">visiteur</option>
                <option value="veut rejoindre ICC">veut rejoindre ICC</option>
                <option value="actif">actif</option>
                <option value="ancien">ancien</option>
                <option value="a déjà mon église">a déjà mon église</option>
              </select>
            </div>

            {/* cellule block (green label + select + green send button) */}
            <div className="mb-3">
              <div className="text-sm text-green-600 font-medium mb-1">Cellule</div>
              <select value={selectedCellules[popupMember.id] || ""} onChange={(e) => setSelectedCellules((prev) => ({ ...prev, [popupMember.id]: e.target.value }))} className="border rounded-md px-3 py-2 text-sm w-full mb-3">
                <option value="">-- Sélectionner cellule --</option>
                {cellules.map((c) => (<option key={c.id} value={c.id}>{c.cellule} ({c.responsable})</option>))}
              </select>

              {selectedCellules[popupMember.id] && (
                <div className="flex items-center gap-3">
                  <BoutonEnvoyer membre={popupMember} cellule={cellules.find((c) => String(c.id) === String(selectedCellules[popupMember.id]))} onStatusUpdate={handleStatusUpdateFromEnvoyer} />
                </div>
              )}
            </div>

            <div className="text-sm text-gray-700">
              <p className="mb-1">Besoin : {popupMember.besoin || "—"}</p>
              <p className="mb-1">Infos : {popupMember.infos_supplementaires || "—"}</p>
              <p>Comment venu : {popupMember.comment || "—"}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
