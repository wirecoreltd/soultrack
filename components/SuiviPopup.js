"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";

export default function SuiviPopup({ member, onClose, user }) {
  const [loading, setLoading] = useState(false);
  const [suivis, setSuivis] = useState([]);

  const [form, setForm] = useState({
    date_action: "",
    type: "",
    statut: "En cours",
    besoin: [],
    commentaire: "",
  });

  const besoinsOptions = [
    "Finances",
    "Santé",
    "Travail / Études",
    "Famille",
    "Relations",
    "Spiritualité",
    "Logement",
  ];

  // 🔄 Load historique
  useEffect(() => {
    fetchSuivis();
  }, []);

  const fetchSuivis = async () => {
    const { data } = await supabase
      .from("suivis")
      .select("*, profiles:created_by(prenom, nom)")
      .eq("membre_id", member.id)
      .order("date_action", { ascending: false });

    setSuivis(data || []);
  };

  // 🟠 toggle besoin
  const toggleBesoin = (value) => {
    setForm((prev) => ({
      ...prev,
      besoin: prev.besoin.includes(value)
        ? prev.besoin.filter((b) => b !== value)
        : [...prev.besoin, value],
    }));
  };

  // 💾 Ajouter suivi
  const handleSubmit = async () => {
    if (!form.date_action || !form.type) {
      alert("Date et type sont obligatoires");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("suivis").insert({
  membre_id: member.id,
  action_type: form.type,   // 🔥 IMPORTANT
  statut: form.statut,
  besoin: form.besoin.length ? JSON.stringify(form.besoin) : null,
  commentaire: form.commentaire,
  date_action: form.date_action,
  created_by: user.id,
});

    setLoading(false);

    if (!error) {
      setForm({
        date_action: "",
        type: "",
        statut: "En cours",
        besoin: [],
        commentaire: "",
      });
      fetchSuivis();
    }
  };

  const statutColor = (statut) => {
    if (statut === "Résolu") return "text-green-600";
    if (statut === "En suivi") return "text-blue-600";
    return "text-orange-500";
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-2xl p-5 rounded-xl max-h-[85vh] overflow-y-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-lg">
            💡 Suivi - {member.prenom} {member.nom}
          </h2>
          <button onClick={onClose}>✕</button>
        </div>

        {/* FORM */}
        <div className="space-y-3 border-b pb-4">

          {/* DATE */}
          <input
            type="date"
            value={form.date_action}
            onChange={(e) =>
              setForm({ ...form, date_action: e.target.value })
            }
            className="border p-2 w-full rounded"
          />

          {/* TYPE */}
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="border p-2 w-full rounded"
          >
            <option value="">Type</option>
            <option value="Appel">Appel</option>
            <option value="Visite">Visite</option>
            <option value="Entretien">Entretien</option>
          </select>

          {/* STATUT */}
          <select
            value={form.statut}
            onChange={(e) => setForm({ ...form, statut: e.target.value })}
            className="border p-2 w-full rounded"
          >
            <option>En cours</option>
            <option>En suivi</option>
            <option>Résolu</option>
          </select>

          {/* BESOINS */}
          <div>
            <p className="font-semibold mb-1">Besoins</p>
            <div className="flex flex-wrap gap-2">
              {besoinsOptions.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => toggleBesoin(b)}
                  className={`px-2 py-1 rounded text-sm border ${
                    form.besoin.includes(b)
                      ? "bg-orange-400 text-white"
                      : ""
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* COMMENTAIRE */}
          <textarea
            placeholder="Commentaire..."
            value={form.commentaire}
            onChange={(e) =>
              setForm({ ...form, commentaire: e.target.value })
            }
            className="border p-2 w-full rounded"
          />

          {/* SUBMIT */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded w-full"
          >
            {loading ? "Ajout..." : "Ajouter suivi"}
          </button>
        </div>

        {/* HISTORIQUE */}
        <div className="mt-4">
          <h3 className="font-bold mb-2">📅 Historique</h3>

          {suivis.map((s) => (
            <div
              key={s.id}
              className="border-b py-2 text-sm space-y-1"
            >
              <div className="flex justify-between">
                <p>
                  📅 {s.date_action} — {s.type}
                </p>
                <p className={statutColor(s.statut)}>
                  {s.statut}
                </p>
              </div>

              {s.commentaire && <p>📝 {s.commentaire}</p>}

              <p className="text-gray-500 text-xs">
                👤 {s.profiles?.prenom} {s.profiles?.nom}
              </p>

              {s.besoin && (
                <p className="text-xs text-gray-600">
                  ❓ {JSON.parse(s.besoin).join(", ")}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
