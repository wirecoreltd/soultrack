"use client";

import { useState, useEffect } from "react";
import supabase from "../lib/supabaseClient";
import Image from "next/image";
import { useRouter } from "next/router";

export default function Attendance() {
  const router = useRouter();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
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

  // 🔹 Fetch reports
  const fetchReports = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("attendance")
      .select("*")
      .order("date", { ascending: false });
    if (error) console.error("❌ Erreur fetch:", error);
    else setReports(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // 🔹 Handle form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 Add or update report
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("⏳ Enregistrement en cours...");

    try {
      if (editId) {
        const { data, error } = await supabase
          .from("attendance")
          .update(formData)
          .eq("id", editId)
          .select();
        if (error) throw error;
        setMessage("✅ Rapport mis à jour !");
      } else {
        const { data, error } = await supabase
          .from("attendance")
          .insert([formData])
          .select();
        if (error) throw error;
        setMessage("✅ Rapport ajouté !");
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
      fetchReports();
    } catch (err) {
      console.error(err);
      setMessage("❌ " + err.message);
    }
  };

  // 🔹 Edit report
  const handleEdit = (report) => {
    setEditId(report.id);
    setFormData({
      date: report.date,
      hommes: report.hommes,
      femmes: report.femmes,
      jeunes: report.jeunes,
      enfants: report.enfants,
      connectes: report.connectes,
      nouveauxVenus: report.nouveauxVenus,
      nouveauxConvertis: report.nouveauxConvertis,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 🔹 Delete report
  const handleDelete = async (id) => {
    if (!confirm("Voulez-vous vraiment supprimer ce rapport ?")) return;
    const { error } = await supabase.from("attendance").delete().eq("id", id);
    if (error) console.error("❌ Erreur delete:", error);
    else fetchReports();
  };

  if (loading) return <p className="text-center mt-10 text-lg">Chargement...</p>;

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-purple-200 via-pink-100 to-yellow-200">
      {/* 🔹 Retour */}
      <button
        onClick={() => router.back()}
        className="absolute top-4 left-4 text-black font-semibold hover:text-gray-700"
      >
        ← Retour
      </button>

      {/* 🔹 Logo */}
      <div className="flex justify-center mb-6">
        <Image src="/logo.png" alt="Logo" width={80} height={80} />
      </div>

      {/* 🔹 Titre */}
      <h1 className="text-3xl font-bold text-center mb-6">📊 Rapports d'assistance</h1>

      {/* 🔹 Formulaire */}
      <div className="max-w-3xl mx-auto bg-white rounded-3xl p-6 shadow-lg mb-6">
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
              <label htmlFor={field.name} className="font-medium mb-1">{field.label}</label>
              <input
                type={field.type}
                name={field.name}
                id={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                className="input"
                required={field.type === "date"}
              />
            </div>
          ))}

          <button
            type="submit"
            className="col-span-1 md:col-span-2 bg-gradient-to-r from-blue-400 to-indigo-500 text-white font-bold py-3 rounded-2xl shadow-md hover:from-blue-500 hover:to-indigo-600 transition-all"
          >
            {editId ? "Mettre à jour" : "Ajouter le rapport"}
          </button>
        </form>
        {message && <p className="mt-4 text-center font-medium">{message}</p>}
      </div>

      {/* 🔹 Liste des rapports */}
      <div className="max-w-5xl mx-auto bg-white rounded-3xl p-6 shadow-lg overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-purple-600 text-white">
            <tr>
              <th className="py-3 px-4 text-left">Date</th>
              <th className="py-3 px-4 text-left">Hommes</th>
              <th className="py-3 px-4 text-left">Femmes</th>
              <th className="py-3 px-4 text-left">Jeunes</th>
              <th className="py-3 px-4 text-left">Enfants</th>
              <th className="py-3 px-4 text-left">Connectés</th>
              <th className="py-3 px-4 text-left">Nouveaux venus</th>
              <th className="py-3 px-4 text-left">Nouveaux convertis</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r.id} className="border-b hover:bg-purple-50 transition-all">
                <td className="py-3 px-4 font-semibold text-gray-700">{r.date}</td>
                <td className="py-3 px-4">{r.hommes}</td>
                <td className="py-3 px-4">{r.femmes}</td>
                <td className="py-3 px-4">{r.jeunes}</td>
                <td className="py-3 px-4">{r.enfants}</td>
                <td className="py-3 px-4">{r.connectes}</td>
                <td className="py-3 px-4">{r.nouveauxVenus}</td>
                <td className="py-3 px-4">{r.nouveauxConvertis}</td>
                <td className="py-3 px-4 flex justify-center gap-2">
                  <button
                    onClick={() => handleEdit(r)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
