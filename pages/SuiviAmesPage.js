"use client";

import { useEffect, useState } from "react";
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

      try {
        // 1️⃣ EVANGELISES
        const { data: evangelises } = await supabase
          .from("evangelises")
          .select("*")
          .eq("eglise_id", egliseId)
          .eq("branche_id", brancheId);

        // 2️⃣ SUIVIS
        const { data: suivis } = await supabase
          .from("suivis_des_evangelises")
          .select("*")
          .eq("eglise_id", egliseId)
          .eq("branche_id", brancheId);

        // 3️⃣ MAP PAR PERSONNE
        const map = {};

        evangelises.forEach((e) => {
          map[e.id] = {
            ...e,
            suivis: [],
          };
        });

        suivis.forEach((s) => {
          if (!map[s.evangelise_id]) return;
          map[s.evangelise_id].suivis.push(s);
        });

        // 4️⃣ CALCUL ET NORMALISATION
        const finalData = Object.values(map).map((p) => {
          const sortedSuivis = p.suivis.sort(
            (a, b) => new Date(b.date_suivi) - new Date(a.date_suivi)
          );

          const lastSuivi = sortedSuivis[0];

          const dateEvangelisation = p.created_at;
          const dateSuivi = lastSuivi?.date_suivi || null;

          const joursSansSuivi = dateSuivi
            ? Math.floor((new Date() - new Date(dateSuivi)) / (1000 * 60 * 60 * 24))
            : Math.floor((new Date() - new Date(dateEvangelisation)) / (1000 * 60 * 60 * 24));

          return {
            ...p,
            lastSuivi,
            sortedSuivis,
            joursSansSuivi,
          };
        });

        setData(finalData);
      } catch (err) {
        console.error(err);
      }

      setLoading(false);
    };

    fetchData();
  }, [egliseId, brancheId]);

  // ================= UTILS =================
  const toggle = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getColor = (p) => {
    if (p.status_suivi === "Non envoyé") return "bg-red-200";
    if (p.lastSuivi?.status_suivis_evangelises === "En cours") return "bg-yellow-200";
    if (p.lastSuivi?.status_suivis_evangelises === "Intégré") return "bg-green-200";
    if (p.lastSuivi?.status_suivis_evangelises === "Refus") return "bg-gray-300";
    return "bg-white";
  };

  // ================= UI =================
  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />

      {/* TITRE */}
      <h1 className="text-3xl font-bold text-white text-center mt-4">
        De l’Évangélisation à l’Intégration
      </h1>
      <p className="text-gray-300 text-center mb-6">
        Suivi global des âmes — du premier contact à l’engagement
      </p>

      {/* TABLE */}
      <div className="w-full max-w-6xl">
        {loading && <p className="text-white text-center">Chargement...</p>}

        {!loading &&
          data.map((p) => (
            <div key={p.id} className="mb-3 rounded-xl overflow-hidden shadow-lg">
              
              {/* LIGNE RESUME */}
              <div
                className={`p-4 cursor-pointer flex justify-between items-center ${getColor(p)}`}
                onClick={() => toggle(p.id)}
              >
                <div className="font-bold">
                  {p.prenom} {p.nom}
                </div>

                <div className="flex gap-4 text-sm">
                  <span>{p.status_suivi}</span>
                  <span>{p.joursSansSuivi} jours</span>
                  <span>
                    {p.lastSuivi?.status_suivis_evangelises || "-"}
                  </span>
                </div>
              </div>

              {/* DETAILS */}
              {expanded[p.id] && (
                <div className="bg-white p-4 text-sm">
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>📞 {p.telephone || "-"}</div>
                    <div>🌍 {p.ville || "-"}</div>
                    <div>🙏 {p.priere_salut ? "Oui" : "Non"}</div>
                    <div>📅 Évangélisé : {new Date(p.created_at).toLocaleDateString()}</div>
                  </div>

                  <hr className="my-3" />

                  <div className="font-semibold mb-2">Historique des suivis</div>

                  <table className="w-full border text-xs">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Statut</th>
                        <th>Besoins</th>
                      </tr>
                    </thead>
                    <tbody>
                      {p.sortedSuivis.map((s) => (
                        <tr key={s.id}>
                          <td>{new Date(s.date_suivi).toLocaleDateString()}</td>
                          <td>{s.status_suivis_evangelises}</td>
                          <td>{s.besoin}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                </div>
              )}
            </div>
          ))}
      </div>

      <Footer />
    </div>
  );
}
