"use client";

import { useState, useEffect } from "react";
import supabase from "../../lib/supabaseClient";
import HeaderPages from "../../components/HeaderPages";
import Footer from "../../components/Footer";
import ProtectedRoute from "../../components/ProtectedRoute";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function RapportPresencePage() {
  return (
    <ProtectedRoute
      allowedRoles={[
        "Administrateur",
        "ResponsableSuivi",
        "SuperviseurCellule",
        "SuperviseurFamille",
        "ResponsableCellule",
        "ResponsableFamille",
      ]}
    >
      <RapportPresence />
    </ProtectedRoute>
  );
}

function RapportPresence() {
  const [userRole, setUserRole] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  const [vue, setVue] = useState("eglise");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");

  const [branches, setBranches] = useState([]);
  const [familles, setFamilles] = useState([]);
  const [cellules, setCellules] = useState([]);

  const [brancheId, setBrancheId] = useState("");
  const [familleId, setFamilleId] = useState("");
  const [celluleId, setCelluleId] = useState("");

  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("evolution");

  useEffect(() => {
    const init = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session?.user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("id, role, eglise_id, branche_id, famille_id, cellule_id")
        .eq("id", sessionData.session.user.id)
        .single();

      setUserProfile(profile);
      setUserRole(profile?.role);

      if (!profile?.eglise_id) return;

      const { data: br } = await supabase
        .from("branches")
        .select("id, nom")
        .eq("eglise_id", profile.eglise_id)
        .order("nom");
      setBranches(br || []);

      const { data: fa } = await supabase
        .from("familles")
        .select("id, nom, branche_id")
        .eq("eglise_id", profile.eglise_id)
        .order("nom");
      setFamilles(fa || []);

      const { data: ce } = await supabase
        .from("cellules")
        .select("id, nom, famille_id, branche_id")
        .eq("eglise_id", profile.eglise_id)
        .order("nom");
      setCellules(ce || []);
    };
    init();
  }, []);

  const famillesFiltrees = brancheId
    ? familles.filter((f) => f.branche_id === brancheId)
    : familles;

  const cellulesFiltrees = familleId
    ? cellules.filter((c) => c.famille_id === familleId)
    : brancheId
    ? cellules.filter((c) => c.branche_id === brancheId)
    : cellules;

  const getVuesAccessibles = () => {
    if (!userRole) return [];
    if (userRole === "Administrateur") return ["eglise", "branche", "famille", "cellule"];
    if (["SuperviseurCellule", "SuperviseurFamille"].includes(userRole))
      return ["branche", "famille", "cellule"];
    if (["ResponsableCellule", "ResponsableFamille"].includes(userRole))
      return ["famille", "cellule"];
    return ["eglise"];
  };

  const vueLabels = {
    eglise: "Église globale",
    branche: "Par branche",
    famille: "Par famille",
    cellule: "Par cellule",
  };

  const fetchRapport = async () => {
    setLoading(true);
    setMessage("⏳ Chargement...");
    setAttendances([]);

    try {
      let query = supabase
        .from("attendance")
        .select("*")
        .order("date", { ascending: true });

      if (userProfile?.eglise_id) {
        query = query.eq("eglise_id", userProfile.eglise_id);
      }

      if (
        ["SuperviseurCellule", "SuperviseurFamille"].includes(userRole) &&
        userProfile?.branche_id
      ) {
        query = query.eq("branche_id", userProfile.branche_id);
      }

      if (
        ["ResponsableCellule", "ResponsableFamille"].includes(userRole) &&
        userProfile?.id
      ) {
        query = query.eq("superviseur_id", userProfile.id);
      }

      if (celluleId) {
        query = query.eq("cellule_id", celluleId);
      } else if (familleId) {
        query = query.eq("famille_id", familleId);
      } else if (brancheId) {
        query = query.eq("branche_id", brancheId);
      }

      if (dateDebut) query = query.gte("date", dateDebut);
      if (dateFin) query = query.lte("date", dateFin);

      const { data, error } = await query;
      if (error) throw error;

      // ✅ POINT 2 — Regroupement par date + numero_culte
      const grouped = {};
      (data || []).forEach((a) => {
        const key = `${a.date}_${a.numero_culte || ""}`;
        if (!grouped[key]) {
          grouped[key] = { ...a };
        } else {
          grouped[key].hommes = (grouped[key].hommes || 0) + (a.hommes || 0);
          grouped[key].femmes = (grouped[key].femmes || 0) + (a.femmes || 0);
        }
      });

      setAttendances(Object.values(grouped));
      setMessage("");
    } catch (err) {
      console.error(err);
      setMessage("❌ Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  // ✅ POINT 1 — Suppression jeunes, enfants, nouveauxVenus
  const totalH = attendances.reduce((s, a) => s + (a.hommes || 0), 0);
  const totalF = attendances.reduce((s, a) => s + (a.femmes || 0), 0);
  const totalPresences = totalH + totalF;

  const labels = attendances.map((a) => {
    const d = new Date(a.date);
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  const lineData = {
    labels,
    datasets: [
      {
        label: "Hommes",
        data: attendances.map((a) => a.hommes || 0),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59,130,246,0.07)",
        tension: 0.4,
        pointRadius: 3,
        borderWidth: 2,
        fill: true,
      },
      {
        label: "Femmes",
        data: attendances.map((a) => a.femmes || 0),
        borderColor: "#ec4899",
        backgroundColor: "rgba(236,72,153,0.07)",
        tension: 0.4,
        pointRadius: 3,
        borderWidth: 2,
        fill: true,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        beginAtZero: false,
        ticks: { color: "#fff", font: { size: 11 } },
        grid: { color: "rgba(255,255,255,0.08)" },
      },
      x: {
        ticks: { color: "#fff", font: { size: 11 }, maxRotation: 45, autoSkip: true, maxTicksLimit: 14 },
        grid: { display: false },
      },
    },
  };

  // ✅ POINT 3 — "Par civilité" au lieu de "Par sexe"
  const civiliteData = {
    labels: ["Hommes", "Femmes"],
    datasets: [
      {
        data: [totalH, totalF],
        backgroundColor: ["#3b82f6", "#ec4899"],
        borderWidth: 0,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: { color: "#fff", font: { size: 11 }, boxWidth: 10, padding: 10 },
      },
    },
  };

  const rows = attendances.map((a, i) => {
    const total = (a.hommes || 0) + (a.femmes || 0);
    const prev = i > 0 ? attendances[i - 1] : null;
    const prevTotal = prev
      ? (prev.hommes || 0) + (prev.femmes || 0)
      : null;
    const pct =
      prevTotal && prevTotal > 0
        ? (((total - prevTotal) / prevTotal) * 100).toFixed(1)
        : null;
    return { ...a, total, pct };
  });

  const vuesAccessibles = getVuesAccessibles();

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />

      <h1 className="text-2xl font-bold mt-4 mb-2 text-center text-white">
        Rapport <span className="text-emerald-300">Présences</span>
      </h1>
      <p className="italic text-sm text-white/80 mb-6 text-center max-w-2xl">
        Suivez l'évolution des présences par église, branche, famille ou cellule.
        Analysez la croissance et les tendances au fil du temps.
      </p>

      {/* FILTRES */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 shadow-lg rounded-xl p-4 md:p-6 w-full max-w-2xl mx-auto text-white mb-6">
        <p className="text-sm font-semibold text-red-400 text-center mb-4">
          Choisissez les paramètres pour générer le rapport
        </p>

        {vuesAccessibles.length > 1 && (
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {vuesAccessibles.map((v) => (
              <button
                key={v}
                onClick={() => {
                  setVue(v);
                  setBrancheId("");
                  setFamilleId("");
                  setCelluleId("");
                }}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${
                  vue === v
                    ? "bg-emerald-400 text-white border-emerald-400"
                    : "border-white/30 text-white/70 hover:border-white"
                }`}
              >
                {vueLabels[v]}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {["branche", "famille", "cellule"].includes(vue) && (
            <div className="flex flex-col">
              <label className="text-sm text-center mb-1">Branche</label>
              <select
                value={brancheId}
                onChange={(e) => {
                  setBrancheId(e.target.value);
                  setFamilleId("");
                  setCelluleId("");
                }}
                className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white"
              >
                <option value="">Toutes les branches</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>{b.nom}</option>
                ))}
              </select>
            </div>
          )}

          {["famille", "cellule"].includes(vue) && (
            <div className="flex flex-col">
              <label className="text-sm text-center mb-1">Famille</label>
              <select
                value={familleId}
                onChange={(e) => {
                  setFamilleId(e.target.value);
                  setCelluleId("");
                }}
                className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white"
              >
                <option value="">Toutes les familles</option>
                {famillesFiltrees.map((f) => (
                  <option key={f.id} value={f.id}>{f.nom}</option>
                ))}
              </select>
            </div>
          )}

          {vue === "cellule" && (
            <div className="flex flex-col">
              <label className="text-sm text-center mb-1">Cellule</label>
              <select
                value={celluleId}
                onChange={(e) => setCelluleId(e.target.value)}
                className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white"
              >
                <option value="">Toutes les cellules</option>
                {cellulesFiltrees.map((c) => (
                  <option key={c.id} value={c.id}>{c.nom}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex flex-col">
            <label className="text-sm text-center mb-1">Date de Début</label>
            <input
              type="date"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
              className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm text-center mb-1">Date de Fin</label>
            <input
              type="date"
              value={dateFin}
              onChange={(e) => setDateFin(e.target.value)}
              className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white"
            />
          </div>
        </div>

        <button
          onClick={fetchRapport}
          disabled={loading}
          className="w-full mt-4 h-10 bg-amber-300 text-white font-semibold rounded-lg hover:bg-amber-400 transition disabled:opacity-60"
        >
          {loading ? "⏳ Chargement..." : "Générer"}
        </button>
      </div>

      {message && <p className="text-white mb-4">{message}</p>}

      {attendances.length > 0 && (
        <div className="w-full max-w-4xl">

          {/* MÉTRIQUES — sans jeunes/enfants/nouveaux */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: "Total présences", value: totalPresences.toLocaleString("fr-FR"), color: "text-white" },
              { label: "Hommes", value: totalH, color: "text-blue-300" },
              { label: "Femmes", value: totalF, color: "text-pink-300" },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                className="bg-white/10 border border-white/20 rounded-xl p-3 text-center text-white"
              >
                <p className="text-xs text-white/60 mb-1">{label}</p>
                <p className={`text-xl font-bold ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* ONGLETS */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {[
              { key: "evolution", label: "Évolution" },
              { key: "repartition", label: "Répartition" },
              { key: "tableau", label: "Tableau détaillé" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${
                  activeTab === key
                    ? "bg-white text-[#333699] border-white"
                    : "border-white/30 text-white/70 hover:border-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* TAB ÉVOLUTION */}
          {activeTab === "evolution" && (
            <div className="bg-white/10 border border-white/20 rounded-xl p-4">
              <p className="text-white font-semibold mb-3">Évolution des présences</p>
              <div className="flex flex-wrap gap-3 mb-3 text-xs text-white/70">
                {[
                  ["Hommes", "#3b82f6"],
                  ["Femmes", "#ec4899"],
                ].map(([l, c]) => (
                  <span key={l} className="flex items-center gap-1">
                    <span style={{ background: c }} className="w-3 h-3 rounded-sm inline-block"></span>
                    {l}
                  </span>
                ))}
              </div>
              <div style={{ height: 280 }}>
                <Line data={lineData} options={lineOptions} />
              </div>
            </div>
          )}

          {/* TAB RÉPARTITION — ✅ POINT 3 : "Par civilité" uniquement */}
          {activeTab === "repartition" && (
            <div className="flex justify-center">
              <div className="bg-white/10 border border-white/20 rounded-xl p-4 w-full max-w-sm">
                <p className="text-white font-semibold mb-3">Par civilité</p>
                <div style={{ height: 200 }}>
                  <Doughnut data={civiliteData} options={doughnutOptions} />
                </div>
              </div>
            </div>
          )}

          {/* TAB TABLEAU DÉTAILLÉ */}
          {activeTab === "tableau" && (
            <div className="overflow-x-auto rounded-xl border border-white/20">
              <table className="w-full text-sm text-white text-left">
                <thead>
                  <tr className="bg-white/10 text-xs uppercase">
                    <th className="px-3 py-2 text-white/60">Date</th>
                    <th className="px-3 py-2 text-white/60">Culte #</th>
                    <th className="px-3 py-2 text-blue-300">H</th>
                    <th className="px-3 py-2 text-pink-300">F</th>
                    <th className="px-3 py-2 text-orange-400">Total</th>
                    <th className="px-3 py-2 text-white/60">Évolution</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((a) => {
                    const pctNum = parseFloat(a.pct);
                    const pctColor =
                      pctNum > 0
                        ? "#4ade80"
                        : pctNum < 0
                        ? "#f87171"
                        : "rgba(255,255,255,0.4)";

                    return (
                      <tr key={a.id} className="border-t border-white/10 hover:bg-white/5">
                        <td className="px-3 py-2">
                          {new Date(a.date).toLocaleDateString("fr-FR")}
                        </td>
                        <td className="px-3 py-2">{a.numero_culte || ""}</td>
                        <td className="px-3 py-2 text-blue-300">{a.hommes || ""}</td>
                        <td className="px-3 py-2 text-pink-300">{a.femmes || ""}</td>
                        <td className="px-3 py-2 text-orange-400 font-semibold">{a.total || ""}</td>
                        <td className="px-3 py-2">
                          {a.pct !== null ? (
                            <span style={{ color: pctColor, fontWeight: 500 }}>
                              {pctNum > 0 ? "+" : ""}{a.pct}%
                            </span>
                          ) : ""}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <Footer />
    </div>
  );
}
