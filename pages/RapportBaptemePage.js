"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import Footer from "../components/Footer";
import ProtectedRoute from "../components/ProtectedRoute";

export default function RapportBaptemePage() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableIntegration"]}>
      <RapportBapteme />
    </ProtectedRoute>
  );
}

function RapportBapteme() {
  const [formData, setFormData] = useState({
    date: "",
    hommes: 0,
    femmes: 0,
    baptise_par: "",
    eglise_id: null,
    branche_id: null,
  });

  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [rapports, setRapports] = useState([]);
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState("");

  // 🔹 Récupérer eglise / branche
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

  // 🔹 Ajouter / modifier baptême
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("⏳ Enregistrement en cours...");

    try {
      const dataToSave = {
        ...formData,
        eglise_id: formData.eglise_id,
        branche_id: formData.branche_id,
      };

      if (editId) {
        const { error } = await supabase
          .from("baptemes")
          .update(dataToSave)
          .eq("id", editId);
        if (error) throw error;
        setMessage("✅ Rapport mis à jour !");
      } else {
        const { error } = await supabase
          .from("baptemes")
          .insert([dataToSave]);
        if (error) throw error;
        setMessage("✅ Rapport ajouté !");
      }

      setTimeout(() => setMessage(""), 3000);
      setEditId(null);
      setFormData({ ...formData, date: "", hommes: 0, femmes: 0, baptise_par: "" });
      fetchRapports();
    } catch (err) {
      console.error(err);
      setMessage("❌ " + err.message);
    }
  };

  const fetchRapports = async () => {
    if (!formData.eglise_id || !formData.branche_id) return;

    let query = supabase
      .from("baptemes")
      .select("*")
      .eq("eglise_id", formData.eglise_id)
      .eq("branche_id", formData.branche_id)
      .order("date", { ascending: false });

    if (dateDebut) query = query.gte("date", dateDebut);
    if (dateFin) query = query.lte("date", dateFin);

    const { data } = await query;
    setRapports(data || []);
  };

  const handleEdit = (r) => {
    setEditId(r.id);
    setFormData({
      date: r.date,
      hommes: r.hommes,
      femmes: r.femmes,
      baptise_par: r.baptise_par,
      eglise_id: r.eglise_id,
      branche_id: r.branche_id,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!confirm("Voulez-vous vraiment supprimer ce rapport ?")) return;
    const { error } = await supabase.from("baptemes").delete().eq("id", id);
    if (error) console.error(error);
    else fetchRapports();
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />

      <h1 className="text-3xl font-bold text-white mt-4 mb-6 text-center">Rapport Baptême</h1>

      {/* 🔹 Formulaire */}
      <div className="max-w-3xl w-full bg-white/10 rounded-3xl p-6 shadow-lg mb-6 justify-center">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="date"
            required
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="input bg-white/20 text-white placeholder-white col-span-1 md:col-span-2"
          />
          <input
            type="number"
            placeholder="Hommes"
            value={formData.hommes}
            onChange={(e) => setFormData({ ...formData, hommes: e.target.value })}
            className="input bg-white/20 text-white placeholder-white"
          />
          <input
            type="number"
            placeholder="Femmes"
            value={formData.femmes}
            onChange={(e) => setFormData({ ...formData, femmes: e.target.value })}
            className="input bg-white/20 text-white placeholder-white"
          />
          <input
            type="text"
            placeholder="Baptisé par"
            value={formData.baptise_par}
            onChange={(e) => setFormData({ ...formData, baptise_par: e.target.value })}
            className="input bg-white/20 text-white placeholder-white col-span-1 md:col-span-2"
          />

          <button
            type="submit"
            className="col-span-1 md:col-span-2 bg-gradient-to-r from-blue-400 to-indigo-500 text-white font-bold py-3 rounded-2xl shadow-md hover:from-blue-500 hover:to-indigo-600 transition-all"
          >
            {editId ? "Mettre à jour" : "Ajouter / Modifier le rapport"}
          </button>
        </form>

        {message && <p className="mt-4 text-center font-medium text-white">{message}</p>}
      </div>

      {/* 🔹 Filtres + Bouton Générer */}
      <div className="bg-white/10 p-6 rounded-2xl shadow-lg mt-6 flex justify-center gap-4 flex-wrap text-white">
        <input
          type="date"
          value={dateDebut}
          onChange={(e) => setDateDebut(e.target.value)}
          className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white"
        />
        <input
          type="date"
          value={dateFin}
          onChange={(e) => setDateFin(e.target.value)}
          className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white"
        />
        <button
          onClick={fetchRapports}
          className="bg-[#2a2f85] px-6 py-2 rounded-xl hover:bg-[#1f2366]"
        >
          Générer
        </button>
      </div>

      {/* 🔹 Tableau */}
        <div className="w-full flex justify-center mt-6 mb-6">
          <div className="w-max overflow-x-auto space-y-2">
            {/* HEADER */}
            <div className="flex text-sm font-semibold uppercase text-white px-4 py-3 border-b border-white/30 bg-white/5 rounded-t-xl whitespace-nowrap">
              <div className="min-w-[150px]">Date</div>
              <div className="min-w-[120px] text-center">Hommes</div>
              <div className="min-w-[120px] text-center">Femmes</div>
              <div className="min-w-[130px] text-center text-orange-400 font-semibold">Total</div>
              <div className="min-w-[180px] text-center">Baptisé par</div>
              <div className="min-w-[140px] text-center text-orange-400 font-semibold">Actions</div>
            </div>
        
            {/* LIGNES */}
            {rapports.map((r) => {
              const total = Number(r.hommes) + Number(r.femmes);
              return (
                <div key={r.id} className="flex items-center px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition border-l-4 border-l-green-500">
                  <div className="min-w-[150px] text-white font-semibold">{r.date}</div>
                  <div className="min-w-[120px] text-center text-white">{r.hommes}</div>
                  <div className="min-w-[120px] text-center text-white">{r.femmes}</div>
                  <div className="min-w-[130px] text-center text-orange-400 font-semibold">{total}</div>
                  <div className="min-w-[180px] text-center text-white">{r.baptise_par}</div>
                  <div className="min-w-[140px] text-center flex justify-center gap-2">
                    <button onClick={() => handleEdit(r)} className="text-blue-400 hover:text-blue-600">✏️</button>
                    <button onClick={() => handleDelete(r.id)} className="text-red-400 hover:text-red-600">🗑️</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>        
        <Footer />

      <style jsx>{`
        .input {
          width: 100%;
          border: 1px solid #ccc;
          border-radius: 12px;
          padding: 10px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  );
}
