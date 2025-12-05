import { AppState, Property, Transaction, ServiceRecord, TransactionType } from '../types';

const STORAGE_KEY = 'rent_control_data_v3';

const COMMON_PROPERTY_ID = 'common-shared-expenses';

const INITIAL_PROPERTIES: Property[] = [
  { id: '1', name: 'Prop-01', address: 'Florida 1920 PB', tenantName: 'Inquilino 1', rentAmount: 0, dueDay: 5 },
  { id: '2', name: 'Prop-02', address: 'Florida 1920 PA', tenantName: 'Inquilino 2', rentAmount: 0, dueDay: 5 },
  { id: '3', name: 'Prop-03', address: 'Florida 1928 PH1', tenantName: 'Inquilino 3', rentAmount: 0, dueDay: 5 },
  { id: '4', name: 'Prop-04', address: 'Florida 1928 PH2', tenantName: 'Inquilino 4', rentAmount: 0, dueDay: 5 },
  { id: '5', name: 'Prop-05', address: 'Mz: 9 Casa:31', tenantName: 'Inquilino 5', rentAmount: 0, dueDay: 5 },
];

const COMMON_PROPERTY: Property = {
  id: COMMON_PROPERTY_ID,
  name: 'VARIOS / GASTOS COMUNES',
  address: 'Compartido',
  tenantName: 'N/A',
  rentAmount: 0,
  dueDay: 1,
  isCommon: true
};

const INITIAL_STATE: AppState = {
  properties: [...INITIAL_PROPERTIES, COMMON_PROPERTY],
  transactions: [],
  serviceRecords: []
};

export const loadState = (): AppState => {
  try {
    const serializedState = localStorage.getItem(STORAGE_KEY);
    let state = INITIAL_STATE;
    
    if (serializedState !== null) {
      const parsed = JSON.parse(serializedState);
      // Merge logic: ensure we respect the loaded properties if they exist
      state = { ...INITIAL_STATE, ...parsed };
    }

    // Ensure the "Common" property always exists
    if (!state.properties.find(p => p.id === COMMON_PROPERTY_ID)) {
      state.properties = [...state.properties, COMMON_PROPERTY];
    }

    return state;
  } catch (err) {
    console.error("Error loading state", err);
    return INITIAL_STATE;
  }
};

export const saveState = (state: AppState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error("Error saving state", err);
  }
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(amount);
};

// --- JSON Import/Export for Sharing ---

export const exportStateAsJSON = (state: AppState) => {
  const dataStr = JSON.stringify(state, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const date = new Date().toISOString().slice(0, 10);
  const exportFileDefaultName = `Respaldo_Alquileres_${date}.json`;

  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
};

export const importStateFromJSON = (file: File): Promise<AppState> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        if (event.target?.result) {
           const json = JSON.parse(event.target.result as string);
           // Basic validation
           if (json.properties && json.transactions) {
             resolve(json as AppState);
           } else {
             reject(new Error("Formato de archivo inválido"));
           }
        }
      } catch (err) {
        reject(err);
      }
    };
    reader.readAsText(file);
  });
};