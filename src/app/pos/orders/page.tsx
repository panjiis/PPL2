"use client";

import { useEffect, useState } from "react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { DataView } from "@/components/ui/data-view";
import { useSession } from "@/lib/context/session";
import { fetchOrders } from "@/lib/utils/api";
import { MoreHorizontal } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown";
import { useRouter } from "next/navigation";
import { Order } from "@/lib/types/pos/orders";
import { formatCurrency, toDateTimeSeconds } from "@/lib/utils/string";
import { OrderDetailModal } from "@/components/pos/order-modals";

export default function OrderPage() {
  const { session, isLoading } = useSession();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<number | null>(null);
  const [orderDetailModalOpen, setOrderDetailModalOpen] = useState(false);

  useEffect(() => {
    if (isLoading || !session?.token) return;
    fetchOrders(session.token)
      .then(setOrders)
      .catch(console.error);
  }, [session, isLoading]);

  const orderColumns: ColumnDef<Order>[] = [
    // DEPRECATED
    // {
    //   accessorKey: "id",
    //   header: "ID",
    //   meta: { type: "number" as const },
    // },
    { 
      accessorKey: "document_number",
      header: "Order Number",
      meta: { type: "string" as const },
      cell: ({ getValue }) => (
        <span className="font-mono">{getValue<string>()}</span>
      ),
    },
    {
      accessorKey: "orders_date",
      header: "Date",
      meta: { type: "string" as const },
      cell: ({ row }) => {
        const { orders_date } = row.original;

        const orderDate = toDateTimeSeconds(orders_date);

        const order = orderDate;

        return <span>{order}</span>;
      },
    },
    {
      accessorKey: "payment_type",
      header: "Payment",
      meta: { type: "object" as const },
      cell: ({ getValue }) => {
        const payment = getValue<{ id: number; payment_name: string }>();
        return <span>{payment?.payment_name ?? "N/A"}</span>;
      },
    },
    { 
      accessorKey: "subtotal",
      header: "Subtotal",
      meta: { type: "string" as const },
      cell: ({ getValue }) => (
        <span>{formatCurrency(Number(getValue<string>()))}</span>
      ),
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
            <DropdownMenuItem
              onClick={() => {
                setSelectedOrder(row.original.id);
                setOrderDetailModalOpen(true);
              }}
            >
              View Details
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div>
      <Breadcrumbs />

      <div className="flex items-center justify-between w-full mt-8 md:mt-16 mb-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">POS Order Management</h1>
          <p className="text-[hsl(var(--muted-foreground))]">Manage your point of sale orders here.</p>
        </div>
      </div>

      <OrderDetailModal
        open={orderDetailModalOpen}
        onClose={() => {
          setOrderDetailModalOpen(false);
          setSelectedOrder(null);
        }}
        id={selectedOrder!}
      />

      <DataView
        data={orders}
        columns={orderColumns}
        searchableColumn="document_number"
        caption="List of point of sale orders in system."
        renderListItem={(order) => (
          <div
            key={order.id}
            className="border border-[hsl(var(--border))] rounded-lg p-4 flex items-center justify-between hover:bg-[hsl(var(--foreground))]/5 cursor-pointer"
            onClick={() => router.push(`/pos/orders/${order.id}`)}
          >
            <div className="flex items-center gap-4">
              {/* <span className={`h-2 w-2 rounded-full ${order.is_active ? "bg-green-500" : "bg-red-500"}`} /> */}
              <div>
                <div className="flex gap-2">
                  <p className="font-semibold">{order.document_number}</p>
                  <p className="text-xs font-mono bg-[hsl(var(--foreground))]/5 px-2 py-1 rounded w-fit">{order.id}</p>
                </div>
                {/* <p className="text-sm text-[hsl(var(--muted-foreground))] text-wrap wrap-break-word">{order.order_type?.order_type_name} {order.supplier?.supplier_name && ('\u00B7')} {order.supplier?.supplier_name}</p> */}
              </div>
            </div>
          </div>
        )}
        renderGridItem={(order) => (
          <div
            key={order.id}
            className="border border-[hsl(var(--border))] rounded-lg p-4 flex flex-col justify-between gap-4 bg-card hover:bg-[hsl(var(--foreground))]/5 cursor-pointer"
            onClick={() => router.push(`/pos/orders/${order.id}`)}
          >
            <div>
              <div className="flex items-center gap-2">
                {/* <span className={`h-2 w-2 rounded-full shrink-0 ${order.is_active ? "bg-green-500" : "bg-red-500"}`} /> */}
                <h3 className="font-bold text-lg truncate">{order.document_number}</h3>
                <p className="text-sm font-mono bg-[hsl(var(--foreground))]/5 px-2 py-1 rounded w-fit">{order.id}</p>
              </div>
              {/* <p className="text-sm text-[hsl(var(--muted-foreground))]">{order.order_type?.order_type_name} {order.supplier?.supplier_name && ('\u00B7')} {order.supplier?.supplier_name}</p> */}
            </div>
          </div>
        )}
      />
    </div>
  );
}
