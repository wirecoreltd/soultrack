"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";

export default function AttendanceStats() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    const { data: stats, error } = await supabase
      .from("attendance_stats")
      .select("*")
      .order("mois", { ascending: true })
      .order("branche_nom", { ascending: true });

    if (error) {
      console.error("Erreur fetch attendance_stats:", error);
    } else {
      setData(stats);
    }
    setLoading(false);
  };

  // Grouper par mois
  const grouped = data.reduce((acc, row) => {
    const mois = new Date(row.mois).toLocaleString("fr-FR", { month: "long", year: "numeric" });
    if (!acc[mois]) acc[mois] = [];
    acc[mois].push(row);
    return acc;
  }, {});

  if (loading) return <p className="text-white">Chargement...</p>;
  if (!data.length) return <p className="text-white">Aucune donnée trouvée</p>;

  return (
    <div className="p-6 bg-[#333699] min-h-screen">
      {Object.entries(grouped).map(([mois, rows]) => (
        <div key={mois} className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">{mois}</h2>
          {rows.map((r) => (
            <div key={r.branche_nom} className="mb-4 text-white">
              <div className="font-semibold text-xl">{r.branche_nom}</div>
              <div className="ml-4">
                <span className="font-semibold">Culte :</span>{" "}
                {r.hommes} {r.femmes} {r.jeunes} {r.enfants} {r.evangelises} {r.baptises} {r.connectes} {r.nouveauxVenus} {r.nouveauxConvertis}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
