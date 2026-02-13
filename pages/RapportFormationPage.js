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
  const [editRapport, setEditRapport] = useState(null);

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

  const handleEdit = (r) => {
    setEditRapport(r);
    setFormData({
      ...formData,
      date_debut: r.date_debut,
      date_fin: r.date_fin,
      nom_formation: r.nom_formation,
      hommes: r.hommes,
      femmes: r.femmes,
    });
  };

  const handleUpdate = async () => {
    if (!editRapport) return;
    await supabase
      .from("formations")
      .update({
        date_debut: formData.date_debut,
        date_fin: formData.date_fin,
        nom_formation: formData.nom_formation,
        hommes: formData.hommes,
        femmes: formData.femmes,
      })
      .eq("id", editRapport.id);
    setEditRapport(null);
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

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />
      <h1 className="text-3xl font-bold text-white mt-4 mb-2">
        Rapport Formation
      </h1>
      <p className="text-white/80 mb-6">Résumé des formations par date</p>

      {/* Formulaire */}
      <div className="max-w-2xl w-full bg-white/10 rounded-3xl p-6 shadow-lg mb-6">
        <form
          onSubmit={editRapport ? handleUpdate : handleSubmit}
          className="grid grid-cols-2 gap-4"
        >
          <div className="flex flex-col">
            <label className="text-white mb-1">Date Début</label>
            <input
              type="date"
              required
              value={formData.date_debut}
              onChange={(e) =>
                setFormData({ ...formData, date_debut: e.target.value })
              }
              className="input"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-white mb-1">Date Fin</label>
            <input
              type="date"
              required
              value={formData.date_fin}
              onChange={(e) =>
                setFormData({ ...formData, date_fin: e.target.value })
              }
              className="input"
            />
          </div>

          <div className="flex flex-col col-span-2">
            <label className="text-white mb-1">Nom de la Formation</label>
            <input
              type="text"
              required
              placeholder="Nom de la formation"
              value={formData.nom_formation}
              onChange={(e) =>
                setFormData({ ...formData, nom_formation: e.target.value })
              }
              className="input"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-white mb-1">Hommes</label>
            <input
              type="number"
              value={formData.hommes}
              onChange={(e) =>
                setFormData({ ...formData, hommes: e.target.value })
              }
              className="input"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-white mb-1">Femmes</label>
            <input
              type="number"
              value={formData.femmes}
              onChange={(e) =>
                setFormData({ ...formData, femmes: e.target.value })
              }
              className="input"
            />
          </div>

          {/* Bouton Ajouter / Modifier centré et plus large */}
          <div className="col-span-2 flex justify-center mt-4">
            <button
              type="submit"
              className="
                w-full max-w-xl
                bg-gradient-to-r from-blue-400 to-indigo-500 
                text-white font-bold text-lg
                py-3 px-6
                rounded-2xl
                shadow-lg
                hover:from-blue-500 hover:to-indigo-600
                hover:scale-105
                transition-all duration-300
              "
            >
              {editRapport ? "Modifier" : "Ajouter le rapport"}
            </button>
          </div>
        </form>
      </div>

      {/* Filtres */}
      <div className="bg-white/10 p-6 rounded-2xl shadow-lg mt-6 flex justify-center gap-4 flex-wrap text-white">
        <input
          type="date"
          value={filterDebut}
          onChange={(e) => setFilterDebut(e.target.value)}
          className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white"
        />
        <input
          type="date"
          value={filterFin}
          onChange={(e) => setFilterFin(e.target.value)}
          className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white"
        />
        <button
          onClick={fetchRapports}
          className="bg-[#2a2f85] px-6 py-2 rounded-xl hover:bg-[#1f2366]"
        >
          Générer
        </button>
      </div>

      {/* Tableau */}
        <div className="w-full max-w-full overflow-x-auto mt-6 flex justify-center">
          <div className="w-max space-y-2">
            {/* HEADER */}
            <div className="flex text-sm font-semibold uppercase text-white px-4 py-3 border-b border-white/30 bg-white/5 rounded-t-xl whitespace-nowrap">
              <div className="min-w-[180px]">Date Début</div>
              <div className="min-w-[180px]">Date Fin</div>
              <div className="min-w-[200px] text-center">Nom Formation</div>
              <div className="min-w-[120px] text-center">Hommes</div>
              <div className="min-w-[120px] text-center">Femmes</div>
              <div className="min-w-[120px] text-center">Total</div>
              <div className="min-w-[150px] text-center">Actions</div>
            </div>
        
            {/* LIGNES */}
            {rapports.map((r) => {
              const total = Number(r.hommes) + Number(r.femmes);
              return (
                <div
                  key={r.id}
                  className="flex items-center px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition border-l-4 border-l-blue-500"
                >
                  <div className="min-w-[180px] text-white">{r.date_debut}</div>
                  <div className="min-w-[180px] text-white">{r.date_fin}</div>
                  <div className="min-w-[200px] text-center text-white">{r.nom_formation}</div>
                  <div className="min-w-[120px] text-center text-white">{r.hommes}</div>
                  <div className="min-w-[120px] text-center text-white">{r.femmes}</div>
                  <div className="min-w-[120px] text-center text-white font-bold">{total}</div>
                  <div className="min-w-[150px] text-center">
                    <button
                      onClick={() => handleEdit(r)}
                      className="text-orange-400 underline hover:text-orange-500 hover:no-underline px-4 py-1 rounded-xl"
                    >
                      Modifier
                    </button>
                  </div>
                </div>
              );
            })}
        
            {/* TOTAL GENERAL */}
            <div className="flex items-center px-4 py-3 mt-2 border-t border-white/50 bg-white/10 rounded-b-xl">
              <div className="min-w-[180px] text-white font-bold">TOTAL</div>
              <div className="min-w-[180px]"></div>
              <div className="min-w-[200px]"></div>
              <div className="min-w-[120px] text-center text-white font-bold">
                {rapports.reduce((sum, r) => sum + Number(r.hommes), 0)}
              </div>
              <div className="min-w-[120px] text-center text-white font-bold">
                {rapports.reduce((sum, r) => sum + Number(r.femmes), 0)}
              </div>
              <div className="min-w-[120px] text-center text-white font-bold">
                {rapports.reduce((sum, r) => sum + Number(r.hommes) + Number(r.femmes), 0)}
              </div>
              <div className="min-w-[150px]"></div>
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
