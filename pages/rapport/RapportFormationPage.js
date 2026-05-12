"use client";

import { useEffect, useState, useRef } from "react";
import supabase from "../../lib/supabaseClient";
import HeaderPages from "../../components/HeaderPages";
import Footer from "../../components/Footer";
import ProtectedRoute from "../../components/ProtectedRoute";

export default function RapportFormationPage() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableFormation"]}>
      <RapportFormation />
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

// ─── UI ATOMS ──────────────────────────────────────────────────
function SectionTitle({ children }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-widest text-white/40 mb-3">
      {children}
    </p>
  );
}

function KpiCard({ label, value, sub, accent }) {
  const c = {
    green: "text-emerald-400", red: "text-red-400", amber: "text-amber-400",
    white: "text-white", blue: "text-blue-300", pink: "text-pink-300",
    purple: "text-purple-300", orange: "text-orange-300",
  };
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
    orange: "bg-orange-900/60 text-orange-300",
    gray: "bg-white/10 text-white/50",
  };
  return (
    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${m[color] || m.gray}`}>
      {children}
    </span>
  );
}

function BarreProgression({ pct, color }) {
  const col = color || (pct >= 70 ? "bg-emerald-400" : pct >= 40 ? "bg-amber-400" : "bg-red-400");
  return (
    <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all ${col}`}
        style={{ width: `${Math.min(pct, 100)}%` }}
      />
    </div>
  );
}

// ─── BLOC KPI GLOBAUX ──────────────────────────────────────────
function BlocKpiGlobaux({ rapports }) {
  const totalFormations = rapports.length;
  const totalHommes = rapports.reduce((a, r) => a + Number(r.hommes || 0), 0);
  const totalFemmes = rapports.reduce((a, r) => a + Number(r.femmes || 0), 0);
  const totalParticipants = totalHommes + totalFemmes;
  const moyParFormation = totalFormations > 0 ? Math.round(totalParticipants / totalFormations) : 0;

  // Durée moyenne
  const durees = rapports.map(r => {
    if (!r.date_debut || !r.date_fin) return 0;
    const diff = new Date(r.date_fin) - new Date(r.date_debut);
    return Math.max(0, Math.round(diff / 86400000));
  });
  const moyDuree = durees.length > 0 ? Math.round(durees.reduce((a, b) => a + b, 0) / durees.length) : 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard label="Formations" value={totalFormations} sub="sur la période" accent="white" />
        <KpiCard label="Total participants" value={totalParticipants} sub="H + F" accent="amber" />
        <KpiCard label="Moy. par formation" value={moyParFormation} sub="participants" accent="blue" />
        <KpiCard label="Durée moyenne" value={`${moyDuree}j`} sub="par formation" accent="purple" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <KpiCard label="Hommes" value={totalHommes} sub="total" accent="blue" />
        <KpiCard label="Femmes" value={totalFemmes} sub="total" accent="pink" />
      </div>
    </div>
  );
}

// ─── BLOC RÉPARTITION GENRE ────────────────────────────────────
function BlocGenre({ rapports }) {
  const totalHommes = rapports.reduce((a, r) => a + Number(r.hommes || 0), 0);
  const totalFemmes = rapports.reduce((a, r) => a + Number(r.femmes || 0), 0);
  const total = totalHommes + totalFemmes;
  const pctH = total > 0 ? Math.round((totalHommes / total) * 100) : 0;
  const pctF = total > 0 ? 100 - pctH : 0;

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-blue-900/40 rounded-xl px-3 py-3 text-center">
          <p className="text-2xl font-bold text-blue-300">{totalHommes}</p>
          <p className="text-[11px] text-blue-400/70">Hommes</p>
          <p className="text-[10px] text-blue-500/50">{pctH}%</p>
        </div>
        <div className="bg-pink-900/40 rounded-xl px-3 py-3 text-center">
          <p className="text-2xl font-bold text-pink-300">{totalFemmes}</p>
          <p className="text-[11px] text-pink-400/70">Femmes</p>
          <p className="text-[10px] text-pink-500/50">{pctF}%</p>
        </div>
      </div>
      {total > 0 && (
        <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
          <div className="bg-blue-400 rounded-l-full transition-all" style={{ width: `${pctH}%` }} />
          <div className="bg-pink-400 rounded-r-full transition-all" style={{ width: `${pctF}%` }} />
        </div>
      )}
      <p className="text-[11px] text-white/30 text-center">{total} participants au total</p>
    </div>
  );
}

// ─── BLOC TENDANCE MENSUELLE ───────────────────────────────────
function BlocTendance({ rapports }) {
  const parMois = {};
  rapports.forEach(r => {
    if (!r.date_debut) return;
    const d = new Date(r.date_debut + "T00:00:00");
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!parMois[key]) parMois[key] = { total: 0, nb: 0, label: `${getMonthNameFR(d.getMonth()).slice(0, 3)} ${d.getFullYear()}` };
    parMois[key].total += Number(r.hommes || 0) + Number(r.femmes || 0);
    parMois[key].nb++;
  });

  const mois = Object.entries(parMois)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-8)
    .map(([key, v]) => ({ key, ...v }));

  if (mois.length < 2) return (
    <p className="text-white/30 text-sm text-center py-4">Données insuffisantes (≥ 2 mois)</p>
  );

  const maxTotal = Math.max(...mois.map(m => m.total), 1);
  const dernier = mois[mois.length - 1];
  const avantDernier = mois[mois.length - 2];
  const delta = dernier.total - avantDernier.total;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="text-2xl font-bold text-white">{dernier.total}</span>
        <span className={`text-sm font-semibold ${delta >= 0 ? "text-emerald-400" : "text-red-400"}`}>
          {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)} vs mois préc.
        </span>
        <span className="text-[11px] text-white/30">{dernier.nb} formation{dernier.nb > 1 ? "s" : ""}</span>
      </div>
      <div className="flex items-end gap-1 h-16">
        {mois.map(({ key, total, label }) => (
          <div key={key} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full bg-amber-500/70 rounded-t-sm transition-all"
              style={{ height: `${Math.max(4, (total / maxTotal) * 100)}%` }}
            />
            <p className="text-[9px] text-white/30 truncate w-full text-center">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── BLOC PAR FORMATION ────────────────────────────────────────
function BlocParFormation({ rapports }) {
  const parNom = {};
  rapports.forEach(r => {
    const nom = r.nom_formation || "Sans nom";
    if (!parNom[nom]) parNom[nom] = { total: 0, hommes: 0, femmes: 0, nb: 0 };
    parNom[nom].total += Number(r.hommes || 0) + Number(r.femmes || 0);
    parNom[nom].hommes += Number(r.hommes || 0);
    parNom[nom].femmes += Number(r.femmes || 0);
    parNom[nom].nb++;
  });

  const lignes = Object.entries(parNom).sort((a, b) => b[1].total - a[1].total);
  const maxTotal = Math.max(...lignes.map(([, v]) => v.total), 1);

  if (!lignes.length) return <p className="text-white/30 text-sm text-center py-4">Aucune donnée</p>;

  return (
    <div className="flex flex-col gap-2">
      {lignes.map(([nom, { total, hommes, femmes, nb }]) => (
        <div key={nom} className="bg-white/10 rounded-xl px-4 py-3 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <p className="text-sm text-white w-36 flex-shrink-0 truncate">{nom}</p>
            <BarreProgression pct={(total / maxTotal) * 100} color="bg-amber-400" />
            <p className="text-sm font-bold text-white w-10 text-right">{total}</p>
            <p className="text-[11px] text-white/30 w-14 text-right flex-shrink-0">{nb} sess.</p>
          </div>
          <div className="flex gap-3 ml-36">
            <Badge color="blue">H: {hommes}</Badge>
            <Badge color="pink">F: {femmes}</Badge>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── CARTE RAPPORT (par session) ───────────────────────────────
function CarteRapport({ r, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const total = Number(r.hommes || 0) + Number(r.femmes || 0);
  const duree = r.date_debut && r.date_fin
    ? Math.max(0, Math.round((new Date(r.date_fin) - new Date(r.date_debut)) / 86400000))
    : null;

  return (
    <div className="bg-white/10 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-4 hover:bg-white/5 transition text-left gap-3"
      >
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="font-semibold text-white text-sm truncate">{r.nom_formation || "Formation"}</span>
          <span className="text-[11px] text-white/40">
            {formatDateFr(r.date_debut)}
            {r.date_fin && r.date_fin !== r.date_debut ? ` → ${formatDateFr(r.date_fin)}` : ""}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge color="blue">H {r.hommes || 0}</Badge>
          <Badge color="pink">F {r.femmes || 0}</Badge>
          <Badge color="amber">Total {total}</Badge>
          <span className="text-white/30 text-xs">{open ? "▲" : "▼"}</span>
        </div>
      </button>

      {open && (
        <div className="border-t border-white/10 px-4 pb-4 pt-3 flex flex-col gap-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: "Hommes", value: r.hommes || 0, color: "text-blue-300" },
              { label: "Femmes", value: r.femmes || 0, color: "text-pink-300" },
              { label: "Total", value: total, color: "text-amber-300 font-bold" },
              { label: "Durée", value: duree !== null ? `${duree}j` : "—", color: "text-purple-300" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-white/5 rounded-xl px-3 py-2 flex flex-col">
                <p className="text-[10px] text-white/40">{label}</p>
                <p className={`text-lg font-bold ${color}`}>{value}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => onEdit(r)}
              className="flex-1 py-2 rounded-xl bg-blue-600/40 hover:bg-blue-600/60 text-blue-300 text-sm font-semibold transition"
            >
              ✏️ Modifier
            </button>
            <button
              onClick={() => onDelete(r.id)}
              className="flex-1 py-2 rounded-xl bg-red-900/40 hover:bg-red-900/60 text-red-300 text-sm font-semibold transition"
            >
              🗑️ Supprimer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── FORMULAIRE ────────────────────────────────────────────────
function FormulaireFormation({ egliseId, onSaved, editData, onCancelEdit }) {
  const [formData, setFormData] = useState({
    date_debut: "", date_fin: "", nom_formation: "", hommes: 0, femmes: 0,
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (editData) {
      setFormData({
        date_debut: editData.date_debut || "",
        date_fin: editData.date_fin || "",
        nom_formation: editData.nom_formation || "",
        hommes: editData.hommes || 0,
        femmes: editData.femmes || 0,
      });
    }
  }, [editData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const numericFields = ["hommes", "femmes"];
    setFormData(prev => ({
      ...prev,
      [name]: numericFields.includes(name) ? Number(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.date_debut || !formData.nom_formation.trim()) {
      setMessage("❌ Date de début et nom de formation requis.");
      return;
    }
    setMessage("⏳ Enregistrement...");

    const payload = {
      date_debut: formData.date_debut,
      date_fin: formData.date_fin || formData.date_debut,
      nom_formation: formData.nom_formation.trim(),
      hommes: Number(formData.hommes) || 0,
      femmes: Number(formData.femmes) || 0,
      eglise_id: egliseId,
    };

    try {
      if (editData) {
        const { error } = await supabase.from("formations").update(payload).eq("id", editData.id);
        if (error) throw error;
        setMessage("✅ Formation mise à jour !");
      } else {
        const { error } = await supabase.from("formations").insert([payload]);
        if (error) throw error;
        setMessage("✅ Formation ajoutée !");
      }
      setFormData({ date_debut: "", date_fin: "", nom_formation: "", hommes: 0, femmes: 0 });
      setTimeout(() => setMessage(""), 3000);
      onSaved();
    } catch (err) {
      setMessage("❌ " + err.message);
    }
  };

  return (
    <div className="bg-white/10 rounded-2xl p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-white font-semibold">
          {editData ? "✏️ Modifier la formation" : "➕ Nouvelle formation"}
        </p>
        {editData && (
          <button
            onClick={onCancelEdit}
            className="text-xs text-white/40 hover:text-white/70 transition"
          >
            Annuler
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-white/50">Date de début</label>
            <input
              type="date" name="date_debut" value={formData.date_debut}
              onChange={handleChange} required
              className="bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-white/40"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-white/50">Date de fin</label>
            <input
              type="date" name="date_fin" value={formData.date_fin}
              onChange={handleChange}
              className="bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-white/40"
            />
          </div>
        </div>

        {/* Nom */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-white/50">Nom de la formation</label>
          <input
            type="text" name="nom_formation" value={formData.nom_formation}
            onChange={handleChange} required placeholder="Ex: Formation des leaders"
            className="bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-white/40 placeholder:text-white/20"
          />
        </div>

        {/* Participants */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-blue-300">Hommes</label>
            <input
              type="number" name="hommes" value={formData.hommes}
              onChange={handleChange} min={0}
              className="bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-white/40 text-center"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-pink-300">Femmes</label>
            <input
              type="number" name="femmes" value={formData.femmes}
              onChange={handleChange} min={0}
              className="bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-white/40 text-center"
            />
          </div>
        </div>

        {/* Résumé total en temps réel */}
        {(Number(formData.hommes) + Number(formData.femmes)) > 0 && (
          <div className="bg-white/5 rounded-xl px-4 py-2 flex items-center justify-center gap-3">
            <span className="text-[11px] text-white/40">Total participants :</span>
            <span className="text-lg font-bold text-amber-300">
              {Number(formData.hommes) + Number(formData.femmes)}
            </span>
          </div>
        )}

        <button
          type="submit"
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-sm hover:from-amber-600 hover:to-orange-600 transition-all active:scale-95"
        >
          {editData ? "Mettre à jour" : "Ajouter la formation"}
        </button>

        {message && (
          <p className="text-center text-sm font-medium text-white/80">{message}</p>
        )}
      </form>
    </div>
  );
}

// ─── PAGE PRINCIPALE ───────────────────────────────────────────
function RapportFormation() {
  const [rapports, setRapports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [egliseId, setEgliseId] = useState(null);
  const [filtrePeriode, setFiltrePeriode] = useState("90");
  const [modePerso, setModePerso] = useState(false);
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [onglet, setOnglet] = useState("kpi");
  const [editData, setEditData] = useState(null);
  const formRef = useRef(null);

  // Chargement de l'utilisateur
  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("eglise_id").eq("id", user.id).single();
      if (data) setEgliseId(data.eglise_id);
    };
    loadUser();
  }, []);

  // Fetch des rapports
  const fetchRapports = async (overrideModePerso = null) => {
    if (!egliseId) return;
    setLoading(true);
    const isPerso = overrideModePerso !== null ? overrideModePerso : modePerso;

    let query = supabase
      .from("formations")
      .select("*")
      .eq("eglise_id", egliseId)
      .order("date_debut", { ascending: false });

    if (isPerso) {
      if (dateDebut) query = query.gte("date_debut", dateDebut);
      if (dateFin) query = query.lte("date_debut", dateFin);
    } else {
      const depuis = new Date();
      depuis.setDate(depuis.getDate() - Number(filtrePeriode));
      query = query.gte("date_debut", depuis.toISOString().split("T")[0]);
    }

    const { data } = await query;
    setRapports(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (!modePerso) fetchRapports(false);
  }, [egliseId, filtrePeriode, modePerso]);

  const handleDelete = async (id) => {
    if (!confirm("Supprimer cette formation ?")) return;
    await supabase.from("formations").delete().eq("id", id);
    fetchRapports();
  };

  const handleEdit = (r) => {
    setEditData(r);
    setOnglet("saisie");
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  };

  const onglets = [
    { key: "kpi", label: "Vue d'ensemble" },
    { key: "sessions", label: "Par formation" },
    { key: "saisie", label: "Saisie" },
  ];

  return (
    <div
      className="min-h-screen flex flex-col items-center p-4 sm:p-6"
      style={{ background: "#333699" }}
    >
      <HeaderPages />

      {/* ─── EN-TÊTE ─── */}
      <div className="w-full max-w-3xl flex flex-col gap-6">
        <div className="text-center mt-4">
          <h1 className="text-2xl font-bold mb-3 text-white">
            Rapport de{" "}
            <span className="text-emerald-300">Formations</span>
          </h1>
          <p className="italic text-base text-white/90 max-w-2xl mx-auto">
            <span className="text-blue-300 font-semibold">Créez et pilotez</span> les rapports de
            formation. <span className="text-blue-300 font-semibold">Centralisez</span> les données,
            suivez la participation hommes / femmes et analysez l'impact des formations pour
            accompagner la{" "}
            <span className="text-blue-300 font-semibold">
              croissance spirituelle et le développement des membres
            </span>.
          </p>
        </div>

        {/* ─── FILTRES ─── */}
        <div className="bg-white/10 rounded-2xl p-4 flex flex-col gap-3">
          {/* Toggle mode */}
          <div className="flex gap-1 bg-white/10 rounded-xl p-1 w-fit">
            <button
              onClick={() => setModePerso(false)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                !modePerso ? "bg-white text-[#333699]" : "text-white/50 hover:text-white/80"
              }`}
            >
              Période rapide
            </button>
            <button
              onClick={() => setModePerso(true)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                modePerso ? "bg-white text-[#333699]" : "text-white/50 hover:text-white/80"
              }`}
            >
              Tranche de dates
            </button>
          </div>

          {/* Période rapide */}
          {!modePerso && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-white/50 flex-shrink-0">Période :</span>
              {[
                { label: "7 j", val: "7" }, { label: "30 j", val: "30" },
                { label: "90 j", val: "90" }, { label: "6 mois", val: "180" },
                { label: "1 an", val: "365" },
              ].map(p => (
                <button
                  key={p.val} onClick={() => setFiltrePeriode(p.val)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                    filtrePeriode === p.val
                      ? "bg-white text-[#333699]"
                      : "bg-white/15 text-white/70 hover:bg-white/20"
                  }`}
                >
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
                  <input
                    type="date" value={dateDebut}
                    onChange={e => setDateDebut(e.target.value)}
                    className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-white/50">Date de fin</label>
                  <input
                    type="date" value={dateFin}
                    onChange={e => setDateFin(e.target.value)}
                    className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40"
                  />
                </div>
              </div>
              <button
                onClick={() => fetchRapports(true)}
                className="w-full py-2 rounded-xl bg-amber-500/80 hover:bg-amber-500 text-white text-sm font-semibold transition active:scale-95"
              >
                Générer le rapport
              </button>
            </div>
          )}
        </div>

        {/* ─── ONGLETS ─── */}
        <div className="flex gap-1 bg-white/10 rounded-xl p-1">
          {onglets.map(o => (
            <button
              key={o.key} onClick={() => setOnglet(o.key)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition whitespace-nowrap ${
                onglet === o.key ? "bg-white text-[#333699]" : "text-white/50 hover:text-white/80"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>

        {/* ─── CONTENU ─── */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        ) : onglet === "saisie" ? (
          <div ref={formRef}>
            <FormulaireFormation
              egliseId={egliseId}
              onSaved={() => { fetchRapports(); setEditData(null); }}
              editData={editData}
              onCancelEdit={() => setEditData(null)}
            />
          </div>
        ) : rapports.length === 0 ? (
          <div className="bg-white/10 rounded-2xl p-8 text-center flex flex-col gap-3">
            <p className="text-white/40 text-sm">Aucune formation sur cette période</p>
            <button
              onClick={() => setOnglet("saisie")}
              className="mx-auto px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition"
            >
              ➕ Ajouter une formation
            </button>
          </div>
        ) : onglet === "kpi" ? (
          /* ─── VUE D'ENSEMBLE ─── */
          <div className="flex flex-col gap-7">
            <div>
              <SectionTitle>Vue d'ensemble</SectionTitle>
              <BlocKpiGlobaux rapports={rapports} />
            </div>

            <div>
              <SectionTitle>Répartition H / F</SectionTitle>
              <div className="bg-white/10 rounded-2xl px-4 py-4">
                <BlocGenre rapports={rapports} />
              </div>
            </div>

            <div>
              <SectionTitle>Tendance mensuelle (participants)</SectionTitle>
              <div className="bg-white/10 rounded-2xl px-4 py-4">
                <BlocTendance rapports={rapports} />
              </div>
            </div>

            <div>
              <SectionTitle>Participation par formation</SectionTitle>
              <BlocParFormation rapports={rapports} />
            </div>

            <div className="flex justify-center">
              <button
                onClick={() => setOnglet("saisie")}
                className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition active:scale-95"
              >
                ➕ Ajouter / modifier une formation
              </button>
            </div>
          </div>
        ) : (
          /* ─── PAR FORMATION ─── */
          <div className="flex flex-col gap-3">
            <div className="flex justify-end">
              <button
                onClick={() => setOnglet("saisie")}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition"
              >
                ➕ Nouvelle formation
              </button>
            </div>
            {rapports.map(r => (
              <CarteRapport
                key={r.id} r={r}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
