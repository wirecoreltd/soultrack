"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";

export default function SuiviPopup({ member, onClose, user }) {
  const [loading, setLoading] = useState(false);
  const [suivis, setSuivis] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserName, setCurrentUserName] = useState("");

  const parseBesoinsList = (val) => {
    if (!val) return [];
    try {
      const parsed = typeof val === "string" ? JSON.parse(val) : val;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  // memberBesoins = besoins actuels en base (source de vérité)
  const [memberBesoins, setMemberBesoins] = useState(
    parseBesoinsList(member?.besoin)
  );

  // resolvedBesoins = besoins qui ont été décochés ET sauvegardés avec "Résolu"
  const [resolvedBesoins, setResolvedBesoins] = useState([]);

  const [form, setForm] = useState({
    date_action: "",
    type: "",
    statut: "En cours",
    besoin: parseBesoinsList(member?.besoin), // uniquement les besoins cochés pour CE suivi
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

  useEffect(() => {
    const resolveUser = async () => {
      if (user?.id) {
        setCurrentUserId(user.id);
        const name = [user.prenom, user.nom].filter(Boolean).join(" ");
        setCurrentUserName(name || user.email || "Utilisateur connecté");
        return;
      }
      try {
        const { data } = await supabase.auth.getSession();
        if (data?.session?.user?.id) {
          setCurrentUserId(data.session.user.id);
          setCurrentUserName(data.session.user.email || "Utilisateur connecté");
          return;
        }
      } catch (e) {}
      try {
        const keys = Object.keys(localStorage);
        const authKey = keys.find(
          (k) => k.startsWith("sb-") && k.endsWith("-auth-token")
        );
        if (authKey) {
          const stored = JSON.parse(localStorage.getItem(authKey));
          if (stored?.user?.id) {
            setCurrentUserId(stored.user.id);
            setCurrentUserName(stored.user.email || "Utilisateur connecté");
          }
        }
      } catch (e) {}
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

    // Besoins qui ont été décochés dans ce suivi (étaient dans memberBesoins mais plus dans form.besoin)
    const uncheckedBesoins = memberBesoins.filter(
      (b) => !form.besoin.includes(b)
    );

    // Mettre à jour membres_complets.besoin = uniquement les besoins encore cochés
    const newMemberBesoins = memberBesoins.filter((b) =>
      form.besoin.includes(b)
    );
    // Ajouter les nouveaux besoins cochés qui n'étaient pas en base
    form.besoin.forEach((b) => {
      if (!newMemberBesoins.includes(b)) newMemberBesoins.push(b);
    });

    // Sauvegarder le suivi — uniquement les besoins cochés dans ce formulaire
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

    if (error) {
      setLoading(false);
      console.error("Erreur supabase:", error);
      alert("Erreur lors de l'ajout du suivi : " + error.message);
      return;
    }

    // Mettre à jour membres_complets.besoin en base
    await supabase
      .from("membres_complets")
      .update({ besoin: JSON.stringify(newMemberBesoins) })
      .eq("id", member.id);

    // Si statut = Résolu → les besoins décochés passent en vert
    if (form.statut === "Résolu" && uncheckedBesoins.length > 0) {
      setResolvedBesoins((prev) => [
        ...prev,
        ...uncheckedBesoins.filter((b) => !prev.includes(b)),
      ]);
    }

    setMemberBesoins(newMemberBesoins);
    setLoading(false);

    setForm({
      date_action: "",
      type: "",
      statut: "En cours",
      besoin: newMemberBesoins,
      commentaire: "",
    });

    fetchSuivis();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      const day = d.getDate().toString().padStart(2, "0");
      const months = [
        "Janv","Févr","Mars","Avr","Mai","Juin",
        "Juil","Août","Sept","Oct","Nov","Déc",
      ];
      return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
    } catch {
      return dateStr;
    }
  };

  const statutColor = (statut) => {
    if (statut === "Résolu") return "text-green-600 font-semibold";
    if (statut === "En suivi") return "text-blue-600 font-semibold";
    return "text-orange-500 font-semibold";
  };

  // Apparence des cases :
  // - résolu (décoché + sauvegardé résolu) → vert
  // - coché → orange
  // - vide → gris
  const getCaseStyle = (b) => {
    const isChecked = form.besoin.includes(b);
    const isResolved = resolvedBesoins.includes(b);

    if (isResolved && !isChecked) {
      return { bg: "bg-green-500 border-green-500", tick: true };
    }
    if (isChecked) {
      return { bg: "bg-orange-400 border-orange-400", tick: true };
    }
    return { bg: "bg-white border-gray-300", tick: false };
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

          <input
            type="date"
            value={form.date_action}
            onChange={(e) => setForm({ ...form, date_action: e.target.value })}
            className="border p-2 w-full rounded"
          />

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
            <p className="font-semibold mb-2">Besoins</p>
            <div className="grid grid-cols-2 gap-2">
              {besoinsOptions.map((b) => {
                const style = getCaseStyle(b);
                return (
                  <label
                    key={b}
                    className="flex items-center gap-2 text-sm cursor-pointer select-none"
                    onClick={() => toggleBesoin(b)}
                  >
                    <div
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${style.bg}`}
                    >
                      {style.tick && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                    <span>{b}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <textarea
            placeholder="Commentaire..."
            value={form.commentaire}
            onChange={(e) => setForm({ ...form, commentaire: e.target.value })}
            className="border p-2 w-full rounded"
            rows={3}
          />

          {currentUserName && (
            <p className="text-center text-sm text-gray-400">
              👤 {currentUserName}
            </p>
          )}

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

          {suivis.map((s) => {
            let besoinsArr = [];
            try {
              besoinsArr = s.besoin ? JSON.parse(s.besoin) : [];
            } catch {}

            return (
              <div key={s.id} className="border-b py-3 text-sm space-y-1">

                <p className="font-semibold">
                  📅 {formatDate(s.date_action)} — {s.action_type}
                </p>

                {/* Uniquement les besoins cochés lors de ce suivi */}
                {besoinsArr.length > 0 && (
                  <div className="space-y-0.5 mt-1">
                    {besoinsArr.map((b, i) => (
                      <p key={i} className="text-gray-700">
                        {b} —{" "}
                        <span className={statutColor(s.statut)}>
                          {s.statut}
                        </span>
                      </p>
                    ))}
                  </div>
                )}

                {s.commentaire && (
                  <p className="text-gray-600">📝 {s.commentaire}</p>
                )}

                <p className="text-gray-400 text-xs">
                  👤 {s.profiles?.prenom} {s.profiles?.nom}
                </p>

              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
