"use client";

import { useEffect, useState, useRef } from "react";
import React from "react";
import supabase from "../lib/supabaseClient";
import Image from "next/image";
import LogoutLink from "../components/LogoutLink";
import EditMemberSuivisPopup from "../components/EditMemberSuivisPopup";
import BoutonEnvoyer from "../components/BoutonEnvoyer";
import DetailsModal from "../components/DetailsModal";
import { useMembers } from "../context/MembersContext";

export default function SuivisMembres() {
  const { members, setAllMembers, updateMember } = useMembers();

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [prenom, setPrenom] = useState("");
  const [role, setRole] = useState([]);

  const [detailsModalMember, setDetailsModalMember] = useState(null);
  const [statusChanges, setStatusChanges] = useState({});
  const [commentChanges, setCommentChanges] = useState({});
  const [updating, setUpdating] = useState({});

  const [view, setView] = useState("card");
  const [editMember, setEditMember] = useState(null);
  const [showRefus, setShowRefus] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(null);

  const [cellules, setCellules] = useState([]);
  const [conseillers, setConseillers] = useState([]);

  const toggleDetails = (id) =>
    setDetailsOpen((prev) => (prev === id ? null : id));

  const statutIds = { envoye: 1, "en attente": 2, integrer: 3, refus: 4 };
  const statutLabels = { 1: "Envoyé", 2: "En attente", 3: "Intégrer", 4: "Refus" };

  /* =======================
     FETCH MEMBRES + DATA
  ======================= */
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Utilisateur non connecté");

        const { data: profile } = await supabase
          .from("profiles")
          .select("id, prenom, role")
          .eq("id", user.id)
          .single();

        setPrenom(profile?.prenom || "");
        setRole(profile?.role || "");

        let query = supabase
          .from("membres_complets")
          .select("*")
          .order("created_at", { ascending: false });

        if (profile.role === "Conseiller") {
          query = query.eq("conseiller_id", profile.id);
        }

        if (profile.role === "ResponsableCellule") {
          const { data: cellulesResp } = await supabase
            .from("cellules")
            .select("id")
            .eq("responsable_id", profile.id);

          const ids = cellulesResp?.map((c) => c.id) || [];
          query = ids.length ? query.in("cellule_id", ids) : query.eq("id", -1);
        }

        const { data: membres } = await query;
        setAllMembers(membres || []);

        const { data: cellulesData } = await supabase
          .from("cellules")
          .select("id, cellule");

        const { data: conseillersData } = await supabase
          .from("profiles")
          .select("id, prenom, nom")
          .eq("role", "Conseiller");

        setCellules(cellulesData || []);
        setConseillers(conseillersData || []);
      } catch (err) {
        console.error(err);
        setMessage("Erreur lors du chargement.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [setAllMembers]);

  /* =======================
     HELPERS
  ======================= */
  const getCelluleName = (id) => {
    const c = cellules.find((c) => c.id === id);
    return c ? c.cellule : null;
  };

  const getConseillerName = (id) => {
    const c = conseillers.find((c) => c.id === id);
    return c ? `${c.prenom} ${c.nom}` : null;
  };

  const getBorderColor = (m) => {
    const s = m.statut_suivis ?? m.suivi_statut;
    if (s === 2) return "#FFA500";
    if (s === 3) return "#34A853";
    if (s === 4) return "#FF4B5C";
    if (s === 1) return "#3B82F6";
    return "#ccc";
  };

  const filteredMembers = members.filter((m) => {
    const s = m.statut_suivis ?? 0;
    return s === 1 || s === 2;
  });

  const uniqueMembers = Array.from(
    new Map(filteredMembers.map((m) => [m.id, m])).values()
  );

  /* =======================
     DETAILS POPUP
  ======================= */
  const DetailsPopup = ({ m }) => (
    <div className="text-black text-sm space-y-2">
      <p>📞 {m.telephone || "—"}</p>
      <p>🏙 Ville : {m.ville || "—"}</p>
      <p>
        🏠 Attribution :{" "}
        {getCelluleName(m.cellule_id)
          ? getCelluleName(m.cellule_id)
          : getConseillerName(m.conseiller_id) || "—"}
      </p>
      <div className="pt-3 text-center">
        <button
          onClick={() => setEditMember(m)}
          className="text-blue-600 underline text-sm"
        >
          ✏️ Modifier le contact
        </button>
      </div>
    </div>
  );

  /* =======================
     RENDER
  ======================= */
  return (
    <div
      className="min-h-screen flex flex-col items-center p-6"
      style={{
        background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)",
      }}
    >
      <div className="w-full max-w-5xl mb-6">
        <div className="flex justify-between items-center">
          <button
            onClick={() => window.history.back()}
            className="text-white"
          >
            ← Retour
          </button>
          <LogoutLink className="bg-white/10 text-white px-4 py-2 rounded-lg" />
        </div>
      </div>

      <Image src="/logo.png" alt="Logo" width={80} height={80} />

      <h1 className="text-3xl font-bold text-white mt-4 mb-6">
        📋 Suivis des Membres
      </h1>

      <button
        onClick={() => setView(view === "card" ? "table" : "card")}
        className="text-white underline mb-4"
      >
        {view === "card" ? "Vue Table" : "Vue Carte"}
      </button>

      {/* ===== CARTE ===== */}
      {view === "card" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-6xl">
          {uniqueMembers.map((m) => (
            <div
              key={m.id}
              className="bg-white p-4 rounded-xl border-l-4"
              style={{ borderLeftColor: getBorderColor(m) }}
            >
              <h2 className="font-bold">
                {m.prenom} {m.nom}
              </h2>
              <p className="text-sm">
                {getCelluleName(m.cellule_id)
                  ? `🏠 ${getCelluleName(m.cellule_id)}`
                  : `👤 ${getConseillerName(m.conseiller_id) || "—"}`}
              </p>

              <button
                onClick={() => toggleDetails(m.id)}
                className="text-orange-500 underline text-sm mt-2"
              >
                Détails
              </button>

              {detailsOpen === m.id && <DetailsPopup m={m} />}
            </div>
          ))}
        </div>
      )}

      {/* ===== TABLE ===== */}
      {view === "table" && (
        <table className="w-full max-w-6xl text-white text-sm mt-6">
          <thead>
            <tr>
              <th className="text-left">Nom</th>
              <th className="text-left">Téléphone</th>
              <th className="text-left">Attribué à</th>
            </tr>
          </thead>
          <tbody>
            {uniqueMembers.map((m) => (
              <tr key={m.id}>
                <td>{m.prenom} {m.nom}</td>
                <td>{m.telephone || "—"}</td>
                <td>
                  {getCelluleName(m.cellule_id)
                    ? getCelluleName(m.cellule_id)
                    : getConseillerName(m.conseiller_id) || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {editMember && (
        <EditMemberSuivisPopup
          member={editMember}
          cellules={cellules}
          conseillers={conseillers}
          onClose={() => setEditMember(null)}
          onUpdateMember={updateMember}
        />
      )}
    </div>
  );
}
