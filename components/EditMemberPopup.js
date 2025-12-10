"use client";

import { useState, useEffect } from "react";
import supabase from "../lib/supabaseClient";

export default function EditMemberPopup({ member, onClose, onUpdateMember }) {
  const besoinsOptions = ["Finances", "Santé", "Travail", "Les Enfants", "La Famille"];

  const parseBesoin = (b) => {
    if (!b) return [];
    if (Array.isArray(b)) return b;
    try {
      const parsed = JSON.parse(b);
      return Array.isArray(parsed) ? parsed : [String(b)];
    } catch {
      return [String(b)];
    }
  };

  const initialBesoin = parseBesoin(member?.besoin);

  const [cellules, setCellules] = useState([]);
  const [conseillers, setConseillers] = useState([]);
  const [formData, setFormData] = useState({
    prenom: member?.prenom || "",
    nom: member?.nom || "",
    telephone: member?.telephone || "",
    ville: member?.ville || "",
    besoin: initialBesoin,
    autreBesoin: "",
    statut: member?.statut || "",
    cellule_id: member?.cellule_id ?? "",
    conseiller_id: member?.conseiller_id ?? "",
    infos_supplementaires: member?.infos_supplementaires || "",
    is_whatsapp: !!member?.is_whatsapp,
    star: member?.star === true,
  });
  const [showAutre, setShowAutre] = useState(initialBesoin.includes("Autre"));
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const { data: cellulesData } = await supabase.from("cellules").select("id, cellule");
        const { data: conseillersData } = await supabase
          .from("profiles")
          .select("id, prenom, nom")
          .eq("role", "Conseiller");
        if (!mounted) return;
        setCellules(cellulesData || []);
        setConseillers(conseillersData || []);
      } catch (err) {
        console.error("Erreur loadData EditMemberPopup:", err);
      }
    }
    loadData();
    return () => { mounted = false; };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleBesoinChange = (e) => {
    const { value, checked } = e.target;

    if (value === "Autre") {
      setShowAutre(checked);
      if (!checked) {
        setFormData(prev => ({ ...prev, autreBesoin: "", besoin: prev.besoin.filter(b => b !== "Autre") }));
      } else {
        setFormData(prev => ({ ...prev, besoin: Array.from(new Set([...prev.besoin, "Autre"])) }));
      }
      return;
    }

    setFormData(prev => {
      const updated = checked ? [...prev.besoin, value] : prev.besoin.filter(b => b !== value);
      return { ...prev, besoin: updated };
    });
  };

  const toggleStar = () => setFormData(prev => ({ ...prev, star: !prev.star }));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      let finalBesoin = Array.isArray(formData.besoin) ? [...formData.besoin] : parseBesoin(formData.besoin);
      if (showAutre && formData.autreBesoin?.trim()) {
        finalBesoin = finalBesoin.filter(b => b !== "Autre");
        finalBesoin.push(formData.autreBesoin.trim());
      } else {
        finalBesoin = finalBesoin.filter(b => b !== "Autre");
      }

      const payload = {
        prenom: formData.prenom || null,
        nom: formData.nom || null,
        telephone: formData.telephone || null,
        ville: formData.ville || null,
        statut: formData.statut || null,
        cellule_id: formData.cellule_id === "" ? null : formData.cellule_id,
        conseiller_id: formData.conseiller_id === "" ? null : formData.conseiller_id,
        infos_supplementaires: formData.infos_supplementaires || null,
        is_whatsapp: !!formData.is_whatsapp,
        star: !!formData.star,
        besoin: JSON.stringify(finalBesoin),
      };

      const { data, error } = await supabase
        .from("membres")
        .update(payload)
        .eq("id", member.id)
        .select()
        .single();

      if (error) throw error;

      if (onUpdateMember) onUpdateMember(data); // 🔹 mise à jour instantanée

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 900);
    } catch (err) {
      console.error("Erreur handleSubmit EditMemberPopup:", err);
      alert("❌ Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-3xl w-full max-w-md shadow-xl relative overflow-y-auto max-h-[95vh]">
        <button onClick={onClose} className="absolute top-3 right-3 text-red-500 font-bold text-xl hover:text-red-700" aria-label="Fermer">✕</button>
        <h2 className="text-2xl font-bold text-center mb-4">Modifier le membre</h2>
        <div className="flex justify-center mb-4">
          <button onClick={toggleStar} className="text-4xl">{formData.star ? "⭐" : "☆"}</button>
        </div>

        {/* ==================== Vue Carte ==================== */}
{view === "card" && (
  <div className="w-full max-w-5xl space-y-8">
    {nouveauxFiltres.length > 0 && (
      <div>
        <p className="text-white text-lg mb-4 ml-1">💖 Bien aimé venu le {formatDate(nouveauxFiltres[0].created_at)}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {nouveauxFiltres.map(m => {
            const isOpen = detailsOpen[m.id];
            return (
              <div key={m.id} className="bg-white p-3 rounded-xl shadow-md border-l-4 relative" style={{ borderLeftColor: getBorderColor(m) }}>
                {m.star && <span className="absolute top-3 right-3 text-yellow-400 text-xl">⭐</span>}
                <div className="flex flex-col items-center">
                  <h2 className="text-lg font-bold text-center">{m.prenom} {m.nom}</h2>
                  <div className="flex flex-col space-y-1 text-sm text-black-600 w-full items-center">
                    <div className="flex justify-center items-center space-x-2"><span>📱</span><span>{m.telephone || "—"}</span></div>
                    <div className="flex justify-center items-center space-x-2"><span>🏙</span><span>{m.ville || "—"}</span></div>
                    <div className="flex justify-center items-center space-x-2"><span>🕊</span><span>Statut : {m.statut || "—"}</span></div>

                    {/* Affichage Cellule ou Contact attribué */}
                    <div className="flex flex-col space-y-1 text-sm text-black-600 w-full items-center">
                      {m.cellule_nom ? (
                        <div>
                          <strong>Cellule :</strong> {m.cellule_nom} - {m.responsable_cellule}
                        </div>
                      ) : (m.conseiller_prenom || m.conseiller_nom || m.suivi_responsable) ? (
                        <div>
                          <strong>Contact attribué :</strong>{" "}
                          {m.conseiller_prenom || m.conseiller_nom
                            ? `${m.conseiller_prenom || ""} ${m.conseiller_nom || ""}`
                            : m.suivi_responsable}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {/* ENVOYER À */}
                  <div className="mt-2">
                    <label className="font-semibold text-sm">Envoyer à :</label>
                    <select value={selectedTargetType[m.id] || ""} onChange={(e) => setSelectedTargetType((prev) => ({ ...prev, [m.id]: e.target.value }))} className="mt-1 w-full border rounded px-2 py-1 text-sm">
                      <option value="">-- Choisir une option --</option>
                      <option value="cellule">Une Cellule</option>
                      <option value="conseiller">Un Conseiller</option>
                    </select>

                    {(selectedTargetType[m.id] === "cellule" || selectedTargetType[m.id] === "conseiller") && (
                      <select value={selectedTargets[m.id] || ""} onChange={(e) => setSelectedTargets((prev) => ({ ...prev, [m.id]: e.target.value }))} className="mt-1 w-full border rounded px-2 py-1 text-sm">
                        <option value="">-- Choisir {selectedTargetType[m.id]} --</option>
                        {selectedTargetType[m.id] === "cellule"
                          ? cellules.map((c) => <option key={c.id} value={c.id}>{c.cellule} ({c.responsable})</option>)
                          : conseillers.map((c) => <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>)
                        }
                      </select>
                    )}

                    {selectedTargets[m.id] && (
                      <div className="pt-2">
                        <BoutonEnvoyer
                          membre={m}
                          type={selectedTargetType[m.id]}
                          cible={selectedTargetType[m.id] === "cellule" ? cellules.find((c) => c.id === selectedTargets[m.id]) : conseillers.find((c) => c.id === selectedTargets[m.id])}
                          onEnvoyer={(id) => handleAfterSend(id, selectedTargetType[m.id], selectedTargetType[m.id] === "cellule" ? cellules.find((c) => c.id === selectedTargets[m.id]) : conseillers.find((c) => c.id === selectedTargets[m.id]))}
                          session={session}
                          showToast={showToast}
                        />
                      </div>
                    )}
                  </div>

                  <button onClick={() => toggleDetails(m.id)} className="text-orange-500 underline text-sm mt-2">{isOpen ? "Fermer détails" : "Détails"}</button>

                  {isOpen && (
                    <div className="text-black-700 text-sm mt-3 w-full space-y-2">
                      <p>💬 WhatsApp : {m.is_whatsapp ? "Oui" : "Non"}</p>
                      <p>❓ Besoin : {(!m.besoin ? "—" : Array.isArray(m.besoin) ? m.besoin.join(", ") : (() => { try { const arr = JSON.parse(m.besoin); return Array.isArray(arr) ? arr.join(", ") : m.besoin; } catch { return m.besoin; } })())}</p>
                      <p>📝 Infos : {m.infos_supplementaires || "—"}</p>
                      <p>🕊 Statut : {m.statut_suivis_actuel ? statutLabels[m.statut_suivis_actuel] : m.statut || "—"}</p>
                      <p>📝 Commentaire Suivis : {m.suivi_commentaire_suivis || "—"}</p>
                      <button onClick={() => setEditMember(m)} className="text-blue-600 text-sm mt-6 block mx-auto">✏️ Modifier le contact</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    )}

    {/* Anciens Membres */}
    {anciensFiltres.length > 0 && (
      <div className="mt-8">
        <h3 className="text-white text-lg mb-3 font-semibold">Membres existants</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {anciensFiltres.map(m => {
            const isOpen = detailsOpen[m.id];
            return (
              <div key={m.id} className="bg-white p-3 rounded-xl shadow-md border-l-4 relative" style={{ borderLeftColor: getBorderColor(m) }}>
                {m.star && <span className="absolute top-3 right-3 text-yellow-400 text-xl">⭐</span>}
                <div className="flex flex-col items-center">
                  <h2 className="text-lg font-bold text-center">{m.prenom} {m.nom}</h2>
                  <div className="flex flex-col space-y-1 text-sm text-black-600 w-full items-center">
                    <div className="flex justify-center items-center space-x-2"><span>📱</span><span>{m.telephone || "—"}</span></div>
                    <div className="flex justify-center items-center space-x-2"><span>🕊</span><span>Statut : {m.statut || "—"}</span></div>

                    {/* Affichage Cellule ou Contact attribué */}
                    <div className="flex flex-col space-y-1 text-sm text-black-600 w-full items-center">
                      {m.cellule_nom ? (
                        <div>
                          <strong>Cellule :</strong> {m.cellule_nom} - {m.responsable_cellule}
                        </div>
                      ) : (m.conseiller_prenom || m.conseiller_nom || m.suivi_responsable) ? (
                        <div>
                          <strong>Contact attribué :</strong>{" "}
                          {m.conseiller_prenom || m.conseiller_nom
                            ? `${m.conseiller_prenom || ""} ${m.conseiller_nom || ""}`
                            : m.suivi_responsable}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {/* ENVOYER À */}
                  <div className="mt-2">
                    <label className="font-semibold text-sm">Envoyer à :</label>
                    <select value={selectedTargetType[m.id] || ""} onChange={(e) => setSelectedTargetType((prev) => ({ ...prev, [m.id]: e.target.value }))} className="mt-1 w-full border rounded px-2 py-1 text-sm">
                      <option value="">-- Choisir une option --</option>
                      <option value="cellule">Une Cellule</option>
                      <option value="conseiller">Un Conseiller</option>
                    </select>

                    {(selectedTargetType[m.id] === "cellule" || selectedTargetType[m.id] === "conseiller") && (
                      <select value={selectedTargets[m.id] || ""} onChange={(e) => setSelectedTargets((prev) => ({ ...prev, [m.id]: e.target.value }))} className="mt-1 w-full border rounded px-2 py-1 text-sm">
                        <option value="">-- Choisir {selectedTargetType[m.id]} --</option>
                        {selectedTargetType[m.id] === "cellule"
                          ? cellules.map((c) => <option key={c.id} value={c.id}>{c.cellule} ({c.responsable})</option>)
                          : conseillers.map((c) => <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>
                        )}
                      </select>
                    )}

                    {selectedTargets[m.id] && (
                      <div className="pt-2">
                        <BoutonEnvoyer
                          membre={m}
                          type={selectedTargetType[m.id]}
                          cible={selectedTargetType[m.id] === "cellule" ? cellules.find((c) => c.id === selectedTargets[m.id]) : conseillers.find((c) => c.id === selectedTargets[m.id])}
                          onEnvoyer={(id) => handleAfterSend(id, selectedTargetType[m.id], selectedTargetType[m.id] === "cellule" ? cellules.find((c) => c.id === selectedTargets[m.id]) : conseillers.find((c) => c.id === selectedTargets[m.id]))}
                          session={session}
                          showToast={showToast}
                        />
                      </div>
                    )}
                  </div>

                  <button onClick={() => toggleDetails(m.id)} className="text-orange-500 underline text-sm mt-2">{isOpen ? "Fermer détails" : "Détails"}</button>

                  {isOpen && (
                    <div className="text-black-700 text-sm mt-3 w-full space-y-2">
                      <p>💬 WhatsApp : {m.is_whatsapp ? "Oui" : "Non"}</p>
                      <p>❓ Besoin : {(!m.besoin ? "—" : Array.isArray(m.besoin) ? m.besoin.join(", ") : (() => { try { const arr = JSON.parse(m.besoin); return Array.isArray(arr) ? arr.join(", ") : m.besoin; } catch { return m.besoin; } })())}</p>
                      <p>📝 Infos : {m.infos_supplementaires || "—"}</p>
                      <p>🕊 Statut : {m.statut_suivis_actuel ? statutLabels[m.statut_suivis_actuel] : m.statut || "—"}</p>
                      <p>📝 Commentaire Suivis : {m.suivi_commentaire_suivis || "—"}</p>
                      <button onClick={() => setEditMember(m)} className="text-blue-600 text-sm mt-6 block mx-auto">✏️ Modifier le contact</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    )}
  </div>
)}


          {/* Buttons */}
          <div className="flex gap-4 mt-2">
            <button onClick={onClose} className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 rounded-2xl shadow-md">Annuler</button>
            <button onClick={handleSubmit} disabled={loading} className="flex-1 bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600 text-white font-bold py-3 rounded-2xl shadow-md">
              {loading ? "Enregistrement..." : "Sauvegarder"}
            </button>
          </div>

          {success && <p className="text-green-600 font-semibold text-center mt-3">✔️ Modifié avec succès !</p>}
        </div>

        <style jsx>{`
          .input {
            width: 100%;
            border: 1px solid #ccc;
            border-radius: 12px;
            padding: 12px;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
          }
        `}</style>
      </div>
    </div>
  );
}
