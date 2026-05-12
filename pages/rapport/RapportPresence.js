"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import supabase from "../../lib/supabaseClient";
import HeaderPages from "../../components/HeaderPages";
import ProtectedRoute from "../../components/ProtectedRoute";
import Footer from "../../components/Footer";

export default function RapportPresencePage() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableIntegration", "Conseiller", "ResponsableCellule", "ResponsableFamilles"]}>
      <RapportPresence />
    </ProtectedRoute>
  );
}

// ─── HELPERS ──────────────────────────────────────────────────
function formatDateFr(dateStr) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("fr-FR", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function sessionLabel(s) {
  const culte = s.numero_culte
    ? ` — ${s.numero_culte}${s.numero_culte === 1 ? "er" : "ème"} culte`
    : "";
  return `${s.typeTemps}${culte}`;
}

// ─── BADGE ───────────────────────────────────────────────────
function Badge({ count, color }) {
  const map = {
    green: "bg-emerald-100 text-emerald-700",
    red:   "bg-red-100 text-red-600",
    gray:  "bg-gray-100 text-gray-500",
  };
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${map[color] || map.gray}`}>
      {count}
    </span>
  );
}

// ─── LISTE NOMS ───────────────────────────────────────────────
function ListeNoms({ membres, color }) {
  const map = {
    green: "border-l-emerald-400 text-emerald-900",
    red:   "border-l-red-400 text-red-900",
  };
  if (membres.length === 0) return (
    <p className="text-xs text-gray-400 italic pl-3">Aucun</p>
  );
  return (
    <ul className={`pl-3 border-l-2 ${color === "green" ? "border-l-emerald-400" : "border-l-red-400"} flex flex-col gap-0.5`}>
      {membres.map((m, i) => (
        <li key={i} className="text-sm text-gray-700 flex items-center gap-2">
          <span className={`inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 ${color === "green" ? "bg-emerald-400" : "bg-red-400"}`} />
          {m.prenom} {m.nom}
        </li>
      ))}
    </ul>
  );
}

// ─── CARTE SESSION ────────────────────────────────────────────
function CarteSession({ session, presences, allMembres }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("presents");

  const presentIds = new Set(presences.filter(p => p.statut === "present").map(p => p.membre_id));
  const presents   = allMembres.filter(m => presentIds.has(m.id)).sort((a, b) => a.nom.localeCompare(b.nom, "fr"));
  const absents    = allMembres.filter(m => !presentIds.has(m.id)).sort((a, b) => a.nom.localeCompare(b.nom, "fr"));

  const tauxP = allMembres.length > 0 ? Math.round((presents.length / allMembres.length) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* En-tête cliquable */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition text-left gap-3"
      >
        <div className="flex flex-col">
          <span className="font-bold text-gray-800 text-base">{sessionLabel(session)}</span>
          <span className="text-xs text-gray-400 mt-0.5">
            📅 {formatDateFr(session.date)}
            {session.heure ? ` · ${session.heure}` : ""}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Mini barre de taux */}
          <div className="hidden sm:flex items-center gap-1.5">
            <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-400 rounded-full transition-all" style={{ width: `${tauxP}%` }} />
            </div>
            <span className="text-xs text-gray-500 w-8 text-right">{tauxP}%</span>
          </div>
          <Badge count={`✔ ${presents.length}`} color="green" />
          <Badge count={`✗ ${absents.length}`} color="red" />
          <span className="text-gray-400 text-sm">{open ? "▲" : "▼"}</span>
        </div>
      </button>

      {/* Contenu accordéon */}
      {open && (
        <div className="border-t border-gray-100 px-5 py-4 flex flex-col gap-3">
          {/* Onglets */}
          <div className="flex gap-2">
            <button
              onClick={() => setTab("presents")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition ${tab === "presents" ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
            >
              ✔ Présents <Badge count={presents.length} color={tab === "presents" ? "gray" : "green"} />
            </button>
            <button
              onClick={() => setTab("absents")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition ${tab === "absents" ? "bg-red-500 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
            >
              ✗ Absents <Badge count={absents.length} color={tab === "absents" ? "gray" : "red"} />
            </button>
          </div>

          <ListeNoms membres={tab === "presents" ? presents : absents} color={tab === "presents" ? "green" : "red"} />
        </div>
      )}
    </div>
  );
}

// ─── FILTRES TYPE DE TEMPS ────────────────────────────────────
function FiltreTypes({ types, actif, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange("")}
        className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${!actif ? "bg-[#333699] text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-[#333699]"}`}
      >
        Tous
      </button>
      {types.map(t => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${actif === t ? "bg-[#333699] text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-[#333699]"}`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

// ─── PAGE PRINCIPALE ──────────────────────────────────────────
function RapportPresence() {
  const [sessions, setSessions]       = useState([]);
  const [presences, setPresences]     = useState({});  // { attendance_id: [presences] }
  const [allMembres, setAllMembres]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [filtreType, setFiltreType]   = useState("");
  const [filtrePeriode, setFiltrePeriode] = useState("30"); // jours

  const profileRef = useRef(null);

  const initProfile = useCallback(async () => {
    if (profileRef.current) return;
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile }  = await supabase.from("profiles").select("eglise_id, role, roles").eq("id", user.id).single();
    profileRef.current = { ...profile, uid: user.id };
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      await initProfile();
      const profile = profileRef.current;

      // Période
      const depuis = new Date();
      depuis.setDate(depuis.getDate() - Number(filtrePeriode));
      const depuisStr = depuis.toISOString().split("T")[0];

      // Sessions
      const { data: sessionsData } = await supabase
        .from("attendance")
        .select("id, typeTemps, date, heure, numero_culte")
        .eq("eglise_id", profile.eglise_id)
        .gte("date", depuisStr)
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });

      const sess = sessionsData || [];
      setSessions(sess);

      if (sess.length === 0) { setLoading(false); return; }

      // Membres
      const isAdmin = profile.roles?.includes("Administrateur") || profile.roles?.includes("ResponsableIntegration");
      let membresQuery = supabase.from("membres_complets")
        .select("id, prenom, nom, sexe")
        .eq("eglise_id", profile.eglise_id)
        .in("etat_contact", ["existant", "nouveau"]);

      // Pour non-admin : filtrer sur ses membres
      if (!isAdmin) {
        let ids = new Set();
        const [asgn, cell, fam] = await Promise.all([
          profile.roles?.includes("Conseiller")
            ? supabase.from("suivi_assignments").select("membre_id").eq("conseiller_id", profile.uid).eq("statut", "actif")
            : Promise.resolve({ data: [] }),
          profile.roles?.includes("ResponsableCellule")
            ? supabase.from("cellules").select("id").eq("responsable_id", profile.uid)
            : Promise.resolve({ data: [] }),
          profile.roles?.includes("ResponsableFamilles")
            ? supabase.from("familles").select("id").eq("responsable_id", profile.uid)
            : Promise.resolve({ data: [] }),
        ]);
        asgn.data?.forEach(a => ids.add(a.membre_id));
        if (cell.data?.length > 0) {
          const { data: cm } = await supabase.from("membres_complets").select("id").in("cellule_id", cell.data.map(c => c.id)).in("etat_contact", ["existant", "nouveau"]);
          cm?.forEach(m => ids.add(m.id));
        }
        if (fam.data?.length > 0) {
          const { data: fm } = await supabase.from("membres_complets").select("id").in("famille_id", fam.data.map(f => f.id)).in("etat_contact", ["existant", "nouveau"]);
          fm?.forEach(m => ids.add(m.id));
        }
        if (ids.size > 0) membresQuery = membresQuery.in("id", [...ids]);
        else { setAllMembres([]); setPresences({}); setLoading(false); return; }
      }

      const { data: membresData } = await membresQuery.order("nom");
      setAllMembres(membresData || []);

      // Présences pour toutes les sessions
      const sessIds = sess.map(s => s.id);
      const { data: presData } = await supabase
        .from("presences")
        .select("attendance_id, membre_id, statut")
        .in("attendance_id", sessIds);

      // Grouper par attendance_id
      const grouped = {};
      (presData || []).forEach(p => {
        if (!grouped[p.attendance_id]) grouped[p.attendance_id] = [];
        grouped[p.attendance_id].push(p);
      });
      setPresences(grouped);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [initProfile, filtrePeriode]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Types distincts pour le filtre
  const typesDistincts = [...new Set(sessions.map(s => s.typeTemps).filter(Boolean))];

  const sessionsFiltrees = sessions.filter(s =>
    !filtreType || s.typeTemps === filtreType
  );

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6" style={{ background: "#333699" }}>
      <HeaderPages />

      <div className="w-full max-w-2xl mt-6 mb-8 flex flex-col gap-4">

        {/* Titre */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">📊 Rapport de présences</h1>
          <p className="text-white/60 text-sm mt-1">Historique par session</p>
        </div>

        {/* Filtres dans un bloc blanc */}
        <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-3">
          {/* Période */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-gray-600 flex-shrink-0">Période :</span>
            {[
              { label: "7 jours", val: "7" },
              { label: "30 jours", val: "30" },
              { label: "90 jours", val: "90" },
              { label: "6 mois", val: "180" },
            ].map(p => (
              <button key={p.val} onClick={() => setFiltrePeriode(p.val)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition ${filtrePeriode === p.val ? "bg-[#333699] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                {p.label}
              </button>
            ))}
          </div>

          {/* Type */}
          {typesDistincts.length > 0 && (
            <div className="flex items-start gap-2 flex-wrap">
              <span className="text-sm font-semibold text-gray-600 flex-shrink-0 mt-1">Type :</span>
              <FiltreTypes types={typesDistincts} actif={filtreType} onChange={setFiltreType} />
            </div>
          )}
        </div>

        {/* Résultats */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        ) : sessionsFiltrees.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-gray-400 text-sm">
            Aucune session sur cette période
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {sessionsFiltrees.map(s => (
              <CarteSession
                key={s.id}
                session={s}
                presences={presences[s.id] || []}
                allMembres={allMembres}
              />
            ))}
          </div>
        )}

      </div>

      <Footer />
    </div>
  );
}
