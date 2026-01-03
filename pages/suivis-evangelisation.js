"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import EditEvangelisePopup from "../components/EditEvangelisePopup";

export default function SuivisEvangelisation() {
  const [suivis, setSuivis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingContact, setEditingContact] = useState(null);
  const [openCard, setOpenCard] = useState(null);
  const [commentChanges, setCommentChanges] = useState({});

  /* ================= FETCH ================= */
  const fetchSuivis = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("suivis_des_evangelises")
      .select(`
        *,
        conseiller:conseillers(id, nom),
        evangelises (*)
      `)
      .order("created_at", { ascending: false });

    if (!error) setSuivis(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchSuivis();
  }, []);

  /* ================= HELPERS ================= */
  const formatBesoin = (besoin) => {
    if (!besoin) return "—";
    if (Array.isArray(besoin)) return besoin.join(", ");
    return besoin;
  };

  const handleCommentChange = (id, value) => {
    setCommentChanges((prev) => ({ ...prev, [id]: value }));
  };

  const updateSuivi = async (id) => {
    const commentaire = commentChanges[id];
    if (commentaire === undefined) return;

    await supabase
      .from("suivis_des_evangelises")
      .update({ commentaire_evangelises: commentaire })
      .eq("id", id);

    fetchSuivis();
  };

  /* ================= RENDER ================= */
  if (loading) return <p className="p-4">Chargement...</p>;

  return (
    <div className="p-4 space-y-6">

      {/* ================= VUE CARTE ================= */}
      <div className="grid md:grid-cols-2 gap-4">
        {suivis.map((m) => {
          const ouvert = openCard === m.id;

          return (
            <div
              key={m.id}
              className="border rounded-xl p-4 shadow-sm bg-white"
            >
              <div
                className="cursor-pointer"
                onClick={() => setOpenCard(ouvert ? null : m.id)}
              >
                <h3 className="font-semibold text-lg">
                  {m.evangelises?.prenom} {m.evangelises?.nom}
                </h3>

                <p className="text-sm text-gray-600">
                  📞 {m.evangelises?.telephone || "—"}
                </p>

                <p className="text-xs text-gray-500">
                  👤 Conseiller : {m.conseiller?.nom || "—"}
                </p>
              </div>

              {/* ===== DÉTAILS – CARRÉ GRANDISSANT ===== */}
              <div
                className={`overflow-hidden transition-all duration-500 ${
                  ouvert ? "max-h-[800px] mt-3" : "max-h-0"
                }`}
              >
                {ouvert && (
                  <div className="bg-gray-50 rounded-xl p-3 text-sm space-y-2">
                    <p>🏙️ Ville : {m.evangelises?.ville || "—"}</p>
                    <p>⚥ Sexe : {m.evangelises?.sexe || "—"}</p>
                    <p>🙏 Prière salut : {m.evangelises?.priere_salut ? "Oui" : "Non"}</p>
                    <p>☀️ Type : {m.evangelises?.type_conversion || "—"}</p>
                    <p>❓ Besoin : {formatBesoin(m.evangelises?.besoin)}</p>

                    <textarea
                      rows={2}
                      className="w-full border rounded px-2 py-1"
                      placeholder="Ajouter un commentaire..."
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
                      onClick={() => {
                        if (!m.evangelises?.id) {
                          alert("❌ Aucun évangélisé lié");
                          return;
                        }
                        setEditingContact(m.evangelises);
                      }}
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

      {/* ================= VUE TABLE ================= */}
      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-2 py-1">Nom</th>
              <th className="border px-2 py-1">Téléphone</th>
              <th className="border px-2 py-1">Conseiller</th>
              <th className="border px-2 py-1">Action</th>
            </tr>
          </thead>
          <tbody>
            {suivis.map((m) => (
              <tr key={m.id}>
                <td className="border px-2 py-1">
                  {m.evangelises?.prenom} {m.evangelises?.nom}
                </td>
                <td className="border px-2 py-1">
                  {m.evangelises?.telephone || "—"}
                </td>
                <td className="border px-2 py-1">
                  {m.conseiller?.nom || "—"}
                </td>
                <td className="border px-2 py-1 text-center">
                  <button
                    onClick={() => {
                      if (!m.evangelises?.id) return;
                      setEditingContact(m.evangelises);
                    }}
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

      {/* ================= POPUP MODIFIER ================= */}
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
