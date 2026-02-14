"use client";

import { useState, useEffect } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import Footer from "../components/Footer";
import ProtectedRoute from "../components/ProtectedRoute";

export default function AttendancePage() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableIntegration"]}>
      <Attendance />
    </ProtectedRoute>
  );
}

function Attendance() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [superviseur, setSuperviseur] = useState({ eglise_id: null, branche_id: null });

  const [formData, setFormData] = useState({
    date: "",
    hommes: 0,
    femmes: 0,
    jeunes: 0,
    enfants: 0,
    connectes: 0,
    nouveauxVenus: 0,
    nouveauxConvertis: 0,
  });

  const [editId, setEditId] = useState(null);
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");

  /* ================= LOAD SUPERVISEUR ================= */
  useEffect(() => {
    const loadSuperviseur = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("eglise_id, branche_id")
        .eq("id", user.id)
        .single();

      if (data) {
        setSuperviseur({
          eglise_id: data.eglise_id,
          branche_id: data.branche_id,
        });
      }
    };

    loadSuperviseur();
  }, []);

  /* ================= FETCH ================= */
  const fetchRapports = async () => {
    if (!superviseur.eglise_id || !superviseur.branche_id) return;

    setLoading(true);

    let query = supabase
      .from("attendance")
      .select("*")
      .eq("eglise_id", superviseur.eglise_id)
      .eq("branche_id", superviseur.branche_id)
      .order("date", { ascending: false });

    if (dateDebut) query = query.gte("date", dateDebut);
    if (dateFin) query = query.lte("date", dateFin);

    const { data } = await query;
    setReports(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchRapports();
  }, [superviseur]);

  /* ================= FORM ================= */
  const handleChange = (e) => {
    const { name, value, type } = e.target;

    const safeValue =
      type === "number" ? Math.max(0, Number(value)) : value;

    setFormData((prev) => ({
      ...prev,
      [name]: safeValue,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      eglise_id: superviseur.eglise_id,
      branche_id: superviseur.branche_id,
    };

    if (editId) {
      await supabase.from("attendance").update(payload).eq("id", editId);
    } else {
      await supabase.from("attendance").insert([payload]);
    }

    setFormData({
      date: "",
      hommes: 0,
      femmes: 0,
      jeunes: 0,
      enfants: 0,
      connectes: 0,
      nouveauxVenus: 0,
      nouveauxConvertis: 0,
    });

    setEditId(null);
    fetchRapports();
  };

  const handleEdit = (r) => {
    setEditId(r.id);
    setFormData(r);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!confirm("Supprimer ce rapport ?")) return;
    await supabase.from("attendance").delete().eq("id", id);
    fetchRapports();
  };

  if (loading)
    return <p className="text-center mt-10 text-white">Chargement...</p>;

  /* ================= TOTAL ================= */
  const totalHommes = reports.reduce((s, r) => s + Number(r.hommes || 0), 0);
  const totalFemmes = reports.reduce((s, r) => s + Number(r.femmes || 0), 0);
  const totalJeunes = reports.reduce((s, r) => s + Number(r.jeunes || 0), 0);
  const totalGeneral = totalHommes + totalFemmes + totalJeunes;

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />

      <h1 className="text-2xl font-bold text-white mt-4 mb-6 text-center">
        Rapports d'assistance
      </h1>

      {/* ================= FORMULAIRE ================= */}
      <div className="max-w-3xl w-full bg-white/10 rounded-3xl p-6 shadow-lg mb-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {[
            { label: "Date", name: "date", type: "date" },
            { label: "Hommes", name: "hommes", type: "number" },
            { label: "Femmes", name: "femmes", type: "number" },
            { label: "Jeunes", name: "jeunes", type: "number" },
            { label: "Enfants", name: "enfants", type: "number" },
            { label: "Connectés", name: "connectes", type: "number" },
            { label: "Nouveaux venus", name: "nouveauxVenus", type: "number" },
            { label: "Nouveaux convertis", name: "nouveauxConvertis", type: "number" },
          ].map((field) => (
            <div key={field.name} className="flex flex-col">
              <label className="text-white mb-1 font-medium">
                {field.label}
              </label>
              <input
                type={field.type}
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                min={field.type === "number" ? "0" : undefined}
                className="input bg-white/20 text-white"
                required={field.type === "date"}
              />
            </div>
          ))}

          <button
            type="submit"
            className="col-span-1 md:col-span-2 w-full 
              bg-gradient-to-r from-blue-400 to-indigo-500
              text-white font-bold text-lg
              py-4 rounded-2xl shadow-lg
              hover:from-blue-500 hover:to-indigo-600
              transition-all duration-300"
          >
            {editId ? "Mettre à jour" : "Ajouter le rapport"}
          </button>
        </form>
      </div>

      {/* ================= TABLE ================= */}
      <div className="max-w-6xl w-full mt-6 mb-6">
        <div className="overflow-x-auto">
          <div className="min-w-fit space-y-2">

            {/* HEADER */}
            <div className="flex px-4 py-3 bg-white/5 text-white font-semibold uppercase text-sm border-b border-white/30 rounded-t-xl whitespace-nowrap">
              <div className="w-[150px]">Date</div>
              <div className="w-[120px] text-center">Hommes</div>
              <div className="w-[120px] text-center">Femmes</div>
              <div className="w-[120px] text-center">Jeunes</div>
              <div className="w-[130px] text-center text-orange-400">Total</div>
              <div className="w-[140px] text-center">Actions</div>
            </div>

            {reports.map((r) => {
              const total = Number(r.hommes) + Number(r.femmes) + Number(r.jeunes);
              return (
                <div key={r.id} className="flex items-center px-4 py-3 bg-white/10 rounded-lg">
                  <div className="w-[150px] text-white">{r.date}</div>
                  <div className="w-[120px] text-center text-white">{r.hommes}</div>
                  <div className="w-[120px] text-center text-white">{r.femmes}</div>
                  <div className="w-[120px] text-center text-white">{r.jeunes}</div>
                  <div className="w-[130px] text-center text-orange-400 font-bold">{total}</div>
                  <div className="w-[140px] flex justify-center gap-3">
                    <button onClick={() => handleEdit(r)} className="text-blue-400">✏️</button>
                    <button onClick={() => handleDelete(r.id)} className="text-red-400">🗑️</button>
                  </div>
                </div>
              );
            })}

            {/* TOTAL BAS */}
            <div className="flex items-center px-4 py-4 mt-3 bg-white/15 rounded-xl border-t border-white/50">
              <div className="w-[150px] text-white font-bold">TOTAL</div>
              <div className="w-[120px] text-center text-white font-bold">{totalHommes}</div>
              <div className="w-[120px] text-center text-white font-bold">{totalFemmes}</div>
              <div className="w-[120px] text-center text-white font-bold">{totalJeunes}</div>
              <div className="w-[130px] text-center text-orange-400 font-bold">{totalGeneral}</div>
              <div className="w-[140px]"></div>
            </div>

          </div>
        </div>
      </div>

      <Footer />

      <style jsx>{`
        .input {
          border: 1px solid #ccc;
          border-radius: 12px;
          padding: 10px;
        }
      `}</style>
    </div>
  );
}
