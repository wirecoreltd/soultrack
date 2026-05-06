"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import supabase from "../lib/supabaseClient";

// ─── Rôles par type de notification ──────────────────────────────────────────
const ROLES_NOUVEAUX_MEMBRES    = ["Administrateur", "ResponsableIntegration"];
const ROLES_NOUVEAUX_EVANGELISES = ["Administrateur", "ResponsableEvangelisation"];

export default function NotificationBell({ egliseId, userRole }) {
  const [countMembres, setCountMembres]       = useState(0);
  const [countEvangelises, setCountEvangelises] = useState(0);
  const [isNew, setIsNew]                     = useState(false);
  const router     = useRouter();
  const channelRef = useRef(null);

  const canSeeMembres     = ROLES_NOUVEAUX_MEMBRES.includes(userRole);
  const canSeeEvangelises = ROLES_NOUVEAUX_EVANGELISES.includes(userRole);

  // ─── Total affiché sur le badge ───────────────────────────────────────────
  const totalCount = (canSeeMembres ? countMembres : 0)
                   + (canSeeEvangelises ? countEvangelises : 0);

  // ─── Chargement initial ───────────────────────────────────────────────────
  useEffect(() => {
    if (!egliseId) return;

    const fetchCounts = async () => {
      // Nouveaux membres
      if (canSeeMembres) {
        const { count: total } = await supabase
          .from("membres_complets")
          .select("id", { count: "exact", head: true })
          .eq("eglise_id", egliseId)
          .eq("etat_contact", "nouveau");
        setCountMembres(total || 0);
      }

      // Évangélisés non envoyés
      if (canSeeEvangelises) {
        const { count: total } = await supabase
          .from("evangelises")
          .select("id", { count: "exact", head: true })
          .eq("eglise_id", egliseId)
          .eq("status_suivi", "Non envoyé");
        setCountEvangelises(total || 0);
      }
    };

    fetchCounts();
  }, [egliseId, canSeeMembres, canSeeEvangelises]);

  // ─── Realtime ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!egliseId) return;

    if (channelRef.current) {
      try { supabase.removeChannel(channelRef.current); } catch (_) {}
    }

    const channel = supabase.channel(`notif-bell-${egliseId}`);

    // ── Membres ──
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

    // ── Évangélisés ──
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

    channel.subscribe();
    channelRef.current = channel;

    return () => {
      try { supabase.removeChannel(channel); } catch (_) {}
    };
  }, [egliseId, canSeeMembres, canSeeEvangelises]);

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
          <span
            style={{
              position: "absolute",
              top: "-5px",
              right: "-6px",
              background: "#ef4444",
              color: "#fff",
              fontSize: "9px",
              fontWeight: "800",
              borderRadius: "9999px",
              minWidth: "16px",
              height: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 3px",
              boxShadow: "0 0 0 2px #333699",
              lineHeight: 1,
            }}
          >
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
