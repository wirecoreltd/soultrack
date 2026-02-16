"use client";

import { useState, useEffect, useRef } from "react";
import supabase from "../lib/supabaseClient";

// ---------------- EDIT MEMBER POPUP ----------------
function EditMemberSuivisPopup({ member, onClose, onUpdateMember }) {
  if (!member) return null;

  const besoinsOptions = ["Finances", "Santé", "Travail", "Les Enfants", "La Famille"];
  const ministereOptions = [
    "Intercession","Louange","Technique","Communication","Les Enfants",
    "Les ados","Les jeunes","Finance","Nettoyage","Conseiller",
    "Compassion","Visite","Berger","Modération"
  ];

  const parseBesoin = (b) => {
    if (!b) return [];
    if (Array.isArray(b)) return b;
    try { const parsed = JSON.parse(b); return Array.isArray(parsed) ? parsed : [String(b)]; } catch { return [String(b)]; }
  };

  const initialBesoin = parseBesoin(member?.besoin);
  const initialMinistere = parseBesoin(member?.Ministere);

  const [formData, setFormData] = useState({
    prenom: member.prenom || "",
    nom: member.nom || "",
    telephone: member.telephone || "",
    ville: member.ville || "",
    sexe: member.sexe || "",
    star: !!member.star,
    etat_contact: member.etat_contact || "Nouveau",
    bapteme_eau: member.bapteme_eau ?? null,
    bapteme_esprit: member.bapteme_esprit ?? null,
    priere_salut: member.priere_salut || "",
    type_conversion: member.type_conversion || "",
    cellule_id: member.cellule_id ?? "",
    conseiller_id: member.conseiller_id ?? "",
    besoin: initialBesoin,
    autreBesoin: "",
    Ministere: initialMinistere,
    autreMinistere: "",
    venu: member.venu || "",
    infos_supplementaires: member.infos_supplementaires || "",
    statut_initial: member.statut_initial || "",
    suivi_statut: member.suivi_statut || "",
    commentaire_suivis: member.commentaire_suivis || "",
    is_whatsapp: !!member.is_whatsapp,
    Formation: member.Formation || "",
    Soin_Pastoral: member.Soin_Pastoral || "",
    Commentaire_Suivi_Evangelisation: member.Commentaire_Suivi_Evangelisation || "",
  });

  const [showAutreBesoin, setShowAutreBesoin] = useState(initialBesoin.includes("Autre"));
  const [showAutreMinistere, setShowAutreMinistere] = useState(initialMinistere.includes("Autre"));
  const [cellules, setCellules] = useState([]);
  const [conseillers, setConseillers] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Load cellules & conseillers
  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      try {
        const { data: cellulesData } = await supabase.from("cellules").select("id, cellule_full");
        const { data: conseillersData } = await supabase.from("profiles").select("id, prenom, nom").eq("role", "Conseiller");
        if (!mounted) return;
        setCellules(cellulesData || []);
        setConseillers(conseillersData || []);
        setLoadingData(false);
      } catch (err) { console.error(err); setLoadingData(false); }
    };
    loadData();
    return () => { mounted = false; };
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData(prev => ({ 
        ...prev, 
        [name]: checked,
        ...(name === "star" && !checked ? { Ministere: [] } : {})
      }));
    } else if (name === "cellule_id") {
      setFormData(prev => ({ ...prev, cellule_id: value, conseiller_id: "" }));
    } else if (name === "conseiller_id") {
      setFormData(prev => ({ ...prev, conseiller_id: value, cellule_id: "" }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleBesoinChange = (e) => {
    const { value, checked } = e.target;
    if (value === "Autre") {
      setShowAutreBesoin(checked);
      setFormData(prev => ({
        ...prev,
        besoin: checked ? [...prev.besoin, "Autre"] : prev.besoin.filter(b => b !== "Autre"),
        autreBesoin: ""
      }));
      return;
    }
    setFormData(prev => ({ ...prev, besoin: checked ? [...prev.besoin, value] : prev.besoin.filter(b => b !== value) }));
  };

  const handleMinistereChange = (e) => {
    const { value, checked } = e.target;
    if (value === "Autre") {
      setShowAutreMinistere(checked);
      setFormData(prev => ({
        ...prev,
        Ministere: checked ? [...prev.Ministere, "Autre"] : prev.Ministere.filter(m => m !== "Autre"),
        autreMinistere: ""
      }));
      return;
    }
    setFormData(prev => ({ ...prev, Ministere: checked ? [...prev.Ministere, value] : prev.Ministere.filter(m => m !== value) }));
  };

  const handleSubmit = async () => {
    setMessage("");
    if (!formData.prenom.trim()) return setMessage("❌ Le prénom est obligatoire.");
    if (!formData.nom.trim()) return setMessage("❌ Le nom est obligatoire.");

    setLoading(true);

    try {
      let finalBesoin = formData.besoin.filter(b => b !== "Autre");
      if (showAutreBesoin && formData.autreBesoin.trim()) finalBesoin.push(formData.autreBesoin.trim());

      let finalMinistere = formData.Ministere.filter(m => m !== "Autre");
      if (showAutreMinistere && formData.autreMinistere.trim()) finalMinistere.push(formData.autreMinistere.trim());

      const payload = {
        ...formData,
        besoin: JSON.stringify(finalBesoin),
        Ministere: formData.star ? JSON.stringify(finalMinistere) : null
      };

      const { error } = await supabase.from("membres_complets").update(payload).eq("id", member.id);
      if (error) throw error;

      const { data } = await supabase.from("membres_complets").select("*").eq("id", member.id).single();
      onUpdateMember?.(data);
      onClose();
    } catch (err) {
      console.error(err);
      setMessage("❌ Une erreur est survenue lors de l’enregistrement.");
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="relative w-full max-w-lg p-6 rounded-3xl shadow-2xl bg-gradient-to-b from-[rgba(46,49,146,0.16)] to-[rgba(46,49,146,0.4)]" style={{ backdropFilter: "blur(8px)" }}>
        <button onClick={onClose} className="absolute top-4 right-4 text-red-600 font-bold text-xl">✕</button>
        <h2 className="text-2xl font-bold text-center mb-6 text-white">
          Modifier le profil {member.prenom} {member.nom}
        </h2>

        {loadingData ? <p className="text-center text-white">Chargement...</p> : (
          <div className="overflow-y-auto max-h-[70vh] flex flex-col gap-4 text-white">
            {/* Champs simples */}
            {["prenom","nom","telephone","ville"].map(f => (
              <div key={f} className="flex flex-col">
                <label className="font-medium capitalize">{f}</label>
                <input name={f} value={formData[f]} onChange={handleChange} className="input"/>
                {f === "telephone" && (
                  <div className="flex items-center gap-3 mt-2">
                    <label>Numéro WhatsApp</label>
                    <input type="checkbox" name="is_whatsapp" checked={formData.is_whatsapp} onChange={handleChange} className="accent-[#25297e]" />
                  </div>
                )}
              </div>
            ))}

            {/* Sexe */}
            <div className="flex flex-col">
              <label>Sexe</label>
              <select name="sexe" value={formData.sexe} onChange={handleChange} className="input">
                <option value="">-- Sexe --</option>
                <option value="Homme">Homme</option>
                <option value="Femme">Femme</option>
              </select>
            </div>

            {/* Baptemes, Formation, Soin Pastoral, Prière du salut */}
            {/* ... à copier tel quel depuis ton code ... */}

            {/* Besoins */}
            <div className="flex flex-col">
              <label>Besoins</label>
              <div className="flex flex-wrap gap-2">
                {besoinsOptions.map(b => (
                  <label key={b} className="flex items-center gap-2">
                    <input type="checkbox" value={b} checked={formData.besoin.includes(b)} onChange={handleBesoinChange} className="accent-[#25297e]" />
                    {b}
                  </label>
                ))}
                <label className="flex items-center gap-2">
                  <input type="checkbox" value="Autre" checked={showAutreBesoin} onChange={handleBesoinChange} className="accent-[#25297e]" />
                  Autre
                </label>
              </div>
              {showAutreBesoin && <input name="autreBesoin" value={formData.autreBesoin} onChange={handleChange} className="input mt-2" placeholder="Précisez"/>}
            </div>

            {/* Ministères */}
            <div className="flex flex-col mt-2">
              <label>Ministères</label>
              <div className="flex flex-wrap gap-2">
                {ministereOptions.map(m => (
                  <label key={m} className="flex items-center gap-2">
                    <input type="checkbox" value={m} checked={formData.Ministere.includes(m)} onChange={handleMinistereChange} className="accent-[#25297e]" />
                    {m}
                  </label>
                ))}
                <label className="flex items-center gap-2">
                  <input type="checkbox" value="Autre" checked={showAutreMinistere} onChange={handleMinistereChange} className="accent-[#25297e]" />
                  Autre
                </label>
              </div>
              {showAutreMinistere && <input name="autreMinistere" value={formData.autreMinistere} onChange={(e)=>setFormData(prev=>({...prev, autreMinistere:e.target.value}))} className="input mt-2" placeholder="Précisez"/>}
            </div>

            {/* Boutons et messages */}
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <button onClick={onClose} className="w-full bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 rounded-2xl shadow-md transition-all">Annuler</button>
              <button onClick={handleSubmit} disabled={loading} className="w-full bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 rounded-2xl shadow-md transition-all">
                {loading ? "Enregistrement..." : "Sauvegarder"}
              </button>
            </div>

            {message && <p className={`text-center mt-3 font-semibold ${message.includes('❌')?'text-red-500':'text-green-500'}`}>{message}</p>}
          </div>
        )}
        <style jsx>{`
          .input {
            width: 100%;
            border: 1px solid #a0c4ff;
            border-radius: 14px;
            padding: 12px;
            background: rgba(255,255,255,0.1);
            color: white;
            font-weight: 400;
          }
          select.input option { background:white; color:black; font-weight:400; }
          label { font-weight:600; color:white; }
        `}</style>
      </div>
    </div>
  );
}

// ---------------- DETAILS MEMBER POPUP ----------------
export default function DetailsSuivisPopup({
  m, cellules, conseillers, onClose,
  commentChanges, statusChanges,
  handleCommentChange, handleStatusChange,
  updateSuivi, reactivateMember, updating,
  showRefus
}) {
  if (!m || !m.id) return null;
  const [editMember, setEditMember] = useState(null);
  const [openPhoneMenu, setOpenPhoneMenu] = useState(false);
  const phoneMenuRef = useRef(null);

  const cellule = cellules?.find(c => c.id === m.cellule_id);
  const conseiller = conseillers?.find(c => c.id === m.conseiller_id);

  useEffect(()=>{ document.body.style.overflow="hidden"; return()=>{document.body.style.overflow="auto";} }, []);
  useEffect(()=>{ const handleClickOutside=e=>{ if(phoneMenuRef.current&&!phoneMenuRef.current.contains(e.target)) setOpenPhoneMenu(false);} 
  document.addEventListener("mousedown",handleClickOutside); return()=>document.removeEventListener("mousedown",handleClickOutside); }, []);

  const formatValue = v => { if(!v) return "—"; try{ const p=typeof v==="string"?JSON.parse(v):v; return Array.isArray(p)?p.join(", "):p } catch{return "—";} }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-lg font-bold">✖</button>

        <div className="flex flex-col items-center text-center">
          <h2 className="text-lg font-bold">{m.prenom} {m.nom} {m.star && "⭐"}</h2>

          {m.telephone && (
            <div className="relative mt-1" ref={phoneMenuRef}>
              <button onClick={()=>setOpenPhoneMenu(!openPhoneMenu)} className="text-orange-500 underline font-semibold">{m.telephone}</button>
              {openPhoneMenu && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white text-center border rounded-lg shadow w-56 z-50">
                  <a href={`tel:${m.telephone}`} className="block px-4 py-2 hover:bg-gray-100 text-black">📞 Appeler</a>
                  <a href={`sms:${m.telephone}`} className="block px-4 py-2 hover:bg-gray-100 text-black">✉️ SMS</a>
                  <a href={`https://wa.me/${m.telephone.replace(/\D/g,"")}`} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 hover:bg-gray-100 text-black">💬 WhatsApp</a>
                </div>
              )}
            </div>
          )}

          <p className="mt-2">🏙️ Ville : {m.ville||"—"}</p>
          <p>🏠 Cellule : {cellule?.cellule_full||"—"}</p>
          <p>👤 Conseiller : {conseiller?`${conseiller.prenom} ${conseiller.nom}`:"—"}</p>

          <div className="flex flex-col w-full mt-4">
            <label className="font-semibold text-blue-700 mb-1 text-center">Commentaire Suivis</label>
            <textarea value={commentChanges[m.id] ?? m.commentaire_suivis ?? ""} onChange={(e)=>handleCommentChange(m.id,e.target.value)} className="w-full border rounded-lg p-2" rows={2}/>

            <label className="font-semibold text-blue-700 mb-1 mt-2 text-center">Statut Intégration</label>
            <select value={statusChanges[m.id] ?? String(m.statut_suivis ?? "")} onChange={(e)=>handleStatusChange(m.id,e.target.value)} className="w-full border rounded-lg p-2 mb-2">
              <option value="">-- Sélectionner un statut --</option>
              <option value="2">En Suivis</option>
              <option value="3">Intégré</option>
              <option value="4">Refus</option>
            </select>

            {showRefus ? (
              <button onClick={async()=>{await reactivateMember(m.id);onClose();}} disabled={updating[m.id]} className={`mt-2 py-2 rounded w-full transition ${updating[m.id]?"bg-gray-400 cursor-not-allowed":"bg-green-500 hover:bg-green-600 text-white"}`}>
                {updating[m.id]?"Réactivation...":"Réactiver"}
              </button>
            ):(
              <button onClick={async()=>{await updateSuivi(m.id);onClose();}} disabled={updating[m.id]} className={`mt-2 py-2 rounded w-full transition ${updating[m.id]?"bg-gray-400 cursor-not-allowed":"bg-blue-500 hover:bg-blue-600 text-white"}`}>
                {updating[m.id]?"Enregistrement...":"Enregistrer Suivis"}
              </button>
            )}
          </div>

          <button onClick={()=>setEditMember(m)} className="mt-3 py-2 px-4 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg">✏️ Modifier le membre</button>
        </div>
      </div>

      {editMember && <EditMemberSuivisPopup member={editMember} onClose={()=>setEditMember(null)} onUpdateMember={()=>{setEditMember(null);}} />}
    </div>
  );
}
