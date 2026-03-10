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

  const [superviseur, setSuperviseur] = useState({ eglise_id: null, branche_id: null });

  const [formData, setFormData] = useState({
    date: "",
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

  const [statsHub, setStatsHub] = useState({
    totalMembres: 0,
    etatContact: { nouveau: 0, existant: 0 },
    venu: { reseaux: 0, invite: 0, evangelisation: 0 },
    priereConversion: { priere: 0, conversion: 0, reconciliation: 0 },
    trancheAge: {
      "12-17 ans": 0,
      "18-25 ans": 0,
      "26-30 ans": 0,
      "31-40 ans": 0,
      "41-55 ans": 0,
      "56-69 ans": 0,
      "70 ans et plus": 0,
    },
  });

  const borderColors = ["border-red-500","border-green-500","border-blue-500","border-yellow-500","border-purple-500","border-pink-500","border-indigo-500"];

  useEffect(() => {
    const loadSuperviseur = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("eglise_id, branche_id")
        .eq("id", user.id)
        .single();

      if (error) console.error("Erreur fetch superviseur :", error);
      else setSuperviseur({ eglise_id: data.eglise_id, branche_id: data.branche_id });
    };
    loadSuperviseur();
  }, []);

  const fetchRapports = async () => {
    if (!superviseur.eglise_id || !superviseur.branche_id) return;

    setLoading(true);
    setShowTable(false);

    let query = supabase
      .from("attendance")
      .select("*")
      .eq("eglise_id", superviseur.eglise_id)
      .eq("branche_id", superviseur.branche_id);

    if (dateDebut) query = query.gte("date", dateDebut);
    if (dateFin) query = query.lte("date", dateFin);

    query = query.order("date", { ascending: true }).order("numero_culte", { ascending: true });

    const { data, error } = await query;
    if (error) console.error("❌ Erreur fetch:", error);
    else setReports(data || []);

    setLoading(false);
    setShowTable(true);

    computeStatsHub();
  };

  const computeStatsHub = async () => {
    // Récupère les membres de la branche
    const { data: membres } = await supabase
      .from("membres_complets")
      .select("*")
      .eq("branche_id", superviseur.branche_id)
      .gte("created_at", dateDebut || "1900-01-01")
      .lte("created_at", dateFin || new Date().toISOString());

    if (!membres) return;

    // État contact
    const etatContact = {
      nouveau: membres.filter(m => m.etat_contact === "nouveau").length,
      existant: membres.filter(m => m.etat_contact !== "nouveau").length,
    };

    // Venu par réseaux / invité / évangélisation
    const venu = {
      reseaux: membres.filter(m => m.venu === "réseaux").length,
      invite: membres.filter(m => m.venu === "invité").length,
      evangelisation: membres.filter(m => m.venu === "evangélisation").length,
    };

    // Prières / conversion / réconciliation
    const priereConversion = {
      priere: membres.filter(m => m.priere_salut === "Oui").length,
      conversion: membres.filter(m => m.type_conversion === "Nouveau converti").length,
      reconciliation: membres.filter(m => m.type_conversion === "Réconciliation").length,
    };

    // Tranche d’âge
    const trancheAge = {
      "12-17 ans": membres.filter(m => m.age === "12-17 ans").length,
      "18-25 ans": membres.filter(m => m.age === "18-25 ans").length,
      "26-30 ans": membres.filter(m => m.age === "26-30 ans").length,
      "31-40 ans": membres.filter(m => m.age === "31-40 ans").length,
      "41-55 ans": membres.filter(m => m.age === "41-55 ans").length,
      "56-69 ans": membres.filter(m => m.age === "56-69 ans").length,
      "70 ans et plus": membres.filter(m => m.age === "70 ans et plus").length,
    };

    setStatsHub({
      totalMembres: membres.length,
      etatContact,
      venu,
      priereConversion,
      trancheAge,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("⏳ Enregistrement en cours...");

    try {
      const rapportAvecEglise = {
        ...formData,
        eglise_id: superviseur.eglise_id,
        branche_id: superviseur.branche_id,
      };

      if (editId) {
        const { error } = await supabase
          .from("attendance")
          .update(rapportAvecEglise)
          .eq("id", editId);
        if (error) throw error;
        setMessage("✅ Rapport mis à jour !");
      } else {
        const { error } = await supabase
          .from("attendance")
          .insert([rapportAvecEglise]);
        if (error) throw error;
        setMessage("✅ Rapport ajouté !");
      }

      setTimeout(() => setMessage(""), 3000);
      setFormData({
        date: "",
        numero_culte: 1,
        hommes: 0,
        femmes: 0,
        jeunes: 0,
        enfants: 0,
        connectes: 0,
        nouveauxVenus: 0,
        nouveauxConvertis: 0,
      });
      setEditId(null);
      setShowTable(false);
      fetchRapports();
    } catch (err) {
      console.error(err);
      setMessage("❌ " + err.message);
    }
  };

  const handleEdit = (report) => {
    setEditId(report.id);
    setFormData({
      date: report.date,
      numero_culte: report.numero_culte || 1,
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

  const handleDelete = async (id) => {
    if (!confirm("Voulez-vous vraiment supprimer ce rapport ?")) return;
    const { error } = await supabase.from("attendance").delete().eq("id", id);
    if (error) console.error("❌ Erreur delete:", error);
    else fetchRapports();
  };

  const formatDateFR = (d) => {
    const dateObj = new Date(d);
    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />

      <h1 className="text-2xl font-bold mt-4 mb-6 text-center">
        <span className="text-white">Rapport </span>
        <span className="text-amber-300">Présence & Hub</span>
      </h1>

      {/* FORMULAIRE RAPPORT */}
      <div className="max-w-3xl w-full bg-white/10 rounded-3xl p-6 shadow-lg mb-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[ 
            { label: "Date", name: "date", type: "date" },
            { label: "Numéro de culte", name: "numero_culte", type: "select" },
            { label: "Hommes", name: "hommes", type: "number" },
            { label: "Femmes", name: "femmes", type: "number" },
            { label: "Jeunes", name: "jeunes", type: "number" },
            { label: "Enfants", name: "enfants", type: "number" },
            { label: "Connectés", name: "connectes", type: "number" },
            { label: "Nouveaux venus", name: "nouveauxVenus", type: "number" },
            { label: "Nouveaux convertis", name: "nouveauxConvertis", type: "number" },
          ].map((field) => (
            <div key={field.name} className="flex flex-col">
              <label htmlFor={field.name} className="font-medium mb-1 text-white">{field.label}</label>
              {field.type === "select" ? (
                <select
                  name={field.name}
                  id={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  className="input bg-white/20 text-white placeholder-white"
                >
                  {[1,2,3,4,5,6,7].map((n) => (
                    <option key={n} value={n}>{n} {n===1 ? "er" : "ème"} Culte</option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type}
                  name={field.name}
                  id={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  className="input bg-white/20 text-white placeholder-white"
                  required={field.type === "date"}
                />
              )}
            </div>
          ))}
          <button
            type="submit"
            className="col-span-1 md:col-span-2 bg-gradient-to-r from-blue-400 to-indigo-500 text-white font-bold py-3 rounded-2xl shadow-md hover:from-blue-500 hover:to-indigo-600 transition-all"
          >
            {editId ? "Mettre à jour" : "Ajouter le rapport"}
          </button>
        </form>
        {message && <p className="mt-4 text-center font-medium text-white">{message}</p>}
      </div>

      {/* CARTES HUB */}
      <div className="max-w-5xl w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* Total membres */}
        <div className="bg-white/10 p-4 rounded-xl shadow-md border-l-4 border-green-400">
          <h2 className="text-lg font-bold mb-2">Total membres dans le hub</h2>
          <p className="text-2xl font-semibold">{statsHub.totalMembres}</p>
          <p>Nouveau: {statsHub.etatContact.nouveau} | Existant: {statsHub.etatContact.existant}</p>
        </div>

        {/* Venu par */}
        <div className="bg-white/10 p-4 rounded-xl shadow-md border-l-4 border-blue-400">
          <h2 className="text-lg font-bold mb-2">Venu par</h2>
          <p>Réseaux: {statsHub.venu.reseaux}</p>
          <p>Invité: {statsHub.venu.invite}</p>
          <p>Évangélisation: {statsHub.venu.evangelisation}</p>
        </div>

        {/* Prières / Conversion */}
        <div className="bg-white/10 p-4 rounded-xl shadow-md border-l-4 border-yellow-400">
          <h2 className="text-lg font-bold mb-2">Suivi spirituel</h2>
          <p>Prières du salut: {statsHub.priereConversion.priere}</p>
          <p>Conversion: {statsHub.priereConversion.conversion}</p>
          <p>Réconciliation: {statsHub.priereConversion.reconciliation}</p>
        </div>

        {/* Tranches d'âge */}
        <div className="bg-white/10 p-4 rounded-xl shadow-md border-l-4 border-purple-400 col-span-1 sm:col-span-2 lg:col-span-3">
          <h2 className="text-lg font-bold mb-2">Tranche d’âge</h2>
          <ul className="list-disc list-inside">
            {Object.entries(statsHub.trancheAge).map(([age, count]) => (
              <li key={age}>{age}: {count}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* TABLEAU PRESENCE */}
      {showTable && (
        <div className="max-w-5xl w-full overflow-x-auto mt-6 mb-6">
          {/* ... ton tableau actuel ... */}
        </div>
      )}

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
