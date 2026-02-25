"use client";

import { useState, useEffect } from "react";
import supabase from "../lib/supabaseClient";

export default function StatsGlobales() {
  const [data, setData] = useState([]);
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");

  // fetch data
  const fetchData = async () => {
    if (!dateDebut || !dateFin) return;
    const { data: stats, error } = await supabase
      .from("attendance_stats")
      .select("*")
      .gte("mois", dateDebut)
      .lte("mois", dateFin)
      .order("branche_nom", { ascending: true });

    if (error) {
      console.error(error);
      return;
    }
    setData(stats);
  };

  useEffect(() => {
    fetchData();
  }, [dateDebut, dateFin]);

  // construire hiérarchie
  const buildHierarchy = (branches) => {
    const map = {};
    branches.forEach((b) => (map[b.branche_id] = { ...b, children: [] }));
    const roots = [];
    branches.forEach((b) => {
      if (b.superviseur_id && map[b.superviseur_id]) {
        map[b.superviseur_id].children.push(map[b.branche_id]);
      } else {
        roots.push(map[b.branche_id]);
      }
    });
    return roots;
  };

  const hierarchy = buildHierarchy(data);

  const renderBranch = (branch, level = 0) => (
    <div key={branch.branche_id} className="ml-[${level * 20}px] space-y-1">
      <div className="font-semibold text-white">{branch.branche_nom}{level > 0 ? ` (superviseur)` : ""}</div>
      <div className="flex text-sm text-white bg-white/5 px-2 py-1 rounded-lg gap-2">
        <div className="w-24">Culte</div>
        <div className="w-12">{branch.hommes}</div>
        <div className="w-12">{branch.femmes}</div>
        <div className="w-12">{branch.jeunes}</div>
        <div className="w-16">{branch.total_hfj}</div>
        <div className="w-12">{branch.enfants}</div>
        <div className="w-16">{branch.connectes}</div>
        <div className="w-16">{branch.nouveauxVenus}</div>
        <div className="w-20">{branch.nouveauxConvertis}</div>
        <div className="w-16">{branch.moissonneurs}</div>
      </div>
      {branch.children.map((child) => renderBranch(child, level + 1))}
    </div>
  );

  return (
    <div className="w-full p-4 text-white">
      <h2 className="text-xl font-bold mb-4">Rapport Attendance</h2>

      {/* Filtre date */}
      <div className="flex gap-2 mb-4">
        <input type="date" className="p-2 rounded text-black" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} />
        <input type="date" className="p-2 rounded text-black" value={dateFin} onChange={(e) => setDateFin(e.target.value)} />
        <button className="bg-blue-600 px-4 py-2 rounded" onClick={fetchData}>Filtrer</button>
      </div>

      <div className="w-full max-w-full overflow-x-auto mt-6 scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent">
        <div className="w-max space-y-2">
          {/* HEADER */}
          <div className="flex font-semibold uppercase text-white px-4 py-3 border-b border-white/30 bg-white/5 rounded-t-xl whitespace-nowrap gap-2">
            <div className="w-24">Ministère</div>
            <div className="w-12">Hommes</div>
            <div className="w-12">Femmes</div>
            <div className="w-12">Jeunes</div>
            <div className="w-16">Total HFJ</div>
            <div className="w-12">Enfants</div>
            <div className="w-16">Connectés</div>
            <div className="w-16">Nouveaux Venus</div>
            <div className="w-20">Nouveau Converti</div>
            <div className="w-16">Moissonneurs</div>
          </div>

          {/* DATA */}
          {hierarchy.length === 0 ? (
            <div className="p-4 text-white">Aucune donnée trouvée pour cette période.</div>
          ) : (
            hierarchy.map((branch) => renderBranch(branch))
          )}
        </div>
      </div>
    </div>
  );
}
