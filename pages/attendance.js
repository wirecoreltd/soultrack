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
  const [loading, setLoading] = useState(false);
  const [showTable, setShowTable] = useState(false);

  const [superviseur, setSuperviseur] = useState({
    eglise_id: null,
    branche_id: null
  });

  const [formData, setFormData] = useState({
    date: "",
    typeTemps: "",
    nouveauTemps: "",
    enregistrerTemps: false,
    numero_culte: 1,
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

  const [expandedMonths, setExpandedMonths] = useState({});
  const [tempsOptions, setTempsOptions] = useState(["Culte"]);

  // ---------------- LOAD USER
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
          branche_id: data.branche_id
        });
      }

    };

    loadSuperviseur();

  }, []);

  // ---------------- LOAD TEMPS
  useEffect(() => {

    const loadTemps = async () => {

      const { data } = await supabase
        .from("attendance")
        .select("typeTemps")
        .not("typeTemps", "is", null);

      const uniqueTemps = [
        "Culte",
        ...new Set(
          data
            .map(t => t.typeTemps)
            .filter(t => t && t !== "Culte")
        )
      ];

      setTempsOptions(uniqueTemps);

    };

    loadTemps();

  }, []);

  // ---------------- RENAME TEMPS
  const renameTemps = async (ancienNom) => {

    const nouveauNom = prompt("Nouveau nom du temps :", ancienNom);

    if (!nouveauNom || nouveauNom === ancienNom) return;

    await supabase
      .from("attendance")
      .update({ typeTemps: nouveauNom })
      .eq("typeTemps", ancienNom);

    setTempsOptions(prev =>
      prev.map(t => t === ancienNom ? nouveauNom : t)
    );

  };

  // ---------------- DELETE TEMPS
  const deleteTemps = async (nomTemps) => {

    const confirmDelete = confirm(
      "Si vous supprimez ce temps, les rapports resteront mais ils ne seront plus associés à ce temps. Continuer ?"
    );

    if (!confirmDelete) return;

    await supabase
      .from("attendance")
      .update({ typeTemps: null })
      .eq("typeTemps", nomTemps);

    setTempsOptions(prev =>
      prev.filter(t => t !== nomTemps)
    );

  };

  // ---------------- FETCH RAPPORTS
  const fetchRapports = async () => {

    if (!superviseur.eglise_id) return;

    setLoading(true);

    let query = supabase
      .from("attendance")
      .select("*")
      .eq("eglise_id", superviseur.eglise_id)
      .eq("branche_id", superviseur.branche_id);

    if (dateDebut) query = query.gte("date", dateDebut);
    if (dateFin) query = query.lte("date", dateFin);

    const { data } = await query.order("date", { ascending: true });

    setReports(data || []);
    setShowTable(true);
    setLoading(false);

  };

  // ---------------- HANDLE CHANGE
  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

  };

  // ---------------- HANDLE SUBMIT
  const handleSubmit = async (e) => {

    e.preventDefault();

    let typeTempsFinal = formData.typeTemps;

    if (formData.typeTemps === "AUTRE") {

      typeTempsFinal = formData.nouveauTemps;

      if (formData.enregistrerTemps &&
        !tempsOptions.includes(typeTempsFinal)) {

        setTempsOptions(prev => [...prev, typeTempsFinal]);

      }

    }

    const rapport = {
      ...formData,
      typeTemps: typeTempsFinal,
      eglise_id: superviseur.eglise_id,
      branche_id: superviseur.branche_id
    };

    if (editId) {

      await supabase
        .from("attendance")
        .update(rapport)
        .eq("id", editId);

      setMessage("Rapport mis à jour");

    } else {

      await supabase
        .from("attendance")
        .insert([rapport]);

      setMessage("Rapport ajouté");

    }

    setFormData({
      date: "",
      typeTemps: "",
      nouveauTemps: "",
      enregistrerTemps: false,
      numero_culte: 1,
      hommes: 0,
      femmes: 0,
      jeunes: 0,
      enfants: 0,
      connectes: 0,
      nouveauxVenus: 0,
      nouveauxConvertis: 0
    });

    setEditId(null);

  };

  // ---------------- FORMAT DATE
  const formatDateFR = (d) => {

    const dateObj = new Date(d);

    return `${String(dateObj.getDate()).padStart(2, "0")}/${
      String(dateObj.getMonth() + 1).padStart(2, "0")
    }/${dateObj.getFullYear()}`;

  };

  const groupByMonth = (reports) => {

    const map = {};

    reports.forEach(r => {

      const d = new Date(r.date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;

      if (!map[key]) map[key] = [];

      map[key].push(r);

    });

    return map;

  };

  const groupedReports = groupByMonth(reports);

  const toggleMonth = (key) => {
    setExpandedMonths(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (

    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">

      <HeaderPages />

      <h1 className="text-2xl font-bold mt-4 mb-6 text-white">
        Rapport <span className="text-amber-300">Présence / Temps</span>
      </h1>

      {/* FORMULAIRE */}

      <div className="max-w-3xl w-full bg-white/10 rounded-3xl p-6 mb-6">

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div className="flex flex-col">

            <label className="text-white">Date</label>

            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="input bg-white"
              required
            />

          </div>

          <div className="flex flex-col">

            <label className="text-white">Type du temps</label>

            <select
              name="typeTemps"
              value={formData.typeTemps}
              onChange={handleChange}
              className="input bg-white"
              required
            >

              <option value="">Sélectionner</option>

              {tempsOptions.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}

              <option value="AUTRE">➕ Ajouter un temps</option>

            </select>

          </div>

          {formData.typeTemps === "AUTRE" && (

            <>
              <input
                type="text"
                name="nouveauTemps"
                placeholder="Nom du temps"
                value={formData.nouveauTemps}
                onChange={handleChange}
                className="input bg-white"
              />

              <label className="text-white text-sm">
                <input
                  type="checkbox"
                  checked={formData.enregistrerTemps}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      enregistrerTemps: e.target.checked
                    }))
                  }
                />
                Enregistrer ce temps
              </label>
            </>

          )}

          {formData.typeTemps === "Culte" && (

            <select
              name="numero_culte"
              value={formData.numero_culte}
              onChange={handleChange}
              className="input bg-white"
            >

              {[1,2,3,4].map(n => (
                <option key={n} value={n}>
                  {n} {n===1 ? "er" : "ème"} Culte
                </option>
              ))}

            </select>

          )}

          <button
            type="submit"
            className="col-span-2 bg-indigo-500 text-white p-3 rounded-xl"
          >
            Enregistrer
          </button>

        </form>

      </div>

      {/* GESTION TEMPS */}

      <div className="max-w-3xl w-full bg-white/10 rounded-3xl p-6 mb-6 text-white">

        <h2 className="font-bold mb-4">Temps enregistrés</h2>

        {tempsOptions.filter(t => t !== "Culte").map(t => (

          <div key={t} className="flex justify-between mb-2 bg-white/10 p-2 rounded">

            {t}

            <div className="flex gap-3">

              <button onClick={() => renameTemps(t)}>✏️</button>

              <button onClick={() => deleteTemps(t)}>🗑</button>

            </div>

          </div>

        ))}

      </div>

      <Footer />

      <style jsx>{`

        .input {
          width:100%;
          padding:10px;
          border-radius:12px;
          border:1px solid #ccc;
        }

      `}</style>

    </div>

  );

}
