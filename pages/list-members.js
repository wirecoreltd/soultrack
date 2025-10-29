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
  const [search, setSearch] = useState("");
  const [detailsOpen, setDetailsOpen] = useState({});
  const [cellules, setCellules] = useState([]);
  const [selectedCellules, setSelectedCellules] = useState({});
  const [view, setView] = useState("card");
  const [popupMember, setPopupMember] = useState(null);
  const [session, setSession] = useState(null);

  useEffect(() => {
    getSession();
    fetchMembers();
    fetchCellules();
  }, []);

  const getSession = async () => {
    const { data } = await supabase.auth.getSession();
    setSession(data?.session || null);
  };

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
  };

  const getBorderColor = (m) => {
    if (m.star) return "#FBC02D";
    if (m.statut === "actif") return "#4285F4";
    if (m.statut === "a déjà mon église") return "#EA4335";
    if (m.statut === "Integrer") return "#FFA500";
    if (m.statut === "ancien") return "#999999";
    if (m.statut === "veut rejoindre ICC" || m.statut === "visiteur")
      return "#34A853";
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
      {/* ==================== HEADER ==================== */}
      <div className="flex justify-between w-full max-w-5xl items-center mb-4">
        <button
          onClick={() => window.history.back()}
          className="flex items-center text-white font-semibold hover:text-gray-200"
        >
          ← Retour
        </button>
        <LogoutLink className="bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition" />
      </div>

      {/* ==================== LOGO ==================== */}
      <div className="mt-2 mb-2">
        <Image src="/logo.png" alt="SoulTrack Logo" width={80} height={80} />
      </div>

      <h1 className="text-5xl sm:text-6xl font-handwriting text-white text-center mb-3">
        SoulTrack
      </h1>
      <p className="text-center text-white text-lg mb-2 font-handwriting-light">
        Chaque personne a une valeur infinie. Ensemble, nous avançons ❤️
      </p>

      {/* ==================== FILTRE + RECHERCHE + TOGGLE ==================== */}
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
          {/* -------- Nouveaux membres -------- */}
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
                      className="bg-white p-3 rounded-xl shadow-md hover:shadow-xl transition duration-200 overflow-hidden relative"
                    >
                      {/* Bordure en haut comme les anciens */}
                      <div
                        className="w-full h-[6px] rounded-t-xl mb-2"
                        style={{ backgroundColor: getBorderColor(m) }}
                      />

                      {/* Tag Nouveau */}
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
                            <p> 📌 Prénom Nom : {m.prenom} {m.nom}</p>
                            <p> 📞 Téléphone : {m.telephone || "—"}</p>
                            <p> 💬 WhatsApp : {m.is_whatsapp || "—"}</p>
                            <p> 🏙 Ville : {m.ville || "—"}</p>
                            <p> 🕊 Statut : {m.statut || "—"}</p>
                            <p>🧩 Comment est-il venu : {m.venu || "—"}</p>
                            <p>❓Besoin : {m.besoin || "—"}</p>
                            <p>📝 Infos : {m.infos_supplementaires || "—"}</p>

                            <select
                              value={m.statut}
                              onChange={(e) => handleChangeStatus(m.id, e.target.value)}
                              className="border rounded-md px-2 py-1 text-xs text-gray-700 w-full"
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

          {/* -------- Membres existants -------- */}
          {anciensFiltres.length > 0 && (
            <div className="mt-8">
              <h3 className="text-white text-lg mb-3 font-semibold">
                <span
                  style={{
                    background: "linear-gradient(to right, #3B82F6, #D1D5DB)",
                    WebkitBackgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  Membres existants
                </span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                            <p> 📌 Prénom Nom : {m.prenom} {m.nom}</p>
                            <p> 📞 Téléphone : {m.telephone || "—"}</p>
                            <p> 💬 WhatsApp : {m.is_whatsapp || "—"}</p>
                            <p> 🏙 Ville : {m.ville || "—"}</p>
                            <p> 🕊 Statut : {m.statut || "—"}</p>
                            <p>🧩 Comment est-il venu : {m.venu || "—"}</p>
                            <p>❓ Besoin : {m.besoin || "—"}</p>
                            <p>📝 Infos : {m.infos_supplementaires || "—"}</p>

                            <select
                              value={m.statut}
                              onChange={(e) => handleChangeStatus(m.id, e.target.value)}
                              className="border rounded-md px-2 py-1 text-xs text-gray-700 w-full"
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
              {/* Nouveaux membres */}
             
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
                      onClick={() => toggleDetails(m.id)}
                      className="text-orange-500 underline text-sm"
                    >
                      {detailsOpen[m.id] ? "Fermer détails" : "Détails"}
                    </button>

                    {detailsOpen[m.id] && (
                      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 transition-all duration-200">
                        <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md relative">
                          <button
                            onClick={() => toggleDetails(m.id)}
                            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl"
                          >
                            ✖
                          </button>
                    
                          <h2 className="text-xl font-bold mb-2 text-black">
                            {m.prenom} {m.nom}
                            {m.star && <span className="text-yellow-400 ml-1">⭐</span>}
                          </h2>
                    
                          <p className="text-black text-sm mb-1">📞 {m.telephone || "—"}</p>
                          <p className="text-black text-sm mb-1">💬 WhatsApp : {m.is_whatsapp || "—"}</p>
                          <p className="text-black text-sm mb-1">🏙 Ville : {m.ville || "—"}</p>
                          <p className="text-black text-sm mb-1">🕊 Statut actuel : {m.statut || "—"}</p>
                          <p className="text-black text-sm mb-1">🧩 Comment est-il venu : {m.venu || "—"}</p>
                          <p className="text-black text-sm mb-1">❓ Besoin : {m.besoin || "—"}</p>
                          <p className="text-black text-sm mb-1">📝 Infos : {m.infos_supplementaires || "—"}</p>
                    
                          {/* ---------- Nouveau menu déroulant Statut ---------- */}
                          <p className="mt-2 font-semibold text-gray-800">Modifier le statut :</p>
                          <select
                            value={m.statut}
                            onChange={(e) => handleChangeStatus(m.id, e.target.value)}
                            className="border rounded-lg px-2 py-1 text-sm w-full text-black"
                          >
                            {statusOptions.map((s) => (
                              <option key={s} className="text-black">{s}</option>
                            ))}
                          </select>
                    
                          {/* ---------- Menu déroulant Cellule ---------- */}
                          <p className="mt-2 font-semibold text-green-600">Cellule :</p>
                          <select
                            value={selectedCellules[m.id] || ""}
                            onChange={(e) =>
                              setSelectedCellules((prev) => ({
                                ...prev,
                                [m.id]: e.target.value,
                              }))
                            }
                            className="border rounded-lg px-2 py-1 text-sm w-full text-black"
                          >
                            <option value="" className="text-black">-- Sélectionner cellule --</option>
                            {cellules.map((c) => (
                              <option key={c.id} value={c.id} className="text-black">
                                {c.cellule} ({c.responsable})
                              </option>
                            ))}
                          </select>
                    
                          {selectedCellules[m.id] && (
                            <div className="mt-3">
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
                      </div>
                      )}

                  </td>
                </tr>
              ))}

              {/* Membres existants */}
              {anciensFiltres.length > 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-2 font-semibold text-lg">
                    <span
                      className="bg-clip-text text-transparent"
                      style={{
                        background: "linear-gradient(to right, #3B82F6, #D1D5DB)",
                      }}
                    >
                      Membres existants
                    </span>
                  </td>
                </tr>
              )}

              {anciensFiltres.map((m) => (
                <tr
                  key={m.id}
                  className="hover:bg-white/10 transition duration-150 border-b border-gray-400"
                >
                  <td
                    className="px-4 py-2 border-l-4 rounded-l-md"
                    style={{ borderLeftColor: getBorderColor(m) }}
                  >
                    {m.prenom} {m.nom}
                    {m.star && <span className="text-yellow-400 ml-1">⭐</span>}
                  </td>
                  <td className="px-4 py-2">{m.telephone || "—"}</td>
                  <td className="px-4 py-2">{m.statut || "—"}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => toggleDetails(m.id)}
                      className="text-orange-500 underline text-sm"
                    >
                      {detailsOpen[m.id] ? "Fermer détails" : "Détails"}
                    </button>

                    {detailsOpen[m.id] && (
                      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 transition-all duration-200">
                        <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md relative">
                          <button
                            onClick={() => toggleDetails(m.id)}
                            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl"
                          >
                            ✖
                          </button>
                          <h2 className="text-xl font-bold mb-2 text-black">
                            {m.prenom} {m.nom}
                          </h2>
                          <p className="text-black text-sm mb-1">📞 {m.telephone || "—"}</p>
                          <p className="text-black text-sm mb-1">💬 WhatsApp : {m.is_whatsapp || "—"}</p>
                          <p className="text-black text-sm mb-1">🏙 Ville : {m.ville || "—"}</p>
                          <p className="text-black text-sm mb-1">🕊 Statut : {m.statut || "—"}</p>
                          <p className="text-black text-sm mb-1">🧩 Comment est-il venu : {m.venu || "—"}</p>
                          <p className="text-black text-sm mb-1">📝 Infos : {m.infos_supplementaires || "—"}</p>

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
                            <div className="mt-3">
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
                      </div>
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
