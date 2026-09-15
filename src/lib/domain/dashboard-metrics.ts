import type { DashboardSummary } from "@/lib/definitions";

export interface DashboardPeriodMetrics {
  revenueThisMonth: number;
  revenueLastMonth: number;
  monthOverMonthGrowthPercent: number | null;
}

export interface MonthlyRevenueChartPoint {
  month: string;
  label: string;
  revenue: number;
}

export function getMonthKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
}

export function shiftMonthKey(monthKey: string, deltaMonths: number): string {
  const [yearPart, monthPart] = monthKey.split("-");
  const year = Number(yearPart);
  const month = Number(monthPart);
  const date = new Date(year, month - 1 + deltaMonths, 1);

  return getMonthKey(date);
}

export function formatMonthYearLabel(monthKey: string): string {
  const [yearPart, monthPart] = monthKey.split("-");
  const date = new Date(Number(yearPart), Number(monthPart) - 1, 1);

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(date);
}

export function computePeriodRevenue(
  revenueByMonth: Record<string, number>,
  referenceDate: Date = new Date(),
): DashboardPeriodMetrics {
  const currentKey = getMonthKey(referenceDate);
  const lastKey = shiftMonthKey(currentKey, -1);
  const revenueThisMonth = revenueByMonth[currentKey] ?? 0;
  const revenueLastMonth = revenueByMonth[lastKey] ?? 0;

  const monthOverMonthGrowthPercent =
    revenueLastMonth === 0
      ? null
      : ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100;

  return {
    revenueThisMonth,
    revenueLastMonth,
    monthOverMonthGrowthPercent,
  };
}

export function buildMonthlyRevenueChartData(
  revenueByMonth: Record<string, number>,
): MonthlyRevenueChartPoint[] {
  return Object.entries(revenueByMonth)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([month, revenue]) => ({
      month,
      label: formatMonthYearLabel(month),
      revenue,
    }));
}

export function computeProgressPercent(
  current: number,
  target: number,
): number | null {
  if (target <= 0) return null;

  return Math.min(100, (current / target) * 100);
}

export function deriveDashboardViewModel(
  summary: DashboardSummary,
  referenceDate: Date = new Date(),
) {
  const period = computePeriodRevenue(summary.revenueByMonth, referenceDate);
  const chartData = buildMonthlyRevenueChartData(summary.revenueByMonth);

  return {
    ...summary,
    ...period,
    chartData,
    hasBookings: summary.bookingCount > 0,
  };
}
