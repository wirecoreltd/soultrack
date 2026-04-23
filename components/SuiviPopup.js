"use client";

import { useState, useEffect } from "react";
import supabase from "../lib/supabaseClient";

export default function SuiviPopup({ member, onClose }) {
  if (!member) return null;

  const [suivis, setSuivis] = useState([]);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [openSuivi, setOpenSuivi] = useState(false);

  const [form, setForm] = useState({
    action_type: "Appel",
    statut: "En cours",
    besoin: "",
    commentaire: "",
  });

  // -------------------- LOAD USER + SUIVIS --------------------
  useEffect(() => {
    fetchUser();
    fetchSuivis();
  }, []);

  const fetchUser = async () => {
    const { data: auth } = await supabase.auth.getUser();

    if (!auth?.user) return;

    const { data } = await supabase
      .from("profiles")
      .select("id, prenom, nom")
      .eq("id", auth.user.id)
      .single();

    setProfile(data);
  };

  const fetchSuivis = async () => {
    const { data } = await supabase
      .from("suivis")
      .select("*, profiles:created_by(prenom, nom)")
      .eq("membre_id", member.id)
      .order("created_at", { ascending: false });

    setSuivis(data || []);
  };

  // -------------------- ADD SUIVI --------------------
  const addSuivi = async () => {
    if (!profile) return;

    if (!form.commentaire.trim()) return;

    setLoading(true);

    const { error } = await supabase.from("suivis").insert({
      membre_id: member.id,
      action_type: form.action_type,
      statut: form.statut,
      besoin: form.besoin || null,
      commentaire: form.commentaire,
      created_by: profile.id,
      date_action: new Date(),
    });

    if (!error) {
      setForm({
        action_type: "Appel",
        statut: "En cours",
        besoin: "",
        commentaire: "",
      });

      fetchSuivis();
    }

    setLoading(false);
  };

  // -------------------- UI --------------------
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-lg p-5">

        {/* HEADER */}
        <h2 className="text-xl font-bold mb-2 text-[#25297e]">
          💡 Suivi pastoral
        </h2>

        <p className="text-sm text-gray-600 mb-4">
          {member.prenom} {member.nom}
        </p>

        {/* ---------------- FORMULAIRE ---------------- */}
        <div className="space-y-3 border-b pb-4 mb-4">

          {/* TYPE */}
          <select
            value={form.action_type}
            onChange={(e) =>
              setForm({ ...form, action_type: e.target.value })
            }
            className="w-full border p-2 rounded"
          >
            <option value="Appel">Appel</option>
            <option value="Visite">Visite</option>
            <option value="Entretien">Entretien</option>
          </select>

          {/* STATUT */}
          <select
            value={form.statut}
            onChange={(e) =>
              setForm({ ...form, statut: e.target.value })
            }
            className="w-full border p-2 rounded"
          >
            <option value="En cours">En cours</option>
            <option value="En suivi">En suivi</option>
            <option value="Résolu">Résolu</option>
          </select>

          {/* BESOIN */}
          <input
            placeholder="Besoin (optionnel)"
            value={form.besoin}
            onChange={(e) =>
              setForm({ ...form, besoin: e.target.value })
            }
            className="w-full border p-2 rounded"
          />

          {/* COMMENTAIRE */}
          <textarea
            placeholder="Commentaire"
            value={form.commentaire}
            onChange={(e) =>
              setForm({ ...form, commentaire: e.target.value })
            }
            className="w-full border p-2 rounded"
            rows={3}
          />

          {/* 👤 AUTEUR (READONLY IMPORTANT) */}
          <div className="text-sm text-gray-500 bg-gray-100 p-2 rounded">
            👤 Créé par :{" "}
            <span className="font-semibold">
              {profile?.prenom} {profile?.nom}
            </span>
          </div>

          {/* BTN */}
          <button
            onClick={addSuivi}
            disabled={loading}
            className="w-full bg-[#25297e] text-white py-2 rounded"
          >
            {loading ? "Ajout..." : "Ajouter le suivi"}
          </button>
        </div>

        {/* ---------------- HISTORIQUE ---------------- */}
        <div className="max-h-[250px] overflow-y-auto space-y-3">

          {suivis.length === 0 && (
            <p className="text-sm text-gray-400 text-center">
              Aucun suivi pour ce contact
            </p>
          )}

          {suivis.map((s) => (
            <div
              key={s.id}
              className="border rounded p-3 bg-gray-50"
            >
              <div className="text-sm font-bold text-[#25297e]">
                📅 {new Date(s.created_at).toLocaleDateString()} —{" "}
                {s.action_type} — {s.statut}
              </div>

              <div className="text-xs text-gray-500">
                👤 {s.profiles?.prenom} {s.profiles?.nom}
              </div>

              {s.besoin && (
                <div className="text-sm mt-1">
                  ❓ {s.besoin}
                </div>
              )}

              <div className="text-sm mt-1">
                📝 {s.commentaire}
              </div>
            </div>
          ))}
        </div>

        {/* CLOSE */}
        <button
          onClick={onClose}
          className="mt-4 w-full bg-gray-200 py-2 rounded"
        >
          Fermer
        </button>
      </div>
    </div>
  );
}
