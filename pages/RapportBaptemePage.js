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

    await supabase.from("baptemes").insert([{
      ...formData,
      hommes:formData.hommes,
      femmes:formData.femmes
    }]);

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

  /* UTIL */
  const getMonthNameFR=(monthIndex)=>{
    const months=["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
    return months[monthIndex]||"";
  };

  const formatDateFR=(dateString)=>{
    if(!dateString) return "";
    const d=new Date(dateString);
    return `<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mrow><mi>S</mi><mi>t</mi><mi>r</mi><mi>i</mi><mi>n</mi><mi>g</mi><mo stretchy="false">(</mo><mi>d</mi><mi mathvariant="normal">.</mi><mi>g</mi><mi>e</mi><mi>t</mi><mi>D</mi><mi>a</mi><mi>t</mi><mi>e</mi><mo stretchy="false">(</mo><mo stretchy="false">)</mo><mo stretchy="false">)</mo><mi mathvariant="normal">.</mi><mi>p</mi><mi>a</mi><mi>d</mi><mi>S</mi><mi>t</mi><mi>a</mi><mi>r</mi><mi>t</mi><mo stretchy="false">(</mo><mn>2</mn><mo separator="true">,</mo><mi mathvariant="normal">&quot;</mi><mn>0</mn><mi mathvariant="normal">&quot;</mi><mo stretchy="false">)</mo></mrow><mi mathvariant="normal">/</mi></mrow><annotation encoding="application/x-tex">{String(d.getDate()).padStart(2,&quot;0&quot;)}/</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord mathnormal">St</span><span class="mord mathnormal" style="margin-right:0.02778em;">r</span><span class="mord mathnormal">in</span><span class="mord mathnormal" style="margin-right:0.03588em;">g</span><span class="mopen">(</span><span class="mord mathnormal">d</span><span class="mord">.</span><span class="mord mathnormal" style="margin-right:0.03588em;">g</span><span class="mord mathnormal">e</span><span class="mord mathnormal">t</span><span class="mord mathnormal" style="margin-right:0.02778em;">D</span><span class="mord mathnormal">a</span><span class="mord mathnormal">t</span><span class="mord mathnormal">e</span><span class="mopen">(</span><span class="mclose">))</span><span class="mord">.</span><span class="mord mathnormal">p</span><span class="mord mathnormal">a</span><span class="mord mathnormal">d</span><span class="mord mathnormal">St</span><span class="mord mathnormal">a</span><span class="mord mathnormal" style="margin-right:0.02778em;">r</span><span class="mord mathnormal">t</span><span class="mopen">(</span><span class="mord">2</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord">&quot;0&quot;</span><span class="mclose">)</span></span><span class="mord">/</span></span></span></span>{String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
  };

  const groupByMonth=(rapports)=>{
    const map={};
    rapports.forEach(r=>{
      const d=new Date(r.date);
      const key=`<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mrow><mi>d</mi><mi mathvariant="normal">.</mi><mi>g</mi><mi>e</mi><mi>t</mi><mi>F</mi><mi>u</mi><mi>l</mi><mi>l</mi><mi>Y</mi><mi>e</mi><mi>a</mi><mi>r</mi><mo stretchy="false">(</mo><mo stretchy="false">)</mo></mrow><mo>−</mo></mrow><annotation encoding="application/x-tex">{d.getFullYear()}-</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="mord">.</span><span class="mord mathnormal" style="margin-right:0.03588em;">g</span><span class="mord mathnormal">e</span><span class="mord mathnormal" style="margin-right:0.13889em;">tF</span><span class="mord mathnormal">u</span><span class="mord mathnormal" style="margin-right:0.01968em;">ll</span><span class="mord mathnormal" style="margin-right:0.22222em;">Y</span><span class="mord mathnormal">e</span><span class="mord mathnormal">a</span><span class="mord mathnormal" style="margin-right:0.02778em;">r</span><span class="mopen">(</span><span class="mclose">)</span></span><span class="mord">−</span></span></span></span>{d.getMonth()}`;
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

  return (
    <div className="min-h-screen flex flex-col items-center px-3 py-4 sm:px-4 sm:py-5 md:p-6 bg-[#333699]">
      <HeaderPages />

      <h1 className="text-xl sm:text-2xl font-bold mt-4 mb-4 sm:mb-6 text-center">
        <span className="text-white">Rapport </span>
        <span className="text-amber-300">Baptêmes</span>
      </h1>      

      {/* FORMULAIRE + CANDIDATS */}
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
        {/* Formulaire */}
        <div ref={formRef} className="bg-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-lg">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="flex flex-col">
              <label className="text-white mb-1 text-sm sm:text-base">Date</label>
              <input type="date" required value={formData.date} onChange={(e)=>setFormData({...formData,date:e.target.value})} className="input"/>
            </div>
            <div className="flex flex-col">
              <label className="text-white mb-1 text-sm sm:text-base">Baptisé par</label>
              <input type="text" value={formData.baptise_par} onChange={(e)=>setFormData({...formData,baptise_par:e.target.value})} className="input"/>
            </div>
            <div className="flex flex-col">
              <label className="text-white mb-1 text-sm sm:text-base">Hommes</label>
              <input type="number" value={formData.hommes} disabled className="input opacity-60"/>
            </div>
            <div className="flex flex-col">
              <label className="text-white mb-1 text-sm sm:text-base">Femmes</label>
              <input type="number" value={formData.femmes} disabled className="input opacity-60"/>
            </div>
            <div className="col-span-1 sm:col-span-2 mt-3 sm:mt-4">
              <button type="submit" className="w-full bg-gradient-to-r from-blue-400 to-indigo-500 text-white font-bold py-3 rounded-2xl text-sm sm:text-base">
                {editRapport?"Modifier":"Ajouter le baptême"}
              </button>
               {rapportSuccess && (
                <p className="text-green-600 font-semibold text-center mt-4 animate-pulse text-sm sm:text-base">
                  ✅ Rapport ajouté !
                </p>
              )}             
            </div>
          </form>
        </div>

        {/* SECTION CANDIDATS */}
        <div className="w-full flex flex-col gap-3 sm:gap-4">

          {/* BOITE EXPLICATION */}
          <div className="bg-blue-900/40 border border-blue-300/30 text-white text-xs sm:text-sm p-3 sm:p-4 rounded-xl sm:rounded-2xl">
            ℹ️ Cette liste contient les personnes qui <strong>n&apos;ont pas encore été baptisées</strong> et qui
            <strong> souhaitent prendre leur baptême</strong>.<br/><br/>
            Ces informations sont mises à jour dans la <strong>Liste des membres</strong>.
            <div className="mt-2">
              <button
                onClick={() => router.push("/list-members")}
                className="underline text-amber-300 hover:text-amber-200 text-xs sm:text-sm"
              >
                Voir la liste des membres
              </button>
            </div>
          </div>

          {/* Menu déroulant / Sélectionner les baptisés */}
          <div className="bg-white/10 p-3 sm:p-4 rounded-2xl sm:rounded-3xl shadow-lg text-white">
            <div className="flex justify-between items-center mb-2">
              <label className="font-semibold text-sm sm:text-base">Sélectionner les baptisés</label>
              <button
                onClick={() => {
                  if (selectedCandidats.length === 0) {
                    setSelectedCandidats(candidats.map(c => c.id));
                  } else {
                    setSelectedCandidats([]);
                  }
                }}
                className="text-xs sm:text-sm underline hover:text-orange-400"
              >
                {selectedCandidats.length === 0 ? "Tout sélectionner" : "Tout désélectionner"}
              </button>
            </div>

            {/* Liste */}
            <div className="flex flex-col overflow-y-auto max-h-[250px] sm:max-h-[300px] space-y-1">
              {candidats.map(c => (
                <div
                  key={c.id}
                  className="flex justify-between items-center w-full px-2 py-2 sm:py-1 rounded hover:bg-white/20"
                >
                  <span className="text-sm sm:text-base">{c.prenom} {c.nom}</span>
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
                    className="accent-[#25297e] w-5 h-5 sm:w-4 sm:h-4"
                  />
                </div>
              ))}
            </div>

            <button
              onClick={() => router.push("/AddContactbaptise")}
              className="text-white font-semibold px-4 py-2 rounded shadow text-xs sm:text-sm mt-2 w-full"
            >
              ➕ Ajouter un Baptisé
            </button>

            <hr className="border-t border-white/30 my-3" />

            {selectedCandidats.length > 0 && (
              <div>
                <h3 className="text-amber-300 font-semibold text-xs sm:text-sm mb-1">
                  Personnes sélectionnées :
                </h3>
                <ul className="list-disc list-inside text-white text-xs sm:text-sm space-y-1">
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

      {/* FILTRES */}
      <div className="bg-white/10 p-4 sm:p-6 rounded-2xl shadow-lg mt-2 w-full max-w-5xl">
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 text-white">
          <input type="date" value={filterDebut} onChange={(e)=>setFilterDebut(e.target.value)} className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white w-full sm:w-auto"/>
          <input type="date" value={filterFin} onChange={(e)=>setFilterFin(e.target.value)} className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white w-full sm:w-auto"/>
          <button onClick={fetchRapports} className="bg-[#2a2f85] px-6 py-2 rounded-xl hover:bg-[#1f2366] w-full sm:w-auto">Générer</button>
        </div>
      </div>

      {/* TABLEAU - Version Desktop (caché sur mobile) */}
      {showTable && (
        <>
          <div className="hidden lg:flex w-full max-w-full overflow-x-auto mt-6 justify-center">
            <div className="w-max space-y-2">
              <div className="flex text-sm font-semibold uppercase text-white px-4 py-3 border-b border-white/30 bg-white/5 rounded-t-xl whitespace-nowrap">
                <div className="min-w-[200px]">Date</div>
                <div className="min-w-[200px] text-center">Baptisé par</div>
                <div className="min-w-[120px] text-center">Hommes</div>
                <div className="min-w-[120px] text-center">Femmes</div>
                <div className="min-w-[120px] text-center">Total</div>
                <div className="min-w-[150px] text-center">Actions</div>
              </div>

              {groupedReports.map(([monthKey,monthRapports])=>{
                const [year,monthIndex]=monthKey.split("-").map(Number);
                const monthLabel=`<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>g</mi><mi>e</mi><mi>t</mi><mi>M</mi><mi>o</mi><mi>n</mi><mi>t</mi><mi>h</mi><mi>N</mi><mi>a</mi><mi>m</mi><mi>e</mi><mi>F</mi><mi>R</mi><mo stretchy="false">(</mo><mi>m</mi><mi>o</mi><mi>n</mi><mi>t</mi><mi>h</mi><mi>I</mi><mi>n</mi><mi>d</mi><mi>e</mi><mi>x</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">{getMonthNameFR(monthIndex)} </annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.03588em;">g</span><span class="mord mathnormal">e</span><span class="mord mathnormal" style="margin-right:0.10903em;">tM</span><span class="mord mathnormal">o</span><span class="mord mathnormal">n</span><span class="mord mathnormal">t</span><span class="mord mathnormal">h</span><span class="mord mathnormal" style="margin-right:0.10903em;">N</span><span class="mord mathnormal">am</span><span class="mord mathnormal">e</span><span class="mord mathnormal" style="margin-right:0.00773em;">FR</span><span class="mopen">(</span><span class="mord mathnormal">m</span><span class="mord mathnormal">o</span><span class="mord mathnormal">n</span><span class="mord mathnormal">t</span><span class="mord mathnormal">h</span><span class="mord mathnormal" style="margin-right:0.07847em;">I</span><span class="mord mathnormal">n</span><span class="mord mathnormal">d</span><span class="mord mathnormal">e</span><span class="mord mathnormal">x</span><span class="mclose">)</span></span></span></span></span>{year}`;
                const totalMonth=monthRapports.reduce((acc,r)=>{
                  acc.hommes+=Number(r.hommes||0);
                  acc.femmes+=Number(r.femmes||0);
                  return acc;
                },{hommes:0,femmes:0});
                const isExpanded=expandedMonths[monthKey]||false;

                return(
                  <div key={monthKey} className="space-y-1">
                    <div className="flex items-center px-4 py-2 rounded-lg bg-white/20 cursor-pointer border-l-4 border-blue-500" onClick={()=>toggleMonth(monthKey)}>
                      <div className="min-w-[200px] text-white font-semibold">{isExpanded?"➖ ":"➕ "}{monthLabel}</div>
                      <div className="min-w-[200px]"></div>
                      <div className="min-w-[120px] text-center text-white font-bold">{totalMonth.hommes}</div>
                      <div className="min-w-[120px] text-center text-white font-bold">{totalMonth.femmes}</div>
                      <div className="min-w-[120px] text-center text-orange-400 font-semibold">{totalMonth.hommes+totalMonth.femmes}</div>
                      <div className="min-w-[150px]"></div>
                    </div>

                    {(isExpanded||monthRapports.length===1)&&monthRapports.map(r=>{
                      const total=Number(r.hommes)+Number(r.femmes);
                      return(
                        <div key={r.id} className="flex items-center px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition border-l-4 border-blue-500">
                          <div className="min-w-[200px] text-white">{formatDateFR(r.date)}</div>
                          <div className="min-w-[200px] text-center text-white">{r.baptise_par}</div>
                          <div className="min-w-[120px] text-center text-white">{r.hommes}</div>
                          <div className="min-w-[120px] text-center text-white">{r.femmes}</div>
                          <div className="min-w-[120px] text-center text-white font-bold">{total}</div>
                          <div className="min-w-[150px] text-center">
                            <button onClick={()=>handleEdit(r)} className="text-orange-400 underline hover:text-orange-500 px-4 py-1 rounded-xl">Modifier</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}

              <div className="flex items-center px-4 py-3 mt-2 border-t border-white/50 bg-white/10 rounded-b-xl">
                <div className="min-w-[200px] text-white font-bold">TOTAL</div>
                <div className="min-w-[200px]"></div>
                <div className="min-w-[120px] text-center text-orange-400 font-semibold">{totalGlobal.hommes}</div>
                <div className="min-w-[120px] text-center text-orange-400 font-semibold">{totalGlobal.femmes}</div>
                <div className="min-w-[120px] text-center text-orange-400 font-semibold">{totalGlobal.hommes+totalGlobal.femmes}</div>
                <div className="min-w-[150px]"></div>
              </div>
            </div>
          </div>

          {/* TABLEAU - Version Mobile/Tablette (Cards) */}
          <div className="lg:hidden w-full max-w-5xl mt-6 space-y-3">
            {groupedReports.map(([monthKey,monthRapports])=>{
              const [year,monthIndex]=monthKey.split("-").map(Number);
              const monthLabel=`<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>g</mi><mi>e</mi><mi>t</mi><mi>M</mi><mi>o</mi><mi>n</mi><mi>t</mi><mi>h</mi><mi>N</mi><mi>a</mi><mi>m</mi><mi>e</mi><mi>F</mi><mi>R</mi><mo stretchy="false">(</mo><mi>m</mi><mi>o</mi><mi>n</mi><mi>t</mi><mi>h</mi><mi>I</mi><mi>n</mi><mi>d</mi><mi>e</mi><mi>x</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">{getMonthNameFR(monthIndex)} </annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.03588em;">g</span><span class="mord mathnormal">e</span><span class="mord mathnormal" style="margin-right:0.10903em;">tM</span><span class="mord mathnormal">o</span><span class="mord mathnormal">n</span><span class="mord mathnormal">t</span><span class="mord mathnormal">h</span><span class="mord mathnormal" style="margin-right:0.10903em;">N</span><span class="mord mathnormal">am</span><span class="mord mathnormal">e</span><span class="mord mathnormal" style="margin-right:0.00773em;">FR</span><span class="mopen">(</span><span class="mord mathnormal">m</span><span class="mord mathnormal">o</span><span class="mord mathnormal">n</span><span class="mord mathnormal">t</span><span class="mord mathnormal">h</span><span class="mord mathnormal" style="margin-right:0.07847em;">I</span><span class="mord mathnormal">n</span><span class="mord mathnormal">d</span><span class="mord mathnormal">e</span><span class="mord mathnormal">x</span><span class="mclose">)</span></span></span></span></span>{year}`;
              const totalMonth=monthRapports.reduce((acc,r)=>{
                acc.hommes+=Number(r.hommes||0);
                acc.femmes+=Number(r.femmes||0);
                return acc;
              },{hommes:0,femmes:0});
              const isExpanded=expandedMonths[monthKey]||false;

              return(
                <div key={monthKey} className="space-y-2">
                  {/* En-tête du mois */}
                  <div
                    className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/20 cursor-pointer border-l-4 border-blue-500"
                    onClick={()=>toggleMonth(monthKey)}
                  >
                    <div className="text-white font-semibold text-sm sm:text-base">
                      {isExpanded?"➖ ":"➕ "}{monthLabel}
                    </div>
                    <div className="flex gap-3 text-xs sm:text-sm">
                      <span className="text-white">H: <strong>{totalMonth.hommes}</strong></span>
                      <span className="text-white">F: <strong>{totalMonth.femmes}</strong></span>
                      <span className="text-orange-400 font-semibold">T: {totalMonth.hommes+totalMonth.femmes}</span>
                    </div>
                  </div>

                  {/* Cards individuelles */}
                  {(isExpanded||monthRapports.length===1)&&monthRapports.map(r=>{
                    const total=Number(r.hommes)+Number(r.femmes);
                    return(
                      <div key={r.id} className="bg-white/10 rounded-xl p-4 border-l-4 border-blue-500 space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-white font-semibold text-sm">{formatDateFR(r.date)}</p>
                            <p className="text-white/70 text-xs mt-1">Baptisé par : {r.baptise_par}</p>
                          </div>
                          <button onClick={()=>handleEdit(r)} className="text-orange-400 underline hover:text-orange-500 text-xs sm:text-sm">
                            Modifier
                          </button>
                        </div>
                        <div className="flex gap-4 text-xs sm:text-sm">
                          <span className="text-white">Hommes : <strong>{r.hommes}</strong></span>
                          <span className="text-white">Femmes : <strong>{r.femmes}</strong></span>
                          <span className="text-orange-400 font-bold">Total : {total}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}

            {/* Total global mobile */}
            <div className="bg-white/10 rounded-xl p-4 border-t-2 border-white/50">
              <div className="flex justify-between items-center">
                <span className="text-white font-bold text-sm sm:text-base">TOTAL GÉNÉRAL</span>
                <div className="flex gap-3 text-xs sm:text-sm">
                  <span className="text-orange-400 font-semibold">H: {totalGlobal.hommes}</span>
                  <span className="text-orange-400 font-semibold">F: {totalGlobal.femmes}</span>
                  <span className="text-orange-400 font-bold">T: {totalGlobal.hommes+totalGlobal.femmes}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <Footer />
      <style jsx>{`
        .input{
          border:1px solid #ccc;
          padding:10px;
          border-radius:12px;
          background:rgba(255,255,255,0.05);
          color:white;
          font-size:14px;
          min-height:44px;
          width:100%;
        }
        @media (min-width:640px){
          .input{
            font-size:16px;
          }
        }
      `}</style>
    </div>
  );
}
