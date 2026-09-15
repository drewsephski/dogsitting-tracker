import type { Metadata } from "next";
import { Shell } from "@/components/shell";
import { getDashboardSummary } from "@/lib/data/dashboard";
import { getSettings } from "@/lib/data/settings";
import { deriveDashboardViewModel } from "@/lib/domain/dashboard-metrics";

import { DashboardStats } from "./_components/dashboard-stats";
import { EditSettingsDialog } from "./_components/edit-settings-dialog";
import { MonthlyRevenueChart } from "./_components/monthly-revenue-chart";
import { PlanningProgress } from "./_components/planning-progress";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const [summary, settings] = await Promise.all([
    getDashboardSummary(),
    getSettings(),
  ]);

  const view = deriveDashboardViewModel(summary);

  return (
    <Shell className="gap-4">
      <div className="flex flex-col gap-3 px-1 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="font-semibold text-lg tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Revenue and activity from bookings, plus your planning targets.
          </p>
        </div>
        <EditSettingsDialog settings={settings} />
      </div>

      <DashboardStats
        revenueThisMonth={view.revenueThisMonth}
        revenueLastMonth={view.revenueLastMonth}
        totalRevenue={view.totalRevenue}
        bookingCount={view.bookingCount}
        clientCount={view.clientCount}
        monthOverMonthGrowthPercent={view.monthOverMonthGrowthPercent}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <MonthlyRevenueChart data={view.chartData} />
        <PlanningProgress
          settings={settings}
          revenueThisMonth={view.revenueThisMonth}
        />
      </div>
    </Shell>
  );
}
