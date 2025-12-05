import React from 'react';
import { X, Share, PlusSquare, Smartphone, Wifi, Users } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Smartphone size={24} />
            Instalación y Uso
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-blue-500 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-8 text-slate-700">
          
          {/* Step 1: Install */}
          <section>
            <h3 className="font-bold text-lg text-slate-900 mb-3 flex items-center gap-2">
              1. Instalar la App (Como una App real)
            </h3>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
              <p className="text-sm">Esta es una web, pero puedes instalarla en tu inicio:</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-100">
                  <strong className="block text-green-600 mb-1">En Android:</strong>
                  <ol className="list-decimal pl-4 text-xs space-y-1">
                    <li>Abre el link en <b>Chrome</b>.</li>
                    <li>Toca los <b>3 puntitos</b> arriba.</li>
                    <li>Elige <b>"Instalar aplicación"</b> o <b>"Agregar a inicio"</b>.</li>
                  </ol>
                </div>

                <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-100">
                  <strong className="block text-blue-600 mb-1">En iPhone:</strong>
                  <ol className="list-decimal pl-4 text-xs space-y-1">
                    <li>Abre el link en <b>Safari</b>.</li>
                    <li>Toca el botón <b>Compartir</b> <Share size={10} className="inline" />.</li>
                    <li>Busca y toca <b>"Agregar a Inicio"</b> <PlusSquare size={10} className="inline" />.</li>
                  </ol>
                </div>
              </div>
            </div>
          </section>

          {/* Step 2: Sync Data */}
          <section>
            <h3 className="font-bold text-lg text-emerald-700 mb-3 flex items-center gap-2">
              <Wifi size={24} />
              2. Sincronización Familiar Activada
            </h3>
            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 space-y-3">
              <div className="flex items-center gap-3 mb-2">
                 <div className="p-2 bg-emerald-200 rounded-full text-emerald-800">
                   <Users size={20} />
                 </div>
                 <p className="text-sm font-semibold text-emerald-900">
                   ¡Ya están conectados!
                 </p>
              </div>
              <p className="text-sm text-emerald-800">
                La aplicación ahora está conectada a la nube (Firebase).
              </p>
              <ul className="list-disc pl-5 text-xs text-emerald-800 space-y-2">
                <li>Todo lo que anotes en tu celular aparecerá automáticamente en el de tu hermana.</li>
                <li>Si aparece el ícono <Wifi size={12} className="inline" /> verde arriba, tienes conexión.</li>
                <li>Si no hay internet, los datos se guardan y se suben cuando recuperes la conexión.</li>
              </ul>
            </div>
          </section>

        </div>
        
        <div className="p-4 border-t bg-slate-50 text-center">
          <button onClick={onClose} className="text-blue-600 font-bold text-sm hover:underline">
            ¡Entendido, gracias!
          </button>
        </div>
      </div>
    </div>
  );
};