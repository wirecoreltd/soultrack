"use client";

import { useState, useEffect, useRef } from "react";
import supabase from "../../lib/supabaseClient";
import HeaderPages from "../../components/HeaderPages";
import Footer from "../../components/Footer";
import ProtectedRoute from "../../components/ProtectedRoute";

export default function AttendancePage() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableIntegration"]}>
      <Attendance />
    </ProtectedRoute>
  );
}

// ─── HELPERS ──────────────────────────────────────────────────
function formatDateFr(dateStr) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("fr-FR", {
    day: "2-digit", month: "short", year: "numeric",
  });
}
function formatDateCourt(dateStr) {
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
  const c = { green: "text-emerald-400", red: "text-red-400", amber: "text-amber-400", white: "text-white", blue: "text-blue-300", pink: "text-pink-300" };
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

// ─── BLOC KPI GLOBAUX ──────────────────────────────────────────
function BlocKpiGlobaux({ reports }) {
  const totalSessions = reports.length;
  const totalHommes = reports.reduce((a, r) => a + Number(r.hommes || 0), 0);
  const totalFemmes = reports.reduce((a, r) => a + Number(r.femmes || 0), 0);
  const totalJeunes = reports.reduce((a, r) => a + Number(r.jeunes || 0), 0);
  const totalEnfants = reports.reduce((a, r) => a + Number(r.enfants || 0), 0);
  const totalConnectes = reports.reduce((a, r) => a + Number(r.connectes || 0), 0);
  const totalNV = reports.reduce((a, r) => a + Number(r.nouveauxVenus || 0), 0);
  const totalNC = reports.reduce((a, r) => a + Number(r.nouveauxConvertis || 0), 0);
  const totalPresents = totalHommes + totalFemmes + totalJeunes;
  const totalGlobal = totalPresents + totalEnfants + totalConnectes;
  const moyenneParSession = totalSessions > 0 ? Math.round(totalPresents / totalSessions) : 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard label="Sessions" value={totalSessions} sub="sur la période" accent="white" />
        <KpiCard label="Moy. présents" value={moyenneParSession} sub="par session (H+F+J)" accent="amber" />
        <KpiCard label="Nouveaux venus" value={totalNV} sub="sur la période" accent="blue" />
        <KpiCard label="Convertis" value={totalNC} sub="sur la période" accent="green" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard label="Hommes" value={totalHommes} sub="total" accent="blue" />
        <KpiCard label="Femmes" value={totalFemmes} sub="total" accent="pink" />
        <KpiCard label="Jeunes" value={totalJeunes} sub="total" accent="amber" />
        <KpiCard label="Enfants" value={totalEnfants} sub="total" accent="white" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <KpiCard label="Connectés (en ligne)" value={totalConnectes} sub="total" accent="white" />
        <KpiCard label="Total global" value={totalGlobal} sub="H+F+J+Enfants+Connectés" accent="white" />
      </div>
    </div>
  );
}

// ─── BLOC RÉPARTITION GENRE ────────────────────────────────────
function BlocGenre({ reports }) {
  const totalHommes = reports.reduce((a, r) => a + Number(r.hommes || 0), 0);
  const totalFemmes = reports.reduce((a, r) => a + Number(r.femmes || 0), 0);
  const totalJeunes = reports.reduce((a, r) => a + Number(r.jeunes || 0), 0);
  const total = totalHommes + totalFemmes + totalJeunes;
  const pctH = total > 0 ? Math.round((totalHommes / total) * 100) : 0;
  const pctF = total > 0 ? Math.round((totalFemmes / total) * 100) : 0;
  const pctJ = total > 0 ? Math.round((totalJeunes / total) * 100) : 100 - pctH - pctF;

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-blue-900/40 rounded-xl px-3 py-3 text-center">
          <p className="text-xl font-bold text-blue-300">{totalHommes}</p>
          <p className="text-[11px] text-blue-400/70">Hommes</p>
          <p className="text-[10px] text-blue-500/50">{pctH}%</p>
        </div>
        <div className="bg-pink-900/40 rounded-xl px-3 py-3 text-center">
          <p className="text-xl font-bold text-pink-300">{totalFemmes}</p>
          <p className="text-[11px] text-pink-400/70">Femmes</p>
          <p className="text-[10px] text-pink-500/50">{pctF}%</p>
        </div>
        <div className="bg-amber-900/40 rounded-xl px-3 py-3 text-center">
          <p className="text-xl font-bold text-amber-300">{totalJeunes}</p>
          <p className="text-[11px] text-amber-400/70">Jeunes</p>
          <p className="text-[10px] text-amber-500/50">{pctJ}%</p>
        </div>
      </div>
      {total > 0 && (
        <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
          <div className="bg-blue-400 rounded-l-full transition-all" style={{ width: `${pctH}%` }} />
          <div className="bg-pink-400 transition-all" style={{ width: `${pctF}%` }} />
          <div className="bg-amber-400 rounded-r-full transition-all" style={{ width: `${pctJ}%` }} />
        </div>
      )}
    </div>
  );
}

// ─── BLOC TENDANCE ─────────────────────────────────────────────
function BlocTendance({ reports }) {
  const parSemaine = {};
  reports.forEach(r => {
    const d = new Date(r.date + "T00:00:00");
    const jan = new Date(d.getFullYear(), 0, 1);
    const sem = `${d.getFullYear()}-S${String(Math.ceil(((d - jan) / 86400000 + jan.getDay() + 1) / 7)).padStart(2, "0")}`;
    if (!parSemaine[sem]) parSemaine[sem] = { total: 0, nv: 0, nc: 0, dates: [] };
    parSemaine[sem].total += Number(r.hommes || 0) + Number(r.femmes || 0) + Number(r.jeunes || 0);
    parSemaine[sem].nv += Number(r.nouveauxVenus || 0);
    parSemaine[sem].nc += Number(r.nouveauxConvertis || 0);
    parSemaine[sem].dates.push(r.date);
  });
  const semaines = Object.entries(parSemaine)
    .sort(([a], [b]) => a.localeCompare(b)).slice(-8)
    .map(([sem, v]) => ({
      sem, ...v,
      label: v.dates.length > 0 ? formatDateCourt(v.dates[0]) : sem,
    }));
  if (semaines.length < 2) return <p className="text-white/30 text-sm text-center py-4">Données insuffisantes (≥ 2 semaines)</p>;
  const maxTotal = Math.max(...semaines.map(s => s.total), 1);
  const derniere = semaines[semaines.length - 1];
  const avantDerniere = semaines[semaines.length - 2];
  const delta = derniere.total - avantDerniere.total;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="text-2xl font-bold text-white">{derniere.total}</span>
        <span className={`text-sm font-semibold ${delta >= 0 ? "text-emerald-400" : "text-red-400"}`}>
          {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)} vs sem. préc.
        </span>
      </div>
      <div className="flex items-end gap-1 h-16">
        {semaines.map(({ sem, total, label }) => (
          <div key={sem} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full bg-blue-500/70 rounded-t-sm transition-all"
              style={{ height: `${Math.max(4, (total / maxTotal) * 100)}%` }} />
            <p className="text-[9px] text-white/30 truncate w-full text-center">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── BLOC TAUX PAR TYPE ────────────────────────────────────────
function BlocParType({ reports }) {
  const parType = {};
  reports.forEach(r => {
    const type = r.typeTemps || "Autre";
    if (!parType[type]) parType[type] = { total: 0, nv: 0, nc: 0, nb: 0 };
    parType[type].total += Number(r.hommes || 0) + Number(r.femmes || 0) + Number(r.jeunes || 0);
    parType[type].nv += Number(r.nouveauxVenus || 0);
    parType[type].nc += Number(r.nouveauxConvertis || 0);
    parType[type].nb++;
  });
  const maxTotal = Math.max(...Object.values(parType).map(v => v.total), 1);
  const lignes = Object.entries(parType).sort((a, b) => b[1].total - a[1].total);
  if (!lignes.length) return <p className="text-white/30 text-sm text-center py-4">Aucune donnée</p>;
  return (
    <div className="flex flex-col gap-2">
      {lignes.map(([type, { total, nv, nc, nb }]) => (
        <div key={type} className="bg-white/10 rounded-xl px-4 py-3 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <p className="text-sm text-white w-32 flex-shrink-0 truncate">{type}</p>
            <BarreProgression pct={(total / maxTotal) * 100} color="bg-blue-400" />
            <p className="text-sm font-bold text-white w-12 text-right">{total}</p>
            <p className="text-[11px] text-white/30 w-14 text-right flex-shrink-0">{nb} sess.</p>
          </div>
          <div className="flex gap-3 ml-32">
            <Badge color="blue">NV: {nv}</Badge>
            <Badge color="green">Conv: {nc}</Badge>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── BLOC NOUVEAUX VENUS & CONVERTIS ──────────────────────────
function BlocEvangelisation({ reports }) {
  const totalNV = reports.reduce((a, r) => a + Number(r.nouveauxVenus || 0), 0);
  const totalNC = reports.reduce((a, r) => a + Number(r.nouveauxConvertis || 0), 0);
  const totalSess = reports.length;
  const moyNV = totalSess > 0 ? (totalNV / totalSess).toFixed(1) : 0;
  const moyNC = totalSess > 0 ? (totalNC / totalSess).toFixed(1) : 0;
  const tauxConversion = totalNV > 0 ? Math.round((totalNC / totalNV) * 100) : 0;

  const parMois = {};
  reports.forEach(r => {
    const d = new Date(r.date + "T00:00:00");
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!parMois[key]) parMois[key] = { nv: 0, nc: 0, label: `${getMonthNameFR(d.getMonth()).slice(0,3)} ${d.getFullYear()}` };
    parMois[key].nv += Number(r.nouveauxVenus || 0);
    parMois[key].nc += Number(r.nouveauxConvertis || 0);
  });
  const mois = Object.entries(parMois).sort(([a], [b]) => a.localeCompare(b)).slice(-6);
  const maxNV = Math.max(...mois.map(([, v]) => v.nv), 1);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-blue-900/40 rounded-2xl px-4 py-4 text-center">
          <p className="text-2xl font-bold text-blue-300">{totalNV}</p>
          <p className="text-[11px] text-blue-400/70">Nouveaux venus</p>
          <p className="text-[10px] text-blue-500/50">Moy: {moyNV}/sess.</p>
        </div>
        <div className="bg-emerald-900/40 rounded-2xl px-4 py-4 text-center">
          <p className="text-2xl font-bold text-emerald-300">{totalNC}</p>
          <p className="text-[11px] text-emerald-400/70">Convertis</p>
          <p className="text-[10px] text-emerald-500/50">Moy: {moyNC}/sess.</p>
        </div>
        <div className="bg-purple-900/40 rounded-2xl px-4 py-4 text-center">
          <p className="text-2xl font-bold text-purple-300">{tauxConversion}%</p>
          <p className="text-[11px] text-purple-400/70">Taux conv.</p>
          <p className="text-[10px] text-purple-500/50">NV → Conv.</p>
        </div>
      </div>
      {mois.length >= 2 && (
        <div className="flex items-end gap-2 h-20">
          {mois.map(([key, { nv, nc, label }]) => (
            <div key={key} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex gap-0.5 items-end" style={{ height: "60px" }}>
                <div className="flex-1 bg-blue-500/70 rounded-t-sm" style={{ height: `${Math.max(3, (nv / maxNV) * 60)}px` }} />
                <div className="flex-1 bg-emerald-500/70 rounded-t-sm" style={{ height: `${Math.max(3, (nc / maxNV) * 60)}px` }} />
              </div>
              <p className="text-[9px] text-white/30 truncate w-full text-center">{label}</p>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-3 text-[11px] text-white/40">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-blue-500/70 inline-block" /> Nouveaux venus</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-emerald-500/70 inline-block" /> Convertis</span>
      </div>
    </div>
  );
}

// ─── CARTE SESSION ─────────────────────────────────────────────
function CarteSession({ r, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const total = Number(r.hommes || 0) + Number(r.femmes || 0) + Number(r.jeunes || 0);
  const totalGlobal = total + Number(r.enfants || 0) + Number(r.connectes || 0);
  const label = r.typeTemps + (r.numero_culte ? ` — ${r.numero_culte}${r.numero_culte === 1 ? "er" : "ème"} culte` : "");

  return (
    <div className="bg-white/10 rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-4 hover:bg-white/5 transition text-left gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold text-white text-sm">{label}</span>
          <span className="text-[11px] text-white/40">{formatDateFr(r.date)}</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge color="blue">H {r.hommes}</Badge>
          <Badge color="pink">F {r.femmes}</Badge>
          <Badge color="amber">J {r.jeunes}</Badge>
          <Badge color="gray">Total {total}</Badge>
          <span className="text-white/30 text-xs">{open ? "▲" : "▼"}</span>
        </div>
      </button>
      {open && (
        <div className="border-t border-white/10 px-4 pb-4 pt-3 flex flex-col gap-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: "Hommes", value: r.hommes, color: "text-blue-300" },
              { label: "Femmes", value: r.femmes, color: "text-pink-300" },
              { label: "Jeunes", value: r.jeunes, color: "text-amber-300" },
              { label: "Enfants", value: r.enfants, color: "text-white" },
              { label: "Connectés", value: r.connectes, color: "text-white" },
              { label: "Nv. venus", value: r.nouveauxVenus, color: "text-blue-300" },
              { label: "Convertis", value: r.nouveauxConvertis, color: "text-emerald-300" },
              { label: "Total global", value: totalGlobal, color: "text-white font-bold" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-white/5 rounded-xl px-3 py-2 flex flex-col">
                <p className="text-[10px] text-white/40">{label}</p>
                <p className={`text-lg font-bold ${color}`}>{value || 0}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-2 pt-1">
            {/* FIX #6 : onEdit appelé directement, sans wrapper inutile */}
            <button onClick={() => onEdit(r)}
              className="flex-1 py-2 rounded-xl bg-blue-600/40 hover:bg-blue-600/60 text-blue-300 text-sm font-semibold transition">
              ✏️ Modifier
            </button>
            <button onClick={() => onDelete(r.id)}
              className="flex-1 py-2 rounded-xl bg-red-900/40 hover:bg-red-900/60 text-red-300 text-sm font-semibold transition">
              🗑️ Supprimer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── FORMULAIRE ────────────────────────────────────────────────
function FormulaireSaisie({ egliseId, tempsOptions, setTempsOptions, onSaved, editData, onCancelEdit }) {
  const [formData, setFormData] = useState({
    date: "", typeTemps: "", nouveauTemps: "", enregistrerTemps: false,
    numero_culte: "", hommes: 0, femmes: 0, jeunes: 0, enfants: 0,
    connectes: 0, nouveauxVenus: 0, nouveauxConvertis: 0,
  });
  const [message, setMessage] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    if (editData) {
      setFormData({
        date: editData.date,
        typeTemps: tempsOptions.includes(editData.typeTemps) ? editData.typeTemps : "AUTRE",
        nouveauTemps: !tempsOptions.includes(editData.typeTemps) ? editData.typeTemps : "",
        numero_culte: editData.numero_culte || "",
        hommes: editData.hommes || 0, femmes: editData.femmes || 0,
        jeunes: editData.jeunes || 0, enfants: editData.enfants || 0,
        connectes: editData.connectes || 0, nouveauxVenus: editData.nouveauxVenus || 0,
        nouveauxConvertis: editData.nouveauxConvertis || 0, enregistrerTemps: false,
      });
    } else {
      // Reset form when switching to "add" mode
      setFormData({
        date: "", typeTemps: "", nouveauTemps: "", enregistrerTemps: false,
        numero_culte: "", hommes: 0, femmes: 0, jeunes: 0, enfants: 0,
        connectes: 0, nouveauxVenus: 0, nouveauxConvertis: 0,
      });
    }
  }, [editData]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (selectRef.current && !selectRef.current.contains(e.target)) setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const numericFields = ["hommes","femmes","jeunes","enfants","connectes","nouveauxVenus","nouveauxConvertis"];
    setFormData(prev => ({ ...prev, [name]: numericFields.includes(name) ? Number(value) || 0 : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("⏳ Enregistrement...");
    let typeTempsFinal = formData.typeTemps === "AUTRE" ? formData.nouveauTemps.trim() : formData.typeTemps;
    if (!typeTempsFinal) { setMessage("❌ Nom du temps requis."); return; }

    const payload = {
      date: formData.date, typeTemps: typeTempsFinal, eglise_id: egliseId,
      hommes: Number(formData.hommes) || 0, femmes: Number(formData.femmes) || 0,
      jeunes: Number(formData.jeunes) || 0, enfants: Number(formData.enfants) || 0,
      connectes: Number(formData.connectes) || 0, nouveauxVenus: Number(formData.nouveauxVenus) || 0,
      nouveauxConvertis: Number(formData.nouveauxConvertis) || 0,
      ...(formData.numero_culte ? { numero_culte: Number(formData.numero_culte) } : {}),
    };

    try {
      if (editData) {
        const { error } = await supabase.from("attendance").update(payload).eq("id", editData.id);
        if (error) throw error;
        setMessage("✅ Rapport mis à jour !");
      } else {
        const { error } = await supabase.from("attendance").insert([payload]);
        if (error) throw error;
        if (formData.enregistrerTemps && formData.typeTemps === "AUTRE" && !tempsOptions.includes(typeTempsFinal)) {
          setTempsOptions(prev => [...prev, typeTempsFinal]);
        }
        setMessage("✅ Rapport ajouté !");
      }
      setFormData({ date:"", typeTemps:"", nouveauTemps:"", enregistrerTemps:false, numero_culte:"", hommes:0, femmes:0, jeunes:0, enfants:0, connectes:0, nouveauxVenus:0, nouveauxConvertis:0 });
      setTimeout(() => setMessage(""), 3000);
      onSaved();
    } catch (err) {
      setMessage("❌ " + err.message);
    }
  };

  const fields = [
    { name: "hommes", label: "Hommes", color: "text-blue-300" },
    { name: "femmes", label: "Femmes", color: "text-pink-300" },
    { name: "jeunes", label: "Jeunes", color: "text-amber-300" },
    { name: "enfants", label: "Enfants", color: "text-white/70" },
    { name: "connectes", label: "Connectés", color: "text-white/70" },
    { name: "nouveauxVenus", label: "Nouveaux venus", color: "text-blue-300" },
    { name: "nouveauxConvertis", label: "Nouveaux convertis", color: "text-emerald-300" },
  ];

  return (
    // FIX #7 : mt-6 pour espacer du bloc onglets
    <div className="bg-white/10 rounded-2xl p-5 flex flex-col gap-4 mt-6">
      <div className="flex items-center justify-between">
        {/* FIX #4 : supprimé "➕ Nouveau rapport" — titre contextuel seulement */}
        <p className="text-white font-semibold">{editData ? "✏️ Modifier le rapport" : "Saisie du rapport"}</p>
        {editData && (
          <button onClick={onCancelEdit} className="text-xs text-white/40 hover:text-white/70 transition">Annuler</button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Date */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-white/50">Date du culte</label>
          <input type="date" name="date" value={formData.date} onChange={handleChange} required
            className="bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-white/40" />
        </div>

        {/* Type de temps */}
        <div className="flex flex-col gap-1" ref={selectRef}>
          <label className="text-xs text-white/50">Type de temps</label>
          <div onClick={() => setDropdownOpen(v => !v)}
            className="bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white text-sm flex justify-between items-center cursor-pointer hover:bg-white/15 transition">
            <span className={formData.typeTemps ? "text-white" : "text-white/30"}>
              {formData.typeTemps || "Sélectionner un temps"}
            </span>
            <span className="text-white/30">{dropdownOpen ? "▲" : "▼"}</span>
          </div>
          {dropdownOpen && (
            <div className="relative z-10">
              <div className="absolute top-1 left-0 w-full bg-[#2a2d80] border border-white/20 rounded-xl shadow-2xl overflow-hidden">
                {tempsOptions.map(t => (
                  <div key={t} onClick={() => { setFormData(p => ({ ...p, typeTemps: t })); setDropdownOpen(false); }}
                    className="px-4 py-2.5 text-sm text-white hover:bg-white/10 cursor-pointer transition flex justify-between items-center">
                    <span>{t}</span>
                  </div>
                ))}
                <div onClick={() => { setFormData(p => ({ ...p, typeTemps: "AUTRE", nouveauTemps: "" })); setDropdownOpen(false); }}
                  className="px-4 py-2.5 text-sm text-blue-300 hover:bg-white/10 cursor-pointer transition border-t border-white/10">
                  + Ajouter un temps
                </div>
              </div>
            </div>
          )}
        </div>

        {formData.typeTemps === "AUTRE" && (
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-white/50">Nom du temps</label>
              <input type="text" name="nouveauTemps" value={formData.nouveauTemps}
                onChange={e => setFormData(p => ({ ...p, nouveauTemps: e.target.value.slice(0, 30) }))}
                placeholder="Ex: ADP" maxLength={30}
                className="bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-white/40 placeholder:text-white/20" />
            </div>
            <label className="flex items-center gap-2 text-xs text-amber-300 cursor-pointer">
              <input type="checkbox" checked={formData.enregistrerTemps}
                onChange={e => setFormData(p => ({ ...p, enregistrerTemps: e.target.checked }))} />
              Enregistrer ce temps pour le futur
            </label>
          </div>
        )}

        {formData.typeTemps === "Culte" && (
          <div className="flex flex-col gap-1">
            <label className="text-xs text-white/50">Numéro de culte</label>
            <select name="numero_culte" value={formData.numero_culte} onChange={handleChange}
              className="bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-white/40 appearance-none cursor-pointer">
              <option value="" className="bg-[#2a2d80]">--- Sélectionner ---</option>
              {[1,2,3,4,5,6,7].map(n => <option key={n} value={n} className="bg-[#2a2d80]">{n}{n===1?"er":"ème"} Culte</option>)}
            </select>
          </div>
        )}

        {/* Champs numériques */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {fields.map(({ name, label, color }) => (
            <div key={name} className="flex flex-col gap-1">
              <label className={`text-xs ${color}`}>{label}</label>
              <input type="number" name={name} value={formData[name]} onChange={handleChange} min={0}
                className="bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-white/40 text-center" />
            </div>
          ))}
        </div>

        <button type="submit"
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-sm hover:from-blue-600 hover:to-indigo-700 transition-all active:scale-95">
          {editData ? "Mettre à jour" : "Ajouter le rapport"}
        </button>

        {message && <p className="text-center text-sm font-medium text-white/80">{message}</p>}
      </form>
    </div>
  );
}

// ─── PAGE PRINCIPALE ───────────────────────────────────────────
function Attendance() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [egliseId, setEgliseId] = useState(null);
  const [tempsOptions, setTempsOptions] = useState(["Culte"]);
  const [filtrePeriode, setFiltrePeriode] = useState("30");
  const [filtreType, setFiltreType] = useState("");
  const [modePerso, setModePerso] = useState(false);
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [onglet, setOnglet] = useState("kpi");
  const [editData, setEditData] = useState(null);
  const formRef = useRef(null);

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("eglise_id").eq("id", user.id).single();
      if (data) setEgliseId(data.eglise_id);
    };
    loadUser();
  }, []);

  useEffect(() => {
    if (!egliseId) return;
    const loadTemps = async () => {
      const { data } = await supabase.from("attendance").select("typeTemps").eq("eglise_id", egliseId).not("typeTemps", "is", null);
      if (data) {
        const unique = ["Culte", ...new Set(data.map(t => t.typeTemps?.trim()).filter(t => t && t !== "Culte"))];
        setTempsOptions(unique);
      }
    };
    loadTemps();
  }, [egliseId]);

  const fetchReports = async (overrideModePerso = null) => {
    if (!egliseId) return;
    setLoading(true);
    const isPerso = overrideModePerso !== null ? overrideModePerso : modePerso;
    let query = supabase.from("attendance").select("*").eq("eglise_id", egliseId)
      .order("date", { ascending: false });
    if (isPerso) {
      if (dateDebut) query = query.gte("date", dateDebut);
      if (dateFin)   query = query.lte("date", dateFin);
    } else {
      const depuis = new Date();
      depuis.setDate(depuis.getDate() - Number(filtrePeriode));
      query = query.gte("date", depuis.toISOString().split("T")[0]);
    }
    if (filtreType) query = query.eq("typeTemps", filtreType);
    const { data } = await query;
    setReports(data || []);
    setLoading(false);
  };

  useEffect(() => { if (!modePerso) fetchReports(false); }, [egliseId, filtrePeriode, filtreType, modePerso]);

  const handleDelete = async (id) => {
    if (!confirm("Supprimer ce rapport ?")) return;
    await supabase.from("attendance").delete().eq("id", id);
    fetchReports();
  };

  // FIX #6 : handleEdit redirige vers l'onglet "saisie" et charge les données
  const handleEdit = (r) => {
    setEditData(r);
    setOnglet("saisie");
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  };

  // FIX #3 : handleAjouter redirige vers saisie sans editData
  const handleAjouter = () => {
    setEditData(null);
    setOnglet("saisie");
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  };

  // FIX #5 : handleModifier redirige vers sessions
  const handleModifier = () => {
    setEditData(null);
    setOnglet("sessions");
  };

  const typesDistincts = [...new Set(reports.map(s => s.typeTemps).filter(Boolean))];

  const onglets = [
    { key: "kpi", label: "Vue d'ensemble" },
    { key: "sessions", label: "Par session" },
    { key: "saisie", label: "Saisie" },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6" style={{ background: "#333699" }}>
      <HeaderPages />

      <div>
        {/* En-tête */}
        <h1 className="text-2xl font-bold mt-4 mb-6 text-blue-300 text-center text-white">
          Rapport de <span className="text-emerald-300">Présences & Statistiques</span>
        </h1>
        <div className="max-w-3xl w-full mb-6 text-center">
          <p className="italic text-base text-white/90">
            Suivez et gérez facilement les <span className="text-blue-300 font-semibold">présences </span>
            de tous les rassemblements spirituels.
            Enregistrez l'ensemble des <span className="text-blue-300 font-semibold">participants</span>, y compris les
            <span className="text-blue-300 font-semibold"> nouveaux venus</span> et les
            <span className="text-blue-300 font-semibold"> convertis</span>, et générez des
            <span className="text-blue-300 font-semibold"> rapports clairs</span> pour mieux accompagner chaque membre.
          </p>
        </div>

        {/* Filtres */}
        <div className="bg-white/10 rounded-2xl p-4 flex flex-col gap-3">
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

          {!modePerso && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-white/50 flex-shrink-0">Période :</span>
              {[{ label: "7 j", val: "7" }, { label: "30 j", val: "30" }, { label: "90 j", val: "90" }, { label: "6 mois", val: "180" }, { label: "1 an", val: "365" }].map(p => (
                <button key={p.val} onClick={() => setFiltrePeriode(p.val)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition ${filtrePeriode === p.val ? "bg-white text-[#333699]" : "bg-white/15 text-white/70 hover:bg-white/20"}`}>
                  {p.label}
                </button>
              ))}
            </div>
          )}

          {modePerso && (
            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-white/50">Date de début</label>
                  <input type="date" value={dateDebut} onChange={e => setDateDebut(e.target.value)}
                    className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-white/50">Date de fin</label>
                  <input type="date" value={dateFin} onChange={e => setDateFin(e.target.value)}
                    className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40" />
                </div>
              </div>
              <button onClick={() => fetchReports(true)}
                className="w-full py-2 rounded-xl bg-amber-500/80 hover:bg-amber-500 text-white text-sm font-semibold transition active:scale-95">
                Générer le rapport
              </button>
            </div>
          )}

          {typesDistincts.length > 1 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-white/50 flex-shrink-0">Type :</span>
              <button onClick={() => setFiltreType("")}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition ${!filtreType ? "bg-white text-[#333699]" : "bg-white/15 text-white/70 hover:bg-white/20"}`}>
                Tous
              </button>
              {typesDistincts.map(t => (
                <button key={t} onClick={() => setFiltreType(t)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition ${filtreType === t ? "bg-white text-[#333699]" : "bg-white/15 text-white/70 hover:bg-white/20"}`}>
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Onglets */}
        <div className="flex gap-1 bg-white/10 rounded-xl p-1 mt-4">
          {onglets.map(o => (
            <button key={o.key} onClick={() => setOnglet(o.key)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition whitespace-nowrap ${onglet === o.key ? "bg-white text-[#333699]" : "text-white/50 hover:text-white/80"}`}>
              {o.label}
            </button>
          ))}
        </div>

        {/* FIX #2 : 2 boutons sous les onglets */}
        <div className="flex gap-2 mt-3">
          <button onClick={handleAjouter}
            className="flex-1 py-2 rounded-xl bg-emerald-600/40 hover:bg-emerald-600/60 text-emerald-300 text-sm font-semibold transition active:scale-95">
            ➕ Ajouter un rapport
          </button>
          <button onClick={handleModifier}
            className="flex-1 py-2 rounded-xl bg-blue-600/40 hover:bg-blue-600/60 text-blue-300 text-sm font-semibold transition active:scale-95">
            ✏️ Modifier un rapport
          </button>
        </div>

        {/* Contenu */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        ) : onglet === "saisie" ? (
          <div ref={formRef}>
            <FormulaireSaisie
              egliseId={egliseId}
              tempsOptions={tempsOptions}
              setTempsOptions={setTempsOptions}
              onSaved={() => { fetchReports(); setEditData(null); }}
              editData={editData}
              onCancelEdit={() => setEditData(null)}
            />
          </div>
        ) : reports.length === 0 ? (
          <div className="bg-white/10 rounded-2xl p-8 text-center flex flex-col gap-3 mt-4">
            <p className="text-white/40 text-sm">Aucun rapport sur cette période</p>
            <button onClick={handleAjouter}
              className="mx-auto px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition">
              ➕ Ajouter un rapport
            </button>
          </div>
        ) : onglet === "kpi" ? (
          // FIX #1 : bouton "Ajouter / modifier" supprimé du bas de la vue d'ensemble
          <div className="flex flex-col gap-7 mt-4">
            <div>
              <SectionTitle>Vue d'ensemble</SectionTitle>
              <BlocKpiGlobaux reports={reports} />
            </div>
            <div>
              <SectionTitle>Répartition H / F / J</SectionTitle>
              <div className="bg-white/10 rounded-2xl px-4 py-4">
                <BlocGenre reports={reports} />
              </div>
            </div>
            <div>
              <SectionTitle>Évangélisation — nouveaux venus & convertis</SectionTitle>
              <div className="bg-white/10 rounded-2xl px-4 py-4">
                <BlocEvangelisation reports={reports} />
              </div>
            </div>
            <div>
              <SectionTitle>Fréquentation par type de temps</SectionTitle>
              <BlocParType reports={reports} />
            </div>
            <div>
              <SectionTitle>Tendance hebdomadaire (présents H+F+J)</SectionTitle>
              <div className="bg-white/10 rounded-2xl px-4 py-4">
                <BlocTendance reports={reports} />
              </div>
            </div>
          </div>
        ) : (
          /* Sessions — FIX #5 : bouton "Nouveau rapport" retiré du haut */
          <div className="flex flex-col gap-3 mt-4">
            {reports.map(r => (
              <CarteSession key={r.id} r={r} onEdit={handleEdit} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
