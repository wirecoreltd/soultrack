"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";

export default function SuiviPopup({ member, onClose, user }) {
  const [loading, setLoading] = useState(false);
  const [suivis, setSuivis] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserName, setCurrentUserName] = useState("");

  // Pré-remplir les besoins depuis member.besoin
  const parseMemberBesoins = () => {
    if (!member?.besoin) return [];
    try {
      const parsed =
        typeof member.besoin === "string"
          ? JSON.parse(member.besoin)
          : member.besoin;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const [form, setForm] = useState({
    date_action: "",
    type: "",
    statut: "En cours",
    besoin: parseMemberBesoins(),
    commentaire: "",
  });

  const besoinsOptions = [
    "Finances",
    "Santé",
    "Travail / Études",
    "Famille / Enfants",
    "Miracle",
    "Délivrance",
    "Relations / Conflits",
    "Addictions / Dépendances",
    "Guidance spirituelle",
    "Logement / Sécurité",
    "Communauté / Isolement",
    "Dépression / Santé mentale",
  ];

  // Résoudre l'utilisateur connecté
  useEffect(() => {
    const resolveUser = async () => {
      // 1. Depuis la prop user (userProfile)
      if (user?.id) {
        setCurrentUserId(user.id);
        const name = [user.prenom, user.nom].filter(Boolean).join(" ");
        setCurrentUserName(name || user.email || "Utilisateur connecté");
        return;
      }

      // 2. Depuis getSession
      try {
        const { data } = await supabase.auth.getSession();
        if (data?.session?.user?.id) {
          setCurrentUserId(data.session.user.id);
          setCurrentUserName(
            data.session.user.email || "Utilisateur connecté"
          );
          return;
        }
      } catch (e) {
        console.warn("getSession échoué:", e);
      }

      // 3. Fallback localStorage
      try {
        const keys = Object.keys(localStorage);
        const authKey = keys.find(
          (k) => k.startsWith("sb-") && k.endsWith("-auth-token")
        );
        if (authKey) {
          const stored = JSON.parse(localStorage.getItem(authKey));
          const id = stored?.user?.id;
          if (id) {
            setCurrentUserId(id);
            setCurrentUserName(
              stored?.user?.email || "Utilisateur connecté"
            );
            return;
          }
        }
      } catch (e) {
        console.warn("localStorage fallback échoué:", e);
      }
    };

    resolveUser();
  }, [user]);

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

  const toggleBesoin = (value) => {
    setForm((prev) => ({
      ...prev,
      besoin: prev.besoin.includes(value)
        ? prev.besoin.filter((b) => b !== value)
        : [...prev.besoin, value],
    }));
  };

  const handleSubmit = async () => {
    if (!form.date_action || !form.type) {
      alert("Date et type sont obligatoires");
      return;
    }

    if (!currentUserId) {
      alert("Session introuvable. Veuillez vous déconnecter et vous reconnecter.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("suivis").insert({
      membre_id: member.id,
      type: form.type,
      action_type: form.type,
      statut: form.statut,
      besoin: form.besoin.length ? JSON.stringify(form.besoin) : null,
      commentaire: form.commentaire,
      date_action: form.date_action,
      created_by: currentUserId,
    });

    setLoading(false);

    if (!error) {
      setForm({
        date_action: "",
        type: "",
        statut: "En cours",
        besoin: parseMemberBesoins(),
        commentaire: "",
      });
      fetchSuivis();
    } else {
      console.error("Erreur supabase:", error);
      alert("Erreur lors de l'ajout du suivi : " + error.message);
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
            💡 Suivi — {member.prenom} {member.nom}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black text-xl">✕</button>
        </div>

        {/* FORM */}
        <div className="space-y-3 border-b pb-4">

          {/* DATE */}
          <input
            type="date"
            value={form.date_action}
            onChange={(e) => setForm({ ...form, date_action: e.target.value })}
            className="border p-2 w-full rounded"
          />

          {/* TYPE */}
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="border p-2 w-full rounded"
          >
            <option value="">Type d'action</option>
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

          {/* BESOINS — Checkboxes */}
          <div>
            <p className="font-semibold mb-2">Besoins</p>
            <div className="grid grid-cols-2 gap-1">
              {besoinsOptions.map((b) => (
                <label
                  key={b}
                  className="flex items-center gap-2 text-sm cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={form.besoin.includes(b)}
                    onChange={() => toggleBesoin(b)}
                    className="accent-orange-400 w-4 h-4"
                  />
                  {b}
                </label>
              ))}
            </div>
          </div>

          {/* COMMENTAIRE */}
          <textarea
            placeholder="Commentaire..."
            value={form.commentaire}
            onChange={(e) => setForm({ ...form, commentaire: e.target.value })}
            className="border p-2 w-full rounded"
            rows={3}
          />

          {/* USER CONNECTÉ */}
          {currentUserName && (
            <p className="text-center text-sm text-gray-400">
              👤 {currentUserName}
            </p>
          )}

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

          {suivis.length === 0 && (
            <p className="text-sm text-gray-500">Aucun suivi pour le moment</p>
          )}

          {suivis.map((s) => (
            <div key={s.id} className="border-b py-3 text-sm space-y-1">
              <div className="flex justify-between">
                <p>📅 {s.date_action} — {s.action_type}</p>
                <p className={statutColor(s.statut)}>{s.statut}</p>
              </div>

              {s.commentaire && <p>📝 {s.commentaire}</p>}

              <p className="text-gray-500 text-xs">
                👤 {s.profiles?.prenom} {s.profiles?.nom}
              </p>

              {s.besoin && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {JSON.parse(s.besoin).map((b, i) => (
                    <span key={i} className="px-2 py-1 rounded bg-gray-200 text-xs">
                      {b}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
