// pages/membres-cellule.js

"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import Image from "next/image";
import LogoutLink from "../components/LogoutLink";
import EditMemberCellulePopup from "../components/EditMemberCellulePopup";
import MemberDetailsPopup from "../components/MemberDetailsPopup";

export default function MembresCellule() {
  const [membres, setMembres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [prenom, setPrenom] = useState("");
  const [selectedMembre, setSelectedMembre] = useState(null);
  const [view, setView] = useState("card");
  const [editingMember, setEditingMember] = useState(null);
  const [detailsMember, setDetailsMember] = useState(null);

  useEffect(() => {
    const fetchMembres = async () => {
      setLoading(true);
      try {
        const userEmail = localStorage.getItem("userEmail");
        const userRole = JSON.parse(localStorage.getItem("userRole") || "[]");

        if (!userEmail) throw new Error("Utilisateur non connecté");

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, prenom")
          .eq("email", userEmail)
          .single();
        if (profileError) throw profileError;

        setPrenom(profileData?.prenom || "cher membre");
        const responsableId = profileData.id;

        let membresData = [];

        // 🔹 ADMINISTRATEUR
        if (userRole.includes("Administrateur")) {
          const { data: cellulesAdmin, error: cellulesAdminErr } = await supabase
            .from("cellules")
            .select("id");

          if (cellulesAdminErr) throw cellulesAdminErr;

          if (!cellulesAdmin || cellulesAdmin.length === 0) {
            setMessage("Vous n’avez aucune cellule assignée pour le moment.");
            setMembres([]);
            return;
          }

          const celluleIds = cellulesAdmin.map(c => c.id);

          const { data, error } = await supabase
            .from("v_membres_full")
            .select("*")
            .in("cellule_id", celluleIds)
            .or("cellule_nom.not.is.null,suivi_cellule_nom.not.is.null");

          if (error) throw error;

          membresData = data;
        }

        // 🔹 RESPONSABLE CELLULE
        else if (userRole.includes("ResponsableCellule")) {
          const { data: cellulesData, error: cellulesError } = await supabase
            .from("cellules")
            .select("id")
            .eq("responsable_id", responsableId);
          if (cellulesError) throw cellulesError;

          if (!cellulesData || cellulesData.length === 0) {
            setMessage("Vous n’êtes responsable d’aucune cellule pour le moment.");
            setMembres([]);
            return;
          }

          const celluleIds = cellulesData.map(c => c.id);

          const { data, error } = await supabase
            .from("v_membres_full")
            .select("*")
            .in("cellule_id", celluleIds)
            .or("cellule_nom.not.is.null,suivi_cellule_nom.not.is.null");
          if (error) throw error;

          membresData = data;

          if (!membresData || membresData.length === 0) {
            setMessage("Aucun membre assigné à vos cellules.");
          }
        }

        setMembres(membresData || []);
      } catch (err) {
        console.error("❌ Erreur:", err.message || err);
        setMessage("Erreur lors de la récupération des membres.");
        setMembres([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMembres();
  }, []);

  const getCellule = (m) => m.cellule_nom || m.suivi_cellule_nom || "—";

  const getBorderColor = (m) => {
    if (m.statut === "actif") return "#34A853";
    if (m.statut === "inactif") return "#FFA500";
    return "#ccc";
  };

  const handleUpdateMember = (updated) => {
    setMembres(prev =>
      prev.map(m => (m.id === updated.id ? updated : m))
    );
  };

  if (loading) return <p className="text-center mt-10 text-white">Chargement...</p>;
  if (message) return <p className="text-center mt-10 text-white">{message}</p>;

  return (
    <div
      className="min-h-screen flex flex-col items-center p-6"
      style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}
    >
      {/* HEADER */}
      <div className="w-full max-w-5xl mb-6 flex justify-between items-center">
        <button onClick={() => window.history.back()} className="text-white hover:text-gray-200 transition">← Retour</button>
        <LogoutLink className="bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition" />
      </div>

      <div className="mb-4">
        <Image src="/logo.png" alt="Logo" className="w-20 h-20 mx-auto" width={80} height={80} />
      </div>

      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">👥 Membres de ma/mes cellule(s)</h1>
        <p className="text-white text-lg max-w-xl mx-auto italic">Chaque personne a une valeur infinie. Ensemble, nous avançons ❤️</p>
      </div>

      {/* Toggle Carte/Table */}
      <div className="mb-4 flex justify-between w-full max-w-6xl">
        <button
          onClick={() => setView(view === "card" ? "table" : "card")}
          className="text-white text-sm underline hover:text-gray-200"
        >
          {view === "card" ? "Vue Table" : "Vue Carte"}
        </button>
      </div>

      {/* Vue Carte */}
      {view === "card" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-6xl justify-items-center">
          {membres.map(m => (
            <div
              key={m.id}
              className="bg-white p-4 rounded-xl shadow-md border-l-4 w-full transition hover:shadow-lg"
              style={{ borderLeftColor: getBorderColor(m) }}
            >
              <div className="flex flex-col items-center">
                <h2 className="font-bold text-black text-base text-center mb-1">
                  {m.prenom} {m.nom}
                </h2>

                <p className="text-sm text-gray-700 mb-1">📞 {m.telephone || "—"}</p>
                <p className="text-sm text-gray-700 mb-1">📌 Cellule : {getCellule(m)}</p>

                <button
                  onClick={() => setSelectedMembre(selectedMembre === m.id ? null : m.id)}
                  className="text-orange-500 text-sm mt-1"
                >
                  {selectedMembre === m.id ? "Fermer détails" : "Détails"}
                </button>

                {selectedMembre === m.id && (
                  <div className="mt-3 w-full bg-gray-50 p-4 rounded-lg text-left space-y-2">
                    <p><strong>Ville :</strong> {m.ville || "—"}</p>
                    <p><strong>WhatsApp :</strong> {m.is_whatsapp ? "Oui" : "Non"}</p>
                    <p>
                      <strong>Besoin :</strong>{" "}
                      {(() => {
                        if (!m.besoin) return "—";
                        if (Array.isArray(m.besoin)) return m.besoin.join(", ");
                        try {
                          const arr = JSON.parse(m.besoin);
                          return Array.isArray(arr) ? arr.join(", ") : m.besoin;
                        } catch {
                          return m.besoin;
                        }
                      })()}
                    </p>
                    <p><strong>Infos :</strong> {m.infos_supplementaires || "—"}</p>

                    <div className="flex justify-center pt-2">
                      <button
                        onClick={() => setEditingMember(m)}
                        className="text-orange-500 text-sm mt-1"
                      >
                        ✏️ Modifier le contact
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Vue Table
        <div className="w-full max-w-6xl overflow-x-auto flex justify-center">
          <table className="w-full text-sm text-left text-white border-separate border-spacing-0">
            <thead className="bg-gray-200 text-gray-800 text-sm uppercase rounded-t-md">
              <tr>
                <th className="px-4 py-2 rounded-tl-lg">Nom complet</th>
                <th className="px-4 py-2">Téléphone</th>
                <th className="px-4 py-2">Ville</th>
                <th className="px-4 py-2">Cellule</th>
                <th className="px-4 py-2 rounded-tr-lg">Action</th>
              </tr>
            </thead>
            <tbody>
              {membres.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-2 text-white text-center">Aucun membre</td>
                </tr>
              ) : membres.map(m => (
                <tr key={m.id} className="hover:bg-white/10 transition duration-150 border-b border-gray-300">
                  <td className="px-4 py-2 border-l-4 rounded-l-md" style={{ borderLeftColor: getBorderColor(m) }}>
                    {m.prenom} {m.nom}
                  </td>
                  <td className="px-4 py-2">{m.telephone || "—"}</td>
                  <td className="px-4 py-2">{m.ville || "—"}</td>
                  <td className="px-4 py-2">{getCellule(m)}</td>
                  <td className="px-4 py-2">
                    <div className="flex gap-3">
                      <button
                        onClick={() => setDetailsMember(m)}
                        className="text-orange-500 underline text-sm"
                      >
                        Détails
                      </button>

                      <button
                        onClick={() => setEditingMember(m)}
                        className="text-blue-600 underline text-sm"
                      >
                        Modifier
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* POPUP MODIFIER */}
      {editingMember && (
        <EditMemberCellulePopup
          member={editingMember}
          onClose={() => setEditingMember(null)}
          onUpdateMember={handleUpdateMember}
        />
      )}

      {/* POPUP DETAILS */}
      {detailsMember && (
        <MemberDetailsPopup
          member={detailsMember}
          onClose={() => setDetailsMember(null)}
        />
      )}
    </div>
  );
}
