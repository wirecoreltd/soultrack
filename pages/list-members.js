import { useEffect, useState, useRef, useMemo } from "react";
import supabase from "../lib/supabaseClient";
import Image from "next/image";
import BoutonEnvoyer from "../components/BoutonEnvoyer";
import LogoutLink from "../components/LogoutLink";
import DetailsMemberPopup from "../components/DetailsMemberPopup";
import EditMemberPopup from "../components/EditMemberPopup";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useSearchParams } from "next/navigation";
import { useMembers } from "../context/MembersContext";
import Header from "../components/Header";

export default function ListMembers() {
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

  const [commentChanges, setCommentChanges] = useState({});
  const [statusChanges, setStatusChanges] = useState({});
  const [updating, setUpdating] = useState({});
  const [selectedTargets, setSelectedTargets] = useState({});
  const [selectedTargetType, setSelectedTargetType] = useState({});
  const [toastMessage, setToastMessage] = useState("");
  const [showingToast, setShowingToast] = useState(false);
  const [openPhoneMenuId, setOpenPhoneMenuId] = useState(null);
  const realtimeChannelRef = useRef(null);
  const [etatContactFilter, setEtatContactFilter] = useState("");

  const statutLabels = {
    1: "En cours",
    2: "En attente",
    3: "Intégrer",
    4: "Refus",
  };

  const statusOptions = [
    "actif",
    "ancien",
    "visiteur",
    "nouveau",
    "veut rejoindre ICC",
    "refus",
    "integrer",
    "En cours",
    "a déjà son église",
  ];

  const { members, setAllMembers, updateMember } = useMembers();

  const showToast = (msg) => {
    setToastMessage(msg);
    setShowingToast(true);
    setTimeout(() => setShowingToast(false), 3500);
  };

  const handleCommentChange = (id, value) => {
    setCommentChanges((prev) => ({ ...prev, [id]: value }));
  };

  const updateSuivi = async (id) => {
    setUpdating((prev) => ({ ...prev, [id]: true }));
    try {
      console.log("Update suivi pour:", id, commentChanges[id], statusChanges[id]);
      setTimeout(() => {
        setUpdating((prev) => ({ ...prev, [id]: false }));
        showToast("✅ Suivi enregistré !");
      }, 1000);
    } catch (err) {
      console.error("Erreur update suivi:", err);
      setUpdating((prev) => ({ ...prev, [id]: false }));
    }
  };

  const fetchMembers = async (profile = null) => {
    setLoading(true);
    try {
      let query = supabase.from("membres_complets").select("*").order("created_at", { ascending: false });
      if (conseillerIdFromUrl) query = query.eq("conseiller_id", conseillerIdFromUrl);
      else if (profile?.role === "Conseiller") query = query.eq("conseiller_id", profile.id);

      const { data, error } = await query;
      if (error) throw error;
      setAllMembers(data || []);
    } catch (err) {
      console.error("Erreur fetchMembers:", err);
      setAllMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCellules = async () => {
    const { data, error } = await supabase.from("cellules").select("id, cellule_full");
    if (error) console.error("Erreur fetchCellules:", error);
    if (data) setCellules(data);
  };

  const fetchConseillers = async () => {
    const { data } = await supabase.from("profiles").select("id, prenom, nom, telephone").eq("role", "Conseiller");
    if (data) setConseillers(data);
  };

  const handleAfterSend = (updatedMember, type, cible) => {
    const updatedWithActif = { ...updatedMember, statut: "actif" };
    updateMember(updatedWithActif);
    const cibleName = type === "cellule" ? cible.cellule_full : `${cible.prenom} ${cible.nom}`;
    showToast(`✅ ${updatedMember.prenom} ${updatedMember.nom} envoyé à ${cibleName}`);
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
        if (!profileError) {
          setPrenom(profileData.prenom || "");
          await fetchMembers(profileData);
        } else console.error(profileError);
      } else {
        await fetchMembers();
      }

      fetchCellules();
      fetchConseillers();
    };

    fetchSessionAndProfile();
  }, []);

  useEffect(() => {
    if (realtimeChannelRef.current) {
      try { realtimeChannelRef.current.unsubscribe(); } catch (e) {}
      realtimeChannelRef.current = null;
    }

    const channel = supabase.channel("realtime:membres_complets");
    channel.on("postgres_changes", { event: "*", schema: "public", table: "membres_complets" }, () => fetchMembers());
    channel.on("postgres_changes", { event: "*", schema: "public", table: "cellules" }, () => { fetchCellules(); fetchMembers(); });
    channel.on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => { fetchConseillers(); fetchMembers(); });
    try { channel.subscribe(); } catch (err) { console.warn("Erreur subscription realtime:", err); }

    realtimeChannelRef.current = channel;
    return () => {
      try { if (realtimeChannelRef.current) { realtimeChannelRef.current.unsubscribe(); realtimeChannelRef.current = null; } } catch (e) {}
    };
  }, []);

  const [refreshKey, setRefreshKey] = useState(0);
  const onUpdateMemberHandler = (updatedMember) => {
    updateMember(updatedMember);
    setEditMember(null);
    setPopupMember(prev => prev?.id === updatedMember.id ? { ...prev, ...updatedMember } : prev);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".phone-menu")) setOpenPhoneMenuId(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { filteredMembers, filteredNouveaux, filteredAnciens } = useMemo(() => {
    const baseFiltered = filter
      ? members.filter((m) => m.etat_contact?.trim().toLowerCase() === filter.toLowerCase())
      : members;

    const searchFiltered = baseFiltered.filter((m) => `${m.prenom || ""} ${m.nom || ""}`.toLowerCase().includes(search.toLowerCase()));

    const nouveaux = searchFiltered.filter((m) => ["visiteur", "veut rejoindre ICC", "nouveau"].includes(m.statut));
    const anciens = searchFiltered.filter((m) => !["visiteur", "veut rejoindre ICC", "nouveau"].includes(m.statut));

    return { filteredMembers: searchFiltered, filteredNouveaux: nouveaux, filteredAnciens: anciens };
  }, [members, filter, search, refreshKey]);

  const toggleDetails = (id) => setDetailsOpen((prev) => ({ ...prev, [id]: !prev[id] }));

  const getBorderColor = (m) => {
    if (!m.etat_contact) return "#ccc";
    const etat = m.etat_contact.trim().toLowerCase();
    if (etat === "existant") return "#34A853";
    if (etat === "nouveau") return "#34A85e";
    if (etat === "inactif") return "#999999";
    return "#ccc";
  };

  const formatDate = (dateStr) => { try { return format(new Date(dateStr), "EEEE d MMMM yyyy", { locale: fr }); } catch { return ""; } };

  const toggleStar = async (member) => {
    try {
      const { error } = await supabase.from("membres_complets").update({ star: !member.star }).eq("id", member.id);
      if (error) throw error;
      setAllMembers((prev) => prev.map((m) => m.id === member.id ? { ...m, star: !member.star } : m));
    } catch (err) {
      console.error("Erreur toggleStar:", err);
    }
  };

        {/* ==================== VUE CARTE ==================== */}
      {view === "card" && (
        <>
          {/* Nouveaux Membres */}
          {filteredNouveaux.length > 0 && (
            <>
              <h2 className="w-full max-w-6xl text-white font-bold mb-2 text-lg">
                💖 Bien aimé venu le {dateDuJour}
              </h2>
              <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                {filteredNouveaux.map(m =>
                  renderMemberCard({ ...m, isNouveau: true })
                )}
              </div>
            </>
          )}

          {/* Membres existants */}
          {filteredAnciens.length > 0 && (
            <>
              <h2 className="w-full max-w-6xl font-bold mb-2 text-lg bg-gradient-to-r from-blue-500 to-gray-300 bg-clip-text text-transparent">
                Membres existants
              </h2>
              <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {filteredAnciens.map(m => renderMemberCard(m))}
              </div>
            </>
          )}
        </>
      )}

      {/* ==================== VUE TABLE ==================== */}
      {view === "table" && (
        <div className="w-full max-w-6xl overflow-x-auto py-2">
          <div className="min-w-[700px] space-y-2">
            {/* Header */}
            <div className="hidden sm:flex text-sm font-semibold uppercase text-white px-2 py-1 border-b border-gray-400 bg-transparent">
              <div className="flex-[2]">Nom complet</div>
              <div className="flex-[1]">Téléphone</div>
              <div className="flex-[1]">Statut</div>
              <div className="flex-[2]">Affectation</div>
              <div className="flex-[1]">Actions</div>
            </div>

            {/* Nouveaux Membres */}
            {filteredNouveaux.length > 0 && (
              <div className="px-2 py-1 text-white bg-[#2E3192] rounded">
                💖 Bien aimé venu le {formatDate(filteredNouveaux[0].created_at)}
              </div>
            )}

            {filteredNouveaux.map((m) => (
              <div
                key={m.id}
                className="flex flex-row items-center px-2 py-2 rounded-lg bg-blue-100/30 hover:bg-blue-100/50 transition duration-150 gap-2 border-l-4"
                style={{ borderLeftColor: getBorderColor(m) }}
              >
                <div className="flex-[2] text-white flex items-center gap-1">
                  {m.prenom} {m.nom}
                  {["nouveau", "visiteur", "veut rejoindre ICC"].includes(m.statut) && (
                    <span className="text-xs px-1 rounded bg-white text-[#2E3192]">Nouveau</span>
                  )}
                  {m.deja_existant && (
                    <span className="px-2 py-1 rounded text-xs font-semibold bg-red-500 text-white ml-1">
                      Déjà dans la base
                    </span>
                  )}
                </div>
                <div className="flex-[1] text-white">{m.telephone || "—"}</div>
                <div className="flex-[1] text-white">{m.statut}</div>
                <div className="flex-[2] text-white">
                  {m.cellule_id
                    ? `🏠 ${cellules.find((c) => c.id === m.cellule_id)?.cellule_full || "—"}`
                    : m.conseiller_id
                    ? `👤 ${conseillers.find((c) => c.id === m.conseiller_id)?.prenom} ${conseillers.find((c) => c.id === m.conseiller_id)?.nom}`
                    : "—"}
                </div>
                <div className="flex-[1]">
                  <button
                    onClick={() => setPopupMember(popupMember?.id === m.id ? null : { ...m })}
                    className="text-orange-500 underline text-sm whitespace-nowrap"
                  >
                    {popupMember?.id === m.id ? "Fermer détails" : "Détails"}
                  </button>
                </div>
              </div>
            ))}

            {/* Membres existants */}
            {filteredAnciens.length > 0 && (
              <div className="px-2 py-1 font-semibold text-lg">
                <span style={{ background: "linear-gradient(to right, #3B82F6, #D1D5DB)", WebkitBackgroundClip: "text", color: "transparent" }}>
                  Membres existants
                </span>
              </div>
            )}

            {filteredAnciens.map((m) => (
              <div
                key={m.id}
                className="flex flex-row items-center px-2 py-2 rounded-lg bg-blue-100/30 hover:bg-blue-100/50 transition duration-150 gap-2 border-l-4"
                style={{ borderLeftColor: getBorderColor(m) }}
              >
                <div className="flex-[2] text-white flex items-center gap-1">
                  {m.prenom} {m.nom}
                  {m.star && <span className="text-yellow-400 ml-1">⭐</span>}
                  {m.isNouveau && (
                    <span className="px-2 py-1 rounded text-xs font-semibold bg-[#2E3192] text-white ml-1">
                      Nouveau
                    </span>
                  )}
                  {m.deja_existant && (
                    <span className="px-2 py-1 rounded text-xs font-semibold bg-red-500 text-white ml-1">
                      Déjà dans la base
                    </span>
                  )}
                </div>
                <div className="flex-[1] text-white">{m.telephone || "—"}</div>
                <div className="flex-[1] text-white">{m.etat_contact || "—"}</div>
                <div className="flex-[2] text-white">
                  {m.cellule_id
                    ? `🏠 ${cellules.find((c) => c.id === m.cellule_id)?.cellule_full || "—"}`
                    : m.conseiller_id
                    ? `👤 ${conseillers.find((c) => c.id === m.conseiller_id)?.prenom} ${conseillers.find((c) => c.id === m.conseiller_id)?.nom}`
                    : "—"}
                </div>
                <div className="flex-[1]">
                  <button
                    onClick={() => setPopupMember(popupMember?.id === m.id ? null : { ...m })}
                    className="text-orange-500 underline text-sm whitespace-nowrap"
                  >
                    {popupMember?.id === m.id ? "Fermer détails" : "Détails"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* =================== DETAILS MEMBER POPUP =================== */}
      {popupMember && (
        <DetailsMemberPopup
          membre={popupMember}
          onClose={() => setPopupMember(null)}
          cellules={cellules}
          conseillers={conseillers}
          session={session}
          commentChanges={commentChanges}
          handleCommentChange={handleCommentChange}
          statusChanges={statusChanges}
          setStatusChanges={setStatusChanges}
          updateSuivi={updateSuivi}
          updating={updating}
        />
      )}

      {/* =================== EDIT MEMBER POPUP =================== */}
      {editMember && (
        <EditMemberPopup
          member={editMember}
          onClose={() => setEditMember(null)}
          onUpdateMember={onUpdateMemberHandler}
        />
      )}

      {/* =================== TOAST =================== */}
      {showingToast && (
        <div className="fixed bottom-4 right-4 bg-black text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {toastMessage}
        </div>
      )}
    </div>
  );
}

