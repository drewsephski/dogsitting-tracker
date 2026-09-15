import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Settings } from "@/db/schema";
import { computeProgressPercent } from "@/lib/domain/dashboard-metrics";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

interface PlanningProgressProps {
  settings: Settings;
  revenueThisMonth: number;
}

interface ProgressRowProps {
  title: string;
  description: string;
  currentLabel: string;
  targetLabel: string;
  progressPercent: number | null;
}

function ProgressRow({
  title,
  description,
  currentLabel,
  targetLabel,
  progressPercent,
}: ProgressRowProps) {
  const hasTarget = progressPercent != null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-0.5">
        <p className="font-medium text-sm">{title}</p>
        <p className="text-muted-foreground text-xs">{description}</p>
      </div>
      <div className="flex items-baseline justify-between gap-2 text-sm">
        <span>{currentLabel}</span>
        <span className="text-muted-foreground">{targetLabel}</span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={hasTarget ? Math.round(progressPercent) : 0}
        aria-label={title}
      >
        <div
          className={cn(
            "h-full rounded-full bg-primary transition-[width]",
            !hasTarget && "w-0",
          )}
          style={hasTarget ? { width: `${progressPercent}%` } : { width: "0%" }}
        />
      </div>
      {!hasTarget ? (
        <p className="text-muted-foreground text-xs">
          Set a target in planning settings to track progress.
        </p>
      ) : null}
    </div>
  );
}

export function PlanningProgress({
  settings,
  revenueThisMonth,
}: PlanningProgressProps) {
  const monthlyNet = revenueThisMonth - settings.monthlyExpenses;

  const incomeProgress = computeProgressPercent(
    revenueThisMonth,
    settings.monthlyIncomeGoal,
  );
  const expenseCoverageProgress = computeProgressPercent(
    revenueThisMonth,
    settings.monthlyExpenses,
  );
  const savingsProgress = computeProgressPercent(
    monthlyNet,
    settings.moveOutSavingsTarget,
  );

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base">Planning</CardTitle>
        <CardDescription>
          Progress for this month based on booking revenue.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <ProgressRow
          title="Monthly income goal"
          description="Revenue attributed to the current month."
          currentLabel={formatCurrency(revenueThisMonth)}
          targetLabel={`Goal ${formatCurrency(settings.monthlyIncomeGoal)}`}
          progressPercent={incomeProgress}
        />
        <ProgressRow
          title="Monthly expenses"
          description="How much of this month’s revenue covers planned expenses."
          currentLabel={formatCurrency(revenueThisMonth)}
          targetLabel={`Expenses ${formatCurrency(settings.monthlyExpenses)}`}
          progressPercent={expenseCoverageProgress}
        />
        <ProgressRow
          title="Move-out savings"
          description="This month’s net (revenue minus expenses) toward your savings target."
          currentLabel={formatCurrency(monthlyNet)}
          targetLabel={`Target ${formatCurrency(settings.moveOutSavingsTarget)}`}
          progressPercent={savingsProgress}
        />
      </CardContent>
    </Card>
  );
}
