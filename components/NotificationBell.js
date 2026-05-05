"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import supabase from "../lib/supabaseClient";

export default function NotificationBell({ egliseId }) {
  const [count, setCount] = useState(0);
  const [isNew, setIsNew] = useState(false);
  const router = useRouter();
  const channelRef = useRef(null);

  // ─── Chargement initial ───────────────────────────────────────────────────
  useEffect(() => {
    if (!egliseId) return;

    const fetchCount = async () => {
      const { count: total } = await supabase
        .from("membres_complets")
        .select("id", { count: "exact", head: true })
        .eq("eglise_id", egliseId)
        .eq("etat_contact", "nouveau");
      setCount(total || 0);
    };

    fetchCount();
  }, [egliseId]);

  // ─── Realtime ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!egliseId) return;

    if (channelRef.current) {
      try { supabase.removeChannel(channelRef.current); } catch (_) {}
    }

    const channel = supabase
      .channel(`notif-bell-${egliseId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "membres_complets" },
        (payload) => {
          const row = payload.new;
          if (row.eglise_id === egliseId && row.etat_contact === "nouveau") {
            setCount((prev) => prev + 1);
            setIsNew(true);
            setTimeout(() => setIsNew(false), 2000);
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "membres_complets" },
        (payload) => {
          const row = payload.new;
          if (row.eglise_id === egliseId && row.etat_contact !== "nouveau") {
            setCount((prev) => Math.max(0, prev - 1));
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      try { supabase.removeChannel(channel); } catch (_) {}
    };
  }, [egliseId]);

  return (
    <>
      <button
        onClick={() => router.push("/notifications")}
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
        {count > 0 && (
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
            {count > 99 ? "99+" : count}
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
