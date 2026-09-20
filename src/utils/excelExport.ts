import * as XLSX from 'xlsx';
import { DispatchLoad, FleetDriver } from '../types/dispatch';
import { calculateSummaryMetrics } from './calculations';

export function exportDispatchToExcel(loads: DispatchLoad[], drivers: FleetDriver[], filename?: string) {
  const metrics = calculateSummaryMetrics(loads);

  // 1. Master Dispatch Sheet Rows
  const masterData = loads.map((l) => ({
    'Load #': l.loadNumber,
    'Status': l.status.replace('_', ' ').toUpperCase(),
    'Driver Name': l.driverName,
    'Driver Phone': l.driverPhone,
    'Truck #': l.truckNumber,
    'Trailer #': l.trailerNumber,
    'Equipment': l.equipmentType,
    'Origin': `${l.originCity}, ${l.originState}`,
    'Pickup Date': l.pickupDate,
    'Pickup Time': l.pickupTime,
    'Destination': `${l.destCity}, ${l.destState}`,
    'Delivery Date': l.deliveryDate,
    'Delivery Time': l.deliveryTime,
    'Broker / Customer': l.brokerName,
    'Broker Contact': l.brokerContact,
    'Commodity': l.commodity,
    'Weight (lbs)': l.weightLbs,
    'Loaded Miles': l.loadedMiles,
    'Deadhead Miles': l.deadheadMiles,
    'Gross Rate ($)': l.rateGross,
    'Rate / Mile ($)': Number(l.ratePerMile.toFixed(2)),
    'Dispatch Fee %': `${l.dispatchFeePercent}%`,
    'Dispatch Fee ($)': Number(l.dispatchFeeAmount.toFixed(2)),
    'Driver Net Pay ($)': Number(l.driverNetPay.toFixed(2)),
    'Payment Status': l.paymentStatus.toUpperCase(),
    'Invoice #': l.invoiceNumber,
    'BOL #': l.bolNumber || '',
    'Special Instructions': l.specialInstructions,
  }));

  const masterSheet = XLSX.utils.json_to_sheet(masterData);

  // Set column widths for Master Sheet
  const colWidths = [
    { wch: 12 }, // Load #
    { wch: 14 }, // Status
    { wch: 18 }, // Driver Name
    { wch: 16 }, // Driver Phone
    { wch: 10 }, // Truck #
    { wch: 12 }, // Trailer #
    { wch: 14 }, // Equipment
    { wch: 18 }, // Origin
    { wch: 12 }, // Pickup Date
    { wch: 12 }, // Pickup Time
    { wch: 18 }, // Destination
    { wch: 14 }, // Delivery Date
    { wch: 14 }, // Delivery Time
    { wch: 24 }, // Broker
    { wch: 22 }, // Broker Contact
    { wch: 24 }, // Commodity
    { wch: 14 }, // Weight
    { wch: 14 }, // Loaded Miles
    { wch: 14 }, // Deadhead Miles
    { wch: 16 }, // Gross Rate
    { wch: 14 }, // Rate / Mile
    { wch: 14 }, // Fee %
    { wch: 16 }, // Fee $
    { wch: 16 }, // Net Pay
    { wch: 14 }, // Payment Status
    { wch: 16 }, // Invoice #
    { wch: 16 }, // BOL #
    { wch: 35 }, // Instructions
  ];
  masterSheet['!cols'] = colWidths;

  // 2. Driver & Fleet Summary Sheet
  const driverData = drivers.map((d) => {
    const driverLoads = loads.filter((l) => l.driverId === d.id || l.driverName === d.name);
    const gross = driverLoads.reduce((sum, l) => sum + (Number(l.rateGross) || 0), 0);
    const fees = driverLoads.reduce((sum, l) => sum + (Number(l.dispatchFeeAmount) || 0), 0);
    const net = driverLoads.reduce((sum, l) => sum + (Number(l.driverNetPay) || 0), 0);

    return {
      'Driver ID': d.id,
      'Driver Name': d.name,
      'Phone': d.phone,
      'Email': d.email,
      'Truck #': d.truckNumber,
      'Trailer #': d.trailerNumber,
      'Equipment Type': d.equipmentType,
      'MC #': d.mcNumber,
      'USDOT #': d.dotNumber,
      'Status': d.status.toUpperCase(),
      'Home Base': d.homeBase,
      'Current Location': d.currentCityState,
      'Fee %': `${d.defaultFeePercent}%`,
      'Active Loads in System': driverLoads.length,
      'Total Gross Revenue ($)': gross,
      'Dispatch Fees Paid ($)': fees,
      'Driver Net Earnings ($)': net,
    };
  });
  const driverSheet = XLSX.utils.json_to_sheet(driverData);
  driverSheet['!cols'] = [
    { wch: 12 },
    { wch: 20 },
    { wch: 16 },
    { wch: 26 },
    { wch: 12 },
    { wch: 14 },
    { wch: 16 },
    { wch: 14 },
    { wch: 16 },
    { wch: 14 },
    { wch: 16 },
    { wch: 18 },
    { wch: 10 },
    { wch: 20 },
    { wch: 22 },
    { wch: 20 },
    { wch: 22 },
  ];

  // 3. Financial & KPI Summary Sheet
  const kpiData = [
    { Metric: 'Company Name', Value: 'Sound Minded Dispatching, LLC' },
    { Metric: 'Generated Date', Value: new Date().toLocaleDateString('en-US', { dateStyle: 'full' }) },
    { Metric: 'Total Scheduled Loads', Value: metrics.totalLoads },
    { Metric: 'Currently Active Loads', Value: metrics.activeLoads },
    { Metric: 'Delivered / Completed', Value: metrics.deliveredLoads },
    { Metric: 'Total Gross Freight Revenue', Value: `$${metrics.totalGrossRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}` },
    { Metric: 'Total Sound Minded Dispatch Fees', Value: `$${metrics.totalDispatchFees.toLocaleString(undefined, { minimumFractionDigits: 2 })}` },
    { Metric: 'Total Driver Net Payout', Value: `$${metrics.totalDriverNetPay.toLocaleString(undefined, { minimumFractionDigits: 2 })}` },
    { Metric: 'Total Loaded Freight Miles', Value: `${metrics.totalLoadedMiles.toLocaleString()} mi` },
    { Metric: 'Total Deadhead Miles', Value: `${metrics.totalDeadheadMiles.toLocaleString()} mi` },
    { Metric: 'Average Rate Per Mile (RPM)', Value: `$${metrics.averageRatePerMile.toFixed(2)} / mi` },
    { Metric: 'Average Deadhead Ratio', Value: `${metrics.averageDeadheadPercent.toFixed(1)}%` },
  ];
  const kpiSheet = XLSX.utils.json_to_sheet(kpiData);
  kpiSheet['!cols'] = [{ wch: 32 }, { wch: 32 }];

  // Build workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, masterSheet, 'Dispatch Schedule');
  XLSX.utils.book_append_sheet(workbook, driverSheet, 'Fleet & Drivers');
  XLSX.utils.book_append_sheet(workbook, kpiSheet, 'Financial Summary');

  const actualFilename = filename || `Sound_Minded_Dispatch_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, actualFilename);
}

export function exportDispatchToCSV(loads: DispatchLoad[]) {
  const exportData = loads.map((l) => ({
    LoadNumber: l.loadNumber,
    Status: l.status,
    Driver: l.driverName,
    Phone: l.driverPhone,
    Truck: l.truckNumber,
    Trailer: l.trailerNumber,
    Equipment: l.equipmentType,
    Origin: `${l.originCity}, ${l.originState}`,
    PickupDate: l.pickupDate,
    Destination: `${l.destCity}, ${l.destState}`,
    DeliveryDate: l.deliveryDate,
    Broker: l.brokerName,
    Commodity: l.commodity,
    WeightLbs: l.weightLbs,
    LoadedMiles: l.loadedMiles,
    DeadheadMiles: l.deadheadMiles,
    GrossRate: l.rateGross,
    RPM: l.ratePerMile,
    DispatchFeePercent: l.dispatchFeePercent,
    DispatchFeeAmount: l.dispatchFeeAmount,
    DriverNetPay: l.driverNetPay,
    PaymentStatus: l.paymentStatus,
    InvoiceNumber: l.invoiceNumber,
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const csvOutput = XLSX.utils.sheet_to_csv(worksheet);

  const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Sound_Minded_Dispatch_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
