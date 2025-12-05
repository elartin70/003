import React, { useRef, useState } from 'react';
import { X, Download, Upload, AlertTriangle, CheckCircle, RefreshCw, CloudCheck, ShieldCheck } from 'lucide-react';
import { AppState } from '../types';
import { exportStateAsJSON, importStateFromJSON } from '../services/storageService';
import { isFirebaseReady } from '../services/firebase';

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
  const isCloudActive = isFirebaseReady();

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
             <ShieldCheck size={20} className="text-blue-600" />
             Respaldo y Datos
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          
          {isCloudActive ? (
            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-lg text-sm text-emerald-900">
               <div className="flex items-start gap-2">
                 <CloudCheck className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                 <div>
                   <strong>Nube Activada:</strong> 
                   <p className="mt-1 text-xs opacity-90">
                     Tus datos se guardan automáticamente en la nube y se comparten con tu familia. No necesitas hacer nada manual. Usa las opciones de abajo solo si quieres hacer una copia de seguridad personal.
                   </p>
                 </div>
               </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-100 p-4 rounded-lg text-sm text-amber-900">
               <div className="flex items-start gap-2">
                 <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                 <div>
                   <strong>Modo Offline:</strong> 
                   <p className="mt-1 text-xs opacity-90">
                     No estás conectado a la nube. Los datos solo viven en este dispositivo.
                   </p>
                 </div>
               </div>
            </div>
          )}

          <div className="space-y-4">
             {/* Export Button */}
             <button 
               onClick={handleExport}
               className="w-full py-4 px-4 border-2 border-slate-100 bg-white hover:bg-slate-50 hover:border-slate-300 rounded-xl flex items-center gap-4 transition-all group"
             >
               <div className="bg-slate-200 p-2.5 rounded-full group-hover:scale-110 transition-transform">
                 <Download className="text-slate-700 w-6 h-6" />
               </div>
               <div className="text-left flex-grow">
                  <span className="block font-bold text-slate-800">Crear Copia de Seguridad</span>
                  <span className="block text-xs text-slate-500">Descargar archivo .JSON a mi equipo</span>
               </div>
             </button>

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
                 onClick={() => {
                   if(window.confirm("ATENCIÓN: Esto sobrescribirá los datos actuales con los del archivo. ¿Continuar?")) {
                      fileInputRef.current?.click();
                   }
                 }}
                 className="w-full py-4 px-4 border-2 border-slate-100 bg-white hover:border-blue-300 hover:bg-blue-50 rounded-xl flex items-center gap-4 transition-all group"
               >
                 <div className="bg-blue-100 p-2.5 rounded-full group-hover:scale-110 transition-transform">
                   <Upload className="text-blue-600 w-6 h-6" />
                 </div>
                 <div className="text-left flex-grow">
                    <span className="block font-bold text-slate-800">Restaurar Copia</span>
                    <span className="block text-xs text-slate-500">Recuperar datos desde un archivo</span>
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
               ¡Datos cargados correctamente!
            </div>
          )}

        </div>
      </div>
    </div>
  );
};