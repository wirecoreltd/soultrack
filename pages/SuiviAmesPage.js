"use client";

import { useEffect, useState, useCallback } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import Footer from "../components/Footer";
import ProtectedRoute from "../components/ProtectedRoute";
import { motion } from "framer-motion";

export default function ParcoursEvangelisesPage() {
  const [evangelises, setEvangelises] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const pageSize = 50; // nombre de personnes par fetch

  const fetchEvangelises = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    let { data, error } = await supabase
      .from("membres_complets")
      .select("*")
      .order("date_premiere_visite", { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    if (data.length < pageSize) setHasMore(false);

    setEvangelises((prev) => [...prev, ...data]);
    setPage((prev) => prev + 1);
    setLoading(false);
  }, [page, loading, hasMore]);

  useEffect(() => {
    fetchEvangelises();
  }, []);

  // Scroll infini
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop + 50 >=
        document.documentElement.scrollHeight
      ) {
        fetchEvangelises();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [fetchEvangelises]);

  const getBorderColor = (m) => {
    // Scoring couleur selon état
    switch (m.suivi_statut) {
      case "URGENT":
        return "#ff4d4d";
      case "Intégré":
        return "#4caf50";
      case "Suivi":
        return "#ffa500";
      default:
        return "#888";
    }
  };

  const getBadge = (m) => {
    if (m.suivi_statut === "URGENT") {
      return (
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-red-500 font-bold text-sm"
        >
          🔴 URGENT
        </motion.div>
      );
    }
    return null;
  };

  return (
    <ProtectedRoute allowedRoles={["Administrateur", "Responsable"]}>
      <div className="min-h-screen flex flex-col" style={{ background: "#333699" }}>
        <HeaderPages />

        <main className="flex-1 p-6 flex flex-col items-center text-white">
          <h1 className="text-2xl font-bold mb-4">De l’Évangélisation à l’Intégration</h1>

          {/* Tableau transparent */}
          <div className="w-full max-w-6xl overflow-x-auto py-2">
            <div className="min-w-[700px] space-y-2">
              <div className="hidden sm:flex text-sm font-semibold uppercase text-white px-2 py-1 border-b border-gray-400 bg-transparent">
                <div className="flex-[2]">Nom complet</div>
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

              {evangelises.map((m) => (
                <div
                  key={m.id}
                  className="flex flex-row items-center px-2 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition duration-150 gap-2 border-l-4"
                  style={{ borderLeftColor: getBorderColor(m) }}
                >
                  <div className="flex-[2] flex items-center gap-1">{m.prenom} {m.nom}</div>
                  <div className="flex-[1]">{m.statut || "—"}</div>
                  <div className="flex-[1]">{m.jours || "—"}</div>
                  <div className="flex-[1]">{m.date_premiere_visite ? new Date(m.date_premiere_visite).toLocaleDateString() : "—"}</div>
                  <div className="flex-[1]">{m.date_envoi_suivi ? new Date(m.date_envoi_suivi).toLocaleDateString() : "—"}</div>
                  <div className="flex-[1]">{m.suivi_statut || "—"} {getBadge(m)}</div>
                  <div className="flex-[1]">{m.integration_fini || "—"}</div>
                  <div className="flex-[1]">{m.bapteme_eau || "—"}</div>
                  <div className="flex-[1]">{m.Ministere || "—"}</div>
                  <div className="flex-[1]">{m.suivi_responsable || "—"}</div>
                </div>
              ))}
            </div>

            {loading && (
              <div className="text-white text-center py-4">Chargement...</div>
            )}

            {!hasMore && (
              <div className="text-white text-center py-4">Fin de la liste</div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
