export function formatCurrency(amount: number | null | undefined) {
  if (amount == null) return "—";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Formats a ratio expressed in percent points (e.g. `12.5` → `12.5%`). */
export function formatPercent(
  value: number | null | undefined,
  options?: { showSign?: boolean },
) {
  if (value == null) return "—";

  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(value);

  if (options?.showSign && value > 0) {
    return `+${formatted}%`;
  }

  return `${formatted}%`;
}

export function formatDate(
  date: Date | string | number | undefined,
  opts: Intl.DateTimeFormatOptions = {},
) {
  if (!date) return "";

  try {
    return new Intl.DateTimeFormat("en-US", {
      month: opts.month ?? "long",
      day: opts.day ?? "numeric",
      year: opts.year ?? "numeric",
      ...opts,
    }).format(new Date(date));
  } catch (_err) {
    return "";
  }
}
