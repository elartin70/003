import React, { useRef, useState } from 'react';
import { X, Download, Upload, AlertTriangle, CheckCircle, RefreshCw, Smartphone, Monitor } from 'lucide-react';
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
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
             <RefreshCw size={20} className="text-blue-600" />
             Sincronización y Datos
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="bg-amber-50 border border-amber-100 p-4 rounded-lg text-sm text-amber-900">
             <div className="flex items-start gap-2">
               <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
               <div>
                 <strong>Importante:</strong> La PC y el Celular no se conectan solos.
                 <p className="mt-1 text-xs opacity-90">
                   Si cargas datos en la PC, debes descargarlos y subirlos al celular (o viceversa) para verlos en ambos lados.
                 </p>
               </div>
             </div>
          </div>

          <div className="space-y-4">
             {/* Export Button */}
             <button 
               onClick={handleExport}
               className="w-full py-4 px-4 border-2 border-emerald-100 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-300 rounded-xl flex items-center gap-4 transition-all group"
             >
               <div className="bg-emerald-200 p-2.5 rounded-full group-hover:scale-110 transition-transform">
                 <Download className="text-emerald-700 w-6 h-6" />
               </div>
               <div className="text-left flex-grow">
                  <span className="block font-bold text-emerald-900">1. Descargar mis Datos</span>
                  <span className="block text-xs text-emerald-600">Guarda un archivo para pasarlo al otro equipo</span>
               </div>
             </button>

             {/* Visual Arrow */}
             <div className="flex justify-center -my-2 opacity-30">
                <Smartphone size={20} /> <span className="mx-2">⇄</span> <Monitor size={20} />
             </div>

             {/* Import Button */}
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
                 className="w-full py-4 px-4 border-2 border-blue-100 bg-blue-50 hover:border-blue-300 hover:bg-blue-100 rounded-xl flex items-center gap-4 transition-all group"
               >
                 <div className="bg-blue-200 p-2.5 rounded-full group-hover:scale-110 transition-transform">
                   <Upload className="text-blue-700 w-6 h-6" />
                 </div>
                 <div className="text-left flex-grow">
                    <span className="block font-bold text-blue-900">2. Cargar Datos Recibidos</span>
                    <span className="block text-xs text-blue-600">Selecciona el archivo que te enviaste</span>
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
            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 p-3 rounded-lg text-sm justify-center font-bold animate-pulse">
               <CheckCircle size={18} />
               ¡Sincronización Exitosa!
            </div>
          )}

        </div>
      </div>
    </div>
  );
};