"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useSession } from "@/lib/context/session";
import { useRouter } from "next/navigation";
import { fetchStocks } from "@/lib/utils/api";
import { AggregatedStock, Stock } from "@/lib/types/inventory/stocks";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { DataView } from "@/components/ui/data-view";
import { ColumnDef } from "@tanstack/react-table";
import { Info, MoreHorizontal } from "lucide-react";
import { StocksWarehouse, StocksAvailable, StocksReserved, ReserveStock, ReleaseStock, TransferStock, UpdateStock } from "@/components/inventory/stock-modals";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown";

export default function StocksPage() {
  const { session, isLoading } = useSession();
  const router = useRouter();
  const [stocks, setStocks] = useState<Stock[]>([]);

  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [selectedAggregatedStock, setSelectedAggregatedStock] = useState<AggregatedStock | null>(null);
  const [modalType, setModalType] = useState<"warehouse" | "available" | "reserved" | "reserveStock" | "releaseStock" | "transferStock" | "updateStock" | null>(null);

  useEffect(() => {
    if (isLoading || !session) return;
    (async () => {
      try {
        const fetched = await fetchStocks(session.token);
        setStocks(fetched);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [session, isLoading]);

  const refreshStocks = async () => {
    if (!session) return;
    const refreshed = await fetchStocks(session.token);
    setStocks(refreshed);
  };

  const handleStockUpdated = async () => {
    await refreshStocks();
  };

  const aggregatedStocks = useMemo<AggregatedStock[]>(() => {
    const grouped: Record<string, AggregatedStock> = {};

    for (const s of stocks) {
      const code = s.product_code;
      if (!grouped[code]) {
        grouped[code] = {
          product_code: code,
          product_name: s.product?.product_name || "Unknown",
          total_available: 0,
          total_reserved: 0,
          last_restock_date: s.last_restock_date,
          warehouses: [],
        };
      }
      grouped[code].total_available += s.available_quantity;
      grouped[code].total_reserved += s.reserved_quantity;
      grouped[code].warehouses.push({
        name: s.warehouse?.warehouse_name || "Unknown Warehouse",
        available: s.available_quantity,
        reserved: s.reserved_quantity,
      });
    }
    return Object.values(grouped);
  }, [stocks]);

  const stockColumns: ColumnDef<AggregatedStock>[] = [
    { 
      accessorKey: "product_code",
      header: "Product Code",
      meta: { type: "string" as const },
      cell: ({ getValue }) => (
        <span className="font-mono">{getValue<string>()}</span>
      ),
    },
    {
      accessorKey: "product_name",
      header: "Product",
    },
    {
      header: "Warehouse",
      cell: ({ row }) => {
        const w = row.original.warehouses;
        const main = w[0];
        const extra = w.length - 1;
        return (
          <Button
            variant="link"
            className="truncate"
            onClick={() => {
              setSelectedAggregatedStock(row.original);
              setModalType("warehouse");
            }}
          >
            {main?.name}
            {extra > 0 ? `... +${extra}` : ""}
          </Button>
        );
      },
    },
    {
      header: "Available",
      cell: ({ row }) => (
        <Button
          variant="link"
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => {
            setSelectedAggregatedStock(row.original);
            setModalType("available");
          }}
        >
          <Info className="w-4 h-4 text-muted-foreground" />
          <span>{row.original.total_available}</span>
        </Button>
      ),
    },
    {
      header: "Reserved",
      cell: ({ row }) => (
        <Button
          variant="link"
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => {
            setSelectedAggregatedStock(row.original);
            setModalType("reserved");
          }}
        >
          <Info className="w-4 h-4 text-muted-foreground" />
          <span>{row.original.total_reserved}</span>
        </Button>
      ),
    },
    {
      accessorKey: "last_restock_date",
      header: "Last Restock",
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
            <DropdownMenuItem onClick={() => router.push(`/inventory/products/${row.original.product_code}`) }>
              View Product
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => null }>
              Check Stock
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setModalType("releaseStock") }>
              Release Stock
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setModalType("reserveStock") }>
              Reserve Stock
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setModalType("transferStock") }>
              Transfer Stock
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setModalType("updateStock") }>
              Update Stock
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const renderListItem = (item: AggregatedStock) => (
    <div
      key={item.product_code}
      className="border border-[hsl(var(--border))] rounded-lg p-4 flex items-center justify-between hover:bg-[hsl(var(--foreground))]/5 cursor-pointer"
      onClick={() => router.push(`/inventory/stocks/${item.product_code}`)}
    >
      <div className="flex items-center gap-4">
        <div>
          <div className="flex gap-2">
                <p className="font-semibold">{item.product_name}</p>
                <p className="text-xs font-mono bg-[hsl(var(--foreground))]/5 px-2 py-1 rounded w-fit">{item.product_code}</p>
              </div>
          <p className="text-sm text-muted-foreground">
            {item.total_available} available · {item.total_reserved} reserved
          </p>
        </div>
      </div>
    </div>
  );

  const renderGridItem = (item: AggregatedStock) => (
    <div
      key={item.product_code}
      className="border border-[hsl(var(--border))] rounded-lg p-4 flex flex-col justify-between gap-4 bg-card text-card-foreground cursor-pointer"
      onClick={() => router.push(`/inventory/stocks/${item.product_code}`)}
    >
      <div>
        <h3 className="font-bold text-lg">{item.product_name}</h3>
        <p className="text-sm text-muted-foreground">
          {item.total_available} available · {item.total_reserved} reserved
        </p>
      </div>
    </div>
  );

  const handleClose = () => {
    setModalType(null);
    setTimeout(() => setSelectedStock(null), 200);
  };

  if (isLoading) return <p className="text-center p-10">Loading...</p>;

  return (
    <div>
      <Breadcrumbs />
      <div className="mt-8 md:mt-16 mb-6">
        <h1 className="text-2xl font-bold">Stock Management</h1>
        <p className="text-muted-foreground">
          Combined product view across all warehouses.
        </p>
      </div>

      <DataView<AggregatedStock, unknown>
        data={aggregatedStocks}
        columns={stockColumns}
        searchableColumn="product_name"
        itemsPerPage={10}
        caption="List of stocks across warehouses in system."
        renderListItem={renderListItem}
        renderGridItem={renderGridItem}
      />

      <StocksWarehouse
        stock={selectedAggregatedStock || aggregatedStocks[0] || ({} as AggregatedStock)}
        open={modalType === "warehouse"}
        onClose={handleClose}
      />
      <StocksAvailable
        stock={selectedAggregatedStock || aggregatedStocks[0] || ({} as AggregatedStock)}
        open={modalType === "available"}
        onClose={handleClose}
      />
      <StocksReserved
        stock={selectedAggregatedStock || aggregatedStocks[0] || ({} as AggregatedStock)}
        open={modalType === "reserved"}
        onClose={handleClose}
      />
      <ReleaseStock
        open={modalType === "releaseStock"}
        onClose={handleClose}
        onReleased={() => {}}
      />
      <ReserveStock
        open={modalType === "reserveStock"}
        onClose={handleClose}
        onReserved={() => {}}
      />
      <TransferStock
        open={modalType === "transferStock"}
        onClose={handleClose}
        onTransferred={() => {}}
      />
      <UpdateStock
        open={modalType === "updateStock"}
        onClose={handleClose}
        onUpdated={() => {handleStockUpdated();}}
      />

    </div>
  );
}
