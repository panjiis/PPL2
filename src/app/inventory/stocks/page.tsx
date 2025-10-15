"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "@/lib/context/session";
import { useRouter } from "next/navigation";
import { fetchProducts } from "@/lib/utils/api";
import { Stock } from "@/lib/types/stocks";
import { Product } from "@/lib/types/products";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { DataView } from "@/components/ui/data-view";
import { MoreHorizontal } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown";

export default function StocksPage() {
  const { session, isLoading } = useSession();
  const router = useRouter();

  const [stocks, setStocks] = useState<Stock[]>([]);

  useEffect(() => {
  if (isLoading || !session) return;
  (async () => {
    try {
      const fetchedProducts = await fetchProducts(session.token);
      console.log("Fetched products:", fetchedProducts);

      const allStocks: Stock[] = fetchedProducts.flatMap((product: Product) =>
        (product.stocks || []).map((s) => ({
          ...s,
          product,
        }))
      );

      console.log("All stocks:", allStocks);

      setStocks(allStocks);
    } catch (err) {
      console.error(err);
    }
  })();
}, [session, isLoading]);

  const stockColumns: ColumnDef<Stock>[] = [
    { accessorKey: "id",
      header: "ID" },
    {
      accessorKey: "product.product_name",
      header: "Product",
      meta: { type: "string" as const },
    },
    {
      accessorKey: "warehouse.warehouse_name",
      header: "Warehouse",
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
      header: "Unit Cost" 
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
            <DropdownMenuItem onClick={() => null }>
              Check Stock
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => null }>
              Release Stock
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => null }>
              Reserve Stock
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => null }>
              Transfer Stock
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => null }>
              Update Stock
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`/inventory/products/${row.original.product_id}`) }>
              View Product
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`/inventory/warehouse/${row.original.warehouse_id}`) }>
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

      <div className="flex items-center justify-between w-full mt-8 md:mt-16 mb-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Stock Management</h1>
          <p className="text-[hsl(var(--muted-foreground))]">Manage your stocks here.</p>
        </div>
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
