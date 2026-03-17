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

  // ================= FETCH PROFIL =================
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

  // ================= FETCH DATA =================
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

      const { data: statsMin } = await supabase
        .from("stats_ministere_besoin")
        .select("*")
        .eq("eglise_id", egliseId)
        .eq("branche_id", brancheId);

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, prenom, nom");

      // MAP EVANGELISES + SUIVIS
      const map = {};
      evangelises.forEach((e) => {
        map[e.id] = { ...e, suivis: [] };
      });
      suivis.forEach((s) => {
        if (map[s.evangelise_id]) map[s.evangelise_id].suivis.push(s);
      });

      const membresMap = {};
      membres.forEach((m) => { membresMap[String(m.evangelise_member_id)] = m; });

      const statsMinMap = {};
      statsMin.forEach((s) => { statsMinMap[s.membre_id] = s.created_at; });

      const profilesMap = {};
      profiles.forEach((p) => { profilesMap[p.id] = p.prenom + " " + p.nom; });

      const finalData = Object.values(map).map((p) => {
        const membre = membresMap[p.id];
        const sortedSuivis = p.suivis.sort((a, b) => new Date(b.date_suivi) - new Date(a.date_suivi));
        const lastSuivi = sortedSuivis[0];
        const dateRef = lastSuivi?.date_suivi || p.created_at;
        const joursSansSuivi = Math.floor((new Date() - new Date(dateRef)) / (1000 * 60 * 60 * 24));

        // SCORING
        let score = 100;
        if (p.status_suivi === "Non envoyé") score -= 40;
        if (joursSansSuivi > 7) score -= 25;
        else if (joursSansSuivi > 3) score -= 10;
        if (!membre?.integration_fini) score -= 15;
        if (!membre?.bapteme_eau) score -= 10;
        if (!membre?.star) score -= 10;
        if (joursSansSuivi <= 3) score += 10;
        if (membre?.integration_fini) score += 10;
        score = Math.max(0, Math.min(100, score));

        let couleur = "border-gray-500";
        if (score <= 30) couleur = "border-red-500 animate-pulse";
        else if (score <= 60) couleur = "border-orange-400";
        else if (score <= 80) couleur = "border-yellow-300";
        else couleur = "border-green-400";

        // RESPONSABLE
        let responsable = "-";
        if (membre?.integration_fini) {
          if (membre.conseiller_id) responsable = profilesMap[membre.conseiller_id] || "-";
          else if (membre.cellule_id) responsable = profilesMap[membre.cellule_id] || "-";
        } else {
          if (lastSuivi?.conseiller_id) responsable = profilesMap[lastSuivi.conseiller_id] || "-";
          else if (lastSuivi?.cellule_id) responsable = profilesMap[lastSuivi.cellule_id] || "-";
        }

        const debutMinistere = statsMinMap[p.id] ? new Date(statsMinMap[p.id]).toLocaleDateString() : "-";

        return { ...p, membre, sortedSuivis, lastSuivi, joursSansSuivi, score, couleur, responsable, debutMinistere };
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
      d = d.filter((p) => `${p.prenom} ${p.nom}`.toLowerCase().includes(search.toLowerCase()));
    }
    d.sort((a, b) => a.score - b.score);
    return d;
  }, [data, search, filter]);

  const toggle = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  // ================= UI =================
  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-6" style={{ background: "#333699" }}>
      <HeaderPages />
      <h1 className="text-2xl md:text-3xl font-bold text-white mt-4 mb-4">De l’Évangélisation à l’Intégration</h1>

      {/* FILTRES + RECHERCHE */}
      <div className="flex flex-wrap gap-2 md:gap-3 justify-center mb-4">
        <input
          placeholder="Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 rounded flex-1 md:flex-initial min-w-[200px]"
        />
        <button onClick={() => setFilter("ALL")} className="bg-white px-3 py-1 rounded">Tous</button>
        <button onClick={() => setFilter("URGENT")} className="bg-red-300 px-3 py-1 rounded">Urgents</button>
        <button onClick={() => setFilter("STABLE")} className="bg-green-300 px-3 py-1 rounded">Stables</button>
      </div>

      {/* TABLE */}
      <div className="w-full overflow-x-auto">
        <div className="min-w-[1000px] space-y-2">
          {/* HEADER */}
          <div className="hidden sm:flex text-sm font-semibold uppercase text-white px-2 py-1 border-b border-gray-400 bg-transparent">
            <div className="flex-[2]">Nom complet</div>
            <div className="flex-[1]">Statut</div>
            <div className="flex-[1]">Jours</div>
            <div className="flex-[1]">Évangélisé</div>
            <div className="flex-[1]">Envoyé au</div>
            <div className="flex-[1]">Status Suivi</div>
            <div className="flex-[1]">Intégré</div>
            <div className="flex-[1]">Date intégration</div>
            <div className="flex-[1]">Baptisé le</div>
            <div className="flex-[1]">Début Ministère</div>
            <div className="flex-[1]">Suivis par</div>
          </div>

          {filteredData.map((p) => (
            <div key={p.id}>
              {/* ROW PRINCIPALE */}
              <div
                className={`flex flex-col sm:flex-row items-start sm:items-center px-2 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition duration-150 gap-2 border-l-4 ${p.couleur} cursor-pointer`}
                onClick={() => toggle(p.id)}
              >
                {p.score <= 30 && <span className="text-red-500 font-bold animate-pulse mb-1 sm:mb-0">🔴 URGENT</span>}
                <div className="flex-[2] text-white">{p.prenom} {p.nom}</div>
                <div className="flex-[1] text-white">{p.status_suivi || "-"}</div>
                <div className="flex-[1] text-white">{p.joursSansSuivi}</div>
                <div className="flex-[1] text-white">{new Date(p.created_at).toLocaleDateString()}</div>
                <div className="flex-[1] text-white">{p.lastSuivi?.date_suivi ? new Date(p.lastSuivi.date_suivi).toLocaleDateString() : "-"}</div>
                <div className="flex-[1] text-white">{p.lastSuivi?.status_suivis_evangelises || "-"}</div>
                <div className="flex-[1] text-white">{p.membre?.integration_fini ? "Oui" : "-"}</div>
                <div className="flex-[1] text-white">{p.membre?.created_at ? new Date(p.membre.created_at).toLocaleDateString() : "-"}</div>
                <div className="flex-[1] text-white">{p.membre?.bapteme_eau ? new Date(p.membre?.bapteme_date).toLocaleDateString() : "-"}</div>
                <div className="flex-[1] text-white">{p.debutMinistere}</div>
                <div className="flex-[1] text-white">{p.responsable}</div>
              </div>

              {/* HISTORIQUE SUIVIS */}
              {expanded[p.id] && (
                <div className="bg-white/10 rounded-lg p-3 ml-0 sm:ml-4 mt-1">
                  <b className="text-white">Historique des suivis :</b>
                  <ul className="mt-2 text-white list-disc list-inside">
                    {p.sortedSuivis.map((s) => (
                      <li key={s.id}>
                        {new Date(s.date_suivi).toLocaleDateString()} — {s.status_suivis_evangelises}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {loading && <p className="text-white mt-4">Chargement...</p>}
      <Footer />
    </div>
  );
}
