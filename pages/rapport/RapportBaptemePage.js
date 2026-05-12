"use client";
import { useEffect, useState, useRef } from "react";
import supabase from "../../lib/supabaseClient";
import HeaderPages from "../../components/HeaderPages";
import Footer from "../../components/Footer";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useRouter } from "next/navigation";

export default function RapportBaptemesPage() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableFormation"]}>
      <RapportBaptemes />
    </ProtectedRoute>
  );
}

// ─── HELPERS ──────────────────────────────────────────────────
function formatDateFr(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("fr-FR", {
    day: "2-digit", month: "short", year: "numeric",
  });
}
function formatDateCourt(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("fr-FR", {
    day: "2-digit", month: "short",
  });
}
function getMonthNameFR(monthIndex) {
  return ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"][monthIndex] || "";
}

// ─── UI ATOMS ─────────────────────────────────────────────────
function SectionTitle({ children }) {
  return <p className="text-[11px] font-semibold uppercase tracking-widest text-white/40 mb-3">{children}</p>;
}
function KpiCard({ label, value, sub, accent }) {
  const c = { green: "text-emerald-400", red: "text-red-400", amber: "text-amber-400", white: "text-white", blue: "text-blue-300", pink: "text-pink-300", purple: "text-purple-300" };
  return (
    <div className="bg-white/10 rounded-2xl px-4 py-4 flex flex-col gap-1">
      <p className="text-xs text-white/50">{label}</p>
      <p className={`text-2xl font-bold leading-none ${c[accent] || "text-white"}`}>{value}</p>
      {sub && <p className="text-[11px] text-white/40 mt-0.5">{sub}</p>}
    </div>
  );
}
function Badge({ children, color }) {
  const m = {
    green: "bg-emerald-900/60 text-emerald-300",
    red: "bg-red-900/60 text-red-300",
    amber: "bg-amber-900/60 text-amber-300",
    blue: "bg-blue-900/60 text-blue-300",
    pink: "bg-pink-900/60 text-pink-300",
    purple: "bg-purple-900/60 text-purple-300",
    gray: "bg-white/10 text-white/50",
  };
  return <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${m[color] || m.gray}`}>{children}</span>;
}
function BarreProgression({ pct, color }) {
  const col = color || (pct >= 70 ? "bg-emerald-400" : pct >= 40 ? "bg-amber-400" : "bg-red-400");
  return (
    <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all ${col}`} style={{ width: `${Math.min(pct, 100)}%` }} />
    </div>
  );
}

// ─── AGRÉGATION ───────────────────────────────────────────────
function aggregateRapports(rapports) {
  const map = {};
  rapports.forEach(r => {
    const key = `${r.date}__${r.baptise_par}`;
    if (!map[key]) map[key] = { ...r, hommes: 0, femmes: 0 };
    map[key].hommes += Number(r.hommes || 0);
    map[key].femmes += Number(r.femmes || 0);
  });
  return Object.values(map);
}

// ─── BLOC KPI GLOBAUX ──────────────────────────────────────────
function BlocKpiGlobaux({ rapports }) {
  const totalH = rapports.reduce((a, r) => a + Number(r.hommes || 0), 0);
  const totalF = rapports.reduce((a, r) => a + Number(r.femmes || 0), 0);
  const total = totalH + totalF;
  const sessions = aggregateRapports(rapports);
  const nbSessions = sessions.length;
  const moy = nbSessions > 0 ? Math.round(total / nbSessions) : 0;
  const pctH = total > 0 ? Math.round((totalH / total) * 100) : 0;
  const pctF = total > 0 ? 100 - pctH : 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard label="Total baptisés" value={total} sub="sur la période" accent="amber" />
        <KpiCard label="Sessions" value={nbSessions} sub="cérémonies" accent="white" />
        <KpiCard label="Hommes" value={totalH} sub={`${pctH}% du total`} accent="blue" />
        <KpiCard label="Femmes" value={totalF} sub={`${pctF}% du total`} accent="pink" />
      </div>
      {total > 0 && (
        <div className="bg-white/10 rounded-2xl px-4 py-4 flex flex-col gap-3">
          <p className="text-xs text-white/50">Répartition H / F</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-blue-900/40 rounded-xl px-3 py-3 text-center">
              <p className="text-xl font-bold text-blue-300">{totalH}</p>
              <p className="text-[11px] text-blue-400/70">Hommes</p>
              <p className="text-[10px] text-blue-500/50">{pctH}%</p>
            </div>
            <div className="bg-pink-900/40 rounded-xl px-3 py-3 text-center">
              <p className="text-xl font-bold text-pink-300">{totalF}</p>
              <p className="text-[11px] text-pink-400/70">Femmes</p>
              <p className="text-[10px] text-pink-500/50">{pctF}%</p>
            </div>
          </div>
          <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
            <div className="bg-blue-400 rounded-l-full transition-all" style={{ width: `${pctH}%` }} />
            <div className="bg-pink-400 rounded-r-full transition-all" style={{ width: `${pctF}%` }} />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── BLOC TENDANCE MENSUELLE ───────────────────────────────────
function BlocTendance({ rapports }) {
  const parMois = {};
  rapports.forEach(r => {
    const d = new Date(r.date + "T00:00:00");
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!parMois[key]) parMois[key] = { h: 0, f: 0, label: `${getMonthNameFR(d.getMonth()).slice(0, 3)} ${d.getFullYear()}` };
    parMois[key].h += Number(r.hommes || 0);
    parMois[key].f += Number(r.femmes || 0);
  });
  const mois = Object.entries(parMois).sort(([a], [b]) => a.localeCompare(b)).slice(-8);
  if (mois.length < 2) return <p className="text-white/30 text-sm text-center py-4">Données insuffisantes (≥ 2 mois)</p>;
  const maxVal = Math.max(...mois.map(([, v]) => v.h + v.f), 1);
  const derniere = mois[mois.length - 1];
  const avantDerniere = mois[mois.length - 2];
  const delta = (derniere[1].h + derniere[1].f) - (avantDerniere[1].h + avantDerniere[1].f);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="text-2xl font-bold text-white">{derniere[1].h + derniere[1].f}</span>
        <span className={`text-sm font-semibold ${delta >= 0 ? "text-emerald-400" : "text-red-400"}`}>
          {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)} vs mois préc.
        </span>
      </div>
      <div className="flex items-end gap-1.5 h-20">
        {mois.map(([key, { h, f, label }]) => {
          const tot = h + f;
          return (
            <div key={key} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex gap-0.5 items-end" style={{ height: "60px" }}>
                <div className="flex-1 bg-blue-500/70 rounded-t-sm" style={{ height: `${Math.max(3, (h / maxVal) * 60)}px` }} />
                <div className="flex-1 bg-pink-500/70 rounded-t-sm" style={{ height: `${Math.max(3, (f / maxVal) * 60)}px` }} />
              </div>
              <p className="text-[9px] text-white/30 truncate w-full text-center">{label}</p>
            </div>
          );
        })}
      </div>
      <div className="flex gap-3 text-[11px] text-white/40">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-blue-500/70 inline-block" /> Hommes</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-pink-500/70 inline-block" /> Femmes</span>
      </div>
    </div>
  );
}

// ─── BLOC PAR OFFICIANT ────────────────────────────────────────
function BlocParOfficiant({ rapports }) {
  const parOfficiant = {};
  rapports.forEach(r => {
    const nom = r.baptise_par || "Non renseigné";
    if (!parOfficiant[nom]) parOfficiant[nom] = { h: 0, f: 0, nb: 0 };
    parOfficiant[nom].h += Number(r.hommes || 0);
    parOfficiant[nom].f += Number(r.femmes || 0);
    parOfficiant[nom].nb++;
  });
  const lignes = Object.entries(parOfficiant).sort((a, b) => (b[1].h + b[1].f) - (a[1].h + a[1].f));
  const maxTot = Math.max(...lignes.map(([, v]) => v.h + v.f), 1);
  if (!lignes.length) return <p className="text-white/30 text-sm text-center py-4">Aucune donnée</p>;

  return (
    <div className="flex flex-col gap-2">
      {lignes.map(([nom, { h, f, nb }]) => {
        const tot = h + f;
        return (
          <div key={nom} className="bg-white/10 rounded-xl px-4 py-3 flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <p className="text-sm text-white w-36 flex-shrink-0 truncate">{nom}</p>
              <BarreProgression pct={(tot / maxTot) * 100} color="bg-amber-400" />
              <p className="text-sm font-bold text-white w-8 text-right">{tot}</p>
              <p className="text-[11px] text-white/30 w-16 text-right flex-shrink-0">{nb} sess.</p>
            </div>
            <div className="flex gap-2 ml-36">
              <Badge color="blue">H: {h}</Badge>
              <Badge color="pink">F: {f}</Badge>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── CARTE SESSION ─────────────────────────────────────────────
function CarteSession({ r, onEdit }) {
  const [open, setOpen] = useState(false);
  const total = Number(r.hommes || 0) + Number(r.femmes || 0);
  return (
    <div className="bg-white/10 rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-4 hover:bg-white/5 transition text-left gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold text-white text-sm">{r.baptise_par || "—"}</span>
          <span className="text-[11px] text-white/40">{formatDateFr(r.date)}</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge color="blue">H {r.hommes}</Badge>
          <Badge color="pink">F {r.femmes}</Badge>
          <Badge color="amber">Total {total}</Badge>
          <span className="text-white/30 text-xs">{open ? "▲" : "▼"}</span>
        </div>
      </button>
      {open && (
        <div className="border-t border-white/10 px-4 pb-4 pt-3 flex flex-col gap-3">
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Hommes", value: r.hommes, color: "text-blue-300" },
              { label: "Femmes", value: r.femmes, color: "text-pink-300" },
              { label: "Total", value: total, color: "text-amber-300 font-bold" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-white/5 rounded-xl px-3 py-2 flex flex-col">
                <p className="text-[10px] text-white/40">{label}</p>
                <p className={`text-lg font-bold ${color}`}>{value || 0}</p>
              </div>
            ))}
          </div>
          <button onClick={() => onEdit(r)}
            className="w-full py-2 rounded-xl bg-blue-600/40 hover:bg-blue-600/60 text-blue-300 text-sm font-semibold transition">
            ✏️ Modifier
          </button>
        </div>
      )}
    </div>
  );
}

// ─── FORMULAIRE SAISIE ─────────────────────────────────────────
function FormulaireSaisie({ formData, setFormData, candidats, selectedCandidats, setSelectedCandidats, editRapport, onSubmit, onCancelEdit, rapportSuccess, router }) {
  return (
    <div className="flex flex-col gap-4">
      {/* Info candidats */}
      <div className="bg-blue-900/40 border border-blue-300/20 rounded-2xl px-4 py-4 text-sm text-white/80 text-center">
        ℹ️ Cette liste contient les personnes qui <strong className="text-white">n'ont pas encore été baptisées</strong> et qui <strong className="text-white">souhaitent prendre leur baptême</strong>. Ces informations sont mises à jour dans la <strong className="text-white">Liste des membres</strong>.{" "}
        <button onClick={() => router.push("/list-members")} className="underline text-amber-300 hover:text-amber-200 mt-1 inline-block">
          Voir la liste des membres
        </button>
      </div>

      {/* Sélection candidats */}
      <div className="bg-white/10 rounded-2xl p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-white font-semibold text-sm">Sélectionner les baptisés</p>
          <button
            onClick={() => setSelectedCandidats(selectedCandidats.length === 0 ? candidats.map(c => c.id) : [])}
            className="text-xs text-amber-300 hover:text-amber-200 underline"
          >
            {selectedCandidats.length === 0 ? "Tout sélectionner" : "Tout désélectionner"}
          </button>
        </div>
        <div className="flex flex-col gap-1 max-h-52 overflow-y-auto">
          {candidats.length === 0 && (
            <p className="text-white/30 text-sm text-center py-3">Aucun candidat au baptême</p>
          )}
          {candidats.map(c => (
            <label key={c.id} className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-white/10 cursor-pointer transition">
              <span className="text-sm text-white">{c.prenom} {c.nom}</span>
              <input
                type="checkbox"
                checked={selectedCandidats.includes(c.id)}
                onChange={() => setSelectedCandidats(
                  selectedCandidats.includes(c.id)
                    ? selectedCandidats.filter(id => id !== c.id)
                    : [...selectedCandidats, c.id]
                )}
                className="accent-[#25297e] w-4 h-4"
              />
            </label>
          ))}
        </div>
        <button onClick={() => router.push("/AddContactbaptise")}
          className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition">
          ➕ Ajouter un baptisé (s'il n'apparaît pas dans la liste)
        </button>
        {selectedCandidats.length > 0 && (
          <div className="border-t border-white/10 pt-3">
            <p className="text-[11px] text-amber-300 font-semibold mb-2">Sélectionnés :</p>
            <div className="flex flex-wrap gap-2">
              {candidats.filter(c => selectedCandidats.includes(c.id)).map(c => (
                <Badge key={c.id} color="amber">{c.prenom} {c.nom}</Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Formulaire */}
      <div className="bg-white/10 rounded-2xl p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="text-white font-semibold">{editRapport ? "✏️ Modifier le rapport" : "➕ Nouveau rapport"}</p>
          {editRapport && (
            <button onClick={onCancelEdit} className="text-xs text-white/40 hover:text-white/70 transition">Annuler</button>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-white/50">Date de la cérémonie</label>
          <input type="date" required value={formData.date}
            onChange={e => setFormData(p => ({ ...p, date: e.target.value }))}
            className="bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-white/40" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-blue-300/70">Hommes</label>
            <input type="number" value={formData.hommes} disabled
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-blue-300 text-sm text-center opacity-70 cursor-not-allowed" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-pink-300/70">Femmes</label>
            <input type="number" value={formData.femmes} disabled
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-pink-300 text-sm text-center opacity-70 cursor-not-allowed" />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-white/50">Baptisé par</label>
          <input type="text" required value={formData.baptise_par}
            onChange={e => setFormData(p => ({ ...p, baptise_par: e.target.value }))}
            placeholder="Nom de l'officiant"
            className="bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-white/40 placeholder:text-white/20" />
        </div>

        <button onClick={onSubmit}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-sm hover:from-blue-600 hover:to-indigo-700 transition-all active:scale-95">
          {editRapport ? "Mettre à jour" : "Ajouter le rapport"}
        </button>

        {rapportSuccess && (
          <p className="text-center text-sm font-semibold text-emerald-400 animate-pulse">✅ Rapport ajouté avec succès !</p>
        )}
      </div>
    </div>
  );
}

// ─── PAGE PRINCIPALE ───────────────────────────────────────────
function RapportBaptemes() {
  const [formData, setFormData] = useState({ date: "", hommes: 0, femmes: 0, baptise_par: "", eglise_id: null });
  const [filterDebut, setFilterDebut] = useState("");
  const [filterFin, setFilterFin] = useState("");
  const [filtrePeriode, setFiltrePeriode] = useState("365");
  const [modePerso, setModePerso] = useState(false);
  const [rapports, setRapports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editRapport, setEditRapport] = useState(null);
  const [candidats, setCandidats] = useState([]);
  const [selectedCandidats, setSelectedCandidats] = useState([]);
  const [onglet, setOnglet] = useState("kpi");
  const [rapportSuccess, setRapportSuccess] = useState(false);
  const router = useRouter();
  const formRef = useRef(null);

  // Calcul hommes/femmes depuis sélection
  useEffect(() => {
    const selected = candidats.filter(c => selectedCandidats.includes(c.id));
    setFormData(prev => ({
      ...prev,
      hommes: selected.filter(c => c.sexe === "Homme").length,
      femmes: selected.filter(c => c.sexe === "Femme").length,
    }));
  }, [selectedCandidats, candidats]);

  // Chargement utilisateur
  useEffect(() => {
    const fetchUser = async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) return;
      const { data: profile } = await supabase.from("profiles").select("eglise_id").eq("id", session.session.user.id).single();
      if (profile) {
        setFormData(prev => ({ ...prev, eglise_id: profile.eglise_id }));
        fetchCandidats(profile.eglise_id);
      }
    };
    fetchUser();
  }, []);

  const fetchCandidats = async (eglise_id) => {
    const { data } = await supabase.from("membres_complets").select("id,prenom,nom,sexe,evangelise_member_id")
      .eq("eglise_id", eglise_id).eq("veut_se_faire_baptiser", "Oui").eq("bapteme_eau", "Non");
    setCandidats(data || []);
  };

  const fetchRapports = async (overrideModePerso = null) => {
    if (!formData.eglise_id) return;
    setLoading(true);
    const isPerso = overrideModePerso !== null ? overrideModePerso : modePerso;
    let query = supabase.from("baptemes").select("*").eq("eglise_id", formData.eglise_id).order("date", { ascending: false });
    if (isPerso) {
      if (filterDebut) query = query.gte("date", filterDebut);
      if (filterFin)   query = query.lte("date", filterFin);
    } else {
      const depuis = new Date();
      depuis.setDate(depuis.getDate() - Number(filtrePeriode));
      query = query.gte("date", depuis.toISOString().split("T")[0]);
    }
    const { data } = await query;
    setRapports(data || []);
    setLoading(false);
  };

  useEffect(() => { if (!modePerso && formData.eglise_id) fetchRapports(false); }, [formData.eglise_id, filtrePeriode, modePerso]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!formData.baptise_par.trim()) { alert("Le champ 'Baptisé par' est obligatoire."); return; }
    if (editRapport) {
      await supabase.from("baptemes").update({
        date: formData.date, hommes: formData.hommes, femmes: formData.femmes, baptise_par: formData.baptise_par,
      }).eq("id", editRapport.id);
      setEditRapport(null);
    } else {
      if (selectedCandidats.length === 0) { alert("Veuillez sélectionner au moins un candidat."); return; }
      for (const id of selectedCandidats) {
        const membre = candidats.find(c => c.id === id);
        if (!membre) continue;
        await supabase.from("baptemes").insert([{
          ...formData, baptise_par: formData.baptise_par,
          evangelise_member_id: membre.evangelise_member_id || membre.id,
        }]);
        await supabase.from("membres_complets").update({ bapteme_eau: "Oui", veut_se_faire_baptiser: "Non" }).eq("id", id);
      }
      setSelectedCandidats([]);
      fetchCandidats(formData.eglise_id);
      setRapportSuccess(true);
      setTimeout(() => setRapportSuccess(false), 3000);
    }
    setFormData(prev => ({ ...prev, date: "", hommes: 0, femmes: 0, baptise_par: "" }));
    fetchRapports();
  };

  const handleEdit = (r) => {
    setEditRapport(r);
    setFormData(prev => ({ ...prev, date: r.date, hommes: r.hommes, femmes: r.femmes, baptise_par: r.baptise_par }));
    setOnglet("saisie");
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  };

  const sessions = aggregateRapports(rapports).sort((a, b) => new Date(b.date) - new Date(a.date));

  const onglets = [
    { key: "kpi", label: "Vue d'ensemble" },
    { key: "sessions", label: "Par session" },
    { key: "saisie", label: "Saisie" },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6" style={{ background: "#333699" }}>
      <HeaderPages />

      {/* En-tête */}
      <h1 className="text-2xl font-bold mt-4 mb-3 text-center text-white">
        Rapport <span className="text-emerald-300">Baptêmes</span>
      </h1>
      <div className="max-w-3xl w-full mb-6 text-center">
        <p className="italic text-base text-white/90">
          <span className="text-blue-300 font-semibold">Créez et suivez</span> les rapports de baptêmes ainsi que le suivi des{" "}
          <span className="text-blue-300 font-semibold">nouveaux baptisés</span>. Enregistrez les données,{" "}
          <span className="text-blue-300 font-semibold">analysez</span> les volumes et la répartition hommes/femmes pour mesurer{" "}
          <span className="text-blue-300 font-semibold">l'impact et structurer la croissance de l'église</span>.
        </p>
      </div>

      <div className="w-full max-w-2xl flex flex-col gap-4">
        {/* Filtres */}
        <div className="bg-white/10 rounded-2xl p-4 flex flex-col gap-3">
          {/* Toggle mode */}
          <div className="flex gap-1 bg-white/10 rounded-xl p-1 w-fit">
            <button onClick={() => setModePerso(false)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${!modePerso ? "bg-white text-[#333699]" : "text-white/50 hover:text-white/80"}`}>
              Période rapide
            </button>
            <button onClick={() => setModePerso(true)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${modePerso ? "bg-white text-[#333699]" : "text-white/50 hover:text-white/80"}`}>
              Tranche de dates
            </button>
          </div>

          {/* Période rapide */}
          {!modePerso && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-white/50 flex-shrink-0">Période :</span>
              {[{ label: "30 j", val: "30" }, { label: "90 j", val: "90" }, { label: "6 mois", val: "180" }, { label: "1 an", val: "365" }, { label: "2 ans", val: "730" }].map(p => (
                <button key={p.val} onClick={() => setFiltrePeriode(p.val)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition ${filtrePeriode === p.val ? "bg-white text-[#333699]" : "bg-white/15 text-white/70 hover:bg-white/20"}`}>
                  {p.label}
                </button>
              ))}
            </div>
          )}

          {/* Tranche personnalisée */}
          {modePerso && (
            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-white/50">Date de début</label>
                  <input type="date" value={filterDebut} onChange={e => setFilterDebut(e.target.value)}
                    className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-white/50">Date de fin</label>
                  <input type="date" value={filterFin} onChange={e => setFilterFin(e.target.value)}
                    className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40" />
                </div>
              </div>
              <button onClick={() => fetchRapports(true)}
                className="w-full py-2 rounded-xl bg-amber-500/80 hover:bg-amber-500 text-white text-sm font-semibold transition active:scale-95">
                Générer le rapport
              </button>
            </div>
          )}
        </div>

        {/* Onglets */}
        <div className="flex gap-1 bg-white/10 rounded-xl p-1">
          {onglets.map(o => (
            <button key={o.key} onClick={() => setOnglet(o.key)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition whitespace-nowrap ${onglet === o.key ? "bg-white text-[#333699]" : "text-white/50 hover:text-white/80"}`}>
              {o.label}
            </button>
          ))}
        </div>

        {/* Contenu */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        ) : onglet === "saisie" ? (
          <div ref={formRef}>
            <FormulaireSaisie
              formData={formData}
              setFormData={setFormData}
              candidats={candidats}
              selectedCandidats={selectedCandidats}
              setSelectedCandidats={setSelectedCandidats}
              editRapport={editRapport}
              onSubmit={handleSubmit}
              onCancelEdit={() => { setEditRapport(null); setFormData(p => ({ ...p, date: "", hommes: 0, femmes: 0, baptise_par: "" })); }}
              rapportSuccess={rapportSuccess}
              router={router}
            />
          </div>
        ) : rapports.length === 0 ? (
          <div className="bg-white/10 rounded-2xl p-8 text-center flex flex-col gap-3">
            <p className="text-white/40 text-sm">Aucun rapport sur cette période</p>
            <button onClick={() => setOnglet("saisie")}
              className="mx-auto px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition">
              ➕ Ajouter un rapport
            </button>
          </div>
        ) : onglet === "kpi" ? (
          <div className="flex flex-col gap-7">
            <div>
              <SectionTitle>Vue d'ensemble</SectionTitle>
              <BlocKpiGlobaux rapports={rapports} />
            </div>
            <div>
              <SectionTitle>Tendance mensuelle</SectionTitle>
              <div className="bg-white/10 rounded-2xl px-4 py-4">
                <BlocTendance rapports={rapports} />
              </div>
            </div>
            <div>
              <SectionTitle>Baptêmes par officiant</SectionTitle>
              <BlocParOfficiant rapports={rapports} />
            </div>
            <div className="flex justify-center">
              <button onClick={() => setOnglet("saisie")}
                className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition active:scale-95">
                ➕ Ajouter / modifier un rapport
              </button>
            </div>
          </div>
        ) : (
          /* Sessions */
          <div className="flex flex-col gap-3">
            <div className="flex justify-end">
              <button onClick={() => setOnglet("saisie")}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition">
                ➕ Nouveau rapport
              </button>
            </div>
            {sessions.map((r, i) => (
              <CarteSession key={`${r.date}-${r.baptise_par}-${i}`} r={r} onEdit={handleEdit} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
