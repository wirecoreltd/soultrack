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
  const [message, setMessage] = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      setMessage("✅ Rapport mis à jour !");
    } else {
      await supabase.from("attendance").insert([payload]);
      setMessage("✅ Rapport ajouté !");
    }

    setTimeout(() => setMessage(""), 3000);

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

  if (loading) {
    return <p className="text-center mt-10 text-white">Chargement...</p>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />

      <h1 className="text-2xl font-bold text-white mt-4 mb-6 text-center">
        Rapports d'assistance
      </h1>

      {/* FORMULAIRE */}
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
          ].map((f) => (
            <div key={f.name} className="flex flex-col">
              <label className="text-white mb-1 font-medium">{f.label}</label>
              <input
                type={f.type}
                name={f.name}
                value={formData[f.name]}
                onChange={handleChange}
                className="bg-white/20 text-white rounded-xl px-4 py-2 border border-white/30"
              />
            </div>
          ))}

          <div className="col-span-1 md:col-span-2 flex justify-center mt-4">
            <button
              type="submit"
              className="w-full md:w-2/3 bg-gradient-to-r from-blue-400 to-indigo-500 text-white font-bold py-4 text-lg rounded-2xl shadow-lg hover:from-blue-500 hover:to-indigo-600 transition-all"
            >
              {editId ? "Modifier le rapport" : "Ajouter le rapport"}
            </button>
          </div>
        </form>

        {message && <p className="mt-4 text-center text-white">{message}</p>}
      </div>

      {/* FILTRE DATE */}
      <div className="bg-white/10 p-6 rounded-2xl shadow-lg flex gap-4 flex-wrap text-white justify-center">
        <input
          type="date"
          value={dateDebut}
          onChange={(e) => setDateDebut(e.target.value)}
          className="bg-transparent border border-white/40 rounded-lg px-3 py-2"
        />
        <input
          type="date"
          value={dateFin}
          onChange={(e) => setDateFin(e.target.value)}
          className="bg-transparent border border-white/40 rounded-lg px-3 py-2"
        />
        <button
          onClick={fetchRapports}
          className="bg-[#2a2f85] px-6 py-2 rounded-xl hover:bg-[#1f2366]"
        >
          Générer
        </button>
      </div>

      {/* TABLEAU */}
      <div className="max-w-6xl w-full mt-6 mb-6">
        <div className="w-full overflow-x-auto">
          <div className="min-w-max space-y-2">

            {/* HEADER */}
            <div className="flex px-4 py-3 bg-white/5 text-white font-semibold uppercase text-sm border-b border-white/30 rounded-t-xl whitespace-nowrap">
              <div className="min-w-[150px]">Date</div>
              <div className="min-w-[120px] text-center">Hommes</div>
              <div className="min-w-[120px] text-center">Femmes</div>
              <div className="min-w-[120px] text-center">Jeunes</div>
              <div className="min-w-[130px] text-center text-orange-400">Total</div>
              <div className="min-w-[120px] text-center">Enfants</div>
              <div className="min-w-[140px] text-center">Connectés</div>
              <div className="min-w-[150px] text-center">Nouveaux Venus</div>
              <div className="min-w-[180px] text-center">Nouveaux Convertis</div>
              <div className="min-w-[140px] text-center text-orange-400">Actions</div>
            </div>

            {/* LIGNES */}
            {reports.map((r) => {
              const total = Number(r.hommes) + Number(r.femmes) + Number(r.jeunes);

              return (
                <div
                  key={r.id}
                  className="flex items-center px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition border-l-4 border-l-purple-500"
                >
                  <div className="min-w-[150px] text-white font-semibold">{r.date}</div>
                  <div className="min-w-[120px] text-center text-white">{r.hommes}</div>
                  <div className="min-w-[120px] text-center text-white">{r.femmes}</div>
                  <div className="min-w-[120px] text-center text-white">{r.jeunes}</div>
                  <div className="min-w-[130px] text-center text-orange-400 font-bold">{total}</div>
                  <div className="min-w-[120px] text-center text-white">{r.enfants}</div>
                  <div className="min-w-[140px] text-center text-white">{r.connectes}</div>
                  <div className="min-w-[150px] text-center text-white">{r.nouveauxVenus}</div>
                  <div className="min-w-[180px] text-center text-white">{r.nouveauxConvertis}</div>
                  <div className="min-w-[140px] flex justify-center gap-3">
                    <button onClick={() => handleEdit(r)} className="text-blue-400 hover:text-blue-600">✏️</button>
                    <button onClick={() => handleDelete(r.id)} className="text-red-400 hover:text-red-600">🗑️</button>
                  </div>
                </div>
              );
            })}

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
