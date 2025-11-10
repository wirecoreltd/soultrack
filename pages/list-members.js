// ✅ /pages/list-members.js
"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import Image from "next/image";
import BoutonEnvoyer from "../components/BoutonEnvoyer";
import LogoutLink from "../components/LogoutLink";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import DetailsPopup from "../components/DetailsPopup";

export default function ListMembers() {
  const [members, setMembers] = useState([]);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [detailsOpen, setDetailsOpen] = useState({});
  const [cellules, setCellules] = useState([]);
  const [selectedCellules, setSelectedCellules] = useState({});
  const [view, setView] = useState("card");
  const [popupMember, setPopupMember] = useState(null);
  const [session, setSession] = useState(null);
  const [prenom, setPrenom] = useState("");

  useEffect(() => {
    const fetchSessionAndProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      if (session?.user) {
        const { data, error } = await supabase
          .from("profiles")
          .select("prenom")
          .eq("id", session.user.id)
          .single();

        if (!error && data) setPrenom(data.prenom);
      }
    };

    fetchSessionAndProfile();
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

  const handleStatusUpdateFromEnvoyer = (id, currentStatus) => {
    if (currentStatus === "visiteur" || currentStatus === "veut rejoindre ICC") {
      handleChangeStatus(id, "actif");
    }
    setPopupMember(null);
  };

  const getBorderColor = (m) => {
    if (m.star) return "#FBC02D";
    if (m.statut === "actif") return "#4285F4";
    if (m.statut === "a déjà mon église") return "#EA4335";
    if (m.statut === "Integrer") return "#FFA500";
    if (m.statut === "ancien") return "#999999";
    if (m.statut === "veut rejoindre ICC" || m.statut === "visiteur") return "#34A853";
    return "#ccc";
  };

  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return format(date, "EEEE d MMMM yyyy", { locale: fr });
    } catch {
      return "";
    }
  };

  const filterBySearch = (list) =>
    list.filter((m) =>
      `${m.prenom} ${m.nom}`.toLowerCase().includes(search.toLowerCase())
    );

  const nouveaux = members.filter(
    (m) => m.statut === "visiteur" || m.statut === "veut rejoindre ICC"
  );
  const anciens = members.filter(
    (m) => m.statut !== "visiteur" && m.statut !== "veut rejoindre ICC"
  );

  const nouveauxFiltres = filterBySearch(
    filter ? nouveaux.filter((m) => m.statut === filter) : nouveaux
  );
  const anciensFiltres = filterBySearch(
    filter ? anciens.filter((m) => m.statut === filter) : anciens
  );

  const allMembersOrdered = [...nouveaux, ...anciens];
  const filteredMembers = filterBySearch(
    filter ? allMembersOrdered.filter((m) => m.statut === filter) : allMembersOrdered
  );

  const statusOptions = [
    "actif",
    "Integrer",
    "ancien",
    "veut rejoindre ICC",
    "visiteur",
    "a déjà mon église",
  ];

  const totalCount = filteredMembers.length;

  const toggleDetails = (id) => {
    setDetailsOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center p-6 transition-all duration-200"
      style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}
    >
      <div className="w-full max-w-5xl mb-6">
        <div className="flex justify-between items-center">
          <button
            onClick={() => window.history.back()}
            className="flex items-center text-white hover:text-gray-200 transition-colors"
          >
            ← Retour
          </button>

          <LogoutLink className="bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition" />
        </div>

        <div className="flex justify-end mt-2">
          <p className="text-orange-200 text-sm">
            👋 Bienvenue {prenom || "cher membre"}
          </p>
        </div>
      </div>

      <div className="mb-4">
        <Image src="/logo.png" alt="SoulTrack Logo" className="w-20 h-18 mx-auto" />
      </div>

      <div className="text-center mb-4">
        <h1 className="text-3xl font-bold text-white mb-2">Liste des Membres</h1>
        <p className="text-white text-lg max-w-xl mx-auto leading-relaxed tracking-wide font-light italic">
          Chaque personne a une valeur infinie. Ensemble, nous avançons ❤️
        </p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center w-full max-w-5xl mb-4">
        <div className="flex items-center space-x-2 mb-2 sm:mb-0">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border text-sm"
          >
            <option value="">Tous les statuts</option>
            {statusOptions.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom..."
            className="px-3 py-2 rounded-lg border text-sm w-48"
          />

          <span className="text-white text-sm">({totalCount})</span>
        </div>

        <button
          onClick={() => setView(view === "card" ? "table" : "card")}
          className="text-white text-sm underline hover:text-gray-200"
        >
          {view === "card" ? "Vue Table" : "Vue Carte"}
        </button>
      </div>

      {/* ==================== VUE CARTE ==================== */}
      {view === "card" && (
        <div className="w-full max-w-5xl space-y-8 transition-all duration-200">
          {/* ----------------- Nouveaux membres ----------------- */}
          {nouveauxFiltres.length > 0 && (
            <div>
              <p className="text-white text-lg mb-2 ml-1">
                💖 Bien aimé venu le {formatDate(nouveauxFiltres[0].created_at)}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {nouveauxFiltres.map((m) => {
                  const isOpen = detailsOpen[m.id];
                  return (
                    <div
                      key={m.id}
                      className="bg-white p-3 rounded-xl shadow-md border-l-4 transition duration-200 overflow-hidden relative"
                      style={{ borderLeftColor: getBorderColor(m) }}
                    >
                      {(m.statut === "visiteur" || m.statut === "veut rejoindre ICC") && (
                        <span className="absolute top-3 right-[-25px] bg-blue-600 text-white text-[10px] font-bold px-6 py-1 rotate-45 shadow-md">
                          Nouveau
                        </span>
                      )}

                      <div className="flex flex-col items-center">
                        <h2 className="text-lg font-bold text-gray-800 text-center">
                          {m.prenom} {m.nom}
                        </h2>
                        <p className="text-sm text-gray-600 mb-2 text-center">
                          📱 {m.telephone || "—"}
                        </p>
                        <p className="text-sm text-gray-600 mb-2 text-center">
                          🕊 Statut : {m.statut || "—"}
                        </p>
                        <button
                          onClick={() => toggleDetails(m.id)}
                          className="text-orange-500 underline text-sm"
                        >
                          {isOpen ? "Fermer détails" : "Détails"}
                        </button>

                        {isOpen && (
                          <div className="text-gray-700 text-sm mt-2 space-y-2 w-full">
                            <p>💬 WhatsApp : {m.is_whatsapp ? "Oui" : "Non"}</p>
                            <p>🏙 Ville : {m.ville || "—"}</p>
                            <p>🧩 Comment est-il venu : {m.venu || "—"}</p>
                            <p>❓Besoin : {
                              (() => {
                                if (!m.besoin) return "—";
                                if (Array.isArray(m.besoin)) return m.besoin.join(", ");
                                try {
                                  const arr = JSON.parse(m.besoin);
                                  return Array.isArray(arr) ? arr.join(", ") : m.besoin;
                                } catch { return m.besoin; }
                              })()
                            }</p>
                            <p>📝 Infos : {m.infos_supplementaires || "—"}</p>

                            <p className="mt-2 font-semibold text-bleu-600">Statut :</p>
                            <select
                              value={m.statut}
                              onChange={(e) => handleChangeStatus(m.id, e.target.value)}
                              className="border rounded-md px-2 py-1 text-sm text-gray-700 w-full"
                            >
                              {statusOptions.map((s) => (
                                <option key={s}>{s}</option>
                              ))}
                            </select>

                            <p className="mt-2 font-semibold text-green-600">Cellule :</p>
                            <select
                              value={selectedCellules[m.id] || ""}
                              onChange={(e) =>
                                setSelectedCellules((prev) => ({
                                  ...prev,
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
                              <div className="mt-2">
                                <BoutonEnvoyer
                                  membre={m}
                                  cellule={cellules.find(
                                    (c) => c.id === selectedCellules[m.id]
                                  )}
                                  onStatusUpdate={handleStatusUpdateFromEnvoyer}
                                  session={session}
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ----------------- Membres existants ----------------- */}
          
          {anciensFiltres.map((m) => {
            const isOpen = detailsOpen[m.id];
            return (
              <div
                key={m.id}
                className="bg-white p-3 rounded-xl shadow-md border-l-4 transition duration-200 overflow-hidden relative"
                style={{ borderLeftColor: getBorderColor(m) }}
              >
                <div className="flex flex-col items-center">
                  <h2 className="text-lg font-bold text-gray-800 text-center">
                    {m.prenom} {m.nom}
                    {m.star && <span className="text-yellow-400 ml-1">⭐</span>}
                  </h2>
          
                  <p className="text-sm text-gray-600 mb-2 text-center">
                    📱 {m.telephone || "—"}
                  </p>
                  <p className="text-sm text-gray-600 mb-2 text-center">
                    🕊 Statut : {m.statut || "—"}
                  </p>
                  <button
                    onClick={() => toggleDetails(m.id)}
                    className="text-orange-500 underline text-sm"
                  >
                    {isOpen ? "Fermer détails" : "Détails"}
                  </button>
          
                  {isOpen && (
                    <div className="text-gray-700 text-sm mt-2 space-y-2 w-full">
                      <p>💬 WhatsApp : {m.is_whatsapp ? "Oui" : "Non"}</p>
                      <p>🏙 Ville : {m.ville || "—"}</p>
                      <p>🧩 Comment est-il venu : {m.venu || "—"}</p>
                      <p>
                        ❓Besoin :{" "}
                        {(() => {
                          if (!m.besoin) return "—";
                          if (Array.isArray(m.besoin)) return m.besoin.join(", ");
                          try {
                            const arr = JSON.parse(m.besoin);
                            return Array.isArray(arr) ? arr.join(", ") : m.besoin;
                          } catch {
                            return m.besoin;
                          }
                        })()}
                      </p>
                      <p>📝 Infos : {m.infos_supplementaires || "—"}</p>
          
                      {/* ✅ NOUVELLE VERSION ICI */}
                      <p className="mt-2 font-semibold text-gray-700">
                        🕊 Statut :{" "}
                        <span className="text-black-600 font-medium">
                          {m.statut || "—"}
                        </span>
                      </p>
          
                      <p className="mt-2 text-black-600">
                        Cellule :
                        <span className="text-gray-700 font-normal ml-1">
                          {(() => {
                            const cellule = cellules.find((c) => c.id === m.cellule_id);
                            return cellule
                              ? `${cellule.cellule} (${cellule.responsable || "—"})`
                              : "—";
                          })()}
                        </span>
                      </p>
          
                      {/* ===================== MODIFIER CONTACT ===================== */}
                      <div className="mt-3 border-t border-gray-200 pt-3">
                        <h4 className="text-sm font-semibold text-blue-700 mb-2 text-center">
                          ✏️ Modifier contact
                        </h4>
          
                        <div className="space-y-2 text-xs">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              defaultValue={m.prenom}
                              placeholder="Prénom"
                              onBlur={(e) =>
                                supabase
                                  .from("membres")
                                  .update({ prenom: e.target.value })
                                  .eq("id", m.id)
                              }
                              className="w-1/2 border rounded-md px-2 py-1"
                            />
                            <input
                              type="text"
                              defaultValue={m.nom}
                              placeholder="Nom"
                              onBlur={(e) =>
                                supabase
                                  .from("membres")
                                  .update({ nom: e.target.value })
                                  .eq("id", m.id)
                              }
                              className="w-1/2 border rounded-md px-2 py-1"
                            />
                          </div>
          
                          <input
                            type="text"
                            defaultValue={m.ville}
                            placeholder="Ville"
                            onBlur={(e) =>
                              supabase
                                .from("membres")
                                .update({ ville: e.target.value })
                                .eq("id", m.id)
                            }
                            className="w-full border rounded-md px-2 py-1"
                          />
          
                          <input
                            type="text"
                            defaultValue={m.telephone}
                            placeholder="Téléphone"
                            onBlur={(e) =>
                              supabase
                                .from("membres")
                                .update({ telephone: e.target.value })
                                .eq("id", m.id)
                            }
                            className="w-full border rounded-md px-2 py-1"
                          />
          
                          <textarea
                            defaultValue={m.besoin}
                            placeholder="Besoin"
                            onBlur={(e) =>
                              supabase
                                .from("membres")
                                .update({ besoin: e.target.value })
                                .eq("id", m.id)
                            }
                            className="w-full border rounded-md px-2 py-1 h-12 resize-none"
                          />
          
                          <select
                            defaultValue={m.cellule_id || ""}
                            onChange={(e) =>
                              supabase
                                .from("membres")
                                .update({ cellule_id: e.target.value })
                                .eq("id", m.id)
                            }
                            className="w-full border rounded-md px-2 py-1"
                          >
                            <option value="">-- Sélectionner cellule --</option>
                            {cellules.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.cellule} ({c.responsable})
                              </option>
                            ))}
                          </select>
          
                          <select
                            defaultValue={m.statut}
                            onChange={(e) =>
                              supabase
                                .from("membres")
                                .update({ statut: e.target.value })
                                .eq("id", m.id)
                            }
                            className="w-full border rounded-md px-2 py-1"
                          >
                            {statusOptions.map((s) => (
                              <option key={s}>{s}</option>
                            ))}
                          </select>
          
                          <textarea
                            defaultValue={m.infos_supplementaires}
                            placeholder="Infos supplémentaires"
                            onBlur={(e) =>
                              supabase
                                .from("membres")
                                .update({
                                  infos_supplementaires: e.target.value,
                                })
                                .eq("id", m.id)
                            }
                            className="w-full border rounded-md px-2 py-1 h-16 resize-none"
                          />
          
                          <button
                            onClick={() => fetchMembers()}
                            className="w-full mt-1 bg-green-600 hover:bg-green-700 text-white py-1.5 rounded-md font-semibold text-sm"
                          >
                            💾 Enregistrer
                          </button>
                        </div>
                      </div>
                      {/* ===================== FIN MODIFIER CONTACT ===================== */}
                    </div>
                  )}
                </div>
              </div>
              );
          })}
        </div>
      )}                

      {/* ==================== VUE TABLE ==================== */}
      {view === "table" && (
        <div className="w-full max-w-6xl overflow-x-auto transition duration-200">
          <table className="w-full text-sm text-left text-white border-separate border-spacing-0">
            <thead className="bg-gray-200 text-gray-800 text-sm uppercase rounded-t-md">
              <tr>
                <th className="px-4 py-2 rounded-tl-lg">Nom complet</th>
                <th className="px-4 py-2">Téléphone</th>
                <th className="px-4 py-2">Statut</th>
                <th className="px-4 py-2 rounded-tr-lg">Détails</th>
              </tr>
            </thead>
            <tbody>
              {nouveauxFiltres.length > 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-2 text-white font-semibold">
                    💖 Bien aimé venu le {formatDate(nouveauxFiltres[0].created_at)}
                  </td>
                </tr>
              )}

              {nouveauxFiltres.map((m) => (
                <tr
                  key={m.id}
                  className="hover:bg-white/10 transition duration-150 border-b border-blue-300"
                >
                  <td
                    className="px-4 py-2 border-l-4 rounded-l-md flex items-center gap-2"
                    style={{ borderLeftColor: getBorderColor(m) }}
                  >
                    {m.prenom} {m.nom}
                    {m.star && <span className="text-yellow-400 ml-1">⭐</span>}
                    <span className="bg-blue-500 text-white text-xs px-1 rounded">Nouveau</span>
                  </td>
                  <td className="px-4 py-2">{m.telephone || "—"}</td>
                  <td className="px-4 py-2">{m.statut || "—"}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => setPopupMember(popupMember?.id === m.id ? null : m)}
                      className="text-orange-500 underline text-sm"
                    >
                      {popupMember?.id === m.id ? "Fermer détails" : "Détails"}
                    </button>
                  </td>
                </tr>
              ))}

              {anciensFiltres.length > 0 && (
                <>
                  <tr>
                    <td colSpan={4} className="px-4 py-2 font-semibold text-lg">
                      <span
                        style={{
                          background: "linear-gradient(to right, #3B82F6, #D1D5DB)",
                          WebkitBackgroundClip: "text",
                          color: "transparent",
                        }}
                      >
                        Membres existants
                      </span>
                    </td>
                  </tr>

                  {anciensFiltres.map((m) => (
                    <tr
                      key={m.id}
                      className="hover:bg-white/10 transition duration-150 border-b border-gray-300"
                    >
                      <td
                        className="px-4 py-2 border-l-4 rounded-l-md flex items-center gap-2"
                        style={{ borderLeftColor: getBorderColor(m) }}
                      >
                        {m.prenom} {m.nom}
                        {m.star && <span className="text-yellow-400 ml-1">⭐</span>}
                      </td>
                      <td className="px-4 py-2">{m.telephone || "—"}</td>
                      <td className="px-4 py-2">{m.statut || "—"}</td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => setPopupMember(popupMember?.id === m.id ? null : m)}
                          className="text-orange-500 underline text-sm"
                        >
                          {popupMember?.id === m.id ? "Fermer détails" : "Détails"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </>
              )}
            </tbody>
          </table>

          {popupMember && (
            <DetailsPopup
              member={popupMember}
              onClose={() => setPopupMember(null)}
              statusOptions={statusOptions}
              cellules={cellules}
              selectedCellules={selectedCellules}
              setSelectedCellules={setSelectedCellules}
              handleChangeStatus={handleChangeStatus}
              handleStatusUpdateFromEnvoyer={handleStatusUpdateFromEnvoyer}
              session={session}
            />
          )}
        </div>
      )}
    </div>
  );
}
