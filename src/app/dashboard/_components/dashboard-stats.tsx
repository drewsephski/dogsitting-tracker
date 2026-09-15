import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatPercent } from "@/lib/format";

interface DashboardStatsProps {
  revenueThisMonth: number;
  revenueLastMonth: number;
  totalRevenue: number;
  bookingCount: number;
  clientCount: number;
  monthOverMonthGrowthPercent: number | null;
}

interface StatCardProps {
  title: string;
  value: string;
  hint?: string;
}

function StatCard({ title, value, hint }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="font-medium text-muted-foreground text-sm">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        <p className="font-semibold text-2xl tracking-tight">{value}</p>
        {hint ? <p className="text-muted-foreground text-xs">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}

export function DashboardStats({
  revenueThisMonth,
  revenueLastMonth,
  totalRevenue,
  bookingCount,
  clientCount,
  monthOverMonthGrowthPercent,
}: DashboardStatsProps) {
  const growthLabel =
    monthOverMonthGrowthPercent == null
      ? "No revenue last month"
      : formatPercent(monthOverMonthGrowthPercent, { showSign: true });

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <StatCard
        title="Revenue this month"
        value={formatCurrency(revenueThisMonth)}
      />
      <StatCard
        title="Revenue last month"
        value={formatCurrency(revenueLastMonth)}
      />
      <StatCard title="All-time revenue" value={formatCurrency(totalRevenue)} />
      <StatCard
        title="Bookings"
        value={bookingCount.toLocaleString("en-US")}
        hint={bookingCount === 0 ? "No bookings yet" : undefined}
      />
      <StatCard
        title="Clients"
        value={clientCount.toLocaleString("en-US")}
        hint={clientCount === 0 ? "No clients yet" : undefined}
      />
      <StatCard
        title="Month-over-month growth"
        value={growthLabel}
        hint={
          monthOverMonthGrowthPercent == null
            ? undefined
            : "Versus prior month revenue"
        }
      />
    </div>
  );
}
