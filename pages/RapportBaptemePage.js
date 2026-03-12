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

  const router = useRouter();
  const formRef=useRef(null);

  const [rapportSuccess,setRapportSuccess]=useState(false);

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
    .select("id,prenom,nom,sexe")
    .eq("eglise_id",eglise_id)
    .eq("branche_id",branche_id)
    .eq("veut_se_faire_baptiser","Oui")
    .eq("bapteme_eau","Non");

    setCandidats(data||[]);
  };

  /* CALCUL HOMMES FEMMES */

  useEffect(()=>{

    const selected=candidats.filter(c =>
      selectedCandidats.includes(c.id)
    );

    const hommes=selected.filter(c =>
      (c.sexe||"").toLowerCase().includes("homme")
    ).length;

    const femmes=selected.filter(c =>
      (c.sexe||"").toLowerCase().includes("femme")
    ).length;

    setFormData(prev=>({
      ...prev,
      hommes,
      femmes
    }));

  },[selectedCandidats,candidats]);

  /* FETCH RAPPORTS */

  const fetchRapports=async()=>{

    if(!formData.eglise_id || !formData.branche_id) return;

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

    if(editRapport) return;

    await supabase.from("baptemes").insert([{
      ...formData
    }]);

    setRapportSuccess(true);

    setTimeout(()=>{
      setRapportSuccess(false);
    },3000);

    for(const id of selectedCandidats){

      await supabase
      .from("membres_complets")
      .update({
        bapteme_eau:"Oui",
        veut_se_faire_baptiser:"Non"
      })
      .eq("id",id);

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

  return (

    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">

      <HeaderPages/>

      <h1 className="text-2xl font-bold mt-4 mb-6 text-center">
        <span className="text-white">Rapport </span>
        <span className="text-amber-300">Baptêmes</span>
      </h1>

      {/* FORMULAIRE + MENU */}

      <div className="max-w-5xl w-full grid md:grid-cols-2 gap-6 mb-6">

        {/* FORMULAIRE */}

        <div ref={formRef} className="bg-white/10 rounded-3xl p-6 shadow-lg">

          <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >

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
              className="input opacity-60"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-white mb-1">Femmes</label>
              <input
              type="number"
              value={formData.femmes}
              disabled
              className="input opacity-60"
              />
            </div>

            <div className="col-span-2 mt-4">

              <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-400 to-indigo-500 text-white font-bold py-3 rounded-2xl"
              >
                Ajouter le baptême
              </button>

              {rapportSuccess && (
                <p className="text-green-600 font-semibold text-center mt-4 animate-pulse">
                  ✅ Rapport ajouté !
                </p>
              )}

            </div>

          </form>

        </div>

        {/* MENU CANDIDATS */}

        <div className="bg-white/10 p-3 rounded-3xl shadow-lg text-white">

          <div className="flex justify-between items-center mb-2">
            <label className="font-semibold">
              Sélectionner les baptisés
            </label>
          </div>

          <div className="flex flex-col overflow-y-auto max-h-[300px] space-y-1">

            {candidats.map(c=>(
              <div
              key={c.id}
              className="flex justify-between items-center w-full px-2 py-1 rounded hover:bg-white/20"
              >

                <span>{c.prenom} {c.nom}</span>

                <input
                type="checkbox"
                checked={selectedCandidats.includes(c.id)}
                onChange={()=>{
                  setSelectedCandidats(prev=>{
                    if(prev.includes(c.id)){
                      return prev.filter(id=>id!==c.id);
                    }else{
                      return [...prev,c.id];
                    }
                  });
                }}
                />

              </div>
            ))}

          </div>

          <button
          onClick={()=>router.push("/AddContactbaptise")}
          className="text-white font-semibold px-4 py-2 rounded shadow text-sm mt-2 w-full"
          >
            ➕ Ajouter un Baptisé
          </button>

          {/* PERSONNES SELECTIONNEES */}

          {selectedCandidats.length>0 &&(

            <div className="mt-3">

              <h3 className="text-amber-300 font-semibold text-sm mb-1">
                Personnes sélectionnées :
              </h3>

              <ul className="list-disc list-inside text-white text-sm space-y-1">

                {candidats
                .filter(c=>selectedCandidats.includes(c.id))
                .map(c=>(
                  <li key={c.id}>
                    {c.prenom} {c.nom}
                  </li>
                ))}

              </ul>

            </div>

          )}

        </div>

      </div>

      <Footer/>

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
