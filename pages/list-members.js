       
"use client";

/**
 * Page: Liste des Membres
 * Description: Affiche les membres sous forme de carte ou tableau avec filtres et envoi WhatsApp.
 */

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import Image from "next/image";
import BoutonEnvoyer from "../components/BoutonEnvoyer";
import LogoutLink from "../components/LogoutLink";
import DetailsPopup from "../components/DetailsPopup";
import EditMemberPopup from "../components/EditMemberPopup";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function ListMembers() {
  // --- States principaux ---
  const [members, setMembers] = useState([]);
  const [cellules, setCellules] = useState([]);
  const [conseillers, setConseillers] = useState([]);
  const [suivisParConseiller, setSuivisParConseiller] = useState([]);
  const [detailsOpen, setDetailsOpen] = useState({});
  const [selectedTargets, setSelectedTargets] = useState({});
  const [selectedTargetType, setSelectedTargetType] = useState({});
  const [view, setView] = useState("card");
  const [popupMember, setPopupMember] = useState(null);
  const [editMember, setEditMember] = useState(null);
  const [session, setSession] = useState(null);
  const [prenom, setPrenom] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [showingToast, setShowingToast] = useState(false);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [statusChanges, setStatusChanges] = useState({});

  // --- Toast ---
  const showToast = (msg) => {
    setToastMessage(msg);
    setShowingToast(true);
    setTimeout(() => setShowingToast(false), 3500);
  };

  const statusOptions = [
  "actif",
  "ancien",
  "visiteur",
  "veut rejoindre ICC",
  "a déjà son église"
];     

  // --- Fetch membres ---
  const fetchMembers = async () => {
    const { data, error } = await supabase
      .from("suivis_membres")
      .select("*")
      .order("suivi_created_at", { ascending: false });

    if (error) console.error(error);
    else {
      setMembers(
        data.map((m) => ({
          ...m,
          conseiller_nom: m.conseiller_nom || null,
        }))
      );
    }
  };

  // --- Fetch cellules ---
  const fetchCellules = async () => {
    const { data } = await supabase
      .from("cellules")
      .select("id, cellule, responsable, telephone");
    if (data) setCellules(data);
  };

  // --- Fetch conseillers ---
  const fetchConseillers = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("id, prenom, nom, telephone")
      .eq("role", "Conseiller");
    if (data) setConseillers(data);
  };

  // --- Fetch nombre de contacts assignés par conseiller ---
  const fetchSuivisParConseiller = async () => {
    try {
      const { data: conseillersData, error: conseillersError } = await supabase
        .from("profiles")
        .select("id, prenom, nom")
        .eq("role", "Conseiller");

      if (conseillersError) throw conseillersError;

      const conseillersIds = conseillersData.map((c) => c.id);

      const { data: membresData, error: membresError } = await supabase
        .from("membres")
        .select("id, conseiller_id")
        .in("conseiller_id", conseillersIds);

      if (membresError) throw membresError;

      const countMap = {};
      membresData.forEach((m) => {
        countMap[m.conseiller_id] = (countMap[m.conseiller_id] || 0) + 1;
      });

      setSuivisParConseiller(
        conseillersData.map((c) => ({
          ...c,
          totalContacts: countMap[c.id] || 0,
        }))
      );
    } catch (err) {
      console.error("Erreur fetchSuivisParConseiller:", err.message);
    }
  };

  // --- useEffect initial ---
  useEffect(() => {
    fetchMembers();
    fetchCellules();
    fetchConseillers();
    fetchSuivisParConseiller();

    // Fetch session utilisateur
    const fetchSessionAndProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
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
  }, []);

  // --- Utilitaires ---
  const getContactsAssignedToConseiller = (id) => {
    if (!id || !suivisParConseiller) return 0;
    const conseiller = suivisParConseiller.find((c) => c.id === id);
    return conseiller ? conseiller.totalContacts : 0;
  };

  const toggleDetails = (id) =>
    setDetailsOpen((prev) => ({ ...prev, [id]: !prev[id] }));

  // --- Filtrage & recherche ---
  const filterBySearch = (list) =>
    list.filter((m) =>
      `${m.membre_prenom} ${m.membre_nom}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );

  const filteredMembers = filter ? members.filter((m) => m.statut_suivis == filter) : members;
  const displayedMembers = filterBySearch(filteredMembers);

  return (    
<div
      className="min-h-screen flex flex-col items-center p-6"
      style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}
    >
      >
  {/* Top bar */}
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
      <p className="text-orange-200 text-sm">👋 Bienvenue {prenom || "cher membre"}</p>
    </div>
  </div>

  <div className="mb-4">
    <Image src="/logo.png" alt="SoulTrack Logo" className="w-20 h-18 mx-auto" />
  </div>

  <div className="text-center mb-4">
    <h1 className="text-3xl font-bold text-white mb-2">Liste des Membres</h1>
    <p className="text-white text-lg font-light italic max-w-xl mx-auto">
      Chaque personne a une valeur infinie. Ensemble, nous avançons ❤️
    </p>
  </div>

  {/* Search & Filter */}
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

  {/* ==================== VUE CARTE ==================== */}
  {view === "card" && (
    <div className="w-full max-w-5xl space-y-8">
      {/* Nouveaux membres */}
      {nouveauxFiltres.length > 0 && (
        <div>
          <p className="text-white text-lg mb-4 ml-1">
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
                    <p className="text-sm text-gray-600">
                      👤 Conseiller : {m.conseiller_nom || "Non assigné"}
                    </p>

                    {/* Statut */}
                    <div className="mt-2 w-full">
                      <label className="text-gray-700 text-sm mr-2">🕊 Statut :</label>
                      <select
                        value={statusChanges[m.id] ?? m.statut ?? ""}
                        onChange={(e) => handleStatusChange(m.id, e.target.value)}
                        className="border rounded-md px-2 py-1 text-sm w-full"
                      >
                        <option value="">-- Choisir un statut --</option>
                        {statusOptions.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Toggle details */}
                    <button
                      onClick={() => toggleDetails(m.id)}
                      className="text-orange-500 underline text-sm mt-2"
                    >
                      {isOpen ? "Fermer détails" : "Détails"}
                    </button>

                    {isOpen && (
                      <div className="text-gray-700 text-sm mt-3 w-full space-y-2">
                        <p>💬 WhatsApp : {m.is_whatsapp ? "Oui" : "Non"}</p>
                        <p>🏙 Ville : {m.ville || "—"}</p>
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

                        {/* Envoi */}
                        <div className="mt-2">
                          <label className="font-semibold text-sm">Envoyer à :</label>
                          <select
                            value={selectedTargetType[m.id] || ""}
                            onChange={(e) =>
                              setSelectedTargetType((prev) => ({
                                ...prev,
                                [m.id]: e.target.value
                              }))
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
                                setSelectedTargets((prev) => ({
                                  ...prev,
                                  [m.id]: e.target.value
                                }))
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
                                      {c.prenom} {c.nom}
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

                          {/* Modifier contact */}
                          <button
                            onClick={() => setEditMember(m)}
                            className="text-blue-600 text-sm mt-6 block mx-auto"
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

      {/* Anciens Membres */}
      {anciensFiltres.length > 0 && (
        <div className="mt-8">
          <h3 className="text-white text-lg mb-3 font-semibold">
            <span
              style={{
                background: "linear-gradient(to right, #3B82F6, #D1D5DB)",
                WebkitBackgroundClip: "text",
                color: "transparent"
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
                      {m.prenom} {m.nom} {m.star && <span className="text-yellow-400 ml-1">⭐</span>}
                    </h2>
                    <p className="text-sm text-gray-600">📱 {m.telephone || "—"}</p>
                    <p className="text-sm text-gray-600">🕊 Statut : {m.statut}</p>
                    <p className="text-sm text-gray-600">
                      📝 Attribué à : {m.cellule_nom || "—"} – {m.responsable_nom || "—"}
                    </p>
                    <p className="text-white text-sm mt-1">
                      👤 Conseiller : {m.conseiller_nom || "Non assigné"}
                    </p>

                    <button
                      onClick={() => toggleDetails(m.id)}
                      className="text-orange-500 underline text-sm mt-2"
                    >
                      {isOpen ? "Fermer détails" : "Détails"}
                    </button>

                    {isOpen && (
                      <div className="text-gray-700 text-sm mt-3 w-full space-y-2">
                        <p>💬 WhatsApp : {m.is_whatsapp ? "Oui" : "Non"}</p>
                        <p>🏙 Ville : {m.ville || "—"}</p>
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
                        <p>📌 Statut Suivis : {m.statuts_suivis?.libelle || m.statut_suivis || "—"}</p>
                        <p>📝 Commentaire Suivis : {m.commentaire_suivis || "—"}</p>

                        {/* Envoi & modification */}
                        <div className="mt-2">
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
                                      {c.prenom} {c.nom}
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

                          <button
                            onClick={() => setEditMember(m)}
                            className="text-blue-600 text-sm mt-6 block mx-auto"
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

      {/* Popups */}
      {popupMember && (
        <DetailsPopup
          member={popupMember}
          onClose={() => setPopupMember(null)}
          statusOptions={statusOptions}
          cellules={cellules}
          conseillers={conseillers}
          handleAfterSend={handleAfterSend}
          handleChangeStatus={handleStatusChange}
          session={session}
        />
      )}

      {editMember && (
        <EditMemberPopup
          member={editMember}
          cellules={cellules}
          onClose={() => setEditMember(null)}
          onUpdateMember={(updated) => {
            setMembers((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
            setEditMember(null);
          }}
        />
      )}

      {/* Toast */}
      {showingToast && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg">
          {toastMessage}
        </div>
      )}
    </div>
