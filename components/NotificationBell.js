"use client";
import { useEffect, useState, useRef } from "react";
import supabase from "../lib/supabaseClient";

/**
 * NotificationBell — Composant centralisé de notifications
 * 
 * Utilisation sur n'importe quelle page :
 *   import NotificationBell from "../components/NotificationBell";
 *   <NotificationBell egliseId={userProfile.eglise_id} />
 * 
 * Pour ajouter de nouveaux types de notifications dans le futur,
 * ajouter une entrée dans le tableau NOTIFICATION_TYPES ci-dessous.
 */

// ─── Configuration des types de notifications ────────────────────────────────
const NOTIFICATION_TYPES = [
  {
    key: "nouveaux_membres",
    label: "Nouveaux membres",
    icon: "👥",
    color: "#f97316", // orange
    table: "membres_complets",
    filter: (row, egliseId) =>
      row.eglise_id === egliseId && row.etat_contact === "nouveau",
    // Quand un membre passe de "nouveau" à autre chose, on le retire
    shouldRemoveOnUpdate: (row) => row.etat_contact !== "nouveau",
    formatItem: (m) => ({
      id: m.id,
      title: `${m.prenom || ""} ${m.nom || ""}`.trim(),
      subtitle: m.ville || "",
      date: m.created_at,
    }),
    fetchQuery: (egliseId) =>
      supabase
        .from("membres_complets")
        .select("id, prenom, nom, ville, created_at")
        .eq("eglise_id", egliseId)
        .eq("etat_contact", "nouveau")
        .order("created_at", { ascending: false }),
  },

  // ─── Ajouter d'autres types ici dans le futur ───
  // {
  //   key: "suivis_en_attente",
  //   label: "Suivis en attente",
  //   icon: "⏳",
  //   color: "#8b5cf6",
  //   table: "suivi_assignments",
  //   ...
  // },
];

// ─── Utilitaire date ─────────────────────────────────────────────────────────
function formatDateFr(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ─── Composant principal ─────────────────────────────────────────────────────
export default function NotificationBell({ egliseId }) {
  // Structure : { [key]: NotifItem[] }
  const [notifsByType, setNotifsByType] = useState(() =>
    Object.fromEntries(NOTIFICATION_TYPES.map((t) => [t.key, []]))
  );
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(NOTIFICATION_TYPES[0].key);
  const [isNew, setIsNew] = useState(false); // animation quand nouvelle notif
  const containerRef = useRef(null);
  const channelsRef = useRef([]);

  // ─── Chargement initial ───────────────────────────────────────────────────
  useEffect(() => {
    if (!egliseId) return;

    const loadAll = async () => {
      const updates = {};
      for (const type of NOTIFICATION_TYPES) {
        const { data } = await type.fetchQuery(egliseId);
        updates[type.key] = (data || []).map(type.formatItem);
      }
      setNotifsByType(updates);
    };

    loadAll();
  }, [egliseId]);

  // ─── Realtime ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!egliseId) return;

    // Nettoyer les anciens channels
    channelsRef.current.forEach((ch) => {
      try { supabase.removeChannel(ch); } catch (_) {}
    });
    channelsRef.current = [];

    NOTIFICATION_TYPES.forEach((type) => {
      const channel = supabase
        .channel(`notif-${type.key}-${egliseId}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: type.table },
          (payload) => {
            const row = payload.new;
            if (!type.filter(row, egliseId)) return;
            const item = type.formatItem(row);
            setNotifsByType((prev) => ({
              ...prev,
              [type.key]: [item, ...prev[type.key]],
            }));
            // Animation cloche
            setIsNew(true);
            setTimeout(() => setIsNew(false), 2000);
          }
        )
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: type.table },
          (payload) => {
            const row = payload.new;
            if (type.shouldRemoveOnUpdate?.(row)) {
              setNotifsByType((prev) => ({
                ...prev,
                [type.key]: prev[type.key].filter((x) => x.id !== row.id),
              }));
            }
          }
        )
        .subscribe();

      channelsRef.current.push(channel);
    });

    return () => {
      channelsRef.current.forEach((ch) => {
        try { supabase.removeChannel(ch); } catch (_) {}
      });
      channelsRef.current = [];
    };
  }, [egliseId]);

  // ─── Fermer au clic extérieur ─────────────────────────────────────────────
  useEffect(() => {
    const handle = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  // ─── Total toutes catégories ──────────────────────────────────────────────
  const totalCount = Object.values(notifsByType).reduce(
    (sum, arr) => sum + arr.length,
    0
  );

  const activeType = NOTIFICATION_TYPES.find((t) => t.key === activeTab);
  const activeItems = notifsByType[activeTab] || [];

  return (
    <div className="relative" ref={containerRef}>
      {/* ── Bouton cloche ── */}
      <button
        onClick={() => setOpen((o) => !o)}
        title="Notifications"
        style={{
          position: "relative",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          fontSize: "1.6rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          animation: isNew ? "bellRing 0.5s ease-in-out 3" : "none",
        }}
      >
        🔔
        {totalCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: "-4px",
              right: "-4px",
              background: "#ef4444",
              color: "#fff",
              fontSize: "10px",
              fontWeight: "700",
              borderRadius: "9999px",
              minWidth: "18px",
              height: "18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 3px",
              boxShadow: "0 0 0 2px #333699",
            }}
          >
            {totalCount > 99 ? "99+" : totalCount}
          </span>
        )}
      </button>

      {/* ── Panneau déroulant ── */}
      {open && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 10px)",
            width: "300px",
            background: "#fff",
            borderRadius: "14px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
            zIndex: 1000,
            overflow: "hidden",
            border: "1px solid #e5e7eb",
          }}
        >
          {/* Header */}
          <div
            style={{
              background: "#333699",
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ color: "#fff", fontWeight: "700", fontSize: "14px" }}>
              🔔 Notifications
            </span>
            <span
              style={{
                background: "#ef4444",
                color: "#fff",
                fontSize: "11px",
                fontWeight: "700",
                borderRadius: "999px",
                padding: "1px 8px",
              }}
            >
              {totalCount}
            </span>
          </div>

          {/* Tabs (si plusieurs types dans le futur) */}
          {NOTIFICATION_TYPES.length > 1 && (
            <div
              style={{
                display: "flex",
                borderBottom: "1px solid #f3f4f6",
                background: "#fafafa",
              }}
            >
              {NOTIFICATION_TYPES.map((type) => (
                <button
                  key={type.key}
                  onClick={() => setActiveTab(type.key)}
                  style={{
                    flex: 1,
                    padding: "8px 4px",
                    fontSize: "11px",
                    fontWeight: activeTab === type.key ? "700" : "400",
                    color: activeTab === type.key ? type.color : "#9ca3af",
                    background: "transparent",
                    border: "none",
                    borderBottom:
                      activeTab === type.key
                        ? `2px solid ${type.color}`
                        : "2px solid transparent",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {type.icon} {type.label}
                  {notifsByType[type.key].length > 0 && (
                    <span
                      style={{
                        marginLeft: "4px",
                        background: type.color,
                        color: "#fff",
                        borderRadius: "999px",
                        padding: "0 5px",
                        fontSize: "10px",
                      }}
                    >
                      {notifsByType[type.key].length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Liste */}
          <div style={{ maxHeight: "280px", overflowY: "auto" }}>
            {activeItems.length === 0 ? (
              <div
                style={{
                  padding: "24px 16px",
                  textAlign: "center",
                  color: "#9ca3af",
                  fontSize: "13px",
                }}
              >
                <div style={{ fontSize: "28px", marginBottom: "8px" }}>✅</div>
                Aucune notification pour le moment
              </div>
            ) : (
              activeItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: "10px 16px",
                    borderBottom: "1px solid #f3f4f6",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#fff7ed")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      background: activeType?.color + "20",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "16px",
                      flexShrink: 0,
                    }}
                  >
                    {activeType?.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontWeight: "600",
                        fontSize: "13px",
                        color: "#111827",
                        margin: 0,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {item.title}
                    </p>
                    {item.subtitle && (
                      <p
                        style={{
                          fontSize: "11px",
                          color: "#6b7280",
                          margin: "1px 0 0",
                        }}
                      >
                        🏙️ {item.subtitle}
                      </p>
                    )}
                    <p style={{ fontSize: "11px", color: "#d1d5db", margin: "2px 0 0" }}>
                      {formatDateFr(item.date)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {activeItems.length > 0 && (
            <div
              style={{
                padding: "10px 16px",
                borderTop: "1px solid #f3f4f6",
                textAlign: "center",
                fontSize: "12px",
                color: "#9ca3af",
                background: "#fafafa",
              }}
            >
              {activeItems.length} notification{activeItems.length > 1 ? "s" : ""}
            </div>
          )}
        </div>
      )}

      {/* ── Animation CSS cloche ── */}
      <style>{`
        @keyframes bellRing {
          0%   { transform: rotate(0deg); }
          20%  { transform: rotate(15deg); }
          40%  { transform: rotate(-15deg); }
          60%  { transform: rotate(10deg); }
          80%  { transform: rotate(-10deg); }
          100% { transform: rotate(0deg); }
        }
      `}</style>
    </div>
  );
}
