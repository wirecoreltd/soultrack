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

  const { data } = await supabase
  .from("rapport_evangelisation_suivis")
  .select("*")
  .eq("eglise_id", egliseId)
  .eq("branche_id", brancheId)
  .gte("date_evangelise", dateDebutQuery)
  .lte("date_evangelise", dateFinQuery);
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
        // On récupère tous les suivis dans l’église / branche
        const { data: suivis } = await supabase
          .from("suivis_des_evangelises")
          .select("*")
          .eq("eglise_id", egliseId)
          .eq("branche_id", brancheId);

        // Filtre par date_evangelise
        let filtered = suivis;
        if (dateDebutQuery) filtered = filtered.filter(e => new Date(e.date_evangelise) >= new Date(dateDebutQuery));
        if (dateFinQuery) filtered = filtered.filter(e => new Date(e.date_evangelise) <= new Date(dateFinQuery));

        // Tri par date_evangelise décroissante
        filtered.sort((a, b) => new Date(b.date_evangelise) - new Date(a.date_evangelise));

        setData(filtered);
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

    if (filter === "URGENT") d = d.filter((p) => p.joursSansSuivi && p.joursSansSuivi > 7);
    if (filter === "STABLE") d = d.filter((p) => p.joursSansSuivi && p.joursSansSuivi <= 3);

    if (search) {
      d = d.filter((p) =>
        `${p.prenom} ${p.nom}`.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (statusQuery && statusQuery.toLowerCase() !== "all") {
      const query = statusQuery.toLowerCase().trim();
      d = d.filter((p) => p.status_suivis_evangelises?.toLowerCase().trim() === query);
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
      <h1 className="text-2xl font-bold mt-4 mb-6 text-center text-white">
        De l’Évangélisation à l’Intégration
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
        <div className="min-w-[1000px]">
          <div className="grid grid-cols-12 text-sm font-semibold text-white border-b border-gray-400 gap-x-2 text-center">
            <div>Évangélisé</div>
            <div>Nom complet</div>
            <div>Envoi</div>
            <div>Jours</div>
            <div>Date Évangélisation</div>
            <div>Statut</div>
            <div>Baptisé</div>
            <div>Début Ministère</div>
            <div>Suivis par</div>
            <div>Action</div>
          </div>

          {filteredData.map((p) => (
            <div key={p.id} className="mb-1">
              <div className="grid grid-cols-12 items-center px-2 py-2 rounded-lg bg-white/10 border-l-4 border-gray-500 text-white text-center">
                <div>{new Date(p.date_evangelise).toLocaleDateString()}</div>
                <div>{p.prenom} {p.nom}</div>
                <div>{p.status_suivis_evangelises}</div>
                <div>{Math.floor((new Date() - new Date(p.date_evangelise)) / (1000*60*60*24))}</div>
                <div>{new Date(p.date_evangelise).toLocaleDateString()}</div>
                <div>{p.status_suivis_evangelises}</div>
                <div>-</div>
                <div>-</div>
                <div>{p.responsable || "-"}</div>
                <div>
                  <button onClick={() => toggle(p.id)} className="underline text-orange-400">Détails</button>
                </div>
              </div>
              {expanded[p.id] && (
                <div className="bg-orange-100 p-2 rounded mt-1 text-orange-600">
                  <b>Historique du suivi :</b>
                  <div>Date suivi : {p.date_suivi ? new Date(p.date_suivi).toLocaleDateString() : "-"}</div>
                  <div>Status : {p.status_suivis_evangelises}</div>
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
