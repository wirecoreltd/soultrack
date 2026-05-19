"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import ProtectedRoute from "../components/ProtectedRoute";
import Footer from "../components/Footer";
import { useLang } from "../hooks/useLang";

// ─── TRADUCTIONS ──────────────────────────────────────────────────────────────
const translations = {
  fr: {
    checking: "Vérification des sessions...",
    title: "📋 Présences",
    titleConsultation: "Présences — Consultation",
    titleJour: "Présences du",
    titleJourHighlight: "jour",
    todaySessions: "📋 Sessions du jour",
    todaySessionsSub: "Ces sessions ont déjà été créées. Cliquez pour rejoindre.",
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
    noMembers: "Aucun membre visible",
    allPresent: "✅ Tout le monde est présent",
    noPresence: "Aucune présence",
    newSessionBtn: "↩ Nouvelle session",
    backBtn: "↩ Retour aux sessions",
    editSession: "✏️ Modifier la session",
    clickToEdit: "Cliquer pour modifier",
    visibleTeam: "👁 Liste visible par l'équipe",
    visibleSub: "Les Admins et Responsables Intégration voient vos membres",
    private: "🔒 Liste privée",
    privateSub: "Vos membres sont masqués de la liste globale",
    consultMode: "👁 Mode consultation",
    consultSub: "liste en lecture seule",
    back: "← Retour",
    absent: "− Absent",
    hommes: "👨 Hommes",
    femmes: "👩 Femmes",
    nonRenseigne: "❓ Non renseigné",
    form: {
      date: "📅 Date",
      heure: "🕐 Heure",
      selectType: "Sélectionner un Type de Temps",
      newType: "➕ Nouveau type...",
      newTypeName: "✏️ Nom du nouveau type",
      newTypePlaceholder: "Ex: Tour de Prière, Camp...",
      chars: "caractères",
      sessionNum: "🔢 Numéro de session",
      sessionNumOptional: "(optionnel)",
      sessionNumPlaceholder: "Ex: 1, 2, 3...",
      saveType: "Enregistrer ce type pour une prochaine fois",
      saveTypeInfo: "sera enregistré dans la liste des types.",
      culteNum: "🔢 Numéro de culte",
      culteRequired: "* Obligatoire : sélectionner",
      culteWarning: "⚠️ Le numéro de culte est obligatoire.",
      er: "er",
      eme: "ème",
      culte: "Culte",
      btnStart: "▶ Démarrer la prise de présence",
      btnSave: "💾 Enregistrer les modifications",
      btnCancel: "Annuler",
      alertType: "Veuillez choisir un type de temps.",
      alertDate: "Veuillez choisir une date.",
      alertCulte: "Le numéro de culte est obligatoire.",
      alertError: "Erreur : ",
    },
    sansRattachement: "Sans rattachement",
    suiviPar: "Suivi par",
  },
  en: {
    checking: "Checking sessions...",
    title: "📋 Attendance",
    titleConsultation: "Attendance — Consultation",
    titleJour: "Attendance for",
    titleJourHighlight: "today",
    todaySessions: "📋 Today's sessions",
    todaySessionsSub: "These sessions have already been created. Click to join.",
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
    noMembers: "No visible members",
    allPresent: "✅ Everyone is present",
    noPresence: "No attendance recorded",
    newSessionBtn: "↩ New session",
    backBtn: "↩ Back to sessions",
    editSession: "✏️ Edit session",
    clickToEdit: "Click to edit",
    visibleTeam: "👁 List visible to the team",
    visibleSub: "Admins and Integration Managers can see your members",
    private: "🔒 Private list",
    privateSub: "Your members are hidden from the global list",
    consultMode: "👁 View mode",
    consultSub: "read-only list",
    back: "← Back",
    absent: "− Absent",
    hommes: "👨 Men",
    femmes: "👩 Women",
    nonRenseigne: "❓ Not specified",
    form: {
      date: "📅 Date",
      heure: "🕐 Time",
      selectType: "Select a Session Type",
      newType: "➕ New type...",
      newTypeName: "✏️ New type name",
      newTypePlaceholder: "e.g. Prayer Tour, Camp...",
      chars: "characters",
      sessionNum: "🔢 Session number",
      sessionNumOptional: "(optional)",
      sessionNumPlaceholder: "e.g. 1, 2, 3...",
      saveType: "Save this type for next time",
      saveTypeInfo: "will be saved in the types list.",
      culteNum: "🔢 Service number",
      culteRequired: "* Required: please select",
      culteWarning: "⚠️ The service number is required.",
      er: "st",
      eme: "th",
      culte: "Service",
      btnStart: "▶ Start attendance",
      btnSave: "💾 Save changes",
      btnCancel: "Cancel",
      alertType: "Please choose a session type.",
      alertDate: "Please choose a date.",
      alertCulte: "The service number is required.",
      alertError: "Error: ",
    },
    sansRattachement: "No group assigned",
    suiviPar: "Followed by",
  },
};

// ─── HELPERS ──────────────────────────────────────────────────
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const nowTime = () => new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

function getLast5Days() {
  const days = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}

function formatSessionLabel(s, lang) {
  const locale = lang === "en" ? "en-GB" : "fr-FR";
  const d = new Date(s.date + "T00:00:00").toLocaleDateString(locale, { day: "2-digit", month: "long" });
  const culte = s.numero_culte ? ` — ${s.numero_culte}${s.numero_culte === 1 ? (lang === "en" ? "st" : "er") : (lang === "en" ? "th" : "ème")} ${lang === "en" ? "Service" : "culte"}` : "";
  const heure = s.heure ? ` · ${s.heure}` : "";
  return `${s.typeTemps}${culte} · ${d}${heure}`;
}

function formatDateFr(dateStr, lang) {
  const locale = lang === "en" ? "en-GB" : "fr-FR";
  return new Date(dateStr + "T00:00:00").toLocaleDateString(locale, {
    weekday: "long", day: "2-digit", month: "long",
  });
}

function sortTempsOptions(options) {
  const withoutCulte = options.filter(t => t !== "Culte");
  return ["Culte", ...withoutCulte];
}

// ─── FORMULAIRE SESSION ────────────────────────────────────────
function FormulaireSession({
  isEdit, selectedDate, setSelectedDate, selectedTime, setSelectedTime,
  typeTemps, setTypeTemps, nouveauTemps, setNouveauTemps,
  enregistrerTemps, setEnregistrerTemps, numeroCulte, setNumeroCulte,
  numeroSession, setNumeroSession, tempsOptions, savingSession, onSubmit, onCancel, t,
}) {
  const typeFinalLabel = typeTemps === "AUTRE" ? nouveauTemps.trim() : typeTemps;
  const isCulte = typeFinalLabel?.toLowerCase().includes("culte") || typeFinalLabel?.toLowerCase().includes("service");
  const culteOk = !isCulte || (isCulte && numeroCulte);
  const isDisabled = savingSession || !typeTemps || (typeTemps === "AUTRE" && !nouveauTemps.trim()) || !culteOk;
  const optionsAffichees = sortTempsOptions(tempsOptions);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col gap-5">
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block text-sm font-semibold text-gray-700 mb-1">{t.form.date}</label>
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full px-3 py-2 rounded-md border border-gray-300 text-black" />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-semibold text-gray-700 mb-1">{t.form.heure}</label>
          <input type="time" value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)} className="w-full px-3 py-2 rounded-md border border-gray-300 text-black" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">{t.form.selectType}</label>
        <div className="grid grid-cols-2 gap-2">
          {optionsAffichees.map(type => (
            <button key={type} type="button" onClick={() => { setTypeTemps(type); setNouveauTemps(""); setNumeroCulte(""); }}
              className={`px-3 py-2 rounded-lg text-sm font-medium border-2 transition text-left ${typeTemps === type ? "border-[#333699] bg-[#333699] text-white" : "border-gray-200 bg-gray-50 text-gray-700 hover:border-[#333699]"}`}>
              {type}
            </button>
          ))}
          <button type="button" onClick={() => { setTypeTemps("AUTRE"); setNumeroCulte(""); }}
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

      {isCulte && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            {t.form.culteNum} <span className="text-red-500">*</span>
          </label>
          <select value={numeroCulte} onChange={e => setNumeroCulte(e.target.value)}
            className={`w-full px-3 py-2 rounded-md border text-black ${!numeroCulte ? "border-red-400 bg-red-50" : "border-gray-300"}`}>
            <option value="">--- {t.form.culteRequired} ---</option>
            {[1, 2, 3, 4, 5, 6, 7].map(n => (
              <option key={n} value={n}>{n}{n === 1 ? t.form.er : t.form.eme} {t.form.culte}</option>
            ))}
          </select>
          {!numeroCulte && <p className="text-xs text-red-500 mt-1">{t.form.culteWarning}</p>}
        </div>
      )}

      <button type="button" onClick={onSubmit} disabled={isDisabled}
        className={`w-full py-3 rounded-xl font-bold text-white text-base transition ${isDisabled ? "bg-gray-300 cursor-not-allowed" : "bg-[#333699] hover:bg-[#2a2d80]"}`}>
        {savingSession ? "..." : isEdit ? t.form.btnSave : t.form.btnStart}
      </button>

      {onCancel && (
        <button type="button" onClick={onCancel} className="w-full py-2 rounded-xl font-medium text-gray-500 border border-gray-200 hover:bg-gray-50 text-sm">
          {t.form.btnCancel}
        </button>
      )}
    </div>
  );
}

// ─── TOGGLE VISIBILITÉ ─────────────────────────────────────────
function ToggleVisibilite({ visible, onToggle, saving, t }) {
  return (
    <div className={`w-full max-w-lg mx-auto mb-4 rounded-xl px-4 py-3 flex items-center justify-between gap-3 border-2 transition ${visible ? "bg-emerald-50 border-emerald-400" : "bg-white/10 border-white/20"}`}>
      <div className="flex flex-col">
        <span className={`text-sm font-semibold ${visible ? "text-emerald-800" : "text-white"}`}>
          {visible ? t.visibleTeam : t.private}
        </span>
        <span className={`text-xs mt-0.5 ${visible ? "text-emerald-600" : "text-white/60"}`}>
          {visible ? t.visibleSub : t.privateSub}
        </span>
      </div>
      <button onClick={onToggle} disabled={saving}
        className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${visible ? "bg-emerald-500" : "bg-gray-400"} ${saving ? "opacity-50" : ""}`}>
        <span className={`absolute top-[3px] left-[3px] w-[18px] h-[18px] bg-white rounded-full shadow transition-transform ${visible ? "translate-x-[22px]" : "translate-x-0"}`} />
      </button>
    </div>
  );
}

// ─── BADGE SEXE ────────────────────────────────────────────────
function BadgeSexe({ sexe }) {
  if (!sexe) return null;
  const isH = sexe.toLowerCase() === "homme";
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0 ${isH ? "bg-blue-100 text-blue-700" : "bg-pink-100 text-pink-700"}`}>
      {isH ? "H" : "F"}
    </span>
  );
}

// ─── CARTES MEMBRES ────────────────────────────────────────────
function CarteAbsent({ m, onMark, readOnly }) {
  return (
    <div onClick={() => !readOnly && onMark(m)}
      className={`bg-white rounded-xl shadow px-4 py-3 flex items-center gap-3 ${readOnly ? "opacity-70" : "cursor-pointer hover:bg-green-50 active:bg-green-100 transition"}`}>
      <span className="w-5 h-5 flex-shrink-0 rounded border-2 border-gray-300 inline-block" />
      <span className="font-semibold text-black text-base flex-1">{m.nom} {m.prenom}</span>
      <BadgeSexe sexe={m.sexe} />
    </div>
  );
}

function CartePresent({ p, onUnmark, readOnly, t }) {
  return (
    <div className="bg-white rounded-xl shadow px-4 py-3 flex items-center gap-3">
      <span className="w-5 h-5 flex-shrink-0 rounded border-2 border-green-500 bg-green-500 inline-flex items-center justify-center text-white text-xs font-bold">✓</span>
      <span className="font-semibold text-black text-base flex-1">{p.membres_complets?.nom} {p.membres_complets?.prenom}</span>
      <BadgeSexe sexe={p.membres_complets?.sexe} />
      {!readOnly && (
        <button onClick={() => onUnmark(p.membre_id)} className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs flex-shrink-0">
          {t.absent}
        </button>
      )}
    </div>
  );
}

// ─── COMPTEUR HOMMES / FEMMES ──────────────────────────────────
function CompteurSexe({ presences, t }) {
  const hommes   = presences.filter(p => p.membres_complets?.sexe?.toLowerCase() === "homme").length;
  const femmes   = presences.filter(p => p.membres_complets?.sexe?.toLowerCase() === "femme").length;
  const inconnus = presences.length - hommes - femmes;
  return (
    <div className="flex gap-3 justify-center mt-2 flex-wrap">
      <span className="flex items-center gap-1.5 bg-blue-500/20 text-blue-200 text-xs px-3 py-1 rounded-full font-semibold">
        {t.hommes} : {hommes}
      </span>
      <span className="flex items-center gap-1.5 bg-pink-500/20 text-pink-200 text-xs px-3 py-1 rounded-full font-semibold">
        {t.femmes} : {femmes}
      </span>
      {inconnus > 0 && (
        <span className="flex items-center gap-1.5 bg-white/10 text-white/50 text-xs px-3 py-1 rounded-full font-semibold">
          {t.nonRenseigne} : {inconnus}
        </span>
      )}
    </div>
  );
}

// ─── SECTION GROUPÉE ──────────────────────────────────────────
function SectionGroupe({ label, icon, members, presentIds, onMark, onUnmark, view, color = "blue", readOnly, t }) {
  const [collapsed, setCollapsed] = useState(false);
  const absents       = members.filter(m => !presentIds.has(m.id));
  const presentsItems = members.filter(m => presentIds.has(m.id));
  const shown         = view === "absents" ? absents : presentsItems;
  if (shown.length === 0) return null;

  const colorMap = {
    blue:   { bg: "bg-blue-600",    text: "text-blue-100",    border: "border-blue-500" },
    green:  { bg: "bg-emerald-600", text: "text-emerald-100", border: "border-emerald-500" },
    purple: { bg: "bg-purple-600",  text: "text-purple-100",  border: "border-purple-500" },
    amber:  { bg: "bg-amber-600",   text: "text-amber-100",   border: "border-amber-500" },
    gray:   { bg: "bg-gray-600",    text: "text-gray-100",    border: "border-gray-500" },
  };
  const c = colorMap[color] || colorMap.blue;

  return (
    <div className={`w-full max-w-4xl mb-4 rounded-2xl border-2 ${c.border} overflow-hidden`}>
      <button onClick={() => setCollapsed(v => !v)} className={`w-full flex items-center justify-between px-4 py-3 ${c.bg} ${c.text}`}>
        <span className="font-bold text-sm">{icon} {label}</span>
        <span className="flex items-center gap-3 text-xs">
          <span className="bg-white/20 px-2 py-0.5 rounded-full">
            {view === "absents"
              ? `${absents.length} absent${absents.length > 1 ? "s" : ""}`
              : `${presentsItems.length} présent${presentsItems.length > 1 ? "s" : ""}`}
          </span>
          <span>{collapsed ? "▼" : "▲"}</span>
        </span>
      </button>
      {!collapsed && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-white/5">
          {shown.map(m =>
            view === "absents"
              ? <CarteAbsent key={m.id} m={m} onMark={onMark} readOnly={readOnly} />
              : <CartePresent key={m.id} p={{ membre_id: m.id, membres_complets: { nom: m.nom, prenom: m.prenom, sexe: m.sexe } }} onUnmark={onUnmark} readOnly={readOnly} t={t} />
          )}
        </div>
      )}
    </div>
  );
}

// ─── BANNIÈRE MODE LECTURE SEULE ───────────────────────────────
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

// ─── SESSIONS RÉCENTES ─────────────────────────────────────────
function OldSessionsBlock({ sessions, onConsulter, t, lang }) {
  const [showOld, setShowOld] = useState(false);

  const byDate = sessions.reduce((acc, s) => {
    if (!acc[s.date]) acc[s.date] = [];
    acc[s.date].push(s);
    return acc;
  }, {});
  const oldDates = Object.keys(byDate).sort((a, b) => b.localeCompare(a));

  return (
    <div className="flex flex-col gap-2">
      <button onClick={() => setShowOld(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/10 text-white text-sm font-semibold hover:bg-white/20 transition">
        <span>{t.oldSessions} — {sessions.length} session(s)</span>
        <span className="text-xs text-white/70">{showOld ? t.oldSessionsHide : t.oldSessionsShow}</span>
      </button>
      {showOld && (
        <div className="bg-white/10 rounded-2xl p-5 flex flex-col gap-3">
          {oldDates.map(date => (
            <div key={date} className="flex flex-col gap-2">
              <p className="text-white/50 text-xs font-semibold uppercase tracking-wide">{formatDateFr(date, lang)}</p>
              {byDate[date].map(s => (
                <button key={s.id} onClick={() => onConsulter(s)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-white/20 hover:bg-white/20 text-white transition">
                  <span className="text-left text-sm">{formatSessionLabel(s, lang)}</span>
                  <span className="text-xs bg-white/10 text-white/70 px-2 py-0.5 rounded-full ml-2 flex-shrink-0">
                    {t.consulter}
                  </span>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── COMPOSANT PRINCIPAL ───────────────────────────────────────
function Presence() {
  const { lang } = useLang();
  const t = translations[lang];

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
  const [numeroCulte, setNumeroCulte] = useState("");
  const [numeroSession, setNumeroSession] = useState("");
  const [tempsOptions, setTempsOptions] = useState([]);
  const [savingSession, setSavingSession] = useState(false);
  const [allMembers, setAllMembers] = useState([]);
  const [presentList, setPresentList] = useState([]);
  const [groupes, setGroupes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [view, setView] = useState("absents");
  const [listeVisible, setListeVisible] = useState(false);
  const [savingVisible, setSavingVisible] = useState(false);
  const [sessionCourante, setSessionCourante] = useState(null);

  const profileRef          = useRef(null);
  const myIdsRef            = useRef(null);
  const isAdminRef          = useRef(false);
  const useGroupedViewRef   = useRef(false);
  const fetchAllRef         = useRef(null);
  const checkSessionsRef    = useRef(null);
  const selectedDateRef     = useRef(selectedDate);
  const attendanceIdRef     = useRef(attendanceId);
  const pendingSessionIdRef = useRef(null);

  useEffect(() => { selectedDateRef.current = selectedDate; }, [selectedDate]);
  useEffect(() => { attendanceIdRef.current = attendanceId; }, [attendanceId]);

  const initProfile = useCallback(async () => {
    if (profileRef.current) return;
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase
      .from("profiles").select("eglise_id, role, roles, liste_presence_visible").eq("id", user.id).single();

    profileRef.current = { ...profile, uid: user.id };
    setListeVisible(!!profile.liste_presence_visible);

    const isAdmin = profile.roles?.includes("Administrateur") || profile.roles?.includes("ResponsableIntegration");
    isAdminRef.current = isAdmin;

    const isRespGroupe = profile.roles?.includes("ResponsableCellule") || profile.roles?.includes("ResponsableFamilles");
    useGroupedViewRef.current = isAdmin || isRespGroupe;

    if (isAdmin) { myIdsRef.current = null; return; }

    let ids = new Set();
    const [assignmentsResult, cellulesResult, famillesResult] = await Promise.all([
      profile.roles?.includes("Conseiller")
        ? supabase.from("suivi_assignments").select("membre_id").eq("conseiller_id", user.id).eq("statut", "actif")
        : Promise.resolve({ data: [] }),
      profile.roles?.includes("ResponsableCellule")
        ? supabase.from("cellules").select("id").eq("responsable_id", user.id)
        : Promise.resolve({ data: [] }),
      profile.roles?.includes("ResponsableFamilles")
        ? supabase.from("familles").select("id").eq("responsable_id", user.id)
        : Promise.resolve({ data: [] }),
    ]);

    assignmentsResult.data?.forEach(a => ids.add(a.membre_id));

    if (cellulesResult.data?.length > 0) {
      const celluleIds = cellulesResult.data.map(c => c.id);
      const { data: cm } = await supabase.from("membres_complets").select("id").in("cellule_id", celluleIds).in("etat_contact", ["existant", "nouveau"]);
      cm?.forEach(m => ids.add(m.id));
    }

    if (famillesResult.data?.length > 0) {
      const familleIds = famillesResult.data.map(f => f.id);
      const { data: fm } = await supabase.from("membres_complets").select("id").in("famille_id", familleIds).in("etat_contact", ["existant", "nouveau"]);
      fm?.forEach(m => ids.add(m.id));
    }

    myIdsRef.current = [...ids];
  }, []);

  const initAll = useCallback(async () => {
    await initProfile();
    const profile = profileRef.current;

    const { data: tempsData } = await supabase
      .from("attendance").select("typeTemps").eq("eglise_id", profile.eglise_id).not("typeTemps", "is", null);

    const fromDb = [...new Set((tempsData || []).map(t => t.typeTemps?.trim()).filter(t => t && t !== ""))];
    if (!fromDb.includes("Culte")) fromDb.push("Culte");
    setTempsOptions(sortTempsOptions(fromDb));

    const last5 = getLast5Days();
    const { data } = await supabase.from("attendance").select("id, typeTemps, date, heure, numero_culte")
      .eq("eglise_id", profile.eglise_id).in("date", last5)
      .order("date", { ascending: false }).order("created_at", { ascending: false });

    setSessionsRecentes(data || []);
    setEtape("choix");
  }, [initProfile]);

  const checkSessionsDuJour = useCallback(async () => {
    await initProfile();
    const profile = profileRef.current;
    if (!profile) return;

    const last5 = getLast5Days();
    const { data } = await supabase.from("attendance").select("id, typeTemps, date, heure, numero_culte")
      .eq("eglise_id", profile.eglise_id).in("date", last5)
      .order("date", { ascending: false }).order("created_at", { ascending: false });

    setSessionsRecentes(data || []);
    setEtape(prev => prev === "ready" ? prev : "choix");
  }, [initProfile]);

  useEffect(() => { initAll(); }, [initAll]);

  const rejoindreSession = (session) => {
    setAttendanceId(session.id);
    attendanceIdRef.current = session.id;
    setSelectedDate(session.date);
    selectedDateRef.current = session.date;
    setSelectedTime(session.heure || "");
    setTypeTemps(session.typeTemps || "");
    setNumeroCulte(session.numero_culte?.toString() || "");
    setSessionCourante(session);
    setReadOnly(false);
    pendingSessionIdRef.current = session.id;
    setEtape("ready");
  };

  const consulterAncienne = (session) => {
    setAttendanceId(session.id);
    attendanceIdRef.current = session.id;
    setSelectedDate(session.date);
    selectedDateRef.current = session.date;
    setSelectedTime(session.heure || "");
    setTypeTemps(session.typeTemps || "");
    setNumeroCulte(session.numero_culte?.toString() || "");
    setSessionCourante(session);
    setReadOnly(false);
    pendingSessionIdRef.current = session.id;
    setEtape("ready");
  };

  const fetchAll = useCallback(async (date, overrideAttendanceId) => {
    try {
      await initProfile();
      const profile = profileRef.current;
      const myIds   = myIdsRef.current;
      const isAdmin = isAdminRef.current;
      const d       = date || selectedDateRef.current;
      const aId     = overrideAttendanceId ?? attendanceIdRef.current;
      if (!aId) return;

      const { data: presencesData } = await supabase.from("presences")
        .select("membre_id, statut, checked_by, membres_complets(prenom, nom, sexe)")
        .eq("attendance_id", aId).eq("statut", "present");

      const allPresences = presencesData || [];
      const presentIds   = new Set(allPresences.map(p => p.membre_id));

      if (!isAdmin) {
        if (!myIds || myIds.length === 0) { setAllMembers([]); setPresentList([]); setGroupes([]); return; }

        const roles = profile?.roles || [];
        const isResponsableCellule  = roles.includes("ResponsableCellule");
        const isResponsableFamilles = roles.includes("ResponsableFamilles");

        if (isResponsableCellule || isResponsableFamilles) {
          const { data: membresData } = await supabase.from("membres_complets")
            .select("id, prenom, nom, telephone, sexe, cellule_id, famille_id")
            .eq("eglise_id", profile.eglise_id).in("etat_contact", ["existant", "nouveau"]).in("id", myIds);

          const membres = membresData || [];
          const groupesResult = [];
          const membresCouvertsParGroupe = new Set();

          if (isResponsableCellule) {
            const { data: cellulesData } = await supabase.from("cellules")
              .select("id, cellule_full, ville, cellule").eq("responsable_id", profile.uid);
            (cellulesData || []).forEach(c => {
              const cm = membres.filter(m => m.cellule_id === c.id).sort((a, b) => (a.nom || "").localeCompare(b.nom || "", "fr"));
              cm.forEach(m => membresCouvertsParGroupe.add(m.id));
              if (cm.length > 0) groupesResult.push({ id: `c-${c.id}`, label: c.cellule_full || `${c.ville} - ${c.cellule}`, icon: "🏠", color: "green", membres: cm });
            });
          }

          if (isResponsableFamilles) {
            const { data: famillesData } = await supabase.from("familles")
              .select("id, famille_full, famille, ville").eq("responsable_id", profile.uid);
            (famillesData || []).forEach(f => {
              const fm = membres.filter(m => m.famille_id === f.id).sort((a, b) => (a.nom || "").localeCompare(b.nom || "", "fr"));
              fm.forEach(m => membresCouvertsParGroupe.add(m.id));
              if (fm.length > 0) groupesResult.push({ id: `f-${f.id}`, label: f.famille_full || `${f.ville} - ${f.famille}`, icon: "👨‍👩‍👦", color: "purple", membres: fm });
            });
          }

          const sansCellule = membres.filter(m => !membresCouvertsParGroupe.has(m.id)).sort((a, b) => (a.nom || "").localeCompare(b.nom || "", "fr"));
          if (sansCellule.length > 0) groupesResult.unshift({ id: "sans", label: t.sansRattachement, icon: "👤", color: "gray", membres: sansCellule });

          setGroupes(groupesResult);
          setPresentList(allPresences.filter(p => myIds.includes(p.membre_id)).sort((a, b) => (a.membres_complets?.nom || "").localeCompare(b.membres_complets?.nom || "", "fr")));
          setAllMembers([]);
          return;
        }

        const { data: membresData } = await supabase.from("membres_complets")
          .select("id, prenom, nom, telephone, sexe").eq("eglise_id", profile.eglise_id)
          .in("etat_contact", ["existant", "nouveau"]).in("id", myIds);

        const sorted = (membresData || []).sort((a, b) => (a.nom || "").localeCompare(b.nom || "", "fr"));
        setAllMembers(sorted.filter(m => !presentIds.has(m.id)));
        setPresentList(allPresences.filter(p => myIds.includes(p.membre_id)).sort((a, b) => (a.membres_complets?.nom || "").localeCompare(b.membres_complets?.nom || "", "fr")));
        setGroupes([]);
        return;
      }

      const { data: tousMembres } = await supabase.from("membres_complets")
        .select("id, prenom, nom, telephone, sexe, cellule_id, famille_id")
        .eq("eglise_id", profile.eglise_id).in("etat_contact", ["existant", "nouveau"]);

      const membres = tousMembres || [];

      const { data: responsablesVisibles } = await supabase.from("profiles")
        .select("id, prenom, nom, roles, liste_presence_visible")
        .eq("eglise_id", profile.eglise_id).eq("liste_presence_visible", true);

      const { data: cellulesData } = await supabase.from("cellules").select("id, cellule_full, ville, cellule, responsable_id").eq("eglise_id", profile.eglise_id);
      const { data: famillesData } = await supabase.from("familles").select("id, famille_full, famille, ville, responsable_id").eq("eglise_id", profile.eglise_id);
      const { data: assignmentsData } = await supabase.from("suivi_assignments").select("membre_id, conseiller_id, profiles(prenom, nom)").eq("statut", "actif");

      const visiblesIds = new Set((responsablesVisibles || []).map(r => r.id));
      const assignmentsByConseiller = {};
      (assignmentsData || []).forEach(a => {
        if (!assignmentsByConseiller[a.conseiller_id]) assignmentsByConseiller[a.conseiller_id] = { ids: [], profile: a.profiles };
        assignmentsByConseiller[a.conseiller_id].ids.push(a.membre_id);
      });

      const membresDansConseiller = new Set(Object.values(assignmentsByConseiller).flatMap(v => v.ids));
      const groupesResult = [];
      const membresCouvertsParGroupe = new Set();

      const cellulesVisibles = (cellulesData || []).filter(c => c.responsable_id && visiblesIds.has(c.responsable_id));
      cellulesVisibles.forEach(c => {
        const cm = membres.filter(m => m.cellule_id === c.id).sort((a, b) => (a.nom || "").localeCompare(b.nom || "", "fr"));
        cm.forEach(m => membresCouvertsParGroupe.add(m.id));
        if (cm.length > 0) groupesResult.push({ id: `c-${c.id}`, label: c.cellule_full || `${c.ville} - ${c.cellule}`, icon: "🏠", color: "green", membres: cm });
      });

      const famillesVisibles = (famillesData || []).filter(f => f.responsable_id && visiblesIds.has(f.responsable_id));
      famil
