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

// ─── Rôles qui peuvent recevoir des membres assignés ─────────────────────────
const ROLES_ASSIGNES = [
  "ResponsableCellule",
  "ResponsableFamilles",
  "Conseiller",
  "Administrateur",
  "SuperviseurCellule",
  "ResponsableIntegration",
  "ResponsableEvangelisation",
];

export default function NotificationBell({ egliseId, userRole, userId }) {
  const [countMembres,       setCountMembres]       = useState(0);
  const [countEvangelises,   setCountEvangelises]   = useState(0);
  const [countCellule,       setCountCellule]       = useState(0);
  const [countNewInCellule,  setCountNewInCellule]  = useState(0);
  const [countAssignes,      setCountAssignes]      = useState(0); // ✅ NOUVEAU
  const [isNew,              setIsNew]              = useState(false);
  const [celluleIds,         setCelluleIds]         = useState([]);
  const router     = useRouter();
  const channelRef = useRef(null);

  const canSeeMembres      = ROLES_NOUVEAUX_MEMBRES.includes(userRole);
  const canSeeEvangelises  = ROLES_NOUVEAUX_EVANGELISES.includes(userRole);
  const canSeeSuperviseur  = ROLES_SUPERVISEUR_CELLULE.includes(userRole);
  const canSeeResponsable  = ROLES_RESPONSABLE_CELLULE.includes(userRole);
  const canSeeNewInCellule = ROLES_NEW_IN_CELLULE.includes(userRole);
  const canSeeAssignes     = ROLES_ASSIGNES.includes(userRole); // ✅ NOUVEAU

  // ─── Total badge ──────────────────────────────────────────────────────────
  const totalCount = (canSeeMembres                          ? countMembres      : 0)
                   + (canSeeEvangelises                      ? countEvangelises  : 0)
                   + (canSeeSuperviseur || canSeeResponsable ? countCellule      : 0)
                   + (canSeeNewInCellule                     ? countNewInCellule : 0)
                   + (canSeeAssignes                         ? countAssignes     : 0); // ✅ NOUVEAU

  // ─── Chargement initial ───────────────────────────────────────────────────
  useEffect(() => {
    if (!egliseId || !userId) return;

    const fetchCounts = async () => {

      // ── Administrateur + ResponsableIntegration → nouveaux membres ──
      if (canSeeMembres) {
        const { count: total } = await supabase
          .from("membres_complets")
          .select("id", { count: "exact", head: true })
          .eq("eglise_id", egliseId)
          .eq("etat_contact", "nouveau");
        setCountMembres(total || 0);
      }

      // ── Administrateur + ResponsableEvangelisation → évangélisés non envoyés ──
      if (canSeeEvangelises) {
        const { count: total } = await supabase
          .from("evangelises")
          .select("id", { count: "exact", head: true })
          .eq("eglise_id", egliseId)
          .eq("status_suivi", "Non envoyé");
        setCountEvangelises(total || 0);
      }

      // ── SuperviseurCellule → cellules où superviseur_id = userId ──
      if (canSeeSuperviseur) {
        const { data: cellules } = await supabase
          .from("cellules")
          .select("id")
          .eq("superviseur_id", userId);

        const ids = (cellules || []).map((c) => c.id);
        setCelluleIds(ids);

        if (ids.length > 0) {
          const { count: total } = await supabase
            .from("membres_complets")
            .select("id", { count: "exact", head: true })
            .in("cellule_id", ids)
            .eq("etat_contact", "nouveau");
          setCountCellule(total || 0);
        }
      }

      // ── ResponsableCellule → cellules où responsable_id = userId ──
      if (canSeeResponsable) {
        const { data: cellules } = await supabase
          .from("cellules")
          .select("id")
          .eq("responsable_id", userId);

        const ids = (cellules || []).map((c) => c.id);
        setCelluleIds(ids);

        if (ids.length > 0) {
          const { count: total } = await supabase
            .from("membres_complets")
            .select("id", { count: "exact", head: true })
            .in("cellule_id", ids)
            .eq("etat_contact", "nouveau");
          setCountCellule(total || 0);
        }
      }

      // ── Administrateur + SuperviseurCellule → membres ajoutés via cellule ──
      if (canSeeNewInCellule) {
        const { count: total } = await supabase
          .from("membres_complets")
          .select("id", { count: "exact", head: true })
          .eq("eglise_id", egliseId)
          .eq("is_new_in_cellule", "true");
        setCountNewInCellule(total || 0);
      }

      // ✅ NOUVEAU — Membres assignés à CE responsable avec notification_responsable = true
      if (canSeeAssignes) {
        const { count: total } = await supabase
          .from("membres_complets")
          .select("id", { count: "exact", head: true })
          .eq("suivi_responsable_id", userId)
          .eq("notification_responsable", true);
        setCountAssignes(total || 0);
      }
    };

    fetchCounts();
  }, [egliseId, userId, canSeeMembres, canSeeEvangelises, canSeeSuperviseur, canSeeResponsable, canSeeNewInCellule, canSeeAssignes]);

  // ─── Realtime ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!egliseId || !userId) return;

    if (channelRef.current) {
      try { supabase.removeChannel(channelRef.current); } catch (_) {}
    }

    const channel = supabase.channel(`notif-bell-${egliseId}-${userId}`);

    // ── Membres (Administrateur + ResponsableIntegration) ──
    if (canSeeMembres) {
      channel
        .on("postgres_changes",
          { event: "INSERT", schema: "public", table: "membres_complets" },
          (payload) => {
            const row = payload.new;
            if (row.eglise_id === egliseId && row.etat_contact === "nouveau") {
              setCountMembres((prev) => prev + 1);
              setIsNew(true);
              setTimeout(() => setIsNew(false), 2000);
            }
          }
        )
        .on("postgres_changes",
          { event: "UPDATE", schema: "public", table: "membres_complets" },
          (payload) => {
            const row = payload.new;
            if (row.eglise_id === egliseId && row.etat_contact !== "nouveau") {
              setCountMembres((prev) => Math.max(0, prev - 1));
            }
          }
        );
    }

    // ── Évangélisés (Administrateur + ResponsableEvangelisation) ──
    if (canSeeEvangelises) {
      channel
        .on("postgres_changes",
          { event: "INSERT", schema: "public", table: "evangelises" },
          (payload) => {
            const row = payload.new;
            if (row.eglise_id === egliseId && row.status_suivi === "Non envoyé") {
              setCountEvangelises((prev) => prev + 1);
              setIsNew(true);
              setTimeout(() => setIsNew(false), 2000);
            }
          }
        )
        .on("postgres_changes",
          { event: "UPDATE", schema: "public", table: "evangelises" },
          (payload) => {
            const row = payload.new;
            if (row.eglise_id === egliseId && row.status_suivi !== "Non envoyé") {
              setCountEvangelises((prev) => Math.max(0, prev - 1));
            }
          }
        );
    }

    // ── SuperviseurCellule + ResponsableCellule → leurs cellules ──
    if ((canSeeSuperviseur || canSeeResponsable) && celluleIds.length > 0) {
      channel
        .on("postgres_changes",
          { event: "INSERT", schema: "public", table: "membres_complets" },
          (payload) => {
            const row = payload.new;
            if (celluleIds.includes(row.cellule_id) && row.etat_contact === "nouveau") {
              setCountCellule((prev) => prev + 1);
              setIsNew(true);
              setTimeout(() => setIsNew(false), 2000);
            }
          }
        )
        .on("postgres_changes",
          { event: "UPDATE", schema: "public", table: "membres_complets" },
          (payload) => {
            const row = payload.new;
            if (celluleIds.includes(row.cellule_id) && row.etat_contact !== "nouveau") {
              setCountCellule((prev) => Math.max(0, prev - 1));
            }
          }
        );
    }

    // ── Administrateur + SuperviseurCellule → is_new_in_cellule realtime ──
    if (canSeeNewInCellule) {
      channel
        .on("postgres_changes",
          { event: "INSERT", schema: "public", table: "membres_complets" },
          (payload) => {
            const row = payload.new;
            if (row.eglise_id === egliseId && row.is_new_in_cellule === "true") {
              setCountNewInCellule((prev) => prev + 1);
              setIsNew(true);
              setTimeout(() => setIsNew(false), 2000);
            }
          }
        )
        .on("postgres_changes",
          { event: "UPDATE", schema: "public", table: "membres_complets" },
          (payload) => {
            const row = payload.new;
            if (row.eglise_id === egliseId && row.is_new_in_cellule !== "true") {
              setCountNewInCellule((prev) => Math.max(0, prev - 1));
            }
          }
        );
    }

    // ✅ NOUVEAU — Realtime membres assignés à ce responsable
    if (canSeeAssignes) {
      channel
        .on("postgres_changes",
          { event: "UPDATE", schema: "public", table: "membres_complets" },
          (payload) => {
            const row = payload.new;
            const old = payload.old;

            // Un membre vient d'être assigné à CE responsable avec notif active
            if (
              row.suivi_responsable_id === userId &&
              row.notification_responsable === true &&
              old.notification_responsable !== true
            ) {
              setCountAssignes((prev) => prev + 1);
              setIsNew(true);
              setTimeout(() => setIsNew(false), 2000);
            }

            // La notif a été marquée comme lue
            if (
              row.suivi_responsable_id === userId &&
              row.notification_responsable === false &&
              old.notification_responsable === true
            ) {
              setCountAssignes((prev) => Math.max(0, prev - 1));
            }
          }
        );
    }

    channel.subscribe();
    channelRef.current = channel;

    return () => {
      try { supabase.removeChannel(channel); } catch (_) {}
    };
  }, [egliseId, userId, celluleIds, canSeeMembres, canSeeEvangelises, canSeeSuperviseur, canSeeResponsable, canSeeNewInCellule, canSeeAssignes]);

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
