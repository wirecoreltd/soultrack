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

  const [memberBesoins, setMemberBesoins] = useState(
    parseBesoinsList(member?.besoin)
  );

  // resolvedBesoins = besoins définitivement résolus (verts)
  const [resolvedBesoins, setResolvedBesoins] = useState([]);

  // besoinStatuts = { "Santé": "En suivi", "Relations / Conflits": "Résolu", ... }
  const initStatuts = () => {
    const s = {};
    parseBesoinsList(member?.besoin).forEach((b) => {
      s[b] = "En suivi";
    });
    return s;
  };

  const [form, setForm] = useState({
    date_action: "",
    type: "",
    besoin: parseBesoinsList(member?.besoin), // besoins cochés
    besoinStatuts: initStatuts(),             // statut individuel par besoin
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

  // Cocher / décocher un besoin
  const toggleBesoin = (value) => {
    const isChecked = form.besoin.includes(value);
    if (isChecked) {
      // Décocher → retirer du form
      setForm((prev) => ({
        ...prev,
        besoin: prev.besoin.filter((b) => b !== value),
        besoinStatuts: Object.fromEntries(
          Object.entries(prev.besoinStatuts).filter(([k]) => k !== value)
        ),
      }));
    } else {
      // Cocher → ajouter avec statut "En suivi" par défaut
      setForm((prev) => ({
        ...prev,
        besoin: [...prev.besoin, value],
        besoinStatuts: { ...prev.besoinStatuts, [value]: "En suivi" },
      }));
    }
  };

  // Changer le statut d'un besoin individuel
  const toggleStatutBesoin = (besoin) => {
    setForm((prev) => ({
      ...prev,
      besoinStatuts: {
        ...prev.besoinStatuts,
        [besoin]:
          prev.besoinStatuts[besoin] === "Résolu" ? "En suivi" : "Résolu",
      },
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

    // Besoins résolus dans ce suivi
    const newlyResolved = form.besoin.filter(
      (b) => form.besoinStatuts[b] === "Résolu"
    );

    // Nouveau membres_complets.besoin = retirer les résolus
    const newMemberBesoins = [
      ...memberBesoins.filter(
        (b) => !newlyResolved.includes(b)
      ),
      // Ajouter les nouveaux besoins cochés non résolus qui n'étaient pas en base
      ...form.besoin.filter(
        (b) =>
          !memberBesoins.includes(b) &&
          form.besoinStatuts[b] !== "Résolu"
      ),
    ];

    // Sauvegarder le suivi avec besoins + statuts individuels
    // On stocke besoin comme array JSON et statut global = statut le plus critique
    // Pour l'historique on stocke besoinStatuts dans commentaire interne (on encode dans besoin)
    // On sauvegarde besoin comme JSON d'objets {label, statut}
    const besoinAvecStatut = form.besoin.map((b) => ({
      label: b,
      statut: form.besoinStatuts[b] || "En suivi",
    }));

    const { error } = await supabase.from("suivis").insert({
      membre_id: member.id,
      type: form.type,
      action_type: form.type,
      statut: newlyResolved.length === form.besoin.length ? "Résolu" : "En suivi",
      besoin: JSON.stringify(besoinAvecStatut),
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

    // Mettre à jour membres_complets.besoin
    await supabase
      .from("membres_complets")
      .update({ besoin: JSON.stringify(newMemberBesoins) })
      .eq("id", member.id);

    // Besoins résolus → passer en vert
    if (newlyResolved.length > 0) {
      setResolvedBesoins((prev) => [
        ...prev,
        ...newlyResolved.filter((b) => !prev.includes(b)),
      ]);
    }

    setMemberBesoins(newMemberBesoins);
    setLoading(false);

    // Reset form avec les besoins restants
    const newStatuts = {};
    newMemberBesoins.forEach((b) => {
      newStatuts[b] = "En suivi";
    });

    setForm({
      date_action: "",
      type: "",
      besoin: newMemberBesoins,
      besoinStatuts: newStatuts,
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

  // Parse les besoins de l'historique (nouveau format {label,statut} ou ancien format string)
  const parseHistoriqueBesoin = (besoinJson) => {
    if (!besoinJson) return [];
    try {
      const parsed = JSON.parse(besoinJson);
      if (!Array.isArray(parsed)) return [];
      // Nouveau format : [{label, statut}]
      if (parsed.length > 0 && typeof parsed[0] === "object" && parsed[0].label) {
        return parsed;
      }
      // Ancien format : ["Santé", "Relations / Conflits"]
      return parsed.map((b) => ({ label: b, statut: "En suivi" }));
    } catch {
      return [];
    }
  };

  const statutColor = (statut) => {
    if (statut === "Résolu") return "text-green-600 font-semibold";
    if (statut === "En suivi") return "text-blue-600 font-semibold";
    return "text-orange-500 font-semibold";
  };

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

          {/* BESOINS avec statut individuel */}
          <div>
            <p className="font-semibold mb-2">Besoins</p>
            <div className="space-y-2">
              {besoinsOptions.map((b) => {
                const isChecked = form.besoin.includes(b);
                const style = getCaseStyle(b);
                const statut = form.besoinStatuts[b] || "En suivi";

                return (
                  <div key={b} className="flex items-center gap-3">

                    {/* Checkbox custom */}
                    <label
                      className="flex items-center gap-2 text-sm cursor-pointer select-none flex-1"
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
                      <span className={resolvedBesoins.includes(b) && !isChecked ? "line-through text-gray-400" : ""}>
                        {b}
                      </span>
                    </label>

                    {/* Bouton statut individuel — visible uniquement si coché */}
                    {isChecked && (
                      <button
                        type="button"
                        onClick={() => toggleStatutBesoin(b)}
                        className={`text-xs px-2 py-0.5 rounded-full border font-semibold transition-colors ${
                          statut === "Résolu"
                            ? "bg-green-100 border-green-400 text-green-700"
                            : "bg-blue-50 border-blue-300 text-blue-600"
                        }`}
                      >
                        {statut === "Résolu" ? "✓ Résolu" : "En suivi"}
                      </button>
                    )}
                  </div>
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
            const besoinsArr = parseHistoriqueBesoin(s.besoin);

            return (
              <div key={s.id} className="border-b py-3 text-sm space-y-1">

                <p className="font-semibold">
                  📅 {formatDate(s.date_action)} — {s.action_type}
                </p>

                {besoinsArr.length > 0 && (
                  <div className="space-y-0.5 mt-1">
                    {besoinsArr.map((item, i) => (
                      <p key={i} className="text-gray-700">
                        {item.label} —{" "}
                        <span className={statutColor(item.statut)}>
                          {item.statut}
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
