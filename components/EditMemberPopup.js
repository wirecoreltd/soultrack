"use client";

import { useState, useEffect } from "react";
import supabase from "../lib/supabaseClient";

export default function EditMemberPopup({ member, onClose, onUpdateMember }) {
  if (!member) return null;

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
  const [loadingData, setLoadingData] = useState(true);

  const [formData, setFormData] = useState({
    prenom: member?.prenom || "",
    nom: member?.nom || "",
    telephone: member?.telephone || "",
    ville: member?.ville || "",
    statut: member?.statut || "",
    statut_initial: member?.statut_initial || "",
    cellule_id: member?.cellule_id ?? "",
    conseiller_id: member?.conseiller_id ?? "",
    infos_supplementaires: member?.infos_supplementaires || "",
    is_whatsapp: !!member?.is_whatsapp,
    star: !!member?.star,
    sexe: member?.sexe || "",
    venu: member?.venu || "",
    besoin: initialBesoin,
    autreBesoin: "",
    commentaire_suivis: member?.commentaire_suivis || "",
    bapteme_eau: member?.bapteme_eau ?? false,
    bapteme_esprit: member?.bapteme_esprit ?? false,
    Formation: member?.Formation || "",
    Soin_Pastoral: member?.Soin_Pastoral || "",
    Ministere: member?.Ministere || "",
    Commentaire_Suivi_Evangelisation: member?.Commentaire_Suivi_Evangelisation || "",
    priere_salut: member?.priere_salut || "",
    type_conversion: member?.type_conversion || "",
  });

  const [showAutre, setShowAutre] = useState(initialBesoin.includes("Autre"));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      try {
        const { data: cellulesData } = await supabase.from("cellules").select("id, cellule_full");
        const { data: conseillersData } = await supabase
          .from("profiles")
          .select("id, prenom, nom")
          .eq("role", "Conseiller");

        if (!mounted) return;
        setCellules(cellulesData || []);
        setConseillers(conseillersData || []);
        setLoadingData(false);
      } catch (err) {
        console.error(err);
        setLoadingData(false);
      }
    };
    loadData();
    return () => (mounted = false);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === "cellule_id" && value) {
      setFormData(prev => ({ ...prev, cellule_id: value, conseiller_id: "" }));
    } else if (name === "conseiller_id" && value) {
      setFormData(prev => ({ ...prev, conseiller_id: value, cellule_id: "" }));
    } else if (name === "bapteme_eau" || name === "bapteme_esprit") {
      setFormData(prev => ({ ...prev, [name]: value === "true" }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleBesoinChange = (e) => {
    const { value, checked } = e.target;
    if (value === "Autre") {
      setShowAutre(checked);
      setFormData(prev => ({
        ...prev,
        besoin: checked ? [...prev.besoin, "Autre"] : prev.besoin.filter(b => b !== "Autre"),
        autreBesoin: ""
      }));
      return;
    }
    setFormData(prev => ({
      ...prev,
      besoin: checked ? [...prev.besoin, value] : prev.besoin.filter(b => b !== value)
    }));
  };

  const handleSubmit = async () => {
    setMessage("");
    if (!formData.prenom.trim()) return setMessage("❌ Le prénom est obligatoire.");
    if (!formData.nom.trim()) return setMessage("❌ Le nom est obligatoire.");
    setLoading(true);

    try {
      let finalBesoin = [...formData.besoin];
      if (showAutre && formData.autreBesoin.trim()) {
        finalBesoin = finalBesoin.filter(b => b !== "Autre");
        finalBesoin.push(formData.autreBesoin.trim());
      } else {
        finalBesoin = finalBesoin.filter(b => b !== "Autre");
      }

      const payload = {
        prenom: formData.prenom,
        nom: formData.nom,
        telephone: formData.telephone || null,
        ville: formData.ville || null,
        statut: formData.statut || null,
        statut_initial: formData.statut_initial || null,
        cellule_id: formData.cellule_id || null,
        conseiller_id: formData.conseiller_id || null,
        infos_supplementaires: formData.infos_supplementaires || null,
        is_whatsapp: !!formData.is_whatsapp,
        star: !!formData.star,
        sexe: formData.sexe || null,
        venu: formData.venu || null,
        besoin: JSON.stringify(finalBesoin),
        commentaire_suivis: formData.commentaire_suivis || null,
        bapteme_eau: formData.bapteme_eau,
        bapteme_esprit: formData.bapteme_esprit,
        Formation: formData.Formation || "",
        Soin_Pastoral: formData.Soin_Pastoral || "",
        Ministere: formData.Ministere || "",
        Commentaire_Suivi_Evangelisation: formData.Commentaire_Suivi_Evangelisation || "",
        priere_salut: formData.priere_salut || "",
        type_conversion: formData.type_conversion || "",
      };

      const { error } = await supabase
        .from("membres_complets")
        .update(payload)
        .eq("id", member.id);

      if (error) throw error;

      const { data } = await supabase
        .from("membres_complets")
        .select("*")
        .eq("id", member.id)
        .single();

      onUpdateMember?.(data);
      onClose();
    } catch (err) {
      console.error(err);
      setMessage("❌ Une erreur est survenue lors de l’enregistrement.");
    } finally {
      setLoading(false);
    }
  };

  return null; // UI inchangée, supprimée ici pour la lisibilité
}
