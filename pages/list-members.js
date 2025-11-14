"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import Image from "next/image";
import BoutonEnvoyer from "../components/BoutonEnvoyer";
import LogoutLink from "../components/LogoutLink";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import DetailsPopup from "../components/DetailsPopup";
import EditMemberPopup from "../components/EditMemberPopup";

export default function ListMembers() {
  const [members, setMembers] = useState([]);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [detailsOpen, setDetailsOpen] = useState({});
  const [cellules, setCellules] = useState([]);
  const [selectedCellules, setSelectedCellules] = useState({});
  const [view, setView] = useState("card");
  const [popupMember, setPopupMember] = useState(null);
  const [editMember, setEditMember] = useState(null);
  const [session, setSession] = useState(null);
  const [prenom, setPrenom] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  // Toast
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // ==================== FETCH SESSION & MEMBERS ====================
  useEffect(() => {
    const fetchSessionAndProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session?.user) {
        const { data } = await supabase.from("profiles").select("prenom").eq("id", session.user.id).single();
        if (data) setPrenom(data.prenom);
      }
    };
    fetchSessionAndProfile();
    fetchMembers();
    fetchCellules();
  }, []);

  useEffect(() => { fetchMembers(); }, [refreshKey]);

  const fetchMembers = async () => {
    const { data } = await supabase.from("membres").select("*").order("created_at", { ascending: false });
    if (data) setMembers(data);
  };

  const fetchCellules = async () => {
    const { data } = await supabase.from("cellules").select("id, cellule, responsable, telephone");
    if (data) setCellules(data);
  };

  // ==================== UTILS ====================
  const handleChangeStatus = async (id, newStatus) => {
    await supabase.from("membres").update({ statut: newStatus }).eq("id", id);
    setMembers(prev => prev.map(m => (m.id === id ? { ...m, statut: newStatus } : m)));
    showToastMessage("✅ Message envoyé et suivi enregistré !");
  };

  const handleStatusUpdateFromEnvoyer = (id, currentStatus) => {
    if (currentStatus === "visiteur" || currentStatus === "veut rejoindre ICC") handleChangeStatus(id, "actif");
    setPopupMember(null);
  };

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  const getBorderColor = (m) => {
    if (m.star) return "#FBC02D";
    if (m.statut === "actif") return "#4285F4";
    if (m.statut === "a déjà mon église") return "#EA4335";
    if (m.statut === "Integrer") return "#FFA500";
    if (m.statut === "ancien") return "#999999";
    if (m.statut === "veut rejoindre ICC" || m.statut === "visiteur") return "#34A853";
    return "#ccc";
  };

  const formatDate = (dateStr) => {
    try { return format(new Date(dateStr), "EEEE d MMMM yyyy", { locale: fr }); }
    catch { return ""; }
  };

  const filterBySearch = (list) => list.filter(m => `${m.prenom} ${m.nom}`.toLowerCase().includes(search.toLowerCase()));

  const nouveaux = members.filter(m => m.statut === "visiteur" || m.statut === "veut rejoindre ICC");
  const anciens = members.filter(m => m.statut !== "visiteur" && m.statut !== "veut rejoindre ICC");

  const nouveauxFiltres = filterBySearch(filter ? nouveaux.filter(m => m.statut === filter) : nouveaux);
  const anciensFiltres = filterBySearch(filter ? anciens.filter(m => m.statut === filter) : anciens);

  const statusOptions = ["actif","Integrer","ancien","veut rejoindre ICC","visiteur","a déjà mon église"];
  const totalCount = [...nouveauxFiltres, ...anciensFiltres].length;
  const toggleDetails = (id) => setDetailsOpen(prev => ({ ...prev, [id]: !prev[id] }));

  // ==================== RETURN ====================
  return (
    <div className="min-h-screen flex flex-col items-center p-6" style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}>
      {/* Top bar */}
      <div className="w-full max-w-5xl mb-6">
        <div className="flex justify-between items-center">
          <button onClick={() => window.history.back()} className="flex items-center text-white hover:text-gray-200">← Retour</button>
          <LogoutLink className="bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20" />
        </div>
        <div className="flex justify-end mt-2">
          <p className="text-orange-200 text-sm">👋 Bienvenue {prenom || "cher membre"}</p>
        </div>
      </div>

      {/* Logo */}
      <div className="mb-4"><Image src="/logo.png" alt="SoulTrack Logo" className="w-20 h-18 mx-auto" /></div>

      {/* Titre */}
      <div className="text-center mb-4">
        <h1 className="text-3xl font-bold text-white mb-2">Liste des Membres</h1>
        <p className="text-white text-lg font-light italic max-w-xl mx-auto">Chaque personne a une valeur infinie. Ensemble, nous avançons ❤️</p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-center w-full max-w-5xl mb-4">
        <div className="flex items-center space-x-2">
          <select value={filter} onChange={e => setFilter(e.target.value)} className="px-3 py-2 rounded-lg border text-sm">
            <option value="">Tous les statuts</option>
            {statusOptions.map(s => <option key={s}>{s}</option>)}
          </select>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." className="px-3 py-2 rounded-lg border text-sm w-48" />
          <span className="text-white text-sm">({totalCount})</span>
        </div>
        <button onClick={() => setView(view === "card" ? "table" : "card")} className="text-white text-sm underline">{view === "card" ? "Vue Table" : "Vue Carte"}</button>
      </div>

      {/* Toast */}
      {showToast && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50">
          {toastMessage}
        </div>
      )}

      {/* ==================== VUE CARTE ==================== */}
      {view === "card" && (
        <div className="w-full max-w-5xl space-y-8">
          {/* ... Ici tu peux garder exactement le code des cartes existant ... */}
        </div>
      )}

      {/* ==================== VUE TABLE ==================== */}
      {view === "table" && (
        <div className="w-full max-w-6xl overflow-x-auto transition duration-200">
          <table className="w-full text-sm text-left border-separate border-spacing-0">
            <thead className="bg-gray-200 text-gray-800 text-sm uppercase">
              <tr>
                <th className="px-4 py-2 rounded-tl-lg">Nom complet</th>
                <th className="px-4 py-2">Téléphone</th>
                <th className="px-4 py-2">Statut</th>
                <th className="px-4 py-2 rounded-tr-lg">Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* Nouveaux membres */}
              {nouveauxFiltres.length > 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-2 text-white font-semibold">
                    💖 Bien aimé venu le {formatDate(nouveauxFiltres[0].created_at)}
                  </td>
                </tr>
              )}
              {nouveauxFiltres.map(m => (
                <tr key={m.id} className="border-b border-gray-300">
                  <td className="px-4 py-2 border-l-4 rounded-l-md flex items-center gap-2" style={{ borderLeftColor: getBorderColor(m) }}>
                    {m.prenom} {m.nom} {m.star && <span className="text-yellow-400 ml-1">⭐</span>}
                    <span className="bg-blue-500 text-white text-xs px-1 rounded ml-2">Nouveau</span>
                  </td>
                  <td className="px-4 py-2 text-white">{m.telephone || "—"}</td>
                  <td className="px-4 py-2 text-white">{m.statut || "—"}</td>
                  <td className="px-4 py-2 flex items-center gap-4">
                    <button onClick={() => setPopupMember(popupMember?.id === m.id ? null : m)} className="text-orange-500 underline text-sm">{popupMember?.id === m.id ? "Fermer détails" : "Détails"}</button>
                    <button onClick={() => setEditMember(m)} className="text-blue-600 underline text-sm">✏️ Modifier</button>
                  </td>
                </tr>
              ))}

              {/* Anciens membres */}
              {anciensFiltres.length > 0 && (
                <>
                  <tr>
                    <td colSpan={4} className="px-4 py-2 font-semibold text-lg text-white">
                      <span style={{ background: "linear-gradient(to right, #3B82F6, #D1D5DB)", WebkitBackgroundClip: "text", color: "transparent" }}>Membres existants</span>
                    </td>
                  </tr>
                  {anciensFiltres.map(m => (
                    <tr key={m.id} className="border-b border-gray-300">
                      <td className="px-4 py-2 border-l-4 rounded-l-md flex items-center gap-2" style={{ borderLeftColor: getBorderColor(m) }}>{m.prenom} {m.nom} {m.star && <span className="text-yellow-400 ml-1">⭐</span>}</td>
                      <td className="px-4 py-2 text-white">{m.telephone || "—"}</td>
                      <td className="px-4 py-2 text-white">{m.statut || "—"}</td>
                      <td className="px-4 py-2 flex items-center gap-4">
                        <button onClick={() => setPopupMember(popupMember?.id === m.id ? null : m)} className="text-orange-500 underline text-sm">{popupMember?.id === m.id ? "Fermer détails" : "Détails"}</button>
                        <button onClick={() => setEditMember(m)} className="text-blue-600 underline text-sm">✏️ Modifier</button>
                      </td>
                    </tr>
                  ))}
                </>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* POPUPS */}
      {popupMember && (
        <DetailsPopup
          member={popupMember}
          onClose={() => setPopupMember(null)}
          statusOptions={statusOptions}
          cellules={cellules}
          selectedCellules={selectedCellules}
          setSelectedCellules={setSelectedCellules}
          handleChangeStatus={handleChangeStatus}
          handleStatusUpdateFromEnvoyer={handleStatusUpdateFromEnvoyer}
          session={session}
        />
      )}

      {editMember && (
        <EditMemberPopup
          member={editMember}
          cellules={cellules}
          onClose={() => setEditMember(null)}
          onUpdateMember={(updated) => {
            setMembers(prev => prev.map(m => (m.id === updated.id ? updated : m)));
            setEditMember(null);
          }}
        />
      )}
    </div>
  );
}
