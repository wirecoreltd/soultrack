"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import ProtectedRoute from "../components/ProtectedRoute";
import Footer from "../components/Footer";

export default function RapportFormationPage() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableFormation"]}>
      <RapportFormation />
    </ProtectedRoute>
  );
}

function RapportFormation() {
  const [formData, setFormData] = useState({
    date_debut: "",
    date_fin: "",
    nom_formation: "",
    hommes: 0,
    femmes: 0,
    eglise_id: null,
    branche_id: null,
  });

  const [filterDebut, setFilterDebut] = useState("");
  const [filterFin, setFilterFin] = useState("");
  const [rapports, setRapports] = useState([]);

  // 🔹 Charger eglise et branche automatiquement
  useEffect(() => {
    const fetchUser = async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("eglise_id, branche_id")
        .eq("id", session.session.user.id)
        .single();

      if (profile) {
        setFormData((prev) => ({
          ...prev,
          eglise_id: profile.eglise_id,
          branche_id: profile.branche_id,
        }));
      }
    };

    fetchUser();
  }, []);

  // 🔹 Ajouter formation
  const handleSubmit = async (e) => {
    e.preventDefault();

    await supabase.from("formations").insert([formData]);

    setFormData((prev) => ({
      ...prev,
      date_debut: "",
      date_fin: "",
      nom_formation: "",
      hommes: 0,
      femmes: 0,
    }));

    fetchRapports();
  };

  // 🔹 Fetch formations avec filtres
  const fetchRapports = async () => {
    let query = supabase
      .from("formations")
      .select("*")
      .eq("eglise_id", formData.eglise_id)
      .eq("branche_id", formData.branche_id)
      .order("date_debut", { ascending: false });

    if (filterDebut) query = query.gte("date_debut", filterDebut);
    if (filterFin) query = query.lte("date_fin", filterFin);

    const { data } = await query;
    setRapports(data || []);
  };

  useEffect(() => {
    if (formData.eglise_id && formData.branche_id) {
      fetchRapports();
    }
  }, [formData.eglise_id, formData.branche_id, filterDebut, filterFin]);

  // 🔹 Totaux automatiques
  const totalHommes = rapports.reduce((sum, r) => sum + Number(r.hommes), 0);
  const totalFemmes = rapports.reduce((sum, r) => sum + Number(r.femmes), 0);

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#16acea]">
      <HeaderPages />

      <h1 className="text-3xl font-bold mb-4">Rapport Formation</h1>

      {/* Formulaire */}
      <div className="bg-white p-6 rounded-3xl shadow-lg mb-6 w-full max-w-4xl">
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">

          <input
            type="date"
            required
            value={formData.date_debut}
            onChange={(e) =>
              setFormData({ ...formData, date_debut: e.target.value })
            }
            className="input"
          />

          <input
            type="date"
            required
            value={formData.date_fin}
            onChange={(e) =>
              setFormData({ ...formData, date_fin: e.target.value })
            }
            className="input"
          />

          <input
            type="text"
            required
            placeholder="Nom de la formation"
            value={formData.nom_formation}
            onChange={(e) =>
              setFormData({ ...formData, nom_formation: e.target.value })
            }
            className="input col-span-2"
          />

          <input
            type="number"
            placeholder="Hommes"
            value={formData.hommes}
            onChange={(e) =>
              setFormData({ ...formData, hommes: e.target.value })
            }
            className="input"
          />

          <input
            type="number"
            placeholder="Femmes"
            value={formData.femmes}
            onChange={(e) =>
              setFormData({ ...formData, femmes: e.target.value })
            }
            className="input"
          />

          <button className="col-span-2 bg-blue-600 text-white py-3 rounded-2xl">
            Ajouter
          </button>
        </form>
      </div>

      {/* Filtres */}
      <div className="bg-white p-4 rounded-2xl shadow mb-4 flex gap-4">
        <input
          type="date"
          value={filterDebut}
          onChange={(e) => setFilterDebut(e.target.value)}
          className="input"
        />
        <input
          type="date"
          value={filterFin}
          onChange={(e) => setFilterFin(e.target.value)}
          className="input"
        />
      </div>

      {/* Tableau */}
      <div className="bg-white p-6 rounded-3xl shadow-lg w-full max-w-6xl">
        <table className="min-w-full text-center">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th>Date Début</th>
              <th>Date Fin</th>
              <th>Formation</th>
              <th>Hommes</th>
              <th>Femmes</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {rapports.map((r) => (
              <tr key={r.id} className="border-b">
                <td>{r.date_debut}</td>
                <td>{r.date_fin}</td>
                <td>{r.nom_formation}</td>
                <td>{r.hommes}</td>
                <td>{r.femmes}</td>
                <td>{Number(r.hommes) + Number(r.femmes)}</td>
              </tr>
            ))}
          </tbody>

          {/* Ligne Totaux */}
          <tfoot className="bg-gray-100 font-bold">
            <tr>
              <td colSpan="3">TOTAL</td>
              <td>{totalHommes}</td>
              <td>{totalFemmes}</td>
              <td>{totalHommes + totalFemmes}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <Footer />

      <style jsx>{`
        .input {
          border: 1px solid #ccc;
          padding: 10px;
          border-radius: 12px;
        }
      `}</style>
    </div>
  );
}
