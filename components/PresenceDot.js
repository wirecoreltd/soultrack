"use client";

import { useEffect, useState, useRef } from "react";
import supabase from "../lib/supabaseClient";

/**
 * PresenceDot v2
 * Props:
 *   - memberId  : string  (membre.id)
 *   - egliseId  : string  (userProfile.eglise_id)
 *   - dateVenu  : string  (membre.date_venu — filtre les cultes avant l'arrivée)
 */
export default function PresenceDot({ memberId, egliseId, dateVenu }) {
  const [status, setStatus] = useState(null);
  const [open, setOpen] = useState(false);
  const [monthData, setMonthData] = useState([]);
  const [loadingPopup, setLoadingPopup] = useState(false);
  const popupRef = useRef(null);

  const getWeekKey = (dateStr) => {
    const d = new Date(dateStr);
    const day = d.getDay() === 0 ? 7 : d.getDay();
    const monday = new Date(d);
    monday.setDate(d.getDate() - (day - 1));
    return monday.toISOString().slice(0, 10);
  };

  // ── Calcul couleur ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!memberId || !egliseId) return;

    const compute = async () => {
      const since = new Date();
      since.setDate(since.getDate() - 35);
      const sinceStr = since.toISOString().slice(0, 10);

      const effectiveSince =
        dateVenu && dateVenu > sinceStr ? dateVenu : sinceStr;

      // ✅ CORRECTION : filtrer uniquement statut = 'present'
      const { data: presences } = await supabase
        .from("presences")
        .select(`
          attendance_id,
          attendance:attendance_id (
            date
          )
        `)
        .eq("membre_id", memberId)
        .eq("statut", "present"); // ← AJOUT CRITIQUE

      if (!presences || presences.length === 0) {
        setStatus("grey");
        return;
      }

      const dates = presences
        .map((p) => p.attendance?.date)
        .filter(Boolean)
        .sort((a, b) => new Date(b) - new Date(a));

      if (dates.length === 0) {
        setStatus("grey");
        return;
      }

      const lastPresence = new Date(dates[0]);
      const diffDays = Math.floor(
        (new Date() - lastPresence) / (1000 * 60 * 60 * 24)
      );

      if (diffDays <= 7) {
        setStatus("green");
      } else if (diffDays <= 14) {
        setStatus("yellow");
      } else if (diffDays <= 21) {
        setStatus("orange");
      } else {
        setStatus("red");
      }
    };

    compute();
  }, [memberId, egliseId, dateVenu]);

  // ── Données popup ──────────────────────────────────────────────────────────
  const loadMonthData = async () => {
    setLoadingPopup(true);

    const since = new Date();
    since.setDate(since.getDate() - 35);
    const sinceStr = since.toISOString().slice(0, 10);
    const todayStr = new Date().toISOString().slice(0, 10);

    const effectiveSince =
      dateVenu && dateVenu > sinceStr ? dateVenu : sinceStr;

    // Tous les cultes dans la fenêtre
    const { data: cultes } = await supabase
      .from("attendance")
      .select("id, date, heure, typeTemps, numero_culte")
      .eq("eglise_id", egliseId)
      .gte("date", effectiveSince)
      .lte("date", todayStr)
      .order("date", { ascending: false });

    // ✅ CORRECTION : filtrer uniquement statut = 'present'
    const { data: presences } = await supabase
      .from("presences")
      .select("attendance_id")
      .eq("membre_id", memberId)
      .eq("statut", "present"); // ← AJOUT CRITIQUE

    const presentSet = new Set(
      (presences || []).map((p) => p.attendance_id)
    );

    setMonthData(
      (cultes || []).map((c) => ({
        date: c.date,
        heure: c.heure,
        typeTemps: c.typeTemps,
        numeroCulte: c.numero_culte,
        present: presentSet.has(c.id),
      }))
    );

    setLoadingPopup(false);
  };

  const handleDotClick = (e) => {
    e.stopPropagation();
    if (!open) loadMonthData();
    setOpen((v) => !v);
  };

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // ── Couleurs ───────────────────────────────────────────────────────────────
  const dotColors = {
    grey:   { bg: "#9ca3af", label: "Aucune donnée",     ring: "#d1d5db" },
    green:  { bg: "#22c55e", label: "Présent récemment", ring: "#bbf7d0" },
    yellow: { bg: "#eab308", label: "1 sem. d'absence",  ring: "#fef08a" },
    orange: { bg: "#f97316", label: "2 sem. d'absence",  ring: "#fed7aa" },
    red:    { bg: "#ef4444", label: "3+ sem. d'absence", ring: "#fecaca" },
  };
  const color = dotColors[status] ?? dotColors.grey;

  const formatDateFr = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      weekday: "long", day: "numeric", month: "long",
    });
  };

  const formatSessionLabel = (row) => {
    const culte = row.numeroCulte
      ? ` — ${row.numeroCulte}${row.numeroCulte === 1 ? "er" : "ème"} culte`
      : "";
    return `${row.typeTemps || "Session"}${culte}`;
  };

  const monthLabel = "5 dernières semaines";

  // ── Rendu ──────────────────────────────────────────────────────────────────
  return (
    <div className="relative inline-block" ref={popupRef}>

      {/* Le rond */}
      <button
        onClick={handleDotClick}
        title={color.label}
        style={{
          width: 14,
          height: 14,
          borderRadius: "50%",
          background: status ? color.bg : "#e5e7eb",
          boxShadow: status ? `0 0 0 3px ${color.ring}` : "none",
          border: "none",
          cursor: "pointer",
          display: "inline-block",
          transition: "transform 0.15s",
          flexShrink: 0,
        }}
        className="hover:scale-125"
      />

      {/* Popup vers le BAS, aligné à droite */}
      {open && (
        <div
          style={{
            position: "absolute",
            zIndex: 100,
            top: "calc(100% + 10px)",
            right: 0,
            width: 280,
            background: "#1e1b4b",
            borderRadius: 14,
            boxShadow: "0 8px 32px rgba(0,0,0,0.45)",
            padding: "14px 16px",
            color: "white",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Flèche pointant vers le haut */}
          <div
            style={{
              position: "absolute",
              top: -7,
              right: 4,
              width: 14,
              height: 14,
              background: "#1e1b4b",
              borderRadius: 2,
              rotate: "45deg",
            }}
          />

          {/* En-tête */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "#a5b4fc", marginBottom: 2 }}>
                Présences
              </p>
              <p style={{ fontSize: 14, fontWeight: 700 }}>{monthLabel}</p>
            </div>
            <span style={{ background: color.bg, color: "white", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20 }}>
              {color.label}
            </span>
          </div>

          {/* Liste */}
          {loadingPopup ? (
            <p style={{ fontSize: 12, color: "#a5b4fc", textAlign: "center" }}>Chargement…</p>
          ) : monthData.length === 0 ? (
            <p style={{ fontSize: 12, color: "#a5b4fc", textAlign: "center" }}>Aucune session sur cette période.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {monthData.map((row, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: row.present ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.10)",
                    borderRadius: 8,
                    padding: "6px 10px",
                    borderLeft: `3px solid ${row.present ? "#22c55e" : "#ef4444"}`,
                  }}
                >
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "white", textTransform: "capitalize" }}>
                      {formatDateFr(row.date)}
                    </p>
                    <p style={{ fontSize: 10, color: "#a5b4fc" }}>
                      {formatSessionLabel(row)}{row.heure ? ` · ${row.heure.slice(0, 5)}` : ""}
                    </p>
                  </div>
                  <span style={{ fontSize: 16 }}>{row.present ? "✅" : "❌"}</span>
                </div>
              ))}
            </div>
          )}

          {/* Résumé */}
          {!loadingPopup && monthData.length > 0 && (
            <div style={{ marginTop: 10, paddingTop: 8, borderTop: "1px solid rgba(165,180,252,0.2)", display: "flex", justifyContent: "space-between", fontSize: 11, color: "#a5b4fc" }}>
              <span>✅ {monthData.filter((r) => r.present).length} présence{monthData.filter((r) => r.present).length > 1 ? "s" : ""}</span>
              <span>❌ {monthData.filter((r) => !r.present).length} absence{monthData.filter((r) => !r.present).length > 1 ? "s" : ""}</span>
              <span>📊 {monthData.length} session{monthData.length > 1 ? "s" : ""}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
