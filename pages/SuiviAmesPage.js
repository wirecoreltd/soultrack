"use client";

import { useEffect, useState, useMemo } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import Footer from "../components/Footer";
import ProtectedRoute from "../components/ProtectedRoute";

export default function SuiviAmesPageWrapper() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "Responsable"]}>
      <SuiviAmesPage />
    </ProtectedRoute>
  );
}

function SuiviAmesPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState({});
  const [egliseId, setEgliseId] = useState(null);
  const [brancheId, setBrancheId] = useState(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  // ================= PROFIL =================
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("eglise_id, branche_id")
        .eq("id", user.id)
        .single();

      if (profile) {
        setEgliseId(profile.eglise_id);
        setBrancheId(profile.branche_id);
      }
    };

    fetchProfile();
  }, []);

  // ================= FETCH =================
  useEffect(() => {
    if (!egliseId || !brancheId) return;

    const fetchData = async () => {
      setLoading(true);

      const { data: evangelises } = await supabase
        .from("evangelises")
        .select("*")
        .eq("eglise_id", egliseId)
        .eq("branche_id", brancheId);

      const { data: suivis } = await supabase
        .from("suivis_des_evangelises")
        .select("*")
        .eq("eglise_id", egliseId)
        .eq("branche_id", brancheId);

      const { data: membres } = await supabase
        .from("membres_complets")
        .select("*")
        .eq("eglise_id", egliseId)
        .eq("branche_id", brancheId);

      // MAP
      const map = {};
      evangelises.forEach((e) => {
        map[e.id] = { ...e, suivis: [] };
      });

      suivis.forEach((s) => {
        if (map[s.evangelise_id]) {
          map[s.evangelise_id].suivis.push(s);
        }
      });

      const membresMap = {};
      membres.forEach((m) => {
        membresMap[String(m.evangelise_member_id)] = m;
      });

      // FINAL DATA + SCORING
      const finalData = Object.values(map).map((p) => {
        const membre = membresMap[p.id];

        const sortedSuivis = p.suivis.sort(
          (a, b) => new Date(b.date_suivi) - new Date(a.date_suivi)
        );

        const lastSuivi = sortedSuivis[0];

        const dateRef = lastSuivi?.date_suivi || p.created_at;

        const joursSansSuivi = Math.floor(
          (new Date() - new Date(dateRef)) / (1000 * 60 * 60 * 24)
        );

        // ===== SCORING =====
        let score = 100;

        if (p.status_suivi === "Non envoyé") score -= 40;

        if (joursSansSuivi > 7) score -= 25;
        else if (joursSansSuivi > 3) score -= 10;

        if (!membre?.integration_fini) score -= 15;
        if (!membre?.bapteme_eau) score -= 10;
        if (!membre?.Ministere && !membre?.Autre_Ministere) score -= 10;

        if (joursSansSuivi <= 3) score += 10;
        if (membre?.integration_fini) score += 10;

        score = Math.max(0, Math.min(100, score));

        let couleur = "bg-green-100";
        if (score <= 30) couleur = "bg-red-200";
        else if (score <= 60) couleur = "bg-orange-200";
        else if (score <= 80) couleur = "bg-yellow-100";

        return {
          ...p,
          membre,
          lastSuivi,
          sortedSuivis,
          joursSansSuivi,
          score,
          couleur,
        };
      });

      setData(finalData);
      setLoading(false);
    };

    fetchData();
  }, [egliseId, brancheId]);

  // ================= FILTER + SEARCH =================
  const filteredData = useMemo(() => {
    let d = [...data];

    if (filter === "URGENT") d = d.filter((p) => p.score <= 30);
    if (filter === "STABLE") d = d.filter((p) => p.score > 80);

    if (search) {
      d = d.filter((p) =>
        `${p.prenom} ${p.nom}`.toLowerCase().includes(search.toLowerCase())
      );
    }

    // TRI URGENCE
    d.sort((a, b) => a.score - b.score);

    return d;
  }, [data, search, filter]);

  const toggle = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // ================= UI =================
  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />

      <h1 className="text-3xl font-bold text-white text-center mt-4">
        De l’Évangélisation à l’Intégration
      </h1>

      {/* FILTERS */}
      <div className="flex gap-3 my-4 flex-wrap justify-center">
        <input
          placeholder="Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 rounded"
        />

        <button onClick={() => setFilter("ALL")} className="bg-white px-3 py-1 rounded">
          Tous
        </button>

        <button onClick={() => setFilter("URGENT")} className="bg-red-300 px-3 py-1 rounded">
          Urgents
        </button>

        <button onClick={() => setFilter("STABLE")} className="bg-green-300 px-3 py-1 rounded">
          Stables
        </button>
      </div>

      {/* TABLE */}
      <div className="w-full overflow-x-auto bg-white rounded-xl">
        <table className="w-full text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th>Nom</th>
              <th>Statut</th>
              <th>Score</th>
              <th>Jours</th>
              <th>Évangélisé</th>
              <th>Envoyé</th>
              <th>Suivi</th>
              <th>Intégré</th>
              <th>Baptême</th>
              <th>Ministère</th>
              <th>Besoin</th>
              <th>Responsable</th>
            </tr>
          </thead>

          <tbody>
            {filteredData.map((p) => {
              const dateIntegre = p.sortedSuivis?.find(
                (s) => s.status_suivis_evangelises === "Intégré"
              )?.date_suivi;

              return (
                <>
                  <tr
                    key={p.id}
                    className={`border-t cursor-pointer ${p.couleur}`}
                    onClick={() => toggle(p.id)}
                  >
                    <td>{p.prenom} {p.nom}</td>
                    <td>{p.status_suivi}</td>
                    <td className="font-bold">{p.score}</td>
                    <td>{p.joursSansSuivi}</td>
                    <td>{new Date(p.created_at).toLocaleDateString()}</td>
                    <td>{p.membre?.date_envoi_suivi ? new Date(p.membre.date_envoi_suivi).toLocaleDateString() : "-"}</td>
                    <td>{p.lastSuivi?.date_suivi ? new Date(p.lastSuivi.date_suivi).toLocaleDateString() : "-"}</td>
                    <td>{dateIntegre ? new Date(dateIntegre).toLocaleDateString() : "-"}</td>
                    <td>{p.membre?.bapteme_eau || "-"}</td>
                    <td>{p.membre?.Ministere || "-"}</td>
                    <td>{p.lastSuivi?.besoin || "-"}</td>
                    <td>{p.membre?.suivi_responsable || "-"}</td>
                  </tr>

                  {expanded[p.id] && (
                    <tr className="bg-gray-50">
                      <td colSpan="12" className="p-3">
                        <b>Historique des suivis :</b>
                        <ul className="mt-2">
                          {p.sortedSuivis.map((s) => (
                            <li key={s.id}>
                              {new Date(s.date_suivi).toLocaleDateString()} — {s.status_suivis_evangelises}
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>

      <Footer />
    </div>
  );
}
