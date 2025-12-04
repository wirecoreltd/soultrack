"use client";

import React, { useEffect, useRef, useState } from "react";
import BoutonEnvoyer from "./BoutonEnvoyer";

export default function DetailsModal({ 
  m, 
  onClose, 
  handleStatusChange, 
  handleCommentChange, 
  statusChanges, 
  commentChanges, 
  updating, 
  updateSuivi,
  onEnvoyer // <- passer handleAfterSend ici depuis le parent
}) {
  const commentRef = useRef(null);
  const [typeEnvoi, setTypeEnvoi] = useState("");
  const [cible, setCible] = useState(null);
  const [cellules, setCellules] = useState([]);
  const [conseillers, setConseillers] = useState([]);

  useEffect(() => {
    // Load cellules & conseillers pour le select "Envoyer à"
    const loadData = async () => {
      try {
        const cellulesRes = await fetch("/api/cellules");
        const cellulesData = await cellulesRes.json();
        const conseillersRes = await fetch("/api/conseillers");
        const conseillersData = await conseillersRes.json();

        setCellules(cellulesData || []);
        setConseillers(conseillersData || []);
      } catch (err) {
        console.error("Erreur chargement cellules/conseillers:", err);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (commentRef.current) {
      commentRef.current.focus();
      commentRef.current.selectionStart = commentRef.current.value.length;
    }
  }, [commentChanges[m.id]]);

  const handleSelectCible = (id) => {
    if (typeEnvoi === "cellule") setCible(cellules.find(c => c.id === id) || null);
    else if (typeEnvoi === "conseiller") setCible(conseillers.find(c => c.id === id) || null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-black font-bold">✖</button>

        <h2 className="text-xl font-bold mb-4">{m.prenom} {m.nom}</h2>
        <p>📞 {m.telephone || "—"}</p>
        <p>🏙 Ville : {m.ville || "—"}</p>
        <p>❓ Besoin : {m.besoin ? (Array.isArray(m.besoin) ? m.besoin.join(", ") : m.besoin) : "—"}</p>
        <p>📝 Infos : {m.infos_supplementaires || "—"}</p>

        <div className="mt-4">
          <label className="font-semibold">📌 Envoyer à :</label>
          <select 
            value={typeEnvoi} 
            onChange={(e) => { setTypeEnvoi(e.target.value); setCible(null); }} 
            className="w-full border rounded-md px-2 py-1 mt-2"
          >
            <option value="">-- Choisir --</option>
            <option value="cellule">📍 Cellule</option>
            <option value="conseiller">👤 Conseiller</option>
          </select>

          {typeEnvoi === "cellule" && (
            <select className="w-full border rounded-md px-2 py-1 mt-2" onChange={(e) => handleSelectCible(e.target.value)}>
              <option value="">-- Sélectionner une cellule --</option>
              {cellules.map(c => <option key={c.id} value={c.id}>{c.cellule} — {c.responsable}</option>)}
            </select>
          )}

          {typeEnvoi === "conseiller" && (
            <select className="w-full border rounded-md px-2 py-1 mt-2" onChange={(e) => handleSelectCible(e.target.value)}>
              <option value="">-- Sélectionner un conseiller --</option>
              {conseillers.map(c => <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>)}
            </select>
          )}

          {cible && <BoutonEnvoyer membre={m} type={typeEnvoi} cible={cible} session={true} onEnvoyer={onEnvoyer} showToast={() => {}} />}
        </div>

        <div className="mt-4">
          <label className="font-semibold">📋 Statut Suivis :</label>
          <select 
            value={statusChanges[m.id] ?? m.statut_suivis ?? ""} 
            onChange={(e) => handleStatusChange(m.id, e.target.value)} 
            className="w-full border rounded-md px-2 py-1 mt-2"
          >
            <option value="">-- Choisir un statut --</option>
            <option value={1}>🕓 En attente</option>
            <option value={3}>✅ Intégrer</option>
            <option value={4}>❌ Refus</option>
          </select>

          <textarea 
            ref={commentRef} 
            value={commentChanges[m.id] ?? m.commentaire_suivis ?? ""} 
            onChange={(e) => handleCommentChange(m.id, e.target.value)} 
            rows={3} 
            className="w-full border rounded-md px-2 py-1 mt-2 resize-none" 
            placeholder="Ajouter un commentaire..." 
          />

          <button 
            onClick={() => updateSuivi(m.id)} 
            disabled={updating[m.id]} 
            className={`mt-3 w-full text-white font-semibold py-1 rounded-md transition ${updating[m.id] ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"}`}
          >
            {updating[m.id] ? "Mise à jour..." : "Mettre à jour"}
          </button>
        </div>
      </div>
    </div>
  );
}
