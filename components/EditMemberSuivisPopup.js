"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import supabase from "../lib/supabaseClient";

export default function EditMemberSuivisPopup({ member, onClose, onUpdateMember }) {
  if (!member) return null;

  const besoinsOptions = ["Finances","Santé","Travail","Les Enfants","La Famille"];
  const ministereOptions = ["Intercession","Louange","Technique","Communication","Les Enfants","Les ados","Les jeunes","Finance","Nettoyage","Conseiller","Compassion","Visite","Berger","Modération"];

  const parseArray = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed : [String(value)]; } catch { return [String(value)]; }
  };

  const [cellules, setCellules] = useState([]);
  const [conseillers, setConseillers] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, watch, setValue, control } = useForm({
    defaultValues: {
      prenom: member.prenom || "",
      nom: member.nom || "",
      telephone: member.telephone || "",
      ville: member.ville || "",
      sexe: member.sexe || "",
      star: !!member.star,
      cellule_id: member.cellule_id || "",
      conseiller_id: member.conseiller_id || "",
      bapteme_eau: member.bapteme_eau ?? "",
      bapteme_esprit: member.bapteme_esprit ?? "",
      priere_salut: member.priere_salut || "",
      type_conversion: member.type_conversion || "",
      besoin: parseArray(member.besoin),
      autreBesoin: "",
      Ministere: parseArray(member.Ministere),
      autreMinistere: "",
      infos_supplementaires: member.infos_supplementaires || "",
      statut_initial: member.statut_initial || "",
      suivi_statut: member.suivi_statut || "",
      commentaire_suivis: member.commentaire_suivis || "",
      is_whatsapp: !!member.is_whatsapp,
      Formation: member.Formation || "",
      Soin_Pastoral: member.Soin_Pastoral || "",
      Commentaire_Suivi_Evangelisation: member.Commentaire_Suivi_Evangelisation || "",
      venu: member.venu || "",
    }
  });

  const watchBesoin = watch("besoin");
  const watchMinistere = watch("Ministere");
  const watchStar = watch("star");

  useEffect(()=>{
    let mounted=true;
    const loadData=async()=>{
      try {
        const { data: cellulesData } = await supabase.from("cellules").select("id, cellule_full");
        const { data: conseillersData } = await supabase.from("profiles").select("id, prenom, nom").eq("role","Conseiller");
        if(!mounted) return;
        setCellules(cellulesData||[]);
        setConseillers(conseillersData||[]);
        setLoadingData(false);
      } catch(err){ console.error(err); setLoadingData(false); }
    };
    loadData();
    return ()=>{ mounted=false; };
  },[]);

  const onSubmit = async (data) => {
    setMessage(""); setLoading(true);

    try {
      let finalBesoin = data.besoin.filter(b => b !== "Autre");
      if (data.autreBesoin.trim()) finalBesoin.push(data.autreBesoin.trim());

      let finalMinistere = data.Ministere.filter(m => m !== "Autre");
      if (data.autreMinistere.trim()) finalMinistere.push(data.autreMinistere.trim());

      const payload = {
        ...data,
        besoin: JSON.stringify(finalBesoin),
        Ministere: data.star ? JSON.stringify(finalMinistere) : null
      };

      const { error } = await supabase.from("membres_complets").update(payload).eq("id", member.id);
      if(error) throw error;

      const { data: updatedMember } = await supabase.from("membres_complets").select("*").eq("id", member.id).single();
      onUpdateMember?.(updatedMember);
      onClose();
    } catch(err){
      console.error(err);
      setMessage("❌ Une erreur est survenue lors de l’enregistrement.");
    } finally { setLoading(false); }
  };

  if(loadingData) return <div className="p-6 text-white text-center">Chargement...</div>;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="relative w-full max-w-lg p-6 rounded-3xl shadow-2xl bg-gradient-to-b from-[rgba(46,49,146,0.16)] to-[rgba(46,49,146,0.4)]">
        <button onClick={onClose} className="absolute top-4 right-4 text-red-600 font-bold text-xl">✕</button>
        <h2 className="text-2xl font-bold text-center mb-6 text-white">Modifier {member.prenom} {member.nom}</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 text-white max-h-[70vh] overflow-y-auto">

          {["prenom","nom","telephone","ville"].map(f => (
            <div key={f} className="flex flex-col">
              <label className="font-medium capitalize">{f}</label>
              <input {...register(f)} className="input"/>
            </div>
          ))}

          <div className="flex items-center gap-2">
            <label>Star</label>
            <input type="checkbox" {...register("star")}/>
          </div>

          <div className="flex flex-col">
            <label>Besoins</label>
            <Controller
              control={control}
              name="besoin"
              render={({ field }) => (
                <div className="flex flex-wrap gap-2">
                  {besoinsOptions.map(b => (
                    <label key={b} className="flex items-center gap-1">
                      <input type="checkbox" value={b} checked={field.value.includes(b)} onChange={e=>{
                        const checked=e.target.checked;
                        const val=e.target.value;
                        field.onChange(checked?[...field.value,val]:field.value.filter(x=>x!==val));
                      }} className="accent-[#25297e]"/>
                      {b}
                    </label>
                  ))}
                  <label className="flex items-center gap-1">
                    <input type="checkbox" value="Autre" checked={field.value.includes("Autre")} onChange={e=>{
                      const checked=e.target.checked;
                      field.onChange(checked?[...field.value,"Autre"]:field.value.filter(x=>x!=="Autre"));
                    }} className="accent-[#25297e]"/>
                    Autre
                  </label>
                </div>
              )}
            />
            {watchBesoin.includes("Autre") && <input {...register("autreBesoin")} className="input mt-2" placeholder="Précisez"/>}
          </div>

          <div className="flex flex-col">
            <label>Ministères</label>
            <Controller
              control={control}
              name="Ministere"
              render={({ field }) => (
                <div className="flex flex-wrap gap-2">
                  {ministereOptions.map(m => (
                    <label key={m} className="flex items-center gap-1">
                      <input type="checkbox" value={m} checked={field.value.includes(m)} onChange={e=>{
                        const checked=e.target.checked;
                        const val=e.target.value;
                        field.onChange(checked?[...field.value,val]:field.value.filter(x=>x!==val));
                      }} className="accent-[#25297e]"/>
                      {m}
                    </label>
                  ))}
                  <label className="flex items-center gap-1">
                    <input type="checkbox" value="Autre" checked={field.value.includes("Autre")} onChange={e=>{
                      const checked=e.target.checked;
                      field.onChange(checked?[...field.value,"Autre"]:field.value.filter(x=>x!=="Autre"));
                    }} className="accent-[#25297e]"/>
                    Autre
                  </label>
                </div>
              )}
            />
            {watchMinistere.includes("Autre") && <input {...register("autreMinistere")} className="input mt-2" placeholder="Précisez"/>}
          </div>

          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 rounded-2xl shadow-md transition-all">
            {loading?"Enregistrement...":"Sauvegarder"}
          </button>

          {message && <p className="text-center mt-2 font-semibold text-red-500">{message}</p>}
        </form>

        <style jsx>{`
          .input { width:100%; border:1px solid #a0c4ff; border-radius:14px; padding:12px; background:rgba(255,255,255,0.1); color:white; font-weight:400; }
        `}</style>
      </div>
    </div>
  );
}
