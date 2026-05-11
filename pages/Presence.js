"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import ProtectedRoute from "../components/ProtectedRoute";
import Footer from "../components/Footer";

export default function PresencePage() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableIntegration", "Conseiller", "ResponsableCellule", "ResponsableFamilles"]}>
      <Presence />
    </ProtectedRoute>
  );
}

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

function formatSessionLabel(s) {
  const d = new Date(s.date + "T00:00:00").toLocaleDateString("fr-FR", { day: "2-digit", month: "long" });
  const culte = s.numero_culte ? ` — ${s.numero_culte}${s.numero_culte === 1 ? "er" : "ème"} culte` : "";
  const heure = s.heure ? ` · ${s.heure}` : "";
  return `${s.typeTemps}${culte} · ${d}${heure}`;
}

function formatDateFr(dateStr) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("fr-FR", {
    weekday: "long", day: "2-digit", month: "long",
  });
}

function sortTempsOptions(options) {
  const withoutCulte = options.filter(t => t !== "Culte");
  return ["Culte", ...withoutCulte];
}

// ─── FORMULAIRE SESSION ────────────────────────────────────────
function FormulaireSession({
  isEdit,
  selectedDate, setSelectedDate,
  selectedTime, setSelectedTime,
  typeTemps, setTypeTemps,
  nouveauTemps, setNouveauTemps,
  enregistrerTemps, setEnregistrerTemps,
  numeroCulte, setNumeroCulte,
  numeroSession, setNumeroSession,
  tempsOptions,
  savingSession,
  onSubmit,
  onCancel,
}) {
  const typeFinalLabel = typeTemps === "AUTRE" ? nouveauTemps.trim() : typeTemps;
  const isCulte = typeFinalLabel?.toLowerCase().includes("culte");
  const culteOk = !isCulte || (isCulte && numeroCulte);
  const isDisabled = savingSession || !typeTemps || (typeTemps === "AUTRE" && !nouveauTemps.trim()) || !culteOk;
  const optionsAffichees = sortTempsOptions(tempsOptions);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col gap-5">
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block text-sm font-semibold text-gray-700 mb-1">📅 Date</label>
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full px-3 py-2 rounded-md border border-gray-300 text-black" />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-semibold text-gray-700 mb-1">🕐 Heure</label>
          <input type="time" value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)} className="w-full px-3 py-2 rounded-md border border-gray-300 text-black" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Sélectionner un Type de Temps</label>
        <div className="grid grid-cols-2 gap-2">
          {optionsAffichees.map(t => (
            <button key={t} type="button" onClick={() => { setTypeTemps(t); setNouveauTemps(""); setNumeroCulte(""); }}
              className={`px-3 py-2 rounded-lg text-sm font-medium border-2 transition text-left ${typeTemps === t ? "border-[#333699] bg-[#333699] text-white" : "border-gray-200 bg-gray-50 text-gray-700 hover:border-[#333699]"}`}>
              {t}
            </button>
          ))}
          <button type="button" onClick={() => { setTypeTemps("AUTRE"); setNumeroCulte(""); }}
            className={`px-3 py-2 rounded-lg text-sm font-medium border-2 transition text-left ${typeTemps === "AUTRE" ? "border-[#333699] bg-[#333699] text-white" : "border-dashed border-gray-300 bg-white text-gray-500 hover:border-[#333699]"}`}>
            ➕ Nouveau type...
          </button>
        </div>
      </div>

      {typeTemps === "AUTRE" && (
        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">✏️ Nom du nouveau type</label>
            <input type="text" placeholder="Ex: Tour de Prière, Camp..." value={nouveauTemps}
              onChange={(e) => setNouveauTemps(e.target.value.slice(0, 30))} maxLength={30} autoFocus
              className="w-full px-3 py-2 rounded-md border border-gray-300 text-black" />
            <p className="text-xs text-gray-400 mt-1">{nouveauTemps.length}/30 caractères</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              🔢 Numéro de session <span className="text-gray-400 font-normal">(optionnel)</span>
            </label>
            <input type="number" min="1" placeholder="Ex: 1, 2, 3..." value={numeroSession}
              onChange={(e) => setNumeroSession(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-gray-300 text-black" />
          </div>
          <label className="flex items-center gap-2 text-sm text-amber-600 cursor-pointer select-none">
            <input type="checkbox" checked={enregistrerTemps} onChange={e => setEnregistrerTemps(e.target.checked)} />
            Enregistrer ce type pour une prochaine fois
          </label>
          {enregistrerTemps && nouveauTemps.trim() && (
            <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
              <span className="text-blue-400 mt-0.5">ℹ️</span>
              <p className="text-xs text-blue-600 leading-relaxed">
                <span className="font-semibold">"{nouveauTemps.trim()}"</span> sera enregistré dans la liste des types.
              </p>
            </div>
          )}
        </div>
      )}

      {isCulte && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            🔢 Numéro de culte <span className="text-red-500">*</span>
          </label>
          <select value={numeroCulte} onChange={e => setNumeroCulte(e.target.value)}
            className={`w-full px-3 py-2 rounded-md border text-black ${!numeroCulte ? "border-red-400 bg-red-50" : "border-gray-300"}`}>
            <option value="">--- Obligatoire : sélectionner ---</option>
            {[1, 2, 3, 4, 5, 6, 7].map(n => (
              <option key={n} value={n}>{n}{n === 1 ? "er" : "ème"} Culte</option>
            ))}
          </select>
          {!numeroCulte && <p className="text-xs text-red-500 mt-1">⚠️ Le numéro de culte est obligatoire.</p>}
        </div>
      )}

      <button type="button" onClick={onSubmit} disabled={isDisabled}
        className={`w-full py-3 rounded-xl font-bold text-white text-base transition ${isDisabled ? "bg-gray-300 cursor-not-allowed" : "bg-[#333699] hover:bg-[#2a2d80]"}`}>
        {savingSession ? "..." : isEdit ? "💾 Enregistrer les modifications" : "▶ Démarrer la prise de présence"}
      </button>

      {onCancel && (
        <button type="button" onClick={onCancel} className="w-full py-2 rounded-xl font-medium text-gray-500 border border-gray-200 hover:bg-gray-50 text-sm">
          Annuler
        </button>
      )}
    </div>
  );
}

// ─── TOGGLE VISIBILITÉ ─────────────────────────────────────────
function ToggleVisibilite({ visible, onToggle, saving }) {
  return (
    <div className={`w-full max-w-lg mx-auto mb-4 rounded-xl px-4 py-3 flex items-center justify-between gap-3 border-2 transition ${visible ? "bg-emerald-50 border-emerald-400" : "bg-white/10 border-white/20"}`}>
      <div className="flex flex-col">
        <span className={`text-sm font-semibold ${visible ? "text-emerald-800" : "text-white"}`}>
          {visible ? "👁 Liste visible par l'équipe" : "🔒 Liste privée"}
        </span>
        <span className={`text-xs mt-0.5 ${visible ? "text-emerald-600" : "text-white/60"}`}>
          {visible ? "Les Admins et Responsables Intégration voient vos membres" : "Vos membres sont masqués de la liste globale"}
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
    <div
      onClick={() => !readOnly && onMark(m)}
      className={`bg-white rounded-xl shadow px-4 py-3 flex items-center gap-3 ${readOnly ? "opacity-70" : "cursor-pointer hover:bg-green-50 active:bg-green-100 transition"}`}
    >
      <span className="w-5 h-5 flex-shrink-0 rounded border-2 border-gray-300 inline-block" />
      <span className="font-semibold text-black text-base flex-1">{m.nom} {m.prenom}</span>
      <BadgeSexe sexe={m.sexe} />
    </div>
  );
}

function CartePresent({ p, onUnmark, readOnly }) {
  return (
    <div className="bg-white rounded-xl shadow px-4 py-3 flex items-center gap-3">
      <span className="w-5 h-5 flex-shrink-0 rounded border-2 border-green-500 bg-green-500 inline-flex items-center justify-center text-white text-xs font-bold">✓</span>
      <span className="font-semibold text-black text-base flex-1">{p.membres_complets?.nom} {p.membres_complets?.prenom}</span>
      <BadgeSexe sexe={p.membres_complets?.sexe} />
      {!readOnly && (
        <button onClick={() => onUnmark(p.membre_id)} className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs flex-shrink-0">
          − Absent
        </button>
      )}
    </div>
  );
}

// ─── COMPTEUR HOMMES / FEMMES ──────────────────────────────────
function CompteurSexe({ presences }) {
  const hommes   = presences.filter(p => p.membres_complets?.sexe?.toLowerCase() === "homme").length;
  const femmes   = presences.filter(p => p.membres_complets?.sexe?.toLowerCase() === "femme").length;
  const inconnus = presences.length - hommes - femmes;
  return (
    <div className="flex gap-3 justify-center mt-2 flex-wrap">
      <span className="flex items-center gap-1.5 bg-blue-500/20 text-blue-200 text-xs px-3 py-1 rounded-full font-semibold">
        👨 Hommes : {hommes}
      </span>
      <span className="flex items-center gap-1.5 bg-pink-500/20 text-pink-200 text-xs px-3 py-1 rounded-full font-semibold">
        👩 Femmes : {femmes}
      </span>
      {inconnus > 0 && (
        <span className="flex items-center gap-1.5 bg-white/10 text-white/50 text-xs px-3 py-1 rounded-full font-semibold">
          ❓ Non renseigné : {inconnus}
        </span>
      )}
    </div>
  );
}

// ─── SECTION GROUPÉE ──────────────────────────────────────────
function SectionGroupe({ label, icon, members, presentIds, onMark, onUnmark, view, color = "blue", readOnly }) {
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
              : <CartePresent key={m.id} p={{ membre_id: m.id, membres_complets: { nom: m.nom, prenom: m.prenom, sexe: m.sexe } }} onUnmark={onUnmark} readOnly={readOnly} />
          )}
        </div>
      )}
    </div>
  );
}

// ─── BANNIÈRE MODE LECTURE SEULE ───────────────────────────────
function BanniereConsultation({ session, onRetour }) {
  return (
    <div className="w-full max-w-lg mx-auto mb-4 rounded-xl px-4 py-3 bg-amber-500/20 border-2 border-amber-400 flex items-center justify-between gap-3">
      <div className="flex flex-col">
        <span className="text-sm font-bold text-amber-200">👁 Mode consultation</span>
        <span className="text-xs text-amber-300 mt-0.5">
          {formatDateFr(session.date)} — liste en lecture seule
        </span>
      </div>
      <button onClick={onRetour} className="text-xs text-amber-200 underline hover:text-white transition flex-shrink-0">
        ← Retour
      </button>
    </div>
  );
}

// ─── SESSIONS RÉCENTES (autres jours) ─────────────────────────
function OldSessionsBlock({ sessions, onConsulter }) {
  const [showOld, setShowOld] = useState(false);

  const byDate = sessions.reduce((acc, s) => {
    if (!acc[s.date]) acc[s.date] = [];
    acc[s.date].push(s);
    return acc;
  }, {});

  const oldDates = Object.keys(byDate).sort((a, b) => b.localeCompare(a));

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={() => setShowOld(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/10 text-white text-sm font-semibold hover:bg-white/20 transition"
      >
        <span>🕘 Sessions récentes — {sessions.length} session(s)</span>
        <span className="text-xs text-white/70">{showOld ? "▲ Masquer" : "▼ Afficher"}</span>
      </button>
      {showOld && (
        <div className="bg-white/10 rounded-2xl p-5 flex flex-col gap-3">
          {oldDates.map(date => (
            <div key={date} className="flex flex-col gap-2">
              <p className="text-white/50 text-xs font-semibold uppercase tracking-wide">{formatDateFr(date)}</p>
              {byDate[date].map(s => (
                <button
                  key={s.id}
                  onClick={() => onConsulter(s)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-white/20 hover:bg-white/20 text-white transition"
                >
                  <span className="text-left text-sm">{formatSessionLabel(s)}</span>
                  <span className="text-xs bg-white/10 text-white/70 px-2 py-0.5 rounded-full ml-2 flex-shrink-0">
                    👁 Consulter
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

  // ─── INIT PROFIL ──────────────────────────────────────────────
  const initProfile = useCallback(async () => {
    if (profileRef.current) return;

    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase
      .from("profiles")
      .select("eglise_id, role, roles, liste_presence_visible")
      .eq("id", user.id)
      .single();

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

  // ─── INIT SÉRIALISÉ ──────────────────────────────────────────
  const initAll = useCallback(async () => {
    await initProfile();
    const profile = profileRef.current;

    const { data: tempsData } = await supabase
      .from("attendance")
      .select("typeTemps")
      .eq("eglise_id", profile.eglise_id)
      .not("typeTemps", "is", null);

    const fromDb = [...new Set(
      (tempsData || []).map(t => t.typeTemps?.trim()).filter(t => t && t !== "")
    )];
    if (!fromDb.includes("Culte")) fromDb.push("Culte");
    const unique = sortTempsOptions(fromDb);
    setTempsOptions(unique);

    const last5 = getLast5Days();
    const { data } = await supabase
      .from("attendance")
      .select("id, typeTemps, date, heure, numero_culte")
      .eq("eglise_id", profile.eglise_id)
      .in("date", last5)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });

    const sessions = data || [];
    setSessionsRecentes(sessions);
    // Toujours aller sur "choix" — le formulaire s'affiche dedans si pas de session aujourd'hui
    setEtape("choix");
  }, [initProfile]);

  const checkSessionsDuJour = useCallback(async () => {
    await initProfile();
    const profile = profileRef.current;
    if (!profile) return;

    const last5 = getLast5Days();
    const { data } = await supabase
      .from("attendance")
      .select("id, typeTemps, date, heure, numero_culte")
      .eq("eglise_id", profile.eglise_id)
      .in("date", last5)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });

    const sessions = data || [];
    setSessionsRecentes(sessions);
    setEtape(prev => {
      if (prev === "ready") return prev;
      return "choix";
    });
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

  // ─── FETCH MEMBRES + PRÉSENCES ────────────────────────────────
  const fetchAll = useCallback(async (date, overrideAttendanceId) => {
    try {
      await initProfile();
      const profile = profileRef.current;
      const myIds   = myIdsRef.current;
      const isAdmin = isAdminRef.current;
      const d       = date || selectedDateRef.current;
      const aId     = overrideAttendanceId ?? attendanceIdRef.current;

      if (!aId) {
        console.warn("fetchAll appelé sans attendanceId — abandon");
        return;
      }

      const { data: presencesData } = await supabase
        .from("presences")
        .select("membre_id, statut, checked_by, membres_complets(prenom, nom, sexe)")
        .eq("attendance_id", aId)
        .eq("statut", "present");

      const allPresences = presencesData || [];
      const presentIds   = new Set(allPresences.map(p => p.membre_id));

      if (!isAdmin) {
        if (!myIds || myIds.length === 0) { setAllMembers([]); setPresentList([]); setGroupes([]); return; }

        const roles                 = profile?.roles || [];
        const isResponsableCellule  = roles.includes("ResponsableCellule");
        const isResponsableFamilles = roles.includes("ResponsableFamilles");

        if (isResponsableCellule || isResponsableFamilles) {
          const { data: membresData } = await supabase
            .from("membres_complets")
            .select("id, prenom, nom, telephone, sexe, cellule_id, famille_id")
            .eq("eglise_id", profile.eglise_id)
            .in("etat_contact", ["existant", "nouveau"])
            .in("id", myIds);

          const membres = membresData || [];
          const groupesResult = [];
          const membresCouvertsParGroupe = new Set();

          if (isResponsableCellule) {
            const { data: cellulesData } = await supabase
              .from("cellules")
              .select("id, cellule_full, ville, cellule")
              .eq("responsable_id", profile.uid);
            (cellulesData || []).forEach(c => {
              const cm = membres
                .filter(m => m.cellule_id === c.id)
                .sort((a, b) => (a.nom || "").localeCompare(b.nom || "", "fr"));
              cm.forEach(m => membresCouvertsParGroupe.add(m.id));
              if (cm.length > 0) {
                groupesResult.push({
                  id: `c-${c.id}`,
                  label: c.cellule_full || `${c.ville} - ${c.cellule}`,
                  icon: "🏠",
                  color: "green",
                  membres: cm,
                });
              }
            });
          }

          if (isResponsableFamilles) {
            const { data: famillesData } = await supabase
              .from("familles")
              .select("id, famille_full, famille, ville")
              .eq("responsable_id", profile.uid);
            (famillesData || []).forEach(f => {
              const fm = membres
                .filter(m => m.famille_id === f.id)
                .sort((a, b) => (a.nom || "").localeCompare(b.nom || "", "fr"));
              fm.forEach(m => membresCouvertsParGroupe.add(m.id));
              if (fm.length > 0) {
                groupesResult.push({
                  id: `f-${f.id}`,
                  label: f.famille_full || `${f.ville} - ${f.famille}`,
                  icon: "👨‍👩‍👦",
                  color: "purple",
                  membres: fm,
                });
              }
            });
          }

          const sansCellule = membres
            .filter(m => !membresCouvertsParGroupe.has(m.id))
            .sort((a, b) => (a.nom || "").localeCompare(b.nom || "", "fr"));
          if (sansCellule.length > 0) {
            groupesResult.unshift({
              id: "sans",
              label: "Sans rattachement",
              icon: "👤",
              color: "gray",
              membres: sansCellule,
            });
          }

          setGroupes(groupesResult);
          setPresentList(
            allPresences
              .filter(p => myIds.includes(p.membre_id))
              .sort((a, b) => (a.membres_complets?.nom || "").localeCompare(b.membres_complets?.nom || "", "fr"))
          );
          setAllMembers([]);
          return;
        }

        const { data: membresData } = await supabase
          .from("membres_complets")
          .select("id, prenom, nom, telephone, sexe")
          .eq("eglise_id", profile.eglise_id)
          .in("etat_contact", ["existant", "nouveau"])
          .in("id", myIds);

        const sorted = (membresData || []).sort((a, b) => (a.nom || "").localeCompare(b.nom || "", "fr"));
        setAllMembers(sorted.filter(m => !presentIds.has(m.id)));
        setPresentList(
          allPresences.filter(p => myIds.includes(p.membre_id))
            .sort((a, b) => (a.membres_complets?.nom || "").localeCompare(b.membres_complets?.nom || "", "fr"))
        );
        setGroupes([]);
        return;
      }

      const { data: tousMembres } = await supabase
        .from("membres_complets")
        .select("id, prenom, nom, telephone, sexe, cellule_id, famille_id")
        .eq("eglise_id", profile.eglise_id)
        .in("etat_contact", ["existant", "nouveau"]);

      const membres = tousMembres || [];

      const { data: responsablesVisibles } = await supabase
        .from("profiles")
        .select("id, prenom, nom, roles, liste_presence_visible")
        .eq("eglise_id", profile.eglise_id)
        .eq("liste_presence_visible", true);

      const { data: cellulesData } = await supabase
        .from("cellules").select("id, cellule_full, ville, cellule, responsable_id")
        .eq("eglise_id", profile.eglise_id);

      const { data: famillesData } = await supabase
        .from("familles").select("id, famille_full, famille, ville, responsable_id")
        .eq("eglise_id", profile.eglise_id);

      const { data: assignmentsData } = await supabase
        .from("suivi_assignments")
        .select("membre_id, conseiller_id, profiles(prenom, nom)")
        .eq("statut", "actif");

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
      famillesVisibles.forEach(f => {
        const fm = membres.filter(m => m.famille_id === f.id).sort((a, b) => (a.nom || "").localeCompare(b.nom || "", "fr"));
        fm.forEach(m => membresCouvertsParGroupe.add(m.id));
        if (fm.length > 0) groupesResult.push({ id: `f-${f.id}`, label: f.famille_full || `${f.ville} - ${f.famille}`, icon: "👨‍👩‍👦", color: "purple", membres: fm });
      });

      Object.entries(assignmentsByConseiller).forEach(([consId, { ids, profile: consProfile }]) => {
        if (!visiblesIds.has(consId)) return;
        const cm = ids.map(id => membres.find(m => m.id === id)).filter(Boolean)
          .filter(m => !membresCouvertsParGroupe.has(m.id))
          .sort((a, b) => (a.nom || "").localeCompare(b.nom || "", "fr"));
        cm.forEach(m => membresCouvertsParGroupe.add(m.id));
        if (cm.length > 0) {
          const consNom = consProfile ? `${consProfile.prenom} ${consProfile.nom}` : "Conseiller";
          groupesResult.push({ id: `cons-${consId}`, label: `Suivi par ${consNom}`, icon: "🫂", color: "amber", membres: cm });
        }
      });

      const sansCellule = membres
        .filter(m => !m.cellule_id && !m.famille_id && !membresDansConseiller.has(m.id))
        .sort((a, b) => (a.nom || "").localeCompare(b.nom || "", "fr"));
      if (sansCellule.length > 0) groupesResult.unshift({ id: "sans", label: "Sans rattachement", icon: "👤", color: "gray", membres: sansCellule });

      const membresVisiblesIds = new Set([...membresCouvertsParGroupe, ...sansCellule.map(m => m.id)]);

      setGroupes(groupesResult);
      setPresentList(allPresences.filter(p => membresVisiblesIds.has(p.membre_id)));
      setAllMembers(membres.filter(m => membresVisiblesIds.has(m.id) && !presentIds.has(m.id)));

    } catch (err) { console.error(err); }
  }, [initProfile]);

  useEffect(() => { fetchAllRef.current = fetchAll; }, [fetchAll]);
  useEffect(() => { checkSessionsRef.current = checkSessionsDuJour; }, [checkSessionsDuJour]);

  useEffect(() => {
    if (etape !== "choix" && etape !== "form") return;
    const channel = supabase
      .channel("attendance-live")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "attendance" }, () => {
        checkSessionsRef.current?.();
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [etape]);

  useEffect(() => {
    if (etape !== "ready") return;
    setLoading(true);
    const sessionId = pendingSessionIdRef.current ?? attendanceIdRef.current;
    pendingSessionIdRef.current = null;
    fetchAll(selectedDateRef.current, sessionId).finally(() => setLoading(false));

    if (readOnly) return;

    const channel = supabase
      .channel("presence-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "presences" }, () => {
        fetchAllRef.current?.(selectedDateRef.current, attendanceIdRef.current);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [etape, fetchAll, readOnly]);

  const toggleVisibilite = async () => {
    const newVal = !listeVisible;
    setSavingVisible(true);
    const { uid } = profileRef.current;
    await supabase.from("profiles").update({ liste_presence_visible: newVal }).eq("id", uid);
    profileRef.current.liste_presence_visible = newVal;
    setListeVisible(newVal);
    setSavingVisible(false);
    await fetchAllRef.current?.(selectedDateRef.current, attendanceIdRef.current);
  };

  // ─── DÉMARRER SESSION ─────────────────────────────────────────
  const demarrerSession = async () => {
    const typeFinal = typeTemps === "AUTRE" ? nouveauTemps.trim() : typeTemps;
    if (!typeFinal) return alert("Veuillez choisir un type de temps.");
    if (!selectedDate) return alert("Veuillez choisir une date.");

    const isCulte = typeFinal.toLowerCase().includes("culte");
    if (isCulte && !numeroCulte) return alert("Le numéro de culte est obligatoire.");

    setSavingSession(true);
    try {
      const profile = profileRef.current;
      if (typeTemps === "AUTRE" && enregistrerTemps && !tempsOptions.includes(typeFinal)) {
        setTempsOptions(prev => sortTempsOptions([...prev, typeFinal]));
      }

      const payload = {
        date: selectedDate,
        heure: selectedTime,
        typeTemps: typeFinal,
        temps_nom: typeFinal,
        eglise_id: profile.eglise_id,
        ...(isCulte && numeroCulte ? { numero_culte: Number(numeroCulte) } : {}),
      };
      const { data, error } = await supabase.from("attendance").insert(payload).select("id").single();
      if (error) throw error;

      const newAttendanceId = data.id;
      attendanceIdRef.current = newAttendanceId;

      await insererAbsentsEnMasse(newAttendanceId, selectedDate, profile);

      const newSession = {
        id: newAttendanceId,
        typeTemps: typeFinal,
        date: selectedDate,
        heure: selectedTime,
        numero_culte: numeroCulte ? Number(numeroCulte) : null,
      };
      setAttendanceId(newAttendanceId);
      setSessionCourante(newSession);
      selectedDateRef.current = selectedDate;
      pendingSessionIdRef.current = newAttendanceId;
      setReadOnly(false);
      setEtape("ready");
    } catch (err) {
      console.error(err);
      alert("Erreur : " + err.message);
    } finally {
      setSavingSession(false);
    }
  };

  // ─── INSERT EN MASSE : tous absents au démarrage ───────────────
  const insererAbsentsEnMasse = async (newAttendanceId, date, profile) => {
    try {
      const myIds   = myIdsRef.current;
      const isAdmin = isAdminRef.current;

      let membresAInserer = [];

      if (isAdmin) {
        const { data } = await supabase
          .from("membres_complets")
          .select("id")
          .eq("eglise_id", profile.eglise_id)
          .in("etat_contact", ["existant", "nouveau"]);
        membresAInserer = data || [];
      } else if (myIds && myIds.length > 0) {
        const { data } = await supabase
          .from("membres_complets")
          .select("id")
          .eq("eglise_id", profile.eglise_id)
          .in("etat_contact", ["existant", "nouveau"])
          .in("id", myIds);
        membresAInserer = data || [];
      }

      if (membresAInserer.length === 0) return;

      const { data: existantes } = await supabase
        .from("presences")
        .select("membre_id")
        .eq("attendance_id", newAttendanceId)
        .eq("date", date);

      const existantIds = new Set((existantes || []).map(e => e.membre_id));
      const nouveaux    = membresAInserer.filter(m => !existantIds.has(m.id));

      if (nouveaux.length === 0) return;

      const rows = nouveaux.map(m => ({
        membre_id:     m.id,
        date:          date,
        attendance_id: newAttendanceId,
        statut:        "absent",
        checked_by:    profile.uid,
      }));

      const BATCH = 500;
      for (let i = 0; i < rows.length; i += BATCH) {
        const { error } = await supabase
          .from("presences")
          .upsert(rows.slice(i, i + BATCH), {
            onConflict: "membre_id,attendance_id",
            ignoreDuplicates: true,
          });
        if (error) console.error("Erreur upsert batch absents:", error);
      }
    } catch (err) {
      console.error("Erreur insererAbsentsEnMasse:", err);
    }
  };

  const modifierSession = async () => {
    const typeFinal = typeTemps === "AUTRE" ? nouveauTemps.trim() : typeTemps;
    if (!typeFinal || !attendanceId) return;

    const isCulte = typeFinal.toLowerCase().includes("culte");
    if (isCulte && !numeroCulte) return alert("Le numéro de culte est obligatoire.");

    setSavingSession(true);
    try {
      await supabase.from("attendance").update({
        date: selectedDate,
        heure: selectedTime,
        typeTemps: typeFinal,
        temps_nom: typeFinal,
        ...(isCulte && numeroCulte ? { numero_culte: Number(numeroCulte) } : { numero_culte: null }),
      }).eq("id", attendanceId);

      setSessionCourante(prev => ({
        ...prev,
        typeTemps: typeFinal,
        date: selectedDate,
        heure: selectedTime,
        numero_culte: numeroCulte ? Number(numeroCulte) : null,
      }));
      selectedDateRef.current = selectedDate;
      setEditingSession(false);
    } catch (err) {
      console.error(err);
      alert("Erreur : " + err.message);
    } finally {
      setSavingSession(false);
    }
  };

  // ─── MARQUER PRÉSENT — mise à jour optimiste ───────────────────
  const markPresent = async (membre) => {
    if (readOnly) return;

    setPresentList(prev => {
      if (prev.find(p => p.membre_id === membre.id)) return prev;
      return [...prev, {
        membre_id: membre.id,
        statut: "present",
        membres_complets: { nom: membre.nom, prenom: membre.prenom, sexe: membre.sexe },
      }].sort((a, b) => (a.membres_complets?.nom || "").localeCompare(b.membres_complets?.nom || "", "fr"));
    });
    setAllMembers(prev => prev.filter(m => m.id !== membre.id));
    setGroupes(prev => prev.map(g => ({ ...g, membres: g.membres })));

    try {
      const { uid } = profileRef.current;
      const d  = selectedDateRef.current;
      const aId = attendanceIdRef.current;

      const { data: updated, error: updateError } = await supabase
        .from("presences")
        .update({ statut: "present", checked_by: uid })
        .eq("membre_id", membre.id)
        .eq("attendance_id", aId)
        .select("id");

      if (!updateError && (!updated || updated.length === 0)) {
        await supabase.from("presences").upsert({
          membre_id:     membre.id,
          date:          d,
          attendance_id: aId,
          statut:        "present",
          checked_by:    uid,
        }, { onConflict: "membre_id,attendance_id" });
      }
    } catch (err) {
      console.error("Erreur markPresent:", err);
      await fetchAllRef.current?.(selectedDateRef.current, attendanceIdRef.current);
    }
  };

  // ─── MARQUER ABSENT — mise à jour optimiste ────────────────────
  const markAbsent = async (memberId) => {
    if (readOnly) return;

    const absent = presentList.find(p => p.membre_id === memberId);
    if (absent) {
      const membreInfo = {
        id: memberId,
        nom: absent.membres_complets?.nom,
        prenom: absent.membres_complets?.prenom,
        sexe: absent.membres_complets?.sexe,
        cellule_id: absent.membres_complets?.cellule_id,
        famille_id: absent.membres_complets?.famille_id,
      };
      setPresentList(prev => prev.filter(p => p.membre_id !== memberId));
      setAllMembers(prev =>
        [...prev, membreInfo].sort((a, b) => (a.nom || "").localeCompare(b.nom || "", "fr"))
      );
    }

    try {
      const aId = attendanceIdRef.current;
      await supabase
        .from("presences")
        .update({ statut: "absent" })
        .eq("membre_id", memberId)
        .eq("attendance_id", aId);
    } catch (err) {
      console.error("Erreur markAbsent:", err);
      await fetchAllRef.current?.(selectedDateRef.current, attendanceIdRef.current);
    }
  };

  const filterM = (m) => `${m.prenom} ${m.nom} ${m.telephone || ""}`.toLowerCase().includes(search.toLowerCase());
  const filterP = (p) => `${p.membres_complets?.prenom} ${p.membres_complets?.nom}`.toLowerCase().includes(search.toLowerCase());

  const useGroupedView = isAdminRef.current || groupes.length > 0;
  const totalPresents  = presentList.length;

  const presentIdsSet       = new Set(presentList.map(p => p.membre_id));
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

  // ━━━ ÉCRAN VÉRIFICATION ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (etape === "check") {
    return (
      <div className="min-h-screen flex flex-col items-center p-4 sm:p-6" style={{ background: "#333699" }}>
        <HeaderPages />
        <div className="w-full max-w-lg mt-10 flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          <p className="text-white/70 text-sm">Vérification des sessions...</p>
        </div>
        <Footer />
      </div>
    );
  }

  // ━━━ ÉCRAN CHOIX / FORMULAIRE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (etape === "choix") {
    const todayStr = today();
    const todaySessions = sessionsRecentes.filter(s => s.date === todayStr);
    const oldSessions = sessionsRecentes.filter(s => s.date !== todayStr);

    return (
      <div className="min-h-screen flex flex-col items-center p-4 sm:p-6" style={{ background: "#333699" }}>
        <HeaderPages />
        <h1 className="text-2xl font-bold text-white text-center mt-6 mb-1">📋 Présences</h1>
        <p className="text-white/60 text-sm text-center mb-2">
          {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
        </p>

        <div className="w-full max-w-lg mt-2 flex flex-col gap-4">

          {/* Sessions du jour si elles existent */}
          {todaySessions.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col gap-3">
              <h2 className="text-base font-bold text-gray-800 mb-1">📋 Sessions du jour</h2>
              <p className="text-sm text-gray-500 mb-2">Ces sessions ont déjà été créées. Cliquez pour rejoindre.</p>
              {todaySessions.map(s => (
                <button
                  key={s.id}
                  onClick={() => rejoindreSession(s)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 border-[#333699] hover:bg-[#333699] hover:text-white text-[#333699] font-semibold transition group"
                >
                  <span className="text-left text-sm">{formatSessionLabel(s)}</span>
                  <span className="text-xs bg-emerald-100 text-emerald-700 group-hover:bg-white/20 group-hover:text-white px-2 py-0.5 rounded-full ml-2 flex-shrink-0">
                    Rejoindre →
                  </span>
                </button>
              ))}
              <div className="border-t border-gray-100 pt-3 mt-1">
                <button
                  onClick={() => setEtape("form")}
                  className="w-full py-2 rounded-xl border border-dashed border-gray-300 text-gray-500 text-sm hover:border-[#333699] hover:text-[#333699] transition"
                >
                  ➕ Créer une nouvelle session
                </button>
              </div>
            </div>
          )}

          {/* Formulaire directement si pas de session aujourd'hui */}
          {todaySessions.length === 0 && (
            <FormulaireSession
              isEdit={false}
              selectedDate={selectedDate} setSelectedDate={setSelectedDate}
              selectedTime={selectedTime} setSelectedTime={setSelectedTime}
              typeTemps={typeTemps} setTypeTemps={setTypeTemps}
              nouveauTemps={nouveauTemps} setNouveauTemps={setNouveauTemps}
              enregistrerTemps={enregistrerTemps} setEnregistrerTemps={setEnregistrerTemps}
              numeroCulte={numeroCulte} setNumeroCulte={setNumeroCulte}
              numeroSession={numeroSession} setNumeroSession={setNumeroSession}
              tempsOptions={tempsOptions}
              savingSession={savingSession}
              onSubmit={demarrerSession}
              onCancel={null}
            />
          )}

          {/* Sessions récentes (autres jours) */}
          {oldSessions.length > 0 && (
            <OldSessionsBlock sessions={oldSessions} onConsulter={consulterAncienne} />
          )}

        </div>
        <Footer />
      </div>
    );
  }

  // ━━━ ÉCRAN FORMULAIRE CRÉATION (nouvelle session quand il y en a déjà une aujourd'hui) ━━━
  if (etape === "form") {
    return (
      <div className="min-h-screen flex flex-col items-center p-4 sm:p-6" style={{ background: "#333699" }}>
        <HeaderPages />
        <div className="w-full max-w-lg mt-6">
          <h1 className="text-2xl font-bold text-white text-center mb-1">📋 Nouvelle Session</h1>
          <p className="text-white/70 text-center text-sm mb-4">Configurez la session avant de commencer</p>
          <button onClick={() => setEtape("choix")} className="w-full mb-4 py-2 text-sm text-white/70 hover:text-white border border-white/20 rounded-xl transition">
            ← Revenir aux sessions existantes
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
            tempsOptions={tempsOptions}
            savingSession={savingSession}
            onSubmit={demarrerSession}
            onCancel={() => setEtape("choix")}
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
          Présences{readOnly ? <span className="text-amber-300"> — Consultation</span> : <> du <span className="text-emerald-300">jour</span></>}
        </h1>

        <div
          className={`inline-flex flex-col items-center mt-3 px-4 py-2 rounded-xl ${readOnly ? "bg-amber-500/20 cursor-default" : "bg-white/10 cursor-pointer hover:bg-white/20"} transition group`}
          onClick={() => !readOnly && setEditingSession(v => !v)}
        >
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold text-sm">
              {sessionCourante?.typeTemps}
              {sessionCourante?.numero_culte ? ` — ${sessionCourante.numero_culte}${sessionCourante.numero_culte === 1 ? "er" : "ème"} culte` : ""}
            </span>
            {!readOnly && <span className="text-white/50 text-xs group-hover:text-white transition">✏️</span>}
          </div>
          <span className="text-white/60 text-xs mt-0.5">
            📅 {new Date(selectedDateRef.current + "T00:00:00").toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}
            {sessionCourante?.heure ? ` · 🕐 ${sessionCourante.heure}` : ""}
          </span>
          {!readOnly && <span className="text-white/40 text-xs mt-0.5">Cliquer pour modifier</span>}
        </div>

        {totalPresents > 0 && <CompteurSexe presences={presentList} />}
      </div>

      {readOnly && (
        <BanniereConsultation session={sessionCourante} onRetour={handleReset} />
      )}

      {!isAdminRef.current && !readOnly && (
        <ToggleVisibilite visible={listeVisible} onToggle={toggleVisibilite} saving={savingVisible} />
      )}

      {editingSession && !readOnly && (
        <div className="w-full max-w-lg mb-6">
          <h2 className="text-white font-semibold text-center mb-3">✏️ Modifier la session</h2>
          <FormulaireSession
            isEdit={true}
            selectedDate={selectedDate} setSelectedDate={setSelectedDate}
            selectedTime={selectedTime} setSelectedTime={setSelectedTime}
            typeTemps={typeTemps} setTypeTemps={setTypeTemps}
            nouveauTemps={nouveauTemps} setNouveauTemps={setNouveauTemps}
            enregistrerTemps={enregistrerTemps} setEnregistrerTemps={setEnregistrerTemps}
            numeroCulte={numeroCulte} setNumeroCulte={setNumeroCulte}
            numeroSession={numeroSession} setNumeroSession={setNumeroSession}
            tempsOptions={tempsOptions}
            savingSession={savingSession}
            onSubmit={modifierSession}
            onCancel={() => setEditingSession(false)}
          />
        </div>
      )}

      {!editingSession && (
        <>
          <div className="flex gap-3 mb-4">
            <button onClick={() => setView("absents")} className={`px-4 py-2 rounded ${view === "absents" ? "bg-white text-[#333699] font-bold" : "bg-white/20 text-white"}`}>
              ⚪ Absents ({totalAbsentsFinal})
            </button>
            <button onClick={() => setView("presents")} className={`px-4 py-2 rounded ${view === "presents" ? "bg-green-400 text-black font-bold" : "bg-white/20 text-white"}`}>
              ✔ Présents ({totalPresents})
            </button>
          </div>

          {view === "absents" && !readOnly && (
            <p className="text-amber-300 text-sm mb-2 italic">💡 Cliquer sur un nom pour marquer comme présent</p>
          )}
          {view === "absents" && readOnly && (
            <p className="text-amber-200/60 text-sm mb-2 italic">👁 Mode consultation — modifications désactivées</p>
          )}

          <div className="w-full max-w-4xl flex justify-center mb-6">
            <input
              type="text"
              placeholder="🔍 Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-2/3 px-3 py-2 rounded-md border text-black"
            />
          </div>

          {loading ? (
            <p className="text-white text-center">Chargement...</p>
          ) : useGroupedView ? (
            <div className="w-full flex flex-col items-center">
              {groupes.length === 0
                ? <p className="text-white text-center">Aucun membre visible</p>
                : groupes.map(g => {
                    const membresFiltrés = g.membres.filter(filterM);
                    if (membresFiltrés.length === 0) return null;
                    return (
                      <SectionGroupe
                        key={g.id}
                        label={g.label}
                        icon={g.icon}
                        color={g.color}
                        members={membresFiltrés}
                        presentIds={presentIdsSet}
                        onMark={markPresent}
                        onUnmark={markAbsent}
                        view={view}
                        readOnly={readOnly}
                      />
                    );
                  })
              }
            </div>
          ) : (
            <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 gap-2">
              {view === "absents"
                ? allMembers.filter(filterM).length === 0
                  ? <p className="text-white text-center col-span-full">✅ Tout le monde est présent</p>
                  : allMembers.filter(filterM).map(m => <CarteAbsent key={m.id} m={m} onMark={markPresent} readOnly={readOnly} />)
                : presentList.filter(filterP).length === 0
                  ? <p className="text-white text-center col-span-full">Aucune présence</p>
                  : presentList.filter(filterP).map(p => <CartePresent key={p.membre_id} p={p} onUnmark={markAbsent} readOnly={readOnly} />)
              }
            </div>
          )}

          <button onClick={handleReset} className="mt-8 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm">
            {readOnly ? "↩ Retour aux sessions" : "↩ Nouvelle session"}
          </button>
        </>
      )}

      <Footer />
    </div>
  );
}
