import React, { useMemo } from 'react';
import { AppState, TransactionType } from '../types';
import { formatCurrency } from '../services/storageService';
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';

interface YearlySummaryProps {
  year: number;
  state: AppState;
  onPrevYear: () => void;
  onNextYear: () => void;
}

export const YearlySummary: React.FC<YearlySummaryProps> = ({ year, state, onPrevYear, onNextYear }) => {
  
  const summaryData = useMemo(() => {
    // Structure: Array of rows (one per property). Each row has 12 months of net values + Total
    const months = Array.from({ length: 12 }, (_, i) => i); // [0, 1, ... 11]
    
    // Sort properties: Regular first, Common last
    const sortedProperties = [...state.properties].sort((a, b) => {
      if (a.isCommon) return 1;
      if (b.isCommon) return -1;
      return 0;
    });

    const rows = sortedProperties.map(property => {
      const monthlyData = months.map(month => {
        // Income for this property, this month, this year
        const incomeTx = state.transactions.filter(t => 
          t.propertyId === property.id && 
          t.type === TransactionType.INCOME && 
          t.rentMonth === month && 
          t.rentYear === year
        );
        const income = incomeTx.reduce((sum, t) => sum + t.amount, 0);

        // Expenses for this property, occurring in this month/year
        const expensesTx = state.transactions.filter(t => {
           const d = new Date(t.date);
           return t.propertyId === property.id && 
                  t.type === TransactionType.EXPENSE && 
                  d.getMonth() === month && 
                  d.getFullYear() === year;
        });
        const expense = expensesTx.reduce((sum, t) => sum + t.amount, 0);

        return {
          month,
          income,
          expense,
          net: income - expense
        };
      });

      const totalNet = monthlyData.reduce((sum, m) => sum + m.net, 0);
      const totalIncome = monthlyData.reduce((sum, m) => sum + m.income, 0);
      const totalExpense = monthlyData.reduce((sum, m) => sum + m.expense, 0);

      return {
        property,
        monthlyData,
        totalNet,
        totalIncome,
        totalExpense
      };
    });

    // Calculate Global Totals per Month (Bottom row)
    const globalMonthlyTotals = months.map(month => {
      const monthNet = rows.reduce((sum, row) => sum + row.monthlyData[month].net, 0);
      return monthNet;
    });

    const grandTotal = rows.reduce((sum, row) => sum + row.totalNet, 0);

    return { rows, globalMonthlyTotals, grandTotal };
  }, [state, year]);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="bg-slate-800 text-white p-4 flex justify-between items-center sticky left-0 right-0">
        <div className="flex items-center gap-4">
           <button onClick={onPrevYear} className="hover:bg-slate-700 p-2 rounded-full text-slate-300 hover:text-white transition">←</button>
           <h2 className="text-xl font-bold">Resumen Anual {year}</h2>
           <button onClick={onNextYear} className="hover:bg-slate-700 p-2 rounded-full text-slate-300 hover:text-white transition">→</button>
        </div>
        <div className="text-right">
           <span className="text-xs text-slate-400 uppercase tracking-wide block">Ganancia Total</span>
           <div className={`text-xl font-bold ${summaryData.grandTotal >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
             {formatCurrency(summaryData.grandTotal)}
           </div>
        </div>
      </div>

      {/* Table - Scrollable Container */}
      <div className="overflow-x-auto flex-grow relative">
        <table className="w-full text-left border-collapse text-sm min-w-[1000px]">
          <thead>
            <tr className="bg-slate-100 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200">
              <th className="p-3 w-40 sticky left-0 bg-slate-100 z-10 shadow-sm border-r border-slate-200">Propiedad</th>
              {['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'].map(m => (
                <th key={m} className="p-2 text-center min-w-[80px]">{m}</th>
              ))}
              <th className="p-3 text-right font-bold bg-slate-200 min-w-[100px]">Total Año</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {summaryData.rows.map(row => (
              <tr key={row.property.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-3 sticky left-0 bg-white z-10 border-r border-slate-100 shadow-sm">
                  <div className="font-bold text-slate-800 truncate w-36" title={row.property.name}>
                    {row.property.isCommon ? 'VARIOS / COMÚN' : row.property.name}
                  </div>
                  {!row.property.isCommon && (
                     <div className="text-xs text-slate-400 truncate w-36">{row.property.tenantName}</div>
                  )}
                </td>
                
                {row.monthlyData.map((m, idx) => (
                  <td key={idx} className="p-2 text-center border-r border-slate-50">
                    <div className={`font-medium ${m.net === 0 ? 'text-slate-300' : m.net > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {m.net !== 0 ? formatCurrency(m.net) : '-'}
                    </div>
                  </td>
                ))}

                <td className="p-3 text-right font-bold border-l border-slate-200 bg-slate-50">
                   <div className={row.totalNet >= 0 ? 'text-slate-800' : 'text-rose-600'}>
                     {formatCurrency(row.totalNet)}
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
          
          {/* Footer Row */}
          <tfoot className="bg-slate-900 text-white font-bold border-t border-slate-700">
            <tr>
              <td className="p-3 sticky left-0 bg-slate-900 z-10 border-r border-slate-700">TOTAL MES</td>
              {summaryData.globalMonthlyTotals.map((total, idx) => (
                <td key={idx} className="p-2 text-center border-r border-slate-700">
                  <span className={total >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                    {formatCurrency(total)}
                  </span>
                </td>
              ))}
              <td className="p-3 text-right bg-slate-800 text-emerald-400">
                {formatCurrency(summaryData.grandTotal)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};