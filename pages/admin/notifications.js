"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import supabase from "../../lib/supabaseClient";
import { useNotificationsContext } from "../../context/NotificationsContext";

const ROLES_NOUVEAUX_MEMBRES     = ["Administrateur", "ResponsableIntegration"];
const ROLES_NOUVEAUX_EVANGELISES = ["Administrateur", "ResponsableEvangelisation"];
const ROLES_SUPERVISEUR_CELLULE  = ["SuperviseurCellule"];
const ROLES_RESPONSABLE_CELLULE  = ["ResponsableCellule"];
const ROLES_NEW_IN_CELLULE       = ["Administrateur", "SuperviseurCellule"];

export default function NotificationBell({ egliseId, userRole, userId }) {
  const [countMembres,       setCountMembres]       = useState(0);
  const [countEvangelises,   setCountEvangelises]   = useState(0);
  const [countCellule,       setCountCellule]       = useState(0);
  const [countNewInCellule,  setCountNewInCellule]  = useState(0);
  const [countAssignes,      setCountAssignes]      = useState(0);
  const [countAssignesEvang, setCountAssignesEvang] = useState(0);
  const [countInvitations,   setCountInvitations]   = useState(0);
  const [isNew,              setIsNew]              = useState(false);

  const [mesCelluleIds, setMesCelluleIds] = useState([]);
  const [mesFamilleIds, setMesFamilleIds] = useState([]);
  const [celluleIds,    setCelluleIds]    = useState([]);

  const router     = useRouter();
  const channelRef = useRef(null);

  const { seenIds } = useNotificationsContext();

  const isAdmin            = Array.isArray(userRole) ? userRole.includes("Administrateur") : userRole === "Administrateur";
  const canSeeMembres      = ROLES_NOUVEAUX_MEMBRES.some(r => Array.isArray(userRole) ? userRole.includes(r) : userRole === r);
  const canSeeEvangelises  = ROLES_NOUVEAUX_EVANGELISES.some(r => Array.isArray(userRole) ? userRole.includes(r) : userRole === r);
  const canSeeSuperviseur  = ROLES_SUPERVISEUR_CELLULE.some(r => Array.isArray(userRole) ? userRole.includes(r) : userRole === r);
  const canSeeResponsable  = ROLES_RESPONSABLE_CELLULE.some(r => Array.isArray(userRole) ? userRole.includes(r) : userRole === r);
  const canSeeNewInCellule = ROLES_NEW_IN_CELLULE.some(r => Array.isArray(userRole) ? userRole.includes(r) : userRole === r);

  const totalCount =
      (canSeeMembres                          ? countMembres         : 0)
    + (canSeeEvangelises                      ? countEvangelises     : 0)
    + (canSeeSuperviseur || canSeeResponsable ? countCellule         : 0)
    + (canSeeNewInCellule                     ? countNewInCellule    : 0)
    + countAssignes
    + countAssignesEvang
    + countInvitations;

  useEffect(() => {
    if (!egliseId || !userId) return;

    const fetchCounts = async () => {

      // 1. Nouveaux membres — soustraire les vus
      if (canSeeMembres) {
        const { data: nouveaux } = await supabase
          .from("membres_complets")
          .select("id")
          .eq("eglise_id", egliseId)
          .eq("etat_contact", "nouveau");

        const unseen = (nouveaux || []).filter((m) => !seenIds.includes(m.id));
        setCountMembres(unseen.length);
      }

      // 2. Évangélisés non envoyés
      if (canSeeEvangelises) {
        const { count } = await supabase
          .from("evangelises")
          .select("id", { count: "exact", head: true })
          .eq("eglise_id", egliseId)
          .eq("status_suivi", "Non envoyé");
        setCountEvangelises(count || 0);
      }

      // 3. SuperviseurCellule
      if (canSeeSuperviseur) {
        const { data: cellules } = await supabase
          .from("cellules")
          .select("id")
          .eq("superviseur_id", userId);
        const ids = (cellules || []).map((c) => c.id);
        setCelluleIds(ids);
        if (ids.length > 0) {
          const { count } = await supabase
            .from("membres_complets")
            .select("id", { count: "exact", head: true })
            .in("cellule_id", ids)
            .eq("etat_contact", "nouveau");
          setCountCellule(count || 0);
        }
      }

      // 4. ResponsableCellule
      if (canSeeResponsable) {
        const { data: cellules } = await supabase
          .from("cellules")
          .select("id")
          .eq("responsable_id", userId);
        const ids = (cellules || []).map((c) => c.id);
        setCelluleIds(ids);
        if (ids.length > 0) {
          const { count } = await supabase
            .from("membres_complets")
            .select("id", { count: "exact", head: true })
            .in("cellule_id", ids)
            .eq("etat_contact", "nouveau");
          setCountCellule(count || 0);
        }
      }

      // 5. is_new_in_cellule
      if (canSeeNewInCellule) {
        const { count } = await supabase
          .from("membres_complets")
          .select("id", { count: "exact", head: true })
          .eq("eglise_id", egliseId)
          .eq("is_new_in_cellule", "true");
        setCountNewInCellule(count || 0);
      }

      // 6. Membres assignés
      // ✅ FIX — fetch mesCelluleIds et mesFamilleIds en même temps pour le realtime
      const { data: cellulesDuResponsable } = await supabase
        .from("cellules").select("id").eq("responsable_id", userId);
      const idsCellules = (cellulesDuResponsable || []).map((c) => c.id);
      setMesCelluleIds(idsCellules);

      const { data: famillesDuResponsable } = await supabase
        .from("familles").select("id").eq("responsable_id", userId);
      const idsFamilles = (famillesDuResponsable || []).map((f) => f.id);
      setMesFamilleIds(idsFamilles);

      let totalAssignes = 0;

      // Par conseiller direct
      const { count: countConseiller } = await supabase
        .from("membres_complets")
        .select("id", { count: "exact", head: true })
        .eq("suivi_responsable_id", userId)
        .eq("notification_responsable", true);
      totalAssignes += countConseiller || 0;

      // Par cellule dont je suis responsable
      if (idsCellules.length > 0) {
        const { count: countCelluleAssign } = await supabase
          .from("membres_complets")
          .select("id", { count: "exact", head: true })
          .in("cellule_id", idsCellules)
          .eq("notification_responsable", true);
        totalAssignes += countCelluleAssign || 0;
      }

      // Par famille dont je suis responsable
      if (idsFamilles.length > 0) {
        const { count: countFamilleAssign } = await supabase
          .from("membres_complets")
          .select("id", { count: "exact", head: true })
          .in("famille_id", idsFamilles)
          .eq("notification_responsable", true);
        totalAssignes += countFamilleAssign || 0;
      }

      setCountAssignes(totalAssignes);

      // 7. Évangélisés assignés
      let totalAssignesEvang = 0;

      const { count: countECons } = await supabase
        .from("suivis_des_evangelises")
        .select("id", { count: "exact", head: true })
        .eq("conseiller_id", userId)
        .eq("notification_responsable", true);
      totalAssignesEvang += countECons || 0;

      if (idsCellules.length > 0) {
        const { count: countECell } = await supabase
          .from("suivis_des_evangelises")
          .select("id", { count: "exact", head: true })
          .in("cellule_id", idsCellules)
          .eq("notification_responsable", true);
        totalAssignesEvang += countECell || 0;
      }

      if (idsFamilles.length > 0) {
        const { count: countEFam } = await supabase
          .from("suivis_des_evangelises")
          .select("id", { count: "exact", head: true })
          .in("famille_id", idsFamilles)
          .eq("notification_responsable", true);
        totalAssignesEvang += countEFam || 0;
      }

      setCountAssignesEvang(totalAssignesEvang);

      // 8. Invitations en attente
      {
        const { count } = await supabase
          .from("eglise_supervisions")
          .select("id", { count: "exact", head: true })
          .eq("supervisee_eglise_id", egliseId)
          .eq("statut", "pending");
        setCountInvitations(count || 0);
      }
    };

    fetchCounts();
  }, [egliseId, userId, seenIds]); // ✅ seenIds dans les dépendances

  // ─── Realtime ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!egliseId || !userId) return;

    if (channelRef.current) {
      try { supabase.removeChannel(channelRef.current); } catch (_) {}
    }

    const channel = supabase.channel(`notif-bell-${egliseId}-${userId}`);

    if (canSeeMembres) {
      channel
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "membres_complets" }, (payload) => {
          const row = payload.new;
          if (row.eglise_id === egliseId && row.etat_contact === "nouveau" && !seenIds.includes(row.id)) {
            setCountMembres((prev) => prev + 1);
            setIsNew(true); setTimeout(() => setIsNew(false), 2000);
          }
        })
        .on("postgres_changes", { event: "UPDATE", schema: "public", table: "membres_complets" }, (payload) => {
          const row = payload.new;
          if (row.eglise_id === egliseId && row.etat_contact !== "nouveau") {
            setCountMembres((prev) => Math.max(0, prev - 1));
          }
        });
    }

    if (canSeeEvangelises) {
      channel
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "evangelises" }, (payload) => {
          const row = payload.new;
          if (row.eglise_id === egliseId && row.status_suivi === "Non envoyé") {
            setCountEvangelises((prev) => prev + 1);
            setIsNew(true); setTimeout(() => setIsNew(false), 2000);
          }
        })
        .on("postgres_changes", { event: "UPDATE", schema: "public", table: "evangelises" }, (payload) => {
          const row = payload.new;
          if (row.eglise_id === egliseId && row.status_suivi !== "Non envoyé") {
            setCountEvangelises((prev) => Math.max(0, prev - 1));
          }
        });
    }

    if ((canSeeSuperviseur || canSeeResponsable) && celluleIds.length > 0) {
      channel
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "membres_complets" }, (payload) => {
          const row = payload.new;
          if (celluleIds.includes(row.cellule_id) && row.etat_contact === "nouveau") {
            setCountCellule((prev) => prev + 1);
            setIsNew(true); setTimeout(() => setIsNew(false), 2000);
          }
        })
        .on("postgres_changes", { event: "UPDATE", schema: "public", table: "membres_complets" }, (payload) => {
          const row = payload.new;
          if (celluleIds.includes(row.cellule_id) && row.etat_contact !== "nouveau") {
            setCountCellule((prev) => Math.max(0, prev - 1));
          }
        });
    }

    if (canSeeNewInCellule) {
      channel
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "membres_complets" }, (payload) => {
          const row = payload.new;
          if (row.eglise_id === egliseId && row.is_new_in_cellule === "true") {
            setCountNewInCellule((prev) => prev + 1);
            setIsNew(true); setTimeout(() => setIsNew(false), 2000);
          }
        })
        .on("postgres_changes", { event: "UPDATE", schema: "public", table: "membres_complets" }, (payload) => {
          const row = payload.new;
          if (row.eglise_id === egliseId && row.is_new_in_cellule !== "true") {
            setCountNewInCellule((prev) => Math.max(0, prev - 1));
          }
        });
    }

    // ✅ FIX — membre_assigne : gérer les 3 cas (conseiller, cellule, famille)
    channel.on("postgres_changes", { event: "UPDATE", schema: "public", table: "membres_complets" }, (payload) => {
      const row = payload.new;
      const old = payload.old;

      const estPourMoi =
        row.suivi_responsable_id === userId ||
        (mesCelluleIds.length > 0 && mesCelluleIds.includes(row.cellule_id)) ||
        (mesFamilleIds.length > 0 && mesFamilleIds.includes(row.famille_id));

      if (!estPourMoi) return;

      if (row.notification_responsable === true && old.notification_responsable !== true) {
        setCountAssignes((prev) => prev + 1);
        setIsNew(true); setTimeout(() => setIsNew(false), 2000);
      }
      if (row.notification_responsable === false && old.notification_responsable === true) {
        setCountAssignes((prev) => Math.max(0, prev - 1));
      }
    });

    channel.on("postgres_changes", { event: "UPDATE", schema: "public", table: "suivis_des_evangelises" }, (payload) => {
      const row = payload.new;
      const old = payload.old;
      const estPourMoi =
        row.conseiller_id === userId ||
        (mesCelluleIds.length > 0 && mesCelluleIds.includes(row.cellule_id)) ||
        (mesFamilleIds.length > 0 && mesFamilleIds.includes(row.famille_id));
      if (!estPourMoi) return;
      if (row.notification_responsable === true && old.notification_responsable !== true) {
        setCountAssignesEvang((prev) => prev + 1);
        setIsNew(true); setTimeout(() => setIsNew(false), 2000);
      }
      if (row.notification_responsable === false && old.notification_responsable === true) {
        setCountAssignesEvang((prev) => Math.max(0, prev - 1));
      }
    });

    channel
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "eglise_supervisions" }, (payload) => {
        const row = payload.new;
        const old = payload.old;
        if (row.supervisee_eglise_id !== egliseId) return;
        if (row.statut === "pending" && old.supervisee_eglise_id !== egliseId) {
          setCountInvitations((prev) => prev + 1);
          setIsNew(true); setTimeout(() => setIsNew(false), 2000);
        }
        if (row.statut !== "pending" && old.statut === "pending") {
          setCountInvitations((prev) => Math.max(0, prev - 1));
        }
      });

    channel.subscribe();
    channelRef.current = channel;

    return () => {
      try { supabase.removeChannel(channel); } catch (_) {}
    };
  }, [egliseId, userId, celluleIds, mesCelluleIds, mesFamilleIds, canSeeMembres, canSeeEvangelises, canSeeSuperviseur, canSeeResponsable, canSeeNewInCellule, seenIds]);

  return (
    <>
      <button
        onClick={() => router.push("/admin/notifications")}
        title="Voir les notifications"
        style={{
          position: "relative",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          fontSize: "1.1rem",
          lineHeight: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2px",
          animation: isNew ? "bellRing 0.4s ease-in-out 3" : "none",
        }}
      >
        🔔
        {totalCount > 0 && (
          <span style={{
            position: "absolute",
            top: "-5px", right: "-6px",
            background: "#ef4444", color: "#fff",
            fontSize: "9px", fontWeight: "800",
            borderRadius: "9999px",
            minWidth: "16px", height: "16px",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "0 3px",
            boxShadow: "0 0 0 2px #333699",
            lineHeight: 1,
          }}>
            {totalCount > 99 ? "99+" : totalCount}
          </span>
        )}
      </button>

      <style>{`
        @keyframes bellRing {
          0%   { transform: rotate(0deg); }
          25%  { transform: rotate(14deg); }
          50%  { transform: rotate(-14deg); }
          75%  { transform: rotate(8deg); }
          100% { transform: rotate(0deg); }
        }
      `}</style>
    </>
  );
}
