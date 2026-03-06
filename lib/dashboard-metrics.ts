/**
 * Dashboard metrics helpers: period-over-period percentage change.
 * Used by /api/admin/dashboard for revenueChange and ordersChange.
 */

/**
 * Computes percentage change from previous to current period.
 * Edge cases:
 * - prev=0 & current=0 => 0
 * - prev=0 & current>0 => 100 (growth from zero)
 * - prev=0 & current<0 => -100 (decline from zero; rare for revenue/orders)
 * - prev>0 => ((current - prev) / prev) * 100
 * Result rounded to 1 decimal.
 */
export function percentChange(current: number, prev: number): number {
  if (prev === 0 && current === 0) return 0;
  if (prev === 0 && current > 0) return 100;
  if (prev === 0 && current < 0) return -100;
  return Math.round(((current - prev) / prev) * 1000) / 10;
}
