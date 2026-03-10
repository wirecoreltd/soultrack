"use client";

import { useState, useEffect } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import ProtectedRoute from "../components/ProtectedRoute";
import Footer from "../components/Footer";

export default function MembresHubPageWrapper() {
  return (
    <ProtectedRoute allowedRoles={["Responsable"]}>
      <MembresHubPage />
    </ProtectedRoute>
  );
}

function MembresHubPage() {
  const [loading, setLoading] = useState(false);
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [stats, setStats] = useState({
    totalMembres: 0,
    etatContact: { nouveau: 0, existant: 0 },
    venu: { reseaux: 0, invite: 0, evangelisation: 0 },
    priereConversion: { priere: 0, conversion: 0, reconciliation: 0 },
    trancheAge: {
      "12-17 ans": 0,
      "18-25 ans": 0,
      "26-30 ans": 0,
      "31-40 ans": 0,
      "41-55 ans": 0,
      "56-69 ans": 0,
      "70 ans et plus": 0,
    },
  });

  const fetchStats = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("branche_id")
        .eq("id", user.id)
        .single();

      const brancheId = profile?.branche_id;

      let query = supabase
        .from("membres_complets")
        .select("*")
        .eq("branche_id", brancheId);

      if (dateDebut) query = query.gte("created_at", dateDebut);
      if (dateFin) query = query.lte("created_at", dateFin);

      const { data: membres } = await query;

      if (!membres) return;

      // État contact
      const etatContact = {
        nouveau: membres.filter(m => m.etat_contact === "nouveau").length,
        existant: membres.filter(m => m.etat_contact !== "nouveau").length,
      };

      // Venu par réseaux / invité / évangélisation
      const venu = {
        reseaux: membres.filter(m => m.venu === "réseaux").length,
        invite: membres.filter(m => m.venu === "invité").length,
        evangelisation: membres.filter(m => m.venu === "evangélisation").length,
      };

      // Prières / conversion / réconciliation
      const priereConversion = {
        priere: membres.filter(m => m.priere_salut === "Oui").length,
        conversion: membres.filter(m => m.type_conversion === "Nouveau converti").length,
        reconciliation: membres.filter(m => m.type_conversion === "Réconciliation").length,
      };

      // Tranche d’âge
      const trancheAge = {
        "12-17 ans": membres.filter(m => m.age === "12-17 ans").length,
        "18-25 ans": membres.filter(m => m.age === "18-25 ans").length,
        "26-30 ans": membres.filter(m => m.age === "26-30 ans").length,
        "31-40 ans": membres.filter(m => m.age === "31-40 ans").length,
        "41-55 ans": membres.filter(m => m.age === "41-55 ans").length,
        "56-69 ans": membres.filter(m => m.age === "56-69 ans").length,
        "70 ans et plus": membres.filter(m => m.age === "70 ans et plus").length,
      };

      setStats({
        totalMembres: membres.length,
        etatContact,
        venu,
        priereConversion,
        trancheAge,
      });
    } catch (err) {
      console.error("Erreur fetch stats hub:", err);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#333699] p-6 text-white">
      <HeaderPages />
      <h1 className="text-2xl font-bold text-center mb-6">
        Membres <span className="text-amber-300">Hub</span>
      </h1>

      {/* FILTRE DATE */}
      <div className="flex flex-wrap gap-4 justify-center mb-8 bg-white/10 p-4 rounded-xl">
        <div className="flex flex-col">
          <label>Date début</label>
          <input
            type="date"
            value={dateDebut}
            onChange={(e) => setDateDebut(e.target.value)}
            className="text-black px-2 py-1 rounded"
          />
        </div>
        <div className="flex flex-col">
          <label>Date fin</label>
          <input
            type="date"
            value={dateFin}
            onChange={(e) => setDateFin(e.target.value)}
            className="text-black px-2 py-1 rounded"
          />
        </div>
        <button
          onClick={fetchStats}
          className="bg-[#2a2f85] px-6 py-2 rounded-xl hover:bg-[#1f2366] transition"
        >
          {loading ? "Générer..." : "Générer"}
        </button>
      </div>

      {/* BOITES DE STATISTIQUES */}
      {/* BOITE 1 */}
      <div className="mb-6 p-6 bg-white/10 rounded-xl border-l-4 border-green-400">
        <h2 className="text-lg font-bold mb-3">Total membres dans le hub</h2>
        <p className="text-xl font-bold">{stats.totalMembres}</p>
        <p>Nouveau: {stats.etatContact.nouveau} | Existant: {stats.etatContact.existant}</p>
      </div>

      {/* BOITE 2 */}
      <div className="mb-6 p-6 bg-white/10 rounded-xl border-l-4 border-blue-400">
        <h2 className="text-lg font-bold mb-3">Venu par</h2>
        <p>Réseaux: {stats.venu.reseaux}</p>
        <p>Invité: {stats.venu.invite}</p>
        <p>Évangélisation: {stats.venu.evangelisation}</p>
      </div>

      {/* BOITE 3 */}
      <div className="mb-6 p-6 bg-white/10 rounded-xl border-l-4 border-yellow-400">
        <h2 className="text-lg font-bold mb-3">Suivi spirituel</h2>
        <p>Prières du salut: {stats.priereConversion.priere}</p>
        <p>Conversion: {stats.priereConversion.conversion}</p>
        <p>Réconciliation: {stats.priereConversion.reconciliation}</p>
      </div>

      {/* BOITE 4 */}
      <div className="mb-6 p-6 bg-white/10 rounded-xl border-l-4 border-purple-400">
        <h2 className="text-lg font-bold mb-3">Tranche d’âge</h2>
        <ul className="list-disc list-inside">
          {Object.entries(stats.trancheAge).map(([age, count]) => (
            <li key={age}>{age}: {count}</li>
          ))}
        </ul>
      </div>

      <Footer />
    </div>
  );
}
