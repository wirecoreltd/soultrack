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

  // 🔹 Récupérer eglise / branche automatiquement
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

  // 🔹 Ajouter baptême
  const handleSubmit = async (e) => {
    e.preventDefault();

    await supabase.from("baptemes").insert([formData]);

    setFormData((prev) => ({
      ...prev,
      date: "",
      hommes: 0,
      femmes: 0,
      baptise_par: "",
    }));

    fetchRapports();
  };

  // 🔹 Fetch avec filtre date + eglise + branche
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
    if (formData.eglise_id && formData.branche_id) {
      fetchRapports();
    }
  }, [formData.eglise_id, formData.branche_id, dateDebut, dateFin]);

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#16acea]">
      <HeaderPages />

      <h1 className="text-3xl font-bold text-white mt-4">Rapport Baptême</h1>

      {/* Formulaire */}
      <div className="bg-white p-6 rounded-3xl shadow-lg mb-6 w-full max-w-3xl">
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <input
            type="date"
            required
            value={formData.date}
            onChange={(e) =>
              setFormData({ ...formData, date: e.target.value })
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
          <input
            type="text"
            placeholder="Baptisé par"
            value={formData.baptise_par}
            onChange={(e) =>
              setFormData({ ...formData, baptise_par: e.target.value })
            }
            className="input col-span-2"
          />

          <button className="col-span-2 bg-gradient-to-r from-blue-400 to-indigo-500 text-white font-semibold py-3 rounded-2xl shadow-md hover:from-blue-500 hover:to-indigo-600 transition-all">
            Ajouter
          </button>
        </form>
      </div>

      {/* Filtre date */}
      <div className="bg-white/10 p-6 rounded-2xl shadow-lg mb-6 flex justify-center gap-4 w-full max-w-3xl text-white">
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

      {/* Tableau */}
      <div className="bg-white p-6 rounded-3xl shadow-lg w-full max-w-5xl overflow-x-auto">
        <table className="min-w-full text-center">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Hommes</th>
              <th className="py-3 px-4">Femmes</th>
              <th className="py-3 px-4 text-orange-400 font-semibold">
                Total
              </th>
              <th className="py-3 px-4">Baptisé par</th>
            </tr>
          </thead>
          <tbody>
            {rapports.map((r) => {
              const total = (Number(r.hommes) || 0) + (Number(r.femmes) || 0);
              return (
                <tr
                  key={r.id}
                  className="border-b hover:bg-blue-50 transition-all"
                >
                  <td className="py-3 px-4">{r.date}</td>
                  <td className="py-3 px-4">{r.hommes}</td>
                  <td className="py-3 px-4">{r.femmes}</td>
                  <td className="py-3 px-4 text-orange-400 font-semibold">
                    {total}
                  </td>
                  <td className="py-3 px-4">{r.baptise_par}</td>
                </tr>
              );
            })}
          </tbody>
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
