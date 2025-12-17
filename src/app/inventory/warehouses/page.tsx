"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "@/lib/context/session";
import { useRouter } from "next/navigation";
import { fetchWarehouses } from "@/lib/utils/api";
import { Warehouse } from "@/lib/types/inventory/warehouses";
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

  const refreshWarehouses = async () => {
      if (!session) return;
      const refreshed = await fetchWarehouses(session.token);
      setWarehouses(refreshed);
    };

  const handleWarehouseCreated = async () => {
    await refreshWarehouses();
  };

  const handleWarehouseUpdated = async () => {
    await refreshWarehouses();
    setEditingWarehouse(null);
  };

  const warehouseColumns: ColumnDef<Warehouse>[] = [
    // DEPRECATED
    // {
    //   accessorKey: "id",
    //   header: "ID",
    //   meta: { type: "number" as const },
    // },
    {
      accessorKey: "warehouse_code",
      header: "Code",
      meta: { type: "string" as const },
      cell: ({ getValue }) => (
        <span className="font-mono">{getValue<string>()}</span>
      ),
    },
    {
      accessorKey: "warehouse_name",
      header: "Warehouse Name",
      meta: { type: "string" as const },
    },
    {
      accessorKey: "manager_name",
      header: "Manager Name",
      meta: { type: "string" as const },
    },
    {
      accessorKey: "location",
      header: "Location",
      meta: { type: "string" as const },
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
            <DropdownMenuItem
              onClick={() => {
                setEditingWarehouse(row.original);
                setUpdateModalOpen(true);
              }}
            >
              Edit Warehouse
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
            key={warehouse.warehouse_code}
            className="border border-[hsl(var(--border))] rounded-lg p-4 flex items-center justify-between hover:bg-[hsl(var(--foreground))]/5 cursor-pointer"
            onClick={() => router.push(`/inventory/warehouses/${warehouse.warehouse_code}`)}
          >
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <p className="font-semibold">{warehouse.warehouse_name}</p>
                <p className="text-xs font-mono bg-[hsl(var(--foreground))]/5 px-2 py-1 rounded w-fit">{warehouse.warehouse_code}</p>
              </div>
            </div>
          </div>
        )}
        renderGridItem={(warehouse) => (
          <div
            key={warehouse.warehouse_code}
            className="border border-[hsl(var(--border))] rounded-lg p-4 flex flex-col justify-between gap-4 bg-card hover:bg-[hsl(var(--foreground))]/5 cursor-pointer"
            onClick={() => router.push(`/inventory/warehouses/${warehouse.warehouse_code}`)}
          >
            <div>
              <div className="flex items-center gap-2">
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
