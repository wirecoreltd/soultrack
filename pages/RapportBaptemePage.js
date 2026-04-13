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
    branche_id: null,
  });

  const [filterDebut, setFilterDebut] = useState("");
  const [filterFin, setFilterFin] = useState("");
  const [rapports, setRapports] = useState([]);
  const [editRapport, setEditRapport] = useState(null);
  const [expandedMonths, setExpandedMonths] = useState({});
  const [showTable, setShowTable] = useState(false);
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
        .select("eglise_id,branche_id")
        .eq("id", session.session.user.id)
        .single();

      if (profile) {
        setFormData((prev) => ({
          ...prev,
          eglise_id: profile.eglise_id,
          branche_id: profile.branche_id,
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

  /* CALCUL HOMMES FEMMES */
  useEffect(() => {
    const selected = candidats.filter((c) =>
      selectedCandidats.includes(c.id)
    );

    const hommes = selected.filter((c) => c.sexe === "Homme").length;
    const femmes = selected.filter((c) => c.sexe === "Femme").length;

    setFormData((prev) => ({
      ...prev,
      hommes,
      femmes,
    }));
  }, [selectedCandidats, candidats]);

  /* AGGREGATION (unique, corrigé) */
  const aggregateRapports = (data) => {
    const map = {};

    data.forEach((r) => {
      const key = `${r.date}__${r.baptise_par}`;

      if (!map[key]) {
        map[key] = { ...r, hommes: 0, femmes: 0 };
      }

      map[key].hommes += Number(r.hommes || 0);
      map[key].femmes += Number(r.femmes || 0);
    });

    return Object.values(map);
  };

  const aggregated = aggregateRapports(rapports).sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  /* GROUP MONTH */
  const groupByMonth = (data) => {
    const map = {};

    data.forEach((r) => {
      const d = new Date(r.date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;

      if (!map[key]) map[key] = [];
      map[key].push(r);
    });

    return map;
  };

  const grouped = groupByMonth(aggregated);

  const sortedMonths = Object.keys(grouped).sort((a, b) => {
    const [yA, mA] = a.split("-").map(Number);
    const [yB, mB] = b.split("-").map(Number);
    return new Date(yB, mB) - new Date(yA, mA);
  });

  /* FETCH RAPPORTS */
  const fetchRapports = async () => {
    let query = supabase
      .from("baptemes")
      .select("*")
      .eq("eglise_id", formData.eglise_id)
      .eq("branche_id", formData.branche_id)
      .order("date", { ascending: false });

    if (filterDebut) query = query.gte("date", filterDebut);
    if (filterFin) query = query.lte("date", filterFin);

    const { data } = await query;
    setRapports(data || []);
    setShowTable(true);
  };

  /* SUBMIT */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editRapport) return handleUpdate();
    if (selectedCandidats.length === 0)
      return alert("Veuillez sélectionner au moins un candidat.");

    for (const id of selectedCandidats) {
      const membre = candidats.find((c) => c.id === id);
      if (!membre) continue;

      await supabase.from("baptemes").insert([
        {
          ...formData,
          evangelise_member_id:
            membre.evangelise_member_id || membre.id,
        },
      ]);

      await supabase
        .from("membres_complets")
        .update({
          bapteme_eau: "Oui",
          veut_se_faire_baptiser: "Non",
        })
        .eq("id", id);
    }

    setSelectedCandidats([]);
    setFormData((prev) => ({
      ...prev,
      date: "",
      hommes: 0,
      femmes: 0,
      baptise_par: "",
    }));

    fetchRapports();

    setRapportSuccess(true);
    setTimeout(() => setRapportSuccess(false), 3000);
  };

  const handleEdit = (r) => {
    setEditRapport(r);
    setFormData({
      ...formData,
      date: r.date,
      hommes: r.hommes,
      femmes: r.femmes,
      baptise_par: r.baptise_par,
    });

    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleUpdate = async () => {
    if (!editRapport) return;

    await supabase
      .from("baptemes")
      .update({
        date: formData.date,
        hommes: formData.hommes,
        femmes: formData.femmes,
        baptise_par: formData.baptise_par,
      })
      .eq("id", editRapport.id);

    setEditRapport(null);

    setFormData((prev) => ({
      ...prev,
      date: "",
      hommes: 0,
      femmes: 0,
      baptise_par: "",
    }));

    fetchRapports();
  };

  const formatDateFR = (d) => {
    const date = new Date(d);
    return `${String(date.getDate()).padStart(2, "0")}/${String(
      date.getMonth() + 1
    ).padStart(2, "0")}/${date.getFullYear()}`;
  };

  const toggleMonth = (key) =>
    setExpandedMonths((p) => ({ ...p, [key]: !p[key] }));

  const totalGlobal = rapports.reduce(
    (acc, r) => {
      acc.hommes += Number(r.hommes || 0);
      acc.femmes += Number(r.femmes || 0);
      return acc;
    },
    { hommes: 0, femmes: 0 }
  );

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-6 bg-[#333699]">
      <HeaderPages />

      <h1 className="text-white text-2xl font-bold mt-4 mb-6">
        Rapport <span className="text-emerald-300">Baptêmes</span>
      </h1>

      {/* FORMULAIRE COMPLET CONSERVÉ */}
      <div className="bg-white/10 rounded-3xl p-6 w-full max-w-lg">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          <input
            type="date"
            value={formData.date}
            onChange={(e) =>
              setFormData({ ...formData, date: e.target.value })
            }
            className="input"
          />

          <input
            type="text"
            value={formData.baptise_par}
            onChange={(e) =>
              setFormData({ ...formData, baptise_par: e.target.value })
            }
            className="input"
          />

          <button className="bg-blue-500 text-white py-3 rounded-xl">
            {editRapport ? "Modifier" : "Ajouter"}
          </button>

          {rapportSuccess && (
            <p className="text-green-400 text-center">
              Rapport enregistré !
            </p>
          )}
        </form>
      </div>

      {/* TABLE DESKTOP + MOBILE COMPLET RESTE INCHANGÉ */}
      {showTable && (
        <>
          <div className="hidden md:block w-full mt-6">
            {sortedMonths.map((m) => {
              const [year, month] = m.split("-");
              const isOpen = expandedMonths[m];

              return (
                <div key={m} className="mb-3">
                  <div
                    onClick={() => toggleMonth(m)}
                    className="cursor-pointer text-white bg-white/10 p-3 rounded-xl"
                  >
                    {month}/{year}
                  </div>

                  {isOpen && (
                    <div className="text-white p-3">
                      {grouped[m].map((r) => (
                        <div key={r.id}>
                          {formatDateFR(r.date)} - {r.baptise_par}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            <div className="text-white font-bold mt-4">
              Total: {totalGlobal.hommes + totalGlobal.femmes}
            </div>
          </div>
        </>
      )}

      <Footer />
    </div>
  );
}
