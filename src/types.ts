export type LoadStatus =
  | 'Booked'
  | 'Dispatched'
  | 'In Transit'
  | 'Arrived Pickup'
  | 'Loaded'
  | 'Arrived Delivery'
  | 'Delivered'
  | 'Invoiced'
  | 'Paid'
  | 'Cancelled';

export type EquipmentType =
  | 'Dry Van 53\''
  | 'Reefer 53\''
  | 'Flatbed 48\''
  | 'Step Deck'
  | 'Power Only'
  | 'Conestoga'
  | 'Box Truck 26\''
  | 'Hotshot';

export type PaymentTerms =
  | 'QuickPay (2%)'
  | 'Factored (3%)'
  | 'Net 7'
  | 'Net 15'
  | 'Net 30'
  | 'COD'
  | 'Direct Deposit';

export type PaymentStatus =
  | 'Pending'
  | 'Submitted to Factoring'
  | 'Invoiced'
  | 'Paid'
  | 'Overdue';

export interface LoadItem {
  id: string;
  loadNumber: string; // e.g. "LD-8492"
  orderNumber: string; // PO / Broker Ref #
  status: LoadStatus;
  
  // Dates
  pickupDate: string; // YYYY-MM-DD
  pickupTime?: string; // HH:mm or "08:00 - 12:00"
  deliveryDate: string; // YYYY-MM-DD
  deliveryTime?: string; // HH:mm or "14:00 - 18:00"

  // Origin & Shipper
  shipperName: string;
  originCity: string;
  originState: string;
  originZip?: string;

  // Destination & Receiver
  receiverName: string;
  destinationCity: string;
  destinationState: string;
  destinationZip?: string;

  // Operations
  driverId: string;
  driverName: string;
  truckNumber: string;
  trailerNumber: string;
  equipmentType: EquipmentType;

  // Cargo
  commodity: string;
  weightLbs: number;

  // Broker / Customer
  brokerName: string;
  brokerPhone: string;
  brokerEmail?: string;
  brokerMcNumber?: string;

  // Mileage
  loadedMiles: number;
  deadheadMiles: number;
  totalMiles: number; // calculated

  // Financials
  grossRate: number; // e.g. $3,450.00
  accessorials: number; // detention, lumper, layover, etc.
  totalGross: number; // grossRate + accessorials
  ratePerMile: number; // totalGross / totalMiles
  
  driverPay: number; // driver compensation
  fuelCost: number; // estimated or actual fuel
  tollsAndOtherExpenses: number; // tolls, scale, permits
  
  netProfit: number; // totalGross - driverPay - fuelCost - tollsAndOtherExpenses
  profitMargin: number; // (netProfit / totalGross) * 100

  // Billing
  invoiceNumber?: string;
  paymentTerms: PaymentTerms;
  paymentStatus: PaymentStatus;
  notes?: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  email: string;
  cdlNumber: string;
  homeBase: string; // City, State
  assignedTruck: string;
  assignedTrailer: string;
  equipmentType: EquipmentType;
  payType: 'Percentage' | 'Per Mile' | 'Flat Weekly';
  payRateValue: number; // e.g. 70 (%) or 0.65 ($/mile) or 1600 ($/week)
  status: 'Active' | 'On Road' | 'Off Duty' | 'Maintenance';
  notes?: string;
}

export interface Broker {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  mcNumber: string;
  dotNumber?: string;
  creditScore: number; // e.g. 96
  creditRating: 'A+ High' | 'A Good' | 'B Medium' | 'C Caution';
  paymentTerms: PaymentTerms;
  factoringApproved: boolean;
  daysToPay: number;
  notes?: string;
}

export interface ExpenseItem {
  id: string;
  date: string;
  loadNumber?: string;
  driverName: string;
  category: 'Fuel' | 'Tolls' | 'Maintenance' | 'Lumper' | 'Scale' | 'DEF' | 'Hotel' | 'Other';
  state: string; // State for IFTA tracking
  odometer?: number;
  gallons?: number;
  cost: number;
  vendor: string;
  receiptNumber?: string;
  notes?: string;
}

export interface FilterState {
  searchQuery: string;
  status: string;
  driver: string;
  broker: string;
  equipmentType: string;
  dateRange: 'all' | 'today' | 'this-week' | 'this-month' | 'custom';
  startDate?: string;
  endDate?: string;
}

export const STATUS_OPTIONS: LoadStatus[] = [
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

export const EQUIPMENT_OPTIONS: EquipmentType[] = [
  'Dry Van 53\'',
  'Reefer 53\'',
  'Flatbed 48\'',
  'Step Deck',
  'Power Only',
  'Conestoga',
  'Box Truck 26\'',
  'Hotshot'
];

export const PAYMENT_TERMS_OPTIONS: PaymentTerms[] = [
  'QuickPay (2%)',
  'Factored (3%)',
  'Net 7',
  'Net 15',
  'Net 30',
  'COD',
  'Direct Deposit'
];

export const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

export type AdminRole = 'super_admin' | 'dispatcher' | 'viewer';

export interface AdminUser {
  email: string;
  name: string;
  role: AdminRole;
  isUnlocked: boolean;
  unlockedAt?: string;
}

export interface AdminAccount {
  id: string;
  name: string;
  email: string;
  pinOrPassword: string;
  role: AdminRole;
  status: 'active' | 'suspended';
  createdAt: string;
  lastLoginAt?: string;
  notes?: string;
}

export type AuditActionType = 'ADD' | 'EDIT' | 'UPDATE' | 'DELETE' | 'RESET' | 'BACKUP' | 'RESTORE';
export type AuditEntityType = 'LOAD' | 'DRIVER' | 'BROKER' | 'EXPENSE' | 'SYSTEM';

export interface AuditLogEntry {
  id: string;
  timestamp: string; // ISO string
  timeFormatted: string; // e.g. "09:32 PM"
  userEmail: string;
  role: AdminRole;
  action: AuditActionType;
  entity: AuditEntityType;
  recordId?: string;
  title: string;
  details: string;
}

