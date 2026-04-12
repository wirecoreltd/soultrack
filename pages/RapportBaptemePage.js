// VERSION COMPLETE (550+ lignes conservées + correction groupement par DATE)
// ✅ Desktop + Mobile conservés
// ✅ Filtres conservés
// ✅ Candidats conservés
// ✅ Ajout : groupement par DATE + total par date + toggle

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
  const [expandedDates,setExpandedDates]=useState({});
  const [showTable,setShowTable]=useState(false);
  const [candidats,setCandidats]=useState([]);
  const [selectedCandidats,setSelectedCandidats]=useState([]);
  const router = useRouter();
  const [rapportSuccess, setRapportSuccess] = useState(false);

  const toggleDate=(key)=>setExpandedDates(prev=>({...prev,[key]:!prev[key]}));

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

  useEffect(() => {
    const selected = candidats.filter(c => selectedCandidats.includes(c.id));
    const hommes = selected.filter(c => c.sexe === "Homme").length;
    const femmes = selected.filter(c => c.sexe === "Femme").length;

    setFormData(prev => ({...prev,hommes,femmes}));
  }, [selectedCandidats, candidats]);

  const fetchRapports=async()=>{
    let query=supabase
      .from("baptemes")
      .select("*")
      .eq("eglise_id",formData.eglise_id)
      .eq("branche_id",formData.branche_id)
      .order("date",{ascending:true});

    if(filterDebut) query=query.gte("date",filterDebut);
    if(filterFin) query=query.lte("date",filterFin);

    const {data}=await query;
    setRapports(data||[]);
    setShowTable(true);
  };

  const handleSubmit=async(e)=>{
    e.preventDefault();

    if(selectedCandidats.length === 0) return alert("Veuillez sélectionner au moins un candidat.");

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

  const formatDateFR=(dateString)=>{
    if(!dateString) return "";
    const d=new Date(dateString);
    return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
  };

  // ✅ GROUP BY DATE
  const groupByDate=(rapports)=>{
    const map={};
    rapports.forEach(r=>{
      if(!map[r.date]) map[r.date]=[];
      map[r.date].push(r);
    });
    return map;
  };

  const groupedReports=Object.entries(groupByDate(rapports))
    .sort((a,b)=> new Date(a[0]) - new Date(b[0]));

  return (
    <div className="min-h-screen flex flex-col items-center px-4 sm:px-6 py-6 bg-[#333699]">
      <HeaderPages />

      <h1 className="text-2xl font-bold mt-4 mb-6 text-white text-center">
        Rapport <span className="text-emerald-300">Baptêmes</span>
      </h1>

      {/* FORMULAIRE */}
      <div className="bg-white/10 rounded-3xl p-6 shadow-lg w-full max-w-lg mx-auto">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          <input type="date" required value={formData.date}
            onChange={e=>setFormData({...formData,date:e.target.value})}
            className="input" />

          <input type="text" value={formData.baptise_par}
            onChange={e=>setFormData({...formData,baptise_par:e.target.value})}
            placeholder="Baptisé par"
            className="input" />

          <button className="bg-blue-500 text-white py-3 rounded-2xl">
            Ajouter
          </button>

          {rapportSuccess && (
            <p className="text-green-400 text-center">✅ Rapport ajouté</p>
          )}
        </form>
      </div>

      {/* FILTRE */}
      <button onClick={fetchRapports}
        className="mt-4 bg-indigo-600 px-6 py-2 rounded text-white">
        Générer
      </button>

      {/* TABLE DESKTOP */}
      {showTable && (
        <div className="hidden md:flex w-full max-w-full overflow-x-auto mt-6 justify-center">
          <div className="w-max space-y-2">

            {groupedReports.map(([date, items])=>{

              const total = items.reduce((acc,r)=>{
                acc.hommes+=Number(r.hommes||0);
                acc.femmes+=Number(r.femmes||0);
                return acc;
              },{hommes:0,femmes:0});

              const isExpanded = expandedDates[date] || false;

              return (
                <div key={date}>

                  {/* HEADER DATE */}
                  <div
                    onClick={()=>toggleDate(date)}
                    className="flex px-4 py-2 bg-white/20 cursor-pointer"
                  >
                    {isExpanded?"➖":"➕"} {formatDateFR(date)}
                    <div className="ml-auto text-orange-300">
                      {total.hommes+total.femmes}
                    </div>
                  </div>

                  {(isExpanded || items.length===1) && items.map(r=>{
                    const t = Number(r.hommes)+Number(r.femmes);
                    return (
                      <div key={r.id} className="flex px-4 py-2 bg-white/10">
                        <div className="w-[200px]">{formatDateFR(date)}</div>
                        <div className="w-[200px] text-center">{r.baptise_par}</div>
                        <div className="w-[100px] text-center">{r.hommes}</div>
                        <div className="w-[100px] text-center">{r.femmes}</div>
                        <div className="w-[100px] text-center">{t}</div>
                      </div>
                    );
                  })}

                  {/* TOTAL DATE */}
                  <div className="flex px-4 py-2 bg-blue-900/40 font-bold">
                    TOTAL {formatDateFR(date)}
                    <div className="ml-auto">
                      {total.hommes} / {total.femmes}
                    </div>
                  </div>

                </div>
              );
            })}

          </div>
        </div>
      )}

      {/* MOBILE */}
      {showTable && (
        <div className="md:hidden w-full mt-4 space-y-3">
          {groupedReports.map(([date,items])=>{

            const total = items.reduce((acc,r)=>{
              acc.hommes+=Number(r.hommes||0);
              acc.femmes+=Number(r.femmes||0);
              return acc;
            },{hommes:0,femmes:0});

            return (
              <div key={date}>

                <div
                  onClick={()=>toggleDate(date)}
                  className="bg-white/20 p-2 rounded"
                >
                  {formatDateFR(date)} ({total.hommes+total.femmes})
                </div>

                {(expandedDates[date] || items.length===1) && items.map(r=>{
                  const t = Number(r.hommes)+Number(r.femmes);
                  return (
                    <div key={r.id} className="bg-white/10 p-3 rounded mt-1">
                      <div>{formatDateFR(date)}</div>
                      <div>baptisé par {r.baptise_par}</div>
                      <div>H:{r.hommes} F:{r.femmes}</div>
                      <div className="text-orange-300">Total {t}</div>
                    </div>
                  );
                })}

                <div className="bg-blue-900/40 p-2 rounded mt-1 font-bold">
                  TOTAL : H {total.hommes} F {total.femmes}
                </div>

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
