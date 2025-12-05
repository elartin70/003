import React, { useState } from 'react';
import { Property, Transaction, TransactionType } from '../types';
import { formatCurrency } from '../services/storageService';
import { Check, AlertCircle, Clock } from 'lucide-react';

interface RentStatusProps {
  property: Property;
  transactions: Transaction[];
  onRecordPayment: (month: number, year: number) => void;
}

export const RentStatus: React.FC<RentStatusProps> = ({ property, transactions, onRecordPayment }) => {
  const [year, setYear] = useState(new Date().getFullYear());
  const today = new Date();
  
  const months = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
  ];

  const getStatus = (monthIndex: number) => {
    // Look for a transaction for this property, this month, this year, and type INCOME
    const transaction = transactions.find(t => 
      t.propertyId === property.id && 
      t.type === TransactionType.INCOME && 
      t.rentMonth === monthIndex && 
      t.rentYear === year
    );

    if (transaction) {
      return { status: 'PAID', transaction };
    }

    // Calculate due date
    const dueDate = new Date(year, monthIndex, property.dueDay);
    const isPastDue = today > dueDate;
    
    // Don't mark future months as pending/late aggressively
    // If it's next month, it's just "Future"
    const nextMonthDate = new Date();
    nextMonthDate.setMonth(today.getMonth() + 1);
    
    // Only show status for current year up to current month or previous years
    // Or maybe show whole year but status varies
    if (year > today.getFullYear() || (year === today.getFullYear() && monthIndex > today.getMonth())) {
       return { status: 'FUTURE' };
    }

    return { status: isPastDue ? 'LATE' : 'PENDING' };
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden mb-4">
       <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <h3 className="font-semibold text-slate-700 flex items-center gap-2">
          <Clock size={18} />
          Estado de Alquileres
        </h3>
        <select 
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value))}
          className="bg-white border-slate-300 rounded-md border p-1 text-sm text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value={2023}>2023</option>
          <option value={2024}>2024</option>
          <option value={2025}>2025</option>
        </select>
      </div>
      
      <div className="p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {months.map((m, idx) => {
            const { status, transaction } = getStatus(idx);
            
            return (
              <div key={idx} className={`relative rounded-lg border p-3 flex flex-col justify-between min-h-[100px] transition-all ${
                status === 'PAID' ? 'bg-emerald-50 border-emerald-200' :
                status === 'LATE' ? 'bg-white border-rose-200 shadow-sm' :
                status === 'PENDING' ? 'bg-white border-yellow-200' :
                'bg-slate-50 border-slate-100 opacity-60'
              }`}>
                <div className="flex justify-between items-start">
                   <span className="font-bold text-slate-700 uppercase text-xs">{m}</span>
                   {status === 'PAID' && <Check className="w-4 h-4 text-emerald-600" />}
                   {status === 'LATE' && <AlertCircle className="w-4 h-4 text-rose-500" />}
                </div>

                <div className="mt-2">
                  {status === 'PAID' ? (
                    <div>
                       <p className="text-xs text-emerald-700 font-bold">{formatCurrency(transaction?.amount || 0)}</p>
                       <p className="text-[10px] text-emerald-600">Pagado el {new Date(transaction?.date || '').toLocaleDateString(undefined, {day:'2-digit', month:'2-digit'})}</p>
                    </div>
                  ) : status === 'FUTURE' ? (
                     <p className="text-xs text-slate-400">-</p>
                  ) : (
                    <button 
                      onClick={() => onRecordPayment(idx, year)}
                      className={`w-full py-1 px-2 rounded text-xs font-medium transition-colors ${
                        status === 'LATE' 
                        ? 'bg-rose-100 text-rose-700 hover:bg-rose-200' 
                        : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                      }`}
                    >
                      {status === 'LATE' ? 'Vencido' : 'Cobrar'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};