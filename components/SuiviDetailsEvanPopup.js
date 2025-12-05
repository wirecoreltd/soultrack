// components/SuiviDetailsEvanPopup.jsx

"use client";

import { useEffect, useState, useRef } from "react";
import supabase from "../lib/supabaseClient";
import BoutonEnvoyer from "./BoutonEnvoyer";

export default function SuiviDetailsEvanPopup({ membre, onClose, statusChanges, commentChanges, handleStatusChange, handleCommentChange, updateSuivi, updating }) {
  const [cellules, setCellules] = useState([]);
  const [conseillers, setConseillers] = useState([]);
  const [typeEnvoi, setTypeEnvoi] = useState("");
  const [cible, setCible] = useState(null);
  const commentRef = useRef(null);

  useEffect(() => {
    const loadData = async () => {
      const { data: cellulesData } = await supabase.from("cellules").select("id, cellule, responsable");
      const { data: conseillersData } = await supabase.from("profiles").select("id, prenom, nom").eq("role", "Conseiller");
      setCellules(cellulesData || []);
      setConseillers(conseillersData || []);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (commentRef.current) {
      commentRef.current.focus();
      commentRef.current.selectionStart = commentRef.current.value.length;
    }
  }, [commentChanges[membre.id]]);

  const handleSelectCible = (id) => {
    if (typeEnvoi === "cellule") setCible(cellules.find(c => c.id === parseInt(id)) || null);
    else if (typeEnvoi === "conseiller") setCible(conseillers.find(c => c.id === id) || null);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 w-full max-w-md mx-auto text-black relative">
      <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">✖</button>

      <h2 className="font-bold text-lg mb-2">{membre.prenom} {membre.nom}</h2>

      <p>📞 Téléphone : {membre.telephone || "—"}</p>
      <p>🏙 Ville : {membre.ville || "—"}</p>
      <p>📌 Cellule : {membre.cellules?.cellule || "—"}</p>
      <p>❓ Besoin : {(!membre.besoin ? "—" : Array.isArray(membre.besoin)
          ? membre.besoin.join(", ")
          : (() => { try { const arr = JSON.parse(membre.besoin); return Array.isArray(arr) ? arr.join(", ") : membre.besoin; } catch { return membre.besoin; } })())}</p>
      <p>📝 Infos : {membre.infos_supplementaires || "—"}</p>

      <div className="mt-4 border-t pt-4">
        <label className="font-semibold">📌 Envoyer à :</label>
        <select value={typeEnvoi} onChange={(e) => { setTypeEnvoi(e.target.value); setCible(null); }} className="w-full border rounded-md px-2 py-1 mt-2">
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

        {cible && <BoutonEnvoyer membre={membre} type={typeEnvoi} cible={cible} session={true} onEnvoyer={() => {}} showToast={() => {}} />}
      </div>

      <label className="text-sm mt-4 block">📋 Statut Suivi :</label>
      <select
        value={statusChanges[membre.id] ?? membre.status_suivis_evangelises ?? ""}
        onChange={(e) => handleStatusChange(membre.id, e.target.value)}
        className="w-full border rounded-md px-2 py-1"
      >
        <option value="">-- Choisir un statut --</option>
        <option value="En cours">🕊 En cours</option>
        <option value="Integrer">🔥 Intégrer</option>
        <option value="Venu à l’église">⛪ Venu à l’église</option>
        <option value="Veut venir à la famille d’impact">👨‍👩‍👧‍👦 Veut venir à la famille d’impact</option>
        <option value="Veut être visité">🏡 Veut être visité</option>
        <option value="Ne souhaite pas continuer">🚫 Ne souhaite pas continuer</option>
      </select>

      <textarea
        ref={commentRef}
        value={commentChanges[membre.id] ?? membre.commentaire_evangelises ?? ""}
        onChange={(e) => handleCommentChange(membre.id, e.target.value)}
        rows={2}
        className="w-full border rounded-md px-2 py-1 mt-2 resize-none"
        placeholder="Ajouter un commentaire..."
      />

      <button
        onClick={() => updateSuivi(membre.id)}
        disabled={updating[membre.id]}
        className={`mt-3 w-full text-white font-semibold py-1 rounded-md transition ${updating[membre.id] ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"}`}
      >
        {updating[membre.id] ? "Mise à jour..." : "Mettre à jour"}
      </button>
    </div>
  );
}
