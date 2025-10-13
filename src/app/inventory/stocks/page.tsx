"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "@/lib/context/session";
import { useRouter } from "next/navigation";
import { fetchStocks } from "@/lib/utils/api";
import { Stock } from "@/lib/types/stocks";
import { CreateStockModal } from "@/components/inventory/create-stock-modal";
import { UpdateStockModal } from "@/components/inventory/update-stock-modal";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { DataView } from "@/components/ui/data-view";
import { MoreHorizontal, PlusIcon } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown";

export default function StocksPage() {
  const { session, isLoading } = useSession();
  const router = useRouter();

  const [stocks, setStocks] = useState<Stock[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [editingStock, setEditingStock] = useState<Stock | null>(null);

  useEffect(() => {
    if (isLoading || !session) return;
    (async () => {
      try {
        const fetched = await fetchStocks(session.token, 1, 1);
        setStocks(fetched);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [session, isLoading]);

  const handleStockCreated = (newStock: Stock) => {
    setStocks((prev) => [...prev, newStock]);
  };

  const handleStockUpdated = (updated: Stock) => {
    setStocks((prev) =>
      prev.map((w) => (w.id === updated.id ? updated : w))
    );
    setEditingStock(null);
  };

  const stockColumns: ColumnDef<Stock>[] = [
    {
      accessorKey: "id",
      header: "ID",
      meta: { type: "number" as const },
    },
    {
      accessorKey: "product_id",
      header: "Product ID",
      meta: { type: "string" as const },
    },
    {
      accessorKey: "product",
      header: "Product",
      cell: ({ row }) => row.original.product?.product_name || "—",
      filterFn: (row, _columnId, filterValue) => {
        const name = row.original.product?.product_name?.toLowerCase() ?? "";
        return name.includes(filterValue.toLowerCase());
      },
    },
    {
      accessorKey: "warehouse_id",
      header: "Warehouse ID",
      meta: { type: "string" as const },
    },
    {
      accessorKey: "available_quantity",
      header: "Available Quantity",
      meta: { type: "number" as const },
    },
    {
      accessorKey: "reserved_quantity",
      header: "Reserved Quantity",
      meta: { type: "number" as const },
    },
    {
      accessorKey: "unit_cost",
      header: "Unit Cost",
      meta: { type: "string" as const },
    },
    {
      accessorKey: "last_restock_date",
      header: "Last Restock Date",
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
            <DropdownMenuItem onClick={() => router.push(`products/${row.original.id}`)}>
              Check Stock
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`products/${row.original.id}`)}>
              Release Stock
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`products/${row.original.id}`)}>
              Reserve Stock
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`products/${row.original.id}`)}>
              Transfer Stock
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`products/${row.original.id}`)}>
              Update Stock
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`products/${row.original.product_id}`)}>
              View Product
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`product-types/${row.original.warehouse_id}`)}>
              View Warehouse
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

      <CreateStockModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={handleStockCreated}
      />

      <UpdateStockModal
        open={updateModalOpen}
        onClose={() => setUpdateModalOpen(false)}
        onUpdated={handleStockUpdated}
        stock={editingStock}
      />

      <div className="flex items-center justify-between w-full mt-8 md:mt-16 mb-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Stock Management</h1>
          <p className="text-[hsl(var(--muted-foreground))]">Manage your stocks here.</p>
        </div>
        <Button size="icon" onClick={() => setCreateModalOpen(true)}>
          <PlusIcon />
        </Button>
      </div>

      <DataView<Stock, unknown>
        data={stocks}
        columns={stockColumns}
        searchableColumn="product"
        itemsPerPage={5}
        initialView="table"
        caption="List of stocks in system."
        renderListItem={(stock) => (
          <div
            key={stock.id}
            className="border border-[hsl(var(--border))] rounded-lg p-4 flex items-center justify-between hover:bg-[hsl(var(--foreground))]/5 cursor-pointer"
            onClick={() => router.push(`/inventory/stocks/${stock.id}`)}
          >
            <div className="flex items-center gap-4">
              <div>
                <p className="font-semibold">{stock.product?.product_name}</p>
                <p className="text-sm text-muted-foreground">{stock.warehouse?.warehouse_name} &middot; {stock.available_quantity}</p>
              </div>
            </div>
          </div>
        )}
        renderGridItem={(stock) => (
          <div
            key={stock.id}
            className="border border-[hsl(var(--border))] rounded-lg p-4 flex flex-col justify-between gap-4 bg-card text-card-foreground cursor-pointer"
            onClick={() => router.push(`/inventory/stocks/${stock.id}`)}
          >
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg">{stock.product?.product_name}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{stock.warehouse?.warehouse_name}</p>
              <p className="text-sm font-mono bg-muted px-2 py-1 rounded w-fit mt-2">{stock.available_quantity}</p>
            </div>
          </div>
        )}
      />
    </div>
  );
}
