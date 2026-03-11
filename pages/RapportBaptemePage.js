"use client";

import { useEffect, useState, useRef } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import Footer from "../components/Footer";
import ProtectedRoute from "../components/ProtectedRoute";

export default function RapportBaptemesPage() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur","ResponsableFormation"]}>
      <RapportBaptemes />
    </ProtectedRoute>
  );
}

function RapportBaptemes() {
  const [formData,setFormData]=useState({
    date:"",
    hommes:0,
    femmes:0,
    baptise_par:"",
    eglise_id:null,
    branche_id:null
  });

  const [filterDebut,setFilterDebut]=useState("");
  const [filterFin,setFilterFin]=useState("");
  const [rapports,setRapports]=useState([]);
  const [editRapport,setEditRapport]=useState(null);
  const [expandedMonths,setExpandedMonths]=useState({});
  const [showTable,setShowTable]=useState(false);

  const [candidats,setCandidats]=useState([]);
  const [selectedCandidats,setSelectedCandidats]=useState([]);

  const formRef=useRef(null);

  /* USER */
  useEffect(()=>{
    const fetchUser=async()=>{
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

  /* CANDIDATS */
  const fetchCandidats=async(eglise_id,branche_id)=>{
    const {data}=await supabase
      .from("membres_complets")
      .select("id,prenom,nom,sexe")
      .eq("eglise_id",eglise_id)
      .eq("branche_id",branche_id)
      .eq("veut_se_faire_baptiser","Oui")
      .eq("bapteme_eau","Non");

    setCandidats(data || []);
  };

  /* CALCUL HOMMES FEMMES */
  useEffect(()=>{
    const selected=candidats.filter(c=>selectedCandidats.includes(c.id));
    const hommes=selected.filter(c=>c.sexe==="Homme").length;
    const femmes=selected.filter(c=>c.sexe==="Femme").length;
    setFormData(prev=>({...prev,hommes,femmes}));
  },[selectedCandidats]);

  /* FETCH RAPPORTS */
  const fetchRapports=async()=>{
    let query=supabase
      .from("baptemes")
      .select("*")
      .eq("eglise_id",formData.eglise_id)
      .eq("branche_id",formData.branche_id)
      .order("date",{ascending:false});

    if(filterDebut) query=query.gte("date",filterDebut);
    if(filterFin) query=query.lte("date",filterFin);

    const {data}=await query;
    setRapports(data||[]);
    setShowTable(true);
  };

  /* CRUD */
  const handleSubmit=async(e)=>{
    e.preventDefault();
    if(editRapport) return handleUpdate();

    // Mettre bapteme_eau = "Oui" et veut_se_faire_baptiser = "Non" pour tous les sélectionnés
    const selected = candidats.filter(c=>selectedCandidats.includes(c.id));
    const updates = selected.map(c => ({
      id: c.id,
      bapteme_eau: "Oui",
      veut_se_faire_baptiser: "Non"
    }));

    for(const u of updates){
      await supabase
        .from("membres_complets")
        .update({bapteme_eau:u.bapteme_eau,veut_se_faire_baptiser:u.veut_se_faire_baptiser})
        .eq("id",u.id);
    }

    await supabase.from("baptemes").insert([formData]);
    setSelectedCandidats([]);
    setFormData(prev=>({...prev,date:"",hommes:0,femmes:0,baptise_par:""}));
    fetchRapports();
    fetchCandidats(formData.eglise_id,formData.branche_id); // rafraichir la liste
  };

  const handleEdit=(r)=>{
    setEditRapport(r);
    setFormData({...formData,date:r.date,hommes:r.hommes,femmes:r.femmes,baptise_par:r.baptise_par});
    formRef.current?.scrollIntoView({behavior:"smooth",block:"start"});
  };

  const handleUpdate=async()=>{
    if(!editRapport) return;
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
    setSelectedCandidats([]);
    setFormData(prev=>({...prev,date:"",hommes:0,femmes:0,baptise_par:""}));
    fetchRapports();
  };

  /* UTIL */
  const getMonthNameFR=(monthIndex)=>{
    const months=["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
    return months[monthIndex]||"";
  };

  const formatDateFR=(dateString)=>{
    if(!dateString) return "";
    const d=new Date(dateString);
    return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
  };

  const groupByMonth=(rapports)=>{
    const map={};
    rapports.forEach(r=>{
      const d=new Date(r.date);
      const key=`${d.getFullYear()}-${d.getMonth()}`;
      if(!map[key]) map[key]=[];
      map[key].push(r);
    });
    return map;
  };

  const toggleMonth=(monthKey)=>setExpandedMonths(prev=>({...prev,[monthKey]:!prev[monthKey]}));

  const groupedReports=Object.entries(groupByMonth(rapports))
    .sort((a,b)=>{
      const [yearA,monthA]=a[0].split("-").map(Number);
      const [yearB,monthB]=b[0].split("-").map(Number);
      return new Date(yearA,monthA)-new Date(yearB,monthB);
    });

  const totalGlobal=rapports.reduce((acc,r)=>{
    acc.hommes+=Number(r.hommes||0);
    acc.femmes+=Number(r.femmes||0);
    return acc;
  },{hommes:0,femmes:0});

  /* RENDER */
  return (
  <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
    <HeaderPages />

    <h1 className="text-2xl font-bold mt-4 mb-6 text-center">
      <span className="text-white">Rapport </span>
      <span className="text-amber-300">Baptêmes</span>
    </h1>

    <p className="text-white/80 mb-6">Résumé des baptêmes par mois</p>

    {/* FORMULAIRE + MENU DEROU */}
    <div className="max-w-5xl w-full grid md:grid-cols-2 gap-6 mb-6">
      {/* Formulaire */}
      <div ref={formRef} className="bg-white/10 rounded-3xl p-6 shadow-lg">
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="text-white mb-1">Date</label>
            <input type="date" required value={formData.date} onChange={(e)=>setFormData({...formData,date:e.target.value})} className="input"/>
          </div>
          <div className="flex flex-col">
            <label className="text-white mb-1">Baptisé par</label>
            <input type="text" value={formData.baptise_par} onChange={(e)=>setFormData({...formData,baptise_par:e.target.value})} className="input"/>
          </div>
          <div className="flex flex-col">
            <label className="text-white mb-1">Hommes</label>
            <input type="number" value={formData.hommes} disabled className="input opacity-60"/>
          </div>
          <div className="flex flex-col">
            <label className="text-white mb-1">Femmes</label>
            <input type="number" value={formData.femmes} disabled className="input opacity-60"/>
          </div>
          <div className="col-span-2 mt-4">
            <button type="submit" className="w-full bg-gradient-to-r from-blue-400 to-indigo-500 text-white font-bold py-3 rounded-2xl">
              {editRapport?"Modifier":"Ajouter le baptême"}
            </button>
          </div>
        </form>

        {/* Noms sélectionnés */}
        {selectedCandidats.length > 0 && (
          <div className="mt-2 text-amber-300 text-sm">
            <h3 className="font-semibold mb-1">Personnes sélectionnées :</h3>
            <ul className="list-none pl-0">
              {candidats
                .filter(c => selectedCandidats.includes(c.id))
                .map(c => (
                  <li key={c.id} className="text-white">{c.prenom} {c.nom}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      {/* Menu déroulant */}
      <div className="bg-white/10 p-4 rounded-3xl shadow-lg text-white max-w-md w-full">
        <div className="flex justify-between items-center mb-2">
          <span className="font-semibold">Sélectionner les baptisés</span>
          <button
            onClick={() => setSelectedCandidats([])}
            className="text-sm text-red-400 underline hover:text-red-500"
          >
            Tout désélectionner
          </button>
        </div>

        <div className="flex flex-col gap-1 max-h-60 overflow-y-auto">
          {candidats.map(c => (
            <label key={c.id} className="flex items-center justify-between bg-white/5 px-3 py-1 rounded-md hover:bg-white/10 cursor-pointer">
              <span>{c.prenom} {c.nom}</span>
              <input
                type="checkbox"
                checked={selectedCandidats.includes(c.id)}
                onChange={() => {
                  if (selectedCandidats.includes(c.id)) {
                    setSelectedCandidats(prev => prev.filter(id => id !== c.id));
                  } else {
                    setSelectedCandidats(prev => [...prev, c.id]);
                  }
                }}
                className="accent-[#25297e]"
              />
            </label>
          ))}
        </div>
      </div>
    </div>

    {/* FILTRES */}
    <div className="bg-white/10 p-6 rounded-2xl shadow-lg mt-2 flex justify-center gap-4 flex-wrap text-white">
      <input type="date" value={filterDebut} onChange={(e)=>setFilterDebut(e.target.value)} className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white"/>
      <input type="date" value={filterFin} onChange={(e)=>setFilterFin(e.target.value)} className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white"/>
      <button onClick={fetchRapports} className="bg-[#2a2f85] px-6 py-2 rounded-xl hover:bg-[#1f2366]">Générer</button>
    </div>

    {/* TABLEAU */}
    {showTable && (
      <div className="w-full max-w-full overflow-x-auto mt-6 flex justify-center">
        <div className="w-max space-y-2">
          {/* ... Tableau inchangé ... */}
        </div>
      </div>
    )}

    <Footer />

    <style jsx>{`
      .input{
        border:1px solid #ccc;
        padding:10px;
        border-radius:12px;
        background:rgba(255,255,255,0.05);
        color:white;
      }
    `}</style>
  </div>
  );
}
