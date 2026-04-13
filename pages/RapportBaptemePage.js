"use client";

import { useEffect, useState, useRef } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import Footer from "../components/Footer";
import ProtectedRoute from "../components/ProtectedRoute";
import { useRouter } from "next/navigation";

export default function RapportBaptemesPage() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableFormation"]}>
      <RapportBaptemes />
    </ProtectedRoute>
  );
}

function RapportBaptemes() {
  const [formData, setFormData] = useState({
    date: "",
    hommes: 0,
    femmes: 0,
    baptise_par: "",
    eglise_id: null,
    branche_id: null
  });

  const [filterDebut, setFilterDebut] = useState("");
  const [filterFin, setFilterFin] = useState("");
  const [rapports, setRapports] = useState([]);
  const [editRapport, setEditRapport] = useState(null);
  const [expandedMonths, setExpandedMonths] = useState({});
  const [candidats, setCandidats] = useState([]);
  const [selectedCandidats, setSelectedCandidats] = useState([]);
  const [rapportSuccess, setRapportSuccess] = useState(false);

  const router = useRouter();
  const formRef = useRef(null);

  /* USER */
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
        setFormData(prev => ({
          ...prev,
          eglise_id: profile.eglise_id,
          branche_id: profile.branche_id
        }));

        fetchCandidats(profile.eglise_id, profile.branche_id);
      }
    };

    fetchUser();
  }, []);

  /* CANDIDATS */
  const fetchCandidats = async (eglise_id, branche_id) => {
    const { data } = await supabase
      .from("membres_complets")
      .select("id,prenom,nom,sexe,evangelise_member_id")
      .eq("eglise_id", eglise_id)
      .eq("branche_id", branche_id)
      .eq("veut_se_faire_baptiser", "Oui")
      .eq("bapteme_eau", "Non");

    setCandidats(data || []);
  };

  /* AUTO HOMMES / FEMMES */
  useEffect(() => {
    const selected = candidats.filter(c =>
      selectedCandidats.includes(c.id)
    );

    const hommes = selected.filter(c => c.sexe === "Homme").length;
    const femmes = selected.filter(c => c.sexe === "Femme").length;

    setFormData(prev => ({ ...prev, hommes, femmes }));
  }, [selectedCandidats, candidats]);

  /* FETCH RAPPORTS */
  const fetchRapports = async () => {
    let query = supabase
      .from("baptemes")
      .select("*")
      .order("date", { ascending: false });

    if (filterDebut) query = query.gte("date", filterDebut);
    if (filterFin) query = query.lte("date", filterFin);

    const { data } = await query;
    setRapports(data || []);
  };

  /* SUBMIT */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editRapport) return handleUpdate();
    if (selectedCandidats.length === 0)
      return alert("Veuillez sélectionner au moins un candidat.");

    for (const id of selectedCandidats) {
      const membre = candidats.find(c => c.id === id);
      if (!membre) continue;

      await supabase.from("baptemes").insert([{
        ...formData,
        evangelise_member_id: membre.evangelise_member_id || membre.id
      }]);

      await supabase
        .from("membres_complets")
        .update({ bapteme_eau: "Oui", veut_se_faire_baptiser: "Non" })
        .eq("id", id);
    }

    setSelectedCandidats([]);
    setFormData(prev => ({
      ...prev,
      date: "",
      hommes: 0,
      femmes: 0,
      baptise_par: ""
    }));

    fetchRapports();
    setRapportSuccess(true);
    setTimeout(() => setRapportSuccess(false), 3000);
  };

  /* EDIT */
  const handleEdit = (r) => {
    setEditRapport(r);
    setFormData(r);
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleUpdate = async () => {
    await supabase
      .from("baptemes")
      .update({
        date: formData.date,
        hommes: formData.hommes,
        femmes: formData.femmes,
        baptise_par: formData.baptise_par
      })
      .eq("id", editRapport.id);

    setEditRapport(null);
    fetchRapports();
  };

  /* GROUPING */
  const groupByMonth = (data) => {
    const map = {};
    data.forEach(r => {
      const d = new Date(r.date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!map[key]) map[key] = [];
      map[key].push(r);
    });
    return map;
  };

  const grouped = groupByMonth(rapports);

  const sortedMonths = Object.keys(grouped).sort((a, b) => {
    const [yA, mA] = a.split("-").map(Number);
    const [yB, mB] = b.split("-").map(Number);
    return new Date(yB, mB) - new Date(yA, mA);
  });

  const toggleMonth = (key) =>
    setExpandedMonths(prev => ({ ...prev, [key]: !prev[key] }));

  const totalGlobal = rapports.reduce(
    (acc, r) => {
      acc.hommes += Number(r.hommes || 0);
      acc.femmes += Number(r.femmes || 0);
      return acc;
    },
    { hommes: 0, femmes: 0 }
  );

  const formatDateFR = (d) =>
    d ? new Date(d).toLocaleDateString("fr-FR") : "";

  const getMonthName = (i) =>
    [
      "Janvier","Février","Mars","Avril","Mai","Juin",
      "Juillet","Août","Septembre","Octobre","Novembre","Décembre"
    ][i];

  /* UI */
  return (
    <div className="min-h-screen flex flex-col px-4 py-6 bg-[#333699] text-white">
      <HeaderPages />

      <h1 className="text-2xl font-bold text-center mt-4">
        Rapport Baptêmes
      </h1>

      {/* ================= FORMULAIRE (INTACT) ================= */}
      <div className="bg-white/10 p-6 rounded-2xl mt-6 max-w-lg mx-auto">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">

          <input
            type="date"
            value={formData.date}
            onChange={e => setFormData({ ...formData, date: e.target.value })}
            className="input"
          />

          <input
            value={formData.baptise_par}
            onChange={e => setFormData({ ...formData, baptise_par: e.target.value })}
            placeholder="Baptisé par"
            className="input"
          />

          <div className="flex gap-2">
            <input disabled value={formData.hommes} className="input" />
            <input disabled value={formData.femmes} className="input" />
          </div>

          <button className="bg-blue-500 py-2 rounded">
            {editRapport ? "Modifier" : "Ajouter"}
          </button>

          {rapportSuccess && (
            <p className="text-green-400 text-center">OK ajouté</p>
          )}
        </form>
      </div>

      {/* ================= TABLE ================= */}
      <div className="mt-6 hidden md:block">
        {sortedMonths.map(monthKey => (
          <div key={monthKey} className="mb-4">

            <div
              onClick={() => toggleMonth(monthKey)}
              className="bg-white/10 p-3 rounded cursor-pointer flex justify-between"
            >
              <span>
                {getMonthName(monthKey.split("-")[1])} {monthKey.split("-")[0]}
              </span>
              <span>{expandedMonths[monthKey] ? "-" : "+"}</span>
            </div>

            {expandedMonths[monthKey] && (
              grouped[monthKey].map(r => (
                <div key={r.id} className="p-3 border-b border-white/20 flex justify-between">
                  <span>{formatDateFR(r.date)}</span>
                  <span>{r.baptise_par}</span>
                  <span>{r.hommes}</span>
                  <span>{r.femmes}</span>
                  <button onClick={() => handleEdit(r)}>Modifier</button>
                </div>
              ))
            )}
          </div>
        ))}
      </div>

      {/* ================= MOBILE ================= */}
      <div className="md:hidden mt-6">
        {sortedMonths.map(monthKey => (
          <div key={monthKey}>
            <div
              onClick={() => toggleMonth(monthKey)}
              className="bg-white/10 p-3 rounded"
            >
              {monthKey}
            </div>

            {expandedMonths[monthKey] &&
              grouped[monthKey].map(r => (
                <div key={r.id} className="bg-white/10 p-3 mt-2 rounded">
                  <div>{formatDateFR(r.date)}</div>
                  <div>{r.baptise_par}</div>
                  <div>{r.hommes} / {r.femmes}</div>
                  <button onClick={() => handleEdit(r)}>
                    Modifier
                  </button>
                </div>
              ))}
          </div>
        ))}
      </div>

      {/* TOTAL */}
      <div className="mt-4 text-center">
        Total: {totalGlobal.hommes + totalGlobal.femmes}
      </div>

      <Footer />

      <style jsx>{`
        .input {
          padding: 10px;
          border-radius: 10px;
          background: rgba(255,255,255,0.1);
        }
      `}</style>
    </div>
  );
}
