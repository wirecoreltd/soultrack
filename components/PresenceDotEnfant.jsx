"use client";

import { useEffect, useState, useRef } from "react";
import supabase from "../lib/supabaseClient";
import { useLang } from "../hooks/useLang";

const translations = {
  fr: {
    aucuneDonnee: "Aucune donnée",
    presentRecemment: "Présent récemment",
    abs1sem: "1 sem. d'absence",
    abs2sem: "2 sem. d'absence",
    abs3sem: "3+ sem. d'absence",
    presences: "Présences",
    cinqSemaines: "5 dernières semaines",
    chargement: "Chargement…",
    aucuneSession: "Aucune session sur cette période.",
    presence: "présence",
    presences_pl: "présences",
    absence: "absence",
    absences_pl: "absences",
    session: "session",
    sessions_pl: "sessions",
    culte: "culte",
    er: "er",
    eme: "ème",
    sessionLabel: "Session",
  },
  en: {
    aucuneDonnee: "No data",
    presentRecemment: "Present recently",
    abs1sem: "1 week absent",
    abs2sem: "2 weeks absent",
    abs3sem: "3+ weeks absent",
    presences: "Attendance",
    cinqSemaines: "Last 5 weeks",
    chargement: "Loading…",
    aucuneSession: "No sessions in this period.",
    presence: "attendance",
    presences_pl: "attendances",
    absence: "absence",
    absences_pl: "absences",
    session: "session",
    sessions_pl: "sessions",
    culte: "service",
    er: "st",
    eme: "th",
    sessionLabel: "Session",
  },
};

/**
 * PresenceDotEnfant
 * Props:
 *   - enfantId  : string  (enfant.id)
 *   - egliseId  : string  (userProfile.eglise_id)
 *   - dateVenu  : string  (enfant.date_venu)
 */
export default function PresenceDotEnfant({ enfantId, egliseId, dateVenu }) {
  const { lang } = useLang();
  const t = translations[lang];

  const [status, setStatus] = useState(null);
  const [open, setOpen] = useState(false);
  const [monthData, setMonthData] = useState([]);
  const [loadingPopup, setLoadingPopup] = useState(false);
  const popupRef = useRef(null);

  // ── Calcul couleur ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!enfantId || !egliseId) return;

    const compute = async () => {
      const since = new Date();
      since.setDate(since.getDate() - 35);
      const sinceStr = since.toISOString().slice(0, 10);
      const effectiveSince =
        dateVenu && dateVenu > sinceStr ? dateVenu : sinceStr;

      const { data: presences } = await supabase
        .from("presences_enfants")
        .select("date")
        .eq("enfant_id", enfantId)
        .eq("statut", "present")
        .gte("date", effectiveSince);

      if (!presences || presences.length === 0) {
        setStatus("grey");
        return;
      }

      const dates = presences
        .map((p) => p.date)
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

      if (diffDays <= 7)       setStatus("green");
      else if (diffDays <= 14) setStatus("yellow");
      else if (diffDays <= 21) setStatus("orange");
      else                     setStatus("red");
    };

    compute();
  }, [enfantId, egliseId, dateVenu]);

  // ── Données popup ────────────────────────────────────────────────────────────
  const loadMonthData = async () => {
    setLoadingPopup(true);

    const since = new Date();
    since.setDate(since.getDate() - 35);
    const sinceStr = since.toISOString().slice(0, 10);
    const todayStr = new Date().toISOString().slice(0, 10);
    const effectiveSince =
      dateVenu && dateVenu > sinceStr ? dateVenu : sinceStr;

    // Fetch sessions enfants for this church in the period
    const { data: sessions } = await supabase
      .from("attendance_enfants")
      .select("id, date, heure, typeTemps, numero_culte")
      .eq("eglise_id", egliseId)
      .gte("date", effectiveSince)
      .lte("date", todayStr)
      .order("date", { ascending: false });

    // Fetch this child's presences
    const { data: presences } = await supabase
      .from("presences_enfants")
      .select("attendance_enfant_id")
      .eq("enfant_id", enfantId)
      .eq("statut", "present");

    const presentSet = new Set(
      (presences || []).map((p) => p.attendance_enfant_id)
    );

    setMonthData(
      (sessions || []).map((s) => ({
        date: s.date,
        heure: s.heure,
        typeTemps: s.typeTemps,
        numeroCulte: s.numero_culte,
        present: presentSet.has(s.id),
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

  // ── Couleurs ─────────────────────────────────────────────────────────────────
  const dotColors = {
    grey:   { bg: "#9ca3af", label: t.aucuneDonnee,     ring: "#d1d5db" },
    green:  { bg: "#22c55e", label: t.presentRecemment, ring: "#bbf7d0" },
    yellow: { bg: "#eab308", label: t.abs1sem,          ring: "#fef08a" },
    orange: { bg: "#f97316", label: t.abs2sem,          ring: "#fed7aa" },
    red:    { bg: "#ef4444", label: t.abs3sem,          ring: "#fecaca" },
  };
  const color = dotColors[status] ?? dotColors.grey;

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString(lang === "en" ? "en-GB" : "fr-FR", {
      weekday: "long", day: "numeric", month: "long",
    });
  };

  const formatSessionLabel = (row) => {
    if (!row.numeroCulte) return row.typeTemps || t.sessionLabel;
    const suffix = row.numeroCulte === 1 ? t.er : t.eme;
    return `${row.typeTemps || t.sessionLabel} — ${row.numeroCulte}${suffix} ${t.culte}`;
  };

  const presenceCount = monthData.filter((r) => r.present).length;
  const absenceCount  = monthData.filter((r) => !r.present).length;
  const sessionCount  = monthData.length;

  // ── Rendu ─────────────────────────────────────────────────────────────────────
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
          {/* Flèche */}
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
                {t.presences}
              </p>
              <p style={{ fontSize: 14, fontWeight: 700 }}>{t.cinqSemaines}</p>
            </div>
            <span style={{ background: color.bg, color: "white", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20 }}>
              {color.label}
            </span>
          </div>

          {/* Liste */}
          {loadingPopup ? (
            <p style={{ fontSize: 12, color: "#a5b4fc", textAlign: "center" }}>{t.chargement}</p>
          ) : monthData.length === 0 ? (
            <p style={{ fontSize: 12, color: "#a5b4fc", textAlign: "center" }}>{t.aucuneSession}</p>
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
                      {formatDate(row.date)}
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
              <span>✅ {presenceCount} {presenceCount > 1 ? t.presences_pl : t.presence}</span>
              <span>❌ {absenceCount} {absenceCount > 1 ? t.absences_pl : t.absence}</span>
              <span>📊 {sessionCount} {sessionCount > 1 ? t.sessions_pl : t.session}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
