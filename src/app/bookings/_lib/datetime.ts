export function toDatetimeLocalValue(date: Date | string | null | undefined) {
  if (!date) return "";

  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return "";

  const pad = (part: number) => String(part).padStart(2, "0");

  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(value.getMinutes())}`;
}

export function formatBookingDateTime(date: Date | string | null | undefined) {
  if (!date) return "—";

  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(date));
  } catch {
    return "—";
  }
}

export { formatCurrency } from "@/lib/format";

export function formatOptionalNumber(value: number | null | undefined) {
  if (value == null) return "—";
  return String(value);
}
