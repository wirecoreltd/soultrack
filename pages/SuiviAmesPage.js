"use client";

import { useEffect, useState, useMemo } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import Footer from "../components/Footer";
import ProtectedRoute from "../components/ProtectedRoute";

// PAGE : Parcours des Âmes
export default function ParcoursEvangelisesPage() {
  const [contacts, setContacts] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [checkedContacts, setCheckedContacts] = useState({});
  const [view, setView] = useState("table");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 50; // scroll infini

  // Fetch data avec pagination (scroll infini)
  const fetchData = async (pageNum = 1) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("membres_complets")
      .select(`
        id, prenom, nom, telephone, ville, status_suivi, 
        created_at, date_envoi_suivi, suivi_id, suivi_responsable,
        bapteme_eau, Ministere, suivi_int_id, integration_fini,
        sortedSuivis:suivis_des_evangelises(*)
      `)
      .range((pageNum - 1) * pageSize, pageNum * pageSize - 1);

    if (!error && data) {
      setContacts((prev) => [...prev, ...data]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // scroll infini
  const handleScroll = (e) => {
    const bottom =
      e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
    if (bottom && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchData(nextPage);
    }
  };

  const toggle = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCheck = (id) => {
    setCheckedContacts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getBorderColor = (p) => {
    if (p.status_suivi === "Non envoyé") return "#ef4444"; // rouge URGENT
    if (!p.integration_fini) return "#eab308"; // jaune
    if (p.integration_fini) return "#22c55e"; // vert
    return "#94a3b8"; // gris
  };

  const isUrgent = (p) => p.status_suivi === "Non envoyé";

  return (
    <ProtectedRoute allowedRoles={["Administrateur", "Responsable"]}>
      <HeaderPages title="Parcours des Âmes : De l’Évangélisation à l’Intégration" />

      <div
        className="w-full px-4 py-4 max-w-7xl mx-auto"
        style={{ minHeight: "80vh" }}
        onScroll={handleScroll}
      >
        {contacts && view === "table" && (
          <div className="w-full overflow-x-auto">
            <div className="min-w-[1100px] space-y-2">

              {/* HEADER */}
              <div className="hidden sm:flex text-xs font-semibold uppercase text-white px-2 py-1 border-b border-gray-400 bg-transparent">
                <div className="flex-[2]">Nom</div>
                <div className="flex-[1]">Statut</div>
                <div className="flex-[1]">Jours</div>
                <div className="flex-[1]">Évangélisé</div>
                <div className="flex-[1]">Envoyé</div>
                <div className="flex-[1]">Suivi</div>
                <div className="flex-[1]">Intégré</div>
                <div className="flex-[1]">Baptême</div>
                <div className="flex-[1]">Ministère</div>
                <div className="flex-[1]">Responsable</div>
              </div>

              {/* LIGNES */}
              {contacts.map((p) => {
                const dateIntegre = p.sortedSuivis?.find(
                  (s) => s.status_suivis_evangelises === "Intégré"
                )?.date_suivi;

                return (
                  <div key={p.id}>
                    {/* LIGNE PRINCIPALE */}
                    <div
                      className="flex flex-row items-center px-2 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition duration-150 gap-2 border-l-4 cursor-pointer relative"
                      style={{ borderLeftColor: getBorderColor(p) }}
                      onClick={() => toggle(p.id)}
                    >
                      {isUrgent(p) && (
                        <span className="absolute -top-2 -left-2 px-2 py-1 text-xs font-bold text-white bg-red-500 rounded animate-pulse">
                          URGENT
                        </span>
                      )}
                      <div className="flex-[2] text-white">{p.prenom} {p.nom}</div>
                      <div className="flex-[1] text-white">{p.status_suivi}</div>
                      <div className="flex-[1] text-white">{p.joursSansSuivi}</div>
                      <div className="flex-[1] text-white">{new Date(p.created_at).toLocaleDateString()}</div>
                      <div className="flex-[1] text-white">
                        {p.date_envoi_suivi ? new Date(p.date_envoi_suivi).toLocaleDateString() : "-"}
                      </div>
                      <div className="flex-[1] text-white">
                        {p.lastSuivi?.date_suivi ? new Date(p.lastSuivi.date_suivi).toLocaleDateString() : "-"}
                      </div>
                      <div className="flex-[1] text-white">
                        {dateIntegre ? new Date(dateIntegre).toLocaleDateString() : "-"}
                      </div>
                      <div className="flex-[1] text-white">{p.bapteme_eau || "-"}</div>
                      <div className="flex-[1] text-white">{p.Ministere || "-"}</div>
                      <div className="flex-[1] text-white">{p.suivi_responsable || "-"}</div>
                    </div>

                    {/* DETAILS */}
                    {expanded[p.id] && (
                      <div className="bg-white/5 text-white text-sm px-4 py-3 rounded-lg mt-1">
                        <div className="mb-2 font-semibold">Historique des suivis</div>
                        {p.sortedSuivis.length === 0 && <div className="text-gray-300">Aucun suivi</div>}
                        {p.sortedSuivis.map((s) => (
                          <div key={s.id} className="border-b border-white/10 py-1">
                            {new Date(s.date_suivi).toLocaleDateString()} — {s.status_suivis_evangelises}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </ProtectedRoute>
  );
}
