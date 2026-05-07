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

// ─── FORMULAIRE SESSION ────────────────────────────────────────
function FormulaireSession({
  isEdit,
  selectedDate, setSelectedDate,
  typeTemps, setTypeTemps,
  nouveauTemps, setNouveauTemps,
  enregistrerTemps, setEnregistrerTemps,
  numeroCulte, setNumeroCulte,
  tempsOptions,
  savingSession,
  onSubmit,
  onCancel,
}) {
  const typeFinalLabel = typeTemps === "AUTRE" ? nouveauTemps.trim() : typeTemps;
  const isCulte = typeFinalLabel?.toLowerCase().includes("culte");
  const isDisabled = savingSession || !typeTemps || (typeTemps === "AUTRE" && !nouveauTemps.trim());

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col gap-5">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">📅 Date</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full px-3 py-2 rounded-md border border-gray-300 text-black"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Sélectionner un Type de Temps</label>
        <div className="grid grid-cols-2 gap-2">
          {tempsOptions.filter(t => t !== "Culte Dominical").map(t => (
            <button
              key={t}
              type="button"
              onClick={() => { setTypeTemps(t); setNouveauTemps(""); setNumeroCulte(""); }}
              className={`px-3 py-2 rounded-lg text-sm font-medium border-2 transition text-left ${
                typeTemps === t
                  ? "border-[#333699] bg-[#333699] text-white"
                  : "border-gray-200 bg-gray-50 text-gray-700 hover:border-[#333699]"
              }`}
            >
              {t}
            </button>
          ))}
          <button
            type="button"
            onClick={() => { setTypeTemps("AUTRE"); setNumeroCulte(""); }}
            className={`px-3 py-2 rounded-lg text-sm font-medium border-2 transition text-left ${
              typeTemps === "AUTRE"
                ? "border-[#333699] bg-[#333699] text-white"
                : "border-dashed border-gray-300 bg-white text-gray-500 hover:border-[#333699]"
            }`}
          >
            ➕ Nouveau type...
          </button>
        </div>
      </div>

      {typeTemps === "AUTRE" && (
        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">✏️ Nom du nouveau type</label>
            <input
              type="text"
              placeholder="Ex: Tour de Prière, Camp..."
              value={nouveauTemps}
              onChange={(e) => setNouveauTemps(e.target.value.slice(0, 30))}
              maxLength={30}
              autoFocus
              className="w-full px-3 py-2 rounded-md border border-gray-300 text-black"
            />
            <p className="text-xs text-gray-400 mt-1">{nouveauTemps.length}/30 caractères</p>
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
          <label className="block text-sm font-semibold text-gray-700 mb-1">🔢 Numéro de culte</label>
          <select
            value={numeroCulte}
            onChange={e => setNumeroCulte(e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-gray-300 text-black"
          >
            <option value="">--- Sélectionner ---</option>
            {[1, 2, 3, 4, 5, 6, 7].map(n => (
              <option key={n} value={n}>{n}{n === 1 ? "er" : "ème"} Culte</option>
            ))}
          </select>
        </div>
      )}

      <button
        type="button"
        onClick={onSubmit}
        disabled={isDisabled}
        className={`w-full py-3 rounded-xl font-bold text-white text-base transition ${
          isDisabled ? "bg-gray-300 cursor-not-allowed" : "bg-[#333699] hover:bg-[#2a2d80]"
        }`}
      >
        {savingSession ? "..." : isEdit ? "💾 Enregistrer les modifications" : "▶ Démarrer la prise de présence"}
      </button>

      {isEdit && (
        <button
          type="button"
          onClick={onCancel}
          className="w-full py-2 rounded-xl font-medium text-gray-500 border border-gray-200 hover:bg-gray-50 text-sm"
        >
          Annuler
        </button>
      )}
    </div>
  );
}

// ─── TOGGLE VISIBILITÉ ─────────────────────────────────────────
function ToggleVisibilite({ visible, onToggle, saving }) {
  return (
    <div className={`w-full max-w-lg mx-auto mb-4 rounded-xl px-4 py-3 flex items-center justify-between gap-3 border-2 transition ${
      visible ? "bg-emerald-50 border-emerald-400" : "bg-white/10 border-white/20"
    }`}>
      <div className="flex flex-col">
        <span className={`text-sm font-semibold ${visible ? "text-emerald-800" : "text-white"}`}>
          {visible ? "👁 Liste visible par l'équipe" : "🔒 Liste privée"}
        </span>
        <span className={`text-xs mt-0.5 ${visible ? "text-emerald-600" : "text-white/60"}`}>
          {visible
            ? "Les Admins et Responsables Intégration voient vos membres"
            : "Vos membres sont masqués de la liste globale"}
        </span>
      </div>
      <button
        onClick={onToggle}
        disabled={saving}
        className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${
          visible ? "bg-emerald-500" : "bg-gray-400"
        } ${saving ? "opacity-50" : ""}`}
      >
        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
          visible ? "translate-x-6" : "translate-x-0.5"
        }`} />
      </button>
    </div>
  );
}

// ─── CARTE MEMBRE (absent) ─────────────────────────────────────
function CarteAbsent({ m, onMark }) {
  return (
    <div
      onClick={() => onMark(m)}
      className="bg-white rounded-xl shadow px-4 py-3 cursor-pointer hover:bg-green-50 transition flex items-center gap-3"
    >
      <span className="w-5 h-5 flex-shrink-0 rounded border-2 border-gray-300 inline-block" />
      <span className="font-semibold text-black text-base">{m.nom} {m.prenom}</span>
    </div>
  );
}

// ─── CARTE MEMBRE (présent) ────────────────────────────────────
function CartePresent({ p, onUnmark }) {
  return (
    <div className="bg-white rounded-xl shadow px-4 py-3 flex items-center gap-3">
      <span className="w-5 h-5 flex-shrink-0 rounded border-2 border-green-500 bg-green-500 inline-flex items-center justify-center text-white text-xs font-bold">✓</span>
      <span className="font-semibold text-black text-base flex-1">
        {p.membres_complets?.nom} {p.membres_complets?.prenom}
      </span>
      <button
        onClick={() => onUnmark(p.membre_id)}
        className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs flex-shrink-0"
      >
        − Absent
      </button>
    </div>
  );
}

// ─── SECTION GROUPÉE (Admin/RI) ────────────────────────────────
function SectionGroupe({ label, icon, members, presentIds, onMark, onUnmark, view, color = "blue" }) {
  const [collapsed, setCollapsed] = useState(false);

  const absents = members.filter(m => !presentIds.has(m.id || m.membre_id));
  const presents = members.filter(m => presentIds.has(m.id || m.membre_id));
  const shown = view === "absents" ? absents : presents;

  if (shown.length === 0) return null;

  const colorMap = {
    blue:   { bg: "bg-blue-600",   text: "text-blue-100",  border: "border-blue-500" },
    green:  { bg: "bg-emerald-600", text: "text-emerald-100", border: "border-emerald-500" },
    purple: { bg: "bg-purple-600", text: "text-purple-100", border: "border-purple-500" },
    amber:  { bg: "bg-amber-600",  text: "text-amber-100",  border: "border-amber-500" },
    gray:   { bg: "bg-gray-600",   text: "text-gray-100",   border: "border-gray-500" },
  };
  const c = colorMap[color] || colorMap.blue;

  return (
    <div className={`w-full max-w-4xl mb-4 rounded-2xl border-2 ${c.border} overflow-hidden`}>
      <button
        onClick={() => setCollapsed(v => !v)}
        className={`w-full flex items-center justify-between px-4 py-3 ${c.bg} ${c.text}`}
      >
        <span className="font-bold text-sm">{icon} {label}</span>
        <span className="flex items-center gap-3 text-xs">
          <span className="bg-white/20 px-2 py-0.5 rounded-full">
            {view === "absents"
              ? `${absents.length} absent${absents.length > 1 ? "s" : ""}`
              : `${presents.length} présent${presents.length > 1 ? "s" : ""}`}
          </span>
          <span>{collapsed ? "▼" : "▲"}</span>
        </span>
      </button>

      {!collapsed && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-white/5">
          {shown.map(item => {
            // item peut être un membre (absent) ou une présence (présent)
            const isPresenceItem = !!item.membres_complets;
            if (view === "absents" && !isPresenceItem) {
              return <CarteAbsent key={item.id} m={item} onMark={onMark} />;
            }
            if (view === "presents" && isPresenceItem) {
              return <CartePresent key={item.membre_id} p={item} onUnmark={onUnmark} />;
            }
            return null;
          })}
        </div>
      )}
    </div>
  );
}

// ─── COMPOSANT PRINCIPAL ───────────────────────────────────────
function Presence() {
  const [sessionReady, setSessionReady] = useState(false);
  const [attendanceId, setAttendanceId] = useState(null);
  const [editingSession, setEditingSession] = useState(false);

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [typeTemps, setTypeTemps] = useState("");
  const [nouveauTemps, setNouveauTemps] = useState("");
  const [enregistrerTemps, setEnregistrerTemps] = useState(false);
  const [numeroCulte, setNumeroCulte] = useState("");
  const [tempsOptions, setTempsOptions] = useState([]);
  const [savingSession, setSavingSession] = useState(false);

  // Données membres
  const [allMembers, setAllMembers] = useState([]);       // tous les membres (myIds scope)
  const [presentList, setPresentList] = useState([]);     // presences du jour
  const [groupes, setGroupes] = useState([]);             // groupes pour Admin/RI
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [view, setView] = useState("absents");

  // Visibilité (Responsable seulement)
  const [listeVisible, setListeVisible] = useState(false);
  const [savingVisible, setSavingVisible] = useState(false);

  const profileRef = useRef(null);
  const myIdsRef = useRef(null);   // null = tout voir, [] = voir personne, [...] = scope limité
  const isAdminRef = useRef(false);

  // ─── INIT PROFIL ────────────────────────────────────────────
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

    const isAdmin =
      profile.roles?.includes("Administrateur") ||
      profile.roles?.includes("ResponsableIntegration");

    isAdminRef.current = isAdmin;

    if (isAdmin) {
      myIdsRef.current = null; // voit tout
      return;
    }

    // Responsable ou Conseiller : scope limité
    let ids = new Set();

    const [assignmentsResult, celluleResult, familleResult] = await Promise.all([
      profile.roles?.includes("Conseiller")
        ? supabase.from("suivi_assignments").select("membre_id").eq("conseiller_id", user.id).eq("statut", "actif")
        : Promise.resolve({ data: [] }),
      profile.roles?.includes("ResponsableCellule")
        ? supabase.from("cellules").select("id").eq("responsable_id", user.id).single()
        : Promise.resolve({ data: null }),
      profile.roles?.includes("ResponsableFamilles")
        ? supabase.from("familles").select("id").eq("responsable_id", user.id).single()
        : Promise.resolve({ data: null }),
    ]);

    assignmentsResult.data?.forEach(a => ids.add(a.membre_id));

    if (celluleResult.data?.id) {
      const { data: cm } = await supabase
        .from("membres_complets").select("id").eq("cellule_id", celluleResult.data.id);
      cm?.forEach(m => ids.add(m.id));
    }

    if (familleResult.data?.id) {
      const { data: fm } = await supabase
        .from("membres_complets").select("id").eq("famille_id", familleResult.data.id);
      fm?.forEach(m => ids.add(m.id));
    }

    myIdsRef.current = [...ids];
  }, []);

  // ─── CHARGER TYPES DE TEMPS ──────────────────────────────────
  const loadTempsOptions = useCallback(async () => {
    await initProfile();
    const profile = profileRef.current;

    const { data } = await supabase
      .from("attendance")
      .select("typeTemps")
      .eq("eglise_id", profile.eglise_id)
      .not("typeTemps", "is", null);

    const unique = [...new Set(
      (data || [])
        .map(t => t.typeTemps?.trim())
        .filter(t => t && t !== "" && t !== "Culte Dominical")
    )];
    setTempsOptions([...unique].sort((a, b) => a.localeCompare(b, "fr")));
  }, [initProfile]);

  useEffect(() => { loadTempsOptions(); }, [loadTempsOptions]);

  // ─── TOGGLE VISIBILITÉ ───────────────────────────────────────
  const toggleVisibilite = async () => {
    const newVal = !listeVisible;
    setSavingVisible(true);
    const { uid } = profileRef.current;
    await supabase.from("profiles").update({ liste_presence_visible: newVal }).eq("id", uid);
    profileRef.current.liste_presence_visible = newVal;
    setListeVisible(newVal);
    setSavingVisible(false);
    // Recharger les données pour Admin/RI si besoin
    if (sessionReady) fetchAll(selectedDate);
  };

  // ─── FETCH MEMBRES + PRÉSENCES ───────────────────────────────
  const fetchAll = useCallback(async (date) => {
    try {
      await initProfile();
      const profile = profileRef.current;
      const myIds = myIdsRef.current;
      const isAdmin = isAdminRef.current;
      const today = date || selectedDate;

      // 1. Présences du jour
      const { data: presencesData } = await supabase
        .from("presences")
        .select("membre_id, checked_by, membres_complets(prenom, nom)")
        .eq("date", today);

      const allPresences = presencesData || [];
      const presentIds = new Set(allPresences.map(p => p.membre_id));

      if (!isAdmin) {
        // ── VUE RESPONSABLE / CONSEILLER ──────────────────────
        if (!myIds || myIds.length === 0) {
          setAllMembers([]);
          setPresentList([]);
          return;
        }

        const { data: membresData } = await supabase
          .from("membres_complets")
          .select("id, prenom, nom, telephone")
          .eq("eglise_id", profile.eglise_id)
          .in("etat_contact", ["existant", "nouveau"])
          .in("id", myIds);

        const sorted = (membresData || []).sort((a, b) => {
          const c = (a.nom || "").localeCompare(b.nom || "", "fr");
          return c !== 0 ? c : (a.prenom || "").localeCompare(b.prenom || "", "fr");
        });

        setAllMembers(sorted.filter(m => !presentIds.has(m.id)));
        setPresentList(
          allPresences
            .filter(p => myIds.includes(p.membre_id))
            .sort((a, b) => (a.membres_complets?.nom || "").localeCompare(b.membres_complets?.nom || "", "fr"))
        );
        setGroupes([]);
        return;
      }

      // ── VUE ADMIN / RI ────────────────────────────────────────
      // Charger tous les membres de l'église
      const { data: tousMembres } = await supabase
        .from("membres_complets")
        .select("id, prenom, nom, telephone, cellule_id, famille_id, conseiller_id")
        .eq("eglise_id", profile.eglise_id)
        .in("etat_contact", ["existant", "nouveau"]);

      const membres = tousMembres || [];

      // Charger les responsables ayant activé la visibilité
      const { data: responsablesVisibles } = await supabase
        .from("profiles")
        .select("id, prenom, nom, roles, liste_presence_visible")
        .eq("eglise_id", profile.eglise_id)
        .eq("liste_presence_visible", true);

      // Charger les cellules avec responsable_id
      const { data: cellulesData } = await supabase
        .from("cellules")
        .select("id, cellule_full, ville, cellule, responsable_id")
        .eq("eglise_id", profile.eglise_id);

      // Charger les familles avec responsable_id
      const { data: famillesData } = await supabase
        .from("familles")
        .select("id, nom, responsable_id")
        .eq("eglise_id", profile.eglise_id);

      // Charger les conseillers actifs
      const { data: assignmentsData } = await supabase
        .from("suivi_assignments")
        .select("membre_id, conseiller_id, profiles(prenom, nom)")
        .eq("statut", "actif");

      const visiblesIds = new Set((responsablesVisibles || []).map(r => r.id));
      const assignmentsByConseiller = {};
      (assignmentsData || []).forEach(a => {
        if (!assignmentsByConseiller[a.conseiller_id]) assignmentsByConseiller[a.conseiller_id] = [];
        assignmentsByConseiller[a.conseiller_id].push(a.membre_id);
      });

      // Indexer les membres par cellule, famille, conseiller
      const membreById = {};
      membres.forEach(m => { membreById[m.id] = m; });

      const membresDansCelluleVisible = new Set();
      const membresDansFamilleVisible = new Set();
      const membresDansConseiller = new Set();

      // Membres dans cellule dont responsable a activé visibilité
      const cellulesVisibles = (cellulesData || []).filter(c => visiblesIds.has(c.responsable_id));
      cellulesVisibles.forEach(c => {
        membres.filter(m => m.cellule_id === c.id).forEach(m => membresDansCelluleVisible.add(m.id));
      });

      // Membres dans famille dont responsable a activé visibilité
      const famillesVisibles = (famillesData || []).filter(f => visiblesIds.has(f.responsable_id));
      famillesVisibles.forEach(f => {
        membres.filter(m => m.famille_id === f.id).forEach(m => membresDansFamilleVisible.add(m.id));
      });

      // Membres avec un conseiller (toujours visible)
      Object.values(assignmentsByConseiller).flat().forEach(id => membresDansConseiller.add(id));

      // Membres masqués : dans une cellule ou famille dont responsable N'A PAS activé visibilité
      const cellulesNonVisibles = (cellulesData || []).filter(c => c.responsable_id && !visiblesIds.has(c.responsable_id));
      const famillesNonVisibles = (famillesData || []).filter(f => f.responsable_id && !visiblesIds.has(f.responsable_id));

      const membresMasques = new Set();
      cellulesNonVisibles.forEach(c => {
        membres.filter(m => m.cellule_id === c.id && !membresDansConseiller.has(m.id)).forEach(m => membresMasques.add(m.id));
      });
      famillesNonVisibles.forEach(f => {
        membres.filter(m => m.famille_id === f.id && !membresDansConseiller.has(m.id)).forEach(m => membresMasques.add(m.id));
      });

      // Construire les groupes
      const groupesResult = [];

      // Groupe : sans rattachement
      const sansCellule = membres.filter(m =>
        !m.cellule_id && !m.famille_id && !membresDansConseiller.has(m.id)
      ).sort((a, b) => (a.nom || "").localeCompare(b.nom || "", "fr"));

      if (sansCellule.length > 0) {
        groupesResult.push({
          id: "sans-rattachement",
          label: "Sans rattachement",
          icon: "👤",
          color: "gray",
          membres: sansCellule,
          presences: allPresences.filter(p => sansCellule.some(m => m.id === p.membre_id)),
        });
      }

      // Groupes cellules visibles
      cellulesVisibles.forEach(c => {
        const cm = membres
          .filter(m => m.cellule_id === c.id)
          .sort((a, b) => (a.nom || "").localeCompare(b.nom || "", "fr"));
        if (cm.length > 0) {
          groupesResult.push({
            id: `cellule-${c.id}`,
            label: c.cellule_full || `${c.ville} - ${c.cellule}`,
            icon: "🏠",
            color: "green",
            membres: cm,
            presences: allPresences.filter(p => cm.some(m => m.id === p.membre_id)),
          });
        }
      });

      // Groupes familles visibles
      famillesVisibles.forEach(f => {
        const fm = membres
          .filter(m => m.famille_id === f.id)
          .sort((a, b) => (a.nom || "").localeCompare(b.nom || "", "fr"));
        if (fm.length > 0) {
          groupesResult.push({
            id: `famille-${f.id}`,
            label: f.nom,
            icon: "👨‍👩‍👦",
            color: "purple",
            membres: fm,
            presences: allPresences.filter(p => fm.some(m => m.id === p.membre_id)),
          });
        }
      });

      // Groupes conseillers (toujours visibles)
      Object.entries(assignmentsByConseiller).forEach(([consId, memberIds]) => {
        const cm = memberIds
          .map(id => membreById[id])
          .filter(Boolean)
          .sort((a, b) => (a.nom || "").localeCompare(b.nom || "", "fr"));
        if (cm.length > 0) {
          const consProfile = (responsablesVisibles || []).find(r => r.id === consId)
            || assignmentsData?.find(a => a.conseiller_id === consId)?.profiles;
          const consNom = consProfile ? `${consProfile.prenom} ${consProfile.nom}` : "Conseiller";
          groupesResult.push({
            id: `conseiller-${consId}`,
            label: `Suivi par ${consNom}`,
            icon: "🫂",
            color: "amber",
            membres: cm,
            presences: allPresences.filter(p => cm.some(m => m.id === p.membre_id)),
          });
        }
      });

      setGroupes(groupesResult);
      setPresentList(allPresences);

      // Pour les compteurs globaux
      const visibleMembres = membres.filter(m => !membresMasques.has(m.id));
      setAllMembers(visibleMembres.filter(m => !presentIds.has(m.id)));

    } catch (err) {
      console.error(err);
    }
  }, [selectedDate, initProfile]);

  useEffect(() => {
    if (!sessionReady) return;
    setLoading(true);
    fetchAll(selectedDate).finally(() => setLoading(false));

    const channel = supabase
      .channel("presence-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "presences" }, () => fetchAll(selectedDate))
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [selectedDate, sessionReady]);

  // ─── DÉMARRER SESSION ────────────────────────────────────────
  const demarrerSession = async () => {
    const typeFinal = typeTemps === "AUTRE" ? nouveauTemps.trim() : typeTemps;
    if (!typeFinal) return alert("Veuillez choisir un type de temps.");
    if (!selectedDate) return alert("Veuillez choisir une date.");

    setSavingSession(true);
    try {
      const profile = profileRef.current;

      if (typeTemps === "AUTRE" && enregistrerTemps && !tempsOptions.includes(typeFinal)) {
        setTempsOptions(prev => [...prev, typeFinal].sort((a, b) => a.localeCompare(b, "fr")));
      }

      const isCulte = typeFinal.toLowerCase().includes("culte");
      const payload = {
        date: selectedDate,
        typeTemps: typeFinal,
        temps_nom: typeFinal,
        eglise_id: profile.eglise_id,
        ...(isCulte && numeroCulte ? { numero_culte: Number(numeroCulte) } : {}),
      };

      const { data, error } = await supabase.from("attendance").insert(payload).select("id").single();
      if (error) throw error;

      setAttendanceId(data.id);
      setSessionReady(true);
      setEditingSession(false);
    } catch (err) {
      console.error(err);
      alert("Erreur : " + err.message);
    } finally {
      setSavingSession(false);
    }
  };

  // ─── MODIFIER SESSION ────────────────────────────────────────
  const modifierSession = async () => {
    const typeFinal = typeTemps === "AUTRE" ? nouveauTemps.trim() : typeTemps;
    if (!typeFinal || !attendanceId) return;

    setSavingSession(true);
    try {
      const isCulte = typeFinal.toLowerCase().includes("culte");
      await supabase.from("attendance").update({
        date: selectedDate,
        typeTemps: typeFinal,
        temps_nom: typeFinal,
        ...(isCulte && numeroCulte ? { numero_culte: Number(numeroCulte) } : { numero_culte: null }),
      }).eq("id", attendanceId);
      setEditingSession(false);
    } catch (err) {
      console.error(err);
      alert("Erreur : " + err.message);
    } finally {
      setSavingSession(false);
    }
  };

  // ─── PRÉSENCE ────────────────────────────────────────────────
  const markPresent = async (membre) => {
    try {
      const { uid } = profileRef.current;
      await supabase.from("presences").insert({
        membre_id: membre.id,
        date: selectedDate,
        checked_by: uid,
        attendance_id: attendanceId,
      });
      await fetchAll(selectedDate);
    } catch (err) { console.error(err); }
  };

  const markAbsent = async (memberId) => {
    try {
      await supabase.from("presences").delete()
        .eq("membre_id", memberId)
        .eq("date", selectedDate);
      await fetchAll(selectedDate);
    } catch (err) { console.error(err); }
  };

  // ─── FILTRES ─────────────────────────────────────────────────
  const filterMember = (m) =>
    `${m.prenom} ${m.nom} ${m.telephone || ""}`.toLowerCase().includes(search.toLowerCase());

  const filterPresence = (p) =>
    `${p.membres_complets?.prenom} ${p.membres_complets?.nom}`.toLowerCase().includes(search.toLowerCase());

  const isAdmin = isAdminRef.current;
  const typeFinalLabel = typeTemps === "AUTRE" ? nouveauTemps : typeTemps;

  // Compteurs globaux
  const totalPresents = presentList.length;
  const totalAbsents = allMembers.length;

  // ━━━ ÉCRAN CONFIG ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (!sessionReady) {
    return (
      <div className="min-h-screen flex flex-col items-center p-4 sm:p-6" style={{ background: "#333699" }}>
        <HeaderPages />
        <div className="w-full max-w-lg mt-6">
          <h1 className="text-2xl font-bold text-white text-center mb-2">📋 Nouvelle Session</h1>
          <p className="text-white/70 text-center text-sm mb-6">Configurez la session avant de commencer</p>
          <FormulaireSession
            isEdit={false}
            selectedDate={selectedDate} setSelectedDate={setSelectedDate}
            typeTemps={typeTemps} setTypeTemps={setTypeTemps}
            nouveauTemps={nouveauTemps} setNouveauTemps={setNouveauTemps}
            enregistrerTemps={enregistrerTemps} setEnregistrerTemps={setEnregistrerTemps}
            numeroCulte={numeroCulte} setNumeroCulte={setNumeroCulte}
            tempsOptions={tempsOptions}
            savingSession={savingSession}
            onSubmit={demarrerSession}
            onCancel={null}
          />
        </div>
        <Footer />
      </div>
    );
  }

  // ━━━ ÉCRAN PRÉSENCE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6" style={{ background: "#333699" }}>
      <HeaderPages />

      <div className="text-center mb-4 mt-4 w-full">
        <h1 className="text-2xl font-bold text-white">
          Présences du <span className="text-emerald-300">jour</span>
        </h1>

        {/* Résumé session cliquable */}
        <div
          className="inline-flex flex-col items-center mt-3 px-4 py-2 bg-white/10 rounded-xl cursor-pointer hover:bg-white/20 transition group"
          onClick={() => setEditingSession(v => !v)}
        >
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold text-sm">
              {typeFinalLabel}
              {numeroCulte ? ` — ${numeroCulte}${Number(numeroCulte) === 1 ? "er" : "ème"} culte` : ""}
            </span>
            <span className="text-white/50 text-xs group-hover:text-white transition">✏️</span>
          </div>
          <span className="text-white/60 text-xs mt-0.5">
            📅 {new Date(selectedDate + "T00:00:00").toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}
          </span>
          <span className="text-white/40 text-xs mt-0.5">Cliquer pour modifier</span>
        </div>

        <div className="flex gap-4 justify-center mt-3 text-sm">
          <span className="text-green-300">✔ Présents : {totalPresents}</span>
          <span className="text-white">⚪ Restants : {totalAbsents}</span>
        </div>
      </div>

      {/* ── TOGGLE VISIBILITÉ (Responsable seulement) ── */}
      {!isAdmin && (
        <ToggleVisibilite
          visible={listeVisible}
          onToggle={toggleVisibilite}
          saving={savingVisible}
        />
      )}

      {/* ── MODIFICATION SESSION INLINE ── */}
      {editingSession && (
        <div className="w-full max-w-lg mb-6">
          <h2 className="text-white font-semibold text-center mb-3">✏️ Modifier la session</h2>
          <FormulaireSession
            isEdit={true}
            selectedDate={selectedDate} setSelectedDate={setSelectedDate}
            typeTemps={typeTemps} setTypeTemps={setTypeTemps}
            nouveauTemps={nouveauTemps} setNouveauTemps={setNouveauTemps}
            enregistrerTemps={enregistrerTemps} setEnregistrerTemps={setEnregistrerTemps}
            numeroCulte={numeroCulte} setNumeroCulte={setNumeroCulte}
            tempsOptions={tempsOptions}
            savingSession={savingSession}
            onSubmit={modifierSession}
            onCancel={() => setEditingSession(false)}
          />
        </div>
      )}

      {/* ── LISTE ── */}
      {!editingSession && (
        <>
          <div className="flex gap-3 mb-4">
            <button
              onClick={() => setView("absents")}
              className={`px-4 py-2 rounded ${view === "absents" ? "bg-white text-[#333699] font-bold" : "bg-white/20 text-white"}`}
            >
              ⚪ Absents ({totalAbsents})
            </button>
            <button
              onClick={() => setView("presents")}
              className={`px-4 py-2 rounded ${view === "presents" ? "bg-green-400 text-black font-bold" : "bg-white/20 text-white"}`}
            >
              ✔ Présents ({totalPresents})
            </button>
          </div>

          {view === "absents" && (
            <p className="text-amber-300 text-sm mb-2 italic">💡 Cliquer sur un nom pour marquer comme présent</p>
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
          ) : isAdmin ? (
            // ── VUE GROUPÉE (Admin/RI) ──────────────────────────
            <div className="w-full flex flex-col items-center">
              {groupes.length === 0 ? (
                <p className="text-white text-center">Aucun membre visible</p>
              ) : (
                groupes.map(g => {
                  const presentIdsSet = new Set(g.presences.map(p => p.membre_id));
                  const itemsToShow = view === "absents"
                    ? g.membres.filter(m => !presentIdsSet.has(m.id) && filterMember(m))
                    : g.presences.filter(p => presentIdsSet.has(p.membre_id) && filterPresence(p));

                  if (itemsToShow.length === 0) return null;

                  return (
                    <SectionGroupe
                      key={g.id}
                      label={g.label}
                      icon={g.icon}
                      color={g.color}
                      members={view === "absents" ? itemsToShow : g.membres}
                      presentIds={presentIdsSet}
                      onMark={markPresent}
                      onUnmark={markAbsent}
                      view={view}
                    />
                  );
                })
              )}
            </div>
          ) : (
            // ── VUE SIMPLE (Responsable/Conseiller) ─────────────
            <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 gap-2">
              {view === "absents" ? (
                allMembers.filter(filterMember).length === 0 ? (
                  <p className="text-white text-center col-span-full">✅ Tout le monde est présent</p>
                ) : (
                  allMembers.filter(filterMember).map(m => (
                    <CarteAbsent key={m.id} m={m} onMark={markPresent} />
                  ))
                )
              ) : (
                presentList.filter(filterPresence).length === 0 ? (
                  <p className="text-white text-center col-span-full">Aucune présence</p>
                ) : (
                  presentList.filter(filterPresence).map(p => (
                    <CartePresent key={p.membre_id} p={p} onUnmark={markAbsent} />
                  ))
                )
              )}
            </div>
          )}

          <button
            onClick={() => {
              setSessionReady(false);
              setAttendanceId(null);
              setTypeTemps("");
              setNouveauTemps("");
              setNumeroCulte("");
              setEnregistrerTemps(false);
            }}
            className="mt-8 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm"
          >
            ↩ Nouvelle session
          </button>
        </>
      )}

      <Footer />
    </div>
  );
}
