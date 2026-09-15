"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { MonthlyRevenueChartPoint } from "@/lib/domain/dashboard-metrics";
import { formatCurrency } from "@/lib/format";

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

interface MonthlyRevenueChartProps {
  data: MonthlyRevenueChartPoint[];
}

export function MonthlyRevenueChart({ data }: MonthlyRevenueChartProps) {
  const isEmpty = data.length === 0;

  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader className="pb-4">
        <CardTitle className="text-base">Monthly revenue</CardTitle>
        <CardDescription>
          Totals by month from bookings (daycare by start date, overnight by end
          date).
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <p className="text-muted-foreground text-sm">
            No booking revenue yet. Add bookings to see monthly totals.
          </p>
        ) : (
          <ChartContainer config={chartConfig} className="aspect-[16/9] w-full">
            <BarChart accessibilityLayer data={data}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                }
              />
              <Bar
                dataKey="revenue"
                fill="var(--color-revenue)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
