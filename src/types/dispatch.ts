export type LoadStatus =
  | 'booked'
  | 'dispatched'
  | 'at_pickup'
  | 'in_transit'
  | 'at_delivery'
  | 'delivered'
  | 'invoiced'
  | 'paid'
  | 'cancelled';

export type EquipmentType =
  | '53 Dry Van'
  | '53 Reefer'
  | 'Flatbed'
  | 'Step Deck'
  | 'Power Only'
  | 'Hotshot';

export type PaymentStatus = 'unpaid' | 'factored' | 'quickpay' | 'paid';

export interface DispatchLoad {
  id: string;
  loadNumber: string;
  status: LoadStatus;
  driverId: string;
  driverName: string;
  driverPhone: string;
  truckNumber: string;
  trailerNumber: string;
  equipmentType: EquipmentType;
  originCity: string;
  originState: string;
  pickupDate: string;
  pickupTime: string;
  destCity: string;
  destState: string;
  deliveryDate: string;
  deliveryTime: string;
  brokerName: string;
  brokerContact: string;
  commodity: string;
  weightLbs: number;
  loadedMiles: number;
  deadheadMiles: number;
  rateGross: number;
  dispatchFeePercent: number;
  dispatchFeeAmount: number;
  driverNetPay: number;
  ratePerMile: number;
  paymentStatus: PaymentStatus;
  invoiceNumber: string;
  specialInstructions: string;
  bolNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FleetDriver {
  id: string;
  name: string;
  phone: string;
  email: string;
  truckNumber: string;
  trailerNumber: string;
  equipmentType: EquipmentType;
  mcNumber: string;
  dotNumber: string;
  status: 'active' | 'on_load' | 'off_duty' | 'maintenance';
  homeBase: string;
  currentCityState: string;
  defaultFeePercent: number;
  totalLoadsCompleted: number;
  totalGrossEarned: number;
}

export interface DispatchSummaryMetrics {
  totalLoads: number;
  activeLoads: number;
  deliveredLoads: number;
  totalGrossRevenue: number;
  totalDispatchFees: number;
  totalDriverNetPay: number;
  totalLoadedMiles: number;
  totalDeadheadMiles: number;
  averageRatePerMile: number;
  averageDeadheadPercent: number;
}

export type ActiveTab =
  | 'master_sheet'
  | 'active_loads'
  | 'delivered_invoiced'
  | 'fleet_roster'
  | 'rate_analytics'
  | 'calculator';
