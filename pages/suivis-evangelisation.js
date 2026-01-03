"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import Image from "next/image";
import LogoutLink from "../components/LogoutLink";
import EditEvangelisePopup from "../components/EditEvangelisePopup";
import DetailsEvangePopup from "../components/DetailsEvangePopup";

export default function SuivisEvangelisation() {
  const [currentUser, setCurrentUser] = useState(null);
  const [suivis, setSuivis] = useState([]);
  const [conseillers, setConseillers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("card");

  // 🔒 états séparés
  const [detailsCarteId, setDetailsCarteId] = useState(null);
  const [detailsTable, setDetailsTable] = useState(null);
  const [editingContact, setEditingContact] = useState(null);
  const [commentChanges, setCommentChanges] = useState({});

  useEffect(() => {
    const getUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (user) setCurrentUser(user);
    };
    getUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchSuivis();
      fetchConseillers();
    }
  }, [currentUser]);

  /* ================= FETCH ================= */
  const fetchSuivis = async () => {
    setLoading(true);

    const { data } = await supabase
      .from("suivis_des_evangelises")
      .select(`*, evangelises (*), cellules (*)`)
      .order("id", { ascending: false })
      // Filtre pour ne voir que les contacts attribués à l'utilisateur connecté
      .or(`conseiller_id.eq.${currentUser.id},cellules.responsable.eq.${currentUser.id}`);

    setSuivis(data || []);
    setLoading(false);
  };

  const fetchConseillers = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("id, prenom, nom")
      .eq("role", "Conseiller");

    setConseillers(data || []);
  };

  /* ================= HELPERS ================= */
  const getBorderColor = (m) => {
    if (m.status_suivis_evangelises === "En cours") return "#FFA500";
    if (m.status_suivis_evangelises === "Integrer") return "#34A853";
    if (m.status_suivis_evangelises === "Venu à l’église") return "#3B82F6";
    return "#ccc";
  };

  const handleCommentChange = (id, value) =>
    setCommentChanges((p) => ({ ...p, [id]: value }));

  const updateSuivi = async (id) => {
    if (!commentChanges[id]) return;

    await supabase
      .from("suivis_des_evangelises")
      .update({ commentaire_evangelises: commentChanges[id] })
      .eq("id", id);

    fetchSuivis();
  };

  const formatBesoin = (b) => {
    if (!b) return "—";
    try {
      const arr = JSON.parse(b);
      return Array.isArray(arr) ? arr.join(", ") : b;
    } catch {
      return b;
    }
  };

  /* ================= VIEW SWITCH ================= */
  const switchView = () => {
    setView(view === "card" ? "table" : "card");
    setDetailsCarteId(null);
    setDetailsTable(null);
    setEditingContact(null);
  };

  if (loading) return <p className="text-center mt-10 text-white">Chargement...</p>;

  /* ================= RENDER ================= */
  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-gradient-to-r from-blue-800 to-cyan-400">
      {/* HEADER */}
      <div className="w-full max-w-5xl mb-6 flex justify-between items-center">
        <button onClick={() => window.history.back()} className="text-white">
          ← Retour
        </button>
        <LogoutLink />
      </div>

      <Image src="/logo.png" alt="Logo" width={80} height={80} />
      <h1 className="text-3xl font-bold text-white mb-6">
        📋 Suivis des Évangélisés
      </h1>

      <button onClick={switchView} className="text-white underline mb-6">
        {view === "card" ? "Vue Table" : "Vue Carte"}
      </button>

      {/* ===================== VUE CARTE ===================== */}
      {view === "card" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-6xl">
          {suivis.map((m) => {
            const ouvert = detailsCarteId === m.id;
            const conseiller = conseillers.find(
              (c) =>
                c.id === m.conseiller_id ||
                c.id === m.cellules?.responsable
            );

            return (
              <div
                key={m.id}
                className="bg-white rounded-2xl shadow-lg p-4 border-l-4"
                style={{ borderLeftColor: getBorderColor(m) }}
              >
                <h2 className="font-bold text-center">
                  {m.evangelises?.prenom} {m.evangelises?.nom}
                </h2>

                <p className="text-sm text-center">
                  📱 {m.evangelises?.telephone || "—"}
                </p>
                <p className="text-sm text-center">
                  🏠 Cellule : {m.cellules?.cellule_full || "—"}
                </p>
                <p className="text-sm text-center">
                  👤 Conseiller :{" "}
                  {conseiller
                    ? `${conseiller.prenom} ${conseiller.nom}`
                    : "—"}
                </p>

                <button
                  onClick={() =>
                    setDetailsCarteId(ouvert ? null : m.id)
                  }
                  className="text-orange-500 underline text-sm block mx-auto mt-2"
                >
                  {ouvert ? "Fermer détails" : "Détails"}
                </button>

                {/* CARRÉ GRANDISSANT */}
                <div
                  className={`overflow-hidden transition-all duration-500 ${
                    ouvert ? "max-h-[1000px] mt-3" : "max-h-0"
                  }`}
                >
                  {ouvert && (
                    <div className="bg-gray-50 rounded-xl p-3 text-sm space-y-2">
                      <p>🏙️ Ville : {m.evangelises?.ville || "—"}</p>
                      <p>⚥ Sexe : {m.evangelises?.sexe || "—"}</p>
                      <p>
                        🙏 Prière salut :{" "}
                        {m.evangelises?.priere_salut ? "Oui" : "Non"}
                      </p>
                      <p>☀️ Type : {m.evangelises?.type_conversion || "—"}</p>
                      <p>❓ Besoin : {formatBesoin(m.evangelises?.besoin)}</p>

                      <textarea
                        rows={2}
                        className="w-full border rounded px-2 py-1"
                        value={
                          commentChanges[m.id] ??
                          m.commentaire_evangelises ??
                          ""
                        }
                        onChange={(e) =>
                          handleCommentChange(m.id, e.target.value)
                        }
                      />

                      <button
                        onClick={() => updateSuivi(m.id)}
                        className="w-full bg-green-600 text-white rounded py-1"
                      >
                        Mettre à jour
                      </button>

                      <button
                        onClick={() =>
                          m.evangelises?.id &&
                          setEditingContact(m.evangelises)
                        }
                        className="text-blue-600 text-sm underline w-full"
                      >
                        ✏️ Modifier
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ===================== VUE TABLE ===================== */}
      {view === "table" && (
        <div className="w-full max-w-6xl overflow-x-auto">
          <div className="min-w-[900px]">
            <table className="w-full text-sm bg-white rounded-lg shadow">
              <thead className="bg-gray-200 uppercase">
                <tr>
                  <th className="px-3 py-2">Nom complet</th>
                  <th className="px-3 py-2">Téléphone</th>
                  <th className="px-3 py-2">Attribué à</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>

              <tbody>
                {suivis.map((m) => {
                  const conseiller = conseillers.find(
                    (c) =>
                      c.id === m.conseiller_id ||
                      c.id === m.cellules?.responsable
                  );

                  return (
                    <tr key={m.id} className="border-b">
                      <td className="px-3 py-2">
                        {m.evangelises?.prenom} {m.evangelises?.nom}
                      </td>
                      <td className="px-3 py-2">
                        {m.evangelises?.telephone || "—"}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        {m.cellules?.cellule_full
                          ? `🏠 ${m.cellules.cellule_full}`
                          : conseiller
                          ? `👤 ${conseiller.prenom} ${conseiller.nom}`
                          : "—"}
                      </td>

                      <td className="px-3 py-2 flex gap-3">
                        <button
                          onClick={() => setDetailsTable(m)}
                          className="text-orange-500 underline"
                        >
                          Détails
                        </button>
                        <button
                          onClick={() =>
                            m.evangelises?.id &&
                            setEditingContact(m.evangelises)
                          }
                          className="text-blue-600 underline"
                        >
                          Modifier
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= POPUP TABLE UNIQUEMENT ================= */}
      {view === "table" && detailsTable && (
        <DetailsEvangePopup
          member={detailsTable}
          onClose={() => setDetailsTable(null)}
          onEdit={(s) => {
            setDetailsTable(null);
            s.evangelises?.id && setEditingContact(s.evangelises);
          }}
        />
      )}

      {editingContact && (
        <EditEvangelisePopup
          member={editingContact}
          onClose={() => setEditingContact(null)}
          onUpdateMember={() => {
            setEditingContact(null);
            fetchSuivis();
          }}
        />
      )}
    </div>
  );
}
