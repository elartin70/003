import React from 'react';
import { X, Share, PlusSquare, Menu, Smartphone, Download, Upload } from 'lucide-react';

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
            Cómo usar en el Celular
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-blue-500 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-8 text-slate-700">
          
          {/* Step 1: Install */}
          <section>
            <h3 className="font-bold text-lg text-slate-900 mb-3 flex items-center gap-2">
              1. Instalar la App (Sin descargar nada)
            </h3>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
              <p className="text-sm">Esta es una aplicación web. Para que parezca una App normal:</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-100">
                  <strong className="block text-green-600 mb-1">En Android (Samsung, Moto, etc):</strong>
                  <ol className="list-decimal pl-4 text-xs space-y-1">
                    <li>Abre el link en <b>Chrome</b>.</li>
                    <li>Toca los <b>3 puntitos</b> arriba a la derecha.</li>
                    <li>Busca la opción <b>"Instalar aplicación"</b> o <b>"Agregar a la pantalla principal"</b>.</li>
                  </ol>
                </div>

                <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-100">
                  <strong className="block text-blue-600 mb-1">En iPhone:</strong>
                  <ol className="list-decimal pl-4 text-xs space-y-1">
                    <li>Abre el link en <b>Safari</b>.</li>
                    <li>Toca el botón <b>Compartir</b> <Share size={10} className="inline" /> (cuadrado con flecha).</li>
                    <li>Busca y toca <b>"Agregar a Inicio"</b> <PlusSquare size={10} className="inline" />.</li>
                  </ol>
                </div>
              </div>
            </div>
          </section>

          {/* Step 2: Sync Data */}
          <section>
            <h3 className="font-bold text-lg text-slate-900 mb-3 flex items-center gap-2">
              2. Pasar datos de la PC al Celular
            </h3>
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 space-y-3">
              <p className="text-sm">
                Los datos se guardan en el dispositivo que estás usando. Si empiezas en la PC, el celular estará vacío. Para pasar tus datos:
              </p>
              <ul className="text-xs space-y-2">
                <li className="flex items-start gap-2">
                  <div className="bg-amber-100 p-1 rounded text-amber-700"><Download size={14} /></div>
                  <span>En la PC: Ve al botón <b>"Datos"</b> y toca <b>"Descargar Copia"</b>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="bg-amber-100 p-1 rounded text-amber-700"><Share size={14} /></div>
                  <span>Envíate ese archivo por <b>WhatsApp</b> o Email a tu celular.</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="bg-amber-100 p-1 rounded text-amber-700"><Upload size={14} /></div>
                  <span>En el Celular: Abre la App, ve a <b>"Datos"</b> -> <b>"Restaurar Copia"</b> y elige el archivo.</span>
                </li>
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