import React, { useMemo } from 'react';
import { AppState, Property, TransactionType, ServiceType, TransactionAgent, Transaction } from '../types';
import { formatCurrency } from '../services/storageService';
import { Plus, Check, X, AlertCircle, Trash2, FileSpreadsheet, Download, ArrowRightLeft, User, Users, Wallet, Pencil, MapPin } from 'lucide-react';

interface MonthlySheetProps {
  month: number;
  year: number;
  state: AppState;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onAddTransaction: (propertyId: string, type: TransactionType) => void;
  onEditTransaction: (transaction: Transaction) => void;
  onToggleService: (propertyId: string, service: ServiceType) => void;
  onExport: () => void;
  onDownloadTemplate: () => void;
  onEditProperty: (property: Property) => void;
}

export const MonthlySheet: React.FC<MonthlySheetProps> = ({
  month,
  year,
  state,
  onPrevMonth,
  onNextMonth,
  onAddTransaction,
  onEditTransaction,
  onToggleService,
  onExport,
  onDownloadTemplate,
  onEditProperty
}) => {
  const monthName = new Date(year, month).toLocaleString('es-ES', { month: 'long' });

  // Process data for the grid & settlement logic
  const gridData = useMemo(() => {
    let globalIncome = 0;
    let globalExpense = 0;
    
    // Settlement Accumulators
    let myCashInHand = 0; // Income I collected - Expenses I paid
    let sisterCashInHand = 0; // Income Sister collected - Expenses Sister paid

    // Sort properties: Regular first, Common last
    const sortedProperties = [...state.properties].sort((a, b) => {
      if (a.isCommon) return 1;
      if (b.isCommon) return -1;
      return 0;
    });

    const rows = sortedProperties.map(property => {
      // 1. Calculate Income (Rent paid this month for this month)
      const rentTx = state.transactions.find(t => 
        t.propertyId === property.id && 
        t.type === TransactionType.INCOME && 
        t.rentMonth === month && 
        t.rentYear === year
      );
      
      // 2. Calculate Expenses
      // LOGIC UPDATE: Prioritize 'rentMonth/rentYear' (assigned period) if it exists.
      // If it doesn't exist, fall back to the actual date (compatibility).
      const expenses = state.transactions.filter(t => {
        if (t.propertyId !== property.id || t.type !== TransactionType.EXPENSE) return false;

        // Check assigned period first
        if (t.rentMonth !== undefined && t.rentYear !== undefined) {
           return t.rentMonth === month && t.rentYear === year;
        }

        // Fallback to date check
        const tDate = new Date(t.date);
        return tDate.getMonth() === month && tDate.getFullYear() === year;
      });

      const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);
      const income = rentTx ? rentTx.amount : 0;
      const net = income - totalExpense;

      globalIncome += income;
      globalExpense += totalExpense;

      // Settlement Math per property
      if (rentTx) {
        if (rentTx.handledBy === TransactionAgent.SISTER) sisterCashInHand += rentTx.amount;
        else myCashInHand += rentTx.amount; // Default to ME
      }
      
      expenses.forEach(e => {
        if (e.handledBy === TransactionAgent.SISTER) sisterCashInHand -= e.amount;
        else myCashInHand -= e.amount; // Default to ME
      });

      // 3. Service Status
      const serviceRecord = state.serviceRecords.find(r => 
        r.propertyId === property.id && r.month === month && r.year === year
      );

      return {
        property,
        rentTx, // Pass full tx for badge
        rentAmount: income,
        expenses,
        totalExpense,
        net,
        services: serviceRecord?.services || {
          [ServiceType.LIGHT]: false,
          [ServiceType.GAS]: false,
          [ServiceType.WATER]: false,
          [ServiceType.ABL]: false
        }
      };
    });

    const globalNet = globalIncome - globalExpense;
    
    // Settlement Calculation
    const targetShare = globalNet / 2;
    const myDifference = myCashInHand - targetShare; // + means I owe, - means I am owed

    return { 
      rows, 
      globalIncome, 
      globalExpense, 
      globalNet,
      settlement: {
        myCashInHand,
        sisterCashInHand,
        targetShare,
        myDifference
      }
    };
  }, [state, month, year]);

  const renderBadge = (agent?: TransactionAgent) => {
    if (agent === TransactionAgent.SISTER) {
      return <span className="ml-2 px-1.5 py-0.5 bg-purple-100 text-purple-700 text-[10px] rounded font-bold uppercase tracking-wide border border-purple-200">Ella</span>;
    }
    return <span className="ml-2 px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] rounded font-bold uppercase tracking-wide border border-blue-200">Yo</span>;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    // Avoid timezone issues by splitting YYYY-MM-DD manually
    const [y, m, d] = dateString.split('-');
    return `${d}/${m}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden flex flex-col md:h-full">
      {/* Header Bar */}
      <div className="bg-slate-800 text-white p-3 md:p-4 flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4 sticky top-0 z-20 shadow-md">
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
           <button onClick={onPrevMonth} className="hover:bg-slate-700 p-2 rounded-full text-slate-300 hover:text-white transition">
             ←
           </button>
           <div className="text-center">
             <h2 className="text-xl md:text-2xl font-bold capitalize">{monthName} {year}</h2>
             <p className="text-[10px] md:text-xs text-slate-400 uppercase tracking-widest">Planilla Mensual</p>
           </div>
           <button onClick={onNextMonth} className="hover:bg-slate-700 p-2 rounded-full text-slate-300 hover:text-white transition">
             →
           </button>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
           <button 
             onClick={onDownloadTemplate}
             className="flex-1 md:flex-none justify-center flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-xs font-medium transition"
             title="Descargar plantilla vacía"
           >
             <FileSpreadsheet size={16} />
             <span className="md:inline">Plantilla</span>
           </button>
           <button 
             onClick={onExport}
             className="flex-1 md:flex-none justify-center flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 rounded text-xs font-medium shadow transition"
             title="Exportar a Excel"
           >
             <Download size={16} />
             <span className="md:inline">Excel</span>
           </button>
        </div>
      </div>

      {/* --- DESKTOP VIEW (Table) --- */}
      <div className="hidden md:block overflow-x-auto flex-grow">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 text-slate-600 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
              <th className="p-4 w-1/5">Propiedad</th>
              <th className="p-4 w-1/6 text-center">Ingreso (Alquiler/Varios)</th>
              <th className="p-4 w-1/4">Gastos del Mes</th>
              <th className="p-4 w-1/6 text-center">Control Servicios</th>
              <th className="p-4 w-1/6 text-right bg-slate-200">Total Neto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {gridData.rows.map((row) => (
              <tr key={row.property.id} className={`hover:bg-slate-50 transition-colors group ${row.property.isCommon ? 'bg-amber-50/40' : ''}`}>
                {/* 1. Property Name & Edit */}
                <td className="p-4 align-top">
                  <div className="flex items-start justify-between group/cell">
                    <div>
                      {row.property.isCommon ? (
                         <div className="flex items-center gap-2 text-amber-700">
                           <Wallet size={20} />
                           <div className="font-bold">VARIOS / COMÚN</div>
                         </div>
                      ) : (
                        <>
                          <div className="font-bold text-slate-800">{row.property.name}</div>
                          <div className="text-xs text-slate-500">{row.property.tenantName}</div>
                          <div className="text-xs text-slate-400 mt-0.5">{row.property.address}</div>
                        </>
                      )}
                      {row.property.isCommon && (
                        <div className="text-xs text-amber-600/70 mt-1 pl-7">Gastos compartidos</div>
                      )}
                    </div>
                    {/* Edit Button */}
                    <button 
                      onClick={() => onEditProperty(row.property)}
                      className="opacity-0 group-hover/cell:opacity-100 p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
                      title="Editar Propiedad / Inquilino"
                    >
                      <Pencil size={14} />
                    </button>
                  </div>
                </td>

                {/* 2. Rent Income */}
                <td className="p-4 align-top text-center">
                  {row.property.isCommon ? (
                     row.rentTx ? (
                        <div 
                           onClick={() => onEditTransaction(row.rentTx!)}
                           className="inline-flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity group/income relative"
                           title="Haz clic para editar"
                        >
                           <div className="absolute -top-2 -right-4 opacity-0 group-hover/income:opacity-100 bg-white shadow-sm border border-slate-200 rounded-full p-1 text-slate-400">
                             <Pencil size={10} />
                           </div>
                           <div className="flex items-center">
                             <span className="text-emerald-700 font-bold text-lg">{formatCurrency(row.rentAmount)}</span>
                             {renderBadge(row.rentTx.handledBy)}
                           </div>
                           <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full mt-1">Ingreso Varios</span>
                           <span className="text-[10px] text-slate-400 mt-0.5">{formatDate(row.rentTx.date)}</span>
                        </div>
                     ) : (
                        <button 
                          onClick={() => onAddTransaction(row.property.id, TransactionType.INCOME)}
                          className="w-full py-1 border border-dashed border-amber-300 rounded text-amber-500 hover:bg-amber-100 transition text-xs opacity-50 hover:opacity-100"
                        >
                          + Ingreso Extra
                        </button>
                     )
                  ) : (
                    row.rentTx ? (
                      <div 
                         onClick={() => onEditTransaction(row.rentTx!)}
                         className="inline-flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity group/income relative"
                         title="Haz clic para editar"
                      >
                         <div className="absolute -top-2 -right-4 opacity-0 group-hover/income:opacity-100 bg-white shadow-sm border border-slate-200 rounded-full p-1 text-slate-400">
                           <Pencil size={10} />
                         </div>
                         <div className="flex items-center">
                           <span className="text-emerald-700 font-bold text-lg">{formatCurrency(row.rentAmount)}</span>
                           {renderBadge(row.rentTx.handledBy)}
                         </div>
                         <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full mt-1">Cobrado</span>
                         <span className="text-[10px] text-slate-400 mt-0.5">{formatDate(row.rentTx.date)}</span>
                      </div>
                    ) : (
                      <button 
                        onClick={() => onAddTransaction(row.property.id, TransactionType.INCOME)}
                        className="w-full py-2 border-2 border-dashed border-slate-300 rounded-lg text-slate-400 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 transition flex flex-col items-center gap-1"
                      >
                        <Plus size={16} />
                        <span className="text-xs font-medium">Registrar Cobro</span>
                        <span className="text-xs opacity-50">{formatCurrency(row.property.rentAmount)}</span>
                      </button>
                    )
                  )}
                </td>

                {/* 3. Expenses */}
                <td className="p-4 align-top">
                  <div className="space-y-2">
                    {row.expenses.map(exp => (
                      <div 
                        key={exp.id} 
                        onClick={() => onEditTransaction(exp)}
                        className="flex justify-between items-center text-sm bg-rose-50 p-2 rounded border border-rose-100 cursor-pointer hover:bg-rose-100 transition-colors group/expense relative"
                        title="Haz clic para editar este gasto"
                      >
                        <div className="flex flex-col">
                           <span className="text-rose-900 truncate max-w-[120px]" title={exp.description}>{exp.description}</span>
                           <span className="text-[10px] text-slate-400">{formatDate(exp.date)}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium text-rose-700">-{formatCurrency(exp.amount)}</span>
                          {renderBadge(exp.handledBy)}
                        </div>
                        <div className="absolute -top-1 -right-1 opacity-0 group-hover/expense:opacity-100 bg-white shadow-sm border border-slate-200 rounded-full p-0.5 text-slate-400">
                           <Pencil size={8} />
                        </div>
                      </div>
                    ))}
                    <button 
                      onClick={() => onAddTransaction(row.property.id, TransactionType.EXPENSE)}
                      className="text-xs flex items-center gap-1 text-slate-500 hover:text-blue-600 transition mt-1"
                    >
                      <Plus size={12} /> {row.property.isCommon ? 'Agregar Gasto Común' : 'Agregar Gasto/Reparación'}
                    </button>
                  </div>
                </td>

                {/* 4. Services Checklist */}
                <td className="p-4 align-top">
                  {row.property.isCommon ? (
                    <div className="flex justify-center items-center h-full text-xs text-slate-300 italic">
                      No aplica
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-center gap-2">
                        {[ServiceType.LIGHT, ServiceType.GAS, ServiceType.WATER, ServiceType.ABL].map(svc => {
                          const isPaid = row.services[svc];
                          const label = svc.substring(0, 1);
                          return (
                            <button
                              key={svc}
                              onClick={() => onToggleService(row.property.id, svc)}
                              title={`${svc}: ${isPaid ? 'Comprobante Entregado' : 'Pendiente'}`}
                              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all border-2 ${
                                isPaid 
                                  ? 'bg-blue-600 border-blue-600 text-white shadow-sm' 
                                  : 'bg-white border-slate-200 text-slate-300 hover:border-blue-400 hover:text-blue-400'
                              }`}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                      <div className="text-center mt-2">
                         <span className="text-[10px] text-slate-400">L / G / A / A</span>
                      </div>
                    </>
                  )}
                </td>

                {/* 5. Net Total */}
                <td className={`p-4 align-top text-right font-bold text-lg border-l border-slate-100 ${row.property.isCommon ? 'bg-amber-100/30' : 'bg-slate-50/50'} ${row.net >= 0 ? 'text-slate-800' : 'text-rose-600'}`}>
                   {formatCurrency(row.net)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- MOBILE VIEW (Cards) --- */}
      <div className="md:hidden flex flex-col gap-4 p-4 bg-slate-100 min-h-[500px]">
        {gridData.rows.map((row) => (
          <div key={row.property.id} className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
            {/* Header: Property + Edit */}
            <div className={`p-3 border-b flex justify-between items-start ${row.property.isCommon ? 'bg-amber-50' : 'bg-slate-50'}`}>
              <div>
                 <h3 className="font-bold text-slate-800">{row.property.name}</h3>
                 {!row.property.isCommon && (
                   <>
                     <p className="text-xs text-slate-500">{row.property.tenantName}</p>
                     <p className="text-xs text-slate-400">{row.property.address}</p>
                   </>
                 )}
                 {row.property.isCommon && <p className="text-xs text-amber-600">Gastos Comunes</p>}
              </div>
              <button 
                onClick={() => onEditProperty(row.property)}
                className="p-2 bg-white border rounded-full text-slate-400 hover:text-blue-600 shadow-sm"
              >
                <Pencil size={14} />
              </button>
            </div>

            {/* Income Section */}
            <div className="p-3 border-b border-slate-100">
               <div className="text-xs uppercase font-bold text-slate-400 mb-2">Ingresos</div>
               {row.rentTx ? (
                 <div 
                   onClick={() => onEditTransaction(row.rentTx!)}
                   className="flex justify-between items-center bg-emerald-50 border border-emerald-100 p-2 rounded cursor-pointer active:scale-95 transition-transform"
                 >
                    <div>
                      <span className="text-emerald-700 font-bold text-lg block">{formatCurrency(row.rentAmount)}</span>
                      <span className="text-[10px] text-slate-400">{formatDate(row.rentTx.date)}</span>
                    </div>
                    <div className="flex flex-col items-end">
                       {renderBadge(row.rentTx.handledBy)}
                       <span className="text-[10px] font-bold text-emerald-600 mt-1">{row.property.isCommon ? 'VARIOS' : 'COBRADO'}</span>
                    </div>
                 </div>
               ) : (
                 <button 
                   onClick={() => onAddTransaction(row.property.id, TransactionType.INCOME)}
                   className="w-full py-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-400 flex items-center justify-center gap-2"
                 >
                   <Plus size={16} /> <span className="text-sm font-medium">Registrar Cobro</span>
                 </button>
               )}
            </div>

            {/* Expenses Section */}
            <div className="p-3 border-b border-slate-100">
               <div className="flex justify-between items-center mb-2">
                  <div className="text-xs uppercase font-bold text-slate-400">Gastos</div>
                  <button 
                    onClick={() => onAddTransaction(row.property.id, TransactionType.EXPENSE)}
                    className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600 flex items-center gap-1"
                  >
                    <Plus size={10} /> Agregar
                  </button>
               </div>
               {row.expenses.length > 0 ? (
                 <div className="space-y-2">
                    {row.expenses.map(exp => (
                      <div 
                        key={exp.id} 
                        onClick={() => onEditTransaction(exp)}
                        className="flex justify-between items-center text-sm bg-rose-50 p-2 rounded border border-rose-100 active:bg-rose-100"
                      >
                         <div className="flex flex-col">
                            <span className="text-rose-900 line-clamp-1">{exp.description}</span>
                            <span className="text-[10px] text-slate-400">{formatDate(exp.date)}</span>
                         </div>
                         <div className="flex items-center gap-1">
                            <span className="font-medium text-rose-700">-{formatCurrency(exp.amount)}</span>
                            {renderBadge(exp.handledBy)}
                         </div>
                      </div>
                    ))}
                 </div>
               ) : (
                 <p className="text-xs text-slate-400 italic text-center py-2">Sin gastos este mes</p>
               )}
            </div>

            {/* Services & Net */}
            <div className="p-3 flex justify-between items-center bg-slate-50/50">
               {/* Services */}
               {!row.property.isCommon && (
                 <div className="flex gap-1">
                    {[ServiceType.LIGHT, ServiceType.GAS, ServiceType.WATER, ServiceType.ABL].map(svc => {
                        const isPaid = row.services[svc];
                        return (
                          <button
                            key={svc}
                            onClick={() => onToggleService(row.property.id, svc)}
                            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] border ${
                              isPaid 
                                ? 'bg-blue-600 border-blue-600 text-white' 
                                : 'bg-white border-slate-300 text-slate-300'
                            }`}
                          >
                            {svc.substring(0, 1)}
                          </button>
                        );
                    })}
                 </div>
               )}
               {row.property.isCommon && <span className="text-xs text-slate-300 italic">No aplica</span>}

               {/* Net Total */}
               <div className="text-right">
                  <span className="text-[10px] uppercase text-slate-400 block">Total Neto</span>
                  <span className={`text-xl font-bold ${row.net >= 0 ? 'text-slate-800' : 'text-rose-600'}`}>
                    {formatCurrency(row.net)}
                  </span>
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer / Settlement Panel */}
      <div className="bg-slate-900 text-white p-4 md:p-6 border-t border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
          
          {/* 1. Global Totals */}
          <div className="space-y-2 border-b border-slate-800 pb-4 md:border-0 md:pb-0">
             <h4 className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">Resumen General</h4>
             <div className="flex justify-between text-sm">
               <span>Ingresos Total:</span>
               <span className="text-emerald-400">{formatCurrency(gridData.globalIncome)}</span>
             </div>
             <div className="flex justify-between text-sm">
               <span>Gastos Total:</span>
               <span className="text-rose-400">-{formatCurrency(gridData.globalExpense)}</span>
             </div>
             <div className="flex justify-between font-bold pt-2 border-t border-slate-700">
               <span>Ganancia Neta:</span>
               <span className="text-white">{formatCurrency(gridData.globalNet)}</span>
             </div>
          </div>

          {/* 2. Cash Positions */}
          <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
             <h4 className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-2 flex items-center gap-2">
               <ArrowRightLeft size={14} /> Dinero en Mano
             </h4>
             <div className="space-y-2">
               <div className="flex justify-between items-center">
                 <div className="flex items-center gap-2">
                   <User size={14} className="text-blue-400" />
                   <span className="text-sm">Yo:</span>
                 </div>
                 <span className={`font-mono font-medium text-sm ${gridData.settlement.myCashInHand < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                   {formatCurrency(gridData.settlement.myCashInHand)}
                 </span>
               </div>
               <div className="flex justify-between items-center">
                 <div className="flex items-center gap-2">
                   <Users size={14} className="text-purple-400" />
                   <span className="text-sm">Ella:</span>
                 </div>
                 <span className={`font-mono font-medium text-sm ${gridData.settlement.sisterCashInHand < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                   {formatCurrency(gridData.settlement.sisterCashInHand)}
                 </span>
               </div>
             </div>
          </div>

          {/* 3. Settlement / Adjustment Action */}
          <div className="md:col-span-2 bg-gradient-to-r from-blue-900 to-slate-800 p-4 rounded-lg border border-blue-800 shadow-lg flex flex-col justify-center">
             <h4 className="text-xs uppercase tracking-wider text-blue-300 font-bold mb-2">Cierre de Mes</h4>
             
             {Math.abs(gridData.settlement.myDifference) < 100 ? (
               <div className="flex items-center gap-3 text-emerald-400">
                 <Check className="w-8 h-8" />
                 <div>
                   <p className="font-bold text-lg">Cuentas Saldadas</p>
                 </div>
               </div>
             ) : gridData.settlement.myDifference > 0 ? (
                // I have surplus, I must pay sister
                <div className="flex items-center gap-3">
                  <div className="bg-blue-600 rounded-full p-2 flex-shrink-0">
                     <User className="text-white w-5 h-5" />
                  </div>
                  <div className="flex-grow">
                     <p className="text-blue-200 text-xs">Transfiere a tu Hermana:</p>
                     <p className="text-2xl font-bold text-white leading-none">{formatCurrency(gridData.settlement.myDifference)}</p>
                  </div>
                </div>
             ) : (
                // I have deficit, Sister must pay me
                <div className="flex items-center gap-3">
                  <div className="bg-purple-600 rounded-full p-2 flex-shrink-0">
                     <Users className="text-white w-5 h-5" />
                  </div>
                  <div className="flex-grow">
                     <p className="text-purple-200 text-xs">Tu Hermana te debe:</p>
                     <p className="text-2xl font-bold text-white leading-none">{formatCurrency(Math.abs(gridData.settlement.myDifference))}</p>
                  </div>
                </div>
             )}
          </div>

        </div>
      </div>
    </div>
  );
};