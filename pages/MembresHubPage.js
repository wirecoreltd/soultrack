"use client";

import { useState, useEffect } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import Footer from "../components/Footer";

export default function MembresHubPage() {
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [filterConseiller, setFilterConseiller] = useState("");
  const [kpi, setKpi] = useState({
    presentCulte: 0,
    enCellule: 0,
    integrates: 0,
    enAttente: 0,
    conseillersActifs: 0,
    amesSuivies: 0,
  });
  const [membres, setMembres] = useState([]);
  const [expandedConseillers, setExpandedConseillers] = useState({});

  // 🔹 Récupération profil et initial data
  useEffect(() => {
    const fetchData = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("eglise_id, branche_id")
        .eq("id", user.id)
        .single();

      if (!profile) return;

      // Ici on fetch les membres du hub
      const { data: membresData } = await supabase
        .from("membres_complets")
        .select("*")
        .eq("eglise_id", profile.eglise_id)
        .eq("branche_id", profile.branche_id)
        .gte("created_at", dateDebut || "1900-01-01")
        .lte("created_at", dateFin || "2999-12-31");

      setMembres(membresData || []);
      calculateKPI(membresData || []);
    };

    fetchData();
  }, [dateDebut, dateFin]);

  const calculateKPI = (data) => {
    const presentCulte = data.filter(m => m.present_culte).length;
    const enCellule = data.filter(m => m.en_cellule).length;
    const integrates = data.filter(m => m.integrated).length;
    const enAttente = data.filter(m => m.en_attente).length;
    const conseillersActifs = [...new Set(data.map(m => m.conseiller_id))].length;
    const amesSuivies = data.reduce((acc, m) => acc + (m.ames_suivies || 0), 0);

    setKpi({ presentCulte, enCellule, integrates, enAttente, conseillersActifs, amesSuivies });
  };

  const toggleConseiller = (id) => {
    setExpandedConseillers(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Grouper par conseiller
  const membresParConseiller = membres.reduce((acc, m) => {
    const key = m.conseiller_nom || "Non assigné";
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {});

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />

      <h1 className="text-2xl font-bold text-white mt-4 mb-6">
        📊 <span className="text-white">Membres</span>{" "}
        <span className="text-amber-300">Hub</span>
      </h1>

      {/* FILTRES */}
      <div className="flex flex-wrap gap-4 mb-6 text-white">
        <div className="flex flex-col">
          <label>Date début</label>
          <input
            type="date"
            value={dateDebut}
            onChange={(e) => setDateDebut(e.target.value)}
            className="input"
          />
        </div>
        <div className="flex flex-col">
          <label>Date fin</label>
          <input
            type="date"
            value={dateFin}
            onChange={(e) => setDateFin(e.target.value)}
            className="input"
          />
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="flex flex-wrap gap-4 mb-6 w-full justify-center">
        {[
          { label: "Présent au culte", value: kpi.presentCulte, color: "bg-blue-600" },
          { label: "En cellule", value: kpi.enCellule, color: "bg-green-600" },
          { label: "Intégrés", value: kpi.integrates, color: "bg-orange-600" },
          { label: "En attente", value: kpi.enAttente, color: "bg-red-600" },
          { label: "Conseillers actifs", value: kpi.conseillersActifs, color: "bg-purple-600" },
          { label: "Âmes suivies", value: kpi.amesSuivies, color: "bg-teal-600" },
        ].map((card) => (
          <div key={card.label} className={`${card.color} text-white p-4 rounded-2xl min-w-[150px] text-center shadow-lg`}>
            <div className="text-xl font-bold">{card.value}</div>
            <div className="text-sm mt-1">{card.label}</div>
          </div>
        ))}
      </div>

      {/* TABLEAU MEMBRES PAR CONSEILLER */}
      <div className="w-full max-w-5xl bg-white/10 rounded-2xl p-4 shadow-lg">
        {Object.entries(membresParConseiller).map(([conseiller, list]) => {
          const isExpanded = expandedConseillers[conseiller] || false;
          return (
            <div key={conseiller} className="mb-2">
              <div
                className="flex justify-between items-center p-2 bg-white/20 rounded-lg cursor-pointer text-white font-semibold"
                onClick={() => toggleConseiller(conseiller)}
              >
                <span>{isExpanded ? "➖" : "➕"} {conseiller}</span>
                <span>{list.length} membres</span>
              </div>
              {isExpanded && (
                <div className="overflow-x-auto mt-2">
                  <table className="w-full text-white text-sm">
                    <thead className="bg-white/20">
                      <tr>
                        <th className="p-2 text-left">Nom</th>
                        <th className="p-2 text-left">Statut</th>
                        <th className="p-2 text-left">Date entrée cellule</th>
                        <th className="p-2 text-left">Âmes suivies</th>
                        <th className="p-2 text-left">Intégration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {list.map(m => (
                        <tr key={m.id} className="border-b border-white/20">
                          <td className="p-2">{m.nom} {m.prenom}</td>
                          <td className="p-2">{m.statut}</td>
                          <td className="p-2">{new Date(m.date_entree_cellule).toLocaleDateString()}</td>
                          <td className="p-2">{m.ames_suivies}</td>
                          <td className="p-2">{m.integrated ? "Oui" : "Non"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <Footer />

      <style jsx>{`
        .input {
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
