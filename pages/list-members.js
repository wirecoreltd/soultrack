"use client";

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
  const [members, setMembers] = useState([]);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [detailsOpen, setDetailsOpen] = useState({});
  const [cellules, setCellules] = useState([]);
  const [conseillers, setConseillers] = useState([]);
  const [selectedTargets, setSelectedTargets] = useState({});
  const [selectedTargetType, setSelectedTargetType] = useState({});
  const [view, setView] = useState("card");
  const [popupMember, setPopupMember] = useState(null);
  const [editMember, setEditMember] = useState(null);
  const [session, setSession] = useState(null);
  const [prenom, setPrenom] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [showingToast, setShowingToast] = useState(false);
  const [statusChanges, setStatusChanges] = useState({});

  const showToast = (msg) => {
    setToastMessage(msg);
    setShowingToast(true);
    setTimeout(() => setShowingToast(false), 3500);
  };

  useEffect(() => {
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
    fetchMembers();
    fetchCellules();
    fetchConseillers();
  }, []);

  const fetchMembers = async () => {
    const { data, error } = await supabase
      .from("suivis")
      .select(`
        *,
        statuts_suivis!inner(libelle)
      `)
      .order("suivi_created_at", { ascending: false });

    if (error) console.error(error);
    else setMembers(data);
  };

  const fetchCellules = async () => {
    const { data } = await supabase.from("cellules").select("id, cellule, responsable, telephone");
    if (data) setCellules(data);
  };

  const fetchConseillers = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("id, prenom, nom, telephone")
      .eq("role", "Conseiller");
    if (data) setConseillers(data);
  };

  const updateMemberLocally = (id, extra = {}) => {
    setMembers((prev) => prev.map((m) => (m.suivi_id === id ? { ...m, ...extra } : m)));
  };

  const handleAfterSend = (memberId, type, cible, newStatut) => {
    const update = { statut: newStatut || "actif" };
    if (type === "cellule") {
      update.cellule_id = cible.id;
      update.cellule_nom = cible.cellule;
    } else if (type === "conseiller") {
      update.conseiller_id = cible.id;
    }
    setMembers((prev) => prev.map((m) => (m.suivi_id === memberId ? { ...m, ...update } : m)));
    showToast("✅ Contact envoyé et suivi enregistré");
  };

  const handleStatusChange = (memberId, value) => {
    setStatusChanges((prev) => ({ ...prev, [memberId]: value }));
    updateMemberLocally(memberId, { statut: value });
  };

  const getBorderColor = (m) => {
    if (m.star) return "#FBC02D";
    if (m.statut === "actif") return "#4285F4";
    if (m.statut === "a déjà son église") return "#f21705";
    if (m.statut === "ancien") return "#999999";
    if (m.statut === "visiteur" || m.statut === "veut rejoindre ICC") return "#34A853";
    return "#ccc";
  };

  const formatDate = (dateStr) => {
    try {
      return format(new Date(dateStr), "EEEE d MMMM yyyy", { locale: fr });
    } catch {
      return "";
    }
  };

  const filterBySearch = (list) =>
    list.filter((m) => `${m.membre_prenom || m.prenom} ${m.membre_nom || m.nom}`.toLowerCase().includes(search.toLowerCase()));

  const nouveaux = members.filter((m) => m.statut === "visiteur" || m.statut === "veut rejoindre ICC");
  const anciens = members.filter((m) => m.statut !== "visiteur" && m.statut !== "veut rejoindre ICC");

  const nouveauxFiltres = filterBySearch(filter ? nouveaux.filter((m) => m.statut === filter) : nouveaux);
  const anciensFiltres = filterBySearch(filter ? anciens.filter((m) => m.statut === filter) : anciens);

  const statusOptions = ["actif", "ancien", "visiteur", "veut rejoindre ICC", "a déjà son église"];
  const totalCount = [...nouveauxFiltres, ...anciensFiltres].length;

  const toggleDetails = (id) => setDetailsOpen((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="min-h-screen flex flex-col items-center p-6" style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}>
      {/* Top bar */}
      <div className="w-full max-w-5xl mb-6">
        <div className="flex justify-between items-center">
          <button onClick={() => window.history.back()} className="flex items-center text-white hover:text-gray-200">← Retour</button>
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
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-3 py-2 rounded-lg border text-sm">
            <option value="">Tous les statuts</option>
            {statusOptions.map((s) => (<option key={s}>{s}</option>))}
          </select>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher..." className="px-3 py-2 rounded-lg border text-sm w-48" />
          <span className="text-white text-sm">({totalCount})</span>
        </div>
        <button onClick={() => setView(view === "card" ? "table" : "card")} className="text-white text-sm underline">
          {view === "card" ? "Vue Table" : "Vue Carte"}
        </button>
      </div>

      {/* ==================== VUE CARTE ==================== */}
      {view === "card" && (
        <div className="w-full max-w-5xl space-y-8">
          {nouveauxFiltres.length > 0 && (
            <div>
              <p className="text-white text-lg mb-4 ml-1">💖 Bien aimé venu le {formatDate(nouveauxFiltres[0].suivi_created_at)}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {nouveauxFiltres.map((m) => {
                  const isOpen = detailsOpen[m.suivi_id];
                  return (
                    <div key={m.suivi_id} className="bg-white p-3 rounded-xl shadow-md border-l-4 relative" style={{ borderLeftColor: getBorderColor(m) }}>
                      <span className="absolute top-3 right-[-25px] bg-blue-600 text-white text-[10px] px-6 py-1 rotate-45">Nouveau</span>
                      <div className="flex flex-col items-center">
                        <h2 className="text-lg font-bold text-center">{m.membre_prenom} {m.membre_nom}</h2>
                        <p className="text-sm text-gray-600">📱 {m.membre_telephone || "—"}</p>

                        <button onClick={() => toggleDetails(m.suivi_id)} className="text-orange-500 underline text-sm mt-2">{isOpen ? "Fermer détails" : "Détails"}</button>

                        {isOpen && (
                          <div className="text-gray-700 text-sm mt-3 w-full space-y-2">
                            <p>🏠 Cellule : {m.cellule_nom ? `${m.cellule_nom} - ${m.responsable_nom}` : "—"}</p>
                            <p>👥 Conseiller : {m.conseiller_nom ? `${m.conseiller_nom} ${m.conseiller_prenom || ""}` : "—"}</p>
                            <p>💬 WhatsApp : {m.is_whatsapp ? "Oui" : "Non"}</p>
                            <p>🏙 Ville : {m.ville || "—"}</p>
                            <p>❓Besoin : {m.besoin && Array.isArray(JSON.parse(m.besoin)) ? JSON.parse(m.besoin).join(", ") : "—"}</p>
                            <p>📝 Infos : {m.infos_supplementaires || "—"}</p>

                            {/* ENVOYER À */}
                            <div className="mt-2">
                              <label className="font-semibold text-sm">Envoyer à :</label>
                              <select
                                value={selectedTargetType[m.suivi_id] || ""}
                                onChange={(e) => setSelectedTargetType((prev) => ({ ...prev, [m.suivi_id]: e.target.value }))}
                                className="mt-1 w-full border rounded px-2 py-1 text-sm"
                              >
                                <option value="">-- Choisir une option --</option>
                                <option value="cellule">Une Cellule</option>
                                <option value="conseiller">Un Conseiller</option>
                              </select>

                              {(selectedTargetType[m.suivi_id] === "cellule" || selectedTargetType[m.suivi_id] === "conseiller") && (
                                <select
                                  value={selectedTargets[m.suivi_id] || ""}
                                  onChange={(e) => setSelectedTargets((prev) => ({ ...prev, [m.suivi_id]: e.target.value }))}
                                  className="mt-1 w-full border rounded px-2 py-1 text-sm"
                                >
                                  <option value="">-- Choisir {selectedTargetType[m.suivi_id]} --</option>
                                  {selectedTargetType[m.suivi_id] === "cellule"
                                    ? cellules.map((c) => (<option key={c.id} value={c.id}>{c.cellule} ({c.responsable})</option>))
                                    : conseillers.map((c) => (<option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>))
                                  }
                                </select>
                              )}

                              {selectedTargets[m.suivi_id] && (
                                <div className="pt-2">
                                  <BoutonEnvoyer
                                    membre={m}
                                    type={selectedTargetType[m.suivi_id]}
                                    cible={selectedTargetType[m.suivi_id] === "cellule" ? cellules.find((c) => c.id === selectedTargets[m.suivi_id]) : conseillers.find((c) => c.id === selectedTargets[m.suivi_id])}
                                    onEnvoyer={(id) => handleAfterSend(
                                      id,
                                      selectedTargetType[m.suivi_id],
                                      selectedTargetType[m.suivi_id] === "cellule" ? cellules.find((c) => c.id === selectedTargets[m.suivi_id]) : conseillers.find((c) => c.id === selectedTargets[m.suivi_id])
                                    )}
                                    session={session}
                                    showToast={showToast}
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

      {/* Vue table */}
      {view === "table" && (
        <div className="w-full max-w-6xl overflow-x-auto transition duration-200">
          <table className="w-full text-sm text-left border-separate border-spacing-0">
            <thead className="bg-gray-200 text-gray-800 text-sm uppercase">
              <tr>
                <th className="px-4 py-2 rounded-tl-lg">Nom complet</th>
                <th className="px-4 py-2">Téléphone</th>
                <th className="px-4 py-2">Cellule</th>
                <th className="px-4 py-2">Conseiller</th>
                <th className="px-4 py-2">Statut</th>
                <th className="px-4 py-2 rounded-tr-lg">Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.suivi_id} className="border-b border-gray-300">
                  <td className="px-4 py-2 border-l-4 rounded-l-md text-white">{m.membre_prenom} {m.membre_nom}</td>
                  <td className="px-4 py-2 text-white">{m.membre_telephone || "—"}</td>
                  <td className="px-4 py-2 text-white">{m.cellule_nom ? `${m.cellule_nom} - ${m.responsable_nom}` : "—"}</td>
                  <td className="px-4 py-2 text-white">{m.conseiller_nom ? `${m.conseiller_nom} ${m.conseiller_prenom || ""}` : "—"}</td>
                  <td className="px-4 py-2 text-white">{m.statut || "—"}</td>
                  <td className="px-4 py-2 flex items-center gap-2">
                    <button onClick={() => setPopupMember(popupMember?.suivi_id === m.suivi_id ? null : m)} className="text-orange-500 underline text-sm">
                      {popupMember?.suivi_id === m.suivi_id ? "Fermer détails" : "Détails"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
            setMembers((prev) => prev.map((m) => (m.suivi_id === updated.suivi_id ? updated : m)));
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
  );
}
