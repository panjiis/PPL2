"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "@/lib/context/session";
import { useRouter } from "next/navigation";
import { fetchWarehouses } from "@/lib/utils/api";
import { Warehouse } from "@/lib/types/warehouses";
import { CreateWarehouseModal } from "@/components/inventory/create-warehouse-modal";
import { UpdateWarehouseModal } from "@/components/inventory/update-warehouse-modal";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { DataView } from "@/components/ui/data-view";
import { MoreHorizontal, PlusIcon } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown";

export default function WarehousesPage() {
  const { session, isLoading } = useSession();
  const router = useRouter();

  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);

  useEffect(() => {
    if (isLoading || !session) return;
    (async () => {
      try {
        const fetched = await fetchWarehouses(session.token);
        setWarehouses(fetched);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [session, isLoading]);

  const handleWarehouseCreated = (newWarehouse: Warehouse) => {
    setWarehouses((prev) => [...prev, newWarehouse]);
  };

  const handleWarehouseUpdated = (updated: Warehouse) => {
    setWarehouses((prev) =>
      prev.map((w) => (w.id === updated.id ? updated : w))
    );
    setEditingWarehouse(null);
  };

  const warehouseColumns: ColumnDef<Warehouse>[] = [
    {
      accessorKey: "id",
      header: "ID",
      meta: { type: "number" as const },
    },
    {
      accessorKey: "warehouse_code",
      header: "Code",
      meta: { type: "string" as const },
    },
    {
      accessorKey: "warehouse_name",
      header: "Name",
      meta: { type: "string" as const },
    },
    {
      accessorKey: "location",
      header: "Location",
      meta: { type: "string" as const },
    },
    {
      accessorKey: "is_active",
      header: "Active",
      meta: { type: "string" as const },
      cell: ({ row }) => (row.original.is_active ? "Yes" : "No"),
    },
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
            <DropdownMenuItem onClick={() => router.push(`warehouses/${row.original.warehouse_code}`)}>
              View Details
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

      <CreateWarehouseModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={handleWarehouseCreated}
      />

      <UpdateWarehouseModal
        open={updateModalOpen}
        onClose={() => setUpdateModalOpen(false)}
        onUpdated={handleWarehouseUpdated}
        warehouse={editingWarehouse}
      />

      <div className="flex items-center justify-between w-full mt-8 md:mt-16 mb-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Warehouse Management</h1>
          <p className="text-[hsl(var(--muted-foreground))]">Manage your warehouses here.</p>
        </div>
        <Button size="icon" onClick={() => setCreateModalOpen(true)}>
          <PlusIcon />
        </Button>
      </div>

      <DataView<Warehouse, unknown>
        data={warehouses}
        columns={warehouseColumns}
        searchableColumn="warehouse_name"
        itemsPerPage={5}
        initialView="table"
        caption="List of warehouses in system."
        onCreate={() => setCreateModalOpen(true)}
        renderListItem={(warehouse) => (
          <div
            key={warehouse.id}
            className="border border-[hsl(var(--border))] rounded-lg p-4 flex items-center justify-between hover:bg-[hsl(var(--foreground))]/5 cursor-pointer"
            onClick={() => router.push(`/inventory/warehouses/${warehouse.warehouse_code}`)}
          >
            <div className="flex items-center gap-4">
              <span className={`h-2 w-2 rounded-full ${warehouse.is_active ? "bg-green-500" : "bg-red-500"}`} />
              <div className="flex gap-2">
                <p className="font-semibold">{warehouse.warehouse_name}</p>
                <p className="text-xs font-mono bg-[hsl(var(--foreground))]/5 px-2 py-1 rounded w-fit">{warehouse.warehouse_code}</p>
              </div>
            </div>
          </div>
        )}
        renderGridItem={(warehouse) => (
          <div
            key={warehouse.id}
            className="border border-[hsl(var(--border))] rounded-lg p-4 flex flex-col justify-between gap-4 bg-card hover:bg-[hsl(var(--foreground))]/5 cursor-pointer"
            onClick={() => router.push(`/inventory/warehouses/${warehouse.warehouse_code}`)}
          >
            <div>
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full shrink-0 ${warehouse.is_active ? "bg-green-500" : "bg-red-500"}`} />
                <h3 className="font-bold text-lg truncate">{warehouse.warehouse_name}</h3>
                <p className="text-sm font-mono bg-[hsl(var(--foreground))]/5 px-2 py-1 rounded w-fit">{warehouse.warehouse_code}</p>
              </div>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">{warehouse.location}</p>
            </div>
          </div>
        )}
      />
    </div>
  );
}
