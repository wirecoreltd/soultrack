"use client";

import { useState } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import Footer from "../components/Footer";
import ProtectedRoute from "../components/ProtectedRoute";

export default function RapportEtatTroupeauPage() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur","ResponsableSuivi"]}>
      <RapportEtatTroupeau />
    </ProtectedRoute>
  );
}

function RapportEtatTroupeau() {
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [membres, setMembres] = useState([]);
  const [message, setMessage] = useState("");

  const fetchMembres = async () => {
    setMessage("⏳ Chargement...");
    setMembres([]);

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("eglise_id, branche_id")
        .eq("id", session.session.user.id)
        .single();

      const { data, error } = await supabase
        .from("membres_complets")
        .select("id, nom, prenom, sexe, date_premiere_visite")
        .eq("eglise_id", profile.eglise_id)
        .eq("branche_id", profile.branche_id)
        .eq("etat_contact", "nouveau")
        .gte("date_premiere_visite", dateDebut || "1900-01-01")
        .lte("date_premiere_visite", dateFin || "2999-12-31")
        .order("date_premiere_visite", { ascending: true });

      if (error) throw error;

      setMembres(data || []);
      setMessage("");
    } catch (err) {
      console.error(err);
      setMessage("❌ " + err.message);
    }
  };

  const totalHommes = membres.filter(m => m.sexe?.toLowerCase() === "homme").length;
  const totalFemmes = membres.filter(m => m.sexe?.toLowerCase() === "femme").length;

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />

      <h1 className="text-2xl font-bold text-white mt-4 mb-6 text-center">
        <span className="text-white">Rapport </span>
        <span className="text-amber-300">État du Troupeau</span>
      </h1>

      {/* FILTRES */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex flex-col">
          <label className="text-white mb-1">Date de début</label>
          <input
            type="date"
            value={dateDebut}
            onChange={(e) => setDateDebut(e.target.value)}
            className="input"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-white mb-1">Date de fin</label>
          <input
            type="date"
            value={dateFin}
            onChange={(e) => setDateFin(e.target.value)}
            className="input"
          />
        </div>
        <div className="flex items-end">
          <button onClick={fetchMembres} className="bg-[#2a2f85] px-6 py-2 rounded-xl hover:bg-[#1f2366] text-white">
            Générer
          </button>
        </div>
      </div>

      {message && <p className="text-white mb-4">{message}</p>}

      {/* TABLEAU */}
      {membres.length > 0 && (
        <div className="w-full max-w-[700px] bg-white/10 rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-5 text-white font-bold border-b border-white/30 pb-2 mb-2 text-center">
            <div className="text-left pl-2">Nom</div>
            <div>Prénom</div>
            <div>Sexe</div>
            <div>Date arrivée</div>
            <div>Total</div>
          </div>

          {membres.map((m) => (
            <div key={m.id} className="grid grid-cols-5 text-white py-2 border-b border-white/10 text-center">
              <div className="text-left pl-2">{m.nom}</div>
              <div>{m.prenom || "-"}</div>
              <div>{m.sexe || "-"}</div>
              <div>{new Date(m.date_premiere_visite).toLocaleDateString()}</div>
              <div>1</div>
            </div>
          ))}

          <div className="grid grid-cols-5 text-white font-bold mt-4 text-center">
            <div className="text-left pl-2">TOTAL</div>
            <div>-</div>
            <div>{totalHommes} Hommes</div>
            <div>{totalFemmes} Femmes</div>
            <div>{membres.length}</div>
          </div>
        </div>
      )}

      <Footer />

      <style jsx>{`
        .input{
          border:1px solid #ccc;
          padding:10px;
          border-radius:12px;
          background:rgba(255,255,255,0.05);
          color:white;
        }
      `}</style>
    </div>
  );
}
