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
  const celluleQuery = searchParams?.get("cellule") || null;
  const conseillerQuery = searchParams?.get("conseiller") || null;
  const dateDebutQuery = searchParams?.get("dateDebut");
  const dateFinQuery = searchParams?.get("dateFin");

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

      try {
        const { data: evangelises } = await supabase
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
        const { data: baptemes } = await supabase.from("baptemes").select("*");

        // ================= FILTRE DATE =================
        const filteredEvangelises = evangelises.filter((e) => {
          if (dateDebutQuery && new Date(e.date_evangelise) < new Date(dateDebutQuery)) return false;
          if (dateFinQuery && new Date(e.date_evangelise) > new Date(dateFinQuery)) return false;
          return true;
        });

        // ================= MAPS =================
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
        const finalData = filteredEvangelises.map((p) => {
          const membre = membresMap[p.id];
          const joursSansSuivi = Math.floor((new Date() - new Date(p.date_evangelise)) / (1000 * 60 * 60 * 24));

          // Calcul score
          let score = 100;
          if (p.status_suivi === "Non envoyé") score -= 40;
          if (joursSansSuivi > 7) score -= 25;
          else if (joursSansSuivi > 3) score -= 10;
          if (!membre?.bapteme_date) score -= 10;
          if (!membre?.star) score -= 10;
          if (joursSansSuivi <= 3) score += 10;
          score = Math.max(0, Math.min(100, score));

          // Couleur bordure
          let couleur = "border-gray-500";
          if (score <= 30) couleur = "border-red-500 animate-pulse";
          else if (score <= 60) couleur = "border-orange-400";
          else if (score <= 80) couleur = "border-yellow-300";
          else couleur = "border-green-400";

          // Responsable
          let responsable = "-";
          if (membre) {
            if (membre.conseiller_id) responsable = profilesMap[membre.conseiller_id] || "-";
            else if (membre.cellule_id) responsable = cellulesMap[membre.cellule_id] || "-";
          }

          return {
            ...p,
            membre,
            joursSansSuivi,
            score,
            couleur,
            responsable,
            debutMinistere: membre ? ministereMap[membre.id] : null,
            dateBapteme: baptemeMap[String(p.id)],
            cellule_id: membre?.cellule_id || null,
            conseiller_id: membre?.conseiller_id || null,
          };
        });

        setData(finalData);
      } catch (err) {
        console.error("Erreur fetchData:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [egliseId, brancheId, dateDebutQuery, dateFinQuery]);

  // ================= FILTRE MEMO =================
  const filteredData = useMemo(() => {
    let d = [...data];

    if (filter === "URGENT") d = d.filter((p) => p.score <= 30);
    if (filter === "STABLE") d = d.filter((p) => p.score > 80);

    if (search) {
      d = d.filter((p) =>
        `${p.prenom} ${p.nom}`.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (statusQuery && statusQuery.toLowerCase() !== "all") {
      const query = statusQuery.toLowerCase().trim();
      d = d.filter((p) => {
        if (query === "envoyé") return p.status_suivi?.toLowerCase().trim() === "envoyé";
        if (query === "non envoyé" || query === "nonenvoye") return p.status_suivi?.toLowerCase().trim() === "non envoyé";
        if (query === "integré" || query === "intégré") return p.status_suivi?.toLowerCase().trim() === "intégré";
        if (query === "en cours") return p.status_suivi?.toLowerCase().trim() === "en cours";
        if (query === "refus") return p.status_suivi?.toLowerCase().trim() === "refus";
        return true;
      });
    }

    if (celluleQuery === "true") { 
      d = d.filter((p) => p.cellule_id != null);
    }      
    if (conseillerQuery === "true") { 
      d = d.filter((p) => p.conseiller_id != null);
    }

    return d;
  }, [data, filter, search, statusQuery, celluleQuery, conseillerQuery]);

  const toggle = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  // ================= UI =================
  return (
    <div className="min-h-screen flex flex-col items-center p-6" style={{ background: "#333699" }}>
      <HeaderPages />      
      <h1 className="text-2xl font-bold mt-4 mb-6 text-center">
        <span className="text-white">De l’Évangélisation à </span>
        <span className="text-amber-300">l’Intégration</span>
      </h1>

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
            <div className="flex-[1]">Évangélisé</div>    
            <div className="flex-[2]">Nom complet</div>
            <div className="flex-[1]">Envoi</div>
            <div className="flex-[1]">Jours</div>            
            <div className="flex-[1]">Date<br/>Évangélisation</div>
            <div className="flex-[1]">Statut</div>
            <div className="flex-[1]">Baptisé</div>
            <div className="flex-[1]">Début<br/>Ministère</div>
            <div className="flex-[1]">Suivis<br/>par</div>
            <div className="flex-[1]">Action</div>
          </div>

          {/* ROWS */}
          {filteredData.map((p) => (
            <div key={p.id} className="mb-1">
              <div className={`grid grid-cols-12 items-center px-2 py-2 rounded-lg bg-white/10 border-l-4 ${p.couleur}`}>
                <div className="col-span-1 text-white text-center">{new Date(p.date_evangelise).toLocaleDateString()}</div>
                <div className="col-span-2 text-white text-center">{p.prenom} {p.nom}</div>
                <div className="col-span-1 text-white text-center">{p.status_suivi}</div>
                <div className="col-span-1 text-white text-center">{p.joursSansSuivi}</div>
                <div className="col-span-1 text-white text-center">{p.date_evangelise ? new Date(p.date_evangelise).toLocaleDateString() : "-"}</div>
                <div className="col-span-1 text-white text-center">{p.status_suivi || "-"}</div>
                <div className="col-span-1 text-white text-center">{p.dateBapteme ? new Date(p.dateBapteme).toLocaleDateString() : "-"}</div>
                <div className="col-span-1 text-white text-center">{p.debutMinistere ? new Date(p.debutMinistere).toLocaleDateString() : "-"}</div>
                <div className="col-span-1 text-white text-center">{p.responsable}</div>
                <div className="col-span-1 text-orange-400 text-center underline">
                  <button onClick={(e) => { e.stopPropagation(); toggle(p.id); }}>Détails</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {loading && <p className="text-white mt-4">Chargement...</p>}
      <Footer />
    </div>
  );
}
