"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import Image from "next/image";
import LogoutLink from "../components/LogoutLink";
import EditEvangelisePopup from "../components/EditEvangelisePopup";
import DetailsEvangePopup from "../components/DetailsEvangePopup";

export default function SuivisEvangelisation() {
  const [allSuivis, setAllSuivis] = useState([]);
  const [conseillers, setConseillers] = useState([]);
  const [cellules, setCellules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("card");
  const [updating, setUpdating] = useState({});
  const [detailsCarteId, setDetailsCarteId] = useState(null);
  const [detailsTable, setDetailsTable] = useState(null);
  const [editingContact, setEditingContact] = useState(null);
  const [commentChanges, setCommentChanges] = useState({});
  const [statusChanges, setStatusChanges] = useState({});
  const [showRefus, setShowRefus] = useState(false);
  const [user, setUser] = useState(null);

  // ================= INIT =================
  const init = async () => {
    const userData = await fetchUser();
    await fetchConseillers();
    const cellulesData = await fetchCellules();
    if (userData) {
      await fetchSuivis(userData, cellulesData);
    }
    setLoading(false);
  };

  // 🔹 DÉMARRAGE DE LA PAGE
  useEffect(() => {
    init();
  }, []);

  // ================= USER =================
  const fetchUser = async () => {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) return null;

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.session.user.id)
      .single();

    setUser(data);
    return data;
  };

  // ================= CONSEILLERS =================
  const fetchConseillers = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("id, prenom, nom")
      .eq("role", "Conseiller");

    setConseillers(data || []);
  };

  // ================= CELLULES =================
  const fetchCellules = async () => {
    const { data } = await supabase
      .from("cellules")
      .select("id, cellule_full, responsable_id");

    setCellules(data || []);
    return data || [];
  };

  // ================= SUIVIS =================
  const fetchSuivis = async (userData, cellulesData) => {
    const { data, error } = await supabase
      .from("suivis_des_evangelises")
      .select(`*, evangelises (*), cellules (*)`)
      .order("id", { ascending: false });

    if (error) {
      console.error(error);
      setAllSuivis([]);
      return;
    }

    let filtered = data || [];

    // 🔹 Filtrage selon rôle
    if (userData.role === "Conseiller") {
      filtered = filtered.filter((m) => m.conseiller_id === userData.id);
    } else if (userData.role === "ResponsableCellule") {
      const mesCellulesIds = cellulesData
        .filter((c) => c.responsable_id === userData.id)
        .map((c) => c.id);

      filtered = filtered.filter((m) =>
        mesCellulesIds.includes(m.cellule_id)
      );
    }

    setAllSuivis(filtered);
  };

  // ================= FILTRE AFFICHAGE =================
  const suivisAffiches = allSuivis.filter((m) =>
    showRefus
      ? m.status_suivis_evangelises === "Refus"
      : m.status_suivis_evangelises !== "Refus"
  );

  // ================= HELPERS =================
  const getBorderColor = (m) => {
    if (m.status_suivis_evangelises === "En cours") return "#FFA500";
    if (m.status_suivis_evangelises === "Intégré") return "#34A853";
    if (m.status_suivis_evangelises === "Refus") return "#FF4B5C";
    return "#ccc";
  };

  const handleCommentChange = (id, value) =>
    setCommentChanges((p) => ({ ...p, [id]: value }));

  const handleStatusChange = (id, value) =>
    setStatusChanges((p) => ({ ...p, [id]: value }));

  // ================= UPDATE =================
  const updateSuivi = async (id, m) => {
    const newComment =
      commentChanges[id] ?? m.commentaire_evangelises ?? "";
    const newStatus =
      statusChanges[id] ?? m.status_suivis_evangelises ?? "";

    if (!newComment && !newStatus) return;

    try {
      setUpdating((p) => ({ ...p, [id]: true }));

      const { error } = await supabase
        .from("suivis_des_evangelises")
        .update({
          commentaire_evangelises: newComment,
          status_suivis_evangelises: newStatus,
        })
        .eq("id", id);

      if (error) throw error;

      // 🔹 MAJ immédiate du state (INSTANTANÉ)
      setAllSuivis((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                ...s,
                commentaire_evangelises: newComment,
                status_suivis_evangelises: newStatus,
              }
            : s
        )
      );
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la sauvegarde");
    } finally {
      setUpdating((p) => ({ ...p, [id]: false }));
    }
  };

  const switchView = () => {
    setView(view === "card" ? "table" : "card");
    setDetailsCarteId(null);
    setDetailsTable(null);
    setEditingContact(null);
  };

  // ================= RENDER =================
  if (loading)
    return <p className="text-center mt-10">Chargement...</p>;
  if (!user)
    return (
      <p className="text-center mt-10 text-red-600">
        Non connecté
      </p>
    );

  return (
    <div className="min-h-screen p-6 bg-gradient-to-r from-blue-800 to-cyan-400">
      <div className="flex justify-between mb-4">
        <button
          onClick={() => window.history.back()}
          className="text-white"
        >
          ← Retour
        </button>
        <LogoutLink />
      </div>

      <Image src="/logo.png" alt="Logo" width={80} height={80} />
      <h1 className="text-3xl font-bold text-white mb-6">
        📋 Suivis des Évangélisés
      </h1>

      <div className="flex justify-between mb-6">
        <button onClick={switchView} className="text-white underline">
          {view === "card" ? "Vue Table" : "Vue Carte"}
        </button>

        <button
          onClick={() => setShowRefus(!showRefus)}
          className="text-orange-400 underline"
        >
          {showRefus
            ? "Voir tous les suivis"
            : "Voir les refus"}
        </button>
      </div>

      {/* ================= VUE CARTE ================= */}
      {view === "card" && (
        <div className="grid md:grid-cols-3 gap-4">
          {suivisAffiches.map((m) => (
            <div
              key={m.id}
              className="bg-white p-4 rounded-xl border-l-4"
              style={{ borderLeftColor: getBorderColor(m) }}
            >
              <h2 className="font-bold">
                {m.evangelises?.prenom} {m.evangelises?.nom}
              </h2>

              <textarea
                value={
                  commentChanges[m.id] ??
                  m.commentaire_evangelises ??
                  ""
                }
                onChange={(e) =>
                  handleCommentChange(m.id, e.target.value)
                }
                className="w-full mt-2 border rounded p-2"
              />

              <select
                value={
                  statusChanges[m.id] ??
                  m.status_suivis_evangelises ??
                  ""
                }
                onChange={(e) =>
                  handleStatusChange(m.id, e.target.value)
                }
                className="w-full mt-2 border rounded p-2"
              >
                <option value="">-- Statut --</option>
                <option value="En cours">En cours</option>
                <option value="Intégré">Intégré</option>
                <option value="Refus">Refus</option>
              </select>

              <button
                onClick={() => updateSuivi(m.id, m)}
                disabled={updating[m.id]}
                className="mt-3 w-full bg-blue-600 text-white py-2 rounded"
              >
                {updating[m.id]
                  ? "Enregistrement..."
                  : "Sauvegarder"}
              </button>
            </div>
          ))}
        </div>
      )}

    {/* ================= VUE TABLE ================= */}
    {view === "table" && (
      <div className="w-full max-w-6xl overflow-x-auto">
        <table className="w-full bg-white rounded shadow">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2">Nom</th>
              <th className="p-2">Téléphone</th>
              <th className="p-2">Attribué</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {suivis.map((m) => (
              <tr key={m.id} className="border-t">
                <td className="p-2">{m.evangelises?.prenom} {m.evangelises?.nom}</td>
                <td className="p-2">{m.evangelises?.telephone || "—"}</td>
                <td className="p-2">{m.cellules?.cellule_full || "—"}</td>
                <td className="p-2">
                  <button onClick={() => setDetailsTable(m)} className="text-orange-500 underline mr-3">Détails</button>
                  <button onClick={() => m.evangelises?.id && setEditingContact(m.evangelises)} className="text-blue-600 underline">Modifier</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}

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
          fetchSuivis(user, cellules);
        }}
      />
    )}
  </div>
);
}
