"use client";

import type { Table } from "@tanstack/react-table";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportTableToCSV } from "@/lib/export";

import type { ClientTableRow } from "../_lib/queries";
import { CreateClientDialog } from "./create-client-dialog";

interface ClientsTableToolbarActionsProps {
  table: Table<ClientTableRow>;
}

export function ClientsTableToolbarActions({
  table,
}: ClientsTableToolbarActionsProps) {
  const selectedCount = table.getFilteredSelectedRowModel().rows.length;

  return (
    <div className="flex items-center gap-2">
      <CreateClientDialog />
      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          exportTableToCSV(table, {
            filename: "clients",
            excludeColumns: ["select", "actions"],
            onlySelected: selectedCount > 0,
          })
        }
      >
        <Download />
        Export
      </Button>
    </div>
  );
}
