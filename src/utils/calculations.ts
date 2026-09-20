import { DispatchLoad, DispatchSummaryMetrics } from '../types/dispatch';

export function calculateSummaryMetrics(loads: DispatchLoad[]): DispatchSummaryMetrics {
  const activeStatuses = ['booked', 'dispatched', 'at_pickup', 'in_transit', 'at_delivery'];
  const deliveredStatuses = ['delivered', 'invoiced', 'paid'];

  let totalGrossRevenue = 0;
  let totalDispatchFees = 0;
  let totalDriverNetPay = 0;
  let totalLoadedMiles = 0;
  let totalDeadheadMiles = 0;
  let activeLoadsCount = 0;
  let deliveredLoadsCount = 0;

  loads.forEach((load) => {
    if (load.status !== 'cancelled') {
      totalGrossRevenue += Number(load.rateGross) || 0;
      totalDispatchFees += Number(load.dispatchFeeAmount) || 0;
      totalDriverNetPay += Number(load.driverNetPay) || 0;
      totalLoadedMiles += Number(load.loadedMiles) || 0;
      totalDeadheadMiles += Number(load.deadheadMiles) || 0;

      if (activeStatuses.includes(load.status)) {
        activeLoadsCount++;
      }
      if (deliveredStatuses.includes(load.status)) {
        deliveredLoadsCount++;
      }
    }
  });

  const totalMiles = totalLoadedMiles + totalDeadheadMiles;
  const averageRatePerMile = totalLoadedMiles > 0 ? totalGrossRevenue / totalLoadedMiles : 0;
  const averageDeadheadPercent = totalMiles > 0 ? (totalDeadheadMiles / totalMiles) * 100 : 0;

  return {
    totalLoads: loads.length,
    activeLoads: activeLoadsCount,
    deliveredLoads: deliveredLoadsCount,
    totalGrossRevenue,
    totalDispatchFees,
    totalDriverNetPay,
    totalLoadedMiles,
    totalDeadheadMiles,
    averageRatePerMile,
    averageDeadheadPercent,
  };
}

export function formatCurrency(val: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
}

export function formatNumber(val: number): string {
  return new Intl.NumberFormat('en-US').format(val);
}
