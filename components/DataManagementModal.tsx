import React, { useRef, useState } from 'react';
import { X, Download, Upload, AlertTriangle, CheckCircle } from 'lucide-react';
import { AppState } from '../types';
import { exportStateAsJSON, importStateFromJSON } from '../services/storageService';

interface DataManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentState: AppState;
  onImport: (newState: AppState) => void;
}

export const DataManagementModal: React.FC<DataManagementModalProps> = ({ isOpen, onClose, currentState, onImport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleExport = () => {
    exportStateAsJSON(currentState);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setError(null);
      const newState = await importStateFromJSON(file);
      onImport(newState);
      setSuccess(true);
      setTimeout(() => {
         setSuccess(false);
         onClose();
      }, 1500);
    } catch (err) {
      setError("El archivo seleccionado no es válido o está dañado.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50">
          <h2 className="text-lg font-semibold text-slate-800">
             Respaldo y Compartir
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg text-sm text-blue-800">
             <strong>¿Cómo compartir con mi hermana?</strong>
             <ul className="list-disc pl-4 mt-2 space-y-1">
               <li>Descarga una copia de seguridad (botón verde).</li>
               <li>Envía el archivo descargado por WhatsApp o Email.</li>
               <li>Ella debe entrar aquí y usar el botón "Restaurar Copia".</li>
             </ul>
          </div>

          <div className="space-y-4">
             <button 
               onClick={handleExport}
               className="w-full py-4 border-2 border-emerald-100 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-300 rounded-xl flex items-center justify-center gap-3 transition-all group"
             >
               <div className="bg-emerald-200 p-2 rounded-full group-hover:scale-110 transition-transform">
                 <Download className="text-emerald-700 w-6 h-6" />
               </div>
               <div className="text-left">
                  <span className="block font-bold text-emerald-900">Descargar Copia de Seguridad</span>
                  <span className="block text-xs text-emerald-600">Para enviárselo a tu hermana</span>
               </div>
             </button>

             <div className="relative">
               <input 
                 type="file" 
                 ref={fileInputRef}
                 accept=".json"
                 onChange={handleFileChange}
                 className="hidden"
               />
               <button 
                 onClick={() => fileInputRef.current?.click()}
                 className="w-full py-4 border-2 border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50 rounded-xl flex items-center justify-center gap-3 transition-all group"
               >
                 <div className="bg-slate-100 p-2 rounded-full group-hover:bg-blue-200 transition-colors">
                   <Upload className="text-slate-600 group-hover:text-blue-700 w-6 h-6" />
                 </div>
                 <div className="text-left">
                    <span className="block font-bold text-slate-700 group-hover:text-blue-800">Restaurar Copia</span>
                    <span className="block text-xs text-slate-400 group-hover:text-blue-500">Cargar archivo recibido</span>
                 </div>
               </button>
             </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-rose-600 bg-rose-50 p-3 rounded-lg text-sm">
               <AlertTriangle size={18} />
               {error}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 p-3 rounded-lg text-sm justify-center font-bold">
               <CheckCircle size={18} />
               ¡Datos cargados correctamente!
            </div>
          )}

        </div>
      </div>
    </div>
  );
};