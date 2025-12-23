"use client";

import { useEffect, useState, useRef } from "react";
import React from "react";
import supabase from "../lib/supabaseClient";
import Image from "next/image";
import LogoutLink from "../components/LogoutLink";
import EditMemberSuivisPopup from "../components/EditMemberSuivisPopup";
import DetailsModal from "../components/DetailsModal";
import { useMembers } from "../context/MembersContext";

export default function SuivisMembres() {
  const { members, setAllMembers, updateMember } = useMembers();

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [prenom, setPrenom] = useState("");
  const [role, setRole] = useState("");

  const [view, setView] = useState("card");
  const [editMember, setEditMember] = useState(null);
  const [detailsModalMember, setDetailsModalMember] = useState(null);

  const [statusChanges, setStatusChanges] = useState({});
  const [commentChanges, setCommentChanges] = useState({});
  const [updating, setUpdating] = useState({});
  const [detailsOpen, setDetailsOpen] = useState(null);

  const [cellulesMap, setCellulesMap] = useState({});
  const [conseillersMap, setConseillersMap] = useState({});

  const toggleDetails = (id) =>
    setDetailsOpen((prev) => (prev === id ? null : id));

  /* =========================
     STATUT SUIVIS
  ========================== */
  const statutIds = { envoye: 1, attente: 2, integrer: 3, refus: 4 };
  const statutLabels = {
    1: "Envoyé",
    2: "En attente",
    3: "Intégré",
    4: "Refus",
  };

  /* =========================
     FETCH UTILISATEUR + MEMBRES
  ========================== */
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
          const { data: cellules } = await supabase
            .from("cellules")
            .select("id")
            .eq("responsable_id", profile.id);

          const ids = cellules?.map((c) => c.id) || [];
          query = ids.length ? query.in("cellule_id", ids) : query.eq("id", -1);
        }

        const { data } = await query;
        setAllMembers(data || []);
      } catch (err) {
        console.error(err);
        setMessage({ type: "error", text: "Erreur de chargement" });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [setAllMembers]);

  /* =========================
     FETCH CELLULES & CONSEILLERS
  ========================== */
  useEffect(() => {
    const loadRefs = async () => {
      const { data: cellules } = await supabase
        .from("cellules")
        .select("id, cellule");

      const { data: conseillers } = await supabase
        .from("profiles")
        .select("id, prenom, nom")
        .eq("role", "Conseiller");

      setCellulesMap(
        Object.fromEntries((cellules || []).map((c) => [c.id, c.cellule]))
      );

      setConseillersMap(
        Object.fromEntries(
          (conseillers || []).map((c) => [
            c.id,
            `${c.prenom} ${c.nom}`,
          ])
        )
      );
    };

    loadRefs();
  }, []);

  /* =========================
     HELPERS
  ========================== */
  const getAttribution = (m) => {
    if (m.cellule_id && cellulesMap[m.cellule_id]) {
      return `🏠 ${cellulesMap[m.cellule_id]}`;
    }
    if (m.conseiller_id && conseillersMap[m.conseiller_id]) {
      return `👤 ${conseillersMap[m.conseiller_id]}`;
    }
    return "—";
  };

  const getBorderColor = (m) => {
    const status = m.statut_suivis ?? m.suivi_statut;
    if (status === 1) return "#3B82F6";
    if (status === 2) return "#F59E0B";
    if (status === 3) return "#22C55E";
    if (status === 4) return "#EF4444";
    return "#ccc";
  };

  const filteredMembers = members.filter((m) => {
    const status = m.statut_suivis;
    return status === 1 || status === 2;
  });

  const uniqueMembers = Array.from(
    new Map(filteredMembers.map((m) => [m.id, m])).values()
  );

  /* =========================
     UPDATE SUIVIS
  ========================== */
  const updateSuivi = async (id) => {
    const payload = {
      statut_suivis: statusChanges[id],
      commentaire_suivis: commentChanges[id],
      updated_at: new Date(),
    };

    setUpdating((p) => ({ ...p, [id]: true }));

    try {
      const { data } = await supabase
        .from("membres_complets")
        .update(payload)
        .eq("id", id)
        .select()
        .single();

      updateMember(id, data);
      setMessage({ type: "success", text: "Mise à jour effectuée" });
    } catch (err) {
      setMessage({ type: "error", text: "Erreur de mise à jour" });
    } finally {
      setUpdating((p) => ({ ...p, [id]: false }));
    }
  };

  /* =========================
     RENDER
  ========================== */
  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-blue-800 to-cyan-300">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between mb-4 text-white">
          <button onClick={() => history.back()}>← Retour</button>
          <LogoutLink />
        </div>

        <div className="text-center mb-6">
          <Image src="/logo.png" alt="Logo" width={80} height={80} />
          <h1 className="text-3xl font-bold text-white mt-2">
            📋 Suivis des Membres
          </h1>
          <p className="text-white italic">
            Bienvenue {prenom}
          </p>
        </div>

        <div className="flex justify-between mb-4 text-white">
          <button onClick={() => setView(view === "card" ? "table" : "card")}>
            {view === "card" ? "Vue Table" : "Vue Carte"}
          </button>
        </div>

        {/* ========================= CARDS ========================= */}
        {view === "card" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {uniqueMembers.map((m) => (
              <div
                key={m.id}
                className="bg-white p-4 rounded-xl border-l-4"
                style={{ borderLeftColor: getBorderColor(m) }}
              >
                <h2 className="font-bold text-center">
                  {m.prenom} {m.nom}
                </h2>
                <p className="text-sm text-center">📞 {m.telephone}</p>
                <p className="text-sm text-center">
                  📋 {statutLabels[m.statut_suivis]}
                </p>
                <p className="text-sm text-center mt-1">
                  {getAttribution(m)}
                </p>

                <button
                  onClick={() => toggleDetails(m.id)}
                  className="text-blue-600 underline text-sm mt-2 w-full"
                >
                  Détails
                </button>

                {detailsOpen === m.id && (
                  <div className="mt-2 text-sm">
                    <button
                      onClick={() => setEditMember(m)}
                      className="text-orange-500 underline w-full"
                    >
                      Modifier
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ========================= TABLE ========================= */}
        {view === "table" && (
          <table className="w-full text-white">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Téléphone</th>
                <th>Statut</th>
                <th>Attribué à</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {uniqueMembers.map((m) => (
                <tr key={m.id}>
                  <td>{m.prenom} {m.nom}</td>
                  <td>{m.telephone}</td>
                  <td>{statutLabels[m.statut_suivis]}</td>
                  <td>{getAttribution(m)}</td>
                  <td>
                    <button onClick={() => setEditMember(m)}>
                      Modifier
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {editMember && (
          <EditMemberSuivisPopup
            member={editMember}
            onClose={() => setEditMember(null)}
            onUpdateMember={updateMember}
          />
        )}

        {detailsModalMember && (
          <DetailsModal
            m={detailsModalMember}
            onClose={() => setDetailsModalMember(null)}
            updateSuivi={updateSuivi}
          />
        )}
      </div>
    </div>
  );
}
