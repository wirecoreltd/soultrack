"use client";

import { useEffect, useState, useRef } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import Footer from "../components/Footer";
import ProtectedRoute from "../components/ProtectedRoute";
import { useRouter } from "next/navigation";

export default function RapportBaptemesPage() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur","ResponsableFormation"]}>
      <RapportBaptemes/>
    </ProtectedRoute>
  );
}

function RapportBaptemes() {

const router = useRouter();
const formRef = useRef(null);

const [formData,setFormData]=useState({
  date:"",
  hommes:0,
  femmes:0,
  baptise_par:"",
  eglise_id:null,
  branche_id:null
});

const [candidats,setCandidats]=useState([]);
const [selectedCandidats,setSelectedCandidats]=useState([]);

const [rapports,setRapports]=useState([]);
const [editRapport,setEditRapport]=useState(null);

const [filterDebut,setFilterDebut]=useState("");
const [filterFin,setFilterFin]=useState("");

const [expandedMonths,setExpandedMonths]=useState({});
const [showTable,setShowTable]=useState(false);
const [rapportSuccess,setRapportSuccess]=useState(false);

////////////////////////////////////////////////////
//////////////////// USER
////////////////////////////////////////////////////

useEffect(()=>{
  const fetchUser = async()=>{
    const {data:session}=await supabase.auth.getSession();
    if(!session?.session?.user) return;

    const {data:profile}=await supabase
      .from("profiles")
      .select("eglise_id,branche_id")
      .eq("id",session.session.user.id)
      .single();

    if(profile){
      setFormData(prev=>({...prev,eglise_id:profile.eglise_id,branche_id:profile.branche_id}));
      fetchCandidats(profile.eglise_id,profile.branche_id);
    }
  };

  fetchUser();
},[]);

////////////////////////////////////////////////////
//////////////////// CANDIDATS
////////////////////////////////////////////////////

const fetchCandidats = async(eglise_id,branche_id)=>{
  const {data}=await supabase
    .from("membres_complets")
    .select("id,prenom,nom,sexe")
    .eq("eglise_id",eglise_id)
    .eq("branche_id",branche_id)
    .eq("veut_se_faire_baptiser","Oui")
    .eq("bapteme_eau","Non");

  setCandidats(data || []);
};

////////////////////////////////////////////////////
//////////// CALCUL HOMMES / FEMMES
////////////////////////////////////////////////////

useEffect(()=>{
  const selected=candidats.filter(c=>selectedCandidats.includes(c.id));
  const hommes=selected.filter(c=>c.sexe==="Homme").length;
  const femmes=selected.filter(c=>c.sexe==="Femme").length;
  setFormData(prev=>({...prev,hommes,femmes}));
},[selectedCandidats]);

////////////////////////////////////////////////////
//////////////////// RAPPORTS
////////////////////////////////////////////////////

const fetchRapports = async()=>{
  let query=supabase
    .from("baptemes")
    .select("*")
    .eq("eglise_id",formData.eglise_id)
    .eq("branche_id",formData.branche_id)
    .order("date",{ascending:false});

  if(filterDebut) query=query.gte("date",filterDebut);
  if(filterFin) query=query.lte("date",filterFin);

  const {data}=await query;
  setRapports(data || []);
  setShowTable(true);
};

////////////////////////////////////////////////////
//////////////////// AJOUT
////////////////////////////////////////////////////

const handleSubmit=async(e)=>{
  e.preventDefault();
  if(editRapport) return handleUpdate();

  await supabase.from("baptemes").insert([formData]);

  setRapportSuccess(true);
  setTimeout(()=>setRapportSuccess(false),3000);

  for(const id of selectedCandidats){
    await supabase
      .from("membres_complets")
      .update({bapteme_eau:"Oui",veut_se_faire_baptiser:"Non"})
      .eq("id",id);
  }

  setSelectedCandidats([]);
  setFormData(prev=>({...prev,date:"",hommes:0,femmes:0,baptise_par:""}));

  fetchCandidats(formData.eglise_id,formData.branche_id);
  fetchRapports();
};

////////////////////////////////////////////////////
//////////////////// EDIT
////////////////////////////////////////////////////

const handleEdit=(r)=>{
  setEditRapport(r);
  setFormData({...formData,date:r.date,hommes:r.hommes,femmes:r.femmes,baptise_par:r.baptise_par});
  formRef.current?.scrollIntoView({behavior:"smooth"});
};

const handleUpdate=async()=>{
  await supabase
    .from("baptemes")
    .update({
      date:formData.date,
      hommes:formData.hommes,
      femmes:formData.femmes,
      baptise_par:formData.baptise_par
    })
    .eq("id",editRapport.id);

  setEditRapport(null);
  fetchRapports();
};

////////////////////////////////////////////////////
//////////////////// UTILS
////////////////////////////////////////////////////

const formatDateFR=(d)=>{
  const date=new Date(d);
  return `${String(date.getDate()).padStart(2,"0")}/${String(date.getMonth()+1).padStart(2,"0")}/${date.getFullYear()}`;
};

////////////////////////////////////////////////////
//////////////////// RENDER
////////////////////////////////////////////////////

return(
<div className="min-h-screen flex flex-col items-center px-4 py-6 bg-[#333699]">

<HeaderPages/>

<h1 className="text-2xl font-bold text-white mt-4 mb-6">
Rapport <span className="text-amber-300">Baptêmes</span>
</h1>

<div className="max-w-6xl w-full space-y-6">

{/* MESSAGE INFO */}

<div className="bg-blue-900/40 border border-blue-300/30 text-white text-center p-5 rounded-2xl">
ℹ️ Cette liste contient les personnes qui <strong>n'ont pas encore été baptisées</strong> et souhaitent prendre leur baptême.
<br/><br/>
Ces informations sont mises à jour dans la <strong>Liste des membres</strong>.
<br/>
<button onClick={()=>router.push("/list-members")} className="underline text-amber-300 mt-2">
Voir la liste des membres
</button>
</div>

{/* CANDIDATS */}

<div className="bg-white/10 p-4 rounded-3xl text-white">
<div className="flex justify-between mb-3">
<h3 className="font-semibold">Sélectionner les baptisés</h3>

<button
onClick={()=>setSelectedCandidats(
selectedCandidats.length===0 ? candidats.map(c=>c.id) : []
)}
className="text-sm underline"
>
{selectedCandidats.length===0?"Tout sélectionner":"Tout désélectionner"}
</button>

</div>

<div className="max-h-[250px] overflow-y-auto space-y-1">

{candidats.map(c=>(
<div key={c.id} className="flex justify-between px-2 py-1 hover:bg-white/20 rounded">
<span>{c.prenom} {c.nom}</span>

<input
type="checkbox"
checked={selectedCandidats.includes(c.id)}
onChange={()=>{
if(selectedCandidats.includes(c.id)){
setSelectedCandidats(selectedCandidats.filter(id=>id!==c.id));
}else{
setSelectedCandidats([...selectedCandidats,c.id]);
}
}}
/>

</div>
))}

</div>
</div>

{/* FORMULAIRE */}

<div ref={formRef} className="bg-white/10 p-6 rounded-3xl text-white">

<form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">

<div>
<label>Date</label>
<input type="date" required value={formData.date}
onChange={(e)=>setFormData({...formData,date:e.target.value})}
className="input"/>
</div>

<div>
<label>Baptisé par</label>
<input type="text"
value={formData.baptise_par}
onChange={(e)=>setFormData({...formData,baptise_par:e.target.value})}
className="input"/>
</div>

<div>
<label>Hommes</label>
<input type="number" value={formData.hommes} disabled className="input opacity-60"/>
</div>

<div>
<label>Femmes</label>
<input type="number" value={formData.femmes} disabled className="input opacity-60"/>
</div>

<div className="col-span-2">
<button type="submit" className="w-full bg-indigo-600 py-3 rounded-xl">
{editRapport?"Modifier":"Ajouter le baptême"}
</button>

{rapportSuccess && (
<p className="text-green-400 text-center mt-3">Rapport ajouté !</p>
)}

</div>

</form>
</div>

{/* FILTRES */}

<div className="bg-white/10 p-4 rounded-2xl flex gap-4 flex-wrap justify-center">
<input type="date" value={filterDebut} onChange={(e)=>setFilterDebut(e.target.value)} className="input"/>
<input type="date" value={filterFin} onChange={(e)=>setFilterFin(e.target.value)} className="input"/>
<button onClick={fetchRapports} className="bg-indigo-600 px-6 py-2 rounded-xl text-white">
Générer
</button>
</div>

{/* TABLEAU DESKTOP */}

{showTable && (
<div className="hidden md:block w-full overflow-x-auto">
{/* GARDE TON TABLEAU ACTUEL ICI */}
</div>
)}

{/* TABLEAU MOBILE */}

{showTable && (
<div className="md:hidden space-y-3">
{rapports.map(r=>{
const total=r.hommes+r.femmes;
return(
<div key={r.id} className="bg-white/10 p-4 rounded-2xl text-white">
<div className="font-semibold">📅 {formatDateFR(r.date)}</div>
<div>Baptisé par : {r.baptise_par}</div>
<div className="mt-2">Hommes : {r.hommes}</div>
<div>Femmes : {r.femmes}</div>
<div className="font-bold mt-1">Total : {total}</div>

<button onClick={()=>handleEdit(r)} className="text-amber-300 underline mt-2">
Modifier
</button>
</div>
);
})}
</div>
)}

</div>

<Footer/>

<style jsx>{`
.input{
border:1px solid #ccc;
padding:10px;
border-radius:10px;
background:rgba(255,255,255,0.05);
color:white;
width:100%;
}
`}</style>

</div>
);
}
