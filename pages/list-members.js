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
import { useSearchParams } from "next/navigation";

export default function ListMembers() {
  const [members, setMembers] = useState([]);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [detailsOpen, setDetailsOpen] = useState({});
  const [cellules, setCellules] = useState([]);
  const [conseillers, setConseillers] = useState([]);
  const [view, setView] = useState("card");
  const [popupMember, setPopupMember] = useState(null);
  const [editMember, setEditMember] = useState(null);
  const [session, setSession] = useState(null);
  const [prenom, setPrenom] = useState("");
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const conseillerIdFromUrl = searchParams.get("conseiller_id");

  const [selectedTargets, setSelectedTargets] = useState({});
  const [selectedTargetType, setSelectedTargetType] = useState({});
  const [statusChanges, setStatusChanges] = useState({});

  const [toastMessage, setToastMessage] = useState("");
  const [showingToast, setShowingToast] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setShowingToast(true);
    setTimeout(() => setShowingToast(false), 3500);
  };

  const statutLabels = {
    1: "En cours",
    2: "En attente",
    3: "Intégrer",
    4: "Refus"
  };

  // -------------------- FETCH --------------------
  const fetchMembers = async (profile = null) => {
    setLoading(true);
    try {
      let query = supabase.from("v_membres_full").select("*").order("created_at", { ascending: false });

      if (conseillerIdFromUrl) query = query.eq("conseiller_id", conseillerIdFromUrl);
      else if (profile?.role === "Conseiller") query = query.eq("conseiller_id", profile.id);

      const { data, error } = await query;
      if (error) throw error;
      setMembers(data || []);
    } catch (err) {
      console.error("Erreur fetchMembers:", err);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCellules = async () => {
    const { data } = await supabase.from("cellules").select("id, cellule, responsable, telephone");
    if (data) setCellules(data);
  };

  const fetchConseillers = async () => {
    const { data } = await supabase.from("profiles").select("id, prenom, nom, telephone").eq("role", "Conseiller");
    if (data) setConseillers(data);
  };

  useEffect(() => {
    const fetchSessionAndProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      if (session?.user) {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, prenom, role")
          .eq("id", session.user.id)
          .single();
        if (profileError) console.error(profileError);
        else {
          setPrenom(profileData.prenom || "");
          await fetchMembers(profileData);
        }
      } else {
        await fetchMembers();
      }

      fetchCellules();
      fetchConseillers();
    };

    fetchSessionAndProfile();
  }, []);

  // -------------------- UTILS --------------------
  const updateMemberLocally = (id, extra = {}) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...extra } : m)));
  };

  // -------------------- HANDLE STATUS CHANGE --------------------
  const handleStatusChange = async (memberId, newStatus) => {
    // Immediate local update for instant UI feedback
    updateMemberLocally(memberId, { statut: newStatus });
    try {
      const { error } = await supabase.from("membres").update({ statut: newStatus }).eq("id", memberId);
      if (error) throw error;
      showToast("✅ Statut mis à jour");
    } catch (err) {
      console.error("Erreur update statut:", err);
      showToast("⚠️ Erreur lors de la mise à jour du statut");
    }
  };

  // -------------------- HANDLE AFTER SEND --------------------
  const handleAfterSend = async (memberId, type, cible, newStatut = "ancien") => {
    try {
      const membre = members.find((m) => m.id === memberId);
      if (!membre) return;

      // Préparer l'objet de mise à jour
      const update = { statut: newStatut };
      if (type === "cellule") {
        update.cellule_id = cible.id;
        update.cellule_nom = cible.cellule;
      } else if (type === "conseiller") {
        update.conseiller_id = cible.id;
      }

      // 1️⃣ Mise à jour locale immédiate (pour que l'UI change sans refresh)
      updateMemberLocally(memberId, update);

      // 2️⃣ Mettre à jour la base
      const { error: updateError } = await supabase.from("membres").update(update).eq("id", memberId);
      if (updateError) throw updateError;

      // 3️⃣ Ajouter un suivi
      const suiviData = {
        membre_id: memberId,
        cellule_id: type === "cellule" ? cible.id : null,
        conseiller_id: type === "conseiller" ? cible.id : null,
        statut: "envoye",
        created_at: new Date().toISOString(),
        prenom: membre.prenom,
        nom: membre.nom,
        statut_membre: membre.statut,
        besoin: membre.besoin,
        infos_supplementaires: membre.infos_supplementaires,
        telephone: membre.telephone,
        cellule_nom: membre.cellule_nom,
        responsable: membre.responsable_prenom ? `${membre.responsable_prenom} ${membre.responsable_nom}` : null,
        is_whatsapp: membre.is_whatsapp,
        ville: membre.ville,
        commentaire_suivis: "",
      };
      const { error: suiviError } = await supabase.from("suivis_membres").insert([suiviData]);
      if (suiviError) throw suiviError;

      showToast("✅ Contact envoyé et suivi enregistré");
    } catch (err) {
      console.error("Erreur handleAfterSend:", err);
      showToast("❌ Une erreur est survenue lors de l'envoi");
    }
  };

  const getBorderColor = (m) => {
    const status = m.statut || "";
    const suiviStatus = m.suivi_statut_libelle || "";

    if (status === "refus" || suiviStatus === "refus") return "#f56f22";
    if (status === "actif" || suiviStatus === "actif") return "#4285F4";
    if (status === "a déjà son église" || suiviStatus === "a déjà son église") return "#f21705";
    if (status === "ancien" || suiviStatus === "ancien") return "#999999";
    if (status === "visiteur" || suiviStatus === "visiteur") return "#34A853";
    if (status === "veut rejoindre ICC" || suiviStatus === "veut rejoindre ICC") return "#34A853";
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
    list.filter((m) => `${m.prenom} ${m.nom}`.toLowerCase().includes(search.toLowerCase()));

  const nouveaux = members.filter((m) => m.statut === "visiteur" || m.statut === "veut rejoindre ICC");
  const anciens = members.filter((m) => m.statut !== "visiteur" && m.statut !== "veut rejoindre ICC");

  const nouveauxFiltres = filterBySearch(
    filter
      ? nouveaux.filter((m) =>
          m.statut === filter ||
          m.suivi_statut_libelle === filter ||
          (m.statut_suivis_actuel && statutLabels[m.statut_suivis_actuel] === filter)
        )
      : nouveaux
  );

  const anciensFiltres = filterBySearch(
    filter
      ? anciens.filter((m) =>
          m.statut === filter ||
          m.suivi_statut_libelle === filter ||
          (m.statut_suivis_actuel && statutLabels[m.statut_suivis_actuel] === filter)
        )
      : anciens
  );

  const statusOptions = ["actif", "ancien", "visiteur", "veut rejoindre ICC", "refus", "integrer", "En cours", "a déjà son église"];
  const totalCount = [...nouveauxFiltres, ...anciensFiltres].length;

  const toggleDetails = (id) => setDetailsOpen((prev) => ({ ...prev, [id]: !prev[id] }));

  // -------------------- RETURN --------------------
  return (
    <div className="min-h-screen flex flex-col items-center p-6" style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}>
      {/* Top bar */}
      <div className="w-full max-w-5xl mb-6">
        <div className="flex justify-between items-center">
          <button onClick={() => window.history.back()} className="flex items-center text-white hover:text-black-200">← Retour</button>
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
        <p className="text-white text-lg font-light italic max-w-xl mx-auto">Chaque personne a une valeur infinie. Ensemble, nous avançons ❤️</p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-center w-full max-w-5xl mb-4">
        <div className="flex items-center space-x-2">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-3 py-2 rounded-lg border text-sm">
            <option value="">Tous les statuts</option>
            {statusOptions.map((s) => <option key={s}>{s}</option>)}
          </select>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher..." className="px-3 py-2 rounded-lg border text-sm w-48"/>
          <span className="text-white text-sm">({totalCount})</span>
        </div>
        <button onClick={() => setView(view === "card" ? "table" : "card")} className="text-white text-sm underline">
          {view === "card" ? "Vue Table" : "Vue Carte"}
        </button>
      </div>

      {/* ==================== VUE CARTE ==================== */}
      {view === "card" && (
        <div className="w-full max-w-5xl space-y-8">
          {/* Nouveaux Membres */}
          {nouveauxFiltres.length > 0 && (
            <div>
              <p className="text-white text-lg mb-4 ml-1">💖 Bien aimé venu le {formatDate(nouveauxFiltres[0].created_at)}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {nouveauxFiltres.map((m) => {
                  const isOpen = detailsOpen[m.id];
                  return (
                    <div key={m.id} className="bg-white p-3 rounded-xl shadow-md border-l-4 relative" style={{ borderLeftColor: getBorderColor(m) }}>
                      {m.star && <span className="absolute top-3 right-3 text-yellow-400 text-xl">⭐</span>}
                      <div className="flex flex-col items-center">
                        <h2 className="text-lg font-bold text-center">{m.prenom} {m.nom}</h2>
                        <div className="flex flex-col space-y-1 text-sm text-black-600 w-full items-center">
                          <div className="flex justify-center items-center space-x-2"><span>📱</span><span>{m.telephone || "—"}</span></div>
                          <div className="flex justify-center items-center space-x-2"><span>🕊</span><span>Statut : {m.statut || "—"}</span></div>
                          <div className="flex justify-center items-center space-x-2"><span>🏠</span><span>Cellule : {m.cellule_nom || "—"}</span></div>
                          <div className="flex justify-center items-center space-x-2"><span>👤</span><span>Conseiller : {m.conseiller_prenom ? `${m.conseiller_prenom} ${m.conseiller_nom}` : "—"}</span></div>
                        </div>

                        {/* Statut */}
                        <select
                          value={statusChanges[m.id] ?? m.statut ?? ""}
                          onChange={async (e) => {
                            const newStatus = e.target.value;
                            setStatusChanges((prev) => ({ ...prev, [m.id]: newStatus }));
                            try {
                              await supabase.from("membres").update({ statut: newStatus }).eq("id", m.id);
                              updateMemberLocally(m.id, { statut: newStatus });
                              showToast("✅ Statut mis à jour");
                            } catch (err) {
                              console.error(err);
                              showToast("⚠️ Erreur lors de la mise à jour du statut");
                            }
                          }}
                          className="border rounded-md px-2 py-1 text-sm w-full mt-2"
                        >
                          <option value="">-- Choisir un statut --</option>
                          {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>

                        {/* Envoi à */}
                        <div className="mt-2">
                          <label className="font-semibold text-sm">Envoyer à :</label>
                          <select
                            value={selectedTargetType[m.id] || ""}
                            onChange={(e) => setSelectedTargetType((prev) => ({ ...prev, [m.id]: e.target.value }))}
                            className="mt-1 w-full border rounded px-2 py-1 text-sm"
                          >
                            <option value="">-- Choisir une option --</option>
                            <option value="cellule">Une Cellule</option>
                            <option value="conseiller">Un Conseiller</option>
                          </select>

                          {(selectedTargetType[m.id] === "cellule" || selectedTargetType[m.id] === "conseiller") && (
                            <select
                              value={selectedTargets[m.id] || ""}
                              onChange={(e) => setSelectedTargets((prev) => ({ ...prev, [m.id]: e.target.value }))}
                              className="mt-1 w-full border rounded px-2 py-1 text-sm"
                            >
                              <option value="">-- Choisir {selectedTargetType[m.id]} --</option>
                              {selectedTargetType[m.id] === "cellule"
                                ? cellules.map((c) => <option key={c.id} value={c.id}>{c.cellule} ({c.responsable})</option>)
                                : conseillers.map((c) => <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>)
                              }
                            </select>
                          )}

                          {selectedTargets[m.id] && (
                            <div className="pt-2">
                              <BoutonEnvoyer
                                membre={m}
                                type={selectedTargetType[m.id]}
                                cible={selectedTargetType[m.id] === "cellule" ? cellules.find((c) => c.id === selectedTargets[m.id]) : conseillers.find((c) => c.id === selectedTargets[m.id])}
                                onEnvoyer={(id) => handleAfterSend(id, selectedTargetType[m.id], selectedTargetType[m.id] === "cellule" ? cellules.find((c) => c.id === selectedTargets[m.id]) : conseillers.find((c) => c.id === selectedTargets[m.id]))}
                                session={session}
                                showToast={showToast}
                              />
                            </div>
                          )}
                        </div>

                        {/* Modifier contact */}
                        <button onClick={() => setEditMember(m)} className="text-blue-600 text-sm mt-6 block mx-auto">✏️ Modifier le contact</button>
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
          <table className="w-full text-sm text-left border-separate border-spacing-0">
            <thead className="bg-gray-200 text-black-800 text-sm uppercase">
              <tr>
                <th className="px-4 py-2 rounded-tl-lg">Nom complet</th>
                <th className="px-4 py-2">Téléphone</th>
                <th className="px-4 py-2">Statut</th>
                <th className="px-4 py-2 rounded-tr-lg">Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* Nouveaux Membres */}
              {nouveauxFiltres.length > 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-2 text-white font-semibold">
                    💖 Bien aimé venu le {formatDate(nouveauxFiltres[0].created_at)}
                  </td>
                </tr>
              )}
              {nouveauxFiltres.map((m) => (
                <tr key={m.id} className="border-b border-gray-300">
                  <td
                    className="px-4 py-2 border-l-4 rounded-l-md flex items-center gap-2 text-white"
                    style={{ borderLeftColor: getBorderColor(m) }}
                  >
                    {m.prenom} {m.nom} {m.star && <span className="text-yellow-400 ml-1">⭐</span>}
                    <span className="bg-blue-500 text-white text-xs px-1 rounded ml-2">Nouveau</span>
                  </td>
                  <td className="px-4 py-2 text-white">{m.telephone || "—"}</td>
                  <td className="px-4 py-2 text-white">{m.statut || "—"}</td>
                  <td className="px-4 py-2 flex items-center gap-2">
                    <button
                      onClick={() => setPopupMember(popupMember?.id === m.id ? null : {...m})}
                      className="text-orange-500 underline text-sm"
                    >
                      {popupMember?.id === m.id ? "Fermer détails" : "Détails"}
                    </button>
                      <button
                          onClick={() => setEditMember(m)}
                          className="text-blue-600 underline text-sm"
                        >
                          Modifier
                        </button>
                  </td>
                </tr>
              ))}

              {/* Anciens Membres */}
              {anciensFiltres.length > 0 && (
                <>
                  <tr>
                    <td colSpan={4} className="px-4 py-2 font-semibold text-lg text-white">
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
                      <td
                        className="px-4 py-2 border-l-4 rounded-l-md flex items-center gap-2 text-white"
                        style={{ borderLeftColor: getBorderColor(m) }}
                      >
                        {m.prenom} {m.nom} {m.star && <span className="text-yellow-400 ml-1">⭐</span>}
                      </td>
                      <td className="px-4 py-2 text-white">{m.telephone || "—"}</td>
                      <td className="px-4 py-2 text-white">{m.statut || "—"}</td>
                      <td className="px-4 py-2 flex items-center gap-2">
                        <button
                          onClick={() => setPopupMember(popupMember?.id === m.id ? null : m)}
                          className="text-orange-500 underline text-sm"
                        >
                          {popupMember?.id === m.id ? "Fermer détails" : "Détails"}
                        </button>
                        <button
                          onClick={() => setEditMember(m)}
                          className="text-blue-600 underline text-sm"
                        >
                          Modifier
                        </button>
                      </td>
                    </tr>
                  ))}
                </>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Popups */}
      {popupMember && (
        <DetailsPopup
          membre={popupMember}
          onClose={() => setPopupMember(null)}
          statusOptions={statusOptions}
          cellules={cellules}
          conseillers={conseillers}
          handleAfterSend={handleAfterSend}
          handleChangeStatus={() => {}}
          session={session}
        />
      )}

      {editMember && (
      <EditMemberPopup
        member={editMember}
        onClose={() => setEditMember(null)}
       onUpdated={(updatedMember) => {
            setMembers((prev) =>
              prev.map((m) => (m.id === updatedMember.id ? updatedMember : m))
            );
            setEditMember(null);
            showToast("✅ Le membre a bien été mis à jour");
          }}

        cellules={cellules}
        conseillers={conseillers}
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
