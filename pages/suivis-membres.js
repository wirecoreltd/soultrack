"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import React from "react";
import supabase from "../lib/supabaseClient";
import LogoutLink from "../components/LogoutLink";
import EditMemberSuivisPopup from "../components/EditMemberSuivisPopup";
import { useMembers } from "../context/MembersContext";
import { useRouter } from "next/navigation";
import HeaderPages from "../components/HeaderPages";
import ProtectedRoute from "../components/ProtectedRoute";
import useChurchScope from "../hooks/useChurchScope";
import Footer from "../components/Footer";
import SuiviPopup from "../components/SuiviPopup";

// ─────────────────────────────────────────────────────────────
// DetailsPopup extrait HORS du composant parent pour éviter
// le re-mount à chaque render (qui causait le scroll instable)
// ─────────────────────────────────────────────────────────────
const DetailsPopup = React.memo(function DetailsPopup({
  m,
  user,
  showRefus,
  openSuiviMemberId,
  setOpenSuiviMemberId,
  setEditMember,
  cellules,
  familles,
  conseillers,
  assignmentsMap,
}) {
  const formatMinistere = (ministere) => {
    if (!ministere) return "—";
    try {
      const parsed = typeof ministere === "string" ? JSON.parse(ministere) : ministere;
      return Array.isArray(parsed) ? parsed.join(", ") : parsed;
    } catch { return "—"; }
  };

  const formatArrayField = (field) => {
    if (!field) return "—";
    try {
      const parsed = typeof field === "string" ? JSON.parse(field) : field;
      return Array.isArray(parsed) ? parsed.join(", ") : parsed;
    } catch { return "—"; }
  };

  const formatDateFr = (dateString) => {
    if (!dateString) return "—";
    const d = new Date(dateString);
    const day = d.getDate().toString().padStart(2, "0");
    const months = ["Janv","Févr","Mars","Avr","Mai","Juin","Juil","Août","Sept","Oct","Nov","Déc"];
    return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const getConseillersForMember = (memberId) => {
    const assigned = assignmentsMap?.[memberId];
    if (assigned && assigned.length > 0) {
      return assigned.map((c, i) => (
        <span key={c.id}>
          {c.prenom} {c.nom}
          {i === 0 && assigned.length > 1 ? " (principal)" : ""}
          {i < assigned.length - 1 ? ", " : ""}
        </span>
      ));
    }
    return "—";
  };

  return (
    <div className="text-black text-sm space-y-2 w-full">

      <div>
        <p className="font-bold text-[#2E3192] mb-1">👤 Identité</p>
        <p>🎗️ Civilité : {m.sexe || "—"}</p>
        <p>⏳ Âge : {m.age || "—"}</p>
        <p>💬 WhatsApp : {m.is_whatsapp ? "Oui" : "Non"}</p>
      </div>
      <hr />

      <div>
        <p className="font-bold text-[#2E3192] mb-1">📊 Suivi</p>
        <p>📅 {m.sexe === "Femme" ? "Arrivée" : "Arrivé"} le : {formatDateFr(m.date_venu)}</p>
        <div className="mt-1">
          <span className="font-semibold">👤 Conseiller(s) : </span>
          {getConseillersForMember(m.id)}
        </div>
      </div>
      <hr />

      <div>
        <p className="font-bold text-[#2E3192] mb-1">🕊 Vie spirituelle</p>
        <p>💧 Baptême d'Eau : {m.bapteme_eau || "—"}</p>
        <p>🔥 Baptême de Feu : {m.bapteme_esprit || "—"}</p>
        <p>🙏 Prière du salut : {m.priere_salut || "—"}</p>
        <p>☀️ Type de conversion : {m.type_conversion || "—"}</p>
        <p>✒️ Formation : {m.Formation || "—"}</p>
        <p>💢 Ministère : {formatMinistere(m.Ministere) || "—"}</p>
      </div>
      <hr />

      <div>
        <p className="font-bold text-[#2E3192] mb-1">🌱 Parcours</p>
        <p>🧩 Comment est-il venu : {m.venu || "—"}</p>
        <p>✨ Raison de la venue : {m.statut_initial ?? m.statut ?? "—"}</p>
        <p>📝 Infos : {m.infos_supplementaires || "—"}</p>
      </div>
      <hr />

      <div>
        <p className="font-bold text-[#2E3192] mb-1">❤️‍🩹 Soin pastoral</p>
        <p>❓ Difficultés / Besoins : {formatArrayField(m.besoin)}</p>
        <div className="flex justify-center">
          <button
            onClick={() => setOpenSuiviMemberId(m.id)}
            className="mt-2 text-sm bg-[#333699] text-amber-300 px-3 py-1 rounded"
          >
            💡 Ajouter / Voir suivis
          </button>
        </div>

        {openSuiviMemberId === m.id && (
          <SuiviPopup
            member={m}
            onClose={() => setOpenSuiviMemberId(null)}
            user={user}
          />
        )}
      </div>

      {!showRefus && (
        <div className="mt-4 rounded-xl w-full shadow-md p-4 bg-white">
          <button
            onClick={() => setEditMember(m)}
            className="w-full py-2 rounded-md bg-white text-orange-500 shadow-md"
          >
            ✏️ Modifier le contact
          </button>
        </div>
      )}
    </div>
  );
});

// ─────────────────────────────────────────────────────────────

export default function SuivisMembres() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "Conseiller", "ResponsableCellule", "ResponsableFamilles", "ResponsableIntegration"]}>
      <SuivisMembresContent />
    </ProtectedRoute>
  );
}

function SuivisMembresContent() {
  const router = useRouter();
  const { profile, loading: scopeLoading, error: scopeError, scopedQuery } = useChurchScope();
  const { members, setAllMembers, updateMember } = useMembers();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [prenom, setPrenom] = useState("");
  const [userProfile, setUserProfile] = useState(null);
  const [DetailsSuivisPopupMember, setDetailsSuivisPopupMember] = useState(null);
  const [statusChanges, setStatusChanges] = useState({});
  const [commentChanges, setCommentChanges] = useState({});
  const [updating, setUpdating] = useState({});
  const [editMember, setEditMember] = useState(null);
  const [showRefus, setShowRefus] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(null);
  const [cellules, setCellules] = useState([]);
  const [familles, setFamilles] = useState([]); // ✅ familles state
  const [conseillers, setConseillers] = useState([]);
  const [openPhoneMenuId, setOpenPhoneMenuId] = useState(null);
  const phoneMenuRef = useRef(null);
  const [openSuiviMemberId, setOpenSuiviMemberId] = useState(null);

  const [assignmentsMap, setAssignmentsMap] = useState({});

  const [view, setView] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("members_view") || "card";
    }
    return "card";
  });

  const toggleDetails = (id) =>
    setDetailsOpen((prev) => (prev === id ? null : id));

  useEffect(() => { localStorage.setItem("members_view", view); }, [view]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (phoneMenuRef.current && !phoneMenuRef.current.contains(event.target)) {
        setOpenPhoneMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ─── fetchAssignments ───
  const fetchAssignments = useCallback(async () => {
    const { data: assignments, error } = await supabase
      .from("suivi_assignments")
      .select("membre_id, conseiller_id, role");

    if (error) { console.error("fetchAssignments error:", error); return; }
    if (!assignments || assignments.length === 0) {
      setAssignmentsMap({});
      return;
    }

    const conseillerIds = [...new Set(assignments.map(a => a.conseiller_id).filter(Boolean))];

    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select("id, prenom, nom")
      .in("id", conseillerIds);

    if (profilesError) { console.error("fetchAssignments profiles error:", profilesError); return; }

    const profileMap = {};
    (profilesData || []).forEach(p => { profileMap[p.id] = p; });

    const map = {};
    assignments.forEach((row) => {
      const profile = profileMap[row.conseiller_id];
      if (!profile) return;
      if (!map[row.membre_id]) map[row.membre_id] = [];
      if (!map[row.membre_id].some(c => c.id === profile.id)) {
        map[row.membre_id].push(profile);
      }
    });

    setAssignmentsMap(map);
  }, []);

  const getConseillersForMember = (memberId) => {
    const assigned = assignmentsMap[memberId];
    if (assigned && assigned.length > 0) {
      return assigned.map((c) => `${c.prenom} ${c.nom}`).join(", ");
    }
    return "—";
  };

  // ─── Realtime ───
  useEffect(() => {
    const channel = supabase
      .channel("realtime:suivi_assignments_suivis")
      .on("postgres_changes", { event: "*", schema: "public", table: "suivi_assignments" }, () => {
        fetchAssignments();
      })
      .subscribe();

    return () => { channel.unsubscribe(); };
  }, [fetchAssignments]);

  useEffect(() => {
    const fetchMembresComplets = async () => {
      setLoading(true);
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) throw new Error("Utilisateur non connecté");

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, prenom, nom, role, roles, eglise_id")
          .eq("id", user.id)
          .single();
        if (profileError || !profileData) throw profileError;

        setPrenom(profileData.prenom || "cher membre");
        setUserProfile(profileData);

        // ─── Fetch cellules ───
        const { data: cellulesData } = await supabase
          .from("cellules")
          .select("id, cellule_full, responsable_id")
          .eq("eglise_id", profileData.eglise_id);
        setCellules(cellulesData || []);

        // ─── Fetch familles ✅ ───
        const { data: famillesData } = await supabase
          .from("familles")
          .select("id, famille_full, responsable_id")
          .eq("eglise_id", profileData.eglise_id);
        setFamilles(famillesData || []);

        // ─── Fetch conseillers ───
        const { data: conseillersData } = await supabase
          .from("profiles")
          .select("id, prenom, nom")
          .eq("role", "Conseiller")
          .eq("eglise_id", profileData.eglise_id);
        setConseillers(conseillersData || []);

        let query = supabase
          .from("membres_complets")
          .select("*")
          .eq("eglise_id", profileData.eglise_id)
          .order("created_at", { ascending: false });

        if (profileData.role === "Conseiller") {
          query = query.eq("conseiller_id", profileData.id);
        } else if (profileData.role === "ResponsableCellule") {
          const celluleIds = cellulesData?.filter(c => c.responsable_id === profileData.id).map(c => c.id) || [];
          if (celluleIds.length > 0) query = query.in("cellule_id", celluleIds);
          else query = query.eq("id", -1);
        }

        const { data, error } = await query;
        if (error) throw error;

        setAllMembers(data || []);
        if (!data || data.length === 0) setMessage("Aucun membre à afficher.");

        await fetchAssignments();

      } catch (err) {
        console.error("❌ Erreur fetchMembresComplets:", err);
        setMessage("Erreur lors de la récupération des membres.");
      } finally {
        setLoading(false);
      }
    };

    fetchMembresComplets();
  }, [setAllMembers, fetchAssignments]);

  const handleCommentChange = (id, value) => {
    setCommentChanges(prev => ({ ...prev, [id]: value }));
    const member = members.find(m => m.id === id);
    if (member) updateMember(id, { ...member, commentaire_suivis: value });
  };

  const getBorderColor = (m) => {
    if (!m) return "#ccc";
    const status = m.statut_suivis ?? m.suivi_statut;
    if (status === 2) return "#FFA500";
    if (status === 3) return "#34A853";
    if (status === 4) return "#FF4B5C";
    if (status === 1) return "#3B82F6";
    return "#ccc";
  };

  const updateSuivi = async (id) => {
    const newComment = commentChanges[id];
    const newStatus = statusChanges[id];
    if (newComment === undefined && newStatus === undefined) return;

    setUpdating(prev => ({ ...prev, [id]: true }));
    try {
      const payload = { updated_at: new Date() };
      if (newComment !== undefined) payload.commentaire_suivis = newComment;

      const member = members.find(m => m.id === id);
      const statusNum = newStatus !== undefined ? Number(newStatus) : Number(member?.statut_suivis);
      if (newStatus !== undefined) payload.statut_suivis = statusNum;
      if ([2, 3, 4].includes(statusNum)) payload.date_statut_Def = new Date().toISOString().split("T")[0];

      const { data: updatedMember, error } = await supabase
        .from("membres_complets")
        .update(payload)
        .eq("id", id)
        .select("*")
        .single();
      if (error) throw error;

      setAllMembers(prev => prev.map(m => (m.id === id ? updatedMember : m)));
    } catch (err) {
      console.error("❌ updateSuivi error:", err);
    } finally {
      setUpdating(prev => ({ ...prev, [id]: false }));
    }
  };

  const reactivateMember = async (id) => {
    setUpdating(prev => ({ ...prev, [id]: true }));
    try {
      const { data: updatedMember, error } = await supabase
        .from("membres_complets")
        .update({ statut_suivis: 2, updated_at: new Date() })
        .eq("id", id)
        .select("*")
        .single();
      if (error) throw error;
      setAllMembers(prev => prev.map(m => m.id === id ? updatedMember : m));
    } catch (err) {
      console.error("❌ reactivateMember error:", err);
    } finally {
      setUpdating(prev => ({ ...prev, [id]: false }));
    }
  };

  const formatDateFr = (dateString) => {
    if (!dateString) return "—";
    const d = new Date(dateString);
    const day = d.getDate().toString().padStart(2, "0");
    const months = ["Janv","Févr","Mars","Avr","Mai","Juin","Juil","Août","Sept","Oct","Nov","Déc"];
    return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const filteredMembers = members.filter(m => {
    if (m.etat_contact === "supprime") return false;
    const status = m.statut_suivis ?? 0;
    if (showRefus) return status === 4;
    return status === 1 || status === 2;
  });

  const uniqueMembers = Array.from(new Map(filteredMembers.map(i => [i.id, i])).values());

  return (
    <div className="min-h-screen flex flex-col items-center p-6" style={{ background: "#333699" }}>

      <HeaderPages />

      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mt-4 mb-6 text-blue-300 text-center text-white">
          Suivis des <span className="text-emerald-300">Membres</span>
        </h1>
        <div className="max-w-3xl w-full mb-6 text-center">
          <p className="italic text-base text-white/90">
            Ici, vous pouvez voir,<span className="text-blue-300 font-semibold"> suivre et accompagner </span> chaque membre de votre Assemblée.
            <span className="text-blue-300 font-semibold"> Chaque Personne est précieuse </span> : cette page vous permet de gérer les nouveaux venus,
            de <span className="text-blue-300 font-semibold">soutenir</span> chaque membre de la famille, et de cultiver la croissance de chaque
            membre avec <span className="text-blue-300 font-semibold">amour et discipline</span>.
          </p>
        </div>
      </div>

      <div className="mb-4 flex justify-end w-full max-w-6xl">
        <button
          onClick={() => setShowRefus(prev => !prev)}
          className="text-orange-400 text-sm underline hover:text-orange-500"
        >
          {showRefus ? "Voir tous les suivis" : "Voir les refus"}
        </button>
      </div>

      {message && (
        <div className="mb-4 px-4 py-2 rounded-md text-sm bg-yellow-100 text-yellow-800">
          {typeof message === "string" ? message : message.text}
        </div>
      )}

      {view === "card" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-6xl justify-items-center">
          {uniqueMembers.map((m) => (
            <div
              key={m.id}
              className="bg-white rounded-2xl shadow-lg w-full transition-all duration-300 hover:shadow-2xl p-4 border-l-4"
              style={{ borderLeftColor: getBorderColor(m) }}
            >
              <div className="flex flex-col items-center">
                <h2 className="font-bold text-black text-base text-center mb-1">
                  {m.prenom} {m.nom}
                </h2>

                {m.telephone && (
                  <div className="relative inline-block mt-1">
                    <p
                      className="text-orange-500 underline font-semibold cursor-pointer text-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenPhoneMenuId(openPhoneMenuId === m.id ? null : m.id);
                      }}
                    >
                      {m.telephone}
                    </p>
                    {openPhoneMenuId === m.id && (
                      <div
                        ref={phoneMenuRef}
                        className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-lg border z-50 w-52 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <a href={`tel:${m.telephone}`} className="block px-4 py-2 hover:bg-gray-100 text-black">📞 Appeler</a>
                        <a href={`sms:${m.telephone}`} className="block px-4 py-2 hover:bg-gray-100 text-black">✉️ SMS</a>
                        <a href={`https://wa.me/${m.telephone.replace(/\D/g, "")}?call`} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 hover:bg-gray-100 text-black">📱 Appel WhatsApp</a>
                        <a href={`https://wa.me/${m.telephone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 hover:bg-gray-100 text-black">💬 Message WhatsApp</a>
                      </div>
                    )}
                  </div>
                )}

                <p className="text-sm text-black-700 mb-1">
                  🏠 Cellule : {m.cellule_id ? (cellules.find(c => c.id === m.cellule_id)?.cellule_full || "—") : "—"}
                </p>

                {/* ✅ Famille affichée comme Cellule */}
                <p className="text-sm text-black-700 mb-1">
                  👨‍👩‍👦 Famille : {m.famille_id ? (familles.find(f => f.id === m.famille_id)?.famille_full || "—") : "—"}
                </p>

                <p className="text-sm text-black-700 mb-1">
                  👤 Conseiller(s) : {getConseillersForMember(m.id)}
                </p>

                <p className="self-end text-[11px] text-gray-400 mt-3">Créé le {formatDateFr(m.date_envoi_suivi)}</p>

                <div className="flex flex-col w-full mt-2">
                  <label className="font-semibold text-blue-700 mb-1 mt-2 text-center">Commentaire Suivis</label>

                  {showRefus ? (
                    <textarea value={m.commentaire_suivis ?? ""} readOnly className="w-full border rounded-lg p-2 bg-gray-100 text-gray-600 cursor-not-allowed" rows={2} />
                  ) : (
                    <textarea
                      value={commentChanges[m.id] ?? m.commentaire_suivis ?? ""}
                      onChange={(e) => handleCommentChange(m.id, e.target.value)}
                      className="w-full border rounded-lg p-2"
                      rows={2}
                    />
                  )}

                  <label className="font-semibold mb-1 text-center mt-2">Statut Intégration</label>

                  {showRefus ? (
                    <select value="4" disabled className="w-full border rounded-lg p-2 text-red-600 bg-gray-100 cursor-not-allowed">
                      <option value="4">Refus</option>
                    </select>
                  ) : (
                    <select
                      value={statusChanges[m.id] ?? String(m.statut_suivis ?? "")}
                      onChange={(e) => setStatusChanges(prev => ({ ...prev, [m.id]: e.target.value }))}
                      className="w-full border rounded-lg p-2 mb-2"
                    >
                      <option value="1">-- Sélectionner un statut --</option>
                      <option value="2">En Suivis</option>
                      <option value="3">Intégrer</option>
                      <option value="4">Refus</option>
                    </select>
                  )}

                  {showRefus ? (
                    <button onClick={() => reactivateMember(m.id)} disabled={updating[m.id]} className={`mt-2 py-1 rounded w-full transition ${updating[m.id] ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600 text-white"}`}>
                      {updating[m.id] ? "Réactivation..." : "Réactiver"}
                    </button>
                  ) : (
                    <button onClick={() => updateSuivi(m.id)} disabled={updating[m.id]} className={`mt-2 py-1 rounded w-full transition ${updating[m.id] ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600 text-white"}`}>
                      {updating[m.id] ? "Enregistrement..." : "Sauvegarder"}
                    </button>
                  )}
                </div>

                <button onClick={() => toggleDetails(m.id)} className="text-orange-500 underline text-sm mt-2">
                  {detailsOpen === m.id ? "Fermer détails" : "Détails"}
                </button>
              </div>

              <div className={`transition-all duration-500 overflow-hidden ${detailsOpen === m.id ? "max-h-[1000px] mt-3" : "max-h-0"}`}>
                {detailsOpen === m.id && (
                  <div className="pt-2">
                    <DetailsPopup
                      m={m}
                      user={userProfile}
                      showRefus={showRefus}
                      openSuiviMemberId={openSuiviMemberId}
                      setOpenSuiviMemberId={setOpenSuiviMemberId}
                      setEditMember={setEditMember}
                      cellules={cellules}
                      familles={familles}
                      conseillers={conseillers}
                      assignmentsMap={assignmentsMap}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {editMember && (
        <EditMemberSuivisPopup
          member={editMember}
          cellules={cellules}
          familles={familles}
          conseillers={conseillers}
          onClose={() => setEditMember(null)}
          onUpdateMember={async (updatedMember) => {
            updateMember(updatedMember.id, updatedMember);
            await fetchAssignments();
            setEditMember(null);
          }}
          currentUserRoles={userProfile?.roles || []}
        />
      )}

      <Footer />
    </div>
  );
}
