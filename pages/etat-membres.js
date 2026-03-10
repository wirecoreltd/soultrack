"use client";

import { useState } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import ProtectedRoute from "../components/ProtectedRoute";
import Footer from "../components/Footer";

export default function EtatMembresWrapper() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "Responsable"]}>
      <EtatMembresPage />
    </ProtectedRoute>
  );
}

function EtatMembresPage() {

  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [loading, setLoading] = useState(false);

  const [stats, setStats] = useState({
    visiteurs: 0,
    nouveauxContacts: 0,
    envoyesSuivi: 0,
    enAttente: 0,
    conseillers: 0,
    amesParConseiller: 0,
    enCellule: 0,
    envoyesCellule: 0,
    integration: 0,
    conversion: 0,
    formation: 0,
    ministere: 0,
    sansConseiller: 0,
    sansCellule: 0
  });

  const fetchStats = async () => {

    setLoading(true);

    let query = supabase
      .from("membres_complets")
      .select("*");

    if (dateDebut) query = query.gte("created_at", dateDebut);
    if (dateFin) query = query.lte("created_at", dateFin);

    const { data, error } = await query;

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    const membres = data || [];

    const visiteurs = membres.filter(
      m => m.statut_initial === "visiteur"
    ).length;

    const nouveauxContacts = membres.filter(
      m => m.etat_contact === "nouveau"
    ).length;

    const envoyesSuivi = membres.filter(
      m => m.conseiller_id !== null
    ).length;

    const enAttente = membres.filter(
      m => m.conseiller_id === null
    ).length;

    const conseillersSet = new Set(
      membres
        .filter(m => m.conseiller_id)
        .map(m => m.conseiller_id)
    );

    const conseillers = conseillersSet.size;

    const amesParConseiller =
      conseillers > 0
        ? (envoyesSuivi / conseillers).toFixed(1)
        : 0;

    const enCellule = membres.filter(
      m => m.cellule_id !== null
    ).length;

    const envoyesCellule = membres.filter(
      m => m.sent_to_cellule
    ).length;

    const integration = membres.filter(
      m => m.integration_fini === "oui"
    ).length;

    const conversion = membres.filter(
      m => m.type_conversion !== null
    ).length;

    const formation = membres.filter(
      m => m.Formation !== null
    ).length;

    const ministere = membres.filter(
      m => m.Ministere !== null
    ).length;

    const sansConseiller = membres.filter(
      m => m.conseiller_id === null
    ).length;

    const sansCellule = membres.filter(
      m => m.cellule_id === null
    ).length;

    setStats({
      visiteurs,
      nouveauxContacts,
      envoyesSuivi,
      enAttente,
      conseillers,
      amesParConseiller,
      enCellule,
      envoyesCellule,
      integration,
      conversion,
      formation,
      ministere,
      sansConseiller,
      sansCellule
    });

    setLoading(false);
  };

  const Card = ({ title, value }) => (
    <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl text-center shadow-lg">
      <div className="text-sm uppercase opacity-80">{title}</div>
      <div className="text-3xl font-bold mt-2 text-amber-300">{value}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#333699] p-6 text-white">

      <HeaderPages />

      <h1 className="text-2xl font-bold text-center mb-10">
        Rapport <span className="text-amber-300">État des Membres</span>
      </h1>

      {/* FILTRES */}

      <div className="flex justify-center mb-10">
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl flex gap-6 flex-wrap items-end">

          <div className="flex flex-col">
            <label className="text-sm mb-1">Date début</label>
            <input
              type="date"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
              className="px-3 py-2 rounded-lg text-black"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm mb-1">Date fin</label>
            <input
              type="date"
              value={dateFin}
              onChange={(e) => setDateFin(e.target.value)}
              className="px-3 py-2 rounded-lg text-black"
            />
          </div>

          <button
            onClick={fetchStats}
            className="bg-[#2a2f85] px-6 py-2 rounded-xl hover:bg-[#1f2366]"
          >
            {loading ? "Générer..." : "Générer"}
          </button>

        </div>
      </div>

      {/* VISITEURS */}

      <h2 className="text-xl mb-4 font-semibold">👥 Visiteurs</h2>

      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <Card title="Visiteurs reçus" value={stats.visiteurs} />
        <Card title="Nouveaux contacts" value={stats.nouveauxContacts} />
      </div>

      {/* SUIVI */}

      <h2 className="text-xl mb-4 font-semibold">🤝 Suivi</h2>

      <div className="grid md:grid-cols-4 gap-6 mb-10">
        <Card title="Envoyés en suivi" value={stats.envoyesSuivi} />
        <Card title="En attente" value={stats.enAttente} />
        <Card title="Conseillers actifs" value={stats.conseillers} />
        <Card title="Âmes / conseiller" value={stats.amesParConseiller} />
      </div>

      {/* INTÉGRATION */}

      <h2 className="text-xl mb-4 font-semibold">🏠 Intégration</h2>

      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <Card title="En cellule" value={stats.enCellule} />
        <Card title="Envoyés cellule" value={stats.envoyesCellule} />
        <Card title="Intégration terminée" value={stats.integration} />
      </div>

      {/* CROISSANCE */}

      <h2 className="text-xl mb-4 font-semibold">🌱 Croissance</h2>

      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <Card title="Conversions" value={stats.conversion} />
        <Card title="Formation" value={stats.formation} />
        <Card title="Ministère" value={stats.ministere} />
      </div>

      {/* BREBIS À SURVEILLER */}

      <h2 className="text-xl mb-4 font-semibold">⚠️ Brebis à surveiller</h2>

      <div className="grid md:grid-cols-2 gap-6 mb-16">
        <Card title="Sans conseiller" value={stats.sansConseiller} />
        <Card title="Sans cellule" value={stats.sansCellule} />
      </div>

      <Footer />

    </div>
  );
}
