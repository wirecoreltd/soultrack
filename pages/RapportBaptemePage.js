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

  const [candidats,setCandidats]=useState([]);
  const [selectedCandidats,setSelectedCandidats]=useState([]);

  const [filterDebut,setFilterDebut]=useState("");
  const [filterFin,setFilterFin]=useState("");
  const [rapports,setRapports]=useState([]);

  const [editRapport,setEditRapport]=useState(null);
  const [expandedMonths,setExpandedMonths]=useState({});
  const [showTable,setShowTable]=useState(false);

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

        setFormData(prev=>({
          ...prev,
          eglise_id:profile.eglise_id,
          branche_id:profile.branche_id
        }));

        fetchCandidats(profile.eglise_id,profile.branche_id);

      }

    };

    fetchUser();

  },[]);

  /* CANDIDATS */

  const fetchCandidats=async(eglise_id,branche_id)=>{

    const {data}=await supabase
      .from("membres_complets")
      .select("id,nom,prenom,sexe")
      .eq("eglise_id",eglise_id)
      .eq("branche_id",branche_id)
      .eq("bapteme_eau","Non")
      .eq("veut_se_faire_baptiser","Oui");

    setCandidats(data||[]);

  };

  /* RAPPORTS */

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

    const hommes=candidats
      .filter(c=>selectedCandidats.includes(c.id) && c.sexe==="Homme")
      .length;

    const femmes=candidats
      .filter(c=>selectedCandidats.includes(c.id) && c.sexe==="Femme")
      .length;

    const dataToInsert={
      ...formData,
      hommes,
      femmes
    };

    await supabase
      .from("baptemes")
      .insert([dataToInsert]);

    if(selectedCandidats.length>0){

      await supabase
        .from("membres_complets")
        .update({
          bapteme_eau:"Oui",
          veut_se_faire_baptiser:"Non"
        })
        .in("id",selectedCandidats);

    }

    setSelectedCandidats([]);

    setFormData(prev=>({
      ...prev,
      date:"",
      hommes:0,
      femmes:0,
      baptise_par:""
    }));

    fetchCandidats(formData.eglise_id,formData.branche_id);
    fetchRapports();

  };

  const handleEdit=(r)=>{

    setEditRapport(r);

    setFormData({
      ...formData,
      date:r.date,
      hommes:r.hommes,
      femmes:r.femmes,
      baptise_par:r.baptise_par
    });

    formRef.current?.scrollIntoView({
      behavior:"smooth",
      block:"start"
    });

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

    setFormData(prev=>({
      ...prev,
      date:"",
      hommes:0,
      femmes:0,
      baptise_par:""
    }));

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
    const day=String(d.getDate()).padStart(2,"0");
    const month=String(d.getMonth()+1).padStart(2,"0");
    const year=d.getFullYear();
    return `${day}/${month}/${year}`;
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

  const toggleMonth=(monthKey)=>
    setExpandedMonths(prev=>({...prev,[monthKey]:!prev[monthKey]}));

  const groupedReports=Object.entries(groupByMonth(rapports));

  const totalGlobal=rapports.reduce((acc,r)=>{

    acc.hommes+=Number(r.hommes||0);
    acc.femmes+=Number(r.femmes||0);

    return acc;

  },{hommes:0,femmes:0});

  /* RENDER */

  return(

  <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">

  <HeaderPages />

  <h1 className="text-2xl font-bold mt-4 mb-6 text-center">
  <span className="text-white">Rapport </span>
  <span className="text-amber-300">Baptêmes</span>
  </h1>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl">

  {/* FORMULAIRE */}

  <div ref={formRef} className="bg-white/10 rounded-3xl p-6 shadow-lg">

  <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">

  <div className="flex flex-col">
  <label className="text-white mb-1">Date</label>
  <input type="date" required value={formData.date}
  onChange={(e)=>setFormData({...formData,date:e.target.value})}
  className="input"/>
  </div>

  <div className="flex flex-col">
  <label className="text-white mb-1">Baptisé par</label>
  <input type="text"
  value={formData.baptise_par}
  onChange={(e)=>setFormData({...formData,baptise_par:e.target.value})}
  className="input"/>
  </div>

  <div className="flex flex-col">
  <label className="text-white mb-1">Hommes</label>
  <input type="number" value={formData.hommes} disabled className="input"/>
  </div>

  <div className="flex flex-col">
  <label className="text-white mb-1">Femmes</label>
  <input type="number" value={formData.femmes} disabled className="input"/>
  </div>

  <div className="col-span-2 flex justify-center mt-4">
  <button type="submit"
  className="w-full max-w-xl bg-gradient-to-r from-blue-400 to-indigo-500 text-white font-bold py-3 px-6 rounded-2xl shadow-lg">
  {editRapport?"Modifier":"Ajouter le baptême"}
  </button>
  </div>

  </form>

  {/* NOMS */}

  {selectedCandidats.length>0 &&(
  <div className="mt-6 text-white">
  <h3 className="font-bold mb-2">Personnes sélectionnées</h3>

  {candidats
    .filter(c=>selectedCandidats.includes(c.id))
    .map(c=>(
      <div key={c.id}>
      {c.prenom} {c.nom} ({c.sexe})
      </div>
    ))
  }

  </div>
  )}

  </div>

  {/* MENU */}

  <div className="bg-white/10 p-6 rounded-3xl shadow-lg text-white">

  <label className="block mb-2 font-semibold">
  Sélectionner les baptisés
  </label>

  <select
  multiple
  className="input w-full h-60"
  onChange={(e)=>{
    const values=[...e.target.selectedOptions].map(o=>o.value);
    setSelectedCandidats(values);
  }}
  >

  {candidats.map(c=>(
  <option key={c.id} value={c.id}>
  {c.prenom} {c.nom} ({c.sexe})
  </option>
  ))}

  </select>

  </div>

  </div>

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
