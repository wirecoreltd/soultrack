"use client";

import { useEffect, useState, useRef } from "react";
import supabase from "../lib/supabaseClient";

export default function SuiviPopup({ member, onClose, user }) {
  const [loading, setLoading] = useState(false);
  const [suivis, setSuivis] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserName, setCurrentUserName] = useState("");
  const [editingSuivi, setEditingSuivi] = useState(null);

  const formTopRef = useRef(null);

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

  const initStatuts = (besoins) => {
    const s = {};
    besoins.forEach((b) => { s[b] = "En suivi"; });
    return s;
  };

  const emptyForm = {
    date_action: "",
    type: "",
    besoin: parseBesoinsList(member?.besoin),
    besoinStatuts: initStatuts(parseBesoinsList(member?.besoin)),
    commentaire: "",
  };

  const [form, setForm] = useState(emptyForm);
  const [resolvedBesoins, setResolvedBesoins] = useState([]);

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
        if (user.prenom || user.nom) {
          setCurrentUserName(`${user.prenom || ""} ${user.nom || ""}`.trim());
          return;
        }
        const { data } = await supabase
          .from("profiles")
          .select("prenom, nom")
          .eq("id", user.id)
          .single();
        if (data) {
          setCurrentUserName(`${data.prenom || ""} ${data.nom || ""}`.trim());
        }
        return;
      }

      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.user?.id) {
          const uid = sessionData.session.user.id;
          setCurrentUserId(uid);
          const { data } = await supabase
            .from("profiles")
            .select("prenom, nom")
            .eq("id", uid)
            .single();
          if (data) {
            setCurrentUserName(`${data.prenom || ""} ${data.nom || ""}`.trim());
          } else {
            setCurrentUserName(sessionData.session.user.email || "");
          }
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
            const uid = stored.user.id;
            setCurrentUserId(uid);
            const { data } = await supabase
              .from("profiles")
              .select("prenom, nom")
              .eq("id", uid)
              .single();
            if (data) {
              setCurrentUserName(`${data.prenom || ""} ${data.nom || ""}`.trim());
            } else {
              setCurrentUserName(stored.user.email || "");
            }
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

  const handleEditSuivi = (s) => {
    const besoinsArr = parseHistoriqueBesoin(s.besoin);

    const besoinChecked = [];
    const besoinStatuts = {};
    const resolved = [];

    besoinsArr.forEach(({ label, statut }) => {
      if (statut === "Résolu") {
        resolved.push(label);
      } else {
        besoinChecked.push(label);
        besoinStatuts[label] = statut || "En suivi";
      }
    });

    setEditingSuivi(s);
    setResolvedBesoins(resolved);
    setForm({
      date_action: s.date_action || "",
      type: s.action_type || s.type || "",
      besoin: besoinChecked,
      besoinStatuts,
      commentaire: s.commentaire || "",
    });

    setTimeout(() => {
      formTopRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  const handleCancelEdit = () => {
    setEditingSuivi(null);
    setResolvedBesoins([]);
    setForm(emptyForm);
  };

  const toggleBesoin = (value) => {
    const isChecked = form.besoin.includes(value);
    const isResolved = resolvedBesoins.includes(value);

    if (isResolved) {
      setResolvedBesoins((prev) => prev.filter((b) => b !== value));
      setForm((prev) => ({
        ...prev,
        besoin: [...prev.besoin, value],
        besoinStatuts: { ...prev.besoinStatuts, [value]: "En suivi" },
      }));
      return;
    }

    if (isChecked) {
      setResolvedBesoins((prev) => [...prev, value]);
      setForm((prev) => ({
        ...prev,
        besoin: prev.besoin.filter((b) => b !== value),
        besoinStatuts: Object.fromEntries(
          Object.entries(prev.besoinStatuts).filter(([k]) => k !== value)
        ),
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      besoin: [...prev.besoin, value],
      besoinStatuts: { ...prev.besoinStatuts, [value]: "En suivi" },
    }));
  };

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

    const resolvedFromChecked = form.besoin.filter(
      (b) => form.besoinStatuts[b] === "Résolu"
    );
    const allResolved = [...new Set([...resolvedBesoins, ...resolvedFromChecked])];

    const newMemberBesoins = [
      ...memberBesoins.filter((b) => !allResolved.includes(b)),
      ...form.besoin.filter(
        (b) => !memberBesoins.includes(b) && form.besoinStatuts[b] !== "Résolu"
      ),
    ];

    const besoinAvecStatut = [
      ...form.besoin.map((b) => ({
        label: b,
        statut: form.besoinStatuts[b] || "En suivi",
      })),
      ...resolvedBesoins.map((b) => ({
        label: b,
        statut: "Résolu",
      })),
    ];

    const payload = {
      type: form.type,
      action_type: form.type,
      statut:
        allResolved.length > 0 &&
        form.besoin.filter((b) => form.besoinStatuts[b] !== "Résolu").length === 0
          ? "Résolu"
          : "En suivi",
      besoin: besoinAvecStatut.length ? JSON.stringify(besoinAvecStatut) : null,
      commentaire: form.commentaire,
      date_action: form.date_action,
    };

    if (editingSuivi) {
      // ─── MODE ÉDITION : UPDATE Supabase ───
      const { error: updateError } = await supabase
        .from("suivis")
        .update(payload)
        .eq("id", editingSuivi.id);

      if (updateError) {
        setLoading(false);
        console.error("Erreur update supabase:", updateError);
        alert("Erreur : " + updateError.message);
        return;
      }

      // 🔥 Mise à jour LOCALE directe dans le state
      // On reconstruit l'objet complet sans re-fetch pour éviter les problèmes de cache
      const updatedSuivi = {
        ...editingSuivi,           // garde id, membre_id, created_by, profiles (jointure déjà là)
        ...payload,                // écrase avec les nouvelles valeurs
      };

      setSuivis((prev) =>
        prev.map((s) => (s.id === editingSuivi.id ? updatedSuivi : s))
      );

    } else {
      // ─── MODE CRÉATION : INSERT puis re-fetch ───
      const { error: insertError } = await supabase.from("suivis").insert({
        ...payload,
        membre_id: member.id,
        created_by: currentUserId,
      });

      if (insertError) {
        setLoading(false);
        console.error("Erreur insert supabase:", insertError);
        alert("Erreur : " + insertError.message);
        return;
      }

      // Re-fetch complet pour avoir la nouvelle ligne avec son id et profiles
      await fetchSuivis();
    }

    // Mettre à jour membres_complets.besoin
    await supabase
      .from("membres_complets")
      .update({ besoin: JSON.stringify(newMemberBesoins) })
      .eq("id", member.id);

    setMemberBesoins(newMemberBesoins);
    setResolvedBesoins([]);
    setEditingSuivi(null);
    setLoading(false);

    const newStatuts = {};
    newMemberBesoins.forEach((b) => { newStatuts[b] = "En suivi"; });

    setForm({
      date_action: "",
      type: "",
      besoin: newMemberBesoins,
      besoinStatuts: newStatuts,
      commentaire: "",
    });
  };

  // ✅ Pour input date
const formatDateForInput = (date) => {
  if (!date) return "";
  return date.split("T")[0];
};

// ✅ Pour affichage joli
const formatDate = (dateStr) => {
  if (!dateStr) return "";

  try {
    const d = new Date(dateStr);
    const day = d.getDate().toString().padStart(2, "0");
    const months = [
      "Janv", "Févr", "Mars", "Avr", "Mai", "Juin",
      "Juil", "Août", "Sept", "Oct", "Nov", "Déc",
    ];
    return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return dateStr;
  }
};

  const parseHistoriqueBesoin = (besoinJson) => {
    if (!besoinJson) return [];
    try {
      const parsed = JSON.parse(besoinJson);
      if (!Array.isArray(parsed)) return [];
      if (parsed.length > 0 && typeof parsed[0] === "object" && parsed[0].label) {
        return parsed;
      }
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

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-2xl p-5 rounded-xl max-h-[85vh] overflow-y-auto">

        {/* HEADER */}
        <div ref={formTopRef} className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-lg">
            💡 Suivi — {member.prenom} {member.nom}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black text-xl">✕</button>
        </div>

        {/* Bandeau mode édition */}
        {editingSuivi && (
          <div className="mb-3 flex items-center justify-between bg-orange-50 border border-orange-300 rounded-lg px-3 py-2">
            <p className="text-orange-700 text-sm font-semibold">
              ✏️ Modification du suivi du {formatDate(editingSuivi.date_action)}
            </p>
            <button
              onClick={handleCancelEdit}
              className="text-xs text-gray-500 underline hover:text-gray-700"
            >
              Annuler
            </button>
          </div>
        )}

        {/* FORM */}
        <div className="space-y-3 border-b pb-4">

          <input
            type="date"
            value={formatDateForInput(formData.ma_date)}
            onChange={(e) =>
              setFormData(prev => ({
                ...prev,
                ma_date: e.target.value
              }))
            }
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

          {/* BESOINS */}
          <div>
            <p className="font-semibold mb-2">Besoins</p>
            <div className="space-y-2">
              {besoinsOptions.map((b) => {
                const isChecked = form.besoin.includes(b);
                const isResolved = resolvedBesoins.includes(b);
                const statut = form.besoinStatuts[b] || "En suivi";

                let boxStyle = "bg-white border-gray-300";
                let showTick = false;
                if (isResolved) {
                  boxStyle = "bg-green-500 border-green-500";
                  showTick = false;
                } else if (isChecked) {
                  boxStyle = "bg-orange-400 border-orange-400";
                  showTick = true;
                }

                return (
                  <div key={b} className="flex items-center gap-3">
                    <label
                      className="flex items-center gap-2 text-sm cursor-pointer select-none flex-1"
                      onClick={() => toggleBesoin(b)}
                    >
                      <div
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${boxStyle}`}
                      >
                        {showTick && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className={isResolved ? "line-through text-gray-400" : ""}>
                        {b}
                      </span>
                    </label>

                    {isChecked && (
                      <button
                        type="button"
                        onClick={() => toggleStatutBesoin(b)}
                        className={`text-xs px-2 py-0.5 rounded-full border font-semibold transition-colors whitespace-nowrap ${
                          statut === "Résolu"
                            ? "bg-green-100 border-green-400 text-green-700"
                            : "bg-blue-50 border-blue-300 text-blue-600"
                        }`}
                      >
                        {statut === "Résolu" ? "✓ Résolu" : "En suivi"}
                      </button>
                    )}

                    {isResolved && (
                      <span className="text-xs px-2 py-0.5 rounded-full border bg-green-100 border-green-400 text-green-700 font-semibold whitespace-nowrap">
                        ✓ Résolu
                      </span>
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
            className={`px-4 py-2 rounded w-full text-white font-semibold ${
              editingSuivi
                ? "bg-orange-500 hover:bg-orange-600"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading
              ? editingSuivi ? "Mise à jour..." : "Ajout..."
              : editingSuivi ? "💾 Enregistrer les modifications" : "Ajouter suivi"
            }
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
            const isBeingEdited = editingSuivi?.id === s.id;

            return (
              <div
                key={s.id}
                className={`border-b py-3 text-sm space-y-1 rounded-lg px-2 transition-colors ${
                  isBeingEdited ? "bg-orange-50 border border-orange-300" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold">
                    📅 {formatDate(s.date_action)} — {s.action_type}
                  </p>

                  <button
                    onClick={() => handleEditSuivi(s)}
                    className={`text-xs px-2 py-1 rounded font-semibold border transition-colors ${
                      isBeingEdited
                        ? "bg-orange-100 border-orange-400 text-orange-700"
                        : "bg-gray-100 border-gray-300 text-gray-600 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600"
                    }`}
                  >
                    {isBeingEdited ? "✏️ En cours..." : "✏️ Modifier"}
                  </button>
                </div>

                {besoinsArr.length > 0 && (
                  <div className="mt-1">
                    <p className="text-gray-500 text-xs mb-0.5">Besoin :</p>
                    <div className="space-y-0.5">
                      {besoinsArr.map((item, i) => (
                        <p key={i} className="text-gray-700">
                          {item.label} —{" "}
                          <span className={statutColor(item.statut)}>
                            {item.statut}
                          </span>
                        </p>
                      ))}
                    </div>
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
