import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Settings,
  Database,
  Calendar,
  LayoutGrid,
  HelpCircle,
  Wifi,
  WifiOff,
  Loader2
} from 'lucide-react';

import { AppState, Transaction, TransactionType, ServiceRecord, ServiceType, Property, ExpenseCategory } from './types';
import { loadState, generateId } from './services/storageService';
import { exportToCSV, downloadEmptyTemplate } from './services/exportService';
import { subscribeToData, saveDataToCloud, isFirebaseReady } from './services/firebase';

import { TransactionModal } from './components/TransactionModal';
import { PropertyModal } from './components/PropertyModal';
import { MonthlySheet } from './components/MonthlySheet';
import { YearlySummary } from './components/YearlySummary';
import { DataManagementModal } from './components/DataManagementModal';
import { HelpModal } from './components/HelpModal';

const App = () => {
  // Initial Load: Try local storage first to avoid flickering, but Cloud will overwrite it immediately if active.
  const [state, setState] = useState<AppState>(loadState());
  const [isConnected, setIsConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // View State
  const currentDate = new Date();
  const [viewMonth, setViewMonth] = useState(currentDate.getMonth());
  const [viewYear, setViewYear] = useState(currentDate.getFullYear());
  const [viewMode, setViewMode] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionModalData, setTransactionModalData] = useState<Partial<Transaction> | undefined>(undefined);
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  // --- Real-time Cloud Sync Effect ---
  useEffect(() => {
    if (isFirebaseReady()) {
      setIsSyncing(true);
      const unsubscribe = subscribeToData((cloudData) => {
        // When cloud updates, update local state
        setState(cloudData);
        setIsConnected(true);
        setIsSyncing(false);
      });
      return () => unsubscribe();
    } else {
      setIsConnected(false);
    }
  }, []);

  // Helper to update state AND cloud
  const updateStateAndCloud = (newState: AppState) => {
    // 1. Optimistic update (update screen immediately)
    setState(newState);
    
    // 2. Send to Cloud (if configured)
    if (isFirebaseReady()) {
      setIsSyncing(true);
      saveDataToCloud(newState).finally(() => setIsSyncing(false));
    } else {
      // Fallback to local storage logic handled by storageService if we wanted, 
      // but for now we rely on the user manually exporting if not using cloud.
      // Or we could silently save to localStorage here as backup.
      localStorage.setItem('rent_control_data_v3', JSON.stringify(newState));
    }
  };

  // --- Handlers ---

  const handleSaveTransaction = (data: Partial<Transaction>) => {
    let newState = { ...state };
    
    if (data.id) {
        // Update existing transaction
        newState = {
            ...newState,
            transactions: newState.transactions.map(t => t.id === data.id ? { ...t, ...data } as Transaction : t)
        };
    } else {
        // Create new transaction
        const newTransaction: Transaction = {
            ...(data as Omit<Transaction, 'id'>),
            id: generateId(),
        };
        newState = {
            ...newState,
            transactions: [newTransaction, ...newState.transactions]
        };
    }
    updateStateAndCloud(newState);
    setIsModalOpen(false);
  };

  const handleDeleteTransaction = (id: string) => {
    const newState = {
      ...state,
      transactions: state.transactions.filter(t => t.id !== id)
    };
    updateStateAndCloud(newState);
  };

  const handleSaveProperty = (propertyData: Property) => {
    let newState = { ...state };
    if (propertyData.id) {
      // Update existing
      newState.properties = newState.properties.map(p => p.id === propertyData.id ? propertyData : p);
    } else {
      // Create new
      const newProperty = { ...propertyData, id: generateId() };
      newState.properties = [...newState.properties, newProperty];
    }
    updateStateAndCloud(newState);
    setIsPropertyModalOpen(false);
    setEditingProperty(null); 
  };

  const handleEditProperty = (property: Property) => {
    setEditingProperty(property);
    setIsPropertyModalOpen(true);
  };

  const handleToggleService = (propertyId: string, service: ServiceType) => {
    const existingRecordIndex = state.serviceRecords.findIndex(
      r => r.propertyId === propertyId && r.month === viewMonth && r.year === viewYear
    );

    let newRecords = [...state.serviceRecords];

    if (existingRecordIndex >= 0) {
      // Update existing
      const record = newRecords[existingRecordIndex];
      newRecords[existingRecordIndex] = {
        ...record,
        services: {
          ...record.services,
          [service]: !record.services[service]
        }
      };
    } else {
      // Create new
      const newRecord: ServiceRecord = {
        id: generateId(),
        propertyId,
        month: viewMonth,
        year: viewYear,
        services: {
          [ServiceType.RENTAS]: false,
          [ServiceType.EXPENSAS_EXTRA]: false,
          [service]: true 
        }
      };
      newRecords.push(newRecord);
    }
    
    const newState = { ...state, serviceRecords: newRecords };
    updateStateAndCloud(newState);
  };

  // Quick Action from Sheet
  const handleSheetAddTransaction = (propertyId: string, type: TransactionType) => {
    const property = state.properties.find(p => p.id === propertyId);
    let defaultDate = new Date().toISOString().split('T')[0];

    if (type === TransactionType.INCOME) {
      setTransactionModalData({
        propertyId,
        amount: property?.rentAmount || 0,
        type: TransactionType.INCOME,
        rentMonth: viewMonth,
        rentYear: viewYear,
        description: property?.isCommon ? 'Ingreso Varios' : `Alquiler ${new Date(viewYear, viewMonth).toLocaleString('es-ES', { month: 'long' })}`,
        date: defaultDate
      });
    } else {
       setTransactionModalData({
        propertyId,
        type: TransactionType.EXPENSE,
        category: ExpenseCategory.MAINTENANCE,
        date: defaultDate,
        description: '',
        rentMonth: viewMonth,
        rentYear: viewYear
      });
    }
    setIsModalOpen(true);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setTransactionModalData(transaction);
    setIsModalOpen(true);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (viewMonth === 0) {
        setViewMonth(11);
        setViewYear(viewYear - 1);
      } else {
        setViewMonth(viewMonth - 1);
      }
    } else {
      if (viewMonth === 11) {
        setViewMonth(0);
        setViewYear(viewYear + 1);
      } else {
        setViewMonth(viewMonth + 1);
      }
    }
  };

  // Import handler (allows uploading JSON to overwrite Cloud)
  const handleImport = (newState: AppState) => {
    updateStateAndCloud(newState);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20 md:pb-8 pt-4 px-2 md:px-8">
      
      {/* Responsive Header */}
      <header className="max-w-7xl mx-auto mb-4 md:mb-6 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md">C</div>
            <div className="flex-grow">
              <h1 className="text-xl font-bold text-slate-900 leading-tight flex items-center gap-2">
                Control de Alquileres
                {isSyncing ? (
                  <Loader2 size={16} className="text-blue-500 animate-spin" />
                ) : isConnected ? (
                  <div title="Conectado a la Nube (Tiempo Real)">
                    <Wifi size={16} className="text-emerald-500" />
                  </div>
                ) : (
                  <div title="Modo Local (Sin Nube)">
                    <WifiOff size={16} className="text-slate-300" />
                  </div>
                )}
              </h1>
              <p className="text-xs text-slate-500">
                {isConnected ? 'Sincronización Familiar Activa' : 'Modo Offline (Solo Local)'}
              </p>
            </div>
            
            <button 
              onClick={() => setIsHelpModalOpen(true)}
              className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors md:mr-2"
              title="Ayuda / Instrucciones"
            >
              <HelpCircle size={24} />
            </button>

            {/* Mobile View Toggle */}
            <div className="md:hidden flex bg-slate-200 p-1 rounded-lg">
               <button 
                 onClick={() => setViewMode('MONTHLY')}
                 className={`p-2 rounded-md transition-all ${viewMode === 'MONTHLY' ? 'bg-white shadow text-blue-700' : 'text-slate-500'}`}
               >
                 <LayoutGrid size={18} />
               </button>
               <button 
                 onClick={() => setViewMode('YEARLY')}
                 className={`p-2 rounded-md transition-all ${viewMode === 'YEARLY' ? 'bg-white shadow text-blue-700' : 'text-slate-500'}`}
               >
                 <Calendar size={18} />
               </button>
            </div>
          </div>
          
          {/* Desktop View Toggle */}
          <div className="hidden md:flex items-center bg-slate-200 p-1 rounded-lg">
             <button 
               onClick={() => setViewMode('MONTHLY')}
               className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${viewMode === 'MONTHLY' ? 'bg-white shadow text-blue-700' : 'text-slate-600 hover:text-slate-800'}`}
             >
               <LayoutGrid size={16} /> Mensual
             </button>
             <button 
               onClick={() => setViewMode('YEARLY')}
               className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${viewMode === 'YEARLY' ? 'bg-white shadow text-blue-700' : 'text-slate-600 hover:text-slate-800'}`}
             >
               <Calendar size={16} /> Anual
             </button>
          </div>
          
          <div className="flex flex-wrap gap-2 justify-center w-full md:w-auto">
             <button 
               onClick={() => setIsDataModalOpen(true)}
               className="flex-1 md:flex-none justify-center px-3 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 text-xs md:text-sm font-medium flex items-center gap-2"
             >
               <Database size={16} /> <span className="hidden md:inline">Datos</span>
             </button>
             <button 
               onClick={() => {
                 setEditingProperty(null);
                 setIsPropertyModalOpen(true);
               }}
               className="flex-1 md:flex-none justify-center px-3 py-2 bg-white border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 text-xs md:text-sm font-medium flex items-center gap-2"
             >
               <Settings size={16} /> <span className="hidden md:inline">Propiedades</span>
             </button>
             <button 
               onClick={() => {
                 setTransactionModalData(undefined);
                 setIsModalOpen(true);
               }}
               className="flex-auto md:flex-none justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center gap-2 shadow-sm"
             >
               <Plus size={16} /> <span className="md:inline">Nuevo Movimiento</span>
             </button>
          </div>
        </div>
        
        {!isConnected && (
           <div className="bg-amber-50 text-amber-800 text-xs p-2 rounded border border-amber-200 text-center">
              Modo Local. Configura Firebase en el código para activar la sincronización familiar.
           </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto md:h-[calc(100vh-140px)] md:min-h-[600px]">
        {viewMode === 'MONTHLY' ? (
          <MonthlySheet 
            month={viewMonth}
            year={viewYear}
            state={state}
            onPrevMonth={() => navigateMonth('prev')}
            onNextMonth={() => navigateMonth('next')}
            onAddTransaction={handleSheetAddTransaction}
            onEditTransaction={handleEditTransaction}
            onToggleService={handleToggleService}
            onExport={() => exportToCSV(state, viewMonth, viewYear)}
            onDownloadTemplate={() => downloadEmptyTemplate(state.properties)}
            onEditProperty={handleEditProperty}
          />
        ) : (
          <YearlySummary 
             year={viewYear}
             state={state}
             onPrevYear={() => setViewYear(viewYear - 1)}
             onNextYear={() => setViewYear(viewYear + 1)}
          />
        )}
      </main>

      {/* Modals */}
      <TransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleSaveTransaction}
        onDelete={handleDeleteTransaction}
        properties={state.properties}
        initialData={transactionModalData}
      />
      <PropertyModal 
        isOpen={isPropertyModalOpen}
        onClose={() => setIsPropertyModalOpen(false)}
        onSubmit={handleSaveProperty}
        property={editingProperty}
      />
      <DataManagementModal 
        isOpen={isDataModalOpen}
        onClose={() => setIsDataModalOpen(false)}
        currentState={state}
        onImport={handleImport} 
      />
      <HelpModal 
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />
    </div>
  );
};

export default App;