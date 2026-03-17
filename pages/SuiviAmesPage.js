"use client";

import { useEffect, useState, useCallback } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import Footer from "../components/Footer";
import ProtectedRoute from "../components/ProtectedRoute";
import { formatDistanceToNow } from "date-fns";

export default function ParcoursEvangelisesPage() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [checkedContacts, setCheckedContacts] = useState({});
  const [popupMember, setPopupMember] = useState(null);

  const PAGE_SIZE = 50;

  const fetchContacts = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("membres_complets")
      .select(`
        *,
        suivis_des_evangelises!inner(
          date_suivi,
          status_suivis_evangelises
        )
      `)
      .order("created_at", { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (error) {
      console.error("Erreur Supabase:", error);
    } else {
      const mapped = data.map((m) => ({
        id: m.id,
        prenom: m.prenom,
        nom: m.nom,
        telephone: m.telephone,
        ville: m.ville,
        status: m.statut_suivis,
        dateEvangelise: m.created_at,
        dateEnvoye: m.date_envoi_suivi,
        dateSuivi: m.suivi_updated_at,
        dateIntegre: m.integration_fini,
        bapteme: m.bapteme_eau || m.bapteme_esprit,
        ministere: m.Ministere,
        responsable: m.suivi_responsable,
        urgent: m.suivi_statut === "URGENT",
      }));
      setContacts((prev) => [...prev, ...mapped]);
      setHasMore(data.length === PAGE_SIZE);
      setPage((prev) => prev + 1);
    }
    setLoading(false);
  }, [loading, page, hasMore]);

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleCheck = (id) => {
    setCheckedContacts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getBorderColor = (m) => {
    if (m.urgent) return "red";
    if (m.status === "Intégré") return "green";
    if (m.status === "En cours") return "orange";
    return "#888";
  };

  // Scroll infini
  useEffect(() => {
    const onScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 200 &&
        hasMore &&
        !loading
      ) {
        fetchContacts();
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [fetchContacts, hasMore, loading]);

  return (
    <ProtectedRoute allowedRoles={["Administrateur", "Responsable"]}>
      <div className="min-h-screen flex flex-col" style={{ background: "#333699" }}>
        <HeaderPages title="Parcours des évangélisés: De l’Évangélisation à l’Intégration" />

        <main className="flex-1 flex flex-col items-center py-6 px-4">
          {/* VUE TABLE */}
          {contacts && (
            <div className="w-full max-w-6xl overflow-x-auto py-2">
              <div className="min-w-[700px] space-y-2">
                <div className="hidden sm:flex text-sm font-semibold uppercase text-white px-2 py-1 border-b border-gray-400 bg-transparent">
                  <div className="flex-[2]">Nom complet</div>
                  <div className="flex-[1]">Téléphone</div>
                  <div className="flex-[1]">Ville</div>
                  <div className="flex-[1] flex justify-center items-center">Sélectionner</div>
                  <div className="flex-[1]">Action</div>
                </div>
                {contacts.map((m) => (
                  <div
                    key={m.id}
                    className="flex flex-row items-center px-2 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition duration-150 gap-2 border-l-4 relative"
                    style={{ borderLeftColor: getBorderColor(m) }}
                  >
                    {m.urgent && (
                      <span className="absolute top-0 left-0 bg-red-500 text-white px-2 py-0.5 text-xs animate-pulse rounded-tr-lg">
                        URGENT
                      </span>
                    )}
                    <div className="flex-[2] text-white flex items-center gap-1">
                      {m.prenom} {m.nom}
                    </div>
                    <div className="flex-[1] text-white">{m.telephone || "—"}</div>
                    <div className="flex-[1] text-white">{m.ville || "—"}</div>
                    <div className="flex-[1] flex justify-center items-center">
                      <input
                        type="checkbox"
                        checked={checkedContacts[m.id] || false}
                        onChange={() => handleCheck(m.id)}
                      />
                    </div>
                    <div className="flex-[1]">
                      <button
                        onClick={() => setPopupMember(m)}
                        className="text-orange-500 underline text-sm"
                      >
                        Détails
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {loading && <p className="text-white mt-4">Chargement...</p>}
            </div>
          )}
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
