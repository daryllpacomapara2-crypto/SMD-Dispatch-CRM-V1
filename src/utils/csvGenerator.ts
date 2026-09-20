import { LoadItem, Driver, Broker, ExpenseItem } from '../types';

export function downloadLoadsCSV(loads: LoadItem[], filename = 'trucking_loads_export.csv') {
  const headers = [
    'Load ID',
    'Order #',
    'Status',
    'Pickup Date',
    'Pickup Window',
    'Delivery Date',
    'Delivery Window',
    'Shipper Name',
    'Origin City',
    'Origin State',
    'Origin Zip',
    'Receiver Name',
    'Destination City',
    'Destination State',
    'Destination Zip',
    'Driver Name',
    'Truck #',
    'Trailer #',
    'Equipment Type',
    'Commodity',
    'Weight (lbs)',
    'Loaded Miles',
    'Deadhead Miles',
    'Total Miles',
    'Base Rate ($)',
    'Accessorials ($)',
    'Total Gross ($)',
    'Rate Per Mile ($)',
    'Driver Pay ($)',
    'Fuel Cost ($)',
    'Tolls/Expenses ($)',
    'Net Profit ($)',
    'Profit Margin (%)',
    'Broker Name',
    'Broker Phone',
    'Broker MC #',
    'Invoice #',
    'Payment Terms',
    'Payment Status',
    'Notes'
  ];

  const escapeCSV = (val: any) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = loads.map(item => [
    escapeCSV(item.loadNumber),
    escapeCSV(item.orderNumber),
    escapeCSV(item.status),
    escapeCSV(item.pickupDate),
    escapeCSV(item.pickupTime || ''),
    escapeCSV(item.deliveryDate),
    escapeCSV(item.deliveryTime || ''),
    escapeCSV(item.shipperName),
    escapeCSV(item.originCity),
    escapeCSV(item.originState),
    escapeCSV(item.originZip || ''),
    escapeCSV(item.receiverName),
    escapeCSV(item.destinationCity),
    escapeCSV(item.destinationState),
    escapeCSV(item.destinationZip || ''),
    escapeCSV(item.driverName),
    escapeCSV(item.truckNumber),
    escapeCSV(item.trailerNumber),
    escapeCSV(item.equipmentType),
    escapeCSV(item.commodity),
    item.weightLbs,
    item.loadedMiles,
    item.deadheadMiles,
    item.totalMiles,
    item.grossRate.toFixed(2),
    item.accessorials.toFixed(2),
    item.totalGross.toFixed(2),
    item.ratePerMile.toFixed(2),
    item.driverPay.toFixed(2),
    item.fuelCost.toFixed(2),
    item.tollsAndOtherExpenses.toFixed(2),
    item.netProfit.toFixed(2),
    item.profitMargin.toFixed(2),
    escapeCSV(item.brokerName),
    escapeCSV(item.brokerPhone),
    escapeCSV(item.brokerMcNumber || ''),
    escapeCSV(item.invoiceNumber || ''),
    escapeCSV(item.paymentTerms),
    escapeCSV(item.paymentStatus),
    escapeCSV(item.notes || '')
  ].join(','));

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function copyTableToClipboardForSheets(loads: LoadItem[]): boolean {
  const headers = [
    'Load ID',
    'Order #',
    'Status',
    'Pickup Date',
    'PU Time',
    'Delivery Date',
    'Del Time',
    'Shipper Name',
    'Origin City',
    'Origin ST',
    'Receiver Name',
    'Destination City',
    'Dest ST',
    'Driver Name',
    'Truck #',
    'Trailer #',
    'Equipment',
    'Commodity',
    'Weight (lbs)',
    'Loaded Mi',
    'DH Mi',
    'Total Mi',
    'Base Rate ($)',
    'Accessorials ($)',
    'Total Gross ($)',
    'Rate/Mile ($)',
    'Driver Pay ($)',
    'Fuel ($)',
    'Tolls/Misc ($)',
    'Net Profit ($)',
    'Margin (%)',
    'Broker Name',
    'Broker Phone',
    'MC #',
    'Invoice #',
    'Payment Terms',
    'Payment Status',
    'Notes'
  ];

  const rows = loads.map(l => [
    l.loadNumber,
    l.orderNumber,
    l.status,
    l.pickupDate,
    l.pickupTime || '',
    l.deliveryDate,
    l.deliveryTime || '',
    l.shipperName,
    l.originCity,
    l.originState,
    l.receiverName,
    l.destinationCity,
    l.destinationState,
    l.driverName,
    l.truckNumber,
    l.trailerNumber,
    l.equipmentType,
    l.commodity,
    l.weightLbs,
    l.loadedMiles,
    l.deadheadMiles,
    l.totalMiles,
    l.grossRate,
    l.accessorials,
    l.totalGross,
    l.ratePerMile.toFixed(2),
    l.driverPay.toFixed(2),
    l.fuelCost.toFixed(2),
    l.tollsAndOtherExpenses.toFixed(2),
    l.netProfit.toFixed(2),
    `${l.profitMargin.toFixed(1)}%`,
    l.brokerName,
    l.brokerPhone,
    l.brokerMcNumber || '',
    l.invoiceNumber || '',
    l.paymentTerms,
    l.paymentStatus,
    l.notes || ''
  ].join('\t'));

  const tsv = [headers.join('\t'), ...rows].join('\n');
  try {
    navigator.clipboard.writeText(tsv);
    return true;
  } catch (err) {
    console.error('Failed to copy to clipboard', err);
    return false;
  }
}
