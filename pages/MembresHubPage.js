"use client";

import { useState, useEffect } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import Footer from "../components/Footer";
import ProtectedRoute from "../components/ProtectedRoute";

export default function MembresHubPage() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur","ResponsableIntegration"]}>
      <MembresHub />
    </ProtectedRoute>
  );
}

function MembresHub() {
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [message, setMessage] = useState("");
  const [stats, setStats] = useState({
    presenceCulte: 0,
    envoyesSuivi: 0,
    integres: 0,
    recus: 0,
    enAttente: 0,
    nbConseillers: 0,
    amesParConseiller: 0,
  });

  // Récupération des stats depuis Supabase
  const fetchStats = async () => {
    setMessage("⏳ Chargement...");
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("eglise_id, branche_id")
        .eq("id", session.session.user.id)
        .single();

      // Exemple : fetch stats globales (à adapter selon ta base)
      const { data: membres } = await supabase
        .from("membres_complets")
        .select("*")
        .eq("eglise_id", profile.eglise_id)
        .eq("branche_id", profile.branche_id)
        .gte("created_at", dateDebut || "1900-01-01")
        .lte("created_at", dateFin || "2999-12-31");

      // Calcul des stats
      const presenceCulte = membres.filter(m => m.presence_culte).length;
      const envoyesSuivi = membres.filter(m => m.envoye_suivi).length;
      const integres = membres.filter(m => m.integre).length;
      const recus = membres.filter(m => m.recu).length;
      const enAttente = membres.filter(m => m.en_attente).length;
      const nbConseillers = membres.filter(m => m.is_conseiller).length;
      const amesParConseiller = nbConseillers ? membres.length / nbConseillers : 0;

      setStats({
        presenceCulte,
        envoyesSuivi,
        integres,
        recus,
        enAttente,
        nbConseillers,
        amesParConseiller,
      });

      setMessage("");
    } catch (err) {
      console.error(err);
      setMessage("❌ " + err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />
      <h1 className="text-2xl font-bold mt-4 mb-6 text-center text-white">
        Membres Hub
      </h1>

      {/* FILTRES */}
      <div className="flex flex-wrap gap-4 mb-6 bg-white/10 p-4 rounded-2xl">
        <div className="flex flex-col">
          <label className="text-white mb-1">Date début</label>
          <input
            type="date"
            value={dateDebut}
            onChange={e => setDateDebut(e.target.value)}
            className="input"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-white mb-1">Date fin</label>
          <input
            type="date"
            value={dateFin}
            onChange={e => setDateFin(e.target.value)}
            className="input"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={fetchStats}
            className="bg-[#2a2f85] px-6 py-2 rounded-xl hover:bg-[#1f2366] text-white"
          >
            Générer
          </button>
        </div>
      </div>

      {message && <p className="text-white mb-4">{message}</p>}

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8 w-full max-w-6xl">
        <KpiCard label="Présence Culte" value={stats.presenceCulte} />
        <KpiCard label="Envoyés en Suivi" value={stats.envoyesSuivi} />
        <KpiCard label="Intégrés" value={stats.integres} />
        <KpiCard label="Reçus" value={stats.recus} />
        <KpiCard label="En Attente" value={stats.enAttente} />
        <KpiCard label="Nombre Conseillers" value={stats.nbConseillers} />
        <KpiCard label="Âmes par Conseiller" value={stats.amesParConseiller.toFixed(1)} />
      </div>

      <Footer />

      <style jsx>{`
        .input {
          border: 1px solid #ccc;
          padding: 10px;
          border-radius: 12px;
          background: rgba(255,255,255,0.05);
          color: white;
        }
      `}</style>
    </div>
  );
}

function KpiCard({ label, value }) {
  return (
    <div className="bg-white/10 rounded-2xl shadow-lg p-4 flex flex-col items-center justify-center">
      <p className="text-white text-lg font-medium">{label}</p>
      <p className="text-amber-300 text-2xl font-bold">{value}</p>
    </div>
  );
}
