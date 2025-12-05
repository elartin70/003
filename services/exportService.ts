import { AppState, Transaction, Property, TransactionType, TransactionAgent } from '../types';

export const exportToCSV = (state: AppState, month: number, year: number) => {
  // 1. Filter data for the specific month
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);

  // We want to export two things:
  // A) The detailed transactions for the month
  // B) A summary row per property

  const rows = [['Reporte Mensual', `${month + 1}/${year}`], []];
  
  // Headers
  rows.push(['Fecha', 'Propiedad', 'Tipo', 'Categoría/Descripción', 'Responsable (Quién)', 'Ingreso (+)', 'Gasto (-)', 'Servicios Pagos']);

  // Data Rows
  state.transactions.forEach(t => {
    const tDate = new Date(t.date);
    // Include if transaction happened in this month OR if it's rent for this month
    const isRelevant = (tDate >= startDate && tDate <= endDate) || (t.rentMonth === month && t.rentYear === year);

    if (isRelevant) {
      const propertyName = state.properties.find(p => p.id === t.propertyId)?.name || 'Desconocida';
      const agent = t.handledBy === TransactionAgent.SISTER ? 'Mi Hermana' : 'Yo';
      
      rows.push([
        new Date(t.date).toLocaleDateString(),
        propertyName,
        t.type === TransactionType.INCOME ? 'Alquiler' : 'Gasto',
        t.type === TransactionType.EXPENSE ? (t.category || 'Gasto') : t.description,
        agent,
        t.type === TransactionType.INCOME ? t.amount.toString() : '0',
        t.type === TransactionType.EXPENSE ? t.amount.toString() : '0',
        '-'
      ]);
    }
  });

  // Service Status
  const serviceRecord = state.serviceRecords.find(r => r.month === month && r.year === year);
  if (serviceRecord) {
     rows.push([], ['Estado de Servicios (1=Pago, 0=Pendiente)'], ['Propiedad', 'Agua', 'Luz', 'Gas', 'ABL']);
     state.properties.forEach(p => {
        const record = state.serviceRecords.find(r => r.propertyId === p.id && r.month === month && r.year === year);
        if (record) {
          rows.push([
            p.name,
            record.services.Agua ? 'SI' : 'NO',
            record.services.Luz ? 'SI' : 'NO',
            record.services.Gas ? 'SI' : 'NO',
            record.services.ABL ? 'SI' : 'NO',
          ]);
        }
     });
  }

  // Convert to CSV string
  const csvContent = "data:text/csv;charset=utf-8," 
    + rows.map(e => e.join(",")).join("\n");

  // Trigger Download
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `Control_Alquileres_${month + 1}_${year}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const downloadEmptyTemplate = (properties: Property[]) => {
   const rows = [
     ['PLANTILLA DE CONTROL DE ALQUILERES', ''],
     ['Instrucciones:', 'Llena una fila por cada movimiento de dinero.'],
     [],
     ['Fecha', 'Propiedad', 'Concepto', 'Responsable (YO/HERMANA)', 'Ingreso (Plata que entra)', 'Egreso (Plata que sale)', 'Notas'],
   ];

   // Add example rows for their specific properties
   properties.forEach(p => {
     rows.push(['', p.name, 'Cobro Alquiler', 'YO', p.rentAmount.toString(), '', '']);
   });

   const csvContent = "data:text/csv;charset=utf-8," 
    + rows.map(e => e.join(",")).join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `Plantilla_Control_Alquileres.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}