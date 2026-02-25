"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";

export default function StatsCulte({ mois, annee }) {
  const [stats, setStats] = useState([]);

  useEffect(() => {
    fetchStats();
  }, [mois, annee]);

  const fetchStats = async () => {
    // 1️⃣ Récupérer tous les attendances pour le mois et année
    const { data: attendances } = await supabase
      .from("attendance")
      .select(`
        hommes, femmes, enfants, jeunes, date, branche_id, eglise_id
      `)
      .gte("date", `${annee}-${mois}-01`)
      .lte("date", `${annee}-${mois}-31`);

    // 2️⃣ Récupérer toutes les branches
    const { data: branches } = await supabase
      .from("branches")
      .select("id, nom, eglise_id, superviseur_nom");

    // 3️⃣ Récupérer toutes les églises
    const { data: eglises } = await supabase
      .from("eglises")
      .select("id, nom, parent_eglise_id");

    // 4️⃣ Calculer stats par branche
    const statsParBranche = branches.map(branch => {
      const branchAttendances = attendances.filter(a => a.branche_id === branch.id);
      const totalHommes = branchAttendances.reduce((sum, a) => sum + Number(a.hommes), 0);
      const totalFemmes = branchAttendances.reduce((sum, a) => sum + Number(a.femmes), 0);
      const total = totalHommes + totalFemmes;
      return {
        id: branch.id,
        nom: branch.nom,
        eglise_id: branch.eglise_id,
        totalHommes,
        totalFemmes,
        total,
      };
    });

    // 5️⃣ Calculer stats parent-enfant
    const statsHierarchie = eglises.map(parent => {
      // stats parent = toutes les branches qui ont ce parent
      const enfants = statsParBranche.filter(b => {
        const brancheEglise = eglises.find(e => e.id === b.eglise_id);
        return brancheEglise?.parent_eglise_id === parent.id;
      });

      const totalParentHommes = enfants.reduce((sum, e) => sum + e.totalHommes, 0);
      const totalParentFemmes = enfants.reduce((sum, e) => sum + e.totalFemmes, 0);
      const totalParent = totalParentHommes + totalParentFemmes;

      return {
        parentNom: parent.nom,
        totalParentHommes,
        totalParentFemmes,
        totalParent,
        enfants,
      };
    });

    setStats(statsHierarchie);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">
        {new Date(annee, mois - 1).toLocaleString("fr-FR", { month: "long", year: "numeric" })}
      </h2>
      {stats.map(parent => (
        <div key={parent.parentNom} className="mb-6">
          <h3 className="text-lg font-semibold">{parent.parentNom}</h3>
          <table className="w-full border mb-2">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2">Ministère</th>
                <th className="p-2">Hommes</th>
                <th className="p-2">Femmes</th>
                <th className="p-2">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2">Culte</td>
                <td className="p-2">{parent.totalParentHommes}</td>
                <td className="p-2">{parent.totalParentFemmes}</td>
                <td className="p-2">{parent.totalParent}</td>
              </tr>
            </tbody>
          </table>

          {parent.enfants.map(enfant => (
            <div key={enfant.id} className="ml-6 mb-4">
              <h4 className="font-medium">{enfant.nom}</h4>
              <table className="w-full border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2">Ministère</th>
                    <th className="p-2">Hommes</th>
                    <th className="p-2">Femmes</th>
                    <th className="p-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2">Culte</td>
                    <td className="p-2">{enfant.totalHommes}</td>
                    <td className="p-2">{enfant.totalFemmes}</td>
                    <td className="p-2">{enfant.total}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
