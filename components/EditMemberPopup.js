"use client";

import { useState, useEffect } from "react";
import supabase from "../lib/supabaseClient";

export default function EditMemberPopup({ member, onClose, onUpdateMember }) {
  if (!member?.id) return null; // protection

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

  const initialBesoin = parseBesoin(member.besoin);

  const [formData, setFormData] = useState({
    prenom: member.prenom || "",
    nom: member.nom || "",
    telephone: member.telephone || "",
    ville: member.ville || "",
    besoin: initialBesoin,
    statut: member.statut || "",
    statut_initial: member.statut_initial || "",
    cellule_id: member.cellule_id ?? "",
    conseiller_id: member.conseiller_id ?? "",
    infos_supplementaires: member.infos_supplementaires || "",
    is_whatsapp: !!member.is_whatsapp,
    star: !!member.star,
    sexe: member.sexe || "",
    venu: member.venu || "",
    commentaire_suivis: member.commentaire_suivis || "",
  });

  const [cellules, setCellules] = useState([]);
  const [conseillers, setConseillers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const { data: cellulesData } = await supabase.from("cellules").select("id, cellule_full");
        const { data: conseillersData } = await supabase
          .from("profiles")
          .select("id, prenom, nom")
          .eq("role", "Conseiller");
        if (!mounted) return;
        setCellules(cellulesData || []);
        setConseillers(conseillersData || []);
      } catch (err) {
        console.error("Erreur chargement cellules/conseillers :", err);
      }
    }
    loadData();
    return () => { mounted = false; };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!member?.id) return;
    setLoading(true);
    try {
      const payload = {
        prenom: formData.prenom || null,
        nom: formData.nom || null,
        telephone: formData.telephone || null,
        ville: formData.ville || null,
        statut: formData.statut || null,
        statut_initial: formData.statut_initial || null,
        cellule_id: formData.cellule_id || null,
        conseiller_id: formData.conseiller_id || null,
        infos_supplementaires: formData.infos_supplementaires || null,
        is_whatsapp: !!formData.is_whatsapp,
        star: !!formData.star,
        besoin: JSON.stringify(formData.besoin),
        sexe: formData.sexe || null,
        venu: formData.venu || null,
        commentaire_suivis: formData.commentaire_suivis || null,
      };

      const { error } = await supabase.from("membres").update(payload).eq("id", member.id);
      if (error) throw error;

      const { data: refreshedMember, error: viewError } = await supabase
        .from("v_membres_full")
        .select("*")
        .eq("id", member.id)
        .single();
      if (viewError) throw viewError;

      onUpdateMember(refreshedMember); // ⚡ Mise à jour instantanée
      setSuccess(true);
      setTimeout(() => onClose(), 300);
    } catch (err) {
      console.error("Erreur EditMemberPopup:", err);
      alert("❌ Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-3xl w-full max-w-md shadow-xl relative overflow-y-auto max-h-[95vh]">
        <button onClick={onClose} className="absolute top-3 right-3 text-red-500 font-bold text-xl hover:text-red-700">✕</button>
        <h2 className="text-2xl font-bold text-center mb-4">
          Éditer {member.prenom} {member.nom}
        </h2>

        <div className="flex flex-col gap-4">
          <input type="text" name="prenom" value={formData.prenom} onChange={handleChange} className="input" placeholder="Prénom" />
          <input type="text" name="nom" value={formData.nom} onChange={handleChange} className="input" placeholder="Nom" />
          <button onClick={handleSubmit} disabled={loading}>
            {loading ? "Enregistrement..." : "Sauvegarder"}
          </button>
          {success && <p className="text-green-600 text-center mt-2">✔️ Modifié avec succès !</p>}
        </div>
      </div>
    </div>
  );
}
