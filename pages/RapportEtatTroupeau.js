"use client";

import { useEffect, useState, useRef } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import Footer from "../components/Footer";
import ProtectedRoute from "../components/ProtectedRoute";

export default function RapportFormationPage() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableFormation"]}>
      <RapportFormation />
    </ProtectedRoute>
  );
}

function RapportFormation() {
  const [formData, setFormData] = useState({
    eglise_id: null,
    branche_id: null,
  });

  const [filterDebut, setFilterDebut] = useState("");
  const [filterFin, setFilterFin] = useState("");
  const [rapports, setRapports] = useState([]);
  const [showTable, setShowTable] = useState(false);

  const formRef = useRef(null);

  /* ================= USER ================= */
  useEffect(() => {
    const fetchUser = async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("eglise_id, branche_id")
        .eq("id", session.session.user.id)
        .single();

      if (profile) {
        setFormData({
          eglise_id: profile.eglise_id,
          branche_id: profile.branche_id,
        });
      }
    };
    fetchUser();
  }, []);

  /* ================= FETCH ================= */
  const fetchRapports = async () => {
    if (!formData.eglise_id || !formData.branche_id) return;

    let query = supabase
      .from("membres_complets")
      .select(`
        id, nom, prenom, created_at, etat_contact,
        date_premiere_visite, venu, conseiller_id, cellule_id,
        statut_suivis, suivi_commentaire_suivis
      `)
      .eq("eglise_id", formData.eglise_id)
      .eq("branche_id", formData.branche_id)
      .eq("etat_contact", "nouveau")
      .order("created_at", { ascending: true });

    if (filterDebut) query = query.gte("created_at", filterDebut);
    if (filterFin) query = query.lte("created_at", filterFin);

    const { data, error } = await query;
    if (error) {
      console.error("Erreur fetchRapports:", error);
      setRapports([]);
      return;
    }

    setRapports(data || []);
    setShowTable(true);
  };

  /* ================= UTIL ================= */
  const formatDateFR = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  /* ================= RENDER ================= */
  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />

      <h1 className="text-2xl font-bold mt-4 mb-6 text-center">
        <span className="text-white">Rapport </span>
        <span className="text-amber-300">Nouveaux Contacts</span>
      </h1>

      {/* ================= FILTRES ================= */}
      <div className="bg-white/10 p-6 rounded-2xl shadow-lg mt-2 flex justify-center gap-4 flex-wrap text-white">
        <input
          type="date"
          value={filterDebut}
          onChange={(e) => setFilterDebut(e.target.value)}
          className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white"
        />
        <input
          type="date"
          value={filterFin}
          onChange={(e) => setFilterFin(e.target.value)}
          className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white"
        />
        <button
          onClick={fetchRapports}
          className="bg-[#2a2f85] px-6 py-2 rounded-xl hover:bg-[#1f2366]"
        >
          Générer
        </button>
      </div>

      {/* ================= TABLEAU ================= */}
      {showTable && (
        <div className="w-full max-w-full overflow-x-auto mt-6 flex justify-center">
          <div className="w-max space-y-2">
            {/* HEADER */}
            <div className="flex text-sm font-semibold uppercase text-white px-4 py-3 border-b border-white/30 bg-white/5 rounded-t-xl whitespace-nowrap">
              <div className="min-w-[120px]">Nom</div>
              <div className="min-w-[120px]">Prénom</div>
              <div className="min-w-[120px]">Date d’arrivée</div>
              <div className="min-w-[120px]">État contact</div>
              <div className="min-w-[120px]">Envoyé vers suivi</div>
              <div className="min-w-[120px]">Venu par</div>
              <div className="min-w-[200px]">Responsable suivi</div>
              <div className="min-w-[120px]">Statut suivi</div>
              <div className="min-w-[200px]">Commentaire suivi</div>
            </div>

            {rapports.map((r) => (
              <div
                key={r.id}
                className="flex items-center px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
              >
                <div className="min-w-[120px] text-white">{r.nom}</div>
                <div className="min-w-[120px] text-white">{r.prenom}</div>
                <div className="min-w-[120px] text-white">{formatDateFR(r.created_at)}</div>
                <div className="min-w-[120px] text-white">{r.etat_contact}</div>
                <div className="min-w-[120px] text-white">{formatDateFR(r.date_premiere_visite)}</div>
                <div className="min-w-[120px] text-white">{r.venu}</div>
                <div className="min-w-[200px] text-white">
                  {/* Ici on peut récupérer le nom du conseiller et cellule via une jointure */}
                  {r.conseiller_id || r.cellule_id || "-"}
                </div>
                <div className="min-w-[120px] text-white">{r.statut_suivis}</div>
                <div className="min-w-[200px] text-white">{r.suivi_commentaire_suivis || "-"}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
