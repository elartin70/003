import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Property } from '../types';

interface PropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (property: Property) => void;
  property: Property | null;
}

export const PropertyModal: React.FC<PropertyModalProps> = ({ isOpen, onClose, onSubmit, property }) => {
  const [formData, setFormData] = useState<Property>({
    id: '',
    name: '',
    address: '',
    tenantName: '',
    rentAmount: 0,
    dueDay: 1,
  });

  useEffect(() => {
    if (property) {
      setFormData(property);
    } else {
      // Reset form for new property
      setFormData({
        id: '',
        name: '',
        address: '',
        tenantName: '',
        rentAmount: 0,
        dueDay: 1,
      });
    }
  }, [property, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50">
          <h2 className="text-lg font-semibold text-slate-800">
            {property ? 'Editar Propiedad' : 'Nueva Propiedad'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Propiedad</label>
            <input
              type="text"
              required
              placeholder="Ej. Departamento Centro"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full rounded-lg border-slate-300 border p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Dirección</label>
            <input
              type="text"
              required
              placeholder="Ej. Av. Siempre Viva 123"
              value={formData.address}
              onChange={e => setFormData({...formData, address: e.target.value})}
              className="w-full rounded-lg border-slate-300 border p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Inquilino</label>
            <input
              type="text"
              required
              placeholder="Ej. Juan Pérez"
              value={formData.tenantName}
              onChange={e => setFormData({...formData, tenantName: e.target.value})}
              className="w-full rounded-lg border-slate-300 border p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
           <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Valor Alquiler</label>
              <input
                type="number"
                required
                min="0"
                value={formData.rentAmount}
                onChange={e => setFormData({...formData, rentAmount: parseFloat(e.target.value)})}
                className="w-full rounded-lg border-slate-300 border p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
             <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Día Vencimiento</label>
              <input
                type="number"
                required
                min="1"
                max="31"
                value={formData.dueDay}
                onChange={e => setFormData({...formData, dueDay: parseInt(e.target.value)})}
                className="w-full rounded-lg border-slate-300 border p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
           </div>
          <button
            type="submit"
            className="w-full py-3 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md transition-colors flex justify-center items-center gap-2"
          >
            <Save size={18} /> {property ? 'Guardar Cambios' : 'Crear Propiedad'}
          </button>
        </form>
      </div>
    </div>
  );
};