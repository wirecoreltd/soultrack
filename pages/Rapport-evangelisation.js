"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import Footer from "../components/Footer";
import ProtectedRoute from "../components/ProtectedRoute";

export default function RapportEvangelisationPage() {
  const [rapports, setRapports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState({});

  const fetchRapports = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("evangelisation")
        .select("*")
        .order("date", { ascending: true });

      if (error) throw error;
      setRapports(data || []);
    } catch (err) {
      console.error("Erreur lors du chargement des rapports", err);
      alert("Erreur lors du chargement des rapports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRapports();
  }, []);

  const groupRapportsByMonthAndType = (data) => {
    const grouped = {};
    data.forEach((r) => {
      const date = new Date(r.date);
      const month = `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}`;
      if (!grouped[month]) grouped[month] = {};
      const type = r.typeEvangelisation || "Autre";
      if (!grouped[month][type]) grouped[month][type] = [];
      grouped[month][type].push(r);
    });
    return grouped;
  };

  const toggleCollapse = (month, type) => {
    setCollapsed((prev) => ({
      ...prev,
      [`${month}_${type}`]: !prev[`${month}_${type}`],
    }));
  };

  const groupedRapports = groupRapportsByMonthAndType(rapports);

  // Calcul des totaux pour un tableau
  const calculateTotals = (arr) => {
    return arr.reduce(
      (acc, r) => {
        acc.hommes += Number(r.hommes || 0);
        acc.femmes += Number(r.femmes || 0);
        acc.jeunes += Number(r.jeunes || 0);
        acc.enfants += Number(r.enfants || 0);
        acc.evangelises += Number(r.evangelises || 0);
        acc.baptises += Number(r.baptises || 0);
        return acc;
      },
      { hommes: 0, femmes: 0, jeunes: 0, enfants: 0, evangelises: 0, baptises: 0 }
    );
  };

  return (
    <ProtectedRoute>
      <HeaderPages title="Rapport Évangélisation" />

      <div className="p-4 max-w-6xl mx-auto">
        {loading ? (
          <p>Chargement des rapports...</p>
        ) : rapports.length === 0 ? (
          <p>Aucun rapport trouvé.</p>
        ) : (
          Object.keys(groupedRapports).map((month) => {
            // Totaux par mois
            const monthlyTotals = Object.values(groupedRapports[month])
              .flat()
              .reduce(
                (acc, r) => {
                  acc.hommes += Number(r.hommes || 0);
                  acc.femmes += Number(r.femmes || 0);
                  acc.jeunes += Number(r.jeunes || 0);
                  acc.enfants += Number(r.enfants || 0);
                  acc.evangelises += Number(r.evangelises || 0);
                  acc.baptises += Number(r.baptises || 0);
                  return acc;
                },
                { hommes: 0, femmes: 0, jeunes: 0, enfants: 0, evangelises: 0, baptises: 0 }
              );

            return (
              <div key={month} className="mb-6 border-b pb-4">
                <h2 className="text-2xl font-bold mb-2">{month}</h2>

                {Object.keys(groupedRapports[month]).map((type) => {
                  const typeData = groupedRapports[month][type];
                  const typeTotals = calculateTotals(typeData);

                  return (
                    <div key={type} className="mb-4">
                      <button
                        className="font-semibold underline mb-2"
                        onClick={() => toggleCollapse(month, type)}
                      >
                        {type} ({typeData.length})
                      </button>

                      {!collapsed[`${month}_${type}`] && (
                        <table className="w-full border-collapse border border-gray-300">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="border px-2 py-1">Date</th>
                              <th className="border px-2 py-1">Hommes</th>
                              <th className="border px-2 py-1">Femmes</th>
                              <th className="border px-2 py-1">Jeunes</th>
                              <th className="border px-2 py-1">Enfants</th>
                              <th className="border px-2 py-1">Évangélisés</th>
                              <th className="border px-2 py-1">Baptisés</th>
                            </tr>
                          </thead>
                          <tbody>
                            {typeData.map((r) => (
                              <tr key={r.id}>
                                <td className="border px-2 py-1">{r.date}</td>
                                <td className="border px-2 py-1">{r.hommes}</td>
                                <td className="border px-2 py-1">{r.femmes}</td>
                                <td className="border px-2 py-1">{r.jeunes}</td>
                                <td className="border px-2 py-1">{r.enfants}</td>
                                <td className="border px-2 py-1">{r.evangelises}</td>
                                <td className="border px-2 py-1">{r.baptises}</td>
                              </tr>
                            ))}
                            <tr className="font-bold bg-gray-50">
                              <td className="border px-2 py-1">Total {type}</td>
                              <td className="border px-2 py-1">{typeTotals.hommes}</td>
                              <td className="border px-2 py-1">{typeTotals.femmes}</td>
                              <td className="border px-2 py-1">{typeTotals.jeunes}</td>
                              <td className="border px-2 py-1">{typeTotals.enfants}</td>
                              <td className="border px-2 py-1">{typeTotals.evangelises}</td>
                              <td className="border px-2 py-1">{typeTotals.baptises}</td>
                            </tr>
                          </tbody>
                        </table>
                      )}
                    </div>
                  );
                })}

                {/* Totaux du mois */}
                <div className="mt-2 font-bold text-right">
                  Totaux du mois: Hommes {monthlyTotals.hommes} | Femmes {monthlyTotals.femmes} | Jeunes {monthlyTotals.jeunes} | Enfants {monthlyTotals.enfants} | Évangélisés {monthlyTotals.evangelises} | Baptisés {monthlyTotals.baptises}
                </div>
              </div>
            );
          })
        )}

        {/* Total général */}
        {rapports.length > 0 && (
          <div className="mt-6 font-bold border-t pt-4 text-right">
            Total général:{" "}
            {(() => {
              const totals = calculateTotals(rapports);
              return `Hommes ${totals.hommes} | Femmes ${totals.femmes} | Jeunes ${totals.jeunes} | Enfants ${totals.enfants} | Évangélisés ${totals.evangelises} | Baptisés ${totals.baptises}`;
            })()}
          </div>
        )}
      </div>

      <Footer />
    </ProtectedRoute>
  );
}
