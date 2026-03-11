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
      .select("id,prenom,nom,sexe")
      .eq("eglise_id",eglise_id)
      .eq("branche_id",branche_id)
      .eq("veut_se_faire_baptiser","Oui")
      .eq("bapteme_eau","Non");

    setCandidats(data || []);
  };

  useEffect(()=>{
    const selected=candidats.filter(c=>selectedCandidats.includes(c.id));
    const hommes=selected.filter(c=>c.sexe==="Homme").length;
    const femmes=selected.filter(c=>c.sexe==="Femme").length;
    setFormData(prev=>({...prev,hommes,femmes}));
  },[selectedCandidats,candidats]);

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

  const handleSubmit=async(e)=>{
    e.preventDefault();
    if(editRapport) return handleUpdate();

    await supabase.from("baptemes").insert([{...formData}]);

    setRapportSuccess(true);
    setTimeout(() => setRapportSuccess(false), 3000);

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

  const groupedReports=Object.entries(groupByMonth(rapports));

  const totalGlobal=rapports.reduce((acc,r)=>{
    acc.hommes+=Number(r.hommes||0);
    acc.femmes+=Number(r.femmes||0);
    return acc;
  },{hommes:0,femmes:0});

  return (
    <div className="min-h-screen flex flex-col items-center px-3 py-4 sm:px-4 sm:py-6 bg-[#333699]">
      <HeaderPages />

      <h1 className="text-lg sm:text-2xl font-bold mt-4 mb-6 text-center px-2">
        <span className="text-white">Rapport </span>
        <span className="text-amber-300">Baptêmes</span>
      </h1>

      <div className="max-w-6xl w-full grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6 px-2">
        <div ref={formRef} className="bg-white/10 rounded-3xl p-4 sm:p-6 shadow-lg">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <button type="submit" className="w-full bg-gradient-to-r from-blue-400 to-indigo-500 text-white font-bold py-3 rounded-2xl hover:scale-[1.02] transition">
                {editRapport?"Modifier":"Ajouter le baptême"}
              </button>
              {rapportSuccess && (
                <p className="text-green-400 font-semibold text-center mt-4 animate-pulse">
                  ✅ Rapport ajouté !
                </p>
              )}
            </div>
          </form>
        </div>

        <div className="w-full flex flex-col gap-4">
          <div className="bg-blue-900/40 border border-blue-300/30 text-white text-sm p-4 rounded-2xl">
            ℹ️ Cette liste contient les personnes qui <strong>n'ont pas encore été baptisées</strong> et qui
            <strong> souhaitent prendre leur baptême</strong>.<br/><br/>
            Ces informations sont mises à jour dans la <strong>Liste des membres</strong>.
            <div className="mt-2">
              <button
                onClick={() => router.push("/list-members")}
                className="underline text-amber-300 hover:text-amber-200 text-sm"
              >
                Voir la liste des membres
              </button>
            </div>
          </div>

          <div className="bg-white/10 p-3 rounded-3xl shadow-lg text-white">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2">
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

            <div className="flex flex-col overflow-y-auto max-h-[250px] sm:max-h-[300px] space-y-1">
              {candidats.map(c => (
                <div key={c.id} className="flex justify-between items-center w-full px-2 py-1 rounded hover:bg-white/20">
                  <span className="text-sm">{c.prenom} {c.nom}</span>
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
              className="text-white font-semibold px-4 py-2 rounded shadow text-sm mt-2 w-full bg-indigo-600 hover:bg-indigo-700"
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
        </div>
      </div>

      <div className="bg-white/10 p-4 sm:p-6 rounded-2xl shadow-lg mt-2 flex flex-col sm:flex-row sm:justify-center gap-4 text-white w-full max-w-4xl">
        <input type="date" value={filterDebut} onChange={(e)=>setFilterDebut(e.target.value)} className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white w-full sm:w-auto"/>
        <input type="date" value={filterFin} onChange={(e)=>setFilterFin(e.target.value)} className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white w-full sm:w-auto"/>
        <button onClick={fetchRapports} className="bg-[#2a2f85] px-6 py-2 rounded-xl hover:bg-[#1f2366] w-full sm:w-auto">Générer</button>
      </div>

      {showTable && (
        <div className="w-full overflow-x-auto mt-6 px-2">
          <div className="space-y-2 min-w-[600px] sm:min-w-0">
                    <div className="hidden sm:flex text-sm font-semibold uppercase text-white px-4 py-3 border-b border-white/30 bg-white/5 rounded-t-xl">
              <div className="flex-1">Date</div>
              <div className="flex-1 text-center">Baptisé par</div>
              <div className="w-24 text-center">Hommes</div>
              <div className="w-24 text-center">Femmes</div>
              <div className="w-24 text-center">Total</div>
              <div className="w-32 text-center">Actions</div>
            </div>

            {groupedReports.map(([monthKey,monthRapports])=>{
              const totalMonth=monthRapports.reduce((acc,r)=>{
                acc.hommes+=Number(r.hommes||0);
                acc.femmes+=Number(r.femmes||0);
                return acc;
              },{hommes:0,femmes:0});

              return(
                <div key={monthKey} className="space-y-1">
                  <div className="px-4 py-2 rounded-lg bg-white/20 border-l-4 border-blue-500 text-white font-semibold">
                    Total du mois : {totalMonth.hommes+totalMonth.femmes}
                  </div>

                  {monthRapports.map(r=>{
                    const total=Number(r.hommes)+Number(r.femmes);
                    return(
                      <div key={r.id} className="flex flex-col sm:flex-row sm:items-center gap-2 px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition border-l-4 border-blue-500 text-white">
                        <div className="flex-1">{formatDateFR(r.date)}</div>
                        <div className="flex-1 sm:text-center">{r.baptise_par}</div>
                        <div className="w-full sm:w-24 sm:text-center">Hommes : {r.hommes}</div>
                        <div className="w-full sm:w-24 sm:text-center">Femmes : {r.femmes}</div>
                        <div className="w-full sm:w-24 sm:text-center font-bold">Total : {total}</div>
                        <div className="w-full sm:w-32 sm:text-center">
                          <button onClick={()=>handleEdit(r)} className="text-orange-400 underline hover:text-orange-500">Modifier</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}

            <div className="flex flex-col sm:flex-row sm:items-center px-4 py-3 mt-2 border-t border-white/50 bg-white/10 rounded-b-xl text-white font-bold">
              <div className="flex-1">TOTAL GLOBAL</div>
              <div className="w-full sm:w-24 sm:text-center text-orange-400">{totalGlobal.hommes}</div>
              <div className="w-full sm:w-24 sm:text-center text-orange-400">{totalGlobal.femmes}</div>
              <div className="w-full sm:w-24 sm:text-center text-orange-400">{totalGlobal.hommes+totalGlobal.femmes}</div>
            </div>
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
          width:100%;
        }
      `}</style>
    </div>
  );
}
      
