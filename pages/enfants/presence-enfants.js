"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import supabase from "../../lib/supabaseClient";
import HeaderPages from "../../components/HeaderPages";
import Footer from "../../components/Footer";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useLang } from "../../hooks/useLang";

function getTranche(dateNaissance) {
  if (!dateNaissance) return { label: "—", color: "#e5e7eb" };
  const age = Math.floor((new Date() - new Date(dateNaissance)) / (1000 * 60 * 60 * 24 * 365.25));
  if (age <= 2)  return { label: "0-2 ans",   color: "#FCA5A5" };
  if (age <= 6)  return { label: "3-6 ans",   color: "#FCD34D" };
  if (age <= 12) return { label: "7-12 ans",  color: "#6EE7B7" };
  return          { label: "13-14 ans", color: "#93C5FD" };
}

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
};
const nowTime = () => new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

const translations = {
  fr: {
    title: "Présence",
    titleHighlight: "Enfants",
    checking: "Vérification...",
    todaySession: "Session en cours aujourd'hui",
    inProgress: "EN COURS",
    todaySub: "Une session a déjà été démarrée. Rejoignez-la ou créez-en une nouvelle.",
    rejoin: "Rejoindre →",
    newSession: "➕ Nouvelle session",
    startTitle: "Nouvelle session",
    startSub: "Configurez avant de démarrer",
    date: "📅 Date",
    heure: "🕐 Heure",
    start: "▶ Démarrer",
    cancel: "Annuler",
    absents: "⚪ Absents",
    presents: "✔ Présents",
    clickMark: "💡 Cliquer pour marquer présent",
    readOnly: "👁 Mode consultation",
    search: "🔍 Rechercher...",
    loading: "Chargement...",
    noChild: "Aucun enfant",
    allPresent: "✅ Tous présents !",
    noPresence: "Aucune présence",
    back: "↩ Retour",
    absent: "− Absent",
    recentSessions: "🕘 Sessions récentes",
    consult: "👁 Consulter",
    tranche02: "0-2 ans",
    tranche36: "3-6 ans",
    tranche712: "7-12 ans",
    tranche1314: "13-14 ans",
    total: "Total présents",
  },
  en: {
    title: "Children",
    titleHighlight: "Attendance",
    checking: "Checking...",
    todaySession: "Session in progress today",
    inProgress: "IN PROGRESS",
    todaySub: "A session was already started. Join it or create a new one.",
    rejoin: "Join →",
    newSession: "➕ New session",
    startTitle: "New session",
    startSub: "Configure before starting",
    date: "📅 Date",
    heure: "🕐 Time",
    start: "▶ Start",
    cancel: "Cancel",
    absents: "⚪ Absent",
    presents: "✔ Present",
    clickMark: "💡 Click to mark as present",
    readOnly: "👁 View mode",
    search: "🔍 Search...",
    loading: "Loading...",
    noChild: "No children",
    allPresent: "✅ Everyone is present!",
    noPresence: "No attendance recorded",
    back: "↩ Back",
    absent: "− Absent",
    recentSessions: "🕘 Recent sessions",
    consult: "👁 View",
    tranche02: "0-2 yrs",
    tranche36: "3-6 yrs",
    tranche712: "7-12 yrs",
    tranche1314: "13-14 yrs",
    total: "Total present",
  },
};

function formatSessionLabel(s, lang) {
  const locale = lang === "en" ? "en-GB" : "fr-FR";
  const d = new Date(s.date + "T00:00:00").toLocaleDateString(locale, { day: "2-digit", month: "long" });
  return `${d}${s.heure ? ` · ${s.heure}` : ""}`;
}

// ─── CARTE ABSENT ─────────────────────────────────────────────────────────────
function CarteAbsent({ enfant, onMark, readOnly }) {
  const tranche = getTranche(enfant.date_naissance);
  return (
    <div
      onClick={() => !readOnly && onMark(enfant)}
      className={`bg-white rounded-xl shadow px-4 py-3 flex items-center gap-3 border-l-4 ${readOnly ? "opacity-70" : "cursor-pointer hover:bg-green-50 transition"}`}
      style={{ borderLeftColor: tranche.color }}
    >
      <span className="w-5 h-5 flex-shrink-0 rounded border-2 border-gray-300 inline-block" />
      <div className="flex-1">
        <p className="font-semibold text-black text-sm">{enfant.prenom} {enfant.nom}</p>
        <p className="text-xs text-gray-400">{tranche.label}</p>
      </div>
    </div>
  );
}

// ─── CARTE PRÉSENT ────────────────────────────────────────────────────────────
function CartePresent({ presence, onUnmark, readOnly, t }) {
  const tranche = getTranche(presence.enfants?.date_naissance);
  return (
    <div
      className="bg-white rounded-xl shadow px-4 py-3 flex items-center gap-3 border-l-4"
      style={{ borderLeftColor: tranche.color }}
    >
      <span className="w-5 h-5 flex-shrink-0 rounded border-2 border-green-500 bg-green-500 inline-flex items-center justify-center text-white text-xs font-bold">✓</span>
      <div className="flex-1">
        <p className="font-semibold text-black text-sm">{presence.enfants?.prenom} {presence.enfants?.nom}</p>
        <p className="text-xs text-gray-400">{tranche.label}</p>
      </div>
      {!readOnly && (
        <button
          onClick={() => onUnmark(presence.enfant_id)}
          className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs flex-shrink-0"
        >
          {t.absent}
        </button>
      )}
    </div>
  );
}

// ─── COMPTEUR PAR TRANCHE ─────────────────────────────────────────────────────
function CompteurTranches({ presents, t }) {
  const compter = (label) => presents.filter(p => getTranche(p.enfants?.date_naissance).label === label).length;
  const tranches = [
    { label: "0-2 ans",   tKey: "tranche02", color: "#FCA5A5" },
    { label: "3-6 ans",   tKey: "tranche36", color: "#FCD34D" },
    { label: "7-12 ans",  tKey: "tranche712", color: "#6EE7B7" },
    { label: "13-14 ans", tKey: "tranche1314", color: "#93C5FD" },
  ];
  return (
    <div className="flex gap-2 justify-center mt-2 flex-wrap">
      {tranches.map(tr => {
        const n = compter(tr.label);
        if (n === 0) return null;
        return (
          <span key={tr.label}
            className="text-xs px-3 py-1 rounded-full font-semibold text-gray-800"
            style={{ background: tr.color }}>
            {t[tr.tKey]} : {n}
          </span>
        );
      })}
    </div>
  );
}

// ─── PAGE PRINCIPALE ──────────────────────────────────────────────────────────
export default function PresenceEnfants() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableEnfants"]} requiredFeature="enfants">
      <PresenceEnfantsContent />
    </ProtectedRoute>
  );
}

function PresenceEnfantsContent() {
  const { lang } = useLang();
  const t = translations[lang];

  const [etape, setEtape] = useState("check");
  const [sessionsRecentes, setSessionsRecentes] = useState([]);
  const [attendanceId, setAttendanceId] = useState(null);
  const [readOnly, setReadOnly] = useState(false);
  const [selectedDate, setSelectedDate] = useState(today());
  const [selectedTime, setSelectedTime] = useState(nowTime());
  const [saving, setSaving] = useState(false);
  const [allEnfants, setAllEnfants] = useState([]);
  const [presentList, setPresentList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [view, setView] = useState("absents");
  const [showForm, setShowForm] = useState(false);

  const profileRef = useRef(null);
  const attendanceIdRef = useRef(null);
  const selectedDateRef = useRef(selectedDate);

  useEffect(() => { selectedDateRef.current = selectedDate; }, [selectedDate]);
  useEffect(() => { attendanceIdRef.current = attendanceId; }, [attendanceId]);

  const initProfile = useCallback(async () => {
    if (profileRef.current) return;
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase
      .from("profiles").select("eglise_id, roles").eq("id", user.id).single();
    profileRef.current = { ...profile, uid: user.id };
  }, []);

  const fetchSessions = useCallback(async () => {
    await initProfile();
    const { eglise_id } = profileRef.current;
    const { data } = await supabase
      .from("attendance_enfants")
      .select("id, date, heure")
      .eq("eglise_id", eglise_id)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(10);
    setSessionsRecentes(data || []);
    setEtape("choix");
  }, [initProfile]);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  const fetchAll = useCallback(async (aId) => {
    await initProfile();
    const { eglise_id } = profileRef.current;
    const id = aId || attendanceIdRef.current;
    if (!id) return;

    const [{ data: enfantsData }, { data: presencesData }] = await Promise.all([
      supabase.from("enfants").select("*").eq("eglise_id", eglise_id).order("nom"),
      supabase.from("presences_enfants")
        .select("enfant_id, statut, enfants(prenom, nom, date_naissance)")
        .eq("attendance_enfant_id", id)
        .eq("statut", "present"),
    ]);

    const presentIds = new Set((presencesData || []).map(p => p.enfant_id));
    setAllEnfants((enfantsData || []).filter(e => !presentIds.has(e.id)));
    setPresentList(presencesData || []);
    setLoading(false);
  }, [initProfile]);

  const demarrerSession = async () => {
    setSaving(true);
    try {
      await initProfile();
      const { eglise_id, uid } = profileRef.current;
      const { data, error } = await supabase
        .from("attendance_enfants")
        .insert({ eglise_id, date: selectedDate, heure: selectedTime })
        .select("id").single();
      if (error) throw error;

      // Insérer tous les enfants comme absents
      const { data: enfants } = await supabase.from("enfants").select("id").eq("eglise_id", eglise_id);
      if (enfants?.length > 0) {
        const rows = enfants.map(e => ({
          enfant_id: e.id,
          attendance_enfant_id: data.id,
          date: selectedDate,
          statut: "absent",
          checked_by: uid,
        }));
        await supabase.from("presences_enfants").upsert(rows, { onConflict: "enfant_id,attendance_enfant_id", ignoreDuplicates: true });
      }

      setAttendanceId(data.id);
      attendanceIdRef.current = data.id;
      selectedDateRef.current = selectedDate;
      setReadOnly(false);
      setEtape("ready");
      setLoading(true);
      await fetchAll(data.id);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const rejoindreSession = async (session) => {
    setAttendanceId(session.id);
    attendanceIdRef.current = session.id;
    setSelectedDate(session.date);
    selectedDateRef.current = session.date;
    setReadOnly(false);
    setEtape("ready");
    setLoading(true);
    await fetchAll(session.id);
  };

  const consulterSession = async (session) => {
    setAttendanceId(session.id);
    attendanceIdRef.current = session.id;
    setSelectedDate(session.date);
    setReadOnly(true);
    setEtape("ready");
    setLoading(true);
    await fetchAll(session.id);
  };

  const markPresent = async (enfant) => {
    if (readOnly) return;
    setPresentList(prev => [...prev, {
      enfant_id: enfant.id, statut: "present",
      enfants: { prenom: enfant.prenom, nom: enfant.nom, date_naissance: enfant.date_naissance },
    }]);
    setAllEnfants(prev => prev.filter(e => e.id !== enfant.id));
    try {
      await supabase.from("presences_enfants")
        .update({ statut: "present", checked_by: profileRef.current.uid })
        .eq("enfant_id", enfant.id)
        .eq("attendance_enfant_id", attendanceIdRef.current);
    } catch (err) {
      console.error(err);
      await fetchAll();
    }
  };

  const markAbsent = async (enfantId) => {
    if (readOnly) return;
    const p = presentList.find(x => x.enfant_id === enfantId);
    if (p) {
      setPresentList(prev => prev.filter(x => x.enfant_id !== enfantId));
      setAllEnfants(prev => [...prev, {
        id: enfantId,
        prenom: p.enfants?.prenom,
        nom: p.enfants?.nom,
        date_naissance: p.enfants?.date_naissance,
      }].sort((a, b) => (a.nom || "").localeCompare(b.nom || "")));
    }
    try {
      await supabase.from("presences_enfants")
        .update({ statut: "absent" })
        .eq("enfant_id", enfantId)
        .eq("attendance_enfant_id", attendanceIdRef.current);
    } catch (err) {
      console.error(err);
    }
  };

  const filterE = (e) => `${e.prenom} ${e.nom}`.toLowerCase().includes(search.toLowerCase());
  const filterP = (p) => `${p.enfants?.prenom} ${p.enfants?.nom}`.toLowerCase().includes(search.toLowerCase());

  const locale = lang === "en" ? "en-GB" : "fr-FR";
  const todayStr = today();
  const todaySessions = sessionsRecentes.filter(s => s.date === todayStr);
  const oldSessions = sessionsRecentes.filter(s => s.date !== todayStr);

  // ━━━ CHECK ━━━
  if (etape === "check") {
    return (
      <div className="min-h-screen flex flex-col items-center p-6" style={{ background: "#333699" }}>
        <HeaderPages />
        <div className="flex flex-col items-center mt-10 gap-3">
          <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          <p className="text-white/70 text-sm">{t.checking}</p>
        </div>
        <Footer />
      </div>
    );
  }

  // ━━━ CHOIX ━━━
  if (etape === "choix") {
    return (
      <div className="min-h-screen flex flex-col items-center p-4 sm:p-6" style={{ background: "#333699" }}>
        <HeaderPages />
        <h1 className="text-2xl font-bold text-white text-center mt-4 mb-1">
          {t.title} <span className="text-emerald-300">{t.titleHighlight}</span>
        </h1>
        <p className="text-white/60 text-sm text-center mb-4">
          {new Date().toLocaleDateString(locale, { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
        </p>

        <div className="w-full max-w-lg flex flex-col gap-4">

          {/* Session du jour */}
          {todaySessions.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 pt-5 pb-3">
                <h2 className="text-base font-bold text-gray-800">{t.todaySession}</h2>
                <span className="flex items-center gap-1.5 bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                  {t.inProgress}
                </span>
              </div>
              <p className="text-sm text-gray-400 px-5 pb-3">{t.todaySub}</p>
              <div className="flex flex-col gap-2 px-5 pb-4">
                {todaySessions.map(s => (
                  <button key={s.id} onClick={() => rejoindreSession(s)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 border-[#333699] hover:bg-[#333699] hover:text-white text-[#333699] font-semibold transition group">
                    <span className="text-sm">{formatSessionLabel(s, lang)}</span>
                    <span className="text-xs bg-emerald-100 text-emerald-700 group-hover:bg-white/20 group-hover:text-white px-2 py-0.5 rounded-full">
                      {t.rejoin}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Formulaire nouvelle session */}
          {(todaySessions.length === 0 || showForm) && (
            <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col gap-4">
              <h2 className="font-bold text-gray-800">{t.startTitle}</h2>
              <p className="text-sm text-gray-400">{t.startSub}</p>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">{t.date}</label>
                  <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-gray-300 text-black" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">{t.heure}</label>
                  <input type="time" value={selectedTime} onChange={e => setSelectedTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-gray-300 text-black" />
                </div>
              </div>
              <button onClick={demarrerSession} disabled={saving}
                className={`w-full py-3 rounded-xl font-bold text-white text-base transition ${saving ? "bg-gray-300 cursor-not-allowed" : "bg-[#333699] hover:bg-[#2a2d80]"}`}>
                {saving ? "..." : t.start}
              </button>
              {showForm && (
                <button onClick={() => setShowForm(false)}
                  className="w-full py-2 rounded-xl text-sm text-gray-500 border border-gray-200 hover:bg-gray-50">
                  {t.cancel}
                </button>
              )}
            </div>
          )}

          {todaySessions.length > 0 && !showForm && (
            <button onClick={() => setShowForm(true)}
              className="w-full py-3 rounded-2xl border-2 border-dashed border-white/40 text-white/80 text-sm font-semibold hover:border-white hover:text-white hover:bg-white/10 transition">
              {t.newSession}
            </button>
          )}

          {/* Sessions récentes */}
          {oldSessions.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-white/70 text-sm font-semibold">{t.recentSessions}</p>
              {oldSessions.map(s => (
                <button key={s.id} onClick={() => consulterSession(s)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 text-white transition">
                  <span className="text-sm">{formatSessionLabel(s, lang)}</span>
                  <span className="text-xs text-white/60">{t.consult}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <Footer />
      </div>
    );
  }

  // ━━━ PRÉSENCE ━━━
  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6" style={{ background: "#333699" }}>
      <HeaderPages />

      <div className="text-center mb-4 mt-2 w-full">
        <h1 className="text-2xl font-bold text-white">
          {t.title} <span className="text-emerald-300">{t.titleHighlight}</span>
        </h1>
        <p className="text-white/60 text-sm mt-1">
          📅 {new Date(selectedDateRef.current + "T00:00:00").toLocaleDateString(locale, { day: "2-digit", month: "long", year: "numeric" })}
          {readOnly && <span className="ml-2 text-amber-300">· {t.readOnly}</span>}
        </p>
        {presentList.length > 0 && (
          <p className="text-white text-sm mt-1 font-semibold">{t.total} : {presentList.length}</p>
        )}
        <CompteurTranches presents={presentList} t={t} />
      </div>

      <div className="flex gap-3 mb-4">
        <button onClick={() => setView("absents")}
          className={`px-4 py-2 rounded text-sm font-semibold ${view === "absents" ? "bg-white text-[#333699]" : "bg-white/20 text-white"}`}>
          {t.absents} ({allEnfants.length})
        </button>
        <button onClick={() => setView("presents")}
          className={`px-4 py-2 rounded text-sm font-semibold ${view === "presents" ? "bg-green-400 text-black" : "bg-white/20 text-white"}`}>
          {t.presents} ({presentList.length})
        </button>
      </div>

      {view === "absents" && !readOnly && (
        <p className="text-amber-300 text-sm mb-2 italic">{t.clickMark}</p>
      )}

      <div className="w-full max-w-4xl flex justify-center mb-4">
        <input type="text" placeholder={t.search} value={search} onChange={e => setSearch(e.target.value)}
          className="w-full sm:w-2/3 px-3 py-2 rounded-md border text-black" />
      </div>

      {loading ? (
        <p className="text-white text-center">{t.loading}</p>
      ) : (
        <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 gap-2">
          {view === "absents"
            ? allEnfants.filter(filterE).length === 0
              ? <p className="text-white text-center col-span-full">{t.allPresent}</p>
              : allEnfants.filter(filterE).map(e => (
                  <CarteAbsent key={e.id} enfant={e} onMark={markPresent} readOnly={readOnly} />
                ))
            : presentList.filter(filterP).length === 0
              ? <p className="text-white text-center col-span-full">{t.noPresence}</p>
              : presentList.filter(filterP).map(p => (
                  <CartePresent key={p.enfant_id} presence={p} onUnmark={markAbsent} readOnly={readOnly} t={t} />
                ))
          }
        </div>
      )}

      <button onClick={() => { setEtape("check"); fetchSessions(); }}
        className="mt-8 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm">
        {t.back}
      </button>

      <Footer />
    </div>
  );
}
