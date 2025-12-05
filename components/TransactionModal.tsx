import React, { useState, useEffect } from 'react';
import { X, User, Users, Trash2, CalendarDays } from 'lucide-react';
import { TransactionType, ExpenseCategory, Property, TransactionAgent } from '../types';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  onDelete?: (id: string) => void;
  properties: Property[];
  initialData?: Partial<any>;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, onSubmit, onDelete, properties, initialData }) => {
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [propertyId, setPropertyId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<ExpenseCategory>(ExpenseCategory.MAINTENANCE);
  const [handledBy, setHandledBy] = useState<TransactionAgent>(TransactionAgent.ME);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // New fields for Rent Period (now used for Expenses too)
  const currentDate = new Date();
  const [rentMonth, setRentMonth] = useState(currentDate.getMonth());
  const [rentYear, setRentYear] = useState(currentDate.getFullYear());

  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Initialize state when modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setEditingId(initialData.id || null);
        setType(initialData.type || TransactionType.EXPENSE);
        setAmount(initialData.amount ? initialData.amount.toString() : '');
        setDescription(initialData.description || '');
        setPropertyId(initialData.propertyId || properties[0]?.id || '');
        // Ensure date format is YYYY-MM-DD
        const dateStr = initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
        setDate(dateStr);
        setHandledBy(initialData.handledBy || TransactionAgent.ME);
        if (initialData.rentMonth !== undefined) setRentMonth(initialData.rentMonth);
        if (initialData.rentYear !== undefined) setRentYear(initialData.rentYear);
      } else {
        // Reset to defaults if no initial data
        setEditingId(null);
        setType(TransactionType.EXPENSE);
        setAmount('');
        setDescription('');
        setPropertyId(properties[0]?.id || '');
        setDate(new Date().toISOString().split('T')[0]);
        setHandledBy(TransactionAgent.ME);
        
        // Use current date or provided defaults
        setRentMonth(new Date().getMonth());
        setRentYear(new Date().getFullYear());
      }
    }
  }, [isOpen, initialData, properties]);

  // SMART LOGIC: Auto-update Date and Description when Rent Period changes
  // Only applies when ADDING a new transaction (not editing) and type is INCOME
  useEffect(() => {
    if (isOpen && !editingId && type === TransactionType.INCOME) {
      // 1. Set Description
      setDescription(`Alquiler ${months[rentMonth]}`);

      // 2. Set Date to 5th of the NEXT month (Mes Vencido logic)
      let nextMonth = rentMonth + 1;
      let year = rentYear;
      
      // Handle December rollover (Month 11 -> Month 0 of next year)
      if (nextMonth > 11) {
        nextMonth = 0;
        year = year + 1;
      }

      // Create date object for Day 5 of next month
      const suggestedDate = new Date(year, nextMonth, 5);
      
      const yyyy = suggestedDate.getFullYear();
      const mm = String(suggestedDate.getMonth() + 1).padStart(2, '0');
      const dd = String(suggestedDate.getDate()).padStart(2, '0');
      
      setDate(`${yyyy}-${mm}-${dd}`);
    }
  }, [rentMonth, rentYear, type, isOpen, editingId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      id: editingId, // Pass ID if editing
      propertyId,
      date,
      amount: parseFloat(amount),
      type,
      category: type === TransactionType.EXPENSE ? category : undefined,
      description,
      // Pass rentMonth/rentYear for BOTH Income and Expenses now
      rentMonth: rentMonth,
      rentYear: rentYear,
      handledBy
    });
    onClose();
  };

  const handleDelete = () => {
    if (editingId && onDelete) {
      if (window.confirm('¿Estás seguro de que quieres eliminar esta transacción?')) {
        onDelete(editingId);
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50 sticky top-0 z-10">
          <h2 className="text-lg font-semibold text-slate-800">
            {editingId ? 'Editar Transacción' : 'Nueva Transacción'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Type Selection */}
          <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-lg">
            <button
              type="button"
              disabled={!!editingId} 
              onClick={() => setType(TransactionType.INCOME)}
              className={`py-2 text-sm font-medium rounded-md transition-all ${type === TransactionType.INCOME ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 disabled:opacity-50'}`}
            >
              Cobro Alquiler
            </button>
            <button
              type="button"
              disabled={!!editingId}
              onClick={() => setType(TransactionType.EXPENSE)}
              className={`py-2 text-sm font-medium rounded-md transition-all ${type === TransactionType.EXPENSE ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 disabled:opacity-50'}`}
            >
              Gasto / Reparación
            </button>
          </div>

          {/* Handled By Selector */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              ¿Quién {type === TransactionType.INCOME ? 'recibió el dinero' : 'realizó el pago'}?
            </label>
            <div className="grid grid-cols-2 gap-3">
               <div 
                 onClick={() => setHandledBy(TransactionAgent.ME)}
                 className={`cursor-pointer border-2 rounded-xl p-3 flex items-center gap-3 transition-all ${handledBy === TransactionAgent.ME ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}
               >
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center ${handledBy === TransactionAgent.ME ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                    <User size={16} />
                 </div>
                 <span className={`font-medium ${handledBy === TransactionAgent.ME ? 'text-blue-700' : 'text-slate-600'}`}>Yo</span>
               </div>
               <div 
                 onClick={() => setHandledBy(TransactionAgent.SISTER)}
                 className={`cursor-pointer border-2 rounded-xl p-3 flex items-center gap-3 transition-all ${handledBy === TransactionAgent.SISTER ? 'border-purple-500 bg-purple-50' : 'border-slate-200 hover:border-slate-300'}`}
               >
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center ${handledBy === TransactionAgent.SISTER ? 'bg-purple-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                    <Users size={16} />
                 </div>
                 <span className={`font-medium ${handledBy === TransactionAgent.SISTER ? 'text-purple-700' : 'text-slate-600'}`}>Mi Hermana</span>
               </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Propiedad</label>
            <select 
              value={propertyId} 
              disabled={!!editingId}
              onChange={(e) => setPropertyId(e.target.value)}
              className="w-full rounded-lg border-slate-300 border p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-100"
            >
              {properties.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Period Selector (NOW FOR BOTH INCOME AND EXPENSE) */}
          <div className={`${type === TransactionType.INCOME ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-200'} p-3 rounded-lg border`}>
             <div className="flex items-center gap-2 mb-2">
                <CalendarDays size={14} className={type === TransactionType.INCOME ? 'text-emerald-700' : 'text-slate-500'} />
                <label className={`block text-xs font-bold uppercase tracking-wide ${type === TransactionType.INCOME ? 'text-emerald-800' : 'text-slate-600'}`}>
                  Período / Mes Contable
                </label>
             </div>
             
             <div className="grid grid-cols-2 gap-3">
               <div>
                 <select 
                   value={rentMonth}
                   onChange={(e) => setRentMonth(parseInt(e.target.value))}
                   className={`w-full rounded-md border p-2 text-sm text-slate-700 outline-none ${type === TransactionType.INCOME ? 'border-emerald-200 focus:ring-1 focus:ring-emerald-500' : 'border-slate-300 focus:ring-1 focus:ring-blue-500'}`}
                 >
                   {months.map((m, idx) => (
                     <option key={idx} value={idx}>{m}</option>
                   ))}
                 </select>
               </div>
               <div>
                 <select 
                   value={rentYear}
                   onChange={(e) => setRentYear(parseInt(e.target.value))}
                   className={`w-full rounded-md border p-2 text-sm text-slate-700 outline-none ${type === TransactionType.INCOME ? 'border-emerald-200 focus:ring-1 focus:ring-emerald-500' : 'border-slate-300 focus:ring-1 focus:ring-blue-500'}`}
                 >
                   <option value={2023}>2023</option>
                   <option value={2024}>2024</option>
                   <option value={2025}>2025</option>
                   <option value={2026}>2026</option>
                 </select>
               </div>
             </div>
             {type === TransactionType.INCOME && (
                <p className="text-[10px] text-emerald-600 mt-2">
                   * La fecha de cobro se sugiere a mes vencido (día 5 del mes sig).
                </p>
             )}
             {type === TransactionType.EXPENSE && (
                <p className="text-[10px] text-slate-500 mt-2">
                   * Selecciona a qué mes corresponde este gasto, aunque se pague en otra fecha.
                </p>
             )}
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Fecha Real ({type === TransactionType.INCOME ? 'Cobro' : 'Pago'})
              </label>
              <input 
                type="date" 
                required
                value={date} 
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border-slate-300 border p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Monto</label>
              <input 
                type="number" 
                required
                min="0"
                step="0.01"
                placeholder="0.00"
                value={amount} 
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-lg border-slate-300 border p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {type === TransactionType.EXPENSE && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Categoría de Gasto</label>
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full rounded-lg border-slate-300 border p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value={ExpenseCategory.REPAIR}>Reparación / Infraestructura</option>
                <option value={ExpenseCategory.TAX}>Impuesto Inmobiliario</option>
                <option value={ExpenseCategory.EXTRA_HOA}>Expensas Extraordinarias</option>
                <option value={ExpenseCategory.MAINTENANCE}>Mantenimiento General</option>
                <option value={ExpenseCategory.OTHER}>Otros</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
            <textarea 
              rows={2}
              required
              placeholder={type === TransactionType.INCOME ? "Cobro alquiler..." : "Reparación..."}
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border-slate-300 border p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="flex gap-2">
            {editingId && onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-3 bg-slate-100 text-slate-500 hover:bg-rose-100 hover:text-rose-600 rounded-lg transition-colors"
                title="Eliminar transacción"
              >
                <Trash2 size={20} />
              </button>
            )}
            <button 
              type="submit" 
              className={`flex-grow py-3 px-4 rounded-lg text-white font-medium shadow-md transition-colors ${type === TransactionType.INCOME ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}`}
            >
              {editingId ? 'Guardar Cambios' : (type === TransactionType.INCOME ? 'Registrar Ingreso' : 'Registrar Gasto')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};