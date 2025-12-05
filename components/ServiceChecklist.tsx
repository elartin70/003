import React, { useState } from 'react';
import { Property, ServiceType, ServiceRecord } from '../types';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface ServiceChecklistProps {
  property: Property;
  records: ServiceRecord[];
  onToggleService: (propertyId: string, month: number, year: number, service: ServiceType) => void;
}

export const ServiceChecklist: React.FC<ServiceChecklistProps> = ({ property, records, onToggleService }) => {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const currentRecord = records.find(r => r.propertyId === property.id && r.month === selectedMonth && r.year === selectedYear);
  
  const getServiceStatus = (service: ServiceType) => {
    return currentRecord?.services[service] || false;
  };

  const handleToggle = (service: ServiceType) => {
    onToggleService(property.id, selectedMonth, selectedYear, service);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <h3 className="font-semibold text-slate-700">Control de Impuestos/Expensas</h3>
        <div className="flex gap-2 text-sm">
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="border-slate-300 rounded-md border p-1 text-slate-700"
          >
            {months.map((m, idx) => <option key={idx} value={idx}>{m}</option>)}
          </select>
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="border-slate-300 rounded-md border p-1 text-slate-700"
          >
            <option value={2023}>2023</option>
            <option value={2024}>2024</option>
            <option value={2025}>2025</option>
          </select>
        </div>
      </div>
      
      <div className="p-4 grid grid-cols-2 gap-4">
        {Object.values(ServiceType).map((service) => {
          const isPaid = getServiceStatus(service);
          return (
            <div 
              key={service} 
              onClick={() => handleToggle(service)}
              className={`cursor-pointer rounded-lg p-3 border-2 transition-all flex flex-col items-center justify-center gap-2 ${
                isPaid 
                  ? 'border-emerald-100 bg-emerald-50' 
                  : 'border-slate-100 hover:border-blue-200 bg-white'
              }`}
            >
              <span className={`text-sm font-medium ${isPaid ? 'text-emerald-700' : 'text-slate-600'}`}>
                {service}
              </span>
              {isPaid ? (
                <CheckCircle className="w-6 h-6 text-emerald-500" />
              ) : (
                <div className="flex flex-col items-center">
                  <XCircle className="w-6 h-6 text-slate-300 mb-1" />
                  <span className="text-xs text-slate-400">Pendiente</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="px-4 pb-3">
         <p className="text-xs text-slate-400 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Haz click para marcar si ya se abonó.
         </p>
      </div>
    </div>
  );
};
