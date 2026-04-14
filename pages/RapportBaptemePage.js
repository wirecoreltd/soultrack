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
      hommes: hommes,
      femmes: femmes
    }));
  }, [selectedCandidats, candidats]);

  /* CALCUL PAR DATE + FUTUR BAPTISE */
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

  /* COLOR BORDERS */
  const monthColors = [
    "border-orange-500",
    "border-blue-500",
    "border-emerald-500",
    "border-purple-500",
    "border-pink-500",
    "border-yellow-500",
    "border-cyan-500",
    "border-red-500"
  ];

  const getMonthColor = (key) => {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = key.charCodeAt(i) + ((hash << 5) - hash);
    }
    return monthColors[Math.abs(hash) % monthColors.length];
  };

  /* CRUD */
  const handleSubmit=async(e)=>{
    e.preventDefault();
    if (!formData.baptise_par.trim()) {
      alert("Le champ 'Baptisé par' est obligatoire.");
      return;
    }
    if (editRapport) return handleUpdate();
    if (selectedCandidats.length === 0) {
      return alert("Veuillez sélectionner au moins un candidat.");
    }
    for(const id of selectedCandidats){
      const membre = candidats.find(c => c.id === id);
      if(!membre) continue;
      await supabase.from("baptemes").insert([{
        ...formData,
        hommes: formData.hommes,
        femmes: formData.femmes,
        baptise_par: formData.baptise_par,
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
    setTimeout(() => setRapportSuccess(false), 3000);
  };

  const handleEdit=(r)=>{
    setEditRapport(r);
    setFormData({...formData,date:r.date,hommes:r.hommes,femmes:r.femmes,baptise_par:r.baptise_par});
    formRef.current?.scrollIntoView({behavior:"smooth",block:"start"});
  };

  const handleUpdate=async()=>{
    if (!formData.baptise_par.trim()) {
      alert("Le champ 'Baptisé par' est obligatoire.");
      return;
    }
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

  const toggleMonth=(monthKey)=>setExpandedMonths(prev=>({...prev,[monthKey]:!prev[monthKey]}));

  const aggregated = aggregateRapports(rapports)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  /* GROUPEMENT PAR MOIS */
  const groupByMonth = (items) => {
    const groups = {};
    items.forEach(r => {
      const d = new Date(r.date);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
      const label = `${getMonthNameFR(d.getMonth())} ${d.getFullYear()}`;
      if (!groups[key]) groups[key] = { label, key, items: [] };
      groups[key].items.push(r);
    });
    return Object.values(groups).sort((a, b) => b.key.localeCompare(a.key));
  };

  const groupedMonths = groupByMonth(aggregated);

  const totalGlobal=rapports.reduce((acc,r)=>{
    acc.hommes+=Number(r.hommes||0);
    acc.femmes+=Number(r.femmes||0);
    return acc;
  },{hommes:0,femmes:0});

  return (
    //<div className="min-h-screen flex flex-col items-center px-4 sm:px-6 py-6 bg-[#333699]">
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />

      <h1 className="text-2xl font-bold mt-4 mb-6 text-blue-300 text-center text-white">
        Rapport <span className="text-emerald-300">Baptêmes</span>
      </h1>

      <div className="max-w-3xl w-full mb-6 text-center">
        <p className="italic text-base text-white/90">
          <span className="text-blue-300 font-semibold">Créez et suivez</span> les rapports de baptêmes ainsi que le suivi des <span className="text-blue-300 font-semibold">nouveaux baptisés</span>.
          Enregistrez les données, <span className="text-blue-300 font-semibold">analysez</span> les volumes et la répartition hommes/femmes pour mesurer <span className="text-blue-300 font-semibold">l'impact et structurer la croissance de l'église</span>
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

      {/* MENU DEROU / Sélectionner les baptisés */}
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

      {/* FORMULAIRE */}
      <div ref={formRef} className="bg-white/10 rounded-3xl p-6 shadow-lg w-full max-w-lg mx-auto mt-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col">
            <label className="text-white mb-1">Date</label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={e => setFormData({...formData, date: e.target.value})}
              className="input"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 flex flex-col">
              <label className="text-white mb-1">Hommes</label>
              <input type="number" value={formData.hommes} disabled className="input opacity-60"/>
            </div>
            <div className="flex-1 flex flex-col">
              <label className="text-white mb-1">Femmes</label>
              <input type="number" value={formData.femmes} disabled className="input opacity-60"/>
            </div>
          </div>
          <div className="flex flex-col">
            <label className="text-white mb-1">Baptisé par</label>
            <input
              type="text"
              required
              value={formData.baptise_par}
              onChange={e => setFormData({...formData, baptise_par: e.target.value})}
              className="input"
            />
          </div>
          <button type="submit" className="w-full bg-gradient-to-r from-blue-400 to-indigo-500 text-white font-bold py-3 rounded-2xl hover:scale-[1.02] transition">
            {editRapport ? "Modifier" : "Ajouter"}
          </button>
          {rapportSuccess && (
            <p className="text-green-600 font-semibold text-center mt-4 animate-pulse">
              ✅ Rapport ajouté !
            </p>
          )}
        </form>
      </div>

      {/* FILTRES */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 shadow-lg rounded-xl p-4 md:p-6 mt-2 w-full max-w-lg mx-auto flex flex-col text-white">
        <p className="text-base text-red-400 font-semibold text-center mb-4">
          Choisissez les paramètres pour générer le rapport
        </p>
        <div className="flex flex-col w-full">
  <label className="text-center text-base mb-1">Date de Début</label>
  <input
    type="date"
    value={filterDebut}
    onChange={e => setFilterDebut(e.target.value)}
    className="w-full border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white"
  />
</div>

<div className="flex flex-col w-full mt-2">
  <label className="text-center text-base mb-1">Date de Fin</label>
  <input
    type="date"
    value={filterFin}
    onChange={e => setFilterFin(e.target.value)}
    className="w-full border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white"
  />
</div>
        <div className="flex flex-col w-full md:w-auto">
          <label className="text-base text-center mb-1 opacity-0">btn</label>
          <button
            onClick={fetchRapports}
            className="w-full md:w-auto h-10 bg-amber-300 text-white font-semibold px-6 rounded-lg hover:bg-amber-400 transition"
          >
            Générer
          </button>
        </div>
      </div>

      {/* TABLEAU */}
      {showTable && (
        <>
          {/* TABLEAU DESKTOP */}
<div className="hidden md:flex w-full overflow-x-auto mt-4 justify-center">
  <div className="w-max">

    {/* HEADER */}
    <div className="flex text-sm font-semibold uppercase text-white px-3 py-2 border-b border-white/20 bg-white/5 rounded-t-lg whitespace-nowrap">
      <div className="w-[180px]">Date</div>
      <div className="w-[180px] text-center">Baptisé par</div>
      <div className="w-[100px] text-center">Hommes</div>
      <div className="w-[100px] text-center">Femmes</div>
      <div className="w-[100px] text-center">Total</div>
      <div className="w-[140px] text-center">Actions</div>
    </div>

    {/* GROUPES PAR MOIS */}
    {groupedMonths.map(group => {
      const isOpen = !!expandedMonths[group.key];
      const borderColor = getMonthColor(group.key);

      const monthTotal = group.items.reduce(
        (acc, r) => ({
          hommes: acc.hommes + Number(r.hommes || 0),
          femmes: acc.femmes + Number(r.femmes || 0)
        }),
        { hommes: 0, femmes: 0 }
      );

      return (
        <div key={group.key} className="mt-1">

          {/* LIGNE MOIS */}
          <button
            onClick={() => toggleMonth(group.key)}
            className={`flex items-center px-3 py-2 rounded-md bg-white/10 hover:bg-white/20 transition border-l-4 ${borderColor}`}
          >
            <div className="w-[180px] text-white font-semibold flex items-center gap-2">
              <span>{isOpen ? "➖" : "➕"}</span>
              <span>{group.label}</span>
            </div>

            <div className="w-[180px]" />

            <div className="w-[100px] text-center text-orange-300 font-semibold">
              {monthTotal.hommes}
            </div>

            <div className="w-[100px] text-center text-orange-300 font-semibold">
              {monthTotal.femmes}
            </div>

            <div className="w-[100px] text-center text-orange-300 font-semibold">
              {monthTotal.hommes + monthTotal.femmes}
            </div>

            <div className="w-[140px]" />
          </button>

          {/* DETAILS */}
          {isOpen && group.items.map((r) => {
            const total = Number(r.hommes) + Number(r.femmes);

            return (
              <div key={r.id + r.baptise_par} className="pl-2 mt-1">
                <div className={`flex items-center px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 transition pl-2 border-l-4 ml-4 ${borderColor}`}>

                  <div className="w-[180px] text-white">
                    {formatDateFR(r.date)}
                  </div>

                  <div className="w-[180px] text-center text-white -ml-5">
                    {r.baptise_par}
                  </div>

                  <div className="w-[100px] text-center text-white">
                    {r.hommes}
                  </div>

                  <div className="w-[100px] text-center text-white">
                    {r.femmes}
                  </div>

                  <div className="w-[100px] text-center text-white font-semibold">
                    {total}
                  </div>

                  <div className="w-[140px] text-center">
                    <button
                      onClick={() => handleEdit(r)}
                      className="text-orange-400 underline text-sm hover:text-orange-500"
                    >
                      Modifier
                    </button>
                  </div>

                </div>
              </div>
            );
          })}

        </div>
      );
    })}

    {/* TOTAL GLOBAL */}
    <div className="flex items-center px-3 py-2 mt-2 rounded-md bg-white/10 border-l-4 border-orange-400">
      <div className="w-[180px] text-orange-400 font-semibold">
        TOTAL
      </div>

      <div className="w-[180px]" />

      <div className="w-[100px] text-center text-orange-400 font-semibold">
        {totalGlobal.hommes}
      </div>

      <div className="w-[100px] text-center text-orange-400 font-semibold">
        {totalGlobal.femmes}
      </div>

      <div className="w-[100px] text-center text-orange-400 font-semibold">
        {totalGlobal.hommes + totalGlobal.femmes}
      </div>

      <div className="w-[140px]" />
    </div>

  </div>
</div>

          {/* TABLEAU MOBILE */}
          <div className="md:hidden w-full mt-4 flex flex-col gap-3">

            {/* GROUPES PAR MOIS */}
            {groupedMonths.map(group => {
              const isOpen = !!expandedMonths[group.key];
              const borderColor = getMonthColor(group.key);
              const monthTotal = group.items.reduce(
                (acc, r) => ({
                  hommes: acc.hommes + Number(r.hommes || 0),
                  femmes: acc.femmes + Number(r.femmes || 0)
                }),
                { hommes: 0, femmes: 0 }
              );
              return (
                <div key={group.key}>

                             <div className="md:hidden w-full mt-4 flex flex-col overflow-hidden">
                        {/* HEADER UNIQUE */}
                        <div className="flex items-center w-full px-4 py-2 text-xs text-white/70 uppercase bg-white/5 rounded-lg mb-3">
                          <div className="flex-1">Mois</div>
                          <div className="w-14 text-center">H</div>
                          <div className="w-14 text-center">F</div>
                          <div className="w-14 text-center">Total</div>
                        </div>

                  {/* LIGNE MOIS */}
                 <button
                  onClick={() => toggleMonth(group.key)}
                  className={`flex items-center w-full px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition border-l-4 cursor-pointer mb-1 ${borderColor}`}
                >
                  <div className="flex-1 min-w-0 text-white font-semibold flex items-center gap-2">
                    <span>{isOpen ? "➖" : "➕"}</span>
                    <span className="truncate">{group.label}</span>
                  </div>
                
                  <div className="w-14 text-center text-orange-300 font-semibold">
                    {monthTotal.hommes}
                  </div>
                
                  <div className="w-14 text-center text-orange-300 font-semibold">
                    {monthTotal.femmes}
                  </div>
                
                  <div className="w-14 text-center text-orange-300 font-semibold">
                    {monthTotal.hommes + monthTotal.femmes}
                  </div>
                </button>

                  {/* DETAILS — même couleur que le mois */}
                  {isOpen && (
  group.items.map((r) => {
    const total = Number(r.hommes) + Number(r.femmes);

    return (
      <div
        key={r.id + r.baptise_par}
        className="bg-white/10 text-white rounded-lg px-3 py-2 flex flex-col gap-1 shadow mb-1"
      >
        <div className="text-amber-300 text-right">
          {formatDateFR(r.date)}
        </div>

        <div>
          Baptisé par : <span className="font-semibold">{r.baptise_par}</span>
        </div>

        <div>
          Hommes : {r.hommes} | Femmes : {r.femmes}
        </div>

        <div className="font-semibold text-orange-400">
          Total : {total}
        </div>

        <button
          onClick={() => handleEdit(r)}
          className="mx-auto text-amber-300 mt-1 hover:scale-110 transition"
        >
          ✏️ Modifier
        </button>
      </div>
    );
  })
)}

            {/* TOTAL GLOBAL MOBILE — une seule fois à la fin */}
            <div className="flex items-center px-3 py-2 rounded-lg bg-white/10 border-l-4 mb-1 border-orange-400">
              <span className="text-orange-400 font-semibold mr-4">TOTAL</span>
              <span className="text-orange-400 font-semibold">
  (H: {totalGlobal.hommes} + F: {totalGlobal.femmes}) = {totalGlobal.hommes + totalGlobal.femmes}
</span>
            </div>

          </div>{/* fin md:hidden */}
        </>
      )}

      <Footer />

      <style jsx>{`
        .input {
          border: 1px solid #ccc;
          padding: 10px;
          border-radius: 12px;
          background: rgba(255,255,255,0.05);
          color: white;
        }
      `}</style>
    </div>
  );
}
