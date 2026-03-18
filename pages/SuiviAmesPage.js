import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation"; 
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
  const searchParams = useSearchParams(); 
  const statusQuery = searchParams?.get("status"); 
  const celluleQuery = searchParams?.get("cellule");
  const conseillerQuery = searchParams?.get("conseiller");

  // ================= PROFILE =================
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

  // ================= DATA =================
  useEffect(() => {
    if (!egliseId || !brancheId) return;

    const fetchData = async () => {
      setLoading(true);

      const { data: evangelises } = await supabase
        .from("evangelises")
        .select("*")
        .eq("eglise_id", egliseId)
        .eq("branche_id", brancheId);
      
      const { data: baptemes } = await supabase.from("baptemes").select("*");
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
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, prenom, nom");
      const { data: cellules } = await supabase
        .from("cellules")
        .select("id, cellule_full");
      const { data: ministeres } = await supabase.from("stats_ministere_besoin").select("*");

      // ================= MAPS =================
      const map = {};
      evangelises.forEach((e) => { map[e.id] = { ...e, suivis: [] }; });
      suivis.forEach((s) => { if (map[s.evangelise_id]) map[s.evangelise_id].suivis.push(s); });

      const membresMap = {};
      membres.forEach((m) => { membresMap[String(m.evangelise_member_id)] = m; });

      const profilesMap = {};
      profiles.forEach((p) => { profilesMap[p.id] = p.prenom + " " + p.nom; });

      const cellulesMap = {};
      cellules.forEach((c) => { cellulesMap[c.id] = c.cellule_full; });

      const ministereMap = {};
      ministeres.forEach((m) => { ministereMap[m.membre_id] = m.created_at; });

      const baptemeMap = {};        
      baptemes.forEach((b) => { baptemeMap[String(b.evangelise_member_id)] = b.date; });     

      // ================= FINAL DATA =================
      const finalData = Object.values(map).map((p) => {
        const membre = membresMap[p.id];
        const sortedSuivis = p.suivis.sort((a, b) => new Date(b.date_suivi) - new Date(a.date_suivi));
        const lastSuivi = sortedSuivis[0];
        const dateRef = lastSuivi?.date_suivi || p.created_at;

        const joursSansSuivi = Math.floor((new Date() - new Date(dateRef)) / (1000 * 60 * 60 * 24));

        let score = 100;
        if (p.status_suivi === "Non envoyé") score -= 40;
        if (joursSansSuivi > 7) score -= 25;
        else if (joursSansSuivi > 3) score -= 10;
        if (!membre?.bapteme_date) score -= 10;
        if (!membre?.star) score -= 10;
        if (joursSansSuivi <= 3) score += 10;
        score = Math.max(0, Math.min(100, score));

        let couleur = "border-gray-500";
        if (score <= 30) couleur = "border-red-500 animate-pulse";
        else if (score <= 60) couleur = "border-orange-400";
        else if (score <= 80) couleur = "border-yellow-300";
        else couleur = "border-green-400";

        let responsable = "-";
        if (membre) {
          if (membre.conseiller_id) responsable = profilesMap[membre.conseiller_id] || "-";
          else if (membre.cellule_id) responsable = cellulesMap[membre.cellule_id] || "-";
        } else if (lastSuivi) {
          if (lastSuivi.conseiller_id) responsable = profilesMap[lastSuivi.conseiller_id] || "-";
          else if (lastSuivi.cellule_id) responsable = cellulesMap[lastSuivi.cellule_id] || "-";
        }

        return {
          ...p,
          membre,
          sortedSuivis,
          lastSuivi,
          joursSansSuivi,
          score,
          couleur,
          responsable,
          debutMinistere: membre ? ministereMap[membre.id] : null,
          dateBapteme: baptemeMap[String(p.id)],
        };
      });     

      setData(finalData);
      setLoading(false);
    };

    fetchData();
  }, [egliseId, brancheId]);  

  // ================= FILTERED DATA =================
  const filteredData = useMemo(() => {
    let d = [...data];

    // Filtre score
    if (filter === "URGENT") d = d.filter((p) => p.score <= 30);
    if (filter === "STABLE") d = d.filter((p) => p.score > 80);

    // Filtre recherche
    if (search) {
      d = d.filter((p) =>
        `${p.prenom} ${p.nom}`.toLowerCase().includes(search.toLowerCase())
      );
    }

    // FILTRE STATUS
    if (statusQuery && statusQuery.toLowerCase() !== "all") {
      const query = statusQuery.toLowerCase().trim();
      d = d.filter((p) => {
        const suiviStatus = p.lastSuivi?.status_suivis_evangelises?.toLowerCase().trim();
        if (query === "envoyé") return p.status_suivi?.toLowerCase().trim() === "envoyé";
        if (query === "non envoyé" || query === "nonenvoye") return p.status_suivi?.toLowerCase().trim() === "non envoyé";
        if (query === "integré" || query === "intégré") return suiviStatus === "integré" || suiviStatus === "intégré";
        if (query === "en cours") return suiviStatus === "en cours";
        if (query === "refus") return suiviStatus === "refus";
        return true;
      });
    }

    // FILTRE CELLULE
    if (celluleQuery) {
      d = d.filter((p) => p.cellule_id === celluleQuery);
    }

    // FILTRE CONSEILLER
    if (conseillerQuery) {
      d = d.filter((p) => p.conseiller_id === conseillerQuery);
    }

    return d;
  }, [data, filter, search, statusQuery, celluleQuery, conseillerQuery]);

  const toggle = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  // ================= UI =================
  return (
    <div className="min-h-screen flex flex-col items-center p-6" style={{ background: "#333699" }}>
      <HeaderPages />
      <h1 className="text-3xl font-bold text-white mt-4 mb-4">De l’Évangélisation à l’Intégration</h1>

      {/* FILTER */}
      <div className="flex gap-3 my-4 flex-wrap justify-center">
        <input
          placeholder="Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 rounded"
        />
        <button onClick={() => setFilter("ALL")} className="bg-white px-3 py-1 rounded">Tous</button>
        <button onClick={() => setFilter("URGENT")} className="bg-red-300 px-3 py-1 rounded">Urgents</button>
        <button onClick={() => setFilter("STABLE")} className="bg-green-300 px-3 py-1 rounded">Stables</button>
      </div>

      {/* TABLE */}
      <div className="w-full max-w-7xl overflow-x-auto py-2">
        <div className="min-w-[1200px]">
          <div className="hidden sm:flex text-sm font-semibold uppercase text-white px-2 py-1 border-b border-gray-400 bg-transparent gap-y-2 text-center">
            <div className="flex-[2]">Nom complet</div>
            <div className="flex-[1]">Envoi</div>
            <div className="flex-[1]">Jours</div>
            <div className="flex-[1]">Évangélisé</div>
            <div className="flex-[1]">Envoyé au<br/>Suivi</div>
            <div className="flex-[1]">Statut (Envoyé)</div>
            <div className="flex-[1]">Date<br/>Intégration</div>
            <div className="flex-[1]">Baptisé<br/>le</div>
            <div className="flex-[1]">Début<br/>Ministère</div>
            <div className="flex-[1]">Suivis<br/>par</div>
            <div className="flex-[1]">Action</div>
          </div>

          {/* ROWS */}
          {filteredData.map((p) => (
            <div key={p.id} className="mb-1">
              <div className={`grid grid-cols-12 items-center px-2 py-2 rounded-lg bg-white/10 border-l-4 ${p.couleur}`}>
                <div className="col-span-2 text-white text-center">{p.prenom} {p.nom}</div>
                <div className="col-span-1 text-white text-center">{p.status_suivi}</div>
                <div className="col-span-1 text-white text-center">{p.joursSansSuivi}</div>
                <div className="col-span-1 text-white text-center">{new Date(p.created_at).toLocaleDateString()}</div>
                <div className="col-span-1 text-white text-center">{p.lastSuivi?.date_suivi ? new Date(p.lastSuivi.date_suivi).toLocaleDateString() : "-"}</div>
                <div className="col-span-1 text-white text-center">{p.lastSuivi?.status_suivis_evangelises || "-"}</div>
                <div className="col-span-1 text-white text-center">{p.membre?.created_at ? new Date(p.membre.created_at).toLocaleDateString() : "-"}</div>
                <div className="col-span-1 text-white text-center">{p.dateBapteme ? new Date(p.dateBapteme).toLocaleDateString() : "-"}</div>
                <div className="col-span-1 text-white text-center">{p.debutMinistere ? new Date(p.debutMinistere).toLocaleDateString() : "-"}</div>
                <div className="col-span-1 text-white text-center">{p.responsable}</div>
                <div className="col-span-1 text-orange-400 text-center underline">
                  <button onClick={(e) => { e.stopPropagation(); toggle(p.id); }}>Détails</button>
                </div>
              </div>

              {expanded[p.id] && (
                <div className="bg-orange-100 rounded-lg p-3 mt-1">
                  <b className="text-orange-600">Historique :</b>
                  <ul className="mt-2 text-orange-600">
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
