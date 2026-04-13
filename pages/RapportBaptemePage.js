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

  /* AGGREGATE */
  const aggregateRapports = (rapports) => {
    const map = {};

    rapports.forEach(r => {
      const key = `${r.date}__${r.baptise_par}`;

      if (!map[key]) {
        map[key] = { ...r, hommes: 0, femmes: 0 };
      }

      map[key].hommes += Number(r.hommes || 0);
      map[key].femmes += Number(r.femmes || 0);
    });

    return Object.values(map);
  };

  /* GROUP BY MONTH */
  const groupByMonth = (rapports) => {
    const map = {};

    rapports.forEach(r => {
      const d = new Date(r.date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;

      if (!map[key]) {
        map[key] = {
          year: d.getFullYear(),
          month: d.getMonth(),
          rapports: [],
          totalHommes: 0,
          totalFemmes: 0
        };
      }

      map[key].rapports.push(r);
      map[key].totalHommes += Number(r.hommes || 0);
      map[key].totalFemmes += Number(r.femmes || 0);
    });

    return Object.values(map).sort((a,b)=>
      new Date(b.year,b.month) - new Date(a.year,a.month)
    );
  };

  /* FETCH */
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

  /* SUBMIT */
  const handleSubmit=async(e)=>{
    e.preventDefault();

    if (!formData.baptise_par.trim()) {
      alert("Le champ 'Baptisé par' est obligatoire.");
      return;
    }

    if(editRapport) return handleUpdate();

    if(selectedCandidats.length === 0)
      return alert("Veuillez sélectionner au moins un candidat.");

    for(const id of selectedCandidats){
      const membre = candidats.find(c => c.id === id);
      if(!membre) continue;

      await supabase.from("baptemes").insert([{
        ...formData,
        evangelise_member_id: membre.evangelise_member_id || membre.id
      }]);

      await supabase
        .from("membres_complets")
        .update({bapteme_eau:"Oui",veut_se_faire_baptiser:"Non"})
        .eq("id",id);
    }

    setSelectedCandidats([]);
    setFormData(prev=>({...prev,date:"",hommes:0,femmes:0,baptise_par:""}));
    fetchCandidats(formData.eglise_id,formData.branche_id);
    fetchRapports();

    setRapportSuccess(true);
    setTimeout(()=>setRapportSuccess(false),3000);
  };

  const handleEdit=(r)=>{
    setEditRapport(r);
    setFormData({...formData,date:r.date,hommes:r.hommes,femmes:r.femmes,baptise_par:r.baptise_par});
    formRef.current?.scrollIntoView({behavior:"smooth"});
  };

  const handleUpdate=async()=>{
    if (!formData.baptise_par.trim()) {
      alert("Le champ 'Baptisé par' est obligatoire.");
      return;
    }

    if(!editRapport) return;

    await supabase
      .from("baptemes")
      .update(formData)
      .eq("id",editRapport.id);

    setEditRapport(null);
    setSelectedCandidats([]);
    setFormData(prev=>({...prev,date:"",hommes:0,femmes:0,baptise_par:""}));
    fetchRapports();
  };

  /* UTILS */
  const getMonthNameFR=(i)=>{
    return ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"][i];
  };

  const formatDateFR=(d)=>{
    const x=new Date(d);
    return `${String(x.getDate()).padStart(2,"0")}/${String(x.getMonth()+1).padStart(2,"0")}/${x.getFullYear()}`;
  };

  const toggleMonth=(k)=>setExpandedMonths(prev=>({...prev,[k]:!prev[k]}));

  const grouped = groupByMonth(aggregateRapports(rapports));

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-6 bg-[#333699]">

      <HeaderPages />

      <h1 className="text-2xl font-bold text-white mt-4 mb-6">
        Rapport <span className="text-emerald-300">Baptêmes</span>
      </h1>

  <div className="max-w-3xl w-full mb-6 text-center">
  <p className="italic text-base text-white/90">
    <span className="text-blue-300 font-semibold">Créez et suivez</span> les rapports de baptêmes ainsi que le suivi des <span className="text-blue-300 font-semibold">nouveaux baptisés</span>.
    Enregistrez les données, <span className="text-blue-300 font-semibold">analysez</span> les volumes et la répartition hommes/femmes pour mesurer <span className="text-blue-300 font-semibold">l’impact et structurer la croissance de l’église</span>
  </p>
</div>

{/* BOITE INFO CANDIDATS */}
<div className="w-full flex flex-col gap-4 mt-4">
  <div className="bg-blue-900/40 border border-blue-300/30 text-white text-center text-sm p-4 rounded-2xl max-w-lg mx-auto">
    ℹ️ Cette liste contient les personnes qui <strong>n'ont pas encore été baptisées</strong> et qui <strong>souhaitent prendre leur baptême</strong>.<br/><br/>
    Ces informations sont mises à jour dans la <strong>Liste des membres</strong>.<br/>
    <button
      onClick={() => router.push("/list-members")}
      className="underline text-amber-300 hover:text-amber-200 mt-2 inline-block"
    >
      Voir la liste des membres
    </button>
  </div>
</div>

{/* --- MENU DEROU / Sélectionner les baptisés --- */}
<div className="bg-white/10 p-3 rounded-3xl shadow-lg text-white w-full max-w-lg mx-auto mt-4">
  <div className="flex justify-between items-center mb-2">
    <label className="font-semibold">Sélectionner les baptisés</label>
    <button
      onClick={() => {
        if (selectedCandidats.length === 0) {
          setSelectedCandidats(candidats.map(c => c.id));
        } else {
          setSelectedCandidats([]);
        }
      }}
      className="text-sm underline hover:text-orange-400"
    >
      {selectedCandidats.length === 0 ? "Tout sélectionner" : "Tout désélectionner"}
    </button>
  </div>

  <div className="flex flex-col space-y-1 max-h-60 overflow-y-auto">
    {candidats.map(c => (
      <div key={c.id} className="flex justify-between items-center w-full px-2 py-1 rounded hover:bg-white/20">
        <span>{c.prenom} {c.nom}</span>
        <input
          type="checkbox"
          checked={selectedCandidats.includes(c.id)}
          onChange={() => {
            if (selectedCandidats.includes(c.id)) {
              setSelectedCandidats(selectedCandidats.filter(id => id !== c.id));
            } else {
              setSelectedCandidats([...selectedCandidats, c.id]);
            }
          }}
          className="accent-[#25297e]"
        />
      </div>
    ))}
  </div>

  <button
    onClick={() => router.push("/AddContactbaptise")}
    className="text-white font-semibold px-4 py-2 rounded shadow text-sm mt-2 w-full"
  >
    ➕ Ajouter un Baptisé
  </button>

  <hr className="border-t border-white/30 my-3" />

  {selectedCandidats.length > 0 && (
    <div>
      <h3 className="text-amber-300 font-semibold text-sm mb-1">
        Personnes sélectionnées :
      </h3>
      <ul className="list-disc list-inside text-white text-sm space-y-1">
        {candidats
          .filter(c => selectedCandidats.includes(c.id))
          .map(c => (
            <li key={c.id}>{c.prenom} {c.nom}</li>
          ))}
      </ul>
    </div>
  )}
</div>

      {/* FORM */}
      <div className="bg-white/10 p-6 rounded-3xl w-full max-w-lg">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          <input type="date" required value={formData.date}
            onChange={e=>setFormData({...formData,date:e.target.value})}
            className="input"/>

          <input type="text" required placeholder="Baptisé par"
            value={formData.baptise_par}
            onChange={e=>setFormData({...formData,baptise_par:e.target.value})}
            className="input"/>

          <button className="bg-blue-500 p-3 rounded text-white">
            Ajouter
          </button>

        </form>
      </div>

      {/* TABLE */}
      {showTable && (
        <div className="w-full max-w-4xl mt-6">

          {grouped.map(month=>{
            const key=`${month.year}-${month.month}`;
            const open=expandedMonths[key];

            return(
              <div key={key} className="mb-4">

                {/* HEADER */}
                <div onClick={()=>toggleMonth(key)}
                  className="bg-blue-800 text-white p-3 rounded-xl flex justify-between cursor-pointer">
                  <span>{getMonthNameFR(month.month)} {month.year}</span>
                  <span>{open?"▲":"▼"} ({month.totalHommes+month.totalFemmes})</span>
                </div>

                {/* CONTENT */}
                {open && month.rapports.map(r=>{
                  const total=r.hommes+r.femmes;
                  return(
                    <div key={r.id} className="bg-white/10 p-3 mt-2 rounded text-white">
                      {formatDateFR(r.date)} | {r.baptise_par}
                      <br/>
                      H:{r.hommes} F:{r.femmes} Total:{total}
                    </div>
                  );
                })}

                {/* TOTAL */}
                {open && (
                  <div className="bg-white/20 p-3 mt-2 rounded text-orange-400 font-bold">
                    Total mois : {month.totalHommes+month.totalFemmes}
                  </div>
                )}

              </div>
            );
          })}

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
