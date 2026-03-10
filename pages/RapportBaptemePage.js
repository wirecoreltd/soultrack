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

  /* FETCH CANDIDATS */

  const fetchCandidats=async(eglise_id,branche_id)=>{

    const {data}=await supabase
    .from("membres_complets")
    .select("id,prenom,nom,sexe")
    .eq("eglise_id",eglise_id)
    .eq("branche_id",branche_id)
    .eq("veut_se_faire_baptiser","Oui")
    .eq("bapteme_eau","Non");

    setCandidats(data||[]);
  };

  /* CALCUL HOMMES FEMMES */

  useEffect(()=>{

    const selected=candidats.filter(c=>selectedCandidats.includes(c.id));

    const hommes=selected.filter(c=>c.sexe==="Homme").length;
    const femmes=selected.filter(c=>c.sexe==="Femme").length;

    setFormData(prev=>({
      ...prev,
      hommes,
      femmes
    }));

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
  };

  /* CRUD */

  const handleSubmit=async(e)=>{

    e.preventDefault();

    if(editRapport){

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

    }else{

      await supabase.from("baptemes").insert([formData]);

    }

    setFormData(prev=>({
      ...prev,
      date:"",
      hommes:0,
      femmes:0,
      baptise_par:""
    }));

    setSelectedCandidats([]);

    fetchRapports();
  };

  /* RENDER */

  return (

  <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">

  <HeaderPages />

  <h1 className="text-2xl font-bold mt-4 mb-6 text-center text-white">
  Rapport Baptêmes
  </h1>

  {/* GRID FORMULAIRE + MENU */}

  <div className="grid md:grid-cols-2 gap-6 w-full max-w-5xl">

  {/* FORMULAIRE */}

  <div ref={formRef} className="bg-white/10 rounded-3xl p-6 shadow-lg">

  <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">

  <div className="flex flex-col">
  <label className="text-white mb-1">Date</label>
  <input
  type="date"
  required
  value={formData.date}
  onChange={(e)=>setFormData({...formData,date:e.target.value})}
  className="input"
  />
  </div>

  <div className="flex flex-col">
  <label className="text-white mb-1">Baptisé par</label>
  <input
  type="text"
  value={formData.baptise_par}
  onChange={(e)=>setFormData({...formData,baptise_par:e.target.value})}
  className="input"
  />
  </div>

  <div className="flex flex-col">
  <label className="text-white mb-1">Hommes</label>
  <input
  type="number"
  value={formData.hommes}
  disabled
  className="input opacity-60 cursor-not-allowed"
  />
  </div>

  <div className="flex flex-col">
  <label className="text-white mb-1">Femmes</label>
  <input
  type="number"
  value={formData.femmes}
  disabled
  className="input opacity-60 cursor-not-allowed"
  />
  </div>

  <div className="col-span-2 flex justify-center mt-4">
  <button
  type="submit"
  className="w-full bg-gradient-to-r from-blue-400 to-indigo-500 text-white font-bold py-3 rounded-2xl"
  >
  Ajouter le baptême
  </button>
  </div>

  </form>

  {/* PERSONNES SELECTIONNEES */}

  {selectedCandidats.length>0 && (

  <div className="mt-6 text-white">

  <h3 className="font-bold mb-2">Personnes baptisées</h3>

  {candidats
  .filter(c=>selectedCandidats.includes(c.id))
  .map(c=>(
  <div key={c.id}>
  {c.prenom} {c.nom} ({c.sexe})
  </div>
  ))}

  </div>

  )}

  </div>

  {/* MENU DEROUlANT */}

  <div className="bg-white/10 rounded-3xl p-6 shadow-lg text-white">

  <label className="mb-3 block font-semibold">
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
