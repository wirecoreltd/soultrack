"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import Image from "next/image";
import BoutonEnvoyer from "../components/BoutonEnvoyer";
import LogoutLink from "../components/LogoutLink";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import DetailsPopup from "../components/DetailsPopup";
import EditMemberPopup from "../components/EditMemberPopup";

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
  const [editMember, setEditMember] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // ========================== LOADING SESSION + PROFILE ==========================
  useEffect(() => {
    const fetchSessionAndProfile = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);

      if (session?.user) {
        const { data } = await supabase
          .from("profiles")
          .select("prenom")
          .eq("id", session.user.id)
          .single();
        if (data) setPrenom(data.prenom);
      }
    };

    fetchSessionAndProfile();
    fetchMembers();
    fetchCellules();
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [refreshKey]);

  // ========================== FETCH MEMBERS ==========================
  const fetchMembers = async () => {
    const { data } = await supabase
      .from("membres")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setMembers(data);
  };

  const fetchCellules = async () => {
    const { data } = await supabase
      .from("cellules")
      .select("id, cellule, responsable, telephone");
    if (data) setCellules(data);
  };

  // ========================== UPDATE STATUS ==========================
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

  // ========================== FORMATAGE ==========================
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

  // ========================== FILTERS ==========================
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

  const statusOptions = [
    "actif",
    "Integrer",
    "ancien",
    "veut rejoindre ICC",
    "visiteur",
    "a déjà mon église",
  ];

  const totalCount = [...nouveauxFiltres, ...anciensFiltres].length;

  const toggleDetails = (id) => {
    setDetailsOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // ========================== BLOC PRINCIPAL ==========================
  return (
    <div
      className="min-h-screen flex flex-col items-center p-6"
      style={{
        background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)",
      }}
    >
      {/* TOP BAR */}
      <div className="w-full max-w-5xl mb-6">
        <div className="flex justify-between items-center">
          <button
            onClick={() => window.history.back()}
            className="flex items-center text-white hover:text-gray-200"
          >
            ← Retour
          </button>
          <LogoutLink className="bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20" />
        </div>
        <div className="flex justify-end mt-2">
          <p className="text-orange-200 text-sm">
            👋 Bienvenue {prenom || "cher membre"}
          </p>
        </div>
      </div>

      {/* LOGO */}
      <div className="mb-4">
        <Image src="/logo.png" alt="SoulTrack Logo" className="w-20 h-18 mx-auto" />
      </div>

      {/* TITRE */}
      <div className="text-center mb-4">
        <h1 className="text-3xl font-bold text-white mb-2">Liste des Membres</h1>
        <p className="text-white text-lg font-light italic max-w-xl mx-auto">
          Chaque personne a une valeur infinie. Ensemble, nous avançons ❤️
        </p>
      </div>

      {/* SEARCH ZONE */}
      <div className="flex flex-col sm:flex-row justify-between items-center w-full max-w-5xl mb-4">
        <div className="flex items-center space-x-2">
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
            placeholder="Rechercher..."
            className="px-3 py-2 rounded-lg border text-sm w-48"
          />

          <span className="text-white text-sm">({totalCount})</span>
        </div>

        <button
          onClick={() => setView(view === "card" ? "table" : "card")}
          className="text-white text-sm underline"
        >
          {view === "card" ? "Vue Table" : "Vue Carte"}
        </button>
      </div>

      {/* ================================ VUE CARTE ================================ */}
      {view === "card" && (
        <div className="w-full max-w-5xl space-y-8">
          {/* NOUVEAUX MEMBRES */}
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
                      className="bg-white p-3 rounded-xl shadow-md border-l-4 relative"
                      style={{ borderLeftColor: getBorderColor(m) }}
                    >
                      <span className="absolute top-3 right-[-25px] bg-blue-600 text-white text-[10px] px-6 py-1 rotate-45">
                        Nouveau
                      </span>
                      <div className="flex flex-col items-center">
                        <h2 className="text-lg font-bold text-center">
                          {m.prenom} {m.nom}
                        </h2>
                        <p className="text-sm text-gray-600">📱 {m.telephone || "—"}</p>
                        <p className="text-sm text-gray-600">🕊 Statut : {m.statut}</p>
                        <button
                          onClick={() => toggleDetails(m.id)}
                          className="text-orange-500 underline text-sm"
                        >
                          {isOpen ? "Fermer détails" : "Détails"}
                        </button>

                        {isOpen && (
                          <div className="text-gray-700 text-sm mt-3 w-full space-y-2">
                            <p>💬 WhatsApp : {m.is_whatsapp ? "Oui" : "Non"}</p>
                            <p>🏙 Ville : {m.ville || "—"}</p>
                            <p>🧩 Venu : {m.venu || "—"}</p>
                            <p>
                              ❓ Besoin :{" "}
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

                            <p className="font-semibold text-green-600">Cellule :</p>
                            <select
                              value={selectedCellules[m.id] || ""}
                              onChange={(e) =>
                                setSelectedCellules((prev) => ({
                                  ...prev,
                                  [m.id]: e.target.value,
                                }))
                              }
                              className="border rounded px-2 py-1 text-sm w-full"
                            >
                              <option value="">-- Choisir cellule --</option>
                              {cellules.map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.cellule} ({c.responsable})
                                </option>
                              ))}
                            </select>

                            {selectedCellules[m.id] && (
                              <div className="pt-2">
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

          {/* ANCIENS MEMBRES */}
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
                      className="bg-white p-3 rounded-xl shadow-md border-l-4"
                      style={{ borderLeftColor: getBorderColor(m) }}
                    >
                      <div className="flex flex-col items-center">
                        <h2 className="text-lg font-bold text-center">
                          {m.prenom} {m.nom}{" "}
                          {m.star && <span className="text-yellow-400 ml-1">⭐</span>}
                        </h2>
                        <p className="text-sm text-gray-600">📱 {m.telephone || "—"}</p>
                        <p className="text-sm text-gray-600">🕊 Statut : {m.statut}</p>
                        <button
                          onClick={() => toggleDetails(m.id)}
                          className="text-orange-500 underline text-sm"
                        >
                          {isOpen ? "Fermer détails" : "Détails"}
                        </button>

                        {isOpen && (
                          <div className="text-gray-700 text-sm mt-3 w-full space-y-2">
                            <p>💬 WhatsApp : {m.is_whatsapp ? "Oui" : "Non"}</p>
                            <p>🏙 Ville : {m.ville || "—"}</p>
                            <p>🧩 Venu : {m.venu || "—"}</p>
                            <p>📝 Infos : {m.infos_supplementaires || "—"}</p>
                            <p className="font-semibold">🏠 Cellule :</p>
                            <p>
                              {(() => {
                                const cellule = cellules.find(
                                  (c) => c.id === m.cellule_id
                                );
                                return cellule
                                  ? `${cellule.cellule} (${cellule.responsable || "—"})`
                                  : "—";
                              })()}
                            </p>

                            <div className="text-center mt-3">
                              <button
                                onClick={() => setEditMember(m)}
                                className="text-blue-600 underline text-sm"
                              >
                                ✏️ Modifier le contact
                              </button>
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

      {/* ================================ VUE TABLE ================================ */}
      {view === "table" && (
        <div className="w-full max-w-6xl overflow-x-auto">
          <table className="w-full text-sm text-left text-white">
            <thead className="bg-gray-200 text-gray-800 uppercase">
              <tr>
                <th className="px-4 py-2">Nom complet</th>
                <th className="px-4 py-2">Téléphone</th>
                <th className="px-4 py-2">Statut</th>
                <th className="px-4 py-2">Détails</th>
              </tr>
            </thead>
            <tbody>
              {/* NOUVEAUX */}
              {nouveauxFiltres.length > 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-2 font-semibold text-white">
                    💖 Bien aimé venu le {formatDate(nouveauxFiltres[0].created_at)}
                  </td>
                </tr>
              )}
              {nouveauxFiltres.map((m) => (
                <tr key={m.id} className="border-b border-blue-300">
                  <td className="px-4 py-2 border-l-4" style={{ borderLeftColor: getBorderColor(m) }}>
                    {m.prenom} {m.nom}{" "}
                    <span className="bg-blue-500 text-white text-xs px-1 rounded">Nouveau</span>
                  </td>
                  <td className="px-4 py-2">{m.telephone}</td>
                  <td className="px-4 py-2">{m.statut}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => setPopupMember(popupMember?.id === m.id ? null : m)}
                      className="underline text-orange-500"
                    >
                      {popupMember?.id === m.id ? "Fermer" : "Détails"}
                    </button>
                  </td>
                </tr>
              ))}

              {/* ANCIENS */}
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
                    <tr key={m.id} className="border-b border-gray-300">
                      <td className="px-4 py-2 border-l-4" style={{ borderLeftColor: getBorderColor(m) }}>
                        {m.prenom} {m.nom}
                      </td>
                      <td className="px-4 py-2">{m.telephone}</td>
                      <td className="px-4 py-2">{m.statut}</td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => setPopupMember(popupMember?.id === m.id ? null : m)}
                          className="underline text-orange-500"
                        >
                          {popupMember?.id === m.id ? "Fermer" : "Détails"}
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

      {/* ========================== EDIT MEMBER POPUP ========================== */}
      {editMember && (
        <EditMemberPopup
          member={editMember}
          cellules={cellules}
          onClose={() => {
            setEditMember(null);
            setRefreshKey((prev) => prev + 1);
          }}
          onUpdateMember={() => setRefreshKey((prev) => prev + 1)}
        />
      )}
    </div>
  );
}
