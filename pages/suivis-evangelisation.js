"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import Image from "next/image";
import LogoutLink from "../components/LogoutLink";
import EditEvangelisePopup from "../components/EditEvangelisePopup";
import DetailsEvangePopup from "../components/DetailsEvangePopup";

export default function SuivisEvangelisation() {
  const [suivis, setSuivis] = useState([]);
  const [conseillers, setConseillers] = useState([]);
  const [cellules, setCellules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("card");

  const [detailsCarteId, setDetailsCarteId] = useState(null);
  const [detailsTable, setDetailsTable] = useState(null);
  const [editingContact, setEditingContact] = useState(null);
  const [commentChanges, setCommentChanges] = useState({});
  const [user, setUser] = useState(null);

  /* ================= INIT ================= */
  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const userData = await fetchUser();
    await fetchConseillers();
    const cellulesData = await fetchCellules();

    if (userData) {
      await fetchSuivis(userData, cellulesData);
    }

    setLoading(false);
  };

  /* ================= USER ================= */
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

  /* ================= CONSEILLERS ================= */
  const fetchConseillers = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("id, prenom, nom")
      .eq("role", "Conseiller");

    setConseillers(data || []);
  };

  /* ================= CELLULES ================= */
  const fetchCellules = async () => {
    const { data } = await supabase
      .from("cellules")
      .select("id, cellule_full, responsable_id");

    setCellules(data || []);
    return data || [];
  };

  /* ================= SUIVIS + FILTRAGE ================= */
  const fetchSuivis = async (userData, cellulesData) => {
    const { data, error } = await supabase
      .from("suivis_des_evangelises")
      .select(`*, evangelises (*), cellules (*)`)
      .order("id", { ascending: false });

    if (error) {
      console.error(error);
      setSuivis([]);
      return;
    }

    let filtered = data || [];

    if (userData.role === "Conseiller") {
      filtered = filtered.filter(
        (m) => m.conseiller_id === userData.id
      );
    }

    if (userData.role === "ResponsableCellule") {
      const mesCellulesIds = cellulesData
        .filter((c) => c.responsable_id === userData.id)
        .map((c) => c.id);

      filtered = filtered.filter((m) =>
        mesCellulesIds.includes(m.cellule_id)
      );
    }

    setSuivis(filtered);
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

    fetchSuivis(user, cellules);
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

  const switchView = () => {
    setView(view === "card" ? "table" : "card");
    setDetailsCarteId(null);
    setDetailsTable(null);
    setEditingContact(null);
  };

  /* ================= RENDER ================= */
  if (loading) return <p className="text-center mt-10">Chargement...</p>;
  if (!user)
    return <p className="text-center mt-10 text-red-600">Non connecté</p>;

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-gradient-to-r from-blue-800 to-cyan-400">

      <div className="w-full max-w-5xl mb-6 flex justify-between">
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

     {/* ================= VUE CARTE ================= */}
{view === "card" && (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-6xl">
    {suivis.map((m) => {
      const ouvert = detailsCarteId === m.id;
      const conseiller = conseillers.find(
        (c) => c.id === m.conseiller_id
      );

      return (
        <div
          key={m.id}
          className="bg-white rounded-2xl shadow p-4 border-l-4"
          style={{ borderLeftColor: getBorderColor(m) }}
        >
          <h2 className="font-bold text-center">
            {m.evangelises?.prenom} {m.evangelises?.nom}
          </h2>

          <p className="text-sm text-center">
            📱 {m.evangelises?.telephone || "—"}
          </p>
          <p className="text-sm text-center">
            🏠 {m.cellules?.cellule_full || "—"}
          </p>
          <p className="text-sm text-center">
            👤 {conseiller ? `${conseiller.prenom} ${conseiller.nom}` : "—"}
          </p>

          {/* ================= COMMENTAIRE + STATUT (VISUEL) ================= */}
          <div className="flex flex-col w-full mt-2">
                  <label className="font-semibold text-blue-700 mb-1 mt-2 text-center">Commentaire Suivis Evangelisé</label>
                  <textarea
                    value={commentChanges[m.id] ?? m.commentaire_evangelises ?? ""}
                    onChange={(e) => handleCommentChange(m.id, e.target.value)}
                    className="w-full border rounded-lg p-2"
                    rows={2}
                  />

            <label className="block text-center text-sm font-semibold text-slate-700 mt-3 mb-1">
              Statut du suivis
            </label>

            <select
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              <option value="">-- Sélectionner un statut --</option>
              <option>En attente</option>
              <option>En cours</option>
              <option>Intégré</option>
              <option>Refus</option>
            </select>

            <button
              disabled
              className="mt-3 w-full rounded-lg bg-slate-300 text-slate-600 font-semibold py-2 cursor-not-allowed"
            >
              Sauvegarder
            </button>
          </div>

          {/* Bouton détails */}
          <button
            onClick={() =>
              setDetailsCarteId(ouvert ? null : m.id)
            }
            className="text-orange-500 underline text-sm block mx-auto mt-3"
          >
            {ouvert ? "Fermer détails" : "Détails"}
                </button>

                {/* ================= CARRÉ GRANDISSANT ================= */}
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
                  <td className="p-2">
                    {m.evangelises?.prenom} {m.evangelises?.nom}
                  </td>
                  <td className="p-2">
                    {m.evangelises?.telephone || "—"}
                  </td>
                  <td className="p-2">
                    {m.cellules?.cellule_full || "—"}
                  </td>
                  <td className="p-2">
                    <button
                      onClick={() => setDetailsTable(m)}
                      className="text-orange-500 underline mr-3"
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
