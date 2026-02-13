"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import Footer from "../components/Footer";
import ProtectedRoute from "../components/ProtectedRoute";

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

  const totalHommes = rapports.reduce((sum, r) => sum + Number(r.hommes), 0);
  const totalFemmes = rapports.reduce((sum, r) => sum + Number(r.femmes), 0);

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />
      <h1 className="text-3xl font-bold text-white mt-4 mb-2">
        Rapport Formation
      </h1>
      <p className="text-white/80 mb-6">Résumé des formations par date</p>

      {/* Formulaire */}
      <div className="bg-white/10 p-6 rounded-3xl shadow-lg mb-6 w-full max-w-4xl">
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
          <button className="col-span-2 bg-[#2a2f85] text-white py-3 rounded-2xl hover:bg-[#1f2366] transition">
            Ajouter
          </button>
        </form>
      </div>

      {/* Filtres */}
      <div className="bg-white/10 p-4 rounded-2xl shadow mb-4 flex gap-4">
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
      <div className="w-full max-w-full overflow-x-auto mt-6 scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent">
        <div className="w-max space-y-2">
          {/* HEADER */}
          <div className="flex text-sm font-semibold uppercase text-white px-4 py-3 border-b border-white/30 bg-white/5 rounded-t-xl whitespace-nowrap">
            <div className="min-w-[180px]">Date Début</div>
            <div className="min-w-[180px]">Date Fin</div>
            <div className="min-w-[200px]">Nom Formation</div>
            <div className="min-w-[120px] text-center">Hommes</div>
            <div className="min-w-[120px] text-center">Femmes</div>
            <div className="min-w-[130px] text-center">Total</div>
          </div>

          {/* LIGNES */}
          {rapports.map((r) => (
            <div
              key={r.id}
              className="flex items-center px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition border-l-4 border-l-blue-500"
            >
              <div className="min-w-[180px] text-white">{r.date_debut}</div>
              <div className="min-w-[180px] text-white">{r.date_fin}</div>
              <div className="min-w-[200px] text-white">{r.nom_formation}</div>
              <div className="min-w-[120px] text-center text-white">{r.hommes}</div>
              <div className="min-w-[120px] text-center text-white">{r.femmes}</div>
              <div className="min-w-[130px] text-center text-white font-bold">
                {Number(r.hommes) + Number(r.femmes)}
              </div>
            </div>
          ))}

          {/* Ligne Totaux */}
          <div className="flex px-4 py-3 rounded-lg bg-white/10 font-bold border-t border-white/30">
            <div className="min-w-[560px] text-white">TOTAL</div>
            <div className="min-w-[120px] text-center text-white">{totalHommes}</div>
            <div className="min-w-[120px] text-center text-white">{totalFemmes}</div>
            <div className="min-w-[130px] text-center text-white">
              {totalHommes + totalFemmes}
            </div>
          </div>
        </div>
      </div>

      <Footer />

      <style jsx>{`
        .input {
          border: 1px solid #ccc;
          padding: 10px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.05);
          color: white;
        }
        .input::placeholder {
          color: #e0e0e0;
        }
      `}</style>
    </div>
  );
}
