{/* FILTRES */}
<div
  id="rapport-filtres"
  className="bg-white/10 p-4 md:p-6 rounded-2xl shadow-lg mt-2 w-full md:w-fit md:mx-auto flex flex-col text-white"
>
  {/* TEXTE AU-DESSUS */}
  <p className="text-white font-semibold text-center mb-4">
    Veuillez choisir vos paramètres ci-dessous pour générer le rapport
  </p>

  {/* CONTAINER DES FILTRES */}
  <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4 w-full">
    {/* Date début */}
    <div className="flex flex-col">
      <label className="text-sm font-semibold mb-1 text-white">Date début</label>
      <input
        type="date"
        value={dateDebut}
        onChange={(e) => setDateDebut(e.target.value)}
        className="w-full md:w-auto border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white"
      />
    </div>

    {/* Date fin */}
    <div className="flex flex-col">
      <label className="text-sm font-semibold mb-1 text-white">Date fin</label>
      <input
        type="date"
        value={dateFin}
        onChange={(e) => setDateFin(e.target.value)}
        className="w-full md:w-auto border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white"
      />
    </div>

    {/* Bouton */}
    <button
      onClick={fetchRapports}
      disabled={loading}
      className="w-full md:w-auto h-10 bg-amber-300 text-white font-semibold px-6 rounded-lg hover:bg-amber-400 transition"
    >
      {loading ? "Chargement..." : "Générer le rapport"}
    </button>

    {/* Type */}
    {showTable && (
      <div className="flex flex-col md:flex-row items-center gap-2">
        <label className="text-sm font-semibold mb-1 text-white">Type de temps</label>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="w-full md:w-auto border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white"
        >
          <option value="">Tous</option>
          {availableTypes.map((type) => (
            <option key={type} value={type} className="text-black">
              {type}
            </option>
          ))}
        </select>
      </div>
    )}
  </div>
</div>
     
      {showTable && (
        <div className="w-full max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 mt-6">
      
          {/* Évangélisés */}
          <div
            className="p-4 sm:p-6 rounded-2xl shadow-lg cursor-pointer bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:scale-105 transition-transform flex flex-col items-center"
            onClick={() => handleKpiClick(null)}
          >
            <div className="text-2xl sm:text-3xl font-semibold">{totalEvangelises}</div>
            <div className="mt-1 text-xs sm:text-sm font-semibold text-center">Évangélisés</div>
          </div>
      
          {/* Envoyés au suivi */}
          <div
            className="p-4 sm:p-6 rounded-2xl shadow-lg cursor-pointer bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:scale-105 transition-transform flex flex-col items-center"
            onClick={() => handleKpiClick("Envoyé")}
          >
            <div className="text-2xl sm:text-3xl font-semibold">
              {filteredEvangelisesByType.filter(e => e.status_suivi === "Envoyé").length}
            </div>
            <div className="mt-1 text-xs sm:text-sm font-semibold text-center">Envoyés au suivi</div>
            <div className="mt-2 w-12 sm:w-16 p-1.5 sm:p-2 bg-white/20 rounded-2xl text-center text-sm sm:text-lg font-semibold">
              {totalEvangelises > 0
                ? Math.round((filteredEvangelisesByType.filter(e => e.status_suivi === "Envoyé").length / totalEvangelises) * 100)
                : 0}%
            </div>
          </div>

            {/* Non envoyés au suivi */}
            <div
              className="p-4 sm:p-6 rounded-2xl shadow-lg cursor-pointer bg-gradient-to-r from-gray-400 to-gray-500 text-white hover:scale-105 transition-transform flex flex-col items-center"
              onClick={() => handleKpiClick("NonEnvoye")} // tu peux gérer la navigation comme tu veux
            >
              <div className="text-2xl sm:text-3xl font-semibold">
                {filteredEvangelisesByType.filter(e => e.status_suivi !== "Envoyé").length}
              </div>
              <div className="mt-1 text-xs sm:text-sm font-semibold text-center">Non envoyés</div>
              <div className="mt-2 w-12 sm:w-16 p-1.5 sm:p-2 bg-white/20 rounded-2xl text-center text-sm sm:text-lg font-semibold">
                {totalEvangelises > 0
                  ? Math.round((filteredEvangelisesByType.filter(e => e.status_suivi !== "Envoyé").length / totalEvangelises) * 100)
                  : 0}%
              </div>
            </div>
      
          {/* Intégrés */}
          <div
            className="p-4 sm:p-6 rounded-2xl shadow-lg cursor-pointer bg-gradient-to-r from-green-400 to-green-600 text-white hover:scale-105 transition-transform flex flex-col items-center"
            onClick={() => handleKpiClick("Intégré")}
          >
            <div className="text-2xl sm:text-3xl font-semibold">{totalIntegres}</div>
            <div className="mt-1 text-xs sm:text-sm font-semibold text-center">Intégrés</div>
            <div className="mt-2 w-12 sm:w-16 p-1.5 sm:p-2 bg-white/20 rounded-2xl text-center text-sm sm:text-lg font-semibold">
              {totalEvangelises > 0 ? Math.round((totalIntegres / totalEvangelises) * 100) : 0}%
            </div>
          </div>
      
          {/* En cours */}
          <div
            className="p-4 sm:p-6 rounded-2xl shadow-lg cursor-pointer bg-gradient-to-r from-yellow-400 to-yellow-500 text-white hover:scale-105 transition-transform flex flex-col items-center"
            onClick={() => handleKpiClick("En cours")}
          >
            <div className="text-2xl sm:text-3xl font-semibold">{totalEncour}</div>
            <div className="mt-1 text-xs sm:text-sm font-semibold text-center">En cours</div>
            <div className="mt-2 w-12 sm:w-16 p-1.5 sm:p-2 bg-white/20 rounded-2xl text-center text-sm sm:text-lg font-semibold">
              {totalEvangelises > 0 ? Math.round((totalEncour / totalEvangelises) * 100) : 0}%
            </div>
          </div>
      
          {/* Refus */}
          <div
            className="p-4 sm:p-6 rounded-2xl shadow-lg cursor-pointer bg-gradient-to-r from-red-400 to-red-600 text-white hover:scale-105 transition-transform flex flex-col items-center"
            onClick={() => handleKpiClick("Refus")}
          >
            <div className="text-2xl sm:text-3xl font-semibold">{totalRefus}</div>
            <div className="mt-1 text-xs sm:text-sm font-semibold text-center">Refus</div>
            <div className="mt-2 w-12 sm:w-16 p-1.5 sm:p-2 bg-white/20 rounded-2xl text-center text-sm sm:text-lg font-semibold">
              {totalEvangelises > 0 ? Math.round((totalRefus / totalEvangelises) * 100) : 0}%
            </div>
          </div>
      
          {/* Intégrés en cellule */}
          <div
            className="p-4 sm:p-6 rounded-2xl shadow-lg cursor-pointer bg-gradient-to-r from-indigo-400 to-indigo-500 text-white flex flex-col items-center"
            onClick={() => handleCelluleClick("all")}
          >
            <div className="text-2xl sm:text-3xl font-semibold">{totalCellule}</div>
            <div className="mt-1 text-xs sm:text-sm font-semibold text-center">Cellule</div>
            <div className="mt-2 w-12 sm:w-16 p-1.5 sm:p-2 bg-white/20 rounded-2xl text-center text-sm sm:text-lg font-semibold">
              {totalCellule > 0 ? Math.round((totalCellule / filteredSuivisState.length) * 100) : 0}%
            </div>
          </div>
      
          {/* Intégrés à l'église */}
          <div
            className="p-4 sm:p-6 rounded-2xl shadow-lg cursor-pointer bg-gradient-to-r from-teal-400 to-teal-500 text-white flex flex-col items-center"
            onClick={() => handleConseillerClick("all")}
          >
            <div className="text-2xl sm:text-3xl font-semibold">{totalEglise}</div>
            <div className="mt-1 text-xs sm:text-sm font-semibold text-center">Église</div>
            <div className="mt-2 w-12 sm:w-16 p-1.5 sm:p-2 bg-white/20 rounded-2xl text-center text-sm sm:text-lg font-semibold">
              {totalEglise > 0 ? Math.round((totalEglise / filteredSuivisState.length) * 100) : 0}%
            </div>
          </div>
      
          {/* Convertis */}
          <div
            className="p-4 sm:p-6 rounded-2xl shadow-lg cursor-pointer bg-gradient-to-r from-pink-400 to-pink-500 text-white flex flex-col items-center"
            onClick={() => handleKpiClick("Converti")}
          >
            <div className="text-2xl sm:text-3xl font-semibold">
              {totalEvangelises > 0 ? Math.round((totalPriereSalut / totalEvangelises) * 100) : 0}%
            </div>
            <div className="mt-1 text-xs sm:text-sm font-semibold text-center">Convertis</div>
          </div>
      
          {/* Taux intégration */}
          <div
            className="p-4 sm:p-6 rounded-2xl shadow-lg cursor-pointer bg-gradient-to-r from-orange-400 to-orange-500 text-white flex flex-col items-center"
            onClick={() => handleKpiClick("all")}
          >
            <div className="text-2xl sm:text-3xl font-semibold">{tauxIntegration}%</div>
            <div className="mt-1 text-xs sm:text-sm font-semibold text-center">Intégration</div>
          </div>
      
        </div>
      )}

      {message && <div className="text-center text-white mt-4 font-medium">{message}</div>}

     {/* TABLEAU */}
{showTable && (
  <div id="rapport-table" className="w-full flex justify-center mt-8">
    <div className="w-full md:w-max space-y-2">

      {/* HEADER DESKTOP */}
      <div className="hidden md:flex text-sm font-semibold uppercase text-white px-4 py-3 border-b border-white/20 bg-white/20 rounded-t-xl whitespace-nowrap">
        <div className="min-w-[150px] ml-2">Type / Date</div>
        <div className="min-w-[110px] text-center ml-28">Hommes</div>
        <div className="min-w-[110px] text-center">Femmes</div>
        <div className="min-w-[110px] text-center text-orange-400 font-semibold">Total</div> 
        <div className="min-w-[120px] text-center text-orange-400 font-semibold">Prières</div>
        <div className="min-w-[140px] text-center">Nouv. conv</div>
        <div className="min-w-[130px] text-center">Recon</div>
        <div className="min-w-[130px] text-center">Moiss</div>
        <div className="min-w-[120px] text-center">Actions</div>
      </div>

      {/* MOIS */}
      {Object.entries(groupedReports).map(([monthKey, monthReports], idx) => {
        const [year, monthIndex] = monthKey.split("-").map(Number);
        const monthLabel = `${getMonthNameFR(monthIndex)} ${year}`;
        const isExpanded = expandedMonths[monthKey] ?? false;
        const borderColor = borderColors[idx % borderColors.length];
        const monthTotals = getTotals(monthReports);

        return (
          <div key={monthKey} className="space-y-1">

            {/* HEADER MOIS */}
            <div
              className={`px-4 py-3 rounded-lg bg-white/20 cursor-pointer border-l-4 ${borderColor}`}
              onClick={() => toggleMonth(monthKey)}
            >
              <div className="hidden md:flex items-center">
                <div className="min-w-[150px] text-white font-semibold">
                  {isExpanded ? "➖ " : "➕ "} {monthLabel}
                </div>

                <div className="flex ml-auto text-white font-semibold text-sm">
                  <div className="min-w-[110px] text-center ml-3">{monthTotals.hommes}</div>
                  <div className="min-w-[110px] text-center">{monthTotals.femmes}</div>
                  <div className="min-w-[110px] text-center text-orange-400 font-semibold">
                    {(monthTotals.hommes || 0) + (monthTotals.femmes || 0)}
                  </div>
                  <div className="min-w-[120px] text-center text-orange-400 font-semibold">
                    {monthTotals.priere}
                  </div>
                  <div className="min-w-[140px] text-center">{monthTotals.nouveau}</div>
                  <div className="min-w-[130px] text-center">{monthTotals.reconciliation}</div>
                  <div className="min-w-[130px] text-center">{monthTotals.moissonneurs}</div>
                  <div className="min-w-[120px]"></div>
                </div>
              </div>

              {/* MOBILE */}
              <div className="md:hidden text-white font-semibold">
                {isExpanded ? "➖ " : "➕ "} {monthLabel}
              </div>
            </div>

            {/* TYPES (UNIQUEMENT SI MOIS OUVERT) */}
            {isExpanded &&
              Object.entries(groupByType(monthReports)).map(([type, typeReports]) => {
                const typeKey = `${monthKey}-${type}`;
                const typeExpanded = expandedTypes[typeKey] || false;
                const typeTotals = getTotals(typeReports);

                return (
                  <div key={typeKey}>

                    {/* HEADER TYPE */}
                    <div
                      onClick={() => toggleType(typeKey)}
                      className={`px-4 py-2 rounded-lg bg-white/20 cursor-pointer border-l-4 ml-4 ${
                        typeColors[type] || "border-white"
                      }`}
                    >
                      <div className="hidden md:flex items-center">
                        <div className="min-w-[150px] text-white font-semibold">
                          {typeExpanded ? "➖ " : "➕ "} {type}
                        </div>

                        <div className="flex ml-auto text-white text-sm">
                          <div className="min-w-[110px] text-center">{typeTotals.hommes}</div>
                          <div className="min-w-[110px] text-center">{typeTotals.femmes}</div>
                          <div className="min-w-[110px] text-center text-orange-400 font-semibold">
                            {(typeTotals.hommes || 0) + (typeTotals.femmes || 0)}
                          </div>
                          <div className="min-w-[120px] text-center">{typeTotals.priere}</div>
                          <div className="min-w-[140px] text-center">{typeTotals.nouveau}</div>
                          <div className="min-w-[130px] text-center">{typeTotals.reconciliation}</div>
                          <div className="min-w-[130px] text-center">{typeTotals.moissonneurs}</div>
                          <div className="min-w-[120px]"></div>
                        </div>
                      </div>

                      {/* MOBILE */}
                        <div className="md:hidden text-white">  
                          <div className="flex justify-between items-center font-semibold">
                            
                            {/* Type évangélisation */}
                            <div>{typeExpanded ? "➖ " : "➕ "} {type}</div>
                        
                            {/* Total aligné à droite */}
                            <div className="text-sm font-bold text-orange-400"> Total (H+F): {((typeTotals?.hommes || 0) + (typeTotals?.femmes || 0))}
                                </div>
                              </div>
                           </div> 
                        </div>    

                                    {/* LIGNES */}
                    {typeExpanded &&
                      typeReports.map((r) => (
                        <div
                          key={r.id}
                          className={`px-4 py-2 rounded-lg border-l-4 mt-2 ml-8 ${
                            typeColors[type] || "border-white"
                          }`}
                        >
                          <div className="hidden md:flex items-center">
                            <div className="min-w-[150px] text-white">
                              {new Date(r.date_evangelise).toLocaleDateString()}
                            </div>
                            <div className="min-w-[110px] text-center text-white ml-20">{r.hommes ?? "-"}</div>
                            <div className="min-w-[110px] text-center text-white">{r.femmes ?? "-"}</div>
                            <div className="min-w-[110px] text-center text-orange-400 font-semibold">
                              {(r.hommes || 0) + (r.femmes || 0)}
                            </div>
                            <div className="min-w-[120px] text-center text-orange-400 font-semibold">{r.priere ?? "-"}</div>
                            <div className="min-w-[140px] text-center text-white">{r.nouveau_converti ?? "-"}</div>
                            <div className="min-w-[130px] text-center text-white">{r.reconciliation ?? "-"}</div>
                            <div className="min-w-[130px] text-center text-white">{r.moissonneurs ?? "-"}</div>
                            <div className="min-w-[120px] text-center">
                              <button
                                onClick={() => {
                                  setSelectedRapport(r);
                                  setEditOpen(true);
                                }}
                                className="text-orange-400 underline"
                              >
                                Modifier
                              </button>
                            </div>
                          </div>
                         
                          {/* MOBILE */}
                          <div className="md:hidden text-white">
                            
                            {/* Date alignée à droite */}
                            <div className="text-amber-300 mb-2 text-right"> {new Date(r.date_evangelise).toLocaleDateString()}</div>
                            <div className="space-y-1">                              
                            <div> Hommes: {r.hommes ?? "-"} | Femmes: {r.femmes ?? "-"}</div>
                            <div className="font-semibold text-orange-400 mt-1">Total: {(r.hommes || 0) + (r.femmes || 0)}</div>
                            <div className= "mt-2"> Nouveaux Convertis: {r.nouveau_converti ?? "-"} | Réconciliation: {r.reconciliation ?? "-"} </div>
                            <div className="font-semibold text-orange-400 mt-1"> Prière du Salut: {r.priere ?? "-"} </div>
                            <div className= "mt-2"> Moissonneurs: {r.moissonneurs ?? "-"}</div>
                            </div>  
                            
                              <button
                              onClick={() => {
                                setSelectedRapport(r);
                                setEditOpen(true);
                              }}
                              className="block mx-auto text-amber-300 underline mt-3"
                            >
                              Modifier
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                );
              })}
          </div>
        );
      })}
    </div>
  </div>
)}

      {selectedRapport && (
        <EditEvanRapportLine
          isOpen={editOpen}
          onClose={()=>setEditOpen(false)}
          rapport={selectedRapport}
          onSave={handleSaveRapport}
        />
      )}

      <Footer />
    </div>
  );
}
