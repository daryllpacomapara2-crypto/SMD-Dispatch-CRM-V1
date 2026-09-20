import * as XLSX from 'xlsx';
import { LoadItem, Driver, Broker, ExpenseItem } from '../types';

export function generateTruckingLoadSchedulerExcel(
  loads: LoadItem[],
  drivers: Driver[],
  brokers: Broker[],
  expenses: ExpenseItem[]
) {
  const wb = XLSX.utils.book_new();

  // ==========================================
  // SHEET 1: LOAD SCHEDULER (Main Dispatch Board)
  // ==========================================
  const loadHeaders = [
    'Load ID',
    'Order / PO #',
    'Status',
    'Pickup Date',
    'Pickup Window',
    'Delivery Date',
    'Delivery Window',
    'Shipper Name',
    'Origin City',
    'Origin ST',
    'Receiver Name',
    'Destination City',
    'Dest ST',
    'Driver Name',
    'Truck #',
    'Trailer #',
    'Equipment Type',
    'Commodity Description',
    'Weight (lbs)',
    'Loaded Miles',
    'Deadhead Miles',
    'Total Miles',
    'Base Rate ($)',
    'Accessorials ($)',
    'Total Gross ($)',
    'Rate / Mile ($)',
    'Driver Pay ($)',
    'Fuel Cost ($)',
    'Tolls & Other ($)',
    'Net Profit ($)',
    'Profit Margin (%)',
    'Broker / Customer',
    'Broker Phone',
    'Broker MC #',
    'Invoice #',
    'Payment Terms',
    'Payment Status',
    'Dispatch Notes'
  ];

  const loadDataRows = loads.map((item, idx) => {
    const rowNum = idx + 4; // Excel 1-based index (Header is row 3)
    return [
      item.loadNumber,
      item.orderNumber,
      item.status,
      item.pickupDate,
      item.pickupTime || 'Flexible',
      item.deliveryDate,
      item.deliveryTime || 'Flexible',
      item.shipperName,
      item.originCity,
      item.originState,
      item.receiverName,
      item.destinationCity,
      item.destinationState,
      item.driverName,
      item.truckNumber,
      item.trailerNumber,
      item.equipmentType,
      item.commodity,
      item.weightLbs,
      item.loadedMiles,
      item.deadheadMiles,
      { f: `T${rowNum}+U${rowNum}`, v: item.totalMiles }, // Total Miles Formula
      item.grossRate,
      item.accessorials,
      { f: `W${rowNum}+X${rowNum}`, v: item.totalGross }, // Total Gross Formula
      { f: `IF(V${rowNum}>0, Y${rowNum}/V${rowNum}, 0)`, v: item.ratePerMile }, // RPM Formula
      item.driverPay,
      item.fuelCost,
      item.tollsAndOtherExpenses,
      { f: `Y${rowNum}-AA${rowNum}-AB${rowNum}-AC${rowNum}`, v: item.netProfit }, // Net Profit Formula
      { f: `IF(Y${rowNum}>0, (AD${rowNum}/Y${rowNum})*100, 0)`, v: item.profitMargin }, // Profit Margin % Formula
      item.brokerName,
      item.brokerPhone,
      item.brokerMcNumber || '',
      item.invoiceNumber || '',
      item.paymentTerms,
      item.paymentStatus,
      item.notes || ''
    ];
  });

  const lastRow = loads.length + 3;
  const summaryRow = [
    'TOTALS / AVERAGES',
    `Count: ${loads.length}`,
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    { f: `SUM(S4:S${lastRow})` }, // Total Weight
    { f: `SUM(T4:T${lastRow})` }, // Total Loaded Miles
    { f: `SUM(U4:U${lastRow})` }, // Total Deadhead Miles
    { f: `SUM(V4:V${lastRow})` }, // Total Fleet Miles
    { f: `SUM(W4:W${lastRow})` }, // Total Base Rate
    { f: `SUM(X4:X${lastRow})` }, // Total Accessorials
    { f: `SUM(Y4:Y${lastRow})` }, // Total Gross Revenue
    { f: `AVERAGE(Z4:Z${lastRow})` }, // Average RPM
    { f: `SUM(AA4:AA${lastRow})` }, // Total Driver Pay
    { f: `SUM(AB4:AB${lastRow})` }, // Total Fuel Cost
    { f: `SUM(AC4:AC${lastRow})` }, // Total Tolls & Expenses
    { f: `SUM(AD4:AD${lastRow})` }, // Total Net Profit
    { f: `AVERAGE(AE4:AE${lastRow})` }, // Average Margin %
    '',
    '',
    '',
    '',
    '',
    '',
    ''
  ];

  const wsLoads = XLSX.utils.aoa_to_sheet([
    ['SOUND MINDED DISPATCHING, LLC - TRUCKING LOAD SCHEDULER & DISPATCH LOG', ...Array(37).fill('')],
    ['Real-Time Dispatching, Mileage Tracker, Driver Compensation & Profit Calculator', ...Array(37).fill('')],
    loadHeaders,
    ...loadDataRows,
    summaryRow
  ]);

  // Set column widths for Sheet 1
  wsLoads['!cols'] = [
    { wch: 12 }, // Load ID
    { wch: 14 }, // Order #
    { wch: 14 }, // Status
    { wch: 12 }, // Pickup Date
    { wch: 14 }, // PU Time
    { wch: 12 }, // Del Date
    { wch: 14 }, // Del Time
    { wch: 25 }, // Shipper Name
    { wch: 16 }, // Origin City
    { wch: 8 },  // Origin ST
    { wch: 25 }, // Receiver Name
    { wch: 16 }, // Dest City
    { wch: 8 },  // Dest ST
    { wch: 18 }, // Driver Name
    { wch: 12 }, // Truck #
    { wch: 12 }, // Trailer #
    { wch: 15 }, // Equip
    { wch: 30 }, // Commodity
    { wch: 12 }, // Weight
    { wch: 12 }, // Loaded Mi
    { wch: 12 }, // DH Mi
    { wch: 12 }, // Total Mi
    { wch: 14 }, // Base Rate
    { wch: 14 }, // Accessorials
    { wch: 15 }, // Total Gross
    { wch: 14 }, // RPM
    { wch: 14 }, // Driver Pay
    { wch: 14 }, // Fuel Cost
    { wch: 14 }, // Tolls
    { wch: 14 }, // Net Profit
    { wch: 14 }, // Margin %
    { wch: 25 }, // Broker Name
    { wch: 16 }, // Broker Phone
    { wch: 14 }, // Broker MC #
    { wch: 14 }, // Invoice #
    { wch: 16 }, // Payment Terms
    { wch: 15 }, // Payment Status
    { wch: 35 }  // Dispatch Notes
  ];

  XLSX.utils.book_append_sheet(wb, wsLoads, 'Load_Scheduler');

  // ==========================================
  // SHEET 2: DISPATCH CALENDAR & TIMELINE
  // ==========================================
  const calendarHeaders = [
    'Driver Name',
    'Assigned Equipment',
    'Mon (Pickup/Del)',
    'Tue (Pickup/Del)',
    'Wed (Pickup/Del)',
    'Thu (Pickup/Del)',
    'Fri (Pickup/Del)',
    'Sat (Pickup/Del)',
    'Sun (Pickup/Del)',
    'Weekly Status'
  ];

  const calendarDataRows = drivers.map(drv => {
    const driverLoads = loads.filter(l => l.driverName === drv.name);
    return [
      drv.name,
      `${drv.assignedTruck} | ${drv.equipmentType}`,
      driverLoads.filter(l => l.pickupDate.includes('-24') || l.pickupDate.includes('-31')).map(l => `${l.loadNumber}: ${l.originCity}->${l.destinationCity} ($${l.totalGross})`).join('; ') || 'Available / Staged',
      driverLoads.filter(l => l.pickupDate.includes('-25') || l.pickupDate.includes('-01')).map(l => `${l.loadNumber}: ${l.originCity}->${l.destinationCity} ($${l.totalGross})`).join('; ') || 'In Transit / On Duty',
      driverLoads.filter(l => l.pickupDate.includes('-26') || l.pickupDate.includes('-02')).map(l => `${l.loadNumber}: ${l.originCity}->${l.destinationCity} ($${l.totalGross})`).join('; ') || 'Available / Staged',
      driverLoads.filter(l => l.pickupDate.includes('-27') || l.pickupDate.includes('-03')).map(l => `${l.loadNumber}: ${l.originCity}->${l.destinationCity} ($${l.totalGross})`).join('; ') || 'Scheduled Load',
      driverLoads.filter(l => l.pickupDate.includes('-28') || l.pickupDate.includes('-04')).map(l => `${l.loadNumber}: ${l.originCity}->${l.destinationCity} ($${l.totalGross})`).join('; ') || 'Open for Booking',
      driverLoads.filter(l => l.pickupDate.includes('-29')).map(l => `${l.loadNumber}: ${l.originCity}->${l.destinationCity}`).join('; ') || 'Weekend Reset',
      driverLoads.filter(l => l.pickupDate.includes('-30')).map(l => `${l.loadNumber}: ${l.originCity}->${l.destinationCity}`).join('; ') || '34-Hour Restart',
      drv.status
    ];
  });

  const wsCalendar = XLSX.utils.aoa_to_sheet([
    ['DISPATCH CALENDAR & DRIVER SCHEDULE PLANNER', ...Array(9).fill('')],
    ['Weekly Driver Schedules, Active Lane Dispatches & Equipment Utilization', ...Array(9).fill('')],
    calendarHeaders,
    ...calendarDataRows
  ]);

  wsCalendar['!cols'] = [
    { wch: 18 },
    { wch: 30 },
    { wch: 28 },
    { wch: 28 },
    { wch: 28 },
    { wch: 28 },
    { wch: 28 },
    { wch: 20 },
    { wch: 20 },
    { wch: 15 }
  ];

  XLSX.utils.book_append_sheet(wb, wsCalendar, 'Dispatch_Calendar');

  // ==========================================
  // SHEET 3: DRIVER & FLEET DIRECTORY
  // ==========================================
  const driverHeaders = [
    'Driver ID',
    'Driver Full Name',
    'Phone Number',
    'Email Address',
    'CDL #',
    'Home Base (Location)',
    'Assigned Truck #',
    'Assigned Trailer #',
    'Primary Equipment',
    'Compensation Type',
    'Pay Rate Value',
    'Current Status',
    'Special Certifications & Notes'
  ];

  const driverDataRows = drivers.map(d => [
    d.id,
    d.name,
    d.phone,
    d.email,
    d.cdlNumber,
    d.homeBase,
    d.assignedTruck,
    d.assignedTrailer,
    d.equipmentType,
    d.payType,
    d.payType === 'Percentage' ? `${d.payRateValue}%` : d.payType === 'Per Mile' ? `$${d.payRateValue}/mi` : `$${d.payRateValue}/wk`,
    d.status,
    d.notes || ''
  ]);

  const wsDrivers = XLSX.utils.aoa_to_sheet([
    ['DRIVER & FLEET EQUIPMENT DIRECTORY', ...Array(12).fill('')],
    ['Active Drivers, CDL Records, Assigned Rigs & Pay Compensation Schedules', ...Array(12).fill('')],
    driverHeaders,
    ...driverDataRows
  ]);

  wsDrivers['!cols'] = [
    { wch: 12 },
    { wch: 20 },
    { wch: 16 },
    { wch: 24 },
    { wch: 16 },
    { wch: 18 },
    { wch: 30 },
    { wch: 26 },
    { wch: 16 },
    { wch: 18 },
    { wch: 15 },
    { wch: 14 },
    { wch: 40 }
  ];

  XLSX.utils.book_append_sheet(wb, wsDrivers, 'Drivers_Fleet');

  // ==========================================
  // SHEET 4: BROKERS & CUSTOMERS DIRECTORY
  // ==========================================
  const brokerHeaders = [
    'Broker ID',
    'Company / Brokerage Name',
    'Primary Contact',
    'Phone Number',
    'Email Address',
    'MC Number',
    'DOT Number',
    'Credit Score',
    'Credit Rating',
    'Payment Terms',
    'Factoring Approved',
    'Average Days to Pay',
    'Operational Notes'
  ];

  const brokerDataRows = brokers.map(b => [
    b.id,
    b.name,
    b.contactPerson,
    b.phone,
    b.email,
    b.mcNumber,
    b.dotNumber || '',
    b.creditScore,
    b.creditRating,
    b.paymentTerms,
    b.factoringApproved ? 'YES (Approved)' : 'NO (Cash/Prepay)',
    b.daysToPay,
    b.notes || ''
  ]);

  const wsBrokers = XLSX.utils.aoa_to_sheet([
    ['BROKERS & SHIPPERS DIRECTORY', ...Array(12).fill('')],
    ['Freight Brokers, MC/DOT Credentials, Credit Ratings & Factoring Terms', ...Array(12).fill('')],
    brokerHeaders,
    ...brokerDataRows
  ]);

  wsBrokers['!cols'] = [
    { wch: 12 },
    { wch: 28 },
    { wch: 18 },
    { wch: 16 },
    { wch: 24 },
    { wch: 14 },
    { wch: 14 },
    { wch: 12 },
    { wch: 14 },
    { wch: 16 },
    { wch: 18 },
    { wch: 18 },
    { wch: 40 }
  ];

  XLSX.utils.book_append_sheet(wb, wsBrokers, 'Brokers_Directory');

  // ==========================================
  // SHEET 5: FINANCIAL & KPI DASHBOARD
  // ==========================================
  const totalGrossRev = loads.reduce((acc, curr) => acc + curr.totalGross, 0);
  const totalLoadedMiles = loads.reduce((acc, curr) => acc + curr.loadedMiles, 0);
  const totalFleetMiles = loads.reduce((acc, curr) => acc + curr.totalMiles, 0);
  const totalDriverPayouts = loads.reduce((acc, curr) => acc + curr.driverPay, 0);
  const totalFuelExp = loads.reduce((acc, curr) => acc + curr.fuelCost, 0);
  const totalTollExp = loads.reduce((acc, curr) => acc + curr.tollsAndOtherExpenses, 0);
  const totalNet = loads.reduce((acc, curr) => acc + curr.netProfit, 0);
  const avgRPM = totalFleetMiles > 0 ? totalGrossRev / totalFleetMiles : 0;
  const avgMargin = totalGrossRev > 0 ? (totalNet / totalGrossRev) * 100 : 0;

  const kpiData = [
    ['TRUCKING DISPATCH BUSINESS KPI & FINANCIAL SUMMARY', ''],
    ['Executive Performance Metrics & Operating Margin Analysis', ''],
    ['', ''],
    ['KEY PERFORMANCE INDICATOR (KPI)', 'VALUE'],
    ['Total Gross Freight Revenue ($)', { f: 'SUM(Load_Scheduler!Y4:Y100)', v: totalGrossRev }],
    ['Total Scheduled Loads (Count)', { f: 'COUNTA(Load_Scheduler!A4:A100)', v: loads.length }],
    ['Delivered & Completed Loads', loads.filter(l => l.status === 'Delivered' || l.status === 'Paid').length],
    ['Active / In-Transit Loads', loads.filter(l => l.status === 'In Transit' || l.status === 'Dispatched' || l.status === 'Loaded' || l.status === 'Arrived Pickup').length],
    ['Total Loaded Miles (Revenue Miles)', { f: 'SUM(Load_Scheduler!T4:T100)', v: totalLoadedMiles }],
    ['Total Fleet Operating Miles', { f: 'SUM(Load_Scheduler!V4:V100)', v: totalFleetMiles }],
    ['Fleet Average Rate Per Mile (RPM)', { f: 'IF(B10>0, B5/B10, 0)', v: avgRPM }],
    ['Total Driver Compensation Payouts ($)', { f: 'SUM(Load_Scheduler!AA4:AA100)', v: totalDriverPayouts }],
    ['Total Diesel Fuel Expenditures ($)', { f: 'SUM(Load_Scheduler!AB4:AB100)', v: totalFuelExp }],
    ['Total Tolls, Scales & Accessorial Expenses ($)', { f: 'SUM(Load_Scheduler!AC4:AC100)', v: totalTollExp }],
    ['Total Net Operating Profit ($)', { f: 'SUM(Load_Scheduler!AD4:AD100)', v: totalNet }],
    ['Net Profit Margin (%)', { f: 'IF(B5>0, (B15/B5)*100, 0)', v: avgMargin }]
  ];

  const wsKPI = XLSX.utils.aoa_to_sheet(kpiData);
  wsKPI['!cols'] = [{ wch: 45 }, { wch: 22 }];

  XLSX.utils.book_append_sheet(wb, wsKPI, 'Financial_KPIs');

  // ==========================================
  // SHEET 6: IFTA & EXPENSE LOG
  // ==========================================
  const expenseHeaders = [
    'Expense ID',
    'Date',
    'Load ID',
    'Driver Name',
    'Expense Category',
    'State / Jurisdiction (IFTA)',
    'Odometer Reading',
    'Fuel Gallons',
    'Cost ($)',
    'Vendor / Service Location',
    'Receipt / Ref #',
    'Notes / Description'
  ];

  const expenseDataRows = expenses.map(e => [
    e.id,
    e.date,
    e.loadNumber || 'General Fleet',
    e.driverName,
    e.category,
    e.state,
    e.odometer || '',
    e.gallons || '',
    e.cost,
    e.vendor,
    e.receiptNumber || '',
    e.notes || ''
  ]);

  const wsExpenses = XLSX.utils.aoa_to_sheet([
    ['IFTA TRIP & FLEET OPERATING EXPENSES LOG', ...Array(11).fill('')],
    ['Quarterly Fuel Tax (IFTA) Mileages, Fuel Gallons, Tolls & Maintenance Receipts', ...Array(11).fill('')],
    expenseHeaders,
    ...expenseDataRows
  ]);

  wsExpenses['!cols'] = [
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 18 },
    { wch: 16 },
    { wch: 14 },
    { wch: 16 },
    { wch: 14 },
    { wch: 14 },
    { wch: 30 },
    { wch: 16 },
    { wch: 30 }
  ];

  XLSX.utils.book_append_sheet(wb, wsExpenses, 'IFTA_Expenses');

  // ==========================================
  // SHEET 7: DATA SETUP & DROPDOWNS
  // ==========================================
  const maxSetupRows = 50;
  const statusList = [
    'Booked',
    'Dispatched',
    'Arrived Pickup',
    'Loaded',
    'In Transit',
    'Arrived Delivery',
    'Delivered',
    'Invoiced',
    'Paid',
    'Cancelled'
  ];
  const equipList = [
    'Dry Van 53\'',
    'Reefer 53\'',
    'Flatbed 48\'',
    'Step Deck',
    'Power Only',
    'Conestoga',
    'Box Truck 26\'',
    'Hotshot'
  ];
  const payTermsList = [
    'QuickPay (2%)',
    'Factored (3%)',
    'Net 7',
    'Net 15',
    'Net 30',
    'COD',
    'Direct Deposit'
  ];

  const setupRows = [];
  for (let i = 0; i < maxSetupRows; i++) {
    setupRows.push([
      statusList[i] || '',
      equipList[i] || '',
      payTermsList[i] || '',
      drivers[i]?.name || '',
      brokers[i]?.name || ''
    ]);
  }

  const wsSetup = XLSX.utils.aoa_to_sheet([
    ['SYSTEM DATA SETUP & LOOKUP LISTS', ...Array(4).fill('')],
    ['Lookup Values for Excel Data Validation Dropdowns & Google Sheets Menus', ...Array(4).fill('')],
    ['Load Statuses', 'Equipment Types', 'Payment Terms', 'Driver Names', 'Broker Names'],
    ...setupRows
  ]);

  wsSetup['!cols'] = [
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 22 },
    { wch: 26 }
  ];

  XLSX.utils.book_append_sheet(wb, wsSetup, 'Data_Setup_Lists');

  // Trigger Excel file download
  const dateStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `Sound_Minded_Dispatching_Load_Scheduler_${dateStr}.xlsx`);
}
