import type { Metadata } from "next";
import * as React from "react";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { Shell } from "@/components/shell";
import { requireUserId } from "@/lib/auth/require-user-id";
import type { SearchParams } from "@/types";

import { ClientsTable } from "./_components/clients-table";
import { getClients, getRepeatClientCounts } from "./_lib/queries";
import { searchParamsCache } from "./_lib/validations";

export const metadata: Metadata = {
  title: "Clients",
};

interface ClientsPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function ClientsPage(props: ClientsPageProps) {
  const searchParams = await props.searchParams;
  const search = searchParamsCache.parse(searchParams);
  const userId = await requireUserId();

  const promises = Promise.all([
    getClients(userId, search),
    getRepeatClientCounts(userId),
  ]);

  return (
    <Shell className="gap-2">
      <div className="flex flex-col gap-1 px-1">
        <h1 className="font-semibold text-lg tracking-tight">Clients</h1>
        <p className="text-muted-foreground text-sm">
          Dogs and owners. Booking totals and repeat status come from bookings.
        </p>
      </div>
      <React.Suspense
        fallback={
          <DataTableSkeleton
            columnCount={8}
            filterCount={2}
            cellWidths={[
              "7rem",
              "7rem",
              "9rem",
              "7rem",
              "4rem",
              "5rem",
              "5rem",
              "2.5rem",
            ]}
            shrinkZero
          />
        }
      >
        <ClientsTable promises={promises} />
      </React.Suspense>
    </Shell>
  );
}
