import "server-only";

import { listClients } from "@/lib/data/clients";
import type { ClientWithStats } from "@/lib/definitions";

import type { GetClientsSchema } from "./validations";

export type ClientTableRow = ClientWithStats;

function compareValues(
  a: string | number | boolean | null | undefined,
  b: string | number | boolean | null | undefined,
) {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === "boolean" && typeof b === "boolean") {
    return Number(a) - Number(b);
  }
  if (typeof a === "number" && typeof b === "number") {
    return a - b;
  }
  return String(a).localeCompare(String(b));
}

function getSortValue(
  row: ClientTableRow,
  id: string,
): string | number | boolean | null | undefined {
  switch (id) {
    case "dogName":
      return row.dogName;
    case "ownerName":
      return row.ownerName;
    case "contactEmail":
      return row.contactEmail;
    case "contactPhone":
      return row.contactPhone;
    case "bookingCount":
      return row.bookingCount;
    case "totalRevenue":
      return row.totalRevenue;
    case "isRepeatClient":
      return row.isRepeatClient;
    default:
      return row.dogName;
  }
}

function sortClients(
  rows: ClientTableRow[],
  sort: GetClientsSchema["sort"],
): ClientTableRow[] {
  if (sort.length === 0) return rows;

  const sorted = [...rows];
  sorted.sort((a, b) => {
    for (const item of sort) {
      const cmp = compareValues(
        getSortValue(a, item.id),
        getSortValue(b, item.id),
      );
      if (cmp !== 0) {
        return item.desc ? -cmp : cmp;
      }
    }
    return 0;
  });
  return sorted;
}

export async function getClients(input: GetClientsSchema) {
  let rows = await listClients();

  if (input.dogName) {
    const query = input.dogName.toLowerCase();
    rows = rows.filter((row) => row.dogName.toLowerCase().includes(query));
  }

  if (input.isRepeatClient.length > 0) {
    const allowed = new Set(
      input.isRepeatClient.map((value) => value === "true"),
    );
    rows = rows.filter((row) => allowed.has(row.isRepeatClient));
  }

  rows = sortClients(rows, input.sort);

  const total = rows.length;
  const pageCount = Math.max(1, Math.ceil(total / input.perPage) || 1);
  const offset = (input.page - 1) * input.perPage;
  const data = rows.slice(offset, offset + input.perPage);

  return { data, pageCount };
}

export async function getRepeatClientCounts(): Promise<
  Record<"true" | "false", number>
> {
  const rows = await listClients();
  const counts = { true: 0, false: 0 };

  for (const row of rows) {
    if (row.isRepeatClient) {
      counts.true += 1;
    } else {
      counts.false += 1;
    }
  }

  return counts;
}
