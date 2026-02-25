"use client";

import { useState, useEffect } from "react";
import supabase from "../lib/supabaseClient";

// Helper pour construire la hiérarchie
const buildHierarchy = (eglises, parentId = null) => {
  return eglises
    .filter(e => e.parent_eglise_id === parentId)
    .map(e => ({
      ...e,
      children: buildHierarchy(eglises, e.id)
    }));
};

// Helper pour calculer le total d'une église pour un mois donné
const calculateTotals = (attendance, egliseId, month, year) => {
  const filtered = attendance.filter(a => {
    const date = new Date(a.date);
    return (
      a.eglise_id === egliseId &&
      date.getMonth() === month &&
      date.getFullYear() === year
    );
  });

  const hommes = filtered.reduce((sum, a) => sum + Number(a.hommes), 0);
  const femmes = filtered.reduce((sum, a) => sum + Number(a.femmes), 0);
  const total = hommes + femmes;

  return { hommes, femmes, total };
};

// Composant récursif pour afficher chaque église et ses enfants
const EgliseTable = ({ eglise, attendance, month, year }) => {
  const totals = calculateTotals(attendance, eglise.id, month, year);

  return (
    <div style={{ marginLeft: eglise.parent_eglise_id ? 30 : 0, marginTop: 20 }}>
      <h3>{eglise.nom}</h3>
      <table border="1" cellPadding="5" cellSpacing="0">
        <thead>
          <tr>
            <th>Ministère</th>
            <th>Hommes</th>
            <th>Femmes</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Culte</td>
            <td>{totals.hommes}</td>
            <td>{totals.femmes}</td>
            <td>{totals.total}</td>
          </tr>
        </tbody>
      </table>

      {eglise.children && eglise.children.length > 0 && (
        <div>
          {eglise.children.map(child => (
            <EgliseTable
              key={child.id}
              eglise={child}
              attendance={attendance}
              month={month}
              year={year}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function RapportCulte() {
  const [attendance, setAttendance] = useState([]);
  const [eglises, setEglises] = useState([]);
  const [month, setMonth] = useState(new Date().getMonth()); // 0 = Janvier
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchData = async () => {
      const { data: attData } = await supabase.from("attendance").select("*");
      const { data: egliseData } = await supabase.from("eglises").select("*");
      setAttendance(attData || []);
      setEglises(buildHierarchy(egliseData || []));
    };
    fetchData();
  }, []);

  return (
    <div style={{ padding: 20, backgroundColor: "#f0f2f5" }}>
      <h2>Rapport Culte - {new Date(year, month).toLocaleString("fr-FR", { month: "long", year: "numeric" })}</h2>

      {/* Filter */}
      <div style={{ marginBottom: 20 }}>
        <label>
          Mois:
          <select value={month} onChange={e => setMonth(Number(e.target.value))}>
            {[...Array(12)].map((_, i) => (
              <option key={i} value={i}>
                {new Date(0, i).toLocaleString("fr-FR", { month: "long" })}
              </option>
            ))}
          </select>
        </label>
        <label style={{ marginLeft: 10 }}>
          Année:
          <input
            type="number"
            value={year}
            onChange={e => setYear(Number(e.target.value))}
            style={{ width: 80 }}
          />
        </label>
      </div>

      {/* Display */}
      {eglises.map(e => (
        <EgliseTable key={e.id} eglise={e} attendance={attendance} month={month} year={year} />
      ))}

      <footer style={{ marginTop: 50, textAlign: "center" }}>
        © 2026 - Rapport Culte
      </footer>
    </div>
  );
}
