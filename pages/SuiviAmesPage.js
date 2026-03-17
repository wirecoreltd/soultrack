"use client";

import { useState, useEffect } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import Footer from "../components/Footer";
import ProtectedRoute from "../components/ProtectedRoute";

export default function ParcoursEvangelisesPage() {
  const [contacts, setContacts] = useState([]);
  const [checkedContacts, setCheckedContacts] = useState({});
  const [popupMember, setPopupMember] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);

  // Récupération des données avec scroll infini
  useEffect(() => {
    fetchContacts(page);
  }, [page]);

  const fetchContacts = async (pageNumber) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("membres_complets")
      .select(`
        id,
        prenom,
        nom,
        telephone,
        ville,
        created_at,
        date_envoi_suivi,
        suivi_updated_at,
        integration_fini,
        bapteme_eau,
        Ministere,
        suivi_responsable,
        statut_suivis,
        status_suivi,
        evangelise_member_id
      `)
      .order("created_at", { ascending: false })
      .range(pageNumber * 100, (pageNumber + 1) * 100 - 1); // 100 par batch

    if (error) console.error(error);
    else setContacts((prev) => [...prev, ...data]);

    setLoading(false);
  };

  const handleCheck = (id) => {
    setCheckedContacts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getBorderColor = (m) => {
    switch (m.statut_suivis || m.status_suivi) {
      case "Intégré":
        return "#00FF00";
      case "En cours":
      case "Envoyé":
        return "#FFA500";
      case "Refus":
        return "#FF0000";
      default:
        return "#999999";
    }
  };

  const calculateDays = (m) => {
    const start = new Date(m.created_at);
    const end = new Date();
    return Math.floor((end - start) / (1000 * 60 * 60 * 24));
  };

  return (
    <ProtectedRoute allowedRoles={["Administrateur", "Responsable"]}>
      <HeaderPages />
      <div className="min-h-screen p-6" style={{ background: "#333699" }}>
        <h1 className="text-2xl font-bold text-white mb-4">
          De l’Évangélisation à l’Intégration
        </h1>

        {/* VUE TABLE */}
        {contacts && (
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
                <div className="flex-[1] flex justify-center items-center">Sélectionner</div>
                <div className="flex-[1]">Action</div>
              </div>

              {contacts.map((m) => (
                <div
                  key={m.id}
                  className="flex flex-row items-center px-2 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition duration-150 gap-2 border-l-4"
                  style={{ borderLeftColor: getBorderColor(m) }}
                >
                  <div className="flex-[2] text-white flex items-center gap-1">
                    {m.prenom} {m.nom}
                  </div>
                  <div className="flex-[1] text-white">{m.statut_suivis || m.status_suivi}</div>
                  <div className="flex-[1] text-white">{calculateDays(m)}</div>
                  <div className="flex-[1] text-white">{new Date(m.created_at).toLocaleDateString()}</div>
                  <div className="flex-[1] text-white">
                    {m.date_envoi_suivi ? new Date(m.date_envoi_suivi).toLocaleDateString() : "—"}
                  </div>
                  <div className="flex-[1] text-white">
                    {m.suivi_updated_at ? new Date(m.suivi_updated_at).toLocaleDateString() : "—"}
                  </div>
                  <div className="flex-[1] text-white">
                    {m.integration_fini ? new Date(m.integration_fini).toLocaleDateString() : "—"}
                  </div>
                  <div className="flex-[1] text-white">{m.bapteme_eau || "—"}</div>
                  <div className="flex-[1] text-white">{m.Ministere || "—"}</div>
                  <div className="flex-[1] text-white">{m.suivi_responsable || "—"}</div>
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
          </div>
        )}

        {loading && <p className="text-white mt-4">Chargement...</p>}
      </div>

      <Footer />

      {/* POPUP MEMBER */}
      {popupMember && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-11/12 max-w-2xl text-black">
            <h2 className="font-bold text-xl mb-4">{popupMember.prenom} {popupMember.nom}</h2>
            <p><strong>Statut:</strong> {popupMember.statut_suivis || popupMember.status_suivi}</p>
            <p><strong>Évangélisé:</strong> {new Date(popupMember.created_at).toLocaleDateString()}</p>
            <p><strong>Envoyé:</strong> {popupMember.date_envoi_suivi ? new Date(popupMember.date_envoi_suivi).toLocaleDateString() : "—"}</p>
            <p><strong>Suivi:</strong> {popupMember.suivi_updated_at ? new Date(popupMember.suivi_updated_at).toLocaleDateString() : "—"}</p>
            <p><strong>Intégré:</strong> {popupMember.integration_fini ? new Date(popupMember.integration_fini).toLocaleDateString() : "—"}</p>
            <p><strong>Baptême:</strong> {popupMember.bapteme_eau || "—"}</p>
            <p><strong>Ministère:</strong> {popupMember.Ministere || "—"}</p>
            <p><strong>Responsable:</strong> {popupMember.suivi_responsable || "—"}</p>
            <button
              className="mt-4 bg-orange-500 text-white px-4 py-2 rounded"
              onClick={() => setPopupMember(null)}
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
