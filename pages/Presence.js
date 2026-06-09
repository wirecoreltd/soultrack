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
    voirFillesOn: "🏠 Cellules filles incluses",
    voirFillesSub: "Vous voyez aussi les membres des cellules rattachées à la vôtre",
    voirFillesOff: "🏠 Cellules filles masquées",
    voirFillesOffSub: "Afficher uniquement vos membres directs",
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
    voirFillesOn: "🏠 Child cells included",
    voirFillesSub: "You also see members from cells linked to yours",
    voirFillesOff: "🏠 Child cells hidden",
    voirFillesOffSub: "Show only your direct members",
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

// ── PATCH 1 : fenêtre élargie à 30 jours ──────────────────────
function getLast5Days() {
  const days = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}

// ── Helper : session modifiable si créée il y a ≤ 7 jours ─────
function isSessionEditable(dateStr) {
  const sessionDate = new Date(dateStr + "T00:00:00");
  const diffJours = Math.floor((new Date() - sessionDate) / (1000 * 60 * 60 * 24));
  return diffJours < 7;
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

// ─── TOGGLE CELLULES FILLES ─────────────────────────────────────
function ToggleCellulesFilles({ active, onToggle, saving, t }) {
  return (
    <div className={`w-full max-w-lg mx-auto mb-4 rounded-xl px-4 py-3 flex items-center justify-between gap-3 border-2 transition ${active ? "bg-blue-50 border-blue-400" : "bg-white/10 border-white/20"}`}>
      <div className="flex flex-col">
        <span className={`text-sm font-semibold ${active ? "text-blue-800" : "text-white"}`}>
          {active ? t.voirFillesOn : t.voirFillesOff}
        </span>
        <span className={`text-xs mt-0.5 ${active ? "text-blue-600" : "text-white/60"}`}>
          {active ? t.voirFillesSub : t.voirFillesOffSub}
        </span>
      </div>
      <button onClick={onToggle} disabled={saving}
        className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${active ? "bg-blue-500" : "bg-gray-400"} ${saving ? "opacity-50" : ""}`}>
        <span className={`absolute top-[3px] left-[3px] w-[18px] h-[18px] bg-white rounded-full shadow transition-transform ${active ? "translate-x-[22px]" : "translate-x-0"}`} />
      </button>
    </div>
  );
}

// ─── BADGES MEMBRE ─────────────────────────────────────────────
function BadgesMembre({ sexe, cellule_id, famille_id }) {
  const isH = sexe?.toLowerCase() === "homme";
  return (
    <div className="flex items-center gap-1 flex-shrink-0">
      {cellule_id && (
        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-700">🏠</span>
      )}
      {famille_id && (
        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold bg-purple-100 text-purple-700">👑</span>
      )}
      {sexe && (
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${isH ? "bg-blue-100 text-blue-700" : "bg-pink-100 text-pink-700"}`}>
          {isH ? "H" : "F"}
        </span>
      )}
    </div>
  );
}

// ─── CARTES MEMBRES ────────────────────────────────────────────
function CarteAbsent({ m, onMark, readOnly }) {
  return (
    <div onClick={() => !readOnly && onMark(m)}
      className={`bg-white rounded-xl shadow px-4 py-3 flex items-center gap-3 ${readOnly ? "opacity-70" : "cursor-pointer hover:bg-green-50 active:bg-green-100 transition"}`}>
      <span className="w-5 h-5 flex-shrink-0 rounded border-2 border-gray-300 inline-block" />
      <span className="font-semibold text-black text-base flex-1">{m.prenom} {m.nom}</span>
      <BadgesMembre sexe={m.sexe} cellule_id={m.cellule_id} famille_id={m.famille_id} />
    </div>
  );
}

function CartePresent({ p, onUnmark, readOnly, t }) {
  return (
    <div className="bg-white rounded-xl shadow px-4 py-3 flex items-center gap-3">
      <span className="w-5 h-5 flex-shrink-0 rounded border-2 border-green-500 bg-green-500 inline-flex items-center justify-center text-white text-xs font-bold">✓</span>
      <span className="font-semibold text-black text-base flex-1">{p.membres_complets?.prenom} {p.membres_complets?.nom}</span>
      <BadgesMembre
        sexe={p.membres_complets?.sexe}
        cellule_id={p.membres_complets?.cellule_id}
        famille_id={p.membres_complets?.famille_id}
      />
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
              : <CartePresent key={m.id} p={{ membre_id: m.id, membres_complets: { nom: m.nom, prenom: m.prenom, sexe: m.sexe, cellule_id: m.cellule_id, famille_id: m.famille_id } }} onUnmark={onUnmark} readOnly={readOnly} t={t} />
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

// ── helper : jours restants avant archivage ────────────────────
function joursRestants(dateStr) {
  const diff = Math.floor((new Date() - new Date(dateStr + "T00:00:00")) / (1000 * 60 * 60 * 24));
  return Math.max(0, 7 - diff);
}

// ── OldSessionsBlock : 3 sections séparées ─────────────────────
function OldSessionsBlock({ sessions, onConsulter, t, lang }) {
  const [showEditable, setShowEditable]   = useState(true);
  const [showArchived, setShowArchived]   = useState(false);

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
            : "border-white/10 bg-white/5 hover:bg-white/10 text-white/60"
          }`}
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
          ${isEditable
            ? "bg-emerald-500/30 text-emerald-200"
            : "bg-white/10 text-white/40"
          }`}
        >
          {isEditable ? t.editable : t.archived}
        </span>
      </button>
    );
  };

  return (
    <div className="flex flex-col gap-3">

      {/* ── Section modifiables ── */}
      {editables.length > 0 && (
        <div className="flex flex-col gap-2">
          <button
            onClick={() => setShowEditable(v => !v)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-white text-sm font-semibold hover:bg-emerald-500/25 transition"
          >
            <div className="flex items-center gap-2">
              <span>✏️ {t.sectionEditable}</span>
              <span className="text-xs bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded-full">
                {editables.length}
              </span>
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

      {/* ── Section archivées ── */}
      {archived.length > 0 && (
        <div className="flex flex-col gap-2">
          <button
            onClick={() => setShowArchived(v => !v)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white/70 text-sm font-semibold hover:bg-white/15 transition"
          >
            <div className="flex items-center gap-2">
              <span>🔒 {t.sectionArchived}</span>
              <span className="text-xs bg-white/10 text-white/50 px-2 py-0.5 rounded-full">
                {archived.length}
              </span>
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

  const [voirCellulesFilles, setVoirCellulesFilles] = useState(false);
  const [savingFilles, setSavingFilles] = useState(false);
  const [isResponsableCellule, setIsResponsableCellule] = useState(false);
  const [isCheckIn, setIsCheckIn] = useState(false);
  const [isResponsableCheckIn, setIsResponsableCheckIn] = useState(false);

  const profileRef            = useRef(null);
  const myIdsRef              = useRef(null);
  const myIdsAllRef           = useRef(null);
  const isAdminRef            = useRef(false);
  const useGroupedViewRef     = useRef(false);
  const fetchAllRef           = useRef(null);
  const checkSessionsRef      = useRef(null);
  const selectedDateRef       = useRef(selectedDate);
  const attendanceIdRef       = useRef(attendanceId);
  const pendingSessionIdRef   = useRef(null);
  const voirCellulesFillesRef = useRef(voirCellulesFilles);

  useEffect(() => { selectedDateRef.current = selectedDate; }, [selectedDate]);
  useEffect(() => { attendanceIdRef.current = attendanceId; }, [attendanceId]);
  useEffect(() => { voirCellulesFillesRef.current = voirCellulesFilles; }, [voirCellulesFilles]);

  const initProfile = useCallback(async (forceReload = false) => {
    if (profileRef.current && !forceReload) return;
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase
      .from("profiles")
      .select("eglise_id, role, roles, voir_cellules_filles")
      .eq("id", user.id)
      .single();

    profileRef.current = { ...profile, uid: user.id };

    const isAdmin = profile.roles?.includes("Administrateur") || profile.roles?.includes("ResponsableIntegration");
    isAdminRef.current = isAdmin;

    const isRespGroupe = profile.roles?.includes("ResponsableCellule") || profile.roles?.includes("ResponsableFamilles");
    useGroupedViewRef.current = isAdmin || isRespGroupe;

    const respCellule = profile.roles?.includes("ResponsableCellule");
    setIsResponsableCellule(!!respCellule);

    const fillesVal = !!profile.voir_cellules_filles;
    setVoirCellulesFilles(fillesVal);
    voirCellulesFillesRef.current = fillesVal;

    const checkInRole = profile.roles?.includes("CheckInPresence");
    setIsCheckIn(!!checkInRole);
    const respCheckIn = profile.roles?.includes("ResponsableCheckIn");
    setIsResponsableCheckIn(!!respCheckIn);

    if (isAdmin) {
      myIdsRef.current    = null;
      myIdsAllRef.current = null;
      return;
    }

    const [assignmentsResult, cellulesDirectResult, famillesResult] = await Promise.all([
      profile.roles?.includes("Conseiller")
        ? supabase.from("suivi_assignments").select("membre_id").eq("conseiller_id", user.id).eq("statut", "actif")
        : Promise.resolve({ data: [] }),
      profile.roles?.includes("ResponsableCellule")
        ? supabase.from("cellules").select("id").eq("responsable_id", user.id).eq("eglise_id", profile.eglise_id)
        : Promise.resolve({ data: [] }),
      profile.roles?.includes("ResponsableFamilles")
        ? supabase.from("familles").select("id").eq("responsable_id", user.id)
        : Promise.resolve({ data: [] }),
    ]);

    let idsDirects = new Set();
    assignmentsResult.data?.forEach(a => idsDirects.add(a.membre_id));

    const cellulesDirectesIds = (cellulesDirectResult.data || []).map(c => c.id);

    if (cellulesDirectesIds.length > 0) {
      const { data: cm } = await supabase
        .from("membres_complets").select("id")
        .in("cellule_id", cellulesDirectesIds)
        .in("etat_contact", ["existant", "nouveau"]);
      cm?.forEach(m => idsDirects.add(m.id));
    }

    if (famillesResult.data?.length > 0) {
      const { data: fm } = await supabase
        .from("membres_complets").select("id")
        .in("famille_id", famillesResult.data.map(f => f.id))
        .in("etat_contact", ["existant", "nouveau"]);
      fm?.forEach(m => idsDirects.add(m.id));
    }

    let idsAll = new Set([...idsDirects]);

    if (respCellule && fillesVal && cellulesDirectesIds.length > 0) {
      for (const celluleId of cellulesDirectesIds) {
        try {
          const { data: fillesData } = await supabase
            .from("cellules").select("id")
            .eq("cellule_mere_id", celluleId)
            .eq("eglise_id", profile.eglise_id);
          const fillesIds = (fillesData || []).map(f => f.id);
          if (fillesIds.length > 0) {
            const { data: membresFillesData } = await supabase
              .from("membres_complets").select("id")
              .in("cellule_id", fillesIds)
              .in("etat_contact", ["existant", "nouveau"]);
            membresFillesData?.forEach(m => idsAll.add(m.id));
          }
        } catch (e) { console.error("Erreur init filles:", e); }
      }
    }

    if (checkInRole) {
      myIdsRef.current    = null;
      myIdsAllRef.current = null;
    } else {
      myIdsRef.current    = [...idsDirects];
      myIdsAllRef.current = [...idsAll];
    }
  }, []);

  const toggleCellulesFilles = async () => {
    const newVal = !voirCellulesFilles;
    setSavingFilles(true);
    try {
      await supabase.from("profiles")
        .update({ voir_cellules_filles: newVal })
        .eq("id", profileRef.current.uid);
      setVoirCellulesFilles(newVal);
      voirCellulesFillesRef.current = newVal;
      profileRef.current    = null;
      myIdsRef.current      = null;
      myIdsAllRef.current   = null;
      await initProfile(true);
      await fetchAllRef.current?.(selectedDateRef.current, attendanceIdRef.current);
    } catch (e) { console.error("Erreur toggleCellulesFilles:", e); }
    finally { setSavingFilles(false); }
  };

  const initAll = useCallback(async () => {
    await initProfile();
    const profile = profileRef.current;

    const { data: tempsData } = await supabase
      .from("attendance").select("typeTemps")
      .eq("eglise_id", profile.eglise_id).not("typeTemps", "is", null);

    const fromDb = [...new Set((tempsData || []).map(t => t.typeTemps?.trim()).filter(t => t && t !== ""))];
    if (!fromDb.includes("Culte")) fromDb.push("Culte");
    setTempsOptions(sortTempsOptions(fromDb));

    const last5 = getLast5Days();
    const { data } = await supabase.from("attendance")
      .select("id, typeTemps, date, heure, numero_culte, liste_presence_visible")
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
    const { data } = await supabase.from("attendance")
      .select("id, typeTemps, date, heure, numero_culte, liste_presence_visible")
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
    setListeVisible(!!session.liste_presence_visible);
    setReadOnly(false);
    pendingSessionIdRef.current = session.id;
    setEtape("ready");
  };

  // ── PATCH 3 : readOnly automatique selon âge de la session ───
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
    setNumeroCulte(session.numero_culte?.toString() || "");
    setSessionCourante(session);
    setListeVisible(!!session.liste_presence_visible);
    setReadOnly(diffJours >= 7);
    pendingSessionIdRef.current = session.id;
    setEtape("ready");
  };

  const fetchAll = useCallback(async (date, overrideAttendanceId) => {
    try {
      await initProfile();
      const profile  = profileRef.current;
      const myIds    = myIdsRef.current;
      const myIdsAll = myIdsAllRef.current;
      const isAdmin  = isAdminRef.current;
      const aId      = overrideAttendanceId ?? attendanceIdRef.current;
      if (!aId) return;

      const { data: presencesData } = await supabase.from("presences")
        .select("membre_id, statut, checked_by, membres_complets(prenom, nom, sexe, cellule_id, famille_id)")
        .eq("attendance_id", aId).eq("statut", "present");

      const allPresences = presencesData || [];
      const presentIds   = new Set(allPresences.map(p => p.membre_id));

      const roles = profile?.roles || [];
      const isCheckInUser              = roles.includes("CheckInPresence");
      const isResponsableCelluleLocal  = roles.includes("ResponsableCellule");
      const isResponsableFamillesLocal = roles.includes("ResponsableFamilles");

      if (isAdmin || isCheckInUser) {
        const { data: tousMembres } = await supabase
          .from("membres_complets")
          .select("id, prenom, nom, telephone, sexe, cellule_id, famille_id")
          .eq("eglise_id", profile.eglise_id)
          .in("etat_contact", ["existant", "nouveau"]);

        const membres = tousMembres || [];
        const sansCellule = membres
          .filter(m => !m.cellule_id && !m.famille_id)
          .sort((a, b) => (a.nom || "").localeCompare(b.nom || "", "fr"));

        const sansCelluleIds = new Set(sansCellule.map(m => m.id));

        setGroupes([]);
        setAllMembers(sansCellule.filter(m => !presentIds.has(m.id)));
        setPresentList(
          allPresences
            .filter(p => sansCelluleIds.has(p.membre_id))
            .sort((a, b) => (a.membres_complets?.nom || "").localeCompare(b.membres_complets?.nom || "", "fr"))
        );
        return;
      }

      if (!myIds || myIds.length === 0) {
        setAllMembers([]);
        setPresentList([]);
        setGroupes([]);
        return;
      }

      const idsAPourVueResponsable = myIdsAll ?? myIds;

      if (isResponsableCelluleLocal || isResponsableFamillesLocal) {
        const { data: membresData } = await supabase.from("membres_complets")
          .select("id, prenom, nom, telephone, sexe, cellule_id, famille_id")
          .eq("eglise_id", profile.eglise_id)
          .in("etat_contact", ["existant", "nouveau"])
          .in("id", idsAPourVueResponsable);

        const membres = membresData || [];
        const groupesResult = [];
        const membresCouvertsParGroupe = new Set();

        if (isResponsableCelluleLocal) {
          const { data: cellulesDirectes } = await supabase.from("cellules")
            .select("id, cellule_full, ville, cellule")
            .eq("responsable_id", profile.uid);

          let toutesLesCellulesResponsable = [...(cellulesDirectes || [])];

          if (voirCellulesFillesRef.current && cellulesDirectes?.length > 0) {
            for (const cellule of cellulesDirectes) {
              try {
                const { data: fillesData } = await supabase.from("cellules")
                  .select("id, cellule_full, ville, cellule")
                  .eq("cellule_mere_id", cellule.id)
                  .eq("eglise_id", profile.eglise_id);
                if (fillesData?.length > 0) {
                  toutesLesCellulesResponsable = [...toutesLesCellulesResponsable, ...fillesData];
                }
              } catch (e) { console.error("Erreur cellules filles:", e); }
            }
          }

          toutesLesCellulesResponsable.forEach(c => {
            const cm = membres.filter(m => m.cellule_id === c.id)
              .sort((a, b) => (a.nom || "").localeCompare(b.nom || "", "fr"));
            cm.forEach(m => membresCouvertsParGroupe.add(m.id));
            if (cm.length > 0) groupesResult.push({
              id: `c-${c.id}`,
              label: c.cellule_full || `${c.ville} - ${c.cellule}`,
              icon: "🏠", color: "green", membres: cm,
            });
          });
        }

        if (isResponsableFamillesLocal) {
          const { data: famillesData } = await supabase.from("familles")
            .select("id, famille_full, famille, ville").eq("responsable_id", profile.uid);
          (famillesData || []).forEach(f => {
            const fm = membres.filter(m => m.famille_id === f.id)
              .sort((a, b) => (a.nom || "").localeCompare(b.nom || "", "fr"));
            fm.forEach(m => membresCouvertsParGroupe.add(m.id));
            if (fm.length > 0) groupesResult.push({
              id: `f-${f.id}`,
              label: f.famille_full || `${f.ville} - ${f.famille}`,
              icon: "👑", color: "purple", membres: fm,
            });
          });
        }

        const sansCellule = membres
          .filter(m => !membresCouvertsParGroupe.has(m.id))
          .sort((a, b) => (a.nom || "").localeCompare(b.nom || "", "fr"));
        if (sansCellule.length > 0) {
          groupesResult.unshift({ id: "sans", label: t.sansRattachement, icon: "👤", color: "gray", membres: sansCellule });
        }

        setGroupes(groupesResult);
        setPresentList(
          allPresences
            .filter(p => idsAPourVueResponsable.includes(p.membre_id))
            .sort((a, b) => (a.membres_complets?.nom || "").localeCompare(b.membres_complets?.nom || "", "fr"))
        );
        setAllMembers([]);
        return;
      }

      const { data: membresData } = await supabase.from("membres_complets")
        .select("id, prenom, nom, telephone, sexe, cellule_id, famille_id")
        .eq("eglise_id", profile.eglise_id)
        .in("etat_contact", ["existant", "nouveau"])
        .in("id", myIds);

      const sorted = (membresData || []).sort((a, b) => (a.nom || "").localeCompare(b.nom || "", "fr"));
      setAllMembers(sorted.filter(m => !presentIds.has(m.id)));
      setPresentList(
        allPresences
          .filter(p => myIds.includes(p.membre_id))
          .sort((a, b) => (a.membres_complets?.nom || "").localeCompare(b.membres_complets?.nom || "", "fr"))
      );
      setGroupes([]);

    } catch (err) { console.error(err); }
  }, [initProfile, t]);

  useEffect(() => { fetchAllRef.current = fetchAll; }, [fetchAll]);
  useEffect(() => { checkSessionsRef.current = checkSessionsDuJour; }, [checkSessionsDuJour]);

  useEffect(() => {
    if (etape !== "choix" && etape !== "form") return;
    const channel = supabase.channel("attendance-live")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "attendance" }, () => {
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
    const channel = supabase.channel("presence-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "presences" }, () => {
        fetchAllRef.current?.(selectedDateRef.current, attendanceIdRef.current);
      }).subscribe();
    return () => supabase.removeChannel(channel);
  }, [etape, fetchAll, readOnly]);

  const toggleVisibilite = async () => {
    const newVal = !listeVisible;
    setSavingVisible(true);
    await supabase.from("attendance").update({ liste_presence_visible: newVal }).eq("id", attendanceIdRef.current);
    setListeVisible(newVal);
    setSavingVisible(false);
    await fetchAllRef.current?.(selectedDateRef.current, attendanceIdRef.current);
  };

  const demarrerSession = async () => {
    const typeFinal = typeTemps === "AUTRE" ? nouveauTemps.trim() : typeTemps;
    if (!typeFinal) return alert(t.form.alertType);
    if (!selectedDate) return alert(t.form.alertDate);
    const isCulte = typeFinal.toLowerCase().includes("culte") || typeFinal.toLowerCase().includes("service");
    if (isCulte && !numeroCulte) return alert(t.form.alertCulte);

    setSavingSession(true);
    try {
      const profile = profileRef.current;
      if (typeTemps === "AUTRE" && enregistrerTemps && !tempsOptions.includes(typeFinal)) {
        setTempsOptions(prev => sortTempsOptions([...prev, typeFinal]));
      }
      const payload = {
        date: selectedDate, heure: selectedTime, typeTemps: typeFinal, temps_nom: typeFinal,
        eglise_id: profile.eglise_id,
        ...(isCulte && numeroCulte ? { numero_culte: Number(numeroCulte) } : {}),
      };
      const { data, error } = await supabase.from("attendance").insert(payload).select("id").single();
      if (error) throw error;

      const newAttendanceId = data.id;
      attendanceIdRef.current = newAttendanceId;
      await insererAbsentsEnMasse(newAttendanceId, selectedDate, profile);

      const newSession = { id: newAttendanceId, typeTemps: typeFinal, date: selectedDate, heure: selectedTime, numero_culte: numeroCulte ? Number(numeroCulte) : null, liste_presence_visible: false };
      setAttendanceId(newAttendanceId);
      setSessionCourante(newSession);
      setListeVisible(false);
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
      const myIds   = myIdsRef.current;
      const isAdmin = isAdminRef.current;
      let membresAInserer = [];

      if (isAdmin) {
        const { data } = await supabase.from("membres_complets").select("id")
          .eq("eglise_id", profile.eglise_id).in("etat_contact", ["existant", "nouveau"]);
        membresAInserer = data || [];
      } else if (myIds && myIds.length > 0) {
        const { data } = await supabase.from("membres_complets").select("id")
          .eq("eglise_id", profile.eglise_id).in("etat_contact", ["existant", "nouveau"]).in("id", myIds);
        membresAInserer = data || [];
      }

      if (membresAInserer.length === 0) return;

      const { data: existantes } = await supabase.from("presences").select("membre_id")
        .eq("attendance_id", newAttendanceId).eq("date", date);
      const existantIds = new Set((existantes || []).map(e => e.membre_id));
      const nouveaux = membresAInserer.filter(m => !existantIds.has(m.id));
      if (nouveaux.length === 0) return;

      const rows = nouveaux.map(m => ({ membre_id: m.id, date, attendance_id: newAttendanceId, statut: "absent", checked_by: profile.uid }));
      const BATCH = 500;
      for (let i = 0; i < rows.length; i += BATCH) {
        const { error } = await supabase.from("presences").upsert(rows.slice(i, i + BATCH), { onConflict: "membre_id,attendance_id", ignoreDuplicates: true });
        if (error) console.error("Erreur upsert batch absents:", error);
      }
    } catch (err) { console.error("Erreur insererAbsentsEnMasse:", err); }
  };

  const modifierSession = async () => {
    const typeFinal = typeTemps === "AUTRE" ? nouveauTemps.trim() : typeTemps;
    if (!typeFinal || !attendanceId) return;
    const isCulte = typeFinal.toLowerCase().includes("culte") || typeFinal.toLowerCase().includes("service");
    if (isCulte && !numeroCulte) return alert(t.form.alertCulte);

    setSavingSession(true);
    try {
      await supabase.from("attendance").update({
        date: selectedDate, heure: selectedTime, typeTemps: typeFinal, temps_nom: typeFinal,
        ...(isCulte && numeroCulte ? { numero_culte: Number(numeroCulte) } : { numero_culte: null }),
      }).eq("id", attendanceId);

      setSessionCourante(prev => ({ ...prev, typeTemps: typeFinal, date: selectedDate, heure: selectedTime, numero_culte: numeroCulte ? Number(numeroCulte) : null }));
      selectedDateRef.current = selectedDate;
      setEditingSession(false);
    } catch (err) {
      console.error(err);
      alert(t.form.alertError + err.message);
    } finally {
      setSavingSession(false);
    }
  };

  const markPresent = async (membre) => {
    if (readOnly) return;
    setPresentList(prev => {
      if (prev.find(p => p.membre_id === membre.id)) return prev;
      return [...prev, {
        membre_id: membre.id, statut: "present",
        membres_complets: { nom: membre.nom, prenom: membre.prenom, sexe: membre.sexe, cellule_id: membre.cellule_id, famille_id: membre.famille_id },
      }].sort((a, b) => (a.membres_complets?.nom || "").localeCompare(b.membres_complets?.nom || "", "fr"));
    });
    setAllMembers(prev => prev.filter(m => m.id !== membre.id));
    try {
      const { uid } = profileRef.current;
      const d   = selectedDateRef.current;
      const aId = attendanceIdRef.current;
      const { data: updated, error: updateError } = await supabase.from("presences")
        .update({ statut: "present", checked_by: uid }).eq("membre_id", membre.id).eq("attendance_id", aId).select("id");
      if (!updateError && (!updated || updated.length === 0)) {
        await supabase.from("presences").upsert({ membre_id: membre.id, date: d, attendance_id: aId, statut: "present", checked_by: uid }, { onConflict: "membre_id,attendance_id" });
      }
    } catch (err) {
      console.error("Erreur markPresent:", err);
      await fetchAllRef.current?.(selectedDateRef.current, attendanceIdRef.current);
    }
  };

  const markAbsent = async (memberId) => {
    if (readOnly) return;
    const absent = presentList.find(p => p.membre_id === memberId);
    if (absent) {
      const membreInfo = {
        id: memberId,
        nom: absent.membres_complets?.nom, prenom: absent.membres_complets?.prenom,
        sexe: absent.membres_complets?.sexe, cellule_id: absent.membres_complets?.cellule_id,
        famille_id: absent.membres_complets?.famille_id,
      };
      setPresentList(prev => prev.filter(p => p.membre_id !== memberId));
      setAllMembers(prev => [...prev, membreInfo].sort((a, b) => (a.nom || "").localeCompare(b.nom || "", "fr")));
    }
    try {
      await supabase.from("presences").update({ statut: "absent" }).eq("membre_id", memberId).eq("attendance_id", attendanceIdRef.current);
    } catch (err) {
      console.error("Erreur markAbsent:", err);
      await fetchAllRef.current?.(selectedDateRef.current, attendanceIdRef.current);
    }
  };

  const filterM = (m) => `${m.prenom} ${m.nom} ${m.telephone || ""}`.toLowerCase().includes(search.toLowerCase());
  const filterP = (p) => `${p.membres_complets?.prenom} ${p.membres_complets?.nom}`.toLowerCase().includes(search.toLowerCase());

  const useGroupedView = groupes.length > 0;
  const totalPresents  = presentList.length;
  const presentIdsSet  = new Set(presentList.map(p => p.membre_id));
  const totalAbsentsGroupes = groupes.reduce((n, g) => n + g.membres.filter(m => !presentIdsSet.has(m.id)).length, 0);
  const totalAbsentsFinal   = useGroupedView ? totalAbsentsGroupes : allMembers.length;

  const handleReset = () => {
    setEtape("check");
    setAttendanceId(null);
    attendanceIdRef.current = null;
    setSessionCourante(null);
    setTypeTemps(""); setNouveauTemps(""); setNumeroCulte(""); setNumeroSession("");
    setEnregistrerTemps(false);
    setSelectedTime(nowTime());
    setReadOnly(false);
    checkSessionsDuJour();
  };

  const locale = lang === "en" ? "en-GB" : "fr-FR";

  // ━━━ ÉCRAN VÉRIFICATION ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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

  // ━━━ ÉCRAN CHOIX / FORMULAIRE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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

          {(!isCheckIn || isResponsableCheckIn) && (
            todaySessions.length > 0 ? (
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
                numeroCulte={numeroCulte} setNumeroCulte={setNumeroCulte}
                numeroSession={numeroSession} setNumeroSession={setNumeroSession}
                tempsOptions={tempsOptions} savingSession={savingSession}
                onSubmit={demarrerSession} onCancel={null} t={t}
              />
            )
          )}

          {oldSessions.length > 0 && (
            <OldSessionsBlock sessions={oldSessions} onConsulter={consulterAncienne} t={t} lang={lang} />
          )}
        </div>
        <Footer />
      </div>
    );
  }

  // ━━━ ÉCRAN FORMULAIRE CRÉATION ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (etape === "form") {
    return (
      <div className="min-h-screen flex flex-col items-center p-4 sm:p-6" style={{ background: "#333699" }}>
        <HeaderPages />
        <div className="w-full max-w-lg mt-6">
          <h1 className="text-2xl font-bold text-white text-center mb-1">{t.newSessionTitle}</h1>
          <p className="text-white/70 text-center text-sm mb-4">{t.newSessionSub}</p>
          <button onClick={() => setEtape("choix")} className="w-full mb-4 py-2 text-sm text-white/70 hover:text-white border border-white/20 rounded-xl transition">
            {t.backToExisting}
          </button>
          <FormulaireSession
            isEdit={false}
            selectedDate={selectedDate} setSelectedDate={setSelectedDate}
            selectedTime={selectedTime} setSelectedTime={setSelectedTime}
            typeTemps={typeTemps} setTypeTemps={setTypeTemps}
            nouveauTemps={nouveauTemps} setNouveauTemps={setNouveauTemps}
            enregistrerTemps={enregistrerTemps} setEnregistrerTemps={setEnregistrerTemps}
            numeroCulte={numeroCulte} setNumeroCulte={setNumeroCulte}
            numeroSession={numeroSession} setNumeroSession={setNumeroSession}
            tempsOptions={tempsOptions} savingSession={savingSession}
            onSubmit={demarrerSession} onCancel={() => setEtape("choix")} t={t}
          />
        </div>
        <Footer />
      </div>
    );
  }

  // ━━━ ÉCRAN PRÉSENCE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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
          onClick={() => !readOnly && (!isCheckIn || isResponsableCheckIn) && setEditingSession(v => !v)}
        >
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold text-sm">
              {sessionCourante?.typeTemps}
              {sessionCourante?.numero_culte ? ` — ${sessionCourante.numero_culte}${sessionCourante.numero_culte === 1 ? t.form.er : t.form.eme} ${t.form.culte}` : ""}
            </span>
            {!readOnly && (!isCheckIn || isResponsableCheckIn) && <span className="text-white/50 text-xs group-hover:text-white transition">✏️</span>}
          </div>
          <span className="text-white/60 text-xs mt-0.5">
            📅 {new Date(selectedDateRef.current + "T00:00:00").toLocaleDateString(locale, { day: "2-digit", month: "long", year: "numeric" })}
            {sessionCourante?.heure ? ` · 🕐 ${sessionCourante.heure}` : ""}
          </span>
          {!readOnly && (!isCheckIn || isResponsableCheckIn) && <span className="text-white/40 text-xs mt-0.5">{t.clickToEdit}</span>}
        </div>

        {totalPresents > 0 && <CompteurSexe presences={presentList} t={t} />}
      </div>

      {readOnly && <BanniereConsultation session={sessionCourante} onRetour={handleReset} t={t} lang={lang} />}

      {!isAdminRef.current && !readOnly && (!isCheckIn || isResponsableCheckIn) && (
        <ToggleVisibilite visible={listeVisible} onToggle={toggleVisibilite} saving={savingVisible} t={t} />
      )}

      {isResponsableCellule && !readOnly && (
        <ToggleCellulesFilles active={voirCellulesFilles} onToggle={toggleCellulesFilles} saving={savingFilles} t={t} />
      )}

      {editingSession && !readOnly && (!isCheckIn || isResponsableCheckIn) && (
        <div className="w-full max-w-lg mb-6">
          <h2 className="text-white font-semibold text-center mb-3">{t.editSession}</h2>
          <FormulaireSession
            isEdit={true}
            selectedDate={selectedDate} setSelectedDate={setSelectedDate}
            selectedTime={selectedTime} setSelectedTime={setSelectedTime}
            typeTemps={typeTemps} setTypeTemps={setTypeTemps}
            nouveauTemps={nouveauTemps} setNouveauTemps={setNouveauTemps}
            enregistrerTemps={enregistrerTemps} setEnregistrerTemps={setEnregistrerTemps}
            numeroCulte={numeroCulte} setNumeroCulte={setNumeroCulte}
            numeroSession={numeroSession} setNumeroSession={setNumeroSession}
            tempsOptions={tempsOptions} savingSession={savingSession}
            onSubmit={modifierSession} onCancel={() => setEditingSession(false)} t={t}
          />
        </div>
      )}

      {!editingSession && (
        <>
          <div className="flex gap-3 mb-4">
            <button onClick={() => setView("absents")} className={`px-4 py-2 rounded ${view === "absents" ? "bg-white text-[#333699] font-bold" : "bg-white/20 text-white"}`}>
              {t.absents} ({totalAbsentsFinal})
            </button>
            <button onClick={() => setView("presents")} className={`px-4 py-2 rounded ${view === "presents" ? "bg-green-400 text-black font-bold" : "bg-white/20 text-white"}`}>
              {t.presents} ({totalPresents})
            </button>
          </div>

          {view === "absents" && !readOnly && <p className="text-amber-300 text-sm mb-2 italic">{t.clickToMarkPresent}</p>}
          {view === "absents" && readOnly && <p className="text-amber-200/60 text-sm mb-2 italic">{t.readOnlyHint}</p>}

          <div className="w-full max-w-4xl flex justify-center mb-6">
            <input type="text" placeholder={t.search} value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-2/3 px-3 py-2 rounded-md border text-black" />
          </div>

          {loading ? (
            <p className="text-white text-center">{t.loading}</p>
          ) : useGroupedView ? (
            <div className="w-full flex flex-col items-center">
              {groupes.length === 0
                ? <p className="text-white text-center">{t.noMembers}</p>
                : groupes.map(g => {
                    const membresFiltrés = g.membres.filter(filterM);
                    if (membresFiltrés.length === 0) return null;
                    return (
                      <SectionGroupe key={g.id} label={g.label} icon={g.icon} color={g.color}
                        members={membresFiltrés} presentIds={presentIdsSet}
                        onMark={markPresent} onUnmark={markAbsent} view={view} readOnly={readOnly} t={t} />
                    );
                  })
              }
            </div>
          ) : (
            <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 gap-2">
              {view === "absents"
                ? allMembers.filter(filterM).length === 0
                  ? <p className="text-white text-center col-span-full">{t.allPresent}</p>
                  : allMembers.filter(filterM).map(m => <CarteAbsent key={m.id} m={m} onMark={markPresent} readOnly={readOnly} />)
                : presentList.filter(filterP).length === 0
                  ? <p className="text-white text-center col-span-full">{t.noPresence}</p>
                  : presentList.filter(filterP).map(p => <CartePresent key={p.membre_id} p={p} onUnmark={markAbsent} readOnly={readOnly} t={t} />)
              }
            </div>
          )}

          <button onClick={handleReset} className="mt-8 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm">
            {readOnly ? t.backBtn : t.newSessionBtn}
          </button>
        </>
      )}

      <Footer />
    </div>
  );
}

export default function PresencePage() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableIntegration", "Conseiller",
      "ResponsableCellule", "ResponsableFamilles", "SuperviseurCellule",
      "SuperviseurFamilles", "CheckInPresence", "ResponsableCheckIn"]}>
      <Presence />
    </ProtectedRoute>
  );
}
