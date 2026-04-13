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
  const [rapportSuccess, setRapportSuccess] = useState(false);

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
      .select("id,prenom,nom,sexe,evangelise_member_id")
      .eq("eglise_id",eglise_id)
      .eq("branche_id",branche_id)
      .eq("veut_se_faire_baptiser","Oui")
      .eq("bapteme_eau","Non");

    setCandidats(data || []);
  };

  /* CALCUL HOMMES FEMMES */
  useEffect(() => {
    const selected = candidats.filter(c => selectedCandidats.includes(c.id));
    const hommes = selected.filter(c => c.sexe === "Homme").length;
    const femmes = selected.filter(c => c.sexe === "Femme").length;

    setFormData(prev => ({
      ...prev,
      hommes,
      femmes
    }));
  }, [selectedCandidats, candidats]);

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

    if(selectedCandidats.length===0)
      return alert("Veuillez sélectionner au moins un candidat.");

    for(const id of selectedCandidats){
      const membre = candidats.find(c=>c.id===id);
      if(!membre) continue;

      await supabase.from("baptemes").insert([{
        ...formData,
        evangelise_member_id:
          membre.evangelise_member_id || membre.id
      }]);

      await supabase
        .from("membres_complets")
        .update({
          bapteme_eau:"Oui",
          veut_se_faire_baptiser:"Non"
        })
        .eq("id",id);
    }

    setSelectedCandidats([]);
    setFormData(p=>({
      ...p,
      date:"",
      hommes:0,
      femmes:0,
      baptise_par:""
    }));

    fetchRapports();
    setRapportSuccess(true);
    setTimeout(()=>setRapportSuccess(false),3000);
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
    formRef.current?.scrollIntoView({behavior:"smooth"});
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
    setFormData(p=>({
      ...p,
      date:"",
      hommes:0,
      femmes:0,
      baptise_par:""
    }));

    fetchRapports();
  };

  /* UTILS */
  const getMonthNameFR=(i)=>[
    "Janvier","Février","Mars","Avril","Mai","Juin",
    "Juillet","Août","Septembre","Octobre","Novembre","Décembre"
  ][i];

  const formatDateFR=(d)=>{
    if(!d) return "";
    const date=new Date(d);
    return `${String(date.getDate()).padStart(2,"0")}/${String(date.getMonth()+1).padStart(2,"0")}/${date.getFullYear()}`;
  };

  const toggleMonth=(k)=>
    setExpandedMonths(p=>({...p,[k]:!p[k]}));

  /* GROUP */
  const groupByMonth=(data)=>{
    const map={};
    data.forEach(r=>{
      const d=new Date(r.date);
      const key=`${d.getFullYear()}-${d.getMonth()}`;
      if(!map[key]) map[key]=[];
      map[key].push(r);
    });
    return map;
  };

  const grouped=groupByMonth(rapports);

  const sortedMonths=Object.keys(grouped).sort((a,b)=>{
    const [yA,mA]=a.split("-").map(Number);
    const [yB,mB]=b.split("-").map(Number);
    return new Date(yB,mB)-new Date(yA,mA);
  });

  const totalGlobal=rapports.reduce((acc,r)=>{
    acc.hommes+=Number(r.hommes||0);
    acc.femmes+=Number(r.femmes||0);
    return acc;
  },{hommes:0,femmes:0});

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-6 bg-[#333699]">
      <HeaderPages />

      <h1 className="text-white text-2xl font-bold mt-4">
        Rapport Baptêmes
      </h1>

      {/* FORMULAIRE COMPLET RESTAURÉ */}
      <div ref={formRef} className="bg-white/10 p-6 rounded-3xl mt-4 w-full max-w-lg">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          <input
            type="date"
            value={formData.date}
            onChange={e=>setFormData({...formData,date:e.target.value})}
            className="input"
          />

          <input
            type="text"
            placeholder="Baptisé par"
            value={formData.baptise_par}
            onChange={e=>setFormData({...formData,baptise_par:e.target.value})}
            className="input"
          />

          <div className="flex gap-2">
            <input disabled value={formData.hommes} className="input"/>
            <input disabled value={formData.femmes} className="input"/>
          </div>

          <button className="bg-blue-500 text-white p-2 rounded">
            {editRapport ? "Modifier" : "Ajouter"}
          </button>

          {rapportSuccess && (
            <p className="text-green-400 text-center">
              ✔ Sauvegardé
            </p>
          )}
        </form>
      </div>

      {/* TABLE SIMPLE (NO DUPLICATES) */}
      <div className="hidden md:block w-full mt-6">
        {sortedMonths.map(key=>{
          const [y,m]=key.split("-");

          return (
            <div key={key}>
              <div
                onClick={()=>toggleMonth(key)}
                className="text-white bg-white/10 p-3 mt-2 cursor-pointer"
              >
                {getMonthNameFR(m)} {y}
              </div>

              {expandedMonths[key] &&
                grouped[key].map(r=>(
                  <div key={r.id} className="text-white p-2">
                    {formatDateFR(r.date)} - {r.baptise_par} - {Number(r.hommes)+Number(r.femmes)}
                  </div>
                ))}
            </div>
          );
        })}
      </div>

      <Footer />

      <style jsx>{`
        .input{
          width:100%;
          padding:10px;
          margin-top:8px;
          border-radius:10px;
          background:rgba(255,255,255,0.1);
          color:white;
        }
      `}</style>
    </div>
  );
}
