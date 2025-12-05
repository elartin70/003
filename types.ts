
export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export enum TransactionAgent {
  ME = 'ME',       // Yo
  SISTER = 'SISTER' // Mi Hermana
}

export enum ExpenseCategory {
  REPAIR = 'REPAIR',         // Reparaciones (Termotanque, humedad)
  TAX = 'TAX',               // Impuestos (Inmobiliario)
  EXTRA_HOA = 'EXTRA_HOA',   // Expensas Extraordinarias
  MAINTENANCE = 'MAINTENANCE',
  OTHER = 'OTHER'
}

export enum ServiceType {
  RENTAS = 'Rentas',
  EXPENSAS_EXTRA = 'Exp. Extra'
}

export interface Property {
  id: string;
  name: string; // e.g. "Departamento Centro"
  address: string;
  tenantName: string;
  rentAmount: number;
  dueDay: number; // Day of month (1-31)
  isCommon?: boolean; // New flag for the "Shared Expenses" virtual property
}

export interface Transaction {
  id: string;
  propertyId: string;
  date: string; // ISO Date string
  amount: number;
  type: TransactionType;
  category?: ExpenseCategory; // Only for expenses
  description: string;
  rentMonth?: number; // 0-11 (Optional, mainly for INCOME)
  rentYear?: number;  // (Optional, mainly for INCOME)
  handledBy?: TransactionAgent; // Who received the money or paid the bill
}

// Tracks if tenant paid utilities for a specific month
export interface ServiceRecord {
  id: string;
  propertyId: string;
  month: number; // 0-11
  year: number;
  services: {
    [key in ServiceType]: boolean; // true = paid/presented, false = pending
  };
}

export interface AppState {
  properties: Property[];
  transactions: Transaction[];
  serviceRecords: ServiceRecord[];
}
