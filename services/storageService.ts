import { AppState, Property, Transaction, ServiceRecord, TransactionType } from '../types';

const STORAGE_KEY = 'rent_control_data_v3';

const COMMON_PROPERTY_ID = 'common-shared-expenses';

const INITIAL_PROPERTIES: Property[] = [
  { id: '1', name: 'Depto Centro', address: 'Av. Corrientes 1234', tenantName: 'Juan Pérez', rentAmount: 150000, dueDay: 5 },
  { id: '2', name: 'Casa Quinta', address: 'Los Alamos 440', tenantName: 'Maria Rodriguez', rentAmount: 220000, dueDay: 10 },
  { id: '3', name: 'Local Comercial', address: 'San Martin 880', tenantName: 'Carlos Gomez', rentAmount: 300000, dueDay: 1 },
  { id: '4', name: 'Depto 2 Ambientes', address: 'Belgrano 450', tenantName: 'Lucía Fernández', rentAmount: 120000, dueDay: 5 },
  { id: '5', name: 'Cochera / Depósito', address: 'Mitre 200', tenantName: 'Roberto Díaz', rentAmount: 50000, dueDay: 1 },
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
      state = { ...INITIAL_STATE, ...parsed };
    }

    // Ensure the "Common" property always exists, even if loading old data
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