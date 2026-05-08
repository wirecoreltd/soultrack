"use client";

import { useEffect, useState, useRef } from "react";
import supabase from "../lib/supabaseClient";

/**
 * PresenceDot
 * Props:
 *   - memberId  : string  (membre.id)
 *   - egliseId  : string  (userProfile.eglise_id)
 */
export default function PresenceDot({ memberId, egliseId }) {
  const [status, setStatus] = useState(null); // null=loading, 'grey','green','yellow','orange','red'
  const [open, setOpen] = useState(false);
  const [monthData, setMonthData] = useState([]); // [{ date, heure, present }]
  const [loadingPopup, setLoadingPopup] = useState(false);
  const popupRef = useRef(null);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const getWeekKey = (dateStr) => {
    const d = new Date(dateStr);
    // ISO week: Monday = start
    const day = d.getDay() === 0 ? 7 : d.getDay(); // 1=Mon … 7=Sun
    const monday = new Date(d);
    monday.setDate(d.getDate() - (day - 1));
    return monday.toISOString().slice(0, 10); // "YYYY-MM-DD" of Monday
  };

  // ── Calcul couleur ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!memberId || !egliseId) return;

    const compute = async () => {
      // 1. Récupérer tous les cultes des 8 dernières semaines (attendance)
      const since = new Date();
      since.setDate(since.getDate() - 56); // 8 semaines
      const sinceStr = since.toISOString().slice(0, 10);

      const { data: allCultes } = await supabase
        .from("attendance")
        .select("id, date")
        .eq("eglise_id", egliseId)
        .gte("date", sinceStr)
        .order("date", { ascending: false });

      if (!allCultes || allCultes.length === 0) {
        setStatus("grey");
        return;
      }

      // 2. Récupérer les présences du membre
      const { data: presences } = await supabase
        .from("presences")
        .select("attendance_id, date")
        .eq("membre_id", memberId);

      const presentAttendanceIds = new Set(
        (presences || []).map((p) => p.attendance_id)
      );

      if (presentAttendanceIds.size === 0 && allCultes.length > 0) {
        // Aucune présence enregistrée → gris
        setStatus("grey");
        return;
      }

      // 3. Grouper les cultes par semaine, noter si présent dans chaque semaine
      const weekMap = {}; // weekKey → { hasCulte, wasPresent }
      allCultes.forEach((c) => {
        const wk = getWeekKey(c.date);
        if (!weekMap[wk]) weekMap[wk] = { hasCulte: false, wasPresent: false };
        weekMap[wk].hasCulte = true;
        if (presentAttendanceIds.has(c.id)) weekMap[wk].wasPresent = true;
      });

      // 4. Trier les semaines du plus récent au plus ancien
      const weeks = Object.keys(weekMap).sort((a, b) =>
        b.localeCompare(a)
      );

      // 5. Compter semaines consécutives d'absence depuis la plus récente
      let consecutiveAbsent = 0;
      for (const wk of weeks) {
        if (!weekMap[wk].wasPresent) {
          consecutiveAbsent++;
        } else {
          break;
        }
      }

      // 6. Déterminer couleur
      if (consecutiveAbsent === 0) setStatus("green");
      else if (consecutiveAbsent === 1) setStatus("yellow");
      else if (consecutiveAbsent === 2) setStatus("orange");
      else setStatus("red");
    };

    compute();
  }, [memberId, egliseId]);

  // ── Données popup (mois en cours) ──────────────────────────────────────────
  const loadMonthData = async () => {
    setLoadingPopup(true);
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .slice(0, 10);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      .toISOString()
      .slice(0, 10);

    // Tous les cultes du mois
    const { data: cultes } = await supabase
      .from("attendance")
      .select("id, date, heure")
      .eq("eglise_id", egliseId)
      .gte("date", firstDay)
      .lte("date", lastDay)
      .order("date", { ascending: true });

    // Présences du membre ce mois
    const { data: presences } = await supabase
      .from("presences")
      .select("attendance_id")
      .eq("membre_id", memberId)
      .gte("date", firstDay)
      .lte("date", lastDay);

    const presentSet = new Set((presences || []).map((p) => p.attendance_id));

    const rows = (cultes || []).map((c) => ({
      date: c.date,
      heure: c.heure,
      present: presentSet.has(c.id),
    }));

    setMonthData(rows);
    setLoadingPopup(false);
  };

  const handleDotClick = (e) => {
    e.stopPropagation();
    if (!open) loadMonthData();
    setOpen((v) => !v);
  };

  // Fermer popup si clic dehors
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // ── Couleurs ───────────────────────────────────────────────────────────────
  const dotColors = {
    grey:   { bg: "#9ca3af", label: "Aucune donnée",      ring: "#d1d5db" },
    green:  { bg: "#22c55e", label: "Présent récemment",  ring: "#bbf7d0" },
    yellow: { bg: "#eab308", label: "1 sem. d'absence",   ring: "#fef08a" },
    orange: { bg: "#f97316", label: "2 sem. d'absence",   ring: "#fed7aa" },
    red:    { bg: "#ef4444", label: "3+ sem. d'absence",  ring: "#fecaca" },
  };

  const color = dotColors[status] ?? dotColors.grey;

  const formatDateFr = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  const formatHeure = (h) => {
    if (!h) return "";
    return h.slice(0, 5); // "HH:MM"
  };

  const now = new Date();
  const monthLabel = now.toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });

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

      {/* Popup */}
      {open && (
        <div
          style={{
            position: "absolute",
            zIndex: 100,
            bottom: "calc(100% + 10px)",
            left: "50%",
            transform: "translateX(-50%)",
            width: 280,
            background: "#1e1b4b",
            borderRadius: 14,
            boxShadow: "0 8px 32px rgba(0,0,0,0.45)",
            padding: "14px 16px",
            color: "white",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Flèche */}
          <div
            style={{
              position: "absolute",
              bottom: -7,
              left: "50%",
              transform: "translateX(-50%)",
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
              <p
                style={{
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "#a5b4fc",
                  marginBottom: 2,
                }}
              >
                Présences
              </p>
              <p style={{ fontSize: 14, fontWeight: 700, color: "white" }}>
                {monthLabel}
              </p>
            </div>
            {/* Badge statut */}
            <span
              style={{
                background: color.bg,
                color: "white",
                fontSize: 10,
                fontWeight: 700,
                padding: "3px 8px",
                borderRadius: 20,
                letterSpacing: "0.04em",
              }}
            >
              {color.label}
            </span>
          </div>

          {/* Liste cultes */}
          {loadingPopup ? (
            <p style={{ fontSize: 12, color: "#a5b4fc", textAlign: "center" }}>
              Chargement…
            </p>
          ) : monthData.length === 0 ? (
            <p style={{ fontSize: 12, color: "#a5b4fc", textAlign: "center" }}>
              Aucun culte enregistré ce mois-ci.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {monthData.map((row, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: row.present
                      ? "rgba(34,197,94,0.12)"
                      : "rgba(239,68,68,0.10)",
                    borderRadius: 8,
                    padding: "6px 10px",
                    borderLeft: `3px solid ${row.present ? "#22c55e" : "#ef4444"}`,
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "white",
                        textTransform: "capitalize",
                      }}
                    >
                      {formatDateFr(row.date)}
                    </p>
                    {row.heure && (
                      <p style={{ fontSize: 10, color: "#a5b4fc" }}>
                        {formatHeure(row.heure)}
                      </p>
                    )}
                  </div>
                  <span style={{ fontSize: 16 }}>
                    {row.present ? "✅" : "❌"}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Résumé */}
          {!loadingPopup && monthData.length > 0 && (
            <div
              style={{
                marginTop: 10,
                paddingTop: 8,
                borderTop: "1px solid rgba(165,180,252,0.2)",
                display: "flex",
                justifyContent: "space-between",
                fontSize: 11,
                color: "#a5b4fc",
              }}
            >
              <span>
                ✅ {monthData.filter((r) => r.present).length} présence
                {monthData.filter((r) => r.present).length > 1 ? "s" : ""}
              </span>
              <span>
                ❌ {monthData.filter((r) => !r.present).length} absence
                {monthData.filter((r) => !r.present).length > 1 ? "s" : ""}
              </span>
              <span>
                📊 {monthData.length} culte
                {monthData.length > 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
