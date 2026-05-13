"use client";

import { useState } from "react";
import supabase from "../../lib/supabaseClient";
import HeaderPages from "../../components/HeaderPages";
import ProtectedRoute from "../../components/ProtectedRoute";
import Footer from "../../components/Footer";

export default function StatGlobalPageWrapper() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "Responsable"]}>
      <StatGlobalPage />
    </ProtectedRoute>
  );
}

// ─── UI ATOMS ─────────────────────────────────────────────────
function SectionTitle({ children }) {
  return <p className="text-[11px] font-semibold uppercase tracking-widest text-white/40 mb-3">{children}</p>;
}
function KpiCard({ label, value, sub, accent }) {
  const c = {
    green: "text-emerald-400", red: "text-red-400", amber: "text-amber-400",
    white: "text-white", blue: "text-blue-300", pink: "text-pink-300",
    purple: "text-purple-300", teal: "text-teal-300", orange: "text-orange-300",
    gray: "text-white/40", indigo: "text-indigo-300", yellow: "text-yellow-300",
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
    green: "bg-emerald-900/60 text-emerald-300", red: "bg-red-900/60 text-red-300",
    amber: "bg-amber-900/60 text-amber-300", blue: "bg-blue-900/60 text-blue-300",
    purple: "bg-purple-900/60 text-purple-300", gray: "bg-white/10 text-white/50",
    orange: "bg-orange-900/60 text-orange-300", yellow: "bg-yellow-900/60 text-yellow-300",
    indigo: "bg-indigo-900/60 text-indigo-300", pink: "bg-pink-900/60 text-pink-300",
  };
  return <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${m[color] || m.gray}`}>{children}</span>;
}
function BarreProgression({ pct, color }) {
  const col = color || (pct >= 70 ? "bg-emerald-400" : pct >= 40 ? "bg-amber-400" : "bg-red-400");
  return (
    <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all ${col}`} style={{ width: `${Math.min(pct || 0, 100)}%` }} />
    </div>
  );
}

// ─── STAT ROW ─────────────────────────────────────────────────
function StatRow({ label, color, children }) {
  return (
    <div className={`bg-white/10 rounded-xl px-4 py-3 border-l-2 ${color}`}>
      <p className="text-[11px] font-semibold uppercase tracking-widest text-white/40 mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}
function StatChip({ label, value, accent }) {
  const c = {
    green: "text-emerald-400", blue: "text-blue-300", purple: "text-purple-300",
    pink: "text-pink-300", yellow: "text-yellow-300", orange: "text-orange-300",
    amber: "text-amber-300", indigo: "text-indigo-300", white: "text-white",
  };
  return (
    <div className="bg-white/5 rounded-xl px-3 py-2 flex flex-col items-center min-w-[70px]">
      <p className={`text-lg font-bold leading-none ${c[accent] || "text-white"}`}>{value}</p>
      <p className="text-[10px] text-white/40 mt-0.5 text-center">{label}</p>
    </div>
  );
}

// ─── BESOIN CONFIG ────────────────────────────────────────────
const BESOIN_CONFIG = {
  "Finances":                  { bar: "bg-green-400",   dot: "bg-green-400",   badge: "green" },
  "Santé":                     { bar: "bg-red-400",     dot: "bg-red-400",     badge: "red" },
  "Travail / Études":          { bar: "bg-blue-400",    dot: "bg-blue-400",    badge: "blue" },
  "Famille / Enfants":         { bar: "bg-pink-400",    dot: "bg-pink-400",    badge: "pink" },
  "Relations / Conflits":      { bar: "bg-orange-400",  dot: "bg-orange-400",  badge: "orange" },
  "Addictions / Dépendances":  { bar: "bg-purple-400",  dot: "bg-purple-400",  badge: "gray" },
  "Guidance spirituelle":      { bar: "bg-indigo-400",  dot: "bg-indigo-400",  badge: "blue" },
  "Logement / Sécurité":       { bar: "bg-yellow-400",  dot: "bg-yellow-400",  badge: "yellow" },
  "Communauté / Isolement":    { bar: "bg-cyan-400",    dot: "bg-cyan-400",    badge: "blue" },
  "Dépression / Santé mentale":{ bar: "bg-rose-500",    dot: "bg-rose-500",    badge: "red" },
  "Miracle":                   { bar: "bg-violet-400",  dot: "bg-violet-400",  badge: "blue" },
  "Délivrance":                { bar: "bg-fuchsia-400", dot: "bg-fuchsia-400", badge: "pink" },
  "Autres":                    { bar: "bg-white/60",    dot: "bg-white/40",    badge: "gray" },
};
function getCfg(b) { return BESOIN_CONFIG[b] || BESOIN_CONFIG["Autres"]; }

// ─── CARTE TOP 5 BESOINS ──────────────────────────────────────
function CarteTop5Besoins({ besoinsGlobaux }) {
  if (!besoinsGlobaux || Object.keys(besoinsGlobaux).length === 0) return null;

  const top5 = Object.entries(besoinsGlobaux)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 5);

  const maxTotal = Math.max(...top5.map(([, v]) => v.total), 1);
  const totalTous = top5.reduce((a, [, v]) => a + v.total, 0);
  const totalResolus = top5.reduce((a, [, v]) => a + v.resolu, 0);
  const tauxGlobal = totalTous > 0 ? Math.round((totalResolus / totalTous) * 100) : 0;

  return (
    <div className="bg-white/10 rounded-2xl px-4 py-4 flex flex-col gap-3">
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm font-semibold text-white">🆘 Top 5 difficultés</p>
        <div className="flex items-center gap-2">
          <Badge color="orange">{totalTous} cas</Badge>
          <Badge color={tauxGlobal >= 50 ? "green" : "amber"}>{tauxGlobal}% résolus</Badge>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {top5.map(([besoin, data], index) => {
          const cfg = getCfg(besoin);
          const pct = Math.round((data.total / maxTotal) * 100);
          const pctResolu = data.total > 0 ? Math.round((data.resolu / data.total) * 100) : 0;
          return (
            <div key={besoin} className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-bold text-white/30 w-4 flex-shrink-0">#{index + 1}</span>
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                <p className="text-xs text-white flex-1 truncate">{besoin}</p>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Badge color="orange">{data.total}</Badge>
                  <Badge color={pctResolu >= 50 ? "green" : "amber"}>{pctResolu}%✓</Badge>
                </div>
              </div>
              <div className="ml-9 flex items-center gap-2">
                <BarreProgression pct={pct} color={cfg.bar} />
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-white/20 text-center mt-1">
        Agrégé sur toutes les églises supervisées
      </p>
    </div>
  );
}

// ─── BLOC VUE D'ENSEMBLE GLOBALE ──────────────────────────────
function BlocVueEnsemble({ allEglises, besoinsGlobaux }) {
  // Agréger toutes les stats de toutes les églises
  const totaux = allEglises.reduce((acc, e) => {
    const s = e.stats;
    acc.culteHommes += s.culte.hommes;
    acc.culteFemmes += s.culte.femmes;
    acc.culteJeunes += s.culte.jeunes;
    acc.culteEnfants += s.culte.enfants;
    acc.culteConnectes += s.culte.connectes;
    acc.culteNV += s.culte.nouveaux_venus;
    acc.culteNC += s.culte.nouveau_converti;
    acc.baptemeH += s.bapteme.hommes;
    acc.baptemeF += s.bapteme.femmes;
    acc.evangH += s.evangelisation.hommes;
    acc.evangF += s.evangelisation.femmes;
    acc.evangNC += s.evangelisation.nouveau_converti;
    acc.servH += s.serviteurs.hommes;
    acc.servF += s.serviteurs.femmes;
    acc.cellules += s.cellules.total;
    return acc;
  }, {
    culteHommes: 0, culteFemmes: 0, culteJeunes: 0, culteEnfants: 0, culteConnectes: 0,
    culteNV: 0, culteNC: 0, baptemeH: 0, baptemeF: 0, evangH: 0, evangF: 0,
    evangNC: 0, servH: 0, servF: 0, cellules: 0,
  });

  const totalCulte = totaux.culteHommes + totaux.culteFemmes + totaux.culteJeunes;
  const totalCulteGlobal = totalCulte + totaux.culteEnfants + totaux.culteConnectes;
  const totalBapteme = totaux.baptemeH + totaux.baptemeF;
  const totalEvangelisation = totaux.evangH + totaux.evangF;
  const totalServiteurs = totaux.servH + totaux.servF;
  const nbEglises = allEglises.length;
  const moyenneCulteParEglise = nbEglises > 0 ? Math.round(totalCulteGlobal / nbEglises) : 0;

  // Taux de croissance (convertis culte / présences)
  const tauxConversion = totalCulteGlobal > 0 ? Math.round((totaux.culteNC / totalCulteGlobal) * 100) : 0;
  // Taux d'engagement serviteurs
  const tauxEngagement = totalCulteGlobal > 0 ? Math.round((totalServiteurs / totalCulteGlobal) * 100) : 0;

  return (
    <div className="flex flex-col gap-4">
      {/* KPI principaux */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard label="Églises supervisées" value={nbEglises} sub="dans le réseau" accent="amber" />
        <KpiCard label="Total présences culte" value={totalCulteGlobal} sub="H+F+J+Enf+Conn." accent="green" />
        <KpiCard label="Moy. par église" value={moyenneCulteParEglise} sub="présences/église" accent="blue" />
        <KpiCard label="Cellules actives" value={totaux.cellules} sub="total réseau" accent="orange" />
      </div>

      {/* KPI évangélisation */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard label="Évangélisés" value={totalEvangelisation} sub="âmes touchées" accent="pink" />
        <KpiCard label="Baptêmes" value={totalBapteme} sub="cette période" accent="purple" />
        <KpiCard label="Taux conversion" value={`${tauxConversion}%`} sub="NV convertis / présents" accent="yellow" />
        <KpiCard label="Serviteurs" value={totalServiteurs} sub={`${tauxEngagement}% des présents`} accent="teal" />
      </div>

      {/* Répartition H/F */}
      <div className="bg-white/10 rounded-2xl px-4 py-4 flex flex-col gap-3">
        <p className="text-xs text-white/50 font-semibold">Répartition H / F / J (culte)</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Hommes", val: totaux.culteHommes, color: "text-blue-300", bg: "bg-blue-900/40" },
            { label: "Femmes", val: totaux.culteFemmes, color: "text-pink-300", bg: "bg-pink-900/40" },
            { label: "Jeunes", val: totaux.culteJeunes, color: "text-amber-300", bg: "bg-amber-900/40" },
          ].map(({ label, val, color, bg }) => {
            const pct = totalCulte > 0 ? Math.round((val / totalCulte) * 100) : 0;
            return (
              <div key={label} className={`${bg} rounded-xl px-3 py-3 text-center`}>
                <p className={`text-xl font-bold ${color}`}>{val}</p>
                <p className={`text-[11px] ${color}/70`}>{label}</p>
                <p className={`text-[10px] ${color}/50`}>{pct}%</p>
              </div>
            );
          })}
        </div>
        {totalCulte > 0 && (
          <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
            <div className="bg-blue-400 rounded-l-full transition-all" style={{ width: `${Math.round((totaux.culteHommes / totalCulte) * 100)}%` }} />
            <div className="bg-pink-400 transition-all" style={{ width: `${Math.round((totaux.culteFemmes / totalCulte) * 100)}%` }} />
            <div className="bg-amber-400 rounded-r-full transition-all" style={{ width: `${Math.round((totaux.culteJeunes / totalCulte) * 100)}%` }} />
          </div>
        )}
      </div>

      {/* Entonnoir de croissance */}
      {totalCulteGlobal > 0 && (
        <div className="bg-white/10 rounded-2xl px-4 py-4 flex flex-col gap-2">
          <p className="text-xs text-white/50 font-semibold mb-1">Entonnoir de croissance (réseau)</p>
          {[
            { label: "Présences culte", val: totalCulteGlobal, color: "bg-emerald-400" },
            { label: "Évangélisés", val: totalEvangelisation, color: "bg-pink-400" },
            { label: "Baptisés", val: totalBapteme, color: "bg-purple-400" },
            { label: "Serviteurs", val: totalServiteurs, color: "bg-yellow-400" },
          ].map(({ label, val, color }) => (
            <div key={label} className="flex items-center gap-3">
              <p className="text-xs text-white/50 w-28 flex-shrink-0">{label}</p>
              <BarreProgression pct={Math.round((val / totalCulteGlobal) * 100)} color={color} />
              <span className="text-xs text-white font-semibold w-8 text-right">{val}</span>
              <span className="text-[10px] text-white/30 w-8 text-right">{Math.round((val / totalCulteGlobal) * 100)}%</span>
            </div>
          ))}
        </div>
      )}

      {/* Top 5 besoins */}
      <CarteTop5Besoins besoinsGlobaux={besoinsGlobaux} />

      {/* Classement des églises par présence */}
      {allEglises.length > 1 && (
        <div className="bg-white/10 rounded-2xl px-4 py-4 flex flex-col gap-2">
          <p className="text-xs text-white/50 font-semibold mb-1">Classement des églises (présences culte)</p>
          {[...allEglises]
            .sort((a, b) => {
              const totA = a.stats.culte.hommes + a.stats.culte.femmes + a.stats.culte.jeunes + a.stats.culte.enfants + a.stats.culte.connectes;
              const totB = b.stats.culte.hommes + b.stats.culte.femmes + b.stats.culte.jeunes + b.stats.culte.enfants + b.stats.culte.connectes;
              return totB - totA;
            })
            .map((e, index) => {
              const tot = e.stats.culte.hommes + e.stats.culte.femmes + e.stats.culte.jeunes + e.stats.culte.enfants + e.stats.culte.connectes;
              const pct = totalCulteGlobal > 0 ? Math.round((tot / totalCulteGlobal) * 100) : 0;
              return (
                <div key={e.id} className="flex items-center gap-3">
                  <span className="text-[11px] font-bold text-white/30 w-4 flex-shrink-0">#{index + 1}</span>
                  <p className="text-xs text-white w-32 flex-shrink-0 truncate">{e.nom}</p>
                  <BarreProgression pct={pct} color="bg-blue-400" />
                  <span className="text-xs text-white font-semibold w-8 text-right">{tot}</span>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}

// ─── BLOC STATS EGLISE ────────────────────────────────────────
function BlocStatsEglise({ stats }) {
  const totalCulte = stats.culte.hommes + stats.culte.femmes + stats.culte.jeunes;
  const totalCulteGlobal = totalCulte + stats.culte.enfants + stats.culte.connectes;

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-1">
        <KpiCard label="Culte" value={totalCulteGlobal} sub="total présences" accent="green" />
        <KpiCard label="Évangélisation" value={stats.evangelisation.hommes + stats.evangelisation.femmes} sub="âmes touchées" accent="pink" />
        <KpiCard label="Baptêmes" value={stats.bapteme.hommes + stats.bapteme.femmes} sub="cette période" accent="purple" />
        <KpiCard label="Cellules" value={stats.cellules.total} sub="cellules actives" accent="orange" />
      </div>

      <StatRow label="Culte" color="border-emerald-500">
        <StatChip label="Hommes" value={stats.culte.hommes} accent="blue" />
        <StatChip label="Femmes" value={stats.culte.femmes} accent="pink" />
        <StatChip label="Jeunes" value={stats.culte.jeunes} accent="amber" />
        <StatChip label="Total H+F+J" value={totalCulte} accent="orange" />
        <StatChip label="Enfants" value={stats.culte.enfants} accent="green" />
        <StatChip label="Connectés" value={stats.culte.connectes} accent="indigo" />
        <StatChip label="Nv Venus" value={stats.culte.nouveaux_venus} accent="purple" />
        <StatChip label="Nv Convertis" value={stats.culte.nouveau_converti} accent="yellow" />
        <StatChip label="Moissonneurs" value={stats.culte.moissonneurs} accent="white" />
        <StatChip label="Total Global" value={totalCulteGlobal} accent="orange" />
      </StatRow>

      <StatRow label="Formation" color="border-blue-500">
        <StatChip label="Hommes" value={stats.formation.hommes} accent="blue" />
        <StatChip label="Femmes" value={stats.formation.femmes} accent="pink" />
        <StatChip label="Total" value={stats.formation.hommes + stats.formation.femmes} accent="orange" />
      </StatRow>

      <StatRow label="Baptême" color="border-purple-500">
        <StatChip label="Hommes" value={stats.bapteme.hommes} accent="blue" />
        <StatChip label="Femmes" value={stats.bapteme.femmes} accent="pink" />
        <StatChip label="Total" value={stats.bapteme.hommes + stats.bapteme.femmes} accent="orange" />
      </StatRow>

      <StatRow label="Évangélisation" color="border-pink-500">
        <StatChip label="Hommes" value={stats.evangelisation.hommes} accent="blue" />
        <StatChip label="Femmes" value={stats.evangelisation.femmes} accent="pink" />
        <StatChip label="Total" value={stats.evangelisation.hommes + stats.evangelisation.femmes} accent="orange" />
        <StatChip label="Prière" value={stats.evangelisation.priere} accent="indigo" />
        <StatChip label="Nv Convertis" value={stats.evangelisation.nouveau_converti} accent="yellow" />
        <StatChip label="Réconciliation" value={stats.evangelisation.reconciliation} accent="green" />
        <StatChip label="Moissonneurs" value={stats.evangelisation.moissonneurs} accent="white" />
      </StatRow>

      <StatRow label="Serviteurs" color="border-yellow-500">
        <StatChip label="Hommes" value={stats.serviteurs.hommes} accent="blue" />
        <StatChip label="Femmes" value={stats.serviteurs.femmes} accent="pink" />
        <StatChip label="Total" value={stats.serviteurs.hommes + stats.serviteurs.femmes} accent="orange" />
      </StatRow>

      {totalCulteGlobal > 0 && (
        <div className="bg-white/10 rounded-xl p-3 flex flex-col gap-2 mt-1">
          <SectionTitle>Entonnoir</SectionTitle>
          {[
            { label: "Présences culte", val: totalCulteGlobal, color: "bg-emerald-400" },
            { label: "Évangélisés", val: stats.evangelisation.hommes + stats.evangelisation.femmes, color: "bg-pink-400" },
            { label: "Baptisés", val: stats.bapteme.hommes + stats.bapteme.femmes, color: "bg-purple-400" },
            { label: "Serviteurs", val: stats.serviteurs.hommes + stats.serviteurs.femmes, color: "bg-yellow-400" },
          ].map(({ label, val, color }) => (
            <div key={label} className="flex items-center gap-3">
              <p className="text-xs text-white/50 w-28 flex-shrink-0">{label}</p>
              <BarreProgression pct={Math.round((val / totalCulteGlobal) * 100)} color={color} />
              <span className="text-xs text-white font-semibold w-8 text-right">{val}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── CARTE EGLISE ─────────────────────────────────────────────
function CarteEglise({ eglise, level, expandedEglises, toggleExpand }) {
  const isExpanded = expandedEglises.includes(eglise.id);
  const hasChildren = eglise.enfants?.length > 0;

  const totalStats = hasChildren && !isExpanded
    ? eglise.enfants.reduce((acc, child) => {
        acc.culte.hommes += child.stats.culte.hommes;
        acc.culte.femmes += child.stats.culte.femmes;
        acc.culte.jeunes += child.stats.culte.jeunes;
        acc.culte.enfants += child.stats.culte.enfants;
        acc.culte.connectes += child.stats.culte.connectes;
        acc.culte.nouveaux_venus += child.stats.culte.nouveaux_venus;
        acc.culte.nouveau_converti += child.stats.culte.nouveau_converti;
        acc.culte.moissonneurs += child.stats.culte.moissonneurs;
        acc.formation.hommes += child.stats.formation.hommes;
        acc.formation.femmes += child.stats.formation.femmes;
        acc.bapteme.hommes += child.stats.bapteme.hommes;
        acc.bapteme.femmes += child.stats.bapteme.femmes;
        acc.evangelisation.hommes += child.stats.evangelisation.hommes;
        acc.evangelisation.femmes += child.stats.evangelisation.femmes;
        acc.evangelisation.priere += child.stats.evangelisation.priere;
        acc.evangelisation.nouveau_converti += child.stats.evangelisation.nouveau_converti;
        acc.evangelisation.reconciliation += child.stats.evangelisation.reconciliation;
        acc.evangelisation.moissonneurs += child.stats.evangelisation.moissonneurs;
        acc.serviteurs.hommes += child.stats.serviteurs.hommes;
        acc.serviteurs.femmes += child.stats.serviteurs.femmes;
        acc.cellules.total += child.stats.cellules.total;
        return acc;
      }, {
        culte: { ...eglise.stats.culte },
        formation: { ...eglise.stats.formation },
        bapteme: { ...eglise.stats.bapteme },
        evangelisation: { ...eglise.stats.evangelisation },
        serviteurs: { ...eglise.stats.serviteurs },
        cellules: { ...eglise.stats.cellules },
      })
    : eglise.stats;

  const totalCulte = totalStats.culte.hommes + totalStats.culte.femmes + totalStats.culte.jeunes;

  return (
    <div className="flex flex-col gap-2">
      <div
        className={`bg-white/10 rounded-2xl overflow-hidden border-l-2 ${hasChildren ? "border-amber-400" : "border-blue-400"}`}
        style={{ marginLeft: level * 12 }}
      >
        <button
          onClick={() => toggleExpand(eglise.id)}
          className="w-full flex items-center justify-between px-4 py-4 hover:bg-white/5 transition text-left gap-3"
        >
          <div className="flex flex-col gap-0.5 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={`font-semibold ${hasChildren ? "text-amber-300" : "text-white"}`}>
                {eglise.nom}
              </span>
              {hasChildren && (
                <Badge color="amber">
                  {eglise.enfants.length} église{eglise.enfants.length > 1 ? "s" : ""}
                </Badge>
              )}
              {hasChildren && !isExpanded && (
                <Badge color="gray">Total général</Badge>
              )}
            </div>
            <span className="text-[11px] text-white/40">
              Culte : {totalCulte} · Baptêmes : {totalStats.bapteme.hommes + totalStats.bapteme.femmes} · Cellules : {totalStats.cellules.total}
            </span>
          </div>
          <span className="text-white/30 text-xs flex-shrink-0">{isExpanded ? "▲" : "▼"}</span>
        </button>

        {isExpanded && (
          <div className="border-t border-white/10 px-4 pb-4 pt-3">
            <BlocStatsEglise stats={totalStats} />
          </div>
        )}
      </div>

      {isExpanded && eglise.enfants?.map((child) => (
        <CarteEglise
          key={child.id}
          eglise={child}
          level={level + 1}
          expandedEglises={expandedEglises}
          toggleExpand={toggleExpand}
        />
      ))}
    </div>
  );
}

// ─── PAGE PRINCIPALE ──────────────────────────────────────────
function StatGlobalPage() {
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [eglisesTree, setEglisesTree] = useState([]);
  const [loading, setLoading] = useState(false);
  const [parentFilter, setParentFilter] = useState("");
  const [allEglises, setAllEglises] = useState([]);
  const [rootId, setRootId] = useState(null);
  const [expandedEglises, setExpandedEglises] = useState([]);
  const [onglet, setOnglet] = useState("ensemble");
  const [modePerso, setModePerso] = useState(false);
  const [filtrePeriode, setFiltrePeriode] = useState("30");
  const [hasData, setHasData] = useState(false);
  const [besoinsGlobaux, setBesoinsGlobaux] = useState({});

  const toggleExpand = (egliseId) => {
    setExpandedEglises((prev) =>
      prev.includes(egliseId) ? prev.filter((id) => id !== egliseId) : [...prev, egliseId]
    );
  };

  const fetchStats = async (overrideModePerso = null) => {
    setLoading(true);
    const isPerso = overrideModePerso !== null ? overrideModePerso : modePerso;

    // Calculer les dates selon le mode
    let debut = dateDebut;
    let fin = dateFin;
    if (!isPerso) {
      const depuis = new Date();
      depuis.setDate(depuis.getDate() - Number(filtrePeriode));
      debut = depuis.toISOString().split("T")[0];
      fin = "";
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profileData } = await supabase
        .from("profiles").select("eglise_id").eq("id", user.id).single();

      const rootIdValue = profileData.eglise_id;
      setRootId(rootIdValue);

      const { data: filteredEglisesData } = await supabase.rpc("get_descendant_eglises", { root_id: rootIdValue });

      if (!filteredEglisesData?.length) {
        setEglisesTree([]); setAllEglises([]); setBesoinsGlobaux({});
        setHasData(false); setLoading(false); return;
      }

      const egliseIds = filteredEglisesData.map((e) => e.id);

      const statsMap = {};
      egliseIds.forEach((id) => {
        statsMap[id] = {
          culte: { hommes: 0, femmes: 0, jeunes: 0, enfants: 0, connectes: 0, nouveaux_venus: 0, nouveau_converti: 0, moissonneurs: 0 },
          formation: { hommes: 0, femmes: 0 },
          bapteme: { hommes: 0, femmes: 0 },
          evangelisation: { hommes: 0, femmes: 0, priere: 0, nouveau_converti: 0, reconciliation: 0, moissonneurs: 0 },
          serviteurs: { hommes: 0, femmes: 0 },
          cellules: { total: 0 },
        };
      });

      const tableFetch = async (table, dateField) => {
        let query = supabase.from(table).select("*").in("eglise_id", egliseIds);
        if (debut) query = query.gte(dateField, debut);
        if (fin) query = query.lte(dateField, fin);
        const { data } = await query;
        return data || [];
      };

      const [attendanceData, formationData, baptemeData, evangeData, cellulesData] = await Promise.all([
        tableFetch("attendance_stats", "mois"),
        tableFetch("formations", "date_debut"),
        tableFetch("baptemes", "date"),
        tableFetch("rapport_evangelisation", "date"),
        tableFetch("cellules", "created_at"),
      ]);

      attendanceData.forEach((s) => {
        const a = statsMap[s.eglise_id]?.culte; if (!a) return;
        a.hommes += Number(s.hommes) || 0; a.femmes += Number(s.femmes) || 0;
        a.jeunes += Number(s.jeunes) || 0; a.enfants += Number(s.enfants) || 0;
        a.connectes += Number(s.connectes) || 0; a.nouveaux_venus += Number(s.nouveaux_venus) || 0;
        a.nouveau_converti += Number(s.nouveau_converti) || 0; a.moissonneurs += Number(s.moissonneurs) || 0;
      });
      formationData.forEach((f) => {
        const form = statsMap[f.eglise_id]?.formation; if (!form) return;
        form.hommes += Number(f.hommes) || 0; form.femmes += Number(f.femmes) || 0;
      });
      baptemeData.forEach((b) => {
        const bap = statsMap[b.eglise_id]?.bapteme; if (!bap) return;
        bap.hommes += Number(b.hommes) || 0; bap.femmes += Number(b.femmes) || 0;
      });
      evangeData.forEach((e) => {
        const ev = statsMap[e.eglise_id]?.evangelisation; if (!ev) return;
        ev.hommes += Number(e.hommes) || 0; ev.femmes += Number(e.femmes) || 0;
        ev.priere += Number(e.priere) || 0; ev.nouveau_converti += Number(e.nouveau_converti) || 0;
        ev.reconciliation += Number(e.reconciliation) || 0; ev.moissonneurs += Number(e.moissonneurs) || 0;
      });

      const { data: serviteurData } = await supabase
        .from("stats_ministere_besoin").select("membre_id, eglise_id, sexe, type")
        .in("eglise_id", egliseIds);
      const unique = new Map();
      serviteurData?.forEach((row) => {
        if (row.type !== "ministere") return;
        const key = `${row.eglise_id}_${row.membre_id}`;
        if (!unique.has(key)) unique.set(key, row);
      });
      unique.forEach((row) => {
        if (!row.sexe) return;
        const serv = statsMap[row.eglise_id]?.serviteurs; if (!serv) return;
        const sexe = row.sexe.trim().toLowerCase();
        if (sexe === "homme") serv.hommes += 1;
        else if (sexe === "femme") serv.femmes += 1;
      });

      cellulesData.forEach((c) => {
        if (c.eglise_id && statsMap[c.eglise_id]) statsMap[c.eglise_id].cellules.total++;
      });

      // ─── Fetch besoins (suivis) pour toutes les églises ──────
      const { data: membresData } = await supabase
        .from("membres_complets").select("id, eglise_id, sexe")
        .in("eglise_id", egliseIds);

      if (membresData?.length) {
        const membreIds = membresData.map(m => m.id);
        const sexeMap = {};
        membresData.forEach(m => { sexeMap[m.id] = m.sexe?.toLowerCase() === "homme" ? "hommes" : "femmes"; });

        let suivisQuery = supabase.from("suivis").select("membre_id, besoin, date_action").in("membre_id", membreIds);
        if (debut) suivisQuery = suivisQuery.gte("date_action", debut);
        if (fin) suivisQuery = suivisQuery.lte("date_action", fin);
        const { data: suivisData } = await suivisQuery;

        const count = {};
        (suivisData || []).forEach(s => {
          if (!s.besoin) return;
          const sexe = sexeMap[s.membre_id] || "femmes";
          let items = [];
          try { items = Array.isArray(s.besoin) ? s.besoin : JSON.parse(s.besoin); } catch { return; }
          items.forEach(item => {
            const label = typeof item === "string" ? item.trim() : item?.label?.trim();
            const statut = typeof item === "string" ? null : item?.statut;
            if (!label) return;
            if (!count[label]) count[label] = { total: 0, hommes: 0, femmes: 0, enSuivi: 0, resolu: 0 };
            count[label].total++;
            if (sexe === "hommes") count[label].hommes++; else count[label].femmes++;
            if (statut === "Résolu") count[label].resolu++; else count[label].enSuivi++;
          });
        });
        setBesoinsGlobaux(count);
      }

      // ─── Construire l'arbre ───────────────────────────────────
      const map = {};
      filteredEglisesData.forEach((e) => {
        map[e.id] = { ...e, stats: statsMap[e.id], enfants: [] };
      });
      const tree = [];
      Object.values(map).forEach((e) => {
        if (e.parent_eglise_id && map[e.parent_eglise_id]) map[e.parent_eglise_id].enfants.push(e);
        else tree.push(e);
      });

      setEglisesTree(tree);
      setAllEglises(Object.values(map));
      setHasData(true);
    } catch (err) {
      console.error("Erreur fetch stats:", err);
      setEglisesTree([]); setAllEglises([]); setBesoinsGlobaux({});
      setHasData(false);
    }
    setLoading(false);
  };

  // Auto-fetch en mode période rapide
  const handlePeriodeChange = (val) => {
    setFiltrePeriode(val);
    setModePerso(false);
  };

  const parentOptions = allEglises.filter((e) => e.parent_eglise_id === rootId);

  const filteredEglises = (() => {
    if (!parentFilter) return eglisesTree;
    const find = (tree) => {
      for (let e of tree) {
        if (e.id === parentFilter) return e;
        const found = find(e.enfants || []);
        if (found) return found;
      }
      return null;
    };
    const found = find(eglisesTree);
    return found ? [found] : [];
  })();

  const onglets = [
    { key: "ensemble", label: "Vue d'ensemble" },
    { key: "eglises", label: "Par église" },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6" style={{ background: "#333699" }}>
      <HeaderPages />

      <div className="w-full max-w-2xl mt-6 flex flex-col gap-5 mb-10">

        {/* En-tête */}
        <div className="text-center">
          <h1 className="text-2xl font-bold mt-4 mb-2 text-white">
            Rapport <span className="text-emerald-300">Statistiques Globales</span>
          </h1>
          <p className="italic text-base text-white/90">
            Pilotez votre assemblée avec une vision{" "}
            <span className="text-blue-300 font-semibold">globale et structurée</span>.
            Gardez une vue d'ensemble sur les églises sous votre{" "}
            <span className="text-blue-300 font-semibold">supervision</span>, suivez les{" "}
            <span className="text-blue-300 font-semibold">indicateurs clés</span> et accompagnez le{" "}
            <span className="text-blue-300 font-semibold">développement</span> de chaque communauté.
          </p>
        </div>

        {/* Filtres */}
        <div className="bg-white/10 rounded-2xl p-4 flex flex-col gap-3">
          <SectionTitle>Paramètres du rapport</SectionTitle>

          {/* Toggle mode */}
          <div className="flex gap-1 bg-white/10 rounded-xl p-1 w-fit">
            <button
              onClick={() => setModePerso(false)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${!modePerso ? "bg-white text-[#333699]" : "text-white/50 hover:text-white/80"}`}
            >
              Période rapide
            </button>
            <button
              onClick={() => setModePerso(true)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${modePerso ? "bg-white text-[#333699]" : "text-white/50 hover:text-white/80"}`}
            >
              Tranche de dates
            </button>
          </div>

          {/* Période rapide */}
          {!modePerso && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-white/50 flex-shrink-0">Période :</span>
                {[
                  { label: "7 j", val: "7" }, { label: "30 j", val: "30" },
                  { label: "90 j", val: "90" }, { label: "6 mois", val: "180" },
                  { label: "1 an", val: "365" },
                ].map(p => (
                  <button
                    key={p.val}
                    onClick={() => handlePeriodeChange(p.val)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                      filtrePeriode === p.val ? "bg-white text-[#333699]" : "bg-white/15 text-white/70 hover:bg-white/20"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => fetchStats(false)}
                className="w-full py-2 rounded-xl bg-amber-500/80 hover:bg-amber-500 text-white text-sm font-semibold transition active:scale-95"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Génération…
                  </span>
                ) : "Générer le rapport"}
              </button>
            </div>
          )}

          {/* Tranche de dates */}
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
              <button
                onClick={() => fetchStats(true)}
                className="w-full py-2 rounded-xl bg-amber-500/80 hover:bg-amber-500 text-white text-sm font-semibold transition active:scale-95"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Génération…
                  </span>
                ) : "Générer le rapport"}
              </button>
            </div>
          )}
        </div>

        {/* Onglets */}
        {hasData && (
          <div className="flex gap-1 bg-white/10 rounded-xl p-1">
            {onglets.map(o => (
              <button
                key={o.key}
                onClick={() => setOnglet(o.key)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition ${
                  onglet === o.key ? "bg-white text-[#333699]" : "text-white/50 hover:text-white/80"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        )}

        {/* Contenu */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        ) : !hasData ? (
          <div className="bg-white/10 rounded-2xl p-8 text-center text-white/40 text-sm">
            Choisissez une période et cliquez sur « Générer le rapport »
          </div>
        ) : onglet === "ensemble" ? (
          <div className="flex flex-col gap-4">
            <SectionTitle>Synthèse du réseau — {allEglises.length} église{allEglises.length > 1 ? "s" : ""}</SectionTitle>
            <BlocVueEnsemble allEglises={allEglises} besoinsGlobaux={besoinsGlobaux} />
          </div>
        ) : (
          /* ─── PAR ÉGLISE ─── */
          <div className="flex flex-col gap-3">
            {/* Filtre église parente */}
            {parentOptions.length > 0 && (
              <div className="flex flex-col gap-1">
                <label className="text-xs text-white/50">Filtrer par église</label>
                <select value={parentFilter} onChange={e => setParentFilter(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40 appearance-none cursor-pointer">
                  <option value="" className="bg-[#2a2d80]">Toutes les églises</option>
                  {parentOptions.map((e) => (
                    <option key={e.id} value={e.id} className="bg-[#2a2d80]">{e.nom}</option>
                  ))}
                </select>
              </div>
            )}
            <SectionTitle>{filteredEglises.length} église{filteredEglises.length > 1 ? "s" : ""} affichée{filteredEglises.length > 1 ? "s" : ""}</SectionTitle>
            {filteredEglises.map((eglise) => (
              <CarteEglise
                key={eglise.id}
                eglise={eglise}
                level={0}
                expandedEglises={expandedEglises}
                toggleExpand={toggleExpand}
              />
            ))}
          </div>
        )}

      </div>
      <Footer />
    </div>
  );
}
