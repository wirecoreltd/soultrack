"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import ProtectedRoute from "../components/ProtectedRoute";
import Footer from "../components/Footer";

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

  // Récup eglise / branche
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
    await supabase.from("baptemes").insert([formData]);
    setFormData((prev) => ({ ...prev, date: "", hommes: 0, femmes: 0, baptise_par: "" }));
    fetchRapports();
  };

  const fetchRapports = async () => {
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

  useEffect(() => {
    if (formData.eglise_id && formData.branche_id) fetchRapports();
  }, [formData.eglise_id, formData.branche_id, dateDebut, dateFin]);

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />

      <h1 className="text-3xl font-bold text-white mt-4">Rapport Baptême</h1>

      {/* Formulaire */}
      <div className="bg-white/10 p-6 rounded-3xl shadow-lg mb-6 w-full max-w-3xl">
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <input
            type="date"
            required
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="border border-gray-400 rounded-xl px-4 py-2 col-span-2 bg-white/20 text-white"
          />

          <input
            type="number"
            placeholder="Hommes"
            value={formData.hommes}
            onChange={(e) => setFormData({ ...formData, hommes: e.target.value })}
            className="border border-gray-400 rounded-xl px-4 py-2 bg-white/20 text-white"
          />

          <input
            type="number"
            placeholder="Femmes"
            value={formData.femmes}
            onChange={(e) => setFormData({ ...formData, femmes: e.target.value })}
            className="border border-gray-400 rounded-xl px-4 py-2 bg-white/20 text-white"
          />

          <input
            type="text"
            placeholder="Baptisé par"
            value={formData.baptise_par}
            onChange={(e) => setFormData({ ...formData, baptise_par: e.target.value })}
            className="border border-gray-400 rounded-xl px-4 py-2 col-span-2 bg-white/20 text-white"
          />

          <button className="col-span-2 bg-[#2a2f85] hover:bg-[#1f2366] text-white py-3 rounded-2xl transition-all">
            Ajouter
          </button>
        </form>
      </div>

      {/* Filtres */}
      <div className="bg-white/10 p-4 rounded-2xl shadow mb-4 flex gap-4">
        <input
          type="date"
          value={dateDebut}
          onChange={(e) => setDateDebut(e.target.value)}
          className="border border-gray-400 rounded-xl px-3 py-2 bg-white/20 text-white"
        />
        <input
          type="date"
          value={dateFin}
          onChange={(e) => setDateFin(e.target.value)}
          className="border border-gray-400 rounded-xl px-3 py-2 bg-white/20 text-white"
        />
      </div>

      {/* Tableau style Stats Global */}
      <div className="w-full max-w-full overflow-x-auto mt-6 scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent">
        <div className="w-max space-y-2">

          {/* HEADER */}
          <div className="flex text-sm font-semibold uppercase text-white px-4 py-3 border-b border-white/30 bg-white/5 rounded-t-xl whitespace-nowrap">
            <div className="min-w-[150px]">Date</div>
            <div className="min-w-[120px] text-center">Hommes</div>
            <div className="min-w-[120px] text-center">Femmes</div>
            <div className="min-w-[130px] text-center">Total</div>
            <div className="min-w-[180px] text-center">Baptisé par</div>
          </div>

          {/* LIGNES */}
          {rapports.map((r) => (
            <div
              key={r.id}
              className="flex items-center px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition border-l-4 border-l-green-500"
            >
              <div className="min-w-[150px] text-white font-semibold">
                {r.date}
              </div>
              <div className="min-w-[120px] text-center text-white">
                {r.hommes ?? "-"}
              </div>
              <div className="min-w-[120px] text-center text-white">
                {r.femmes ?? "-"}
              </div>
              <div className="min-w-[130px] text-center text-white font-bold">
                {Number(r.hommes) + Number(r.femmes)}
              </div>
              <div className="min-w-[180px] text-center text-white">
                {r.baptise_par ?? "-"}
              </div>
            </div>
          ))}

          {rapports.length === 0 && (
            <div className="text-white/70 px-4 py-6">
              Aucun rapport trouvé
            </div>
          )}

        </div>
      </div>

      <Footer />
    </div>
  );
}
