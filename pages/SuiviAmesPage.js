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
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const searchParams = useSearchParams(); 

  const dateDebutQuery = searchParams?.get("dateDebut");
  const dateFinQuery = searchParams?.get("dateFin");
  const statusQuery = searchParams?.get("status");

  // ================= DATA =================
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const { data: suivis, error } = await supabase
        .from("view_suivis_ames")
        .select("*")
        .gte("date_evangelise", dateDebutQuery || "1900-01-01")
        .lte("date_evangelise", dateFinQuery || "2100-12-31");

      if (error) {
        console.error("Erreur fetch view_suivis_ames:", error);
        setLoading(false);
        return;
      }

      // ================= FINAL DATA =================
      const finalData = suivis.map((p) => {
        const dateRef = p.date_suivi || p.date_evangelise;
        const joursSansSuivi = Math.floor((new Date() - new Date(dateRef)) / (1000 * 60 * 60 * 24));

        let score = 100;
        if (p.status_evangelise?.toLowerCase() === "non envoyé") score -= 40;
        else if (joursSansSuivi > 7) score -= 25;
        else if (joursSansSuivi > 3) score -= 10;
        if (joursSansSuivi <= 3) score += 10;
        score = Math.max(0, Math.min(100, score));

        let couleur = "border-gray-500";
        if (score <= 30) couleur = "border-red-500 animate-pulse";
        else if (score <= 60) couleur = "border-orange-400";
        else if (score <= 80) couleur = "border-yellow-300";
        else couleur = "border-green-400";

        return {
          ...p,
          joursSansSuivi,
          score,
          couleur,
          responsable: p.conseiller_id || p.cellule_id || "-",
        };
      });

      setData(finalData);
      setLoading(false);
    };

    fetchData();
  }, [dateDebutQuery, dateFinQuery]);

  const filteredData = useMemo(() => {
    let d = [...data];

    // Filtre score
    if (filter === "URGENT") d = d.filter((p) => p.score <= 30);
    if (filter === "STABLE") d = d.filter((p) => p.score > 80);

    // Filtre recherche
    if (search) {
      d = d.filter((p) =>
        `${p.prenom_evangelise} ${p.nom_evangelise}`.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Filtre status
    if (statusQuery && statusQuery.toLowerCase() !== "all") {
      const query = statusQuery.toLowerCase().trim();
      d = d.filter((p) => {
        const suiviStatus = p.status_suivi?.toLowerCase().trim();
        if (query === "envoyé") return p.status_evangelise?.toLowerCase().trim() === "envoyé";
        if (query === "non envoyé" || query === "nonenvoye") return p.status_evangelise?.toLowerCase().trim() === "non envoyé";
        if (query === "integré" || query === "intégré") return suiviStatus === "integré" || suiviStatus === "intégré";
        if (query === "en cours") return suiviStatus === "en cours";
        if (query === "refus") return suiviStatus === "refus";
        return true;
      });
    }

    return d;
  }, [data, filter, search, statusQuery]);

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
            <div className="flex-[1]">Envoyé au<br/>Suivi</div>
            <div className="flex-[1]">Statut (Envoyé)</div>
            <div className="flex-[1]">Date</div>
            <div className="flex-[1]">Action</div>
          </div>

          {/* ROWS */}
          {filteredData.map((p) => (
            <div key={p.evangelise_id} className="mb-1">
              <div className={`grid grid-cols-12 items-center px-2 py-2 rounded-lg bg-white/10 border-l-4 ${p.couleur}`}>
                <div className="col-span-1 text-white text-center">{new Date(p.date_evangelise).toLocaleDateString()}</div>
                <div className="col-span-2 text-white text-center">{p.prenom_evangelise} {p.nom_evangelise}</div>
                <div className="col-span-1 text-white text-center">{p.status_evangelise}</div>
                <div className="col-span-1 text-white text-center">{p.joursSansSuivi}</div>
                <div className="col-span-1 text-white text-center">{p.date_suivi ? new Date(p.date_suivi).toLocaleDateString() : "-"}</div>
                <div className="col-span-1 text-white text-center">{p.status_suivi || "-"}</div>
                <div className="col-span-1 text-white text-center">{p.responsable}</div>
                <div className="col-span-1 text-orange-400 text-center underline">
                  <button onClick={(e) => { e.stopPropagation(); toggle(p.evangelise_id); }}>Détails</button>
                </div>
              </div>

              {expanded[p.evangelise_id] && (
                <div className="bg-orange-100 rounded-lg p-3 mt-1">
                  <b className="text-orange-600">Historique :</b>
                  <ul className="mt-2 text-orange-600">
                    {p.date_suivi && (
                      <li>{new Date(p.date_suivi).toLocaleDateString()} — {p.status_suivi}</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {loading && <p className="text-white mt-4"></p>}
      <Footer />
    </div>
  );
}
