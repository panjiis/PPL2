"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "@/lib/context/session";
import { useRouter } from "next/navigation";
import { fetchStockMovements } from "@/lib/utils/api"; // make sure this fetches your new data
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { DataView } from "@/components/ui/data-view";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown";
import { MovementTypeLabels, StockMovement } from "@/lib/types/inventory/stocks";

export default function StockMovementsPage() {
  const { session, isLoading } = useSession();
  const router = useRouter();
  const [movements, setMovements] = useState<StockMovement[]>([]);

  useEffect(() => {
    if (isLoading || !session) return;
    (async () => {
      try {
        const fetched = await fetchStockMovements(session.token);
        setMovements(fetched);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [session, isLoading]);

  const movementColumns: ColumnDef<StockMovement>[] = [
    { accessorKey: "product_code", 
      header: "Product",
      cell: ({ getValue }) => 
        <span className="font-mono">
          {getValue<string>()}
        </span> },
    { accessorKey: "warehouse_id", header: "Warehouse" },
    {
      accessorKey: "movement_type",
      header: "Movement Type",
      cell: ({ getValue }) => {
        const num = getValue<number>();
        return MovementTypeLabels[num] || "UNKNOWN";
      },
    },
    { accessorKey: "quantity", header: "Quantity" },
    { accessorKey: "unit_cost", header: "Unit Cost" },
    { accessorKey: "reference_id", header: "Reference ID" },
    { accessorKey: "notes", header: "Notes" },
    { accessorKey: "created_at", header: "Created At", cell: ({ getValue }) => {
      const date = new Date(getValue<{ seconds: number; nanos: number }>().seconds * 1000);
      return date.toLocaleString();
    }},
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => router.push(`/inventory/stocks/${row.original.product_code}`)}>
              View Product
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  if (isLoading) return <p className="text-center p-10">Loading...</p>;

  return (
    <div>
      <Breadcrumbs />
      <div className="mt-8 md:mt-16 mb-6">
        <h1 className="text-2xl font-bold">Stock Movements</h1>
        <p className="text-muted-foreground">
          Detailed movements of products across warehouses.
        </p>
      </div>

      <DataView<StockMovement, unknown>
        data={movements}
        columns={movementColumns}
        searchableColumn="product_code"
        itemsPerPage={10}
        caption="List of stock movements in the system."
      />
    </div>
  );
}
