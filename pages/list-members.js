// list-members.js

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
      {/* Header */}
      <div className="flex justify-between w-full max-w-5xl items-center mb-4">
        <button
          onClick={() => window.history.back()}
          className="flex items-center text-white font-semibold hover:text-gray-200"
        >
          ← Retour
        </button>
        <LogoutLink className="bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition" />
      </div>

      {/* Logo */}
      <div className="mt-2 mb-2">
        <Image src="/logo.png" alt="SoulTrack Logo" width={80} height={80} />
      </div>

      <h1 className="text-5xl sm:text-6xl font-handwriting text-white text-center mb-3">
        SoulTrack
      </h1>
      <p className="text-center text-white text-lg mb-2 font-handwriting-light">
        Chaque personne a une valeur infinie. Ensemble, nous avançons ❤️
      </p>

      {/* Filtre + recherche + compteur + toggle */}
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

      {/* === VUE CARTE === */}
      {view === "card" && (
        <div className="w-full max-w-5xl space-y-8 transition-all duration-200">
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
                      className={`bg-white rounded-2xl shadow-md border-l-4 overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl`}
                      style={{ borderLeftColor: getBorderColor(m) }}
                    >
                      {/* Bande colorée en haut */}
                      <div
                        className="w-full h-[6px] rounded-t-2xl"
                        style={{ backgroundColor: getBorderColor(m) }}
                      />

                      {/* Contenu de la carte */}
                      <div className="p-3 flex flex-col flex-grow">
                        <div className="flex justify-between items-center mb-1">
                          <span
                            className="text-sm font-semibold"
                            style={{ color: getBorderColor(m) }}
                          >
                            {m.star ? "⭐ S.T.A.R" : m.statut}
                          </span>
                          <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full ml-2">
                            Nouveau
                          </span>
                        </div>

                        <div className="text-lg font-bold text-gray-800">
                          {m.prenom} {m.nom}
                        </div>

                        <p className="text-sm text-gray-600 mb-2">📱 {m.telephone || "—"}</p>

                        <select
                          value={m.statut}
                          onChange={(e) => handleChangeStatus(m.id, e.target.value)}
                          className="border rounded-md px-2 py-1 text-xs text-gray-700 mb-2 w-full"
                        >
                          {statusOptions.map((s) => (
                            <option key={s}>{s}</option>
                          ))}
                        </select>

                        {/* Bouton détails */}
                        <button
                          onClick={() => toggleDetails(m.id)}
                          className="text-orange-500 underline text-sm mt-1"
                        >
                          {isOpen ? "Fermer détails" : "Détails"}
                        </button>

                        {isOpen && (
                          <div className="flex flex-col mt-2 space-y-2">
                            <p>📌 Prénom Nom : {m.prenom} {m.nom}</p>
                            <p>📞 Téléphone : {m.telephone || "—"}</p>
                            <p>💬 WhatsApp : {m.whatsapp || "—"}</p>
                            <p>🏙 Ville : {m.ville || "—"}</p>
                            <p>🕊 Statut : {m.statut || "—"}</p>
                            <p>🧩 Comment est-il venu : {m.comment || "—"}</p>
                            <p>📝 Infos : {m.infos_supplementaires || "—"}</p>

                            {/* Cellule en bas */}
                            <div className="mt-auto">
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
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

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
                      className={`bg-white rounded-2xl shadow-md border-l-4 overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl`}
                      style={{ borderLeftColor: getBorderColor(m) }}
                    >
                      <div
                        className="w-full h-[6px] rounded-t-2xl"
                        style={{ backgroundColor: getBorderColor(m) }}
                      />

                      <div className="p-3 flex flex-col flex-grow">
                        <div className="flex justify-between items-center mb-1">
                          <span
                            className="text-sm font-semibold"
                            style={{ color: getBorderColor(m) }}
                          >
                            {m.star ? "⭐ S.T.A.R" : m.statut}
                          </span>
                        </div>

                        <div className="text-lg font-bold text-gray-800">
                          {m.prenom} {m.nom}
                        </div>

                        <p className="text-sm text-gray-600 mb-2">📱 {m.telephone || "—"}</p>

                        <select
                          value={m.statut}
                          onChange={(e) => handleChangeStatus(m.id, e.target.value)}
                          className="border rounded-md px-2 py-1 text-xs text-gray-700 mb-2 w-full"
                        >
                          {statusOptions.map((s) => (
                            <option key={s}>{s}</option>
                          ))}
                        </select>

                        <button
                          onClick={() => toggleDetails(m.id)}
                          className="text-orange-500 underline text-sm mt-1"
                        >
                          {isOpen ? "Fermer détails" : "Détails"}
                        </button>

                        {isOpen && (
                          <div className="flex flex-col mt-2 space-y-2">
                            <p>📌 Prénom Nom : {m.prenom} {m.nom}</p>
                            <p>📞 Téléphone : {m.telephone || "—"}</p>
                            <p>💬 WhatsApp : {m.whatsapp || "—"}</p>
                            <p>🏙 Ville : {m.ville || "—"}</p>
                            <p>🕊 Statut : {m.statut || "—"}</p>
                            <p>🧩 Comment est-il venu : {m.comment || "—"}</p>
                            <p>📝 Infos : {m.infos_supplementaires || "—"}</p>

                            <div className="mt-auto">
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

      {/* === VUE TABLE === */}
      {view === "table" && (
        <div className="w-full max-w-5xl overflow-x-auto transition duration-200">
          <table className="w-full text-sm text-left text-white border-separate border-spacing-0">
            <thead className="bg-gray-200 text-gray-800 text-sm uppercase rounded-t-lg">
              <tr>
                <th className="px-4 py-2 rounded-l-lg">Nom complet</th>
                <th className="px-4 py-2">Téléphone</th>
                <th className="px-4 py-2">Statut</th>
                <th className="px-4 py-2 rounded-r-lg">Détails</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((m) => (
                <tr key={m.id} className="hover:bg-white/10 transition duration-150">
                  <td className="px-4 py-2 border-l-4" style={{ borderLeftColor: getBorderColor(m) }}>
                    {m.prenom} {m.nom}
                  </td>
                  <td className="px-4 py-2">{m.telephone}</td>
                  <td className="px-4 py-2">
                    <select
                      value={m.statut}
                      onChange={(e) => handleChangeStatus(m.id, e.target.value)}
                      className="border rounded-md px-2 py-1 text-sm w-full text-gray-800"
                    >
                      {statusOptions.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => setPopupMember(m)}
                      className="text-orange-400 underline text-sm"
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

      {/* ✅ Popup pour table */}
      {popupMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 transition-all duration-200">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md relative overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setPopupMember(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl"
            >
              ✖
            </button>

            <div className="flex flex-col flex-grow">
              <h2 className="text-xl font-bold mb-2 text-indigo-700">
                {popupMember.prenom} {popupMember.nom}
              </h2>
              <p className="text-gray-700 text-sm mb-1">📱 {popupMember.telephone || "—"}</p>
              <p className="text-sm text-gray-700 mb-1">💬 WhatsApp: {popupMember.whatsapp || "—"}</p>
              <p className="text-sm text-gray-700 mb-1">🏙 Ville: {popupMember.ville || "—"}</p>
              <p className="text-sm text-gray-700 mb-1">🕊 Statut: {popupMember.statut || "—"}</p>
              <p className="text-sm text-gray-700 mb-1">🧩 Comment est-il venu: {popupMember.comment || "—"}</p>
              <p className="text-sm text-gray-700 mb-1">📝 Infos: {popupMember.infos_supplementaires || "—"}</p>

              <div className="mt-2">
                <select
                  value={selectedCellules[popupMember.id] || ""}
                  onChange={(e) =>
                    setSelectedCellules((prev) => ({ ...prev, [popupMember.id]: e.target.value }))
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

                {selectedCellules[popupMember.id] && (
                  <div className="mt-2">
                    <BoutonEnvoyer
                      membre={popupMember}
                      cellule={cellules.find(
                        (c) => c.id === selectedCellules[popupMember.id]
                      )}
                      onStatusUpdate={handleStatusUpdateFromEnvoyer}
                      session={session}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
