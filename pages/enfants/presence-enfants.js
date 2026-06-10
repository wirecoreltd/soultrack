"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import supabase from "../../lib/supabaseClient";
import HeaderPages from "../../components/HeaderPages";
import ProtectedRoute from "../../components/ProtectedRoute";
import Footer from "../../components/Footer";
import { useLang } from "../../hooks/useLang";

// ─── COULEURS PAR TRANCHE D'ÂGE ──────────────────────────────────────────────
function getTranche(dateNaissance) {
  if (!dateNaissance) return { label: "—", color: "#e5e7eb" };
  const age = Math.floor((new Date() - new Date(dateNaissance)) / (1000 * 60 * 60 * 24 * 365.25));
  if (age <= 6)  return { label: "3-6 ans",  color: "#FCD34D" };
  if (age <= 13) return { label: "7-12 ans", color: "#6EE7B7" };
  return                { label: "13-14 ans", color: "#93C5FD" };
}

// ─── TRADUCTIONS ──────────────────────────────────────────────────────────────
const translations = {
  fr: {
    checking: "Vérification des sessions...",
    title: "📋 Présences",
    titleConsultation: "Présences — Consultation",
    titleJour: "Présences du",
    titleJourHighlight: "jour",
    todaySessions: "Session en cours",
    todaySessionsBadge: "EN COURS",
    todaySessionsSub: "Une session a déjà été démarrée aujourd'hui. Rejoignez-la ou créez-en une nouvelle.",
    rejoinBtn: "Rejoindre →",
    newSession: "➕ Créer une nouvelle session",
    newSessionTitle: "📋 Nouvelle Session",
    newSessionSub: "Configurez la session avant de commencer",
    backToExisting: "← Revenir aux sessions existantes",
    oldSessions: "🕘 Sessions récentes",
    oldSessionsHide: "▲ Masquer",
    oldSessionsShow: "▼ Afficher",
    consulter: "👁 Consulter",
    absents: "⚪ Absents",
    presents: "✔ Présents",
    clickToMarkPresent: "💡 Cliquer sur un nom pour marquer comme présent",
    readOnlyHint: "👁 Mode consultation — modifications désactivées",
    search: "🔍 Rechercher...",
    loading: "Chargement...",
    noChildren: "Aucun enfant visible",
    allPresent: "✅ Tout le monde est présent",
    noPresence: "Aucune présence",
    newSessionBtn: "↩ Nouvelle session",
    backBtn: "↩ Retour aux sessions",
    addChild: "➕ Ajouter un enfant",
    editSession: "✏️ Modifier la session",
    clickToEdit: "Cliquer pour modifier",
    consultMode: "👁 Mode consultation",
    consultSub: "liste en lecture seule",
    back: "← Retour",
    absent: "− Absent",
    tranche36: "3-6 ans",
    tranche712: "7-12 ans",
    tranche1314: "13-14 ans",
    total: "Total présents",
    editable: "✏️ Modifier",
    archived: "👁 Consulter",
    sectionEditable: "Sessions modifiables",
    sectionArchived: "Sessions archivées",
    editableInfo: "Ces sessions ont moins de 7 jours. Vous pouvez encore modifier les présences. Passé ce délai, elles passent automatiquement en lecture seule.",
    archivedInfo: "Ces sessions ont plus de 7 jours. Les présences sont visibles mais ne peuvent plus être modifiées.",
    expiresIn: "expire dans",
    day: "jour",
    days: "jours",
    form: {
      date: "📅 Date",
      heure: "🕐 Heure",
      selectType: "Sélectionner un Type de Temps",
      newType: "➕ Nouveau type...",
      newTypeName: "✏️ Nom du nouveau type",
      newTypePlaceholder: "Ex: Culte Enfants, Retraite...",
      chars: "caractères",
      sessionNum: "🔢 Numéro de session",
      sessionNumOptional: "(optionnel)",
      sessionNumPlaceholder: "Ex: 1, 2, 3...",
      saveType: "Enregistrer ce type pour une prochaine fois",
      saveTypeInfo: "sera enregistré dans la liste des types.",
      btnStart: "▶ Démarrer la prise de présence",
      btnSave: "💾 Enregistrer les modifications",
      btnCancel: "Annuler",
      alertType: "Veuillez choisir un type de temps.",
      alertDate: "Veuillez choisir une date.",
      alertError: "Erreur : ",
    },
  },
  en: {
    checking: "Checking sessions...",
    title: "📋 Attendance",
    titleConsultation: "Attendance — Consultation",
    titleJour: "Attendance for",
    titleJourHighlight: "today",
    todaySessions: "Session in progress",
    todaySessionsBadge: "IN PROGRESS",
    todaySessionsSub: "A session was already started today. Join it or create a new one.",
    rejoinBtn: "Join →",
    newSession: "➕ Create a new session",
    newSessionTitle: "📋 New Session",
    newSessionSub: "Configure the session before starting",
    backToExisting: "← Back to existing sessions",
    oldSessions: "🕘 Recent sessions",
    oldSessionsHide: "▲ Hide",
    oldSessionsShow: "▼ Show",
    consulter: "👁 View",
    absents: "⚪ Absent",
    presents: "✔ Present",
    clickToMarkPresent: "💡 Click a name to mark as present",
    readOnlyHint: "👁 View mode — editing disabled",
    search: "🔍 Search...",
    loading: "Loading...",
    noChildren: "No children visible",
    allPresent: "✅ Everyone is present",
    noPresence: "No attendance recorded",
    newSessionBtn: "↩ New session",
    backBtn: "↩ Back to sessions",
    addChild: "➕ Add a child",
    editSession: "✏️ Edit session",
    clickToEdit: "Click to edit",
    consultMode: "👁 View mode",
    consultSub: "read-only list",
    back: "← Back",
    absent: "− Absent",
    tranche36: "3-6 yrs",
    tranche712: "7-12 yrs",
    tranche1314: "13-14 yrs",
    total: "Total present",
    editable: "✏️ Edit",
    archived: "👁 View",
    sectionEditable: "Editable sessions",
    sectionArchived: "Archived sessions",
    editableInfo: "These sessions are less than 7 days old. You can still edit attendance. After that, they automatically become read-only.",
    archivedInfo: "These sessions are more than 7 days old. Attendance is visible but can no longer be modified.",
    expiresIn: "expires in",
    day: "day",
    days: "days",
    form: {
      date: "📅 Date",
      heure: "🕐 Time",
      selectType: "Select a Session Type",
      newType: "➕ New type...",
      newTypeName: "✏️ New type name",
      newTypePlaceholder: "e.g. Children's Service, Retreat...",
      chars: "characters",
      sessionNum: "🔢 Session number",
      sessionNumOptional: "(optional)",
      sessionNumPlaceholder: "e.g. 1, 2, 3...",
      saveType: "Save this type for next time",
      saveTypeInfo: "will be saved in the types list.",
      btnStart: "▶ Start attendance",
      btnSave: "💾 Save changes",
      btnCancel: "Cancel",
      alertType: "Please choose a session type.",
      alertDate: "Please choose a date.",
      alertError: "Error: ",
    },
  },
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const nowTime = () => new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

function getLast30Days() {
  const days = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}

function isSessionEditable(dateStr) {
  const diffJours = Math.floor((new Date() - new Date(dateStr + "T00:00:00")) / (1000 * 60 * 60 * 24));
  return diffJours < 7;
}

function joursRestants(dateStr) {
  const diff = Math.floor((new Date() - new Date(dateStr + "T00:00:00")) / (1000 * 60 * 60 * 24));
  return Math.max(0, 7 - diff);
}

function formatSessionLabel(s, lang) {
  const locale = lang === "en" ? "en-GB" : "fr-FR";
  const d = new Date(s.date + "T00:00:00").toLocaleDateString(locale, { day: "2-digit", month: "long" });
  const heure = s.heure ? ` · ${s.heure}` : "";
  return `${s.typeTemps} · ${d}${heure}`;
}

function formatDateFr(dateStr, lang) {
  const locale = lang === "en" ? "en-GB" : "fr-FR";
  return new Date(dateStr + "T00:00:00").toLocaleDateString(locale, {
    weekday: "long", day: "2-digit", month: "long",
  });
}

function sortTempsOptions(options) {
  const withoutCulte = options.filter(t => t !== "Culte Enfants");
  return ["Culte Enfants", ...withoutCulte];
}

// ─── COMPTEUR PAR TRANCHE ─────────────────────────────────────────────────────
function CompteurTranches({ presents, t }) {
  const compter = (label) =>
    presents.filter(p => getTranche(p.enfants?.date_naissance).label === label).length;
  const tranches = [
    { label: "3-6 ans",   tKey: "tranche36",   color: "#FCD34D" },
    { label: "7-12 ans",  tKey: "tranche712",  color: "#6EE7B7" },
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

// ─── CARTE ABSENT ─────────────────────────────────────────────────────────────
function CarteAbsent({ enfant, onMark, readOnly }) {
  const tranche = getTranche(enfant.date_naissance);
  return (
    <div
      onClick={() => !readOnly && onMark(enfant)}
      className={`bg-white rounded-xl shadow px-4 py-3 flex items-center gap-3 border-l-4 ${readOnly ? "opacity-70" : "cursor-pointer hover:bg-green-50 active:bg-green-100 transition"}`}
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

// ─── FORMULAIRE SESSION ───────────────────────────────────────────────────────
function FormulaireSession({
  isEdit, selectedDate, setSelectedDate, selectedTime, setSelectedTime,
  typeTemps, setTypeTemps, nouveauTemps, setNouveauTemps,
  enregistrerTemps, setEnregistrerTemps, numeroSession, setNumeroSession,
  tempsOptions, savingSession, onSubmit, onCancel, t,
}) {
  const isDisabled = savingSession || !typeTemps || (typeTemps === "AUTRE" && !nouveauTemps.trim());
  const optionsAffichees = sortTempsOptions(tempsOptions);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col gap-5">
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block text-sm font-semibold text-gray-700 mb-1">{t.form.date}</label>
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-gray-300 text-black" />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-semibold text-gray-700 mb-1">{t.form.heure}</label>
          <input type="time" value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-gray-300 text-black" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">{t.form.selectType}</label>
        <div className="grid grid-cols-2 gap-2">
          {optionsAffichees.map(type => (
            <button key={type} type="button"
              onClick={() => { setTypeTemps(type); setNouveauTemps(""); }}
              className={`px-3 py-2 rounded-lg text-sm font-medium border-2 transition text-left ${typeTemps === type ? "border-[#333699] bg-[#333699] text-white" : "border-gray-200 bg-gray-50 text-gray-700 hover:border-[#333699]"}`}>
              {type}
            </button>
          ))}
          <button type="button" onClick={() => setTypeTemps("AUTRE")}
            className={`px-3 py-2 rounded-lg text-sm font-medium border-2 transition text-left ${typeTemps === "AUTRE" ? "border-[#333699] bg-[#333699] text-white" : "border-dashed border-gray-300 bg-white text-gray-500 hover:border-[#333699]"}`}>
            {t.form.newType}
          </button>
        </div>
      </div>

      {typeTemps === "AUTRE" && (
        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{t.form.newTypeName}</label>
            <input type="text" placeholder={t.form.newTypePlaceholder} value={nouveauTemps}
              onChange={(e) => setNouveauTemps(e.target.value.slice(0, 30))} maxLength={30} autoFocus
              className="w-full px-3 py-2 rounded-md border border-gray-300 text-black" />
            <p className="text-xs text-gray-400 mt-1">{nouveauTemps.length}/30 {t.form.chars}</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              {t.form.sessionNum} <span className="text-gray-400 font-normal">{t.form.sessionNumOptional}</span>
            </label>
            <input type="number" min="1" placeholder={t.form.sessionNumPlaceholder} value={numeroSession}
              onChange={(e) => setNumeroSession(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-gray-300 text-black" />
          </div>
          <label className="flex items-center gap-2 text-sm text-amber-600 cursor-pointer select-none">
            <input type="checkbox" checked={enregistrerTemps} onChange={e => setEnregistrerTemps(e.target.checked)} />
            {t.form.saveType}
          </label>
          {enregistrerTemps && nouveauTemps.trim() && (
            <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
              <span className="text-blue-400 mt-0.5">ℹ️</span>
              <p className="text-xs text-blue-600 leading-relaxed">
                <span className="font-semibold">"{nouveauTemps.trim()}"</span> {t.form.saveTypeInfo}
              </p>
            </div>
          )}
        </div>
      )}

      <button type="button" onClick={onSubmit} disabled={isDisabled}
        className={`w-full py-3 rounded-xl font-bold text-white text-base transition ${isDisabled ? "bg-gray-300 cursor-not-allowed" : "bg-[#333699] hover:bg-[#2a2d80]"}`}>
        {savingSession ? "..." : isEdit ? t.form.btnSave : t.form.btnStart}
      </button>

      {onCancel && (
        <button type="button" onClick={onCancel}
          className="w-full py-2 rounded-xl font-medium text-gray-500 border border-gray-200 hover:bg-gray-50 text-sm">
          {t.form.btnCancel}
        </button>
      )}
    </div>
  );
}

// ─── BANNIÈRE CONSULTATION ────────────────────────────────────────────────────
function BanniereConsultation({ session, onRetour, t, lang }) {
  return (
    <div className="w-full max-w-lg mx-auto mb-4 rounded-xl px-4 py-3 bg-amber-500/20 border-2 border-amber-400 flex items-center justify-between gap-3">
      <div className="flex flex-col">
        <span className="text-sm font-bold text-amber-200">{t.consultMode}</span>
        <span className="text-xs text-amber-300 mt-0.5">
          {formatDateFr(session.date, lang)} — {t.consultSub}
        </span>
      </div>
      <button onClick={onRetour} className="text-xs text-amber-200 underline hover:text-white transition flex-shrink-0">
        {t.back}
      </button>
    </div>
  );
}

// ─── SESSIONS RÉCENTES BLOCK ──────────────────────────────────────────────────
function OldSessionsBlock({ sessions, onConsulter, t, lang }) {
  const [showEditable, setShowEditable] = useState(true);
  const [showArchived, setShowArchived] = useState(false);

  const editables = sessions.filter(s => isSessionEditable(s.date))
    .sort((a, b) => b.date.localeCompare(a.date));
  const archived  = sessions.filter(s => !isSessionEditable(s.date))
    .sort((a, b) => b.date.localeCompare(a.date));

  const SessionRow = ({ s, isEditable }) => {
    const remaining = joursRestants(s.date);
    const urgent    = remaining <= 2;
    return (
      <button
        onClick={() => onConsulter(s)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition text-left gap-3
          ${isEditable
            ? "border-emerald-400/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-white"
            : "border-white/10 bg-white/5 hover:bg-white/10 text-white/60"}`}
      >
        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
          <span className="text-sm truncate">{formatSessionLabel(s, lang)}</span>
          {isEditable && (
            <span className={`text-xs font-semibold ${urgent ? "text-amber-300" : "text-emerald-400"}`}>
              {urgent
                ? `⚠️ ${t.expiresIn} ${remaining} ${remaining <= 1 ? t.day : t.days}`
                : `⏳ ${t.expiresIn} ${remaining} ${t.days}`}
            </span>
          )}
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 font-semibold
          ${isEditable ? "bg-emerald-500/30 text-emerald-200" : "bg-white/10 text-white/40"}`}>
          {isEditable ? t.editable : t.archived}
        </span>
      </button>
    );
  };

  return (
    <div className="flex flex-col gap-3">
      {editables.length > 0 && (
        <div className="flex flex-col gap-2">
          <button onClick={() => setShowEditable(v => !v)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-white text-sm font-semibold hover:bg-emerald-500/25 transition">
            <div className="flex items-center gap-2">
              <span>✏️ {t.sectionEditable}</span>
              <span className="text-xs bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded-full">{editables.length}</span>
            </div>
            <span className="text-xs text-white/60">{showEditable ? t.oldSessionsHide : t.oldSessionsShow}</span>
          </button>
          {showEditable && (
            <div className="flex flex-col gap-2">
              <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-400/20">
                <span className="text-emerald-300 text-sm mt-0.5">ℹ️</span>
                <p className="text-xs text-emerald-200 leading-relaxed">{t.editableInfo}</p>
              </div>
              {editables.map(s => <SessionRow key={s.id} s={s} isEditable={true} />)}
            </div>
          )}
        </div>
      )}

      {archived.length > 0 && (
        <div className="flex flex-col gap-2">
          <button onClick={() => setShowArchived(v => !v)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white/70 text-sm font-semibold hover:bg-white/15 transition">
            <div className="flex items-center gap-2">
              <span>🔒 {t.sectionArchived}</span>
              <span className="text-xs bg-white/10 text-white/50 px-2 py-0.5 rounded-full">{archived.length}</span>
            </div>
            <span className="text-xs text-white/50">{showArchived ? t.oldSessionsHide : t.oldSessionsShow}</span>
          </button>
          {showArchived && (
            <div className="flex flex-col gap-2">
              <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-white/40 text-sm mt-0.5">🔒</span>
                <p className="text-xs text-white/50 leading-relaxed">{t.archivedInfo}</p>
              </div>
              {archived.map(s => <SessionRow key={s.id} s={s} isEditable={false} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── COMPOSANT PRINCIPAL ──────────────────────────────────────────────────────
function PresenceEnfants() {
  const { lang } = useLang();
  const t = translations[lang];
  const router = useRouter();

  const [etape, setEtape] = useState("check");
  const [sessionsRecentes, setSessionsRecentes] = useState([]);
  const [attendanceId, setAttendanceId] = useState(null);
  const [editingSession, setEditingSession] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [selectedDate, setSelectedDate] = useState(today());
  const [selectedTime, setSelectedTime] = useState(nowTime());
  const [typeTemps, setTypeTemps] = useState("");
  const [nouveauTemps, setNouveauTemps] = useState("");
  const [enregistrerTemps, setEnregistrerTemps] = useState(false);
  const [numeroSession, setNumeroSession] = useState("");
  const [tempsOptions, setTempsOptions] = useState([]);
  const [savingSession, setSavingSession] = useState(false);
  const [allEnfants, setAllEnfants] = useState([]);
  const [presentList, setPresentList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [view, setView] = useState("absents");
  const [sessionCourante, setSessionCourante] = useState(null);

  const profileRef          = useRef(null);
  const fetchAllRef         = useRef(null);
  const checkSessionsRef    = useRef(null);
  const selectedDateRef     = useRef(selectedDate);
  const attendanceIdRef     = useRef(attendanceId);
  const pendingSessionIdRef = useRef(null);

  useEffect(() => { selectedDateRef.current = selectedDate; }, [selectedDate]);
  useEffect(() => { attendanceIdRef.current = attendanceId; }, [attendanceId]);

  // ─── INIT PROFIL ───────────────────────────────────────────────────────────
  const initProfile = useCallback(async (forceReload = false) => {
    if (profileRef.current && !forceReload) return;
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase
      .from("profiles")
      .select("eglise_id, roles")
      .eq("id", user.id)
      .single();
    profileRef.current = { ...profile, uid: user.id };
  }, []);

  // ─── INIT GLOBAL ───────────────────────────────────────────────────────────
  const initAll = useCallback(async () => {
    await initProfile();
    const profile = profileRef.current;

    const { data: tempsData } = await supabase
      .from("attendance_enfants")
      .select("typeTemps")
      .eq("eglise_id", profile.eglise_id)
      .not("typeTemps", "is", null);

    const fromDb = [...new Set((tempsData || []).map(t => t.typeTemps?.trim()).filter(t => t && t !== ""))];
    if (!fromDb.includes("Culte Enfants")) fromDb.push("Culte Enfants");
    setTempsOptions(sortTempsOptions(fromDb));

    const last30 = getLast30Days();
    const { data } = await supabase
      .from("attendance_enfants")
      .select("id, typeTemps, date, heure")
      .eq("eglise_id", profile.eglise_id)
      .in("date", last30)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });

    setSessionsRecentes(data || []);
    setEtape("choix");
  }, [initProfile]);

  const checkSessionsDuJour = useCallback(async () => {
    await initProfile();
    const profile = profileRef.current;
    if (!profile) return;
    const last30 = getLast30Days();
    const { data } = await supabase
      .from("attendance_enfants")
      .select("id, typeTemps, date, heure")
      .eq("eglise_id", profile.eglise_id)
      .in("date", last30)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });
    setSessionsRecentes(data || []);
    setEtape(prev => prev === "ready" ? prev : "choix");
  }, [initProfile]);

  useEffect(() => { initAll(); }, [initAll]);

  // ─── FETCH TOUS LES ENFANTS + PRÉSENCES ───────────────────────────────────
  const fetchAll = useCallback(async (date, overrideAttendanceId) => {
    try {
      await initProfile();
      const profile = profileRef.current;
      const aId = overrideAttendanceId ?? attendanceIdRef.current;
      if (!aId) return;

      const [{ data: enfantsData }, { data: presencesData }] = await Promise.all([
        supabase
          .from("enfants")
          .select("id, prenom, nom, date_naissance")
          .eq("eglise_id", profile.eglise_id)
          .order("nom"),
        supabase
          .from("presences_enfants")
          .select("enfant_id, statut, enfants(prenom, nom, date_naissance)")
          .eq("attendance_enfant_id", aId)
          .eq("statut", "present"),
      ]);

      const presentIds = new Set((presencesData || []).map(p => p.enfant_id));
      setAllEnfants((enfantsData || []).filter(e => !presentIds.has(e.id)));
      setPresentList(presencesData || []);
    } catch (err) {
      console.error(err);
    }
  }, [initProfile]);

  useEffect(() => { fetchAllRef.current = fetchAll; }, [fetchAll]);
  useEffect(() => { checkSessionsRef.current = checkSessionsDuJour; }, [checkSessionsDuJour]);

  // ─── LIVE UPDATES ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (etape !== "choix" && etape !== "form") return;
    const channel = supabase.channel("attendance-enfants-live")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "attendance_enfants" }, () => {
        checkSessionsRef.current?.();
      }).subscribe();
    return () => supabase.removeChannel(channel);
  }, [etape]);

  useEffect(() => {
    if (etape !== "ready") return;
    setLoading(true);
    const sessionId = pendingSessionIdRef.current ?? attendanceIdRef.current;
    pendingSessionIdRef.current = null;
    fetchAll(selectedDateRef.current, sessionId).finally(() => setLoading(false));

    if (readOnly) return;
    const channel = supabase.channel("presences-enfants-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "presences_enfants" }, () => {
        fetchAllRef.current?.(selectedDateRef.current, attendanceIdRef.current);
      }).subscribe();
    return () => supabase.removeChannel(channel);
  }, [etape, fetchAll, readOnly]);

  // ─── ACTIONS SESSION ───────────────────────────────────────────────────────
  const rejoindreSession = (session) => {
    setAttendanceId(session.id);
    attendanceIdRef.current = session.id;
    setSelectedDate(session.date);
    selectedDateRef.current = session.date;
    setSelectedTime(session.heure || "");
    setTypeTemps(session.typeTemps || "");
    setSessionCourante(session);
    setReadOnly(false);
    pendingSessionIdRef.current = session.id;
    setEtape("ready");
  };

  const consulterAncienne = (session) => {
    const diffJours = Math.floor(
      (new Date() - new Date(session.date + "T00:00:00")) / (1000 * 60 * 60 * 24)
    );
    setAttendanceId(session.id);
    attendanceIdRef.current = session.id;
    setSelectedDate(session.date);
    selectedDateRef.current = session.date;
    setSelectedTime(session.heure || "");
    setTypeTemps(session.typeTemps || "");
    setSessionCourante(session);
    setReadOnly(diffJours >= 7);
    pendingSessionIdRef.current = session.id;
    setEtape("ready");
  };

  const demarrerSession = async () => {
    const typeFinal = typeTemps === "AUTRE" ? nouveauTemps.trim() : typeTemps;
    if (!typeFinal) return alert(t.form.alertType);
    if (!selectedDate) return alert(t.form.alertDate);

    setSavingSession(true);
    try {
      const profile = profileRef.current;

      if (typeTemps === "AUTRE" && enregistrerTemps && !tempsOptions.includes(typeFinal)) {
        setTempsOptions(prev => sortTempsOptions([...prev, typeFinal]));
      }

      const { data, error } = await supabase
        .from("attendance_enfants")
        .insert({ eglise_id: profile.eglise_id, date: selectedDate, heure: selectedTime, typeTemps: typeFinal })
        .select("id")
        .single();
      if (error) throw error;

      const newAttendanceId = data.id;
      attendanceIdRef.current = newAttendanceId;
      await insererAbsentsEnMasse(newAttendanceId, selectedDate, profile);

      const newSession = { id: newAttendanceId, typeTemps: typeFinal, date: selectedDate, heure: selectedTime };
      setAttendanceId(newAttendanceId);
      setSessionCourante(newSession);
      selectedDateRef.current = selectedDate;
      pendingSessionIdRef.current = newAttendanceId;
      setReadOnly(false);
      setEtape("ready");
    } catch (err) {
      console.error(err);
      alert(t.form.alertError + err.message);
    } finally {
      setSavingSession(false);
    }
  };

  const insererAbsentsEnMasse = async (newAttendanceId, date, profile) => {
    try {
      const { data: enfants } = await supabase
        .from("enfants")
        .select("id")
        .eq("eglise_id", profile.eglise_id);
      if (!enfants?.length) return;

      const { data: existantes } = await supabase
        .from("presences_enfants")
        .select("enfant_id")
        .eq("attendance_enfant_id", newAttendanceId);
      const existantIds = new Set((existantes || []).map(e => e.enfant_id));
      const nouveaux = enfants.filter(e => !existantIds.has(e.id));
      if (nouveaux.length === 0) return;

      const rows = nouveaux.map(e => ({
        enfant_id: e.id,
        attendance_enfant_id: newAttendanceId,
        date,
        statut: "absent",
        checked_by: profile.uid,
      }));
      const BATCH = 500;
      for (let i = 0; i < rows.length; i += BATCH) {
        const { error } = await supabase
          .from("presences_enfants")
          .upsert(rows.slice(i, i + BATCH), { onConflict: "enfant_id,attendance_enfant_id", ignoreDuplicates: true });
        if (error) console.error("Erreur upsert batch absents enfants:", error);
      }
    } catch (err) {
      console.error("Erreur insererAbsentsEnMasse enfants:", err);
    }
  };

  const modifierSession = async () => {
    const typeFinal = typeTemps === "AUTRE" ? nouveauTemps.trim() : typeTemps;
    if (!typeFinal || !attendanceId) return;

    setSavingSession(true);
    try {
      await supabase.from("attendance_enfants").update({
        date: selectedDate, heure: selectedTime, typeTemps: typeFinal,
      }).eq("id", attendanceId);

      setSessionCourante(prev => ({ ...prev, typeTemps: typeFinal, date: selectedDate, heure: selectedTime }));
      selectedDateRef.current = selectedDate;
      setEditingSession(false);
    } catch (err) {
      console.error(err);
      alert(t.form.alertError + err.message);
    } finally {
      setSavingSession(false);
    }
  };

  // ─── MARQUER PRÉSENT / ABSENT ──────────────────────────────────────────────
  const markPresent = async (enfant) => {
    if (readOnly) return;
    setPresentList(prev => {
      if (prev.find(p => p.enfant_id === enfant.id)) return prev;
      return [...prev, {
        enfant_id: enfant.id, statut: "present",
        enfants: { prenom: enfant.prenom, nom: enfant.nom, date_naissance: enfant.date_naissance },
      }].sort((a, b) => (a.enfants?.nom || "").localeCompare(b.enfants?.nom || "", "fr"));
    });
    setAllEnfants(prev => prev.filter(e => e.id !== enfant.id));
    try {
      const { uid } = profileRef.current;
      const aId = attendanceIdRef.current;
      const { data: updated, error: updateError } = await supabase
        .from("presences_enfants")
        .update({ statut: "present", checked_by: uid })
        .eq("enfant_id", enfant.id)
        .eq("attendance_enfant_id", aId)
        .select("id");
      if (!updateError && (!updated || updated.length === 0)) {
        await supabase.from("presences_enfants").upsert(
          { enfant_id: enfant.id, date: selectedDateRef.current, attendance_enfant_id: aId, statut: "present", checked_by: uid },
          { onConflict: "enfant_id,attendance_enfant_id" }
        );
      }
    } catch (err) {
      console.error("Erreur markPresent enfant:", err);
      await fetchAllRef.current?.(selectedDateRef.current, attendanceIdRef.current);
    }
  };

  const markAbsent = async (enfantId) => {
    if (readOnly) return;
    const absent = presentList.find(p => p.enfant_id === enfantId);
    if (absent) {
      setPresentList(prev => prev.filter(p => p.enfant_id !== enfantId));
      setAllEnfants(prev => [...prev, {
        id: enfantId,
        prenom: absent.enfants?.prenom,
        nom: absent.enfants?.nom,
        date_naissance: absent.enfants?.date_naissance,
      }].sort((a, b) => (a.nom || "").localeCompare(b.nom || "", "fr")));
    }
    try {
      await supabase.from("presences_enfants")
        .update({ statut: "absent" })
        .eq("enfant_id", enfantId)
        .eq("attendance_enfant_id", attendanceIdRef.current);
    } catch (err) {
      console.error("Erreur markAbsent enfant:", err);
      await fetchAllRef.current?.(selectedDateRef.current, attendanceIdRef.current);
    }
  };

  const handleReset = () => {
    setEtape("check");
    setAttendanceId(null);
    attendanceIdRef.current = null;
    setSessionCourante(null);
    setTypeTemps(""); setNouveauTemps(""); setNumeroSession("");
    setEnregistrerTemps(false);
    setSelectedTime(nowTime());
    setReadOnly(false);
    checkSessionsDuJour();
  };

  const filterE = (e) => `${e.prenom} ${e.nom}`.toLowerCase().includes(search.toLowerCase());
  const filterP = (p) => `${p.enfants?.prenom} ${p.enfants?.nom}`.toLowerCase().includes(search.toLowerCase());

  const totalPresents = presentList.length;
  const totalAbsents  = allEnfants.length;
  const locale        = lang === "en" ? "en-GB" : "fr-FR";

  // ━━━ VÉRIFICATION ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (etape === "check") {
    return (
      <div className="min-h-screen flex flex-col items-center p-4 sm:p-6" style={{ background: "#333699" }}>
        <HeaderPages />
        <div className="w-full max-w-lg mt-10 flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          <p className="text-white/70 text-sm">{t.checking}</p>
        </div>
        <Footer />
      </div>
    );
  }

  // ━━━ CHOIX ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (etape === "choix") {
    const todayStr      = today();
    const todaySessions = sessionsRecentes.filter(s => s.date === todayStr);
    const oldSessions   = sessionsRecentes.filter(s => s.date !== todayStr);

    return (
      <div className="min-h-screen flex flex-col items-center p-4 sm:p-6" style={{ background: "#333699" }}>
        <HeaderPages />
        <h1 className="text-2xl font-bold text-white text-center mt-6 mb-1">{t.title}</h1>
        <p className="text-white/60 text-sm text-center mb-2">
          {new Date().toLocaleDateString(locale, { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
        </p>

        <div className="w-full max-w-lg mt-2 flex flex-col gap-4">
          {todaySessions.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 pt-5 pb-3">
                <h2 className="text-base font-bold text-gray-800">{t.todaySessions}</h2>
                <span className="flex items-center gap-1.5 bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                  {t.todaySessionsBadge}
                </span>
              </div>
              <p className="text-sm text-gray-400 px-5 pb-3">{t.todaySessionsSub}</p>
              <div className="flex flex-col gap-2 px-5 pb-4">
                {todaySessions.map(s => (
                  <button key={s.id} onClick={() => rejoindreSession(s)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 border-[#333699] hover:bg-[#333699] hover:text-white text-[#333699] font-semibold transition group">
                    <span className="text-left text-sm">{formatSessionLabel(s, lang)}</span>
                    <span className="text-xs bg-emerald-100 text-emerald-700 group-hover:bg-white/20 group-hover:text-white px-2 py-0.5 rounded-full ml-2 flex-shrink-0">
                      {t.rejoinBtn}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {todaySessions.length > 0 ? (
            <button onClick={() => setEtape("form")}
              className="w-full py-3 rounded-2xl border-2 border-dashed border-white/40 text-white/80 text-sm font-semibold hover:border-white hover:text-white hover:bg-white/10 transition">
              {t.newSession}
            </button>
          ) : (
            <FormulaireSession
              isEdit={false}
              selectedDate={selectedDate} setSelectedDate={setSelectedDate}
              selectedTime={selectedTime} setSelectedTime={setSelectedTime}
              typeTemps={typeTemps} setTypeTemps={setTypeTemps}
              nouveauTemps={nouveauTemps} setNouveauTemps={setNouveauTemps}
              enregistrerTemps={enregistrerTemps} setEnregistrerTemps={setEnregistrerTemps}
              numeroSession={numeroSession} setNumeroSession={setNumeroSession}
              tempsOptions={tempsOptions} savingSession={savingSession}
              onSubmit={demarrerSession} onCancel={null} t={t}
            />
          )}

          {oldSessions.length > 0 && (
            <OldSessionsBlock sessions={oldSessions} onConsulter={consulterAncienne} t={t} lang={lang} />
          )}
        </div>
        <Footer />
      </div>
    );
  }

  // ━━━ FORMULAIRE CRÉATION ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (etape === "form") {
    return (
      <div className="min-h-screen flex flex-col items-center p-4 sm:p-6" style={{ background: "#333699" }}>
        <HeaderPages />
        <div className="w-full max-w-lg mt-6">
          <h1 className="text-2xl font-bold text-white text-center mb-1">{t.newSessionTitle}</h1>
          <p className="text-white/70 text-center text-sm mb-4">{t.newSessionSub}</p>
          <button onClick={() => setEtape("choix")}
            className="w-full mb-4 py-2 text-sm text-white/70 hover:text-white border border-white/20 rounded-xl transition">
            {t.backToExisting}
          </button>
          <FormulaireSession
            isEdit={false}
            selectedDate={selectedDate} setSelectedDate={setSelectedDate}
            selectedTime={selectedTime} setSelectedTime={setSelectedTime}
            typeTemps={typeTemps} setTypeTemps={setTypeTemps}
            nouveauTemps={nouveauTemps} setNouveauTemps={setNouveauTemps}
            enregistrerTemps={enregistrerTemps} setEnregistrerTemps={setEnregistrerTemps}
            numeroSession={numeroSession} setNumeroSession={setNumeroSession}
            tempsOptions={tempsOptions} savingSession={savingSession}
            onSubmit={demarrerSession} onCancel={() => setEtape("choix")} t={t}
          />
        </div>
        <Footer />
      </div>
    );
  }

  // ━━━ PRÉSENCE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6" style={{ background: "#333699" }}>
      <HeaderPages />

      <div className="text-center mb-4 mt-4 w-full">
        <h1 className="text-2xl font-bold text-white">
          {readOnly
            ? t.titleConsultation
            : <>{t.titleJour} <span className="text-emerald-300">{t.titleJourHighlight}</span></>}
        </h1>

        <div
          className={`inline-flex flex-col items-center mt-3 px-4 py-2 rounded-xl ${readOnly ? "bg-amber-500/20 cursor-default" : "bg-white/10 cursor-pointer hover:bg-white/20"} transition group`}
          onClick={() => !readOnly && setEditingSession(v => !v)}
        >
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold text-sm">{sessionCourante?.typeTemps}</span>
            {!readOnly && <span className="text-white/50 text-xs group-hover:text-white transition">✏️</span>}
          </div>
          <span className="text-white/60 text-xs mt-0.5">
            📅 {new Date(selectedDateRef.current + "T00:00:00").toLocaleDateString(locale, { day: "2-digit", month: "long", year: "numeric" })}
            {sessionCourante?.heure ? ` · 🕐 ${sessionCourante.heure}` : ""}
          </span>
          {!readOnly && <span className="text-white/40 text-xs mt-0.5">{t.clickToEdit}</span>}
        </div>

        {totalPresents > 0 && (
          <>
            <p className="text-white text-sm mt-2 font-semibold">{t.total} : {totalPresents}</p>
            <CompteurTranches presents={presentList} t={t} />
          </>
        )}
      </div>

      {readOnly && <BanniereConsultation session={sessionCourante} onRetour={handleReset} t={t} lang={lang} />}

      {editingSession && !readOnly && (
        <div className="w-full max-w-lg mb-6">
          <h2 className="text-white font-semibold text-center mb-3">{t.editSession}</h2>
          <FormulaireSession
            isEdit={true}
            selectedDate={selectedDate} setSelectedDate={setSelectedDate}
            selectedTime={selectedTime} setSelectedTime={setSelectedTime}
            typeTemps={typeTemps} setTypeTemps={setTypeTemps}
            nouveauTemps={nouveauTemps} setNouveauTemps={setNouveauTemps}
            enregistrerTemps={enregistrerTemps} setEnregistrerTemps={setEnregistrerTemps}
            numeroSession={numeroSession} setNumeroSession={setNumeroSession}
            tempsOptions={tempsOptions} savingSession={savingSession}
            onSubmit={modifierSession} onCancel={() => setEditingSession(false)} t={t}
          />
        </div>
      )}

      {!editingSession && (
        <>
          <div className="flex gap-3 mb-4">
            <button onClick={() => setView("absents")}
              className={`px-4 py-2 rounded ${view === "absents" ? "bg-white text-[#333699] font-bold" : "bg-white/20 text-white"}`}>
              {t.absents} ({totalAbsents})
            </button>
            <button onClick={() => setView("presents")}
              className={`px-4 py-2 rounded ${view === "presents" ? "bg-green-400 text-black font-bold" : "bg-white/20 text-white"}`}>
              {t.presents} ({totalPresents})
            </button>
          </div>

          {view === "absents" && !readOnly && (
            <p className="text-amber-300 text-sm mb-2 italic">{t.clickToMarkPresent}</p>
          )}
          {view === "absents" && readOnly && (
            <p className="text-amber-200/60 text-sm mb-2 italic">{t.readOnlyHint}</p>
          )}

          <div className="w-full max-w-4xl flex justify-center mb-6">
            <input type="text" placeholder={t.search} value={search}
              onChange={(e) => setSearch(e.target.value)}
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

          <div className="mt-8 flex gap-3 justify-center flex-wrap">
            <button onClick={handleReset}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm">
              {readOnly ? t.backBtn : t.newSessionBtn}
            </button>
            {!readOnly && (
              <button
                onClick={() => router.push("/enfants/liste-enfants?add=true")}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg text-sm font-semibold transition">
                {t.addChild}
              </button>
            )}
          </div>
        </>
      )}

      <Footer />
    </div>
  );
}

// ─── EXPORT ───────────────────────────────────────────────────────────────────
export default function PresenceEnfantsPage() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableEnfants"]}>
      <PresenceEnfants />
    </ProtectedRoute>
  );
}
