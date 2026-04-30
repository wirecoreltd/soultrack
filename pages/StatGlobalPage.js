"use client";

import { useState } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import ProtectedRoute from "../components/ProtectedRoute";
import Footer from "../components/Footer";

export default function StatGlobalPageWrapper() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "Responsable"]}>
      <StatGlobalPage />
    </ProtectedRoute>
  );
}

function StatGlobalPage() {
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [eglisesTree, setEglisesTree] = useState([]);
  const [loading, setLoading] = useState(false);
  const [parentFilter, setParentFilter] = useState("");
  const [allEglises, setAllEglises] = useState([]);
  const [rootId, setRootId] = useState(null);
  const [expandedEglises, setExpandedEglises] = useState([]);
  const [ministereMap, setMinistereMap] = useState({});

  const toggleExpand = (egliseId) => {
    setExpandedEglises((prev) =>
      prev.includes(egliseId)
        ? prev.filter((id) => id !== egliseId)
        : [...prev, egliseId]
    );
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profileData } = await supabase
        .from("profiles")
        .select("eglise_id")
        .eq("id", user.id)
        .single();

      const rootIdValue = profileData.eglise_id;
      setRootId(rootIdValue);

      // Fetch all descendant eglises using the RPC (rename your function accordingly,
      // or keep the same name if it already works on eglises)
      const { data: filteredEglisesData } = await supabase.rpc("get_descendant_eglises", { root_id: rootIdValue });

      if (!filteredEglisesData?.length) {
        setEglisesTree([]);
        setAllEglises([]);
        setMinistereMap({});
        setLoading(false);
        return;
      }

      const egliseIds = filteredEglisesData.map((e) => e.id);

      // ================= MINISTÈRE =================
      let ministereQuery = supabase
        .from("membres_complets")
        .select("id, eglise_id")
        .in("eglise_id", egliseIds)
        .eq("star", true);

      if (dateDebut) ministereQuery = ministereQuery.gte("created_at", dateDebut);
      if (dateFin) ministereQuery = ministereQuery.lte("created_at", dateFin);

      const { data: ministereData } = await ministereQuery;

      const minMap = {};
      egliseIds.forEach((id) => { minMap[id] = []; });
      ministereData?.forEach((m) => { minMap[m.eglise_id].push(m.id); });
      setMinistereMap(minMap);

      // ================= STATS MAP =================
      const statsMap = {};
      egliseIds.forEach((id) => {
        statsMap[id] = {
          culte: { hommes: 0, femmes: 0, jeunes: 0, enfants: 0, connectes: 0, nouveaux_venus: 0, nouveau_converti: 0, moissonneurs: 0 },
          formation: { hommes: 0, femmes: 0 },
          bapteme: { hommes: 0, femmes: 0 },
          evangelisation: { hommes: 0, femmes: 0, priere: 0, nouveau_converti: 0, reconciliation: 0, moissonneurs: 0 },
          serviteurs: { hommes: 0, femmes: 0 },
          cellules: { total: 0 },
        };
      });

      const tableFetch = async (table, dateField) => {
        let query = supabase.from(table).select("*").in("eglise_id", egliseIds);
        if (dateDebut) query = query.gte(dateField, dateDebut);
        if (dateFin) query = query.lte(dateField, dateFin);
        const { data } = await query;
        return data || [];
      };

      const [attendanceData, formationData, baptemeData, evangeData, cellulesData] = await Promise.all([
        tableFetch("attendance_stats", "mois"),
        tableFetch("formations", "date_debut"),
        tableFetch("baptemes", "date"),
        tableFetch("rapport_evangelisation", "date"),
        tableFetch("cellules", "created_at"),
      ]);

      // ================= CULTE =================
      attendanceData.forEach((s) => {
        const a = statsMap[s.eglise_id]?.culte;
        if (!a) return;
        a.hommes += Number(s.hommes) || 0;
        a.femmes += Number(s.femmes) || 0;
        a.jeunes += Number(s.jeunes) || 0;
        a.enfants += Number(s.enfants) || 0;
        a.connectes += Number(s.connectes) || 0;
        a.nouveaux_venus += Number(s.nouveaux_venus) || 0;
        a.nouveau_converti += Number(s.nouveau_converti) || 0;
        a.moissonneurs += Number(s.moissonneurs) || 0;
      });

      // ================= FORMATION =================
      formationData.forEach((f) => {
        const form = statsMap[f.eglise_id]?.formation;
        if (!form) return;
        form.hommes += Number(f.hommes) || 0;
        form.femmes += Number(f.femmes) || 0;
      });

      // ================= BAPTÊME =================
      baptemeData.forEach((b) => {
        const bap = statsMap[b.eglise_id]?.bapteme;
        if (!bap) return;
        bap.hommes += Number(b.hommes) || 0;
        bap.femmes += Number(b.femmes) || 0;
      });

      // ================= ÉVANGÉLISATION =================
      evangeData.forEach((e) => {
        const ev = statsMap[e.eglise_id]?.evangelisation;
        if (!ev) return;
        ev.hommes += Number(e.hommes) || 0;
        ev.femmes += Number(e.femmes) || 0;
        ev.priere += Number(e.priere) || 0;
        ev.nouveau_converti += Number(e.nouveau_converti) || 0;
        ev.reconciliation += Number(e.reconciliation) || 0;
        ev.moissonneurs += Number(e.moissonneurs) || 0;
      });

      // ================= SERVITEURS =================
      const { data: serviteurData } = await supabase
        .from("stats_ministere_besoin")
        .select("membre_id, eglise_id, sexe, type")
        .in("eglise_id", egliseIds);

      const unique = new Map();

      serviteurData?.forEach((row) => {
        if (row.type !== "ministere") return;
        const key = `${row.eglise_id}_${row.membre_id}`;
        if (!unique.has(key)) {
          unique.set(key, row);
        }
      });

      unique.forEach((row) => {
        if (!row.sexe) return;
        const serv = statsMap[row.eglise_id]?.serviteurs;
        if (!serv) return;
        const sexe = row.sexe.trim().toLowerCase();
        if (sexe === "homme") serv.hommes += 1;
        else if (sexe === "femme") serv.femmes += 1;
      });

      // ================= CELLULES =================
      cellulesData.forEach((c) => {
        const id = c.eglise_id;
        if (id && statsMap[id]) {
          statsMap[id].cellules.total++;
        } else {
          console.warn("Cellule non comptée:", c);
        }
      });

      // ================= ARBRE =================
      const map = {};
      filteredEglisesData.forEach((e) => {
        map[e.id] = { ...e, stats: statsMap[e.id], enfants: [] };
      });
      const tree = [];
      Object.values(map).forEach((e) => {
        if (e.parent_eglise_id && map[e.parent_eglise_id]) map[e.parent_eglise_id].enfants.push(e);
        else tree.push(e);
      });

      setEglisesTree(tree);
      setAllEglises(Object.values(map));
    } catch (err) {
      console.error("Erreur fetch stats:", err);
      setEglisesTree([]);
      setAllEglises([]);
      setMinistereMap({});
    }
    setLoading(false);
  };

  // ================= RENDER EGLISE (DESKTOP) =================
  const renderEglise = (eglise, level = 0) => {
    const isExpanded = expandedEglises.includes(eglise.id);

    const totalStats =
      eglise.enfants.length > 0 && !isExpanded
        ? eglise.enfants.reduce(
            (acc, child) => {
              acc.culte.hommes += child.stats.culte.hommes;
              acc.culte.femmes += child.stats.culte.femmes;
              acc.culte.jeunes += child.stats.culte.jeunes;
              acc.culte.enfants += child.stats.culte.enfants;
              acc.culte.connectes += child.stats.culte.connectes;
              acc.culte.nouveaux_venus += child.stats.culte.nouveaux_venus;
              acc.culte.nouveau_converti += child.stats.culte.nouveau_converti;
              acc.culte.moissonneurs += child.stats.culte.moissonneurs;
              acc.formation.hommes += child.stats.formation.hommes;
              acc.formation.femmes += child.stats.formation.femmes;
              acc.bapteme.hommes += child.stats.bapteme.hommes;
              acc.bapteme.femmes += child.stats.bapteme.femmes;
              acc.evangelisation.hommes += child.stats.evangelisation.hommes;
              acc.evangelisation.femmes += child.stats.evangelisation.femmes;
              acc.evangelisation.priere += child.stats.evangelisation.priere;
              acc.evangelisation.nouveau_converti += child.stats.evangelisation.nouveau_converti;
              acc.evangelisation.moissonneurs += child.stats.evangelisation.moissonneurs;
              acc.serviteurs.hommes += child.stats.serviteurs.hommes;
              acc.serviteurs.femmes += child.stats.serviteurs.femmes;
              acc.cellules.total += child.stats.cellules.total;
              return acc;
            },
            {
              culte: { ...eglise.stats.culte },
              formation: { ...eglise.stats.formation },
              bapteme: { ...eglise.stats.bapteme },
              evangelisation: { ...eglise.stats.evangelisation },
              serviteurs: { ...eglise.stats.serviteurs },
              cellules: { ...eglise.stats.cellules },
            }
          )
        : eglise.stats;

    return (
      <div key={eglise.id} className="mt-8">
        <div className="flex items-center mb-3">
          {level >= 1 && eglise.enfants.length > 0 && (
            <button onClick={() => toggleExpand(eglise.id)} className="mr-2 text-xl">
              {isExpanded ? "➖" : "➕"}
            </button>
          )}
          <div className="flex items-center gap-2">
            <span className={`text-xl font-semibold ${eglise.enfants.length > 0 ? "text-amber-300" : "text-white"}`}>
              {eglise.nom}
            </span>
            {eglise.enfants.length > 0 && (
              <span className="text-sm text-white">
                (Supervision de {eglise.enfants.length} église{eglise.enfants.length > 1 ? "s" : ""})
              </span>
            )}
            {eglise.enfants.length > 0 && !isExpanded && (
              <span className="text-sm text-amber-300">• Total général</span>
            )}
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <div className="w-max space-y-2">
            {/* HEADER */}
            <div className="flex font-semibold uppercase text-white px-4 py-3 border-b border-white/30 bg-white/5 rounded-t-xl whitespace-nowrap">
              <div className="min-w-[180px]">Type</div>
              <div className="min-w-[100px] text-center">Nombres</div>
              <div className="min-w-[120px] text-center">Hommes</div>
              <div className="min-w-[120px] text-center">Femmes</div>
              <div className="min-w-[120px] text-center">Jeunes</div>
              <div className="min-w-[120px] text-center text-orange-400">Total</div>
              <div className="min-w-[120px] text-center">Enfants</div>
              <div className="min-w-[140px] text-center">Connectés</div>
              <div className="min-w-[150px] text-center">Nouveaux Venus</div>
              <div className="min-w-[180px] text-center">Nouveau Converti</div>
              <div className="min-w-[160px] text-center">Moissonneurs</div>
              <div className="min-w-[120px] text-center text-orange-400">Total Global</div>
            </div>

            {/* CULTE */}
            <div className="flex items-center px-4 py-3 rounded-xl bg-white/10 border-l-4 border-green-400 whitespace-nowrap">
              <div className="min-w-[180px] font-semibold">Culte</div>
              <div className="min-w-[100px] text-center">-</div>
              <div className="min-w-[120px] text-center font-semibold">{totalStats.culte.hommes}</div>
              <div className="min-w-[120px] text-center font-semibold">{totalStats.culte.femmes}</div>
              <div className="min-w-[120px] text-center font-semibold">{totalStats.culte.jeunes}</div>
              <div className="min-w-[120px] text-center font-semibold text-orange-400">{totalStats.culte.hommes + totalStats.culte.femmes + totalStats.culte.jeunes}</div>
              <div className="min-w-[120px] text-center font-semibold">{totalStats.culte.enfants}</div>
              <div className="min-w-[140px] text-center font-semibold">{totalStats.culte.connectes}</div>
              <div className="min-w-[150px] text-center font-semibold">{totalStats.culte.nouveaux_venus}</div>
              <div className="min-w-[180px] text-center font-semibold">{totalStats.culte.nouveau_converti}</div>
              <div className="min-w-[160px] text-center font-semibold">{totalStats.culte.moissonneurs}</div>
              <div className="min-w-[120px] text-center font-semibold text-orange-400">
                {totalStats.culte.hommes + totalStats.culte.femmes + totalStats.culte.jeunes + totalStats.culte.enfants + totalStats.culte.connectes}
              </div>
            </div>

            {/* FORMATION */}
            <div className="flex items-center px-4 py-3 rounded-xl bg-white/10 border-l-4 border-blue-400 whitespace-nowrap">
              <div className="min-w-[180px] font-semibold">Formation</div>
              <div className="min-w-[100px] text-center"></div>
              <div className="min-w-[120px] text-center font-semibold">{totalStats.formation.hommes}</div>
              <div className="min-w-[120px] text-center font-semibold">{totalStats.formation.femmes}</div>
              <div className="min-w-[120px] text-center"></div>
              <div className="min-w-[120px] text-center font-semibold text-orange-400">{totalStats.formation.hommes + totalStats.formation.femmes}</div>
            </div>

            {/* BAPTÊME */}
            <div className="flex items-center px-4 py-3 rounded-xl bg-white/10 border-l-4 border-purple-400 whitespace-nowrap">
              <div className="min-w-[180px] font-semibold">Baptême</div>
              <div className="min-w-[100px] text-center">-</div>
              <div className="min-w-[120px] text-center font-semibold">{totalStats.bapteme.hommes}</div>
              <div className="min-w-[120px] text-center font-semibold">{totalStats.bapteme.femmes}</div>
              <div className="min-w-[120px] text-center"></div>
              <div className="min-w-[120px] text-center font-semibold text-orange-400">{totalStats.bapteme.hommes + totalStats.bapteme.femmes}</div>
            </div>

            {/* ÉVANGÉLISATION */}
            <div className="flex items-center px-4 py-3 rounded-xl bg-white/10 border-l-4 border-pink-400 whitespace-nowrap">
              <div className="min-w-[180px] font-semibold">Évangélisation</div>
              <div className="min-w-[100px] text-center">-</div>
              <div className="min-w-[120px] text-center font-semibold">{totalStats.evangelisation.hommes}</div>
              <div className="min-w-[120px] text-center font-semibold">{totalStats.evangelisation.femmes}</div>
              <div className="min-w-[120px] text-center font-semibold">{totalStats.evangelisation.priere}</div>
              <div className="min-w-[120px] text-center font-semibold text-orange-400">{totalStats.evangelisation.hommes + totalStats.evangelisation.femmes}</div>
              <div className="min-w-[120px] text-center"></div>
              <div className="min-w-[140px] text-center"></div>
              <div className="min-w-[150px] text-center"></div>
              <div className="min-w-[180px] text-center font-semibold">{totalStats.evangelisation.nouveau_converti}</div>
              <div className="min-w-[160px] text-center font-semibold">{totalStats.evangelisation.moissonneurs}</div>
            </div>

            {/* SERVITEURS */}
            <div className="flex items-center px-4 py-3 rounded-xl bg-white/10 border-l-4 border-yellow-400 whitespace-nowrap">
              <div className="min-w-[180px] font-semibold">Serviteurs</div>
              <div className="min-w-[100px] text-center">-</div>
              <div className="min-w-[120px] text-center font-semibold">{totalStats.serviteurs.hommes}</div>
              <div className="min-w-[120px] text-center font-semibold">{totalStats.serviteurs.femmes}</div>
              <div className="min-w-[120px] text-center"></div>
              <div className="min-w-[120px] text-center font-semibold text-orange-400">{totalStats.serviteurs.hommes + totalStats.serviteurs.femmes}</div>
            </div>

            {/* CELLULES */}
            <div className="flex items-center px-4 py-3 rounded-xl bg-white/10 border-l-4 border-orange-400 whitespace-nowrap">
              <div className="min-w-[180px] font-semibold">Cellules</div>
              <div className="min-w-[100px] text-center font-semibold">{totalStats.cellules.total}</div>
              <div className="min-w-[120px] text-center"></div>
              <div className="min-w-[120px] text-center"></div>
              <div className="min-w-[120px] text-center"></div>
              <div className="min-w-[120px] text-center font-semibold text-orange-400">{totalStats.cellules.total}</div>
            </div>
          </div>
        </div>

        {/* RENDER CHILDREN */}
        {eglise.enfants.map((child) =>
          level === 0 || isExpanded ? renderEglise(child, level + 1) : null
        )}
      </div>
    );
  };

  // ================= RENDER EGLISE (MOBILE) =================
  const renderEgliseMobile = (eglise, level = 0) => {
    const isExpanded = expandedEglises.includes(eglise.id);
    const stats = eglise.stats;

    return (
      <div className="mt-3" key={eglise.id}>

        {/* CARD HEADER */}
        <div
          onClick={() => toggleExpand(eglise.id)}
          className="bg-white/10 border-l-4 border-amber-400 rounded-xl p-3 flex justify-between items-center cursor-pointer"
          style={{ marginLeft: level * 10 }}
        >
          <div className="flex items-center gap-2">
            <span className="text-amber-300 text-lg font-semibold">
              {isExpanded ? "➖" : "➕"}
            </span>
            <div>
              <p className="font-semibold text-white">{eglise.nom}</p>
              <p className="text-xs text-white/70">
                {eglise.enfants.length} église(s)
              </p>
            </div>
          </div>
          <div className="text-amber-300 text-sm font-semibold">
            {stats.culte.hommes + stats.culte.femmes + stats.culte.jeunes}
          </div>
        </div>

        {/* DETAILS */}
        {isExpanded && (
          <div
            className="mt-2 bg-white/5 border-l-4 border-amber-400 rounded-xl p-3 text-sm text-white space-y-2"
            style={{ marginLeft: level * 10 }}
          >
            {/* CULTE */}
            <div>
              <div className="flex justify-between font-semibold">
                <span>Culte</span>
                <span className="text-emerald-300">
                  {stats.culte.hommes + stats.culte.femmes + stats.culte.jeunes}
                </span>
              </div>
              <div className="text-white/80">
                H: {stats.culte.hommes} | F: {stats.culte.femmes} | J: {stats.culte.jeunes}
              </div>
              <div className="flex justify-between mt-1 border-t border-white/10 pt-1">
                <span className="text-white/60">Enfants</span>
                <span className="text-orange-300 font-semibold">{stats.culte.enfants}</span>
              </div>
            </div>

            <div className="border-t border-white/10"></div>

            {/* FORMATION */}
            <div>
              <div className="flex justify-between font-semibold">
                <span>Formation</span>
                <span className="text-blue-300">
                  {stats.formation.hommes + stats.formation.femmes}
                </span>
              </div>
              <div className="text-white/80">
                H: {stats.formation.hommes} | F: {stats.formation.femmes}
              </div>
            </div>

            <div className="border-t border-white/10"></div>

            {/* BAPTÊME */}
            <div>
              <div className="flex justify-between font-semibold">
                <span>Baptême</span>
                <span className="text-purple-300">
                  {stats.bapteme.hommes + stats.bapteme.femmes}
                </span>
              </div>
              <div className="text-white/80">
                H: {stats.bapteme.hommes} | F: {stats.bapteme.femmes}
              </div>
            </div>

            <div className="border-t border-white/10"></div>

            {/* ÉVANGÉLISATION */}
            <div>
              <div className="flex justify-between font-semibold">
                <span>Évangélisation</span>
                <span className="text-pink-300">
                  {stats.evangelisation.hommes + stats.evangelisation.femmes}
                </span>
              </div>
              <div className="text-white/80">
                H: {stats.evangelisation.hommes} | F: {stats.evangelisation.femmes}
              </div>
              <div className="text-white/80">
                Prière: {stats.evangelisation.priere} | Convertis: {stats.evangelisation.nouveau_converti}
              </div>
            </div>

            <div className="border-t border-white/10"></div>

            {/* SERVITEURS */}
            <div>
              <div className="flex justify-between font-semibold">
                <span>Serviteurs</span>
                <span className="text-yellow-300">
                  {stats.serviteurs.hommes + stats.serviteurs.femmes}
                </span>
              </div>
              <div className="text-white/80">
                H: {stats.serviteurs.hommes} | F: {stats.serviteurs.femmes}
              </div>
            </div>

            <div className="border-t border-white/10"></div>

            {/* CELLULES */}
            <div className="flex justify-between font-semibold">
              <span>Cellules</span>
              <span className="text-orange-300">{stats.cellules.total}</span>
            </div>
          </div>
        )}

        {/* CHILDREN */}
        {isExpanded &&
          eglise.enfants.map((child) => renderEgliseMobile(child, level + 1))}
      </div>
    );
  };

  // Direct children of root eglise (for the supervisor filter dropdown)
  const parentOptions = allEglises.filter((e) => e.parent_eglise_id === rootId);

  const filteredEglises = (() => {
    if (!parentFilter) return eglisesTree;

    const findEgliseInTree = (tree) => {
      for (let eglise of tree) {
        if (eglise.id === parentFilter) return eglise;
        const found = findEgliseInTree(eglise.enfants || []);
        if (found) return found;
      }
      return null;
    };

    const foundEglise = findEgliseInTree(eglisesTree);
    return foundEglise ? [foundEglise] : [];
  })();

  return (
    <div className="min-h-screen bg-[#333699] p-6 text-white">
      <HeaderPages />

      <h1 className="text-2xl font-semibold mt-4 mb-6 text-center text-white">
        Rapport <span className="text-emerald-300">Statistiques Globales</span>
      </h1>

      <div className="max-w-3xl w-full mb-6 text-center mx-auto">
        <p className="italic text-base text-white/90">
          Pilotez votre assemblée avec une vision{" "}
          <span className="text-blue-300 font-semibold">globale et structurée</span>.
          Gardez une vue d&apos;ensemble sur les églises sous votre{" "}
          <span className="text-blue-300 font-semibold">supervision</span>, suivez les{" "}
          <span className="text-blue-300 font-semibold">indicateurs clés</span>, analysez les{" "}
          <span className="text-blue-300 font-semibold">évolutions et accompagnez le développement</span> de chaque
          communauté avec clarté et cohérence
        </p>
      </div>

      {/* FILTRE DATE */}
      <div className="flex justify-center mb-8">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl flex flex-col gap-6 w-fit shadow-lg">
          <p className="text-base text-red-400 font-semibold text-center mb-4">
            Choisissez les paramètres pour générer le rapport
          </p>

          <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4 w-full">
            {/* DATE DEBUT */}
            <div className="flex flex-col w-full md:w-auto">
              <label className="text-base text-center mb-1">Date de début</label>
              <input
                type="date"
                value={dateDebut}
                onChange={e => setDateDebut(e.target.value)}
                className="w-full h-10 bg-white/10 border border-white/30 rounded-lg px-3 text-white"
              />
            </div>

            {/* DATE FIN */}
            <div className="flex flex-col w-full md:w-auto">
              <label className="text-base text-center mb-1">Date de fin</label>
              <input
                type="date"
                value={dateFin}
                onChange={e => setDateFin(e.target.value)}
                className="w-full h-10 bg-white/10 border border-white/30 rounded-lg px-3 text-white"
              />
            </div>

            {/* BOUTON */}
            <div className="flex flex-col w-full md:w-auto">
              <label className="text-base text-center mb-1 opacity-0">btn</label>
              <button
                onClick={fetchStats}
                className="w-full md:w-auto h-10 bg-amber-300 text-white font-semibold px-6 rounded-lg hover:bg-amber-400 transition"
              >
                {loading ? "Générer..." : "Générer le rapport"}
              </button>
            </div>

            {/* SELECT PARENT EGLISE */}
            {parentOptions.length > 0 && (
              <div className="flex flex-col w-full md:w-auto">
                <label className="text-sm text-center mb-1">Église parente</label>
                <select
                  value={parentFilter}
                  onChange={(e) => setParentFilter(e.target.value)}
                  className="w-full h-10 bg-white/10 border border-white/30 rounded-lg px-3 text-white text-center"
                >
                  <option value="">Toutes</option>
                  {parentOptions.map((e) => (
                    <option key={e.id} value={e.id} className="text-black">
                      {e.nom}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DESKTOP */}
      <div className="hidden md:block">
        {filteredEglises.map((eglise) => renderEglise(eglise))}
      </div>

      {/* MOBILE */}
      <div className="md:hidden space-y-3">
        {filteredEglises.map((eglise) => renderEgliseMobile(eglise))}
      </div>

      <Footer />
    </div>
  );
}
