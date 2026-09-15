import type { Metadata } from "next";
import * as React from "react";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { Shell } from "@/components/shell";
import { requireUserId } from "@/lib/auth/require-user-id";
import { listClients } from "@/lib/data/clients";
import type { SearchParams } from "@/types";

import { BookingsTable } from "./_components/bookings-table";
import {
  getBookingServiceTypeCounts,
  getBookingStatusCounts,
  getBookings,
} from "./_lib/queries";
import { searchParamsCache } from "./_lib/validations";

export const metadata: Metadata = {
  title: "Bookings",
};

interface BookingsPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function BookingsPage(props: BookingsPageProps) {
  const searchParams = await props.searchParams;
  const search = searchParamsCache.parse(searchParams);
  const userId = await requireUserId();

  const promises = Promise.all([
    getBookings(userId, search),
    getBookingStatusCounts(userId),
    getBookingServiceTypeCounts(userId),
    listClients(userId),
  ]);

  return (
    <Shell className="gap-2">
      <div className="flex flex-col gap-1 px-1">
        <h1 className="font-semibold text-lg tracking-tight">Bookings</h1>
        <p className="text-muted-foreground text-sm">
          Daycare and overnight stays with revenue tied to each booking.
        </p>
      </div>
      <React.Suspense
        fallback={
          <DataTableSkeleton
            columnCount={10}
            filterCount={3}
            cellWidths={[
              "8rem",
              "6rem",
              "11rem",
              "11rem",
              "4rem",
              "4rem",
              "4rem",
              "5rem",
              "6rem",
              "2.5rem",
            ]}
            shrinkZero
          />
        }
      >
        <BookingsTable promises={promises} />
      </React.Suspense>
    </Shell>
  );
}
