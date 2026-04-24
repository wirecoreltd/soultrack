"use client";

import { useEffect, useState, useRef } from "react";
import supabase from "../lib/supabaseClient";

export default function SuiviEvanPopup({ member, onClose, user }) {
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
    "Relations / Conflits",
    "Addictions / Dépendances",
    "Guidance spirituelle",
    "Logement / Sécurité",
    "Communauté / Isolement",
    "Dépression / Santé mentale",
  ];

  // ─── Résolution utilisateur ───
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
        if (data) setCurrentUserName(`${data.prenom || ""} ${data.nom || ""}`.trim());
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
          if (data) setCurrentUserName(`${data.prenom || ""} ${data.nom || ""}`.trim());
          else setCurrentUserName(sessionData.session.user.email || "");
          return;
        }
      } catch (e) {}
      try {
        const keys = Object.keys(localStorage);
        const authKey = keys.find((k) => k.startsWith("sb-") && k.endsWith("-auth-token"));
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
            if (data) setCurrentUserName(`${data.prenom || ""} ${data.nom || ""}`.trim());
            else setCurrentUserName(stored.user.email || "");
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
      .from("suivis_evangelises")
      .select("*, profiles:created_by(prenom, nom)")
      .eq("evangelise_id", member.id)
      .order("date_action", { ascending: false });
    setSuivis(data || []);
  };

  // ─── Edition ───
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

  // ─── Toggle besoins ───
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
        [besoin]: prev.besoinStatuts[besoin] === "Résolu" ? "En suivi" : "Résolu",
      },
    }));
  };

  // ─── Submit ───
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
      ...resolvedBesoins.map((b) => ({ label: b, statut: "Résolu" })),
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
      const { error } = await supabase
        .from("suivis_evangelises")
        .update(payload)
        .eq("id", editingSuivi.id);

      if (error) {
        setLoading(false);
        alert("Erreur : " + error.message);
        return;
      }

      setSuivis((prev) =>
        prev.map((s) => (s.id === editingSuivi.id ? { ...editingSuivi, ...payload } : s))
      );
    } else {
      const { error } = await supabase.from("suivis_evangelises").insert({
        ...payload,
        evangelise_id: member.id,
        created_by: currentUserId,
      });

      if (error) {
        setLoading(false);
        alert("Erreur : " + error.message);
        return;
      }

      await fetchSuivis();
    }

    await supabase
      .from("evangelises")
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

  // ─── Helpers ───
  const formatDateForInput = (date) => (!date ? "" : date.split("T")[0]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      const months = ["Janv","Févr","Mars","Avr","Mai","Juin","Juil","Août","Sept","Oct","Nov","Déc"];
      return `${d.getDate().toString().padStart(2, "0")} ${months[d.getMonth()]} ${d.getFullYear()}`;
    } catch {
      return dateStr;
    }
  };

  const parseHistoriqueBesoin = (besoinJson) => {
    if (!besoinJson) return [];
    try {
      const parsed = JSON.parse(besoinJson);
      if (!Array.isArray(parsed)) return [];
      if (parsed.length > 0 && typeof parsed[0] === "object" && parsed[0].label) return parsed;
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

  // ─── RENDER ───
  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[60] p-4"
      style={{ background: "rgba(30,35,90,0.45)", backdropFilter: "blur(6px)" }}
    >
      <div
        className="relative w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden"
        style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}
      >
        {/* ── Header ── */}
        <div
          ref={formTopRef}
          className="px-6 pt-6 pb-4"
          style={{ background: "linear-gradient(135deg, #2E3192 0%, #4f54c9 100%)" }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-white font-bold text-sm"
            style={{ background: "rgba(255,255,255,0.2)" }}
          >
            ✕
          </button>
          <h2 className="text-xl font-bold text-white pr-10">
            🌍 Suivi évangélisation — {member.prenom} {member.nom}
          </h2>
          <p className="text-blue-100 text-sm mt-1 opacity-80">
            Ajouter ou modifier un suivi
          </p>
        </div>

        {/* ── Body ── */}
        <div className="overflow-y-auto px-6 py-5 flex flex-col gap-5" style={{ maxHeight: "72vh" }}>

          {/* Bandeau édition */}
          {editingSuivi && (
            <div className="flex items-center justify-between bg-orange-50 border border-orange-300 rounded-xl px-4 py-2">
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

          {/* ── Formulaire ── */}
          <SectionTitle>📋 Nouveau suivi</SectionTitle>

          <Field label="Date">
            <input
              type="date"
              value={formatDateForInput(form.date_action)}
              onChange={(e) => setForm((prev) => ({ ...prev, date_action: e.target.value }))}
              className="inp"
            />
          </Field>

          <Field label="Type d'action">
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="inp"
            >
              <option value="">-- Type d'action --</option>
              <option value="Appel">Appel</option>
              <option value="Visite">Visite</option>
              <option value="Entretien">Entretien</option>
              <option value="Message">Message</option>
            </select>
          </Field>

          {/* Besoins */}
          <SectionTitle>🙏 Besoins</SectionTitle>

          <div className="flex flex-col gap-2">
            {besoinsOptions.map((b) => {
              const isChecked = form.besoin.includes(b);
              const isResolved = resolvedBesoins.includes(b);
              const statut = form.besoinStatuts[b] || "En suivi";

              let boxStyle = "bg-white border-gray-300";
              let showTick = false;
              if (isResolved) {
                boxStyle = "bg-green-500 border-green-500";
              } else if (isChecked) {
                boxStyle = "bg-orange-400 border-orange-400";
                showTick = true;
              }

              return (
                <div key={b} className="flex items-center gap-3">
                  <label
                    className="flex items-center gap-2 text-sm cursor-pointer select-none flex-1 text-gray-700"
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
                    <span className={isResolved ? "line-through text-gray-400" : ""}>{b}</span>
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

          {/* Commentaire */}
          <SectionTitle>📝 Commentaire</SectionTitle>

          <Field label="Commentaire">
            <textarea
              placeholder="Commentaire..."
              value={form.commentaire}
              onChange={(e) => setForm({ ...form, commentaire: e.target.value })}
              className="inp"
              rows={3}
            />
          </Field>

          {currentUserName && (
            <p className="text-center text-sm text-gray-400">👤 {currentUserName}</p>
          )}

          {/* ── Bouton submit ── */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-2.5 rounded-xl font-semibold text-sm text-white transition-all disabled:opacity-60"
            style={{
              background: loading
                ? "#a0a0c0"
                : editingSuivi
                ? "linear-gradient(135deg, #ea580c 0%, #f97316 100%)"
                : "linear-gradient(135deg, #2E3192 0%, #4f54c9 100%)",
            }}
          >
            {loading
              ? editingSuivi ? "Mise à jour..." : "Ajout..."
              : editingSuivi ? "💾 Enregistrer les modifications" : "➕ Ajouter suivi"
            }
          </button>

          {/* ── Historique ── */}
          <SectionTitle>📅 Historique</SectionTitle>

          {suivis.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-2">Aucun suivi pour le moment</p>
          )}

          <div className="flex flex-col gap-3">
            {suivis.map((s) => {
              const besoinsArr = parseHistoriqueBesoin(s.besoin);
              const isBeingEdited = editingSuivi?.id === s.id;

              return (
                <div
                  key={s.id}
                  className={`rounded-xl border px-4 py-3 text-sm flex flex-col gap-1 transition-colors ${
                    isBeingEdited
                      ? "bg-orange-50 border-orange-300"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-gray-800">
                      📅 {formatDate(s.date_action)} — {s.action_type}
                    </p>
                    <button
                      onClick={() => handleEditSuivi(s)}
                      className={`text-xs px-2 py-1 rounded-lg font-semibold border transition-colors ${
                        isBeingEdited
                          ? "bg-orange-100 border-orange-400 text-orange-700"
                          : "bg-white border-gray-300 text-gray-600 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600"
                      }`}
                    >
                      {isBeingEdited ? "✏️ En cours..." : "✏️ Modifier"}
                    </button>
                  </div>

                  {besoinsArr.length > 0 && (
                    <div>
                      <p className="text-gray-400 text-xs mb-0.5">Besoins :</p>
                      {besoinsArr.map((item, i) => (
                        <p key={i} className="text-gray-700">
                          {item.label} —{" "}
                          <span className={statutColor(item.statut)}>{item.statut}</span>
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

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl font-semibold text-sm text-gray-600 bg-white border border-gray-200 hover:bg-gray-100 transition-all"
          >
            Fermer
          </button>
        </div>

        <style jsx>{`
          .inp {
            width: 100%;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 10px 12px;
            background: #f8fafc;
            color: #1e293b;
            font-size: 14px;
            outline: none;
            transition: border-color 0.2s;
          }
          .inp:focus {
            border-color: #2E3192;
            background: #fff;
          }
          select.inp option {
            background: white;
            color: #1e293b;
          }
        `}</style>
      </div>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <div className="flex items-center gap-2 pt-1">
      <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#2E3192" }}>
        {children}
      </span>
      <div className="flex-1 h-px" style={{ background: "#e2e8f0" }} />
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#64748b" }}>
        {label}
      </label>
      {children}
    </div>
  );
}
