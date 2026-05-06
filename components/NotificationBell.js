"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import supabase from "../lib/supabaseClient";

// ─── Rôles par type de notification ──────────────────────────────────────────
const ROLES_NOUVEAUX_MEMBRES     = ["Administrateur", "ResponsableIntegration"];
const ROLES_NOUVEAUX_EVANGELISES = ["Administrateur", "ResponsableEvangelisation"];
const ROLES_SUPERVISEUR_CELLULE  = ["SuperviseurCellule"];
const ROLES_RESPONSABLE_CELLULE  = ["ResponsableCellule"];
const ROLES_NEW_IN_CELLULE       = ["Administrateur", "SuperviseurCellule"];

export default function NotificationBell({ egliseId, userRole, userId }) {
  const [countMembres,      setCountMembres]      = useState(0);
  const [countEvangelises,  setCountEvangelises]  = useState(0);
  const [countCellule,      setCountCellule]      = useState(0);
  const [countNewInCellule, setCountNewInCellule] = useState(0);
  const [countAssignes,     setCountAssignes]     = useState(0);
  const [isNew,             setIsNew]             = useState(false);

  // IDs des cellules/familles dont cet utilisateur est responsable (pour les notifs assignées)
  const [mesCelluleIds, setMesCelluleIds] = useState([]);
  const [mesFamilleIds, setMesFamilleIds] = useState([]);

  // IDs pour les notifications "nouveaux membres" (superviseur/responsable)
  const [celluleIds, setCelluleIds] = useState([]);

  const router     = useRouter();
  const channelRef = useRef(null);

  const canSeeMembres      = ROLES_NOUVEAUX_MEMBRES.includes(userRole);
  const canSeeEvangelises  = ROLES_NOUVEAUX_EVANGELISES.includes(userRole);
  const canSeeSuperviseur  = ROLES_SUPERVISEUR_CELLULE.includes(userRole);
  const canSeeResponsable  = ROLES_RESPONSABLE_CELLULE.includes(userRole);
  const canSeeNewInCellule = ROLES_NEW_IN_CELLULE.includes(userRole);

  // ─── Total badge ──────────────────────────────────────────────────────────
  const totalCount =
      (canSeeMembres                          ? countMembres      : 0)
    + (canSeeEvangelises                      ? countEvangelises  : 0)
    + (canSeeSuperviseur || canSeeResponsable ? countCellule      : 0)
    + (canSeeNewInCellule                     ? countNewInCellule : 0)
    + countAssignes; // visible par tous les rôles

  // ─── Chargement initial ───────────────────────────────────────────────────
  useEffect(() => {
    if (!egliseId || !userId) return;

    const fetchCounts = async () => {

      // ── 1. Nouveaux membres (Admin + ResponsableIntegration) ──
      if (canSeeMembres) {
        const { count } = await supabase
          .from("membres_complets")
          .select("id", { count: "exact", head: true })
          .eq("eglise_id", egliseId)
          .eq("etat_contact", "nouveau");
        setCountMembres(count || 0);
      }

      // ── 2. Évangélisés non envoyés ──
      if (canSeeEvangelises) {
        const { count } = await supabase
          .from("evangelises")
          .select("id", { count: "exact", head: true })
          .eq("eglise_id", egliseId)
          .eq("status_suivi", "Non envoyé");
        setCountEvangelises(count || 0);
      }

      // ── 3. SuperviseurCellule → ses cellules supervisées ──
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

      // ── 4. ResponsableCellule → ses cellules ──
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

      // ── 5. is_new_in_cellule (Admin + SuperviseurCellule) ──
      if (canSeeNewInCellule) {
        const { count } = await supabase
          .from("membres_complets")
          .select("id", { count: "exact", head: true })
          .eq("eglise_id", egliseId)
          .eq("is_new_in_cellule", "true");
        setCountNewInCellule(count || 0);
      }

      // ── 6. ✅ Membres assignés à CE responsable (notification_responsable = true) ──
      // 3 requêtes séparées selon le type d'assignation

      let totalAssignes = 0;

      // 6a. Conseiller → suivi_responsable_id = userId
      const { count: countConseiller } = await supabase
        .from("membres_complets")
        .select("id", { count: "exact", head: true })
        .eq("suivi_responsable_id", userId)
        .eq("notification_responsable", true);
      totalAssignes += countConseiller || 0;

      // 6b. ResponsableCellule → cellule_id dans ses cellules
      const { data: cellulesDuResponsable } = await supabase
        .from("cellules")
        .select("id")
        .eq("responsable_id", userId);
      const idsCellules = (cellulesDuResponsable || []).map((c) => c.id);
      setMesCelluleIds(idsCellules);

      if (idsCellules.length > 0) {
        const { count: countCelluleAssign } = await supabase
          .from("membres_complets")
          .select("id", { count: "exact", head: true })
          .in("cellule_id", idsCellules)
          .eq("notification_responsable", true);
        totalAssignes += countCelluleAssign || 0;
      }

      // 6c. ResponsableFamilles → famille_id dans ses familles
      const { data: famillesDuResponsable } = await supabase
        .from("familles")
        .select("id")
        .eq("responsable_id", userId);
      const idsFamilles = (famillesDuResponsable || []).map((f) => f.id);
      setMesFamilleIds(idsFamilles);

      if (idsFamilles.length > 0) {
        const { count: countFamilleAssign } = await supabase
          .from("membres_complets")
          .select("id", { count: "exact", head: true })
          .in("famille_id", idsFamilles)
          .eq("notification_responsable", true);
        totalAssignes += countFamilleAssign || 0;
      }

      setCountAssignes(totalAssignes);
    };

    fetchCounts();
  }, [egliseId, userId]);

  // ─── Realtime ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!egliseId || !userId) return;

    if (channelRef.current) {
      try { supabase.removeChannel(channelRef.current); } catch (_) {}
    }

    const channel = supabase.channel(`notif-bell-${egliseId}-${userId}`);

    // ── Nouveaux membres ──
    if (canSeeMembres) {
      channel
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "membres_complets" }, (payload) => {
          const row = payload.new;
          if (row.eglise_id === egliseId && row.etat_contact === "nouveau") {
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

    // ── Évangélisés ──
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

    // ── SuperviseurCellule + ResponsableCellule → nouveaux dans leurs cellules ──
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

    // ── is_new_in_cellule ──
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

    // ── ✅ Membres assignés — écoute les 3 cas : conseiller / cellule / famille ──
    channel.on("postgres_changes", { event: "UPDATE", schema: "public", table: "membres_complets" }, (payload) => {
      const row = payload.new;
      const old = payload.old;

      const estPourMoi =
        row.suivi_responsable_id === userId ||
        (mesCelluleIds.length > 0 && mesCelluleIds.includes(row.cellule_id)) ||
        (mesFamilleIds.length > 0 && mesFamilleIds.includes(row.famille_id));

      if (!estPourMoi) return;

      // Notif activée → incrémenter
      if (row.notification_responsable === true && old.notification_responsable !== true) {
        setCountAssignes((prev) => prev + 1);
        setIsNew(true);
        setTimeout(() => setIsNew(false), 2000);
      }

      // Notif marquée lue → décrémenter
      if (row.notification_responsable === false && old.notification_responsable === true) {
        setCountAssignes((prev) => Math.max(0, prev - 1));
      }
    });

    channel.subscribe();
    channelRef.current = channel;

    return () => {
      try { supabase.removeChannel(channel); } catch (_) {}
    };
  }, [egliseId, userId, celluleIds, mesCelluleIds, mesFamilleIds, canSeeMembres, canSeeEvangelises, canSeeSuperviseur, canSeeResponsable, canSeeNewInCellule]);

  // ─── Rendu ────────────────────────────────────────────────────────────────
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
