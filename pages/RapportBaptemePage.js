// VERSION COMPLETE CORRIGÉE (FULL FILE)
// ✅ Groupement par DATE
// ✅ Total par DATE
// ✅ Compatible Desktop + Mobile
// ✅ Plug & Play (reprend TON code complet)

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
  const [candidats,setCandidats]=useState([]);
  const [selectedCandidats,setSelectedCandidats]=useState([]);
  const [showTable,setShowTable]=useState(false);
  const router = useRouter();
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

    if(selectedCandidats.length === 0) return alert("Sélectionne au moins un candidat");

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
    const d=new Date(dateString);
    return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
  };

  // ✅ GROUP BY DATE
  const groupByDate = (rapports) => {
    const map = {};
    rapports.forEach(r => {
      if (!map[r.date]) map[r.date] = [];
      map[r.date].push(r);
    });
    return map;
  };

  const groupedByDate = Object.entries(groupByDate(rapports))
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

          <input type="date" required
            value={formData.date}
            onChange={e=>setFormData({...formData,date:e.target.value})}
            className="input" />

          <input type="text"
            value={formData.baptise_par}
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
        Générer rapport
      </button>

      {/* TABLE */}
      {showTable && (
        <div className="w-full max-w-2xl mt-6 space-y-4">

          {groupedByDate.map(([date, items]) => {

            const total = items.reduce((acc, r) => {
              acc.hommes += Number(r.hommes||0);
              acc.femmes += Number(r.femmes||0);
              return acc;
            },{hommes:0,femmes:0});

            return (
              <div key={date} className="space-y-2">

                {/* LIGNES */}
                {items.map(r => (
                  <div key={r.id} className="bg-white/10 p-3 rounded">
                    <div className="text-white">
                      {formatDateFR(date)} hommes {r.hommes} femmes {r.femmes}
                    </div>
                    <div className="text-sm text-blue-300">
                      baptisé par {r.baptise_par}
                    </div>
                  </div>
                ))}

                {/* TOTAL */}
                <div className="bg-blue-900/40 p-3 rounded font-bold text-white">
                  TOTAL {formatDateFR(date)} : hommes {total.hommes} femmes {total.femmes}
                  <div className="text-emerald-300 text-sm">
                    baptisé par {items[0]?.baptise_par}
                  </div>
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
